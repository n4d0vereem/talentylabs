# Système de Gestion de Collaborateurs - Référence Rapide

## 📚 Documents Disponibles

### 1. **COLLABORATORS_SYSTEM_ARCHITECTURE.md** (Architecture Complète)
   - Modèle conceptuel détaillé
   - Matrice complète des permissions
   - Tous les endpoints API avec exemples
   - Pseudo-code backend et frontend
   - Guide de sécurité complet
   - **À lire en premier pour comprendre le système**

### 2. **COLLABORATORS_IMPLEMENTATION_PLAN.md** (Plan d'Implémentation)
   - Guide pas à pas pour implémenter le système
   - Code prêt à copier-coller
   - Checklists de validation
   - Guide de dépannage
   - **À suivre pour l'implémentation**

### 3. **COLLABORATORS_QUICK_REFERENCE.md** (Ce document)
   - Vue d'ensemble rapide
   - Commandes essentielles
   - Référence des rôles et permissions

---

## 🎯 Vue d'Ensemble du Système

### Architecture en 3 Entités

```
┌─────────────────┐
│   INVITATIONS   │  → Token, Email, Rôle
└────────┬────────┘
         ↓
┌─────────────────┐
│      USERS      │  → Rôle, Statut, AgencyId
└────────┬────────┘
         ↓
┌─────────────────┐
│   ASSIGNMENTS   │  → User ↔ Talent
└─────────────────┘
```

### 3 Rôles

| Rôle | Accès |
|------|-------|
| **ADMIN** | Tout voir, tout gérer |
| **TALENT_MANAGER** | Talents assignés uniquement |
| **TALENT** | Son propre profil uniquement |

### 3 Statuts

| Statut | Description |
|--------|-------------|
| **INVITED** | Invitation envoyée, en attente |
| **ACTIVE** | Actif, peut se connecter |
| **DISABLED** | Désactivé temporairement |

---

## 🚀 Démarrage Rapide

### Étape 1 : Installer les dépendances

```bash
npm install resend bcryptjs
npm install -D @types/bcryptjs
```

### Étape 2 : Configurer les variables d'environnement

```bash
# .env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@votredomaine.com
APP_URL=http://localhost:3000
```

### Étape 3 : Modifier le schéma de base de données

Ajoutez à `src/db/schema.ts` :
- Enums : `userRoles`, `userStatuses`, `invitationStatuses`
- Nouveaux champs dans `users` : `role`, `status`, `agencyId`, `lastLoginAt`
- Table `invitations`
- Table `talentAssignments`

### Étape 4 : Appliquer les migrations

```bash
npm run db:generate
npm run db:push
npm run db:studio  # Vérifier
```

### Étape 5 : Créer les services

Créez dans `src/lib/` :
- `security.ts` → Génération de tokens
- `email-service.ts` → Envoi d'emails via Resend
- `auth-middleware.ts` → Authentification et autorisations

### Étape 6 : Créer les routes API

Créez dans `src/app/api/` :
- `collaborators/invite/route.ts` (POST)
- `invites/[token]/route.ts` (GET)
- `invites/[token]/accept/route.ts` (POST)
- `collaborators/route.ts` (GET)
- `collaborators/[id]/route.ts` (PATCH)

### Étape 7 : Créer les pages frontend

Créez :
- `src/app/invite/accept/page.tsx`
- `src/app/(dashboard)/dashboard/collaborators/page.tsx`
- `src/hooks/use-require-role.ts`
- `src/components/role-gate.tsx`

### Étape 8 : Tester

```bash
npm run dev
```

1. Créer une invitation depuis `/dashboard/collaborators`
2. Vérifier l'email dans les logs Resend
3. Accepter l'invitation via le lien
4. Se connecter avec le nouveau compte
5. Vérifier les restrictions d'accès

---

## 🔑 Commandes Essentielles

### Migration de la base de données

