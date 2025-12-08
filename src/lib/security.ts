import crypto from 'crypto';

/**
 * Génère un token cryptographiquement sécurisé
 * @returns Token de 64 caractères hexadécimaux
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash un token avec SHA-256
 * @param token Token en clair
 * @returns Hash du token
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Génère un ID unique
 * @returns ID unique
 */
export function generateId(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Génère une date d'expiration
 * @param days Nombre de jours de validité
 * @returns Date d'expiration
 */
export function generateExpirationDate(days: number = 7): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
