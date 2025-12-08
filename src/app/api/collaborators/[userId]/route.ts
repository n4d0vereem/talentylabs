import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, collaborators } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, requireRole } from '@/lib/auth-middleware';

// PATCH - Modifier le statut d'un collaborateur
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const currentUser = await requireAuth(request);
    requireRole(currentUser, ['ADMIN']);
    
    const body = await request.json();
    const { status } = body;
    
    if (!status || !['ACTIVE', 'DISABLED'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Statut invalide' },
        { status: 400 }
      );
    }
    
    // Vérifier que le user appartient à la même agence
    const targetUser = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });
    
    if (!targetUser || targetUser.agencyId !== currentUser.agencyId) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }
    
    // Mettre à jour le statut
    await db.update(users)
      .set({ status, updatedAt: new Date() })
      .where(eq(users.id, userId));
    
    // Mettre à jour aussi dans la table collaborators
    await db.update(collaborators)
      .set({ 
        status: status === 'ACTIVE' ? 'Actif' : 'Inactif',
        updatedAt: new Date() 
      })
      .where(eq(collaborators.email, targetUser.email));
    
    return NextResponse.json({
      success: true,
      message: `Collaborateur ${status === 'ACTIVE' ? 'activé' : 'désactivé'}`
    });
    
  } catch (error: any) {
    console.error('❌ Erreur PATCH /api/collaborators/[userId]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Retirer un collaborateur de l'agence (dissocier, pas supprimer le compte)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const currentUser = await requireAuth(request);
    requireRole(currentUser, ['ADMIN']);
    
    // Vérifier que le user appartient à la même agence
    const targetUser = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });
    
    if (!targetUser || targetUser.agencyId !== currentUser.agencyId) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }
    
    // Empêcher l'admin de se retirer lui-même
    if (targetUser.id === currentUser.id) {
      return NextResponse.json(
        { success: false, error: 'Vous ne pouvez pas vous retirer vous-même' },
        { status: 400 }
      );
    }
    
    // Dissocier l'utilisateur de l'agence (on ne supprime PAS le compte)
    await db.update(users)
      .set({ 
        agencyId: null, // Retirer l'agence
        status: 'ACTIVE', // Garder le compte actif
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    // Supprimer de la table collaborators
    await db.delete(collaborators)
      .where(eq(collaborators.email, targetUser.email));
    
    return NextResponse.json({
      success: true,
      message: 'Collaborateur retiré de l\'agence'
    });
    
  } catch (error: any) {
    console.error('❌ Erreur DELETE /api/collaborators/[userId]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
