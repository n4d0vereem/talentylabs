# 🎯 Système de Gestion de Collaborateurs - Documentation

Bienvenue dans la documentation complète du système de gestion de collaborateurs pour votre CRM d'influenceurs.

---

## 📚 Structure de la Documentation

Vous trouverez **3 documents** dans ce dossier :

### 1. 📖 COLLABORATORS_QUICK_REFERENCE.md
**→ Commencez par ici !**

Guide de référence rapide contenant :
- Vue d'ensemble du système
- Commandes essentielles
- Snippets de code
- Dépannage rapide

**⏱️ Temps de lecture : 5-10 minutes**

---

### 2. 🏗️ COLLABORATORS_SYSTEM_ARCHITECTURE.md
**→ Pour comprendre en profondeur**

Architecture complète du système avec :
- Modèle conceptuel détaillé (entités, relations)
- Matrice complète des permissions par rôle
- Spécification de tous les endpoints API
- Pseudo-code backend et frontend complet
- Guide de sécurité et bonnes pratiques

**⏱️ Temps de lecture : 30-45 minutes**

---

### 3. 🚀 COLLABORATORS_IMPLEMENTATION_PLAN.md
**→ Pour implémenter le système**

Plan d'implémentation étape par étape avec :
- Guide phase par phase (9 phases)
- Code prêt à copier-coller
- Checklists de validation
- Scripts de migration
- Guide de dépannage détaillé

**⏱️ Temps d'implémentation : 3-5 jours**

---

## 🎯 Par Où Commencer ?

### Vous voulez une vue d'ensemble rapide ?
→ Lisez **COLLABORATORS_QUICK_REFERENCE.md**

### Vous voulez comprendre l'architecture ?
→ Lisez **COLLABORATORS_SYSTEM_ARCHITECTURE.md**

### Vous êtes prêt à implémenter ?
→ Suivez **COLLABORATORS_IMPLEMENTATION_PLAN.md**

---

## ⚡ Démarrage Ultra-Rapide (TL;DR)

Si vous êtes pressé, voici les étapes essentielles :

### 1. Installation
```bash
npm install resend bcryptjs
npm install -D @types/bcryptjs
```

### 2. Configuration
```bash
# .env
RESEND_API_KEY=re_xxxxxxxxxx
RESEND_FROM_EMAIL=noreply@votredomaine.com
APP_URL=http://localhost:3000
```

### 3. Base de données
```bash
# Modifier src/db/schema.ts (voir IMPLEMENTATION_PLAN)
npm run db:generate
npm run db:push
npx tsx scripts/migrate-existing-users.ts
```

### 4. Créer les fichiers
Suivez le plan dans **COLLABORATORS_IMPLEMENTATION_PLAN.md**, Phase 3-5.

### 5. Tester
```bash
npm run dev
# Aller sur /dashboard/collaborators
# Inviter un collaborateur
# Accepter l'invitation
```

---

## 🎨 Ce Que Vous Allez Construire

### Système d'Invitations
- Invitations par email via Resend
- Tokens sécurisés avec expiration (7 jours)
- Page d'acceptation d'invitation
- Création de compte automatique

### 3 Rôles avec Permissions
- **ADMIN** : Accès complet, gestion des collaborateurs
- **TALENT_MANAGER** : Accès aux talents assignés uniquement
- **TALENT** : Accès à son propre profil uniquement

### Gestion des Collaborateurs (Admin)
- Liste des collaborateurs avec statuts
- Inviter de nouveaux collaborateurs
- Désactiver/réactiver des comptes
- Assigner des talents aux managers
- Renvoyer des invitations

### Sécurité et Contrôle d'Accès
- RBAC (Role-Based Access Control)
- Filtrage automatique des données selon le rôle
- Protection des routes backend et frontend
- Audit trail (optionnel)

---

## 📊 Aperçu de l'Architecture

```
┌──────────────────────────────────────────────────┐
│                    FRONTEND                       │
│  ┌──────────────┐  ┌────────────────────────┐   │
│  │  Dashboard   │  │  Page Collaborateurs   │   │
│  │  (filtré)    │  │     (Admin only)       │   │
│  └──────────────┘  └────────────────────────┘   │
│         │                     │                   │
│         ├─────────────────────┤                   │
│         │ RoleGate, Hooks     │                   │
└─────────┼─────────────────────┼───────────────────┘
          │                     │
          ▼                     ▼
┌──────────────────────────────────────────────────┐
│                  API ROUTES                       │
│  /api/collaborators/invite        (POST)         │
│  /api/invites/:token              (GET)          │
│  /api/invites/:token/accept       (POST)         │
│  /api/collaborators               (GET)          │
│  /api/talents                     (GET, filtré)  │
└─────────────────┬────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────┐
│              MIDDLEWARE AUTH                      │
│  requireAuth() → Vérifie session + status         │
│  requireRole() → Vérifie permissions              │
│  canAccessTalent() → Vérifie assignations         │
└─────────────────┬────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────┐
│                  DATABASE                         │
│  ┌──────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │ User │──│ Invitations │  │ TalentAssignment│ │
│  │ Role │  │ Token Hash  │  │   User ↔ Talent │ │
│  └──────┘  └─────────────┘  └─────────────────┘ │
└──────────────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────┐
│                   RESEND                          │
│           Envoi d'emails d'invitation             │
└──────────────────────────────────────────────────┘
```

