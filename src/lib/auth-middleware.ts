import { auth } from './auth';
import { db } from '../db';
import { users, talentAssignments, talents } from '../db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export type UserRole = 'ADMIN' | 'TALENT_MANAGER' | 'TALENT';
export type UserStatus = 'INVITED' | 'ACTIVE' | 'DISABLED';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  status: UserStatus;
  agencyId: string;
}

/**
 * Vérifie que l'utilisateur est authentifié et ACTIVE
 */
export async function requireAuth(request: Request): Promise<AuthenticatedUser> {
  const session = await auth.api.getSession({ headers: request.headers });
  
  if (!session || !session.user) {
    throw new Error('Non authentifié');
  }
  
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id)
  });
  
  if (!user) {
    throw new Error('Utilisateur introuvable');
  }
  
  if (user.status !== 'ACTIVE') {
    throw new Error('Compte désactivé ou non activé');
  }
  
  if (!user.agencyId) {
    throw new Error('Aucune agence associée');
  }
  
  // Mettre à jour lastLoginAt
  await db.update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, user.id));
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    status: user.status as UserStatus,
    agencyId: user.agencyId
  };
}

/**
 * Vérifie que l'utilisateur a un rôle spécifique
 */
export function requireRole(
  user: AuthenticatedUser,
  allowedRoles: UserRole[]
) {
  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Accès refusé. Rôle requis : ${allowedRoles.join(', ')}`);
  }
}

/**
 * Vérifie qu'un utilisateur peut accéder à un talent
 */
export async function canAccessTalent(
  userId: string,
  userRole: string,
  talentId: string
): Promise<boolean> {
  // Les ADMIN ont accès à tout
  if (userRole === 'ADMIN') {
    return true;
  }
  
  // Les autres doivent être assignés
  const assignment = await db.query.talentAssignments.findFirst({
    where: and(
      eq(talentAssignments.userId, userId),
      eq(talentAssignments.talentId, talentId)
    )
  });
  
  return !!assignment;
}

/**
 * Récupère les IDs des talents accessibles par un utilisateur
 */
export async function getAccessibleTalentIds(
  userId: string,
  userRole: string,
  agencyId: string
): Promise<string[]> {
  // ADMIN : tous les talents de l'agence
  if (userRole === 'ADMIN') {
    const allTalents = await db.select({ id: talents.id })
      .from(talents)
      .where(eq(talents.agencyId, agencyId));
    return allTalents.map(t => t.id);
  }
  
  // Autres : seulement les talents assignés
  const assignments = await db.select({ talentId: talentAssignments.talentId })
    .from(talentAssignments)
    .where(eq(talentAssignments.userId, userId));
  
  return assignments.map(a => a.talentId);
}
