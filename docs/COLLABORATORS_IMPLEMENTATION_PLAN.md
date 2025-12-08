# Plan d'Implémentation - Système de Gestion de Collaborateurs

Ce document fournit un plan d'implémentation étape par étape pour mettre en place le système de gestion de collaborateurs.

**Durée estimée :** 3-5 jours de développement

---

## 📋 Vue d'ensemble

Le système comprend :
- ✅ Invitations par email via Resend
- ✅ 3 rôles : ADMIN, TALENT_MANAGER, TALENT
- ✅ Gestion des permissions (RBAC)
- ✅ Statuts : INVITED, ACTIVE, DISABLED
- ✅ Assignation de talents aux collaborateurs
- ✅ Filtrage automatique selon le rôle

---

## 🗂️ Phase 1 : Schéma de Base de Données (1-2h)

### 1.1 Créer les nouvelles migrations

```bash
# Générer une nouvelle migration
npm run db:generate
```

### 1.2 Modifier le schéma Drizzle

**Fichier : `src/db/schema.ts`**

```typescript
// 1. Ajouter les enums
export const userRoles = pgEnum('user_role', ['ADMIN', 'TALENT_MANAGER', 'TALENT']);
export const userStatuses = pgEnum('user_status', ['INVITED', 'ACTIVE', 'DISABLED']);
export const invitationStatuses = pgEnum('invitation_status', ['PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELED']);

// 2. Modifier la table users
export const users = pgTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").default(false),
  name: text("name"),
  image: text("image"),
  
  // Nouveaux champs
  role: userRoles("role").default('TALENT_MANAGER').notNull(),
  status: userStatuses("status").default('INVITED').notNull(),
  agencyId: text("agency_id").references(() => agencies.id, { onDelete: "cascade" }),
  lastLoginAt: timestamp("last_login_at"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// 3. Créer la table invitations
export const invitations = pgTable("invitations", {
  id: text("id").primaryKey(),
  agencyId: text("agency_id").notNull().references(() => agencies.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: userRoles("role").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  status: invitationStatuses("status").default('PENDING').notNull(),
  
  expiresAt: timestamp("expires_at").notNull(),
  invitedBy: text("invited_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  acceptedAt: timestamp("accepted_at"),
  
  metadata: json("metadata").$type<{ talentIds?: string[] }>(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 4. Créer la table talent_assignments
export const talentAssignments = pgTable("talent_assignments", {
  id: text("id").primaryKey(),
  talentId: text("talent_id").notNull().references(() => talents.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  assignedBy: text("assigned_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  roleOnTalent: text("role_on_talent").notNull().default('MANAGER'), // 'MANAGER' | 'VIEWER'
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 5. Ajouter les relations
export const invitationsRelations = relations(invitations, ({ one }) => ({
  agency: one(agencies, {
    fields: [invitations.agencyId],
    references: [agencies.id],
  }),
  inviter: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const talentAssignmentsRelations = relations(talentAssignments, ({ one }) => ({
  talent: one(talents, {
    fields: [talentAssignments.talentId],
    references: [talents.id],
  }),
  user: one(users, {
    fields: [talentAssignments.userId],
    references: [users.id],
  }),
  assigner: one(users, {
    fields: [talentAssignments.assignedBy],
    references: [users.id],
  }),
}));
```

### 1.3 Appliquer les migrations

```bash
# Pousser les changements vers la base de données
npm run db:push

# Vérifier dans Drizzle Studio
npm run db:studio
```

### 1.4 Créer un script de migration des données existantes

**Fichier : `scripts/migrate-existing-users.ts`**

```typescript
import { db } from '../src/db';
import { users, agencies } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function migrateExistingUsers() {
  console.log('Migration des utilisateurs existants...');
  
  // 1. Récupérer toutes les agences
  const allAgencies = await db.select().from(agencies);
  
  // 2. Pour chaque agence, mettre à jour l'owner comme ADMIN
  for (const agency of allAgencies) {
    await db.update(users)
      .set({
        role: 'ADMIN',
        status: 'ACTIVE',
        agencyId: agency.id
      })
      .where(eq(users.id, agency.ownerId));
    
    console.log(`✅ Owner de ${agency.name} migré en ADMIN`);
  }
  
  console.log('Migration terminée !');
}

migrateExistingUsers().catch(console.error);
```