---

## ✅ Fonctionnalités Clés

### Pour les Admins
- ✅ Inviter des collaborateurs (Talent Managers et Talents)
- ✅ Voir tous les collaborateurs et leur statut
- ✅ Assigner des talents à des managers
- ✅ Désactiver/réactiver des comptes
- ✅ Renvoyer des invitations expirées
- ✅ Accès complet à tous les talents

### Pour les Talent Managers
- ✅ Voir uniquement les talents assignés
- ✅ Gérer les collaborations de leurs talents
- ✅ Accéder au calendrier de leurs talents
- ❌ Pas d'accès aux paramètres
- ❌ Ne peut pas inviter d'autres users

### Pour les Talents
- ✅ Voir leur propre profil
- ✅ Consulter leurs collaborations
- ✅ Voir leur calendrier
- ❌ Pas d'accès au dashboard global
- ❌ Lecture seule (pas d'édition)

---

## 🔐 Sécurité

### Tokens d'Invitation
- Génération cryptographiquement sécurisée (32 bytes)
- Stockage hashé (SHA-256) en base de données
- Expiration après 7 jours
- Usage unique (marqué ACCEPTED après utilisation)

### Contrôle d'Accès
- Vérification du statut ACTIVE à chaque requête
- Filtrage automatique des données selon le rôle
- Middleware d'authentification sur toutes les routes sensibles
- Protection côté backend ET frontend

### Bonnes Pratiques
- Pas d'informations sensibles dans les URLs
- Validation des inputs côté backend
- Logs des actions critiques
- Rate limiting sur les invitations (optionnel)

---

## 🛠️ Technologies Utilisées

- **Next.js 14+** : Framework React
- **Better Auth** : Authentification
- **Drizzle ORM** : Base de données
- **PostgreSQL** : SGBD
- **Resend** : Envoi d'emails
- **TypeScript** : Langage
- **Tailwind CSS** : Styling

---

## 📞 Support & Ressources

### Documentation Externe
- [Resend Docs](https://resend.com/docs)
- [Better Auth Docs](https://better-auth.com/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs)

### Outils de Debug
```bash
# Drizzle Studio (visualiser la BDD)
npm run db:studio

# Lister les users
npx tsx scripts/list-users.js

# Voir les logs Resend
# → https://resend.com/logs
```

### En Cas de Problème
1. Consultez la section "Dépannage" dans **IMPLEMENTATION_PLAN.md**
2. Vérifiez les logs côté serveur
3. Testez les endpoints avec Postman/Insomnia
4. Inspectez la base de données avec Drizzle Studio

---

## 🎉 Prêt à Commencer ?

### Étape 1 : Lire la vue d'ensemble
→ Ouvrez **COLLABORATORS_QUICK_REFERENCE.md**

### Étape 2 : Comprendre l'architecture
→ Ouvrez **COLLABORATORS_SYSTEM_ARCHITECTURE.md**

### Étape 3 : Implémenter
→ Suivez **COLLABORATORS_IMPLEMENTATION_PLAN.md**

---

## 📋 Checklist Finale

Avant de commencer :
- [ ] J'ai lu QUICK_REFERENCE.md
- [ ] J'ai compris l'architecture (ARCHITECTURE.md)
- [ ] J'ai un compte Resend configuré
- [ ] J'ai accès à la base de données
- [ ] J'ai 3-5 jours de développement disponibles

Après l'implémentation :
- [ ] Les migrations sont appliquées
- [ ] Resend fonctionne
- [ ] Je peux inviter un collaborateur
- [ ] L'email arrive et le lien fonctionne
- [ ] Le compte est créé avec le bon rôle
- [ ] Les permissions fonctionnent correctement
- [ ] Les talents sont filtrés selon le rôle

---

**Bon développement ! 🚀**

Si vous avez des questions, consultez d'abord la documentation complète. Chaque point est détaillé avec des exemples de code et des explications.
