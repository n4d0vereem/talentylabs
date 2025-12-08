import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { invitations, users, talentAssignments, collaborators } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashToken } from '@/lib/security';
import { auth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { name, password } = body;
    
    // 1. Validation des données
    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Nom requis (min 2 caractères)' },
        { status: 400 }
      );
    }
    
    if (!password || password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Mot de passe requis (min 8 caractères)' },
        { status: 400 }
      );
    }
    
    // 2. Vérifier l'invitation
    const tokenHash = hashToken(token);
    const invitation = await db.query.invitations.findFirst({
      where: eq(invitations.tokenHash, tokenHash)
    });
    
    if (!invitation || invitation.status !== 'PENDING' || new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { success: false, error: 'Invitation invalide ou expirée' },
        { status: 400 }
      );
    }
    
    // 3. Vérifier que l'email n'est pas déjà pris
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, invitation.email)
    });
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Un compte existe déjà avec cet email' },
        { status: 400 }
      );
    }
    
    // 4. Créer le compte utilisateur via Better Auth
    const signUpResult = await auth.api.signUpEmail({
      body: {
        email: invitation.email,
        password: password,
        name: name
      }
    });
    
    if (!signUpResult || !signUpResult.user) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création du compte' },
        { status: 500 }
      );
    }
    
    const userId = signUpResult.user.id;
    
    // 5. Mettre à jour le user avec le rôle, statut et agencyId
    await db.update(users)
      .set({
        role: invitation.role as any,
        status: 'ACTIVE',
        agencyId: invitation.agencyId,
        emailVerified: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    // 6. Si des talents étaient pré-assignés, créer les assignations
    if (invitation.metadata && (invitation.metadata as any).talentIds) {
      const talentIds = (invitation.metadata as any).talentIds as string[];
      
      if (talentIds.length > 0) {
        const { generateId } = await import('@/lib/security');
        await db.insert(talentAssignments).values(
          talentIds.map(talentId => ({
            id: generateId(),
            talentId,
            userId,
            assignedBy: invitation.invitedBy,
            roleOnTalent: 'MANAGER',
            createdAt: new Date(),
            updatedAt: new Date()
          }))
        );
      }
    }
    
    // 7. Mettre à jour le statut du collaborateur
    const collaboratorId = (invitation.metadata as any)?.collaboratorId;
    if (collaboratorId) {
      await db.update(collaborators)
        .set({ 
          status: 'Actif',
          updatedAt: new Date()
        })
        .where(eq(collaborators.id, collaboratorId));
    }
    
    // 8. Marquer l'invitation comme acceptée
    await db.update(invitations)
      .set({
        status: 'ACCEPTED',
        acceptedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(invitations.id, invitation.id));
    
    // 9. Retourner les infos utilisateur
    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: invitation.email,
        name,
        role: invitation.role
      }
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('❌ Erreur /api/invites/[token]/accept:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