```bash
# Exécuter la migration
npx tsx scripts/migrate-existing-users.ts
```

---

## 🔐 Phase 2 : Configuration Resend (15min)

### 2.1 Installer Resend

```bash
npm install resend
```

### 2.2 Configuration des variables d'environnement

**Fichier : `.env`**

```bash
# Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@votredomaine.com

# App URL
APP_URL=http://localhost:3000
# En production : APP_URL=https://votreapp.com
```

### 2.3 Obtenir une clé API Resend

1. Aller sur https://resend.com
2. Créer un compte ou se connecter
3. Créer une API Key dans le dashboard
4. Vérifier votre domaine d'envoi :
   - **Développement :** Vous pouvez utiliser `onboarding@resend.dev` (limité à 100 emails/jour)
   - **Production :** Ajouter et vérifier votre domaine custom

---

## 🛠️ Phase 3 : Utilitaires Backend (1h)

### 3.1 Créer le service de sécurité

**Fichier : `src/lib/security.ts`**

```typescript
import crypto from 'crypto';

/**
 * Génère un token cryptographiquement sécurisé
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash un token avec SHA-256
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Génère un ID unique
 */
export function generateId(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Génère une date d'expiration
 */
export function generateExpirationDate(days: number = 7): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
```

### 3.2 Créer le service d'email

**Fichier : `src/lib/email-service.ts`**

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendInvitationEmailParams {
  to: string;
  role: 'ADMIN' | 'TALENT_MANAGER' | 'TALENT';
  inviteLink: string;
  agencyName: string;
  invitedByName: string;
}

export async function sendInvitationEmail({
  to,
  role,
  inviteLink,
  agencyName,
  invitedByName
}: SendInvitationEmailParams) {
  const roleLabels = {
    ADMIN: 'Administrateur',
    TALENT_MANAGER: 'Talent Manager',
    TALENT: 'Talent'
  };
  
  const roleLabel = roleLabels[role];
  
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to,
      subject: `Invitation à rejoindre ${agencyName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #000; color: #fff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { padding: 30px 20px; background: #f9f9f9; }
              .button { 
                display: inline-block; 
                padding: 14px 32px; 
                background: #000; 
                color: #fff !important; 
                text-decoration: none; 
                border-radius: 6px;
                font-weight: bold;
                margin: 20px 0;
              }
              .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">${agencyName}</h1>
              </div>
              <div class="content">
                <h2 style="margin-top: 0;">Vous avez été invité !</h2>
                <p>Bonjour,</p>
                <p>
                  <strong>${invitedByName}</strong> vous invite à rejoindre 
                  <strong>${agencyName}</strong> en tant que <strong>${roleLabel}</strong>.
                </p>
                <p>
                  Cliquez sur le bouton ci-dessous pour accepter l'invitation et créer votre compte :
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${inviteLink}" class="button">
                    Accepter l'invitation
                  </a>
                </div>
                <p style="font-size: 14px; color: #666; border-top: 1px solid #ddd; padding-top: 20px;">
                  ⏱️ Ce lien est valide pendant <strong>7 jours</strong>.
                </p>
                <p style="font-size: 12px; color: #999;">
                  Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email.
                </p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} ${agencyName}. Tous droits réservés.</p>
              </div>
            </div>
          </body>
        </html>
      `
    });
    
    if (error) {
      console.error('❌ Erreur Resend:', error);
      throw new Error('Échec d\'envoi de l\'email');
    }
    
    console.log('✅ Email envoyé:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
}
```

### 3.3 Créer les middlewares d'authentification

**Fichier : `src/lib/auth-middleware.ts`**

```typescript
import { auth } from './auth';
import { db } from '../db';
import { users, talentAssignments } from '../db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'TALENT_MANAGER' | 'TALENT';
  status: 'INVITED' | 'ACTIVE' | 'DISABLED';
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
    role: user.role as any,
    status: user.status as any,
    agencyId: user.agencyId
  };
}

