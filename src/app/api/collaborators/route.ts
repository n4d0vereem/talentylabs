import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, invitations, collaborators } from '@/db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { requireAuth, requireRole } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request);
    requireRole(currentUser, ['ADMIN']);
    
    // 1. Récupérer tous les collaborateurs de l'agence
    const allCollaborators = await db.query.collaborators.findMany({
      where: eq(collaborators.agencyId, currentUser.agencyId)
    });
    
    // 2. Pour chaque collaborateur, récupérer les infos du user associé (s'il existe)
    const collaboratorsWithUserInfo = await Promise.all(
      allCollaborators.map(async (collab) => {
        const user = await db.query.users.findFirst({
          where: eq(users.email, collab.email)
        });
        
        return {
          id: collab.id,
          name: `${collab.firstName} ${collab.lastName}`,
          email: collab.email,
          phone: collab.phone,
          role: user?.role || 'TALENT_MANAGER',
          type: collab.type,
          status: user?.status || 'INVITED',
          lastLoginAt: user?.lastLoginAt?.toISOString() || null,
          createdAt: collab.createdAt.toISOString(),
          userId: user?.id || null // ID du user pour les assignations
        };
      })
    );
    
    // 2. Récupérer les invitations en attente
    const pendingInvitations = await db.query.invitations.findMany({
      where: and(
        eq(invitations.agencyId, currentUser.agencyId),
        eq(invitations.status, 'PENDING')
      )
    });
    
    const invitationsWithInviter = await Promise.all(
      pendingInvitations.map(async (inv) => {
        const inviter = await db.query.users.findFirst({
          where: eq(users.id, inv.invitedBy)
        });
        
        return {
          id: inv.id,
          email: inv.email,
          role: inv.role,
          status: inv.status,
          expiresAt: inv.expiresAt.toISOString(),
          invitedBy: {
            name: inviter?.name || 'Inconnu',
            email: inviter?.email || ''
          }
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      collaborators: collaboratorsWithUserInfo,
      invitations: invitationsWithInviter
    });
    
  } catch (error: any) {
    console.error('❌ Erreur /api/collaborators:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
