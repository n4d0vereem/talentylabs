import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { talentAssignments, talents } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { requireAuth, requireRole } from '@/lib/auth-middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const currentUser = await requireAuth(request);
    requireRole(currentUser, ['ADMIN']);
    
    // Récupérer les talents assignés à cet utilisateur
    const assignments = await db.query.talentAssignments.findMany({
      where: eq(talentAssignments.userId, userId)
    });
    
    const talentIds = assignments.map(a => a.talentId);
    
    // Récupérer les détails des talents
    let talentsDetails: Array<{
      id: string;
      firstName: string | null;
      lastName: string | null;
      image: string | null;
    }> = [];
    if (talentIds.length > 0) {
      talentsDetails = await db.query.talents.findMany({
        where: inArray(talents.id, talentIds),
        columns: {
          id: true,
          firstName: true,
          lastName: true,
          image: true
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      talentIds,
      talents: talentsDetails
    });
    
  } catch (error: any) {
    console.error('❌ Erreur /api/collaborators/[userId]/talents:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
