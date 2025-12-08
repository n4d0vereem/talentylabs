# Architecture Complète du Système de Gestion de Collaborateurs

Ce document détaille l'architecture complète du système de gestion de collaborateurs avec invitations, rôles et permissions.

---

## 1. MODÈLE CONCEPTUEL

### 1.1 Entités Principales

#### **User** (Extension de la table existante)
```typescript
interface User {
  id: string;                    // UUID
  email: string;                 // Unique
  emailVerified: boolean;
  name: string | null;
  image: string | null;
  
  // Nouveaux champs à ajouter
  role: UserRole;                // ADMIN | TALENT_MANAGER | TALENT
  status: UserStatus;            // INVITED | ACTIVE | DISABLED
  agencyId: string;              // Référence à agencies.id
  lastLoginAt: Date | null;
  
  createdAt: Date;
  updatedAt: Date;
}

enum UserRole {
  ADMIN = 'ADMIN',
  TALENT_MANAGER = 'TALENT_MANAGER',
  TALENT = 'TALENT'
}

enum UserStatus {
  INVITED = 'INVITED',          // Invitation envoyée, en attente
  ACTIVE = 'ACTIVE',            // Actif, peut se connecter
  DISABLED = 'DISABLED'         // Désactivé, ne peut plus se connecter
}
```

**Remarques importantes :**
- Le champ `agencyId` relie chaque user à une agence
- Le statut `INVITED` indique qu'une invitation a été envoyée mais pas encore acceptée
- Le statut `DISABLED` permet de désactiver un compte sans le supprimer (soft delete)
- `lastLoginAt` permet de suivre l'activité des collaborateurs

---

#### **Invitation**
```typescript
interface Invitation {
  id: string;                    // UUID
  agencyId: string;              // Référence à agencies.id
  email: string;                 // Email de l'invité
  role: UserRole;                // Rôle assigné (TALENT_MANAGER ou TALENT)
  tokenHash: string;             // Hash du token (sécurité)
  status: InvitationStatus;      // PENDING | ACCEPTED | EXPIRED | CANCELED
  
  expiresAt: Date;               // Date d'expiration (ex: 7 jours)
  invitedBy: string;             // Référence à users.id (admin qui a invité)
  acceptedAt: Date | null;       // Date d'acceptation
  
  createdAt: Date;
  updatedAt: Date;
}

enum InvitationStatus {
  PENDING = 'PENDING',           // En attente d'acceptation
  ACCEPTED = 'ACCEPTED',         // Acceptée et compte créé
  EXPIRED = 'EXPIRED',           // Expirée (>7 jours)
  CANCELED = 'CANCELED'          // Annulée par l'admin
}
```

**Remarques importantes :**
- On stocke le **hash** du token, pas le token en clair (sécurité)
- Le token réel sera généré avec `crypto.randomBytes(32).toString('hex')` et envoyé par email
- `expiresAt` est calculé lors de la création : `new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)`
- `invitedBy` permet de tracer qui a invité qui

---

#### **TalentAssignment** (Nouvelle table de liaison)
```typescript
interface TalentAssignment {
  id: string;                    // UUID
  talentId: string;              // Référence à talents.id
  userId: string;                // Référence à users.id
  assignedBy: string;            // Référence à users.id (admin qui a assigné)
  roleOnTalent: TalentRole;      // MANAGER | VIEWER
  
  createdAt: Date;
  updatedAt: Date;
}

enum TalentRole {
  MANAGER = 'MANAGER',           // Peut éditer le talent
  VIEWER = 'VIEWER'              // Peut seulement voir le talent
}
```

**Remarques importantes :**
- Cette table lie les **talents** aux **users** (talent managers et talents)
- Un ADMIN n'a pas besoin d'assignations : il voit tout
- Un TALENT_MANAGER ne voit que les talents auxquels il est assigné
- Un TALENT ne voit que son propre talent (1 seule assignation normalement)
- `roleOnTalent` permet de définir si un talent manager peut éditer ou seulement voir

---

### 1.2 Relations Entre Entités

```
┌─────────────┐
│   Agency    │
└─────┬───────┘
      │ 1
      │
      │ N
┌─────┴───────────┐
│      User       │◄────────┐
│  (role, status) │         │
└────┬────────────┘         │
     │                      │
     │ N                    │ 1
     │                      │
┌────┴──────────────┐  ┌───┴─────────┐
│ TalentAssignment  │  │ Invitation  │
└────┬──────────────┘  │ (invitedBy) │
     │                 └─────────────┘
     │ N
     │
     │ 1
┌────┴───────┐
│   Talent   │
└────────────┘
```

**Flux logique :**
1. Un ADMIN crée une **Invitation** pour un email + rôle
2. Le système envoie un email avec un token unique
3. L'invité accepte → un **User** est créé avec `status = ACTIVE`
4. L'ADMIN assigne des talents au nouveau user via **TalentAssignment**
5. Le user ne voit que les talents assignés selon son rôle

---

### 1.3 Différence avec la table `collaborators` existante

La table `collaborators` actuelle semble être pour des **collaborateurs externes** (Freelance, Prestataires) et non pour des **users de l'application**.

**Recommandation :** 
- **Garder** `collaborators` pour les infos externes (contacts, prestataires)
- **Utiliser** `users` + `invitations` + `talent_assignments` pour les collaborateurs qui se connectent à l'app

Ou bien :
- **Fusionner** les deux concepts en transformant `collaborators` en table de profils liée aux users
- Créer une relation `user.collaboratorProfileId → collaborators.id` (optionnel)

Pour cette architecture, je propose de **séparer clairement** :
- `users` = comptes qui se connectent
- `collaborators` = infos complémentaires sur les collaborateurs (peut rester tel quel)

---

## 2. MATRICE DE PERMISSIONS PAR RÔLE

### 2.1 Vue d'ensemble

