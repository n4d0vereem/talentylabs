import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { invitations, agencies } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashToken } from '@/lib/security';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    // 1. Hasher le token reçu
    const tokenHash = hashToken(token);
    
    // 2. Chercher l'invitation
    const invitation = await db.query.invitations.findFirst({
      where: eq(invitations.tokenHash, tokenHash)
    });
    
    if (!invitation) {
      return NextResponse.json(
        { success: false, error: 'Token invalide' },
        { status: 404 }
      );
    }
    
    // 3. Vérifier le statut
    if (invitation.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'Invitation déjà utilisée' },
        { status: 400 }
      );
    }
    
    // 4. Vérifier l'expiration
    if (new Date() > invitation.expiresAt) {
      await db.update(invitations)
        .set({ status: 'EXPIRED' })
        .where(eq(invitations.id, invitation.id));
      
      return NextResponse.json(
        { success: false, error: 'Invitation expirée' },
        { status: 400 }
      );
    }
    
    // 5. Récupérer l'agence
    const agency = await db.query.agencies.findFirst({
      where: eq(agencies.id, invitation.agencyId)
    });
    
    // 6. Retourner les infos
    return NextResponse.json({
      success: true,
      invitation: {
        email: invitation.email,
        role: invitation.role,
        agencyName: agency?.name || 'Agence'
      }
    });
    
  } catch (error: any) {
    console.error('❌ Erreur /api/invites/[token]:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
