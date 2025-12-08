import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { talentAssignments, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, requireRole } from '@/lib/auth-middleware';
import { generateId } from '@/lib/security';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const currentUser = await requireAuth(request);
    requireRole(currentUser, ['ADMIN']);
    
    const body = await request.json();
    const { talentIds } = body;
    
    if (!Array.isArray(talentIds)) {
      return NextResponse.json(
        { success: false, error: 'talentIds doit être un tableau' },
        { status: 400 }
      );
    }
    
    // Vérifier que le user existe et appartient à la même agence
    const targetUser = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });
    
    if (!targetUser || targetUser.agencyId !== currentUser.agencyId) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }
    
    // Supprimer les anciennes assignations
    await db.delete(talentAssignments)
      .where(eq(talentAssignments.userId, userId));
    
    // Créer les nouvelles assignations
    if (talentIds.length > 0) {
      await db.insert(talentAssignments).values(
        talentIds.map(talentId => ({
          id: generateId(),
          talentId,
          userId,
          assignedBy: currentUser.id,
          roleOnTalent: 'MANAGER',
          createdAt: new Date(),
          updatedAt: new Date()
        }))
      );
    }
    
    return NextResponse.json({
      success: true,
      assignedCount: talentIds.length
    });
    
  } catch (error: any) {
    console.error('❌ Erreur /api/collaborators/[userId]/assign-talents:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