| Fonctionnalité | ADMIN | TALENT_MANAGER | TALENT |
|----------------|-------|----------------|--------|
| **Dashboard global** | ✅ Tous talents | ✅ Talents assignés seulement | ❌ |
| **Voir tous les talents** | ✅ | ❌ (uniquement assignés) | ❌ |
| **Voir son propre talent** | ✅ | ✅ | ✅ (si assigné) |
| **Créer/éditer talent** | ✅ | ✅ (si assigné avec MANAGER) | ❌ |
| **Supprimer talent** | ✅ | ❌ | ❌ |
| **Voir collaborations** | ✅ Toutes | ✅ Des talents assignés | ✅ De son talent |
| **Créer/éditer collaborations** | ✅ | ✅ (talents assignés) | ❌ |
| **Voir calendrier** | ✅ Tous événements | ✅ Événements talents assignés | ✅ Ses événements |
| **Créer/éditer événements** | ✅ | ✅ (talents assignés) | ❌ |
| **Paramètres agence** | ✅ | ❌ | ❌ |
| **Inviter collaborateurs** | ✅ | ❌ | ❌ |
| **Voir liste collaborateurs** | ✅ | ❌ | ❌ |
| **Assigner talents aux users** | ✅ | ❌ | ❌ |
| **Désactiver/réactiver users** | ✅ | ❌ | ❌ |

---

### 2.2 Permissions Détaillées par Rôle

#### **ADMIN**
```typescript
const ADMIN_PERMISSIONS = {
  // Talents
  talents: {
    viewAll: true,
    create: true,
    edit: true,
    delete: true,
    assignToUsers: true
  },
  
  // Collaborations
  collaborations: {
    viewAll: true,
    create: true,
    edit: true,
    delete: true
  },
  
  // Calendar
  calendar: {
    viewAll: true,
    create: true,
    edit: true,
    delete: true
  },
  
  // Agency
  agency: {
    viewSettings: true,
    editSettings: true,
    viewBilling: true
  },
  
  // Users/Collaborators
  users: {
    invite: true,
    viewAll: true,
    edit: true,
    disable: true,
    delete: true,
    manageAssignments: true
  }
};
```

#### **TALENT_MANAGER**
```typescript
const TALENT_MANAGER_PERMISSIONS = {
  // Talents
  talents: {
    viewAll: false,              // ❌ Ne voit QUE les talents assignés
    viewAssigned: true,          // ✅
    create: false,               // ❌ Seul l'admin crée
    edit: true,                  // ✅ Si assigné avec roleOnTalent = MANAGER
    delete: false,               // ❌
    assignToUsers: false         // ❌
  },
  
  // Collaborations
  collaborations: {
    viewAll: false,              // ❌ Filtrées par talents assignés
    viewAssigned: true,          // ✅
    create: true,                // ✅ Pour talents assignés
    edit: true,                  // ✅ Pour talents assignés
    delete: false                // ❌
  },
  
  // Calendar
  calendar: {
    viewAll: false,              // ❌ Filtrés par talents assignés
    viewAssigned: true,          // ✅
    create: true,                // ✅ Pour talents assignés
    edit: true,                  // ✅ Pour talents assignés
    delete: false                // ❌
  },
  
  // Agency
  agency: {
    viewSettings: false,
    editSettings: false,
    viewBilling: false
  },
  
  // Users/Collaborators
  users: {
    invite: false,
    viewAll: false,
    edit: false,
    disable: false,
    delete: false,
    manageAssignments: false
  }
};
```

#### **TALENT**
```typescript
const TALENT_PERMISSIONS = {
  // Talents
  talents: {
    viewAll: false,              // ❌
    viewOwn: true,               // ✅ Uniquement son propre profil
    create: false,
    edit: false,                 // ❌ Lecture seule
    delete: false,
    assignToUsers: false
  },
  
  // Collaborations
  collaborations: {
    viewAll: false,
    viewOwn: true,               // ✅ Ses propres collaborations
    create: false,
    edit: false,
    delete: false
  },
  
  // Calendar
  calendar: {
    viewAll: false,
    viewOwn: true,               // ✅ Ses propres événements
    create: false,
    edit: false,
    delete: false
  },
  
  // Agency
  agency: {
    viewSettings: false,
    editSettings: false,
    viewBilling: false
  },
  
  // Users/Collaborators
  users: {
    invite: false,
    viewAll: false,
    edit: false,
    disable: false,
    delete: false,
    manageAssignments: false
  }
};
```

---

### 2.3 Logique d'Autorisation Backend

#### **Middleware d'authentification**
```typescript
// middleware/auth.ts

interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  agencyId: string;
}

/**
 * Vérifie que l'utilisateur est authentifié et ACTIVE
 */
async function requireAuth(request: Request): Promise<AuthenticatedUser> {
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
  
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    agencyId: user.agencyId
  };
}

/**
 * Vérifie que l'utilisateur a un rôle spécifique
 */
function requireRole(user: AuthenticatedUser, allowedRoles: UserRole[]) {
  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Accès refusé. Rôle requis : ${allowedRoles.join(', ')}`);
  }
}

/**
 * Vérifie qu'un utilisateur peut accéder à un talent
 */
async function canAccessTalent(
  userId: string,
  userRole: UserRole,
  talentId: string
): Promise<boolean> {
  // Les ADMIN ont accès à tout
  if (userRole === 'ADMIN') {
    return true;
  }
  
  // Les TALENT_MANAGER et TALENT doivent être assignés
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
async function getAccessibleTalentIds(
  userId: string,
  userRole: UserRole,
  agencyId: string
): Promise<string[]> {
  // ADMIN : tous les talents de l'agence
  if (userRole === 'ADMIN') {
    const allTalents = await db.query.talents.findMany({
      where: eq(talents.agencyId, agencyId),
      columns: { id: true }
    });
    return allTalents.map(t => t.id);
  }
  
  // TALENT_MANAGER et TALENT : seulement les talents assignés
  const assignments = await db.query.talentAssignments.findMany({
    where: eq(talentAssignments.userId, userId),
    columns: { talentId: true }
  });
  
  return assignments.map(a => a.talentId);
}

export { requireAuth, requireRole, canAccessTalent, getAccessibleTalentIds };
```

---

### 2.4 Protection des Routes Frontend

#### **Hook de vérification de rôle**
```typescript
// hooks/use-role-check.ts

import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useRequireRole(allowedRoles: UserRole[]) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (isPending) return;
    
    if (!session?.user) {
      router.push('/sign-in');
      return;
    }
    
    const userRole = session.user.role;
    if (!allowedRoles.includes(userRole)) {
      router.push('/dashboard');
    }
  }, [session, isPending, allowedRoles, router]);
  
  return { user: session?.user, isPending };
}