```bash
# Générer une migration
npm run db:generate

# Appliquer les migrations
npm run db:push

# Ouvrir Drizzle Studio
npm run db:studio
```

### Migrer les users existants en ADMIN

```bash
npx tsx scripts/migrate-existing-users.ts
```

### Tester l'envoi d'email

```typescript
// Test dans un script
import { sendInvitationEmail } from '@/lib/email-service';

await sendInvitationEmail({
  to: 'test@example.com',
  role: 'TALENT_MANAGER',
  inviteLink: 'http://localhost:3000/invite/accept?token=xxx',
  agencyName: 'Test Agency',
  invitedByName: 'Admin'
});
```

---

## 📊 Matrice de Permissions (Résumé)

| Fonctionnalité | ADMIN | TALENT_MANAGER | TALENT |
|----------------|-------|----------------|--------|
| Voir tous les talents | ✅ | ❌ | ❌ |
| Voir talents assignés | ✅ | ✅ | ❌ |
| Voir son propre profil | ✅ | ✅ | ✅ |
| Éditer talents | ✅ | ✅ (assignés) | ❌ |
| Inviter collaborateurs | ✅ | ❌ | ❌ |
| Gérer collaborateurs | ✅ | ❌ | ❌ |
| Paramètres agence | ✅ | ❌ | ❌ |
| Dashboard global | ✅ | ✅ (filtré) | ❌ |

---

## 🛡️ Sécurité - Points Clés

### ✅ À FAIRE

- **Hasher les tokens** avec SHA-256 avant stockage
- **Expirer les invitations** après 7 jours
- **Vérifier le statut ACTIVE** à chaque requête API
- **Filtrer les talents** selon le rôle (middleware)
- **Valider les inputs** côté backend
- **Logger les actions critiques**

### ❌ À ÉVITER

- ❌ Stocker les tokens en clair
- ❌ Permettre la réutilisation d'un token accepté
- ❌ Mettre des infos sensibles dans l'URL
- ❌ Faire confiance au frontend pour la sécurité
- ❌ Oublier de vérifier `user.status === 'ACTIVE'`

---

## 🔧 Snippets de Code Utiles

### Créer une invitation (backend)

```typescript
const token = generateSecureToken();
const tokenHash = hashToken(token);

const invitation = await db.insert(invitations).values({
  id: generateId(),
  agencyId: currentUser.agencyId,
  email: 'user@example.com',
  role: 'TALENT_MANAGER',
  tokenHash,
  status: 'PENDING',
  expiresAt: generateExpirationDate(7),
  invitedBy: currentUser.id,
  createdAt: new Date(),
  updatedAt: new Date()
});

const inviteLink = `${process.env.APP_URL}/invite/accept?token=${token}`;
await sendInvitationEmail({ to: email, role, inviteLink, ... });
```

### Vérifier les permissions (backend)

```typescript
const currentUser = await requireAuth(request);
requireRole(currentUser, ['ADMIN']);

const hasAccess = await canAccessTalent(
  currentUser.id,
  currentUser.role,
  talentId
);
```

### Protéger un composant (frontend)

```typescript
import { RoleGate } from '@/components/role-gate';

<RoleGate allowedRoles={['ADMIN']}>
  <Button>Action Admin</Button>
</RoleGate>
```

### Protéger une page (frontend)

```typescript
import { useRequireRole } from '@/hooks/use-require-role';

export default function AdminPage() {
  const { user, isPending } = useRequireRole(['ADMIN']);
  
  if (isPending) return <Loading />;
  
  return <div>Contenu admin</div>;
}
```

---

## 🐛 Dépannage Rapide

### L'email ne part pas

```bash
# Vérifier la configuration
echo $RESEND_API_KEY

# Vérifier les logs Resend
# → https://resend.com/logs

# En dev, utiliser l'email de test
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### Token invalide

```typescript
// Vérifier le hash
console.log('Token reçu:', token);
console.log('Token hash:', hashToken(token));