/**
 * Vérifie que l'utilisateur a un rôle spécifique
 */
export function requireRole(
  user: AuthenticatedUser,
  allowedRoles: Array<'ADMIN' | 'TALENT_MANAGER' | 'TALENT'>
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
    const { talents } = await import('../db/schema');
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
```

---

## 🌐 Phase 4 : Routes API (3-4h)

### 4.1 POST `/api/collaborators/invite`

**Fichier : `src/app/api/collaborators/invite/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { invitations, users } from '@/db/schema';
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
    const { email, role, talentIds } = body;
    
    if (!email || !role) {
      return NextResponse.json(
        { success: false, error: 'Email et rôle requis' },
        { status: 400 }
      );
    }
    
    if (!['TALENT_MANAGER', 'TALENT'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Rôle invalide' },
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
    
    // 6. Créer l'invitation
    const [invitation] = await db.insert(invitations).values({
      id: generateId(),
      agencyId: currentUser.agencyId,
      email,
      role: role as any,
      tokenHash,
      status: 'PENDING',
      expiresAt: generateExpirationDate(7),
      invitedBy: currentUser.id,
      metadata: talentIds ? { talentIds } : null,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    // 7. Récupérer l'agence
    const { agencies } = await import('@/db/schema');
    const agency = await db.query.agencies.findFirst({
      where: eq(agencies.id, currentUser.agencyId)
    });
    
    // 8. Envoyer l'email
    const inviteLink = `${process.env.APP_URL}/invite/accept?token=${token}`;
    
    await sendInvitationEmail({
      to: email,
      role: role as any,
      inviteLink,
      agencyName: agency?.name || 'Votre agence',
      invitedByName: currentUser.name || 'Un administrateur'
    });
    
    // 9. Retourner la réponse
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
```

### 4.2 GET `/api/invites/[token]/route.ts`

**Fichier : `src/app/api/invites/[token]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { invitations, agencies } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashToken } from '@/lib/security';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
    
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
```

### 4.3 POST `/api/invites/[token]/accept/route.ts`

**Fichier : `src/app/api/invites/[token]/accept/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { invitations, users, accounts, talentAssignments } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashToken, generateId } from '@/lib/security';
import bcrypt from 'bcryptjs'; // Installer : npm install bcryptjs

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
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
    
    // 4. Créer le compte utilisateur
    const userId = generateId();
    const passwordHash = await bcrypt.hash(password, 10);
    
    await db.insert(users).values({
      id: userId,
      email: invitation.email,
      name,
      emailVerified: true,
      role: invitation.role as any,
      status: 'ACTIVE',
      agencyId: invitation.agencyId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await db.insert(accounts).values({
      id: generateId(),
      userId,
      accountId: invitation.email,
      providerId: 'credential',
      password: passwordHash,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // 5. Si des talents étaient pré-assignés, créer les assignations
    if (invitation.metadata && (invitation.metadata as any).talentIds) {
      const talentIds = (invitation.metadata as any).talentIds as string[];
      
      if (talentIds.length > 0) {
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
    
    // 6. Marquer l'invitation comme acceptée
    await db.update(invitations)
      .set({
        status: 'ACCEPTED',
        acceptedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(invitations.id, invitation.id));
    
    // 7. Retourner les infos utilisateur
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
```

**Installation de bcryptjs :**
```bash
npm install bcryptjs @types/bcryptjs
```

### 4.4 Créer les autres routes

Créez les fichiers suivants en suivant les exemples du document d'architecture :

- `src/app/api/collaborators/route.ts` (GET - liste)
- `src/app/api/collaborators/[id]/route.ts` (PATCH - update)
- `src/app/api/collaborators/[id]/resend-invite/route.ts` (POST)
- `src/app/api/collaborators/[userId]/assign-talents/route.ts` (POST)

---

## 💻 Phase 5 : Frontend (3-4h)

### 5.1 Page d'acceptation d'invitation

**Fichier : `src/app/invite/accept/page.tsx`**

Copiez le code fourni dans le document d'architecture (section 5.1).

### 5.2 Page de gestion des collaborateurs

**Fichier : `src/app/(dashboard)/dashboard/collaborators/page.tsx`**

Copiez le code fourni dans le document d'architecture (section 5.2).

### 5.3 Hook de vérification de rôle

**Fichier : `src/hooks/use-require-role.ts`**

```typescript
'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type UserRole = 'ADMIN' | 'TALENT_MANAGER' | 'TALENT';

export function useRequireRole(allowedRoles: UserRole[]) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (isPending) return;
    
    if (!session?.user) {
      router.push('/sign-in');
      return;
    }
    
    const userRole = (session.user as any).role;
    if (!allowedRoles.includes(userRole)) {
      router.push('/dashboard');
    }
  }, [session, isPending, allowedRoles, router]);
  
  return {
    user: session?.user,
    isPending
  };
}
```

### 5.4 Composant RoleGate

**Fichier : `src/components/role-gate.tsx`**

```typescript
'use client';

import { useSession } from '@/lib/auth-client';
import { ReactNode } from 'react';

type UserRole = 'ADMIN' | 'TALENT_MANAGER' | 'TALENT';

interface RoleGateProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGate({ allowedRoles, children, fallback = null }: RoleGateProps) {
  const { data: session } = useSession();
  
  if (!session?.user) {
    return <>{fallback}</>;
  }
  
  const userRole = (session.user as any).role;
  
  if (!allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
```

### 5.5 Mettre à jour la sidebar

**Fichier : `src/components/sidebar.tsx`**

Ajoutez l'import :
```typescript
import { RoleGate } from './role-gate';
```

Modifiez les liens sensibles :
```typescript
{/* Lien Collaborateurs (ADMIN uniquement) */}
<RoleGate allowedRoles={['ADMIN']}>
  <Link href="/dashboard/collaborators">
    <Users className="mr-2 h-4 w-4" />
    Collaborateurs
  </Link>
</RoleGate>

{/* Lien Paramètres (ADMIN uniquement) */}
<RoleGate allowedRoles={['ADMIN']}>
  <Link href="/dashboard/settings">
    <Settings className="mr-2 h-4 w-4" />
    Paramètres
  </Link>
</RoleGate>
```

---

## 🔒 Phase 6 : Filtrage des Talents par Rôle (2h)

### 6.1 Modifier GET `/api/talents`

**Fichier : `src/app/api/talents/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { talents } from '@/db/schema';
import { inArray, eq } from 'drizzle-orm';
import { requireAuth, getAccessibleTalentIds } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request);
    
    // Récupérer les IDs des talents accessibles selon le rôle
    const accessibleTalentIds = await getAccessibleTalentIds(
      currentUser.id,
      currentUser.role,
      currentUser.agencyId
    );
    
    if (accessibleTalentIds.length === 0) {
      return NextResponse.json({ success: true, talents: [] });
    }
    
    // Filtrer les talents
    const allTalents = await db.query.talents.findMany({
      where: inArray(talents.id, accessibleTalentIds),
      orderBy: (talents, { asc }) => [asc(talents.firstName)]
    });
    
    return NextResponse.json({ success: true, talents: allTalents });
    
  } catch (error: any) {
    console.error('❌ Erreur /api/talents:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### 6.2 Modifier GET `/api/talents/[id]`

**Fichier : `src/app/api/talents/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { talents } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, canAccessTalent } from '@/lib/auth-middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireAuth(request);
    const talentId = params.id;
    
    // Vérifier l'accès
    const hasAccess = await canAccessTalent(
      currentUser.id,
      currentUser.role,
      talentId
    );
    
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Accès refusé' },
        { status: 403 }
      );
    }
    
    // Récupérer le talent
    const talent = await db.query.talents.findFirst({
      where: eq(talents.id, talentId),
      with: {
        collaborations: true,
        events: true,
        insights: true
      }
    });
    
    if (!talent) {
      return NextResponse.json(
        { success: false, error: 'Talent introuvable' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, talent });
    
  } catch (error: any) {
    console.error('❌ Erreur /api/talents/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### 6.3 Créer GET `/api/talents/me`

**Fichier : `src/app/api/talents/me/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { talents, talentAssignments } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request);
    
    // Vérifier que c'est un TALENT
    if (currentUser.role !== 'TALENT') {
      return NextResponse.json(
        { success: false, error: 'Endpoint réservé aux talents' },
        { status: 403 }
      );
    }
    
    // Récupérer l'assignation
    const assignment = await db.query.talentAssignments.findFirst({
      where: eq(talentAssignments.userId, currentUser.id)
    });
    
    if (!assignment) {
      return NextResponse.json(
        { success: false, error: 'Aucun profil talent associé' },
        { status: 404 }
      );
    }
    
    // Récupérer le talent
    const talent = await db.query.talents.findFirst({
      where: eq(talents.id, assignment.talentId),
      with: {
        collaborations: true,
        events: true,
        insights: true
      }
    });
    
    return NextResponse.json({ success: true, talent });
    
  } catch (error: any) {
    console.error('❌ Erreur /api/talents/me:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

---

## ✅ Phase 7 : Tests & Validation (2-3h)

### 7.1 Test du flow complet d'invitation

**Checklist :**
- [ ] Un ADMIN peut créer une invitation
- [ ] L'email est bien envoyé (vérifier dans Resend logs)
- [ ] Le lien dans l'email fonctionne
- [ ] La page `/invite/accept` affiche les bonnes infos
- [ ] Le formulaire valide correctement (nom, mot de passe)
- [ ] Le compte est créé avec le bon rôle et statut ACTIVE
- [ ] L'invitation est marquée ACCEPTED
- [ ] L'utilisateur peut se connecter avec ses identifiants

### 7.2 Test des permissions

**Checklist ADMIN :**
- [ ] Voit tous les talents
- [ ] Accède à `/dashboard/collaborators`
- [ ] Accède à `/dashboard/settings`
- [ ] Peut inviter des collaborateurs
- [ ] Peut désactiver/réactiver des collaborateurs

**Checklist TALENT_MANAGER :**
- [ ] Ne voit QUE les talents assignés
- [ ] N'accède PAS à `/dashboard/collaborators` (redirection)
- [ ] N'accède PAS à `/dashboard/settings`
- [ ] Peut voir et éditer les talents assignés
- [ ] Ne peut PAS voir les autres talents

**Checklist TALENT :**
- [ ] Ne voit QUE son propre talent
- [ ] N'accède PAS au dashboard global
- [ ] Peut accéder à `/api/talents/me`
- [ ] Ne peut PAS éditer (lecture seule)

### 7.3 Test d'expiration des tokens

```typescript
// Script de test : scripts/test-expired-token.ts
import { db } from '../src/db';
import { invitations } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function testExpiredToken() {
  // Créer une invitation expirée manuellement
  const testInvitation = await db.insert(invitations).values({
    id: 'test-expired',
    agencyId: 'your-agency-id',
    email: 'test-expired@example.com',
    role: 'TALENT_MANAGER',
    tokenHash: 'test-hash',
    status: 'PENDING',
    expiresAt: new Date('2020-01-01'), // Date passée
    invitedBy: 'your-admin-id',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  console.log('Invitation expirée créée. Testez l\'accès via l\'API.');
}

testExpiredToken();
```

---

## 📊 Phase 8 : Monitoring & Logs (1h)

### 8.1 Ajouter des logs structurés

**Fichier : `src/lib/logger.ts`**

```typescript
export function logInfo(message: string, data?: any) {
  console.log(`ℹ️  [INFO] ${message}`, data || '');
}

export function logError(message: string, error?: any) {
  console.error(`❌ [ERROR] ${message}`, error || '');
}

export function logWarning(message: string, data?: any) {
  console.warn(`⚠️  [WARNING] ${message}`, data || '');
}

export function logSuccess(message: string, data?: any) {
  console.log(`✅ [SUCCESS] ${message}`, data || '');
}
```

### 8.2 Logger les actions critiques

Dans chaque route API, ajoutez des logs :

```typescript
import { logInfo, logError, logSuccess } from '@/lib/logger';

// Exemple dans /api/collaborators/invite
logInfo('Tentative d\'invitation', { email, role, adminId: currentUser.id });

// Après succès
logSuccess('Invitation envoyée', { invitationId: invitation.id, email });

// En cas d'erreur
logError('Échec de l\'invitation', error);
```

---

## 🚀 Phase 9 : Déploiement (1h)

### 9.1 Vérifier les variables d'environnement en production

```bash
# .env.production
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@votredomaine.com
APP_URL=https://votreapp.com
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://votreapp.com
```

### 9.2 Vérifier le domaine Resend

1. Aller sur https://resend.com/domains
2. Ajouter votre domaine (ex: `votredomaine.com`)
3. Ajouter les enregistrements DNS (DKIM, SPF, etc.)
4. Vérifier le domaine
5. Utiliser `noreply@votredomaine.com` comme email d'envoi

### 9.3 Déployer

```bash
# Build
npm run build

# Pousser les migrations
npm run db:push

# Déployer (Vercel, Railway, etc.)
git push
```

---

## 📝 Checklist Finale

### Base de données
- [ ] Tables créées (invitations, talent_assignments)
- [ ] Champs ajoutés à users (role, status, agencyId, lastLoginAt)
- [ ] Migrations appliquées
- [ ] Users existants migrés en ADMIN

### Backend
- [ ] Resend configuré et testé
- [ ] Tous les endpoints créés
- [ ] Middlewares d'authentification fonctionnels
- [ ] Filtrage des talents par rôle actif
- [ ] Logs ajoutés

### Frontend
- [ ] Page `/invite/accept` fonctionnelle
- [ ] Page `/dashboard/collaborators` créée
- [ ] Hook `useRequireRole` créé
- [ ] Composant `RoleGate` créé
- [ ] Sidebar mise à jour avec permissions

### Sécurité
- [ ] Tokens hashés en BDD
- [ ] Expiration des invitations (7 jours)
- [ ] Validation côté backend
- [ ] RBAC actif sur toutes les routes
- [ ] Rate limiting (optionnel)

### Tests
- [ ] Flow d'invitation testé de bout en bout
- [ ] Permissions ADMIN testées
- [ ] Permissions TALENT_MANAGER testées
- [ ] Permissions TALENT testées
- [ ] Tokens expirés testés

---

## 🆘 Dépannage Courant

### Problème : L'email ne part pas

**Solutions :**
1. Vérifier la clé API Resend dans `.env`
2. Vérifier les logs Resend : https://resend.com/logs
3. En dev, utiliser `onboarding@resend.dev`
4. Vérifier que le domaine est vérifié en production

### Problème : "Token invalide"

**Solutions :**
1. Vérifier que le token est bien hashé avec SHA-256
2. Vérifier que le token n'a pas expiré
3. Vérifier que l'invitation n'est pas déjà ACCEPTED

### Problème : "Accès refusé"

**Solutions :**
1. Vérifier que l'utilisateur a le bon rôle dans la BDD
2. Vérifier que le statut est ACTIVE
3. Vérifier que les talent_assignments existent
4. Vérifier les logs du middleware `requireAuth`

### Problème : Les talents ne s'affichent pas

**Solutions :**
1. Vérifier que l'utilisateur a des assignations dans `talent_assignments`
2. Vérifier que les talents appartiennent à la bonne agence
3. Tester avec un compte ADMIN pour voir tous les talents

---

## 📞 Support

Si vous rencontrez des problèmes durant l'implémentation :
1. Consultez le document d'architecture complet (`COLLABORATORS_SYSTEM_ARCHITECTURE.md`)
2. Vérifiez les logs côté serveur
3. Testez avec Postman/Insomnia les endpoints API
4. Utilisez Drizzle Studio pour inspecter la BDD : `npm run db:studio`

---

**Bonne implémentation ! 🎉**