// Exemple d'utilisation
function CollaboratorsPage() {
  const { user, isPending } = useRequireRole(['ADMIN']);
  
  if (isPending) {
    return <div>Chargement...</div>;
  }
  
  return <div>Page collaborateurs (admin only)</div>;
}
```

#### **Composant de protection**
```typescript
// components/role-gate.tsx

interface RoleGateProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGate({ allowedRoles, children, fallback = null }: RoleGateProps) {
  const { data: session } = useSession();
  
  if (!session?.user) {
    return fallback;
  }
  
  if (!allowedRoles.includes(session.user.role)) {
    return fallback;
  }
  
  return <>{children}</>;
}

// Exemple d'utilisation dans la sidebar
<RoleGate allowedRoles={['ADMIN']}>
  <SidebarItem href="/dashboard/settings" icon={Settings}>
    Paramètres
  </SidebarItem>
</RoleGate>

<RoleGate allowedRoles={['ADMIN', 'TALENT_MANAGER']}>
  <SidebarItem href="/dashboard/creators" icon={Users}>
    Talents
  </SidebarItem>
</RoleGate>
```

---

## 3. SYSTÈME D'INVITATION PAR EMAIL (RESEND)

### 3.1 Configuration Resend

```bash
# Installation
npm install resend

# .env
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@votredomaine.com
APP_URL=https://votreapp.com
```

---

### 3.2 Service d'Envoi d'Email

```typescript
// lib/email-service.ts

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendInvitationEmailParams {
  to: string;
  role: UserRole;
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
              .header { background: #000; color: #fff; padding: 20px; text-align: center; }
              .content { padding: 30px 20px; background: #f9f9f9; }
              .button { 
                display: inline-block; 
                padding: 12px 30px; 
                background: #000; 
                color: #fff !important; 
                text-decoration: none; 
                border-radius: 5px;
                margin: 20px 0;
              }
              .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${agencyName}</h1>
              </div>
              <div class="content">
                <h2>Vous avez été invité !</h2>
                <p>Bonjour,</p>
                <p>
                  <strong>${invitedByName}</strong> vous invite à rejoindre 
                  <strong>${agencyName}</strong> en tant que <strong>${roleLabel}</strong>.
                </p>
                <p>
                  Cliquez sur le bouton ci-dessous pour accepter l'invitation et créer votre compte :
                </p>
                <p style="text-align: center;">
                  <a href="${inviteLink}" class="button">
                    Accepter l'invitation
                  </a>
                </p>
                <p style="font-size: 14px; color: #666;">
                  Ce lien est valide pendant 7 jours. Si vous n'avez pas demandé cette invitation, 
                  vous pouvez ignorer cet email.
                </p>
                <p style="font-size: 12px; color: #999; margin-top: 20px;">
                  Ou copiez ce lien dans votre navigateur :<br/>
                  <span style="word-break: break-all;">${inviteLink}</span>
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
      console.error('Erreur Resend:', error);
      throw new Error('Échec d\'envoi de l\'email');
    }
    
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
}
```

---

## 4. ENDPOINTS API BACKEND

### 4.1 POST `/api/collaborators/invite`

**Description :** Crée une invitation et envoie l'email.

**Authentification :** Requise (ADMIN uniquement)

**Request Body :**
```typescript
{
  email: string;                  // Email de l'invité
  role: 'TALENT_MANAGER' | 'TALENT';
  talentIds?: string[];          // Optionnel : talents à assigner dès l'invitation
}
```

**Response Success (201) :**
```typescript
{
  success: true;
  invitation: {
    id: string;
    email: string;
    role: string;
    status: 'PENDING';
    expiresAt: string;           // ISO date
  };
}
```

**Response Error (400) :**
```typescript
{
  success: false;
  error: string;                 // "Email déjà invité" | "Utilisateur existe déjà" | etc.
}
```

**Logique Backend (pseudo-code) :**
```typescript
async function handleInvite(request: Request) {
  // 1. Authentification + vérification ADMIN
  const currentUser = await requireAuth(request);
  requireRole(currentUser, ['ADMIN']);
  
  // 2. Validation des données
  const { email, role, talentIds } = await request.json();
  
  if (!email || !role) {
    return Response.json({ success: false, error: 'Champs requis manquants' }, { status: 400 });
  }
  
  // 3. Vérifier que l'email n'est pas déjà utilisé
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email)
  });
  
  if (existingUser) {
    return Response.json({ success: false, error: 'Un utilisateur existe déjà avec cet email' }, { status: 400 });
  }
  
  // 4. Vérifier qu'il n'y a pas d'invitation pending
  const existingInvite = await db.query.invitations.findFirst({
    where: and(
      eq(invitations.email, email),
      eq(invitations.status, 'PENDING')
    )
  });
  
  if (existingInvite) {
    return Response.json({ success: false, error: 'Une invitation est déjà en attente pour cet email' }, { status: 400 });
  }
  
  // 5. Générer un token sécurisé
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = await hashToken(token); // bcrypt ou crypto.createHash('sha256')
  
  // 6. Créer l'invitation
  const invitation = await db.insert(invitations).values({
    id: generateId(),
    agencyId: currentUser.agencyId,
    email,
    role,
    tokenHash,
    status: 'PENDING',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
    invitedBy: currentUser.id,
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning();
  
  // 7. Optionnel : pré-créer les assignations de talents (à valider à l'acceptation)
  if (talentIds && talentIds.length > 0) {
    // Stocker dans une table temporaire ou dans l'invitation (JSON)
    await db.update(invitations)
      .set({ metadata: JSON.stringify({ talentIds }) })
      .where(eq(invitations.id, invitation.id));
  }
  
  // 8. Envoyer l'email
  const inviteLink = `${process.env.APP_URL}/invite/accept?token=${token}`;
  const agency = await db.query.agencies.findFirst({ where: eq(agencies.id, currentUser.agencyId) });
  
  await sendInvitationEmail({
    to: email,
    role,
    inviteLink,
    agencyName: agency.name,
    invitedByName: currentUser.name || 'Un administrateur'
  });
  
  // 9. Retourner la réponse
  return Response.json({
    success: true,
    invitation: {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt.toISOString()
    }
  }, { status: 201 });
}
```

---

### 4.2 GET `/api/invites/[token]`

**Description :** Vérifie la validité d'une invitation.

**Authentification :** Non requise

**URL Params :**
- `token` : Token d'invitation (string, 64 caractères hex)

**Response Success (200) :**
```typescript
{
  success: true;
  invitation: {
    email: string;
    role: string;
    agencyName: string;
  };
}
```

**Response Error (400/404) :**
```typescript
{
  success: false;
  error: 'Token invalide' | 'Invitation expirée' | 'Invitation déjà utilisée';
}
```

**Logique Backend (pseudo-code) :**
```typescript
async function handleVerifyInvite(token: string) {
  // 1. Hasher le token reçu
  const tokenHash = await hashToken(token);
  
  // 2. Chercher l'invitation
  const invitation = await db.query.invitations.findFirst({
    where: eq(invitations.tokenHash, tokenHash)
  });
  
  if (!invitation) {
    return Response.json({ success: false, error: 'Token invalide' }, { status: 404 });
  }
  
  // 3. Vérifier le statut
  if (invitation.status !== 'PENDING') {
    return Response.json({ success: false, error: 'Invitation déjà utilisée' }, { status: 400 });
  }
  
  // 4. Vérifier l'expiration
  if (new Date() > invitation.expiresAt) {
    await db.update(invitations)
      .set({ status: 'EXPIRED' })
      .where(eq(invitations.id, invitation.id));
    
    return Response.json({ success: false, error: 'Invitation expirée' }, { status: 400 });
  }
  
  // 5. Récupérer l'agence
  const agency = await db.query.agencies.findFirst({
    where: eq(agencies.id, invitation.agencyId)
  });
  
  // 6. Retourner les infos
  return Response.json({
    success: true,
    invitation: {
      email: invitation.email,
      role: invitation.role,
      agencyName: agency?.name || 'Agence'
    }
  });
}
```

---

### 4.3 POST `/api/invites/[token]/accept`

**Description :** Accepte l'invitation et crée le compte utilisateur.

**Authentification :** Non requise

**URL Params :**
- `token` : Token d'invitation

**Request Body :**
```typescript
{
  name: string;                  // Nom complet
  password: string;              // Mot de passe (min 8 caractères)
}
```

**Response Success (201) :**
```typescript
{
  success: true;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}
```

**Response Error (400/404) :**
```typescript
{
  success: false;
  error: string;
}
```

**Logique Backend (pseudo-code) :**
```typescript
async function handleAcceptInvite(token: string, body: { name: string; password: string }) {
  // 1. Vérifier l'invitation (même logique que GET)
  const tokenHash = await hashToken(token);
  const invitation = await db.query.invitations.findFirst({
    where: eq(invitations.tokenHash, tokenHash)
  });
  
  if (!invitation || invitation.status !== 'PENDING' || new Date() > invitation.expiresAt) {
    return Response.json({ success: false, error: 'Invitation invalide ou expirée' }, { status: 400 });
  }
  
  // 2. Validation des données
  const { name, password } = body;
  
  if (!name || name.length < 2) {
    return Response.json({ success: false, error: 'Nom requis (min 2 caractères)' }, { status: 400 });
  }
  
  if (!password || password.length < 8) {
    return Response.json({ success: false, error: 'Mot de passe requis (min 8 caractères)' }, { status: 400 });
  }
  
  // 3. Vérifier que l'email n'est pas déjà pris
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, invitation.email)
  });
  
  if (existingUser) {
    return Response.json({ success: false, error: 'Un compte existe déjà avec cet email' }, { status: 400 });
  }
  
  // 4. Créer le compte utilisateur via Better Auth
  const userId = generateId();
  const passwordHash = await hashPassword(password);
  
  await db.insert(users).values({
    id: userId,
    email: invitation.email,
    name,
    emailVerified: true,        // Déjà vérifié via invitation
    role: invitation.role,
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
  if (invitation.metadata) {
    const { talentIds } = JSON.parse(invitation.metadata);
    if (talentIds && talentIds.length > 0) {
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
  return Response.json({
    success: true,
    user: {
      id: userId,
      email: invitation.email,
      name,
      role: invitation.role
    }
  }, { status: 201 });
}
```

---

### 4.4 GET `/api/collaborators`

**Description :** Liste tous les collaborateurs de l'agence.

**Authentification :** Requise (ADMIN uniquement)

**Query Params (optionnels) :**
- `status` : Filtrer par statut (INVITED | ACTIVE | DISABLED)
- `role` : Filtrer par rôle

**Response Success (200) :**
```typescript
{
  success: true;
  collaborators: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    lastLoginAt: string | null;
    createdAt: string;
    talentCount: number;        // Nombre de talents assignés
  }>;
  invitations: Array<{         // Invitations en attente
    id: string;
    email: string;
    role: string;
    status: 'PENDING';
    expiresAt: string;
    invitedBy: { name: string; email: string; };
  }>;
}
```

**Logique Backend (pseudo-code) :**
```typescript
async function handleListCollaborators(request: Request) {
  const currentUser = await requireAuth(request);
  requireRole(currentUser, ['ADMIN']);
  
  // 1. Récupérer tous les users de l'agence (sauf l'admin courant)
  const allUsers = await db.query.users.findMany({
    where: and(
      eq(users.agencyId, currentUser.agencyId),
      ne(users.id, currentUser.id)
    ),
    orderBy: [desc(users.createdAt)]
  });
  
  // 2. Pour chaque user, compter les talents assignés
  const collaborators = await Promise.all(
    allUsers.map(async (user) => {
      const assignments = await db.query.talentAssignments.findMany({
        where: eq(talentAssignments.userId, user.id)
      });
      
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLoginAt: user.lastLoginAt?.toISOString() || null,
        createdAt: user.createdAt.toISOString(),
        talentCount: assignments.length
      };
    })
  );
  
  // 3. Récupérer les invitations en attente
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
  
  return Response.json({
    success: true,
    collaborators,
    invitations: invitationsWithInviter
  });
}
```

---

### 4.5 PATCH `/api/collaborators/[id]`

**Description :** Modifie un collaborateur (statut, rôle, etc.)

**Authentification :** Requise (ADMIN uniquement)

**URL Params :**
- `id` : ID de l'utilisateur

**Request Body :**
```typescript
{
  status?: 'ACTIVE' | 'DISABLED';
  role?: 'TALENT_MANAGER' | 'TALENT';
}
```

**Response Success (200) :**
```typescript
{
  success: true;
  user: {
    id: string;
    status: string;
    role: string;
  };
}
```

**Logique Backend (pseudo-code) :**
```typescript
async function handleUpdateCollaborator(userId: string, body: { status?: string; role?: string }) {
  const currentUser = await requireAuth(request);
  requireRole(currentUser, ['ADMIN']);
  
  // 1. Vérifier que le user existe et appartient à la même agence
  const targetUser = await db.query.users.findFirst({
    where: eq(users.id, userId)
  });
  
  if (!targetUser || targetUser.agencyId !== currentUser.agencyId) {
    return Response.json({ success: false, error: 'Utilisateur introuvable' }, { status: 404 });
  }
  
  // 2. Empêcher de se désactiver soi-même
  if (userId === currentUser.id) {
    return Response.json({ success: false, error: 'Vous ne pouvez pas vous désactiver vous-même' }, { status: 400 });
  }
  
  // 3. Mettre à jour
  const updates: Partial<User> = {};
  if (body.status) updates.status = body.status;
  if (body.role) updates.role = body.role;
  updates.updatedAt = new Date();
  
  await db.update(users)
    .set(updates)
    .where(eq(users.id, userId));
  
  return Response.json({
    success: true,
    user: {
      id: userId,
      status: updates.status || targetUser.status,
      role: updates.role || targetUser.role
    }
  });
}
```

---

### 4.6 POST `/api/collaborators/[id]/resend-invite`

**Description :** Renvoie une invitation (si status = INVITED).

**Authentification :** Requise (ADMIN uniquement)

**URL Params :**
- `id` : ID de l'invitation

**Response Success (200) :**
```typescript
{
  success: true;
  message: 'Invitation renvoyée';
}
```

**Logique Backend (pseudo-code) :**
```typescript
async function handleResendInvite(invitationId: string) {
  const currentUser = await requireAuth(request);
  requireRole(currentUser, ['ADMIN']);
  
  // 1. Récupérer l'invitation
  const invitation = await db.query.invitations.findFirst({
    where: eq(invitations.id, invitationId)
  });
  
  if (!invitation || invitation.agencyId !== currentUser.agencyId) {
    return Response.json({ success: false, error: 'Invitation introuvable' }, { status: 404 });
  }
  
  if (invitation.status !== 'PENDING' && invitation.status !== 'EXPIRED') {
    return Response.json({ success: false, error: 'Impossible de renvoyer cette invitation' }, { status: 400 });
  }
  
  // 2. Générer un nouveau token
  const newToken = crypto.randomBytes(32).toString('hex');
  const newTokenHash = await hashToken(newToken);
  
  // 3. Mettre à jour l'invitation
  await db.update(invitations)
    .set({
      tokenHash: newTokenHash,
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    })
    .where(eq(invitations.id, invitationId));
  
  // 4. Renvoyer l'email
  const inviteLink = `${process.env.APP_URL}/invite/accept?token=${newToken}`;
  const agency = await db.query.agencies.findFirst({ where: eq(agencies.id, invitation.agencyId) });
  
  await sendInvitationEmail({
    to: invitation.email,
    role: invitation.role,
    inviteLink,
    agencyName: agency.name,
    invitedByName: currentUser.name || 'Un administrateur'
  });
  
  return Response.json({ success: true, message: 'Invitation renvoyée' });
}
```

---

### 4.7 Restriction d'accès aux talents selon le rôle

#### **GET `/api/talents`**

**Logique de filtrage selon le rôle :**
```typescript
async function handleGetTalents(request: Request) {
  const currentUser = await requireAuth(request);
  
  // 1. Récupérer les IDs des talents accessibles
  const accessibleTalentIds = await getAccessibleTalentIds(
    currentUser.id,
    currentUser.role,
    currentUser.agencyId
  );
  
  // 2. Filtrer les talents
  const talents = await db.query.talents.findMany({
    where: inArray(talents.id, accessibleTalentIds),
    orderBy: [asc(talents.firstName)]
  });
  
  return Response.json({ success: true, talents });
}
```

#### **GET `/api/talents/[id]`**

**Logique de vérification d'accès :**
```typescript
async function handleGetTalent(talentId: string) {
  const currentUser = await requireAuth(request);
  
  // 1. Vérifier l'accès
  const hasAccess = await canAccessTalent(
    currentUser.id,
    currentUser.role,
    talentId
  );
  
  if (!hasAccess) {
    return Response.json({ success: false, error: 'Accès refusé' }, { status: 403 });
  }
  
  // 2. Récupérer le talent
  const talent = await db.query.talents.findFirst({
    where: eq(talents.id, talentId),
    with: {
      collaborations: true,
      events: true,
      insights: true
    }
  });
  
  return Response.json({ success: true, talent });
}
```

#### **GET `/api/talents/me`** (pour les TALENT)

**Logique spécifique au rôle TALENT :**
```typescript
async function handleGetMyTalent(request: Request) {
  const currentUser = await requireAuth(request);
  
  // 1. Vérifier que c'est un TALENT
  if (currentUser.role !== 'TALENT') {
    return Response.json({ success: false, error: 'Endpoint réservé aux talents' }, { status: 403 });
  }
  
  // 2. Récupérer l'assignation
  const assignment = await db.query.talentAssignments.findFirst({
    where: eq(talentAssignments.userId, currentUser.id)
  });
  
  if (!assignment) {
    return Response.json({ success: false, error: 'Aucun profil talent associé' }, { status: 404 });
  }
  
  // 3. Récupérer le talent
  const talent = await db.query.talents.findFirst({
    where: eq(talents.id, assignment.talentId),
    with: {
      collaborations: true,
      events: true,
      insights: true
    }
  });
  
  return Response.json({ success: true, talent });
}
```

---

### 4.8 POST `/api/collaborators/[userId]/assign-talents`

**Description :** Assigne des talents à un collaborateur.

**Authentification :** Requise (ADMIN uniquement)

**URL Params :**
- `userId` : ID de l'utilisateur

**Request Body :**
```typescript
{
  talentIds: string[];           // Liste des IDs de talents à assigner
  roleOnTalent: 'MANAGER' | 'VIEWER';
}
```

**Response Success (200) :**
```typescript
{
  success: true;
  assignedCount: number;
}
```

**Logique Backend (pseudo-code) :**
```typescript
async function handleAssignTalents(userId: string, body: { talentIds: string[]; roleOnTalent: string }) {
  const currentUser = await requireAuth(request);
  requireRole(currentUser, ['ADMIN']);
  
  // 1. Vérifier que le user existe
  const targetUser = await db.query.users.findFirst({
    where: eq(users.id, userId)
  });
  
  if (!targetUser || targetUser.agencyId !== currentUser.agencyId) {
    return Response.json({ success: false, error: 'Utilisateur introuvable' }, { status: 404 });
  }
  
  // 2. Supprimer les anciennes assignations
  await db.delete(talentAssignments)
    .where(eq(talentAssignments.userId, userId));
  
  // 3. Créer les nouvelles assignations
  if (body.talentIds.length > 0) {
    await db.insert(talentAssignments).values(
      body.talentIds.map(talentId => ({
        id: generateId(),
        talentId,
        userId,
        assignedBy: currentUser.id,
        roleOnTalent: body.roleOnTalent,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );
  }
  
  return Response.json({
    success: true,
    assignedCount: body.talentIds.length
  });
}
```

---

## 5. FLOW D'ACCEPTATION D'INVITATION (FRONTEND)

### 5.1 Page `/invite/accept?token=xxx`

```typescript
// app/invite/accept/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InvitationInfo {
  email: string;
  role: string;
  agencyName: string;
}

export default function AcceptInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [submitting, setSubmitting] = useState(false);
  
  // 1. Vérifier le token au chargement
  useEffect(() => {
    if (!token) {
      setError('Token d\'invitation manquant');
      setLoading(false);
      return;
    }
    
    verifyToken();
  }, [token]);
  
  async function verifyToken() {
    try {
      const res = await fetch(`/api/invites/${token}`);
      const data = await res.json();
      
      if (!data.success) {
        setError(data.error);
        return;
      }
      
      setInvitation(data.invitation);
    } catch (err) {
      setError('Erreur lors de la vérification de l\'invitation');
    } finally {
      setLoading(false);
    }
  }
  
  // 2. Gérer la soumission du formulaire
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validation
    if (!formData.name || formData.name.length < 2) {
      setError('Nom requis (min 2 caractères)');
      return;
    }
    
    if (!formData.password || formData.password.length < 8) {
      setError('Mot de passe requis (min 8 caractères)');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    setError(null);
    setSubmitting(true);
    
    try {
      const res = await fetch(`/api/invites/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          password: formData.password
        })
      });
      
      const data = await res.json();
      
      if (!data.success) {
        setError(data.error);
        return;
      }
      
      // Succès ! Rediriger vers la page de connexion
      router.push('/sign-in?invited=true');
    } catch (err) {
      setError('Erreur lors de la création du compte');
    } finally {
      setSubmitting(false);
    }
  }
  
  // 3. États d'affichage
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4" />
          <p>Vérification de l'invitation...</p>
        </div>
      </div>
    );
  }
  
  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-2">
            Invitation invalide
          </h1>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/sign-in')}>
            Retour à la connexion
          </Button>
        </div>
      </div>
    );
  }
  
  // 4. Formulaire d'acceptation
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2">
            Accepter l'invitation
          </h1>
          <p className="text-gray-600 mb-6">
            Vous avez été invité à rejoindre <strong>{invitation?.agencyName}</strong> en tant que{' '}
            <strong>{invitation?.role === 'TALENT_MANAGER' ? 'Talent Manager' : 'Talent'}</strong>.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email (lecture seule) */}
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={invitation?.email || ''}
                disabled
                className="bg-gray-100"
              />
            </div>
            
            {/* Nom */}
            <div>
              <Label htmlFor="name">Nom complet *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Jean Dupont"
                required
              />
            </div>
            
            {/* Mot de passe */}
            <div>
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min 8 caractères"
                required
              />
            </div>
            
            {/* Confirmation mot de passe */}
            <div>
              <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Retapez votre mot de passe"
                required
              />
            </div>
            
            {/* Erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3 text-red-600 text-sm">
                {error}
              </div>
            )}
            
            {/* Bouton de soumission */}
            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? 'Création du compte...' : 'Créer mon compte'}
            </Button>
          </form>
          
          <p className="text-xs text-gray-500 text-center mt-4">
            En créant votre compte, vous acceptez les conditions d'utilisation.
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

### 5.2 Page `/dashboard/collaborators` (ADMIN)

```typescript
// app/(dashboard)/dashboard/collaborators/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Mail, XCircle, CheckCircle, Ban, RefreshCw } from 'lucide-react';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
  talentCount: number;
}

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  invitedBy: { name: string; email: string };
}

export default function CollaboratorsPage() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'TALENT_MANAGER'
  });
  
  // 1. Charger les données
  useEffect(() => {
    loadCollaborators();
  }, []);
  
  async function loadCollaborators() {
    try {
      const res = await fetch('/api/collaborators');
      const data = await res.json();
      
      if (data.success) {
        setCollaborators(data.collaborators);
        setInvitations(data.invitations);
      }
    } catch (err) {
      console.error('Erreur chargement collaborateurs:', err);
    } finally {
      setLoading(false);
    }
  }
  
  // 2. Inviter un collaborateur
  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/collaborators/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm)
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert('Invitation envoyée !');
        setInviteDialogOpen(false);
        setInviteForm({ email: '', role: 'TALENT_MANAGER' });
        loadCollaborators();
      } else {
        alert(`Erreur : ${data.error}`);
      }
    } catch (err) {
      alert('Erreur lors de l\'envoi de l\'invitation');
    }
  }
  
  // 3. Désactiver un collaborateur
  async function handleDisable(userId: string) {
    if (!confirm('Désactiver ce collaborateur ?')) return;
    
    try {
      const res = await fetch(`/api/collaborators/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DISABLED' })
      });
      
      const data = await res.json();
      
      if (data.success) {
        loadCollaborators();
      } else {
        alert(`Erreur : ${data.error}`);
      }
    } catch (err) {
      alert('Erreur lors de la désactivation');
    }
  }
  
  // 4. Réactiver un collaborateur
  async function handleActivate(userId: string) {
    try {
      const res = await fetch(`/api/collaborators/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVE' })
      });
      
      const data = await res.json();
      
      if (data.success) {
        loadCollaborators();
      }
    } catch (err) {
      alert('Erreur lors de la réactivation');
    }
  }
  
  // 5. Renvoyer une invitation
  async function handleResendInvite(invitationId: string) {
    try {
      const res = await fetch(`/api/collaborators/${invitationId}/resend-invite`, {
        method: 'POST'
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert('Invitation renvoyée !');
        loadCollaborators();
      }
    } catch (err) {
      alert('Erreur lors du renvoi');
    }
  }
  
  if (loading) {
    return <div>Chargement...</div>;
  }
  
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Collaborateurs</h1>
          <p className="text-gray-600">Gérez les accès à votre agence</p>
        </div>
        
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Inviter un collaborateur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Inviter un collaborateur</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Rôle</Label>
                <select
                  id="role"
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="TALENT_MANAGER">Talent Manager</option>
                  <option value="TALENT">Talent</option>
                </select>
              </div>
              <Button type="submit" className="w-full">
                Envoyer l'invitation
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Invitations en attente */}
      {invitations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Invitations en attente</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg divide-y">
            {invitations.map((inv) => (
              <div key={inv.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium">{inv.email}</p>
                    <p className="text-sm text-gray-600">
                      {inv.role === 'TALENT_MANAGER' ? 'Talent Manager' : 'Talent'} • 
                      Expire le {new Date(inv.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleResendInvite(inv.id)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Renvoyer
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Liste des collaborateurs */}
      <div className="bg-white rounded-lg border">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="text-left p-4">Nom</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Rôle</th>
              <th className="text-left p-4">Statut</th>
              <th className="text-left p-4">Talents assignés</th>
              <th className="text-left p-4">Dernière connexion</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {collaborators.map((collab) => (
              <tr key={collab.id}>
                <td className="p-4 font-medium">{collab.name}</td>
                <td className="p-4 text-gray-600">{collab.email}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {collab.role === 'TALENT_MANAGER' ? 'Talent Manager' : 'Talent'}
                  </span>
                </td>
                <td className="p-4">
                  {collab.status === 'ACTIVE' ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Actif
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-600">
                      <Ban className="h-4 w-4" />
                      Désactivé
                    </span>
                  )}
                </td>
                <td className="p-4">{collab.talentCount} talent(s)</td>
                <td className="p-4 text-gray-600">
                  {collab.lastLoginAt
                    ? new Date(collab.lastLoginAt).toLocaleDateString()
                    : 'Jamais'}
                </td>
                <td className="p-4 text-right">
                  {collab.status === 'ACTIVE' ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDisable(collab.id)}
                    >
                      Désactiver
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleActivate(collab.id)}
                    >
                      Réactiver
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## 6. SÉCURITÉ ET BONNES PRATIQUES

### 6.1 Génération de Tokens Sécurisés

```typescript
// lib/security.ts

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
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}

/**
 * Génère une date d'expiration
 * @param days Nombre de jours de validité
 * @returns Date d'expiration
 */
export function generateExpirationDate(days: number = 7): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
```

**Pourquoi hasher les tokens ?**
- Si la base de données est compromise, les tokens en clair permettraient de se connecter
- En hashant les tokens, seul le porteur du token (via l'email) peut l'utiliser
- Même principe que les mots de passe : jamais stocker en clair

---

### 6.2 Validation des Invitations

**Checklist de sécurité lors de l'acceptation :**

```typescript
async function validateInvitation(token: string) {
  // 1. Vérifier que le token existe (après hash)
  const tokenHash = hashToken(token);
  const invitation = await db.query.invitations.findFirst({
    where: eq(invitations.tokenHash, tokenHash)
  });
  
  if (!invitation) {
    throw new Error('Token invalide');
  }
  
  // 2. Vérifier que l'invitation n'a pas déjà été utilisée
  if (invitation.status !== 'PENDING') {
    throw new Error('Invitation déjà utilisée');
  }
  
  // 3. Vérifier que l'invitation n'est pas expirée
  if (new Date() > invitation.expiresAt) {
    // Marquer comme expirée en BDD
    await db.update(invitations)
      .set({ status: 'EXPIRED' })
      .where(eq(invitations.id, invitation.id));
    
    throw new Error('Invitation expirée');
  }
  
  // 4. Vérifier que l'email n'est pas déjà utilisé
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, invitation.email)
  });
  
  if (existingUser) {
    throw new Error('Un compte existe déjà avec cet email');
  }
  
  return invitation;
}
```

---

### 6.3 Protection RBAC (Role-Based Access Control)

**Middleware global pour les routes API :**

```typescript
// middleware.ts (Next.js)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Routes protégées admin
  const adminRoutes = [
    '/api/collaborators',
    '/api/settings',
    '/dashboard/settings',
    '/dashboard/collaborators'
  ];
  
  // Vérifier si la route nécessite des permissions
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }
    
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id)
    });
    
    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Compte inactif' },
        { status: 403 }
      );
    }
    
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès refusé - Admin uniquement' },
        { status: 403 }
      );
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*']
};
```

---

### 6.4 Prévention des Abus

**Rate limiting sur les invitations :**

```typescript
// Limiter le nombre d'invitations par admin
const MAX_INVITES_PER_HOUR = 10;

async function checkInviteRateLimit(adminId: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const recentInvites = await db.query.invitations.findMany({
    where: and(
      eq(invitations.invitedBy, adminId),
      gt(invitations.createdAt, oneHourAgo)
    )
  });
  
  return recentInvites.length < MAX_INVITES_PER_HOUR;
}

// Utilisation
if (!await checkInviteRateLimit(currentUser.id)) {
  return Response.json(
    { success: false, error: 'Trop d\'invitations envoyées. Réessayez dans 1 heure.' },
    { status: 429 }
  );
}
```

---

### 6.5 Audit Trail (Traçabilité)

**Logger les actions critiques :**

```typescript
// Table audit_logs (optionnel mais recommandé)
interface AuditLog {
  id: string;
  userId: string;
  action: string;              // 'INVITE_SENT' | 'USER_DISABLED' | 'TALENT_ASSIGNED' | etc.
  targetId: string | null;     // ID de la ressource concernée
  metadata: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

async function logAction(
  userId: string,
  action: string,
  targetId: string | null,
  metadata: Record<string, any>,
  request: Request
) {
  await db.insert(auditLogs).values({
    id: generateId(),
    userId,
    action,
    targetId,
    metadata,
    ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    createdAt: new Date()
  });
}

// Exemple d'utilisation
await logAction(
  currentUser.id,
  'INVITE_SENT',
  invitation.id,
  { email: invitation.email, role: invitation.role },
  request
);
```

---

### 6.6 Sécurité des Emails

**Ne jamais mettre d'infos sensibles dans l'URL :**

❌ **Mauvais :**
```
https://app.com/invite/accept?email=user@example.com&role=ADMIN&agencyId=123
```

✅ **Bon :**
```
https://app.com/invite/accept?token=a1b2c3d4...
```

**Toutes les infos sont stockées en BDD et récupérées via le token.**

---

## 7. RÉSUMÉ DES LIVRABLES

### 7.1 Modèle Conceptuel

✅ **Entités définies :**
- `User` (avec `role`, `status`, `agencyId`)
- `Invitation` (avec `tokenHash`, `status`, `expiresAt`)
- `TalentAssignment` (liaison User ↔ Talent)

✅ **Relations claires :**
- 1 Agency → N Users
- 1 User → N TalentAssignments → N Talents
- 1 Admin → N Invitations

---

### 7.2 Matrice de Permissions

✅ **Tableau complet des permissions par rôle**
✅ **Logique d'autorisation backend (middleware)**
✅ **Protection frontend (hooks + composants)**

---

### 7.3 Endpoints API

✅ **Liste complète :**
- POST `/api/collaborators/invite`
- GET `/api/invites/[token]`
- POST `/api/invites/[token]/accept`
- GET `/api/collaborators`
- PATCH `/api/collaborators/[id]`
- POST `/api/collaborators/[id]/resend-invite`
- POST `/api/collaborators/[userId]/assign-talents`
- GET `/api/talents` (filtré par rôle)
- GET `/api/talents/[id]` (vérifie l'accès)
- GET `/api/talents/me` (TALENT uniquement)

✅ **Pour chaque endpoint :**
- Méthode HTTP
- URL
- Description
- Request body
- Response JSON
- Pseudo-code de la logique

---

### 7.4 Pseudo-code Backend

✅ **Fonctions principales :**
- `createInvitation()`
- `sendInvitationEmail()` (Resend)
- `verifyInvitation()`
- `acceptInvitation()`
- `listCollaborators()`
- `updateCollaboratorStatus()`
- `assignTalentsToUser()`
- `requireAuth()`, `requireRole()`, `canAccessTalent()`

---

### 7.5 Pseudo-code Frontend

✅ **Composants et pages :**
- Page `/invite/accept` (formulaire d'acceptation)
- Page `/dashboard/collaborators` (gestion admin)
- Hook `useRequireRole()`
- Composant `<RoleGate>`

---

### 7.6 Sécurité

✅ **Bonnes pratiques documentées :**
- Génération de tokens sécurisés (crypto.randomBytes)
- Hash des tokens (SHA-256)
- Expiration des invitations (7 jours)
- Validation multi-étapes (status, expiration, email unique)
- RBAC (middleware + guards)
- Rate limiting
- Audit trail
- Pas d'infos sensibles dans les URLs

---

## 8. PROCHAINES ÉTAPES D'IMPLÉMENTATION

### Phase 1 : Schéma de Base de Données
1. Créer les migrations Drizzle pour :
   - Extension de la table `users` (ajouter `role`, `status`, `agencyId`, `lastLoginAt`)
   - Table `invitations`
   - Table `talent_assignments`
   - Table `audit_logs` (optionnel)

### Phase 2 : Backend API
1. Installer Resend : `npm install resend`
2. Créer le service d'email (`lib/email-service.ts`)
3. Créer les utilitaires de sécurité (`lib/security.ts`)
4. Créer les middlewares d'authentification (`middleware/auth.ts`)
5. Implémenter les routes API (dans l'ordre) :
   - `/api/collaborators/invite`
   - `/api/invites/[token]`
   - `/api/invites/[token]/accept`
   - `/api/collaborators`
   - `/api/collaborators/[id]`
   - `/api/collaborators/[userId]/assign-talents`
6. Modifier les routes `/api/talents` pour filtrer par rôle

### Phase 3 : Frontend
1. Créer la page `/invite/accept`
2. Créer la page `/dashboard/collaborators`
3. Créer le hook `useRequireRole()`
4. Créer le composant `<RoleGate>`
5. Mettre à jour la sidebar pour masquer/afficher selon le rôle
6. Mettre à jour les pages existantes pour vérifier les permissions

### Phase 4 : Tests & Sécurité
1. Tester le flow complet d'invitation
2. Tester les restrictions d'accès par rôle
3. Vérifier l'expiration des tokens
4. Vérifier la protection contre les abus
5. Tester le rate limiting

---

## 9. QUESTIONS OUVERTES / DÉCISIONS À PRENDRE

1. **Soft delete vs Hard delete :**
   - Préférer le soft delete (status = DISABLED) pour garder l'historique
   - Option de hard delete uniquement pour conformité RGPD

2. **Auto-assignation des talents aux TALENT :**
   - Option 1 : L'admin assigne manuellement après création
   - Option 2 : Lors de l'invitation, l'admin choisit le talent à assigner

3. **Réinvitation automatique :**
   - Permettre de renvoyer une invitation expirée sans en créer une nouvelle ?
   - Ou forcer la création d'une nouvelle invitation ?

4. **Notifications en temps réel :**
   - Envoyer des notifications quand un collaborateur accepte une invitation ?
   - Via webhook, WebSocket, ou email simple ?

5. **Limite de collaborateurs :**
   - Faut-il limiter le nombre de collaborateurs par agence (plan gratuit vs payant) ?

---

**Ce document constitue l'architecture complète du système. Êtes-vous prêt à passer à l'implémentation ?**