// Vérifier l'expiration
const invitation = await db.query.invitations.findFirst(...);
console.log('Expire à:', invitation.expiresAt);
console.log('Maintenant:', new Date());
```

### Permissions refusées

```typescript
// Vérifier le rôle et statut
const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
console.log('User:', user.role, user.status, user.agencyId);

// Vérifier les assignations
const assignments = await db.query.talentAssignments.findMany({
  where: eq(talentAssignments.userId, userId)
});
console.log('Assignations:', assignments);
```

---

## 📖 Flux Complets

### Flow d'Invitation

```
ADMIN → Invite collaborateur
  ↓
Système → Crée invitation + token
  ↓
Resend → Envoie email
  ↓
Collaborateur → Clique sur lien
  ↓
Frontend → Vérifie token (GET /api/invites/:token)
  ↓
Frontend → Affiche formulaire (nom, mot de passe)
  ↓
Backend → Crée user + account (POST /api/invites/:token/accept)
  ↓
Système → Marque invitation ACCEPTED
  ↓
Collaborateur → Se connecte
```

### Flow d'Accès à un Talent

```
User se connecte
  ↓
Middleware → Vérifie auth + statut ACTIVE
  ↓
User demande GET /api/talents
  ↓
Backend → Récupère le rôle
  ↓
Si ADMIN → Retourne tous les talents de l'agence
Si TALENT_MANAGER → Retourne talents assignés
Si TALENT → Retourne son propre talent
```

---

## 🎨 Améliorations Futures

### Court terme
- [ ] Notifications en temps réel (acceptation d'invitation)
- [ ] Historique des actions (audit logs)
- [ ] Invitation par lot (multiple emails)
- [ ] Réassignation de talents en masse

### Moyen terme
- [ ] Gestion des équipes (groupes de talent managers)
- [ ] Permissions granulaires (lecture/écriture par section)
- [ ] Invitation temporaire (accès limité dans le temps)
- [ ] 2FA pour les admins

### Long terme
- [ ] SSO / SAML
- [ ] Rôles personnalisés
- [ ] Workflow d'approbation
- [ ] Intégration avec Slack/Teams

---

## 📞 Ressources

### Documentation
- **Architecture complète** : `COLLABORATORS_SYSTEM_ARCHITECTURE.md`
- **Plan d'implémentation** : `COLLABORATORS_IMPLEMENTATION_PLAN.md`
- **Ce guide** : `COLLABORATORS_QUICK_REFERENCE.md`

### Outils externes
- **Resend** : https://resend.com/docs
- **Better Auth** : https://better-auth.com/docs
- **Drizzle ORM** : https://orm.drizzle.team/docs

### Commandes de debug
```bash
# Voir les tables
npm run db:studio

# Lister les users
npx tsx scripts/list-users.js

# Logs en temps réel
npm run dev
```

---

## ✅ Checklist de Validation

### Avant de commencer l'implémentation
- [ ] J'ai lu l'architecture complète
- [ ] J'ai compris le modèle conceptuel
- [ ] J'ai un compte Resend
- [ ] J'ai les accès à la base de données

### Après l'implémentation
- [ ] Les migrations sont appliquées
- [ ] Resend est configuré et testé
- [ ] Un admin peut inviter un collaborateur
- [ ] L'email arrive bien
- [ ] Le collaborateur peut accepter l'invitation
- [ ] Le compte est créé avec le bon rôle
- [ ] Les permissions fonctionnent (admin, manager, talent)
- [ ] Les talents sont bien filtrés par rôle
- [ ] Un admin peut désactiver un collaborateur
- [ ] Les tokens expirent après 7 jours

---

**Vous êtes prêt à implémenter le système ! 🚀**

**Prochaine étape :** Ouvrez `COLLABORATORS_IMPLEMENTATION_PLAN.md` et suivez le plan phase par phase.
