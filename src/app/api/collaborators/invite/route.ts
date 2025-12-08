import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { invitations, users, agencies, collaborators } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth, requireRole } from '@/lib/auth-middleware';
import { generateSecureToken, hashToken, generateId, generateExpirationDate } from '@/lib/security';
import { sendInvitationEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    // 1. Authentification + vérification ADMIN
    const currentUser = await requireAuth(request);
    requireRole(currentUser, ['ADMIN']);
    
    // 2. Validation des données
    const body = await request.json();
    const { email, role, talentIds, talentId, firstName, lastName, phone, type } = body;
    
    if (!email || !role) {
      return NextResponse.json(
        { success: false, error: 'Email et rôle requis' },
        { status: 400 }
      );
    }
    
    if (!firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'Nom et prénom requis' },
        { status: 400 }
      );
    }
    
    if (!['TALENT_MANAGER', 'TALENT'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Rôle invalide. Utilisez TALENT_MANAGER ou TALENT' },
        { status: 400 }
      );
    }
    
    // Si le rôle est TALENT, un talentId doit être fourni
    if (role === 'TALENT' && !talentId) {
      return NextResponse.json(
        { success: false, error: 'Un talent doit être assigné pour le rôle TALENT' },
        { status: 400 }
      );
    }
    
    // 3. Vérifier que l'email n'est pas déjà utilisé
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email)
    });
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Un utilisateur existe déjà avec cet email' },
        { status: 400 }
      );
    }
    
    // 4. Vérifier qu'il n'y a pas d'invitation pending
    const existingInvite = await db.query.invitations.findFirst({
      where: and(
        eq(invitations.email, email),
        eq(invitations.status, 'PENDING')
      )
    });
    
    if (existingInvite) {
      return NextResponse.json(
        { success: false, error: 'Une invitation est déjà en attente pour cet email' },
        { status: 400 }
      );
    }
    
    // 5. Générer un token sécurisé
    const token = generateSecureToken();
    const tokenHash = hashToken(token);
    
    // 6. Créer une entrée dans collaborators pour stocker les infos détaillées
    const collaboratorId = generateId();
    await db.insert(collaborators).values({
      id: collaboratorId,
      firstName,
      lastName,
      email,
      phone: phone || '',
      role: role === 'TALENT_MANAGER' ? 'Talent Manager' : role === 'TALENT' ? 'Talent' : 'Autre',
      type: type || 'Interne',
      status: 'En attente',
      permissions: {
        canViewAllTalents: false,
        canEditTalents: role === 'TALENT_MANAGER',
        canViewFinance: false,
        canManageCampaigns: role === 'TALENT_MANAGER'
      },
      agencyId: currentUser.agencyId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // 7. Créer l'invitation
    // Pour TALENT: stocker le talentId unique
    // Pour TALENT_MANAGER: stocker les talentIds (array) si fourni
    let metadata: any = { collaboratorId };
    if (role === 'TALENT' && talentId) {
      metadata.talentId = talentId;
      metadata.talentIds = [talentId]; // Pour compatibilité
    } else if (talentIds && Array.isArray(talentIds)) {
      metadata.talentIds = talentIds;
    }
    
    const [invitation] = await db.insert(invitations).values({
      id: generateId(),
      agencyId: currentUser.agencyId,
      email,
      role: role as any,
      tokenHash,
      status: 'PENDING',
      expiresAt: generateExpirationDate(7),
      invitedBy: currentUser.id,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    // 8. Récupérer l'agence
    const agency = await db.query.agencies.findFirst({
      where: eq(agencies.id, currentUser.agencyId)
    });
    
    // 9. Envoyer l'email
    const inviteLink = `${process.env.APP_URL}/invite/accept?token=${token}`;
    
    await sendInvitationEmail({
      to: email,
      role: role as any,
      inviteLink,
      agencyName: agency?.name || 'Votre agence',
      invitedByName: currentUser.name || 'Un administrateur'
    });
    
    // 10. Retourner la réponse
    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt.toISOString()
      }
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('❌ Erreur /api/collaborators/invite:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
