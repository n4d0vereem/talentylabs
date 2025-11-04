# CRM pour Agences d'Influenceurs

Une application SaaS CRM moderne pour gérer les influenceurs et créateurs de contenu, construite avec Next.js 15 et Better Auth.

## 🚀 Stack Technique

- **Framework**: Next.js 15 avec App Router
- **Langage**: TypeScript (mode strict)
- **Styling**: Tailwind CSS v4
- **Composants UI**: shadcn/ui
- **Authentification**: Better Auth
- **Base de données**: PostgreSQL
- **ORM**: Drizzle ORM
- **Icônes**: Lucide React
- **Validation**: Zod + React Hook Form

## 📋 Prérequis

- Node.js 18+ 
- PostgreSQL 14+
- npm ou yarn

## 🛠️ Installation

1. **Cloner le projet et installer les dépendances**

```bash
cd influencer-crm
npm install
```

2. **Configurer les variables d'environnement**

Copiez le fichier `.env.example` vers `.env.local` et mettez à jour les valeurs :

```bash
cp .env.example .env.local
```

Éditez `.env.local` avec vos configurations :

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/influencer_crm"

# Générez une clé secrète aléatoire (min 32 caractères)
BETTER_AUTH_SECRET="votre_clé_secrète_aléatoire_ici"

# URL de base de l'application
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
```

Pour générer une clé secrète sécurisée :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

3. **Créer la base de données PostgreSQL**

```bash
# Connectez-vous à PostgreSQL
psql -U postgres

# Créez la base de données
CREATE DATABASE influencer_crm;

# Quittez psql
\q
```

4. **Générer et exécuter les migrations de base de données**

```bash
# Générer les migrations
npm run db:generate

# Appliquer les migrations
npm run db:push
```

5. **Lancer l'application en développement**

```bash
npm run dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

## 📦 Scripts npm

```bash
# Développement
npm run dev           # Lancer le serveur de développement

# Build
npm run build         # Construire l'application pour la production
npm start             # Lancer l'application en production

# Base de données (Drizzle)
npm run db:generate   # Générer les migrations
npm run db:push       # Appliquer les migrations
npm run db:studio     # Ouvrir Drizzle Studio (UI pour la DB)
```

## 🎨 Fonctionnalités - Version 1

### ✅ Authentification
- Inscription avec email/mot de passe
- Connexion avec email/mot de passe
- Validation des formulaires avec Zod
- Gestion des sessions avec Better Auth
- Protection des routes avec middleware

### ✅ Dashboard
- Layout avec sidebar responsive
- Navigation principale (Dashboard, Créateurs, Campagnes, Analytics, Paramètres)
- En-tête avec recherche et menu utilisateur
- Tableau de bord avec cartes d'état vide
- Design moderne avec glassmorphisme

### ✅ UI/UX
- Design clean et moderne
- Palette de couleurs douce (blanc, gris, bleu)
- Effets de glassmorphisme sur les cartes d'authentification
- Animations et transitions fluides
- Responsive (mobile, tablette, desktop)
- Composants shadcn/ui

## 📁 Structure du Projet

```
influencer-crm/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Routes d'authentification
│   │   │   ├── layout.tsx       # Layout centré pour auth
│   │   │   ├── sign-in/         # Page de connexion
│   │   │   └── sign-up/         # Page d'inscription
│   │   ├── (dashboard)/         # Routes protégées
│   │   │   ├── layout.tsx       # Layout avec sidebar
│   │   │   └── dashboard/       # Page dashboard
│   │   ├── api/
│   │   │   └── auth/[...all]/   # API routes Better Auth
│   │   └── globals.css          # Styles globaux
│   ├── components/
│   │   ├── ui/                  # Composants shadcn/ui
│   │   ├── sidebar.tsx          # Sidebar de navigation
│   │   └── header.tsx           # En-tête du dashboard
│   ├── lib/
│   │   ├── auth.ts              # Configuration Better Auth serveur
│   │   ├── auth-client.ts       # Client Better Auth
│   │   ├── utils.ts             # Utilitaires (cn, etc.)
│   │   └── db/
│   │       ├── schema.ts        # Schéma Drizzle
│   │       └── index.ts         # Instance Drizzle
│   └── middleware.ts            # Middleware de protection des routes
├── drizzle.config.ts            # Configuration Drizzle
├── components.json              # Configuration shadcn/ui
└── package.json
```

## 🔐 Authentification

L'authentification est gérée par **Better Auth** avec :

- **Stratégie**: Email/Password
- **Tables**: users, sessions, accounts
- **Session**: Cookie sécurisé
- **Protection**: Middleware Next.js

### Routes publiques
- `/sign-in` - Connexion
- `/sign-up` - Inscription

### Routes protégées
- `/dashboard` - Dashboard principal
- `/dashboard/*` - Toutes les sous-routes

## 🗄️ Base de données

### Schéma Drizzle (PostgreSQL)

**Table `users`**
- id (UUID)
- email (unique)
- name
- emailVerified
- image
- createdAt
- updatedAt

**Table `sessions`**
- id (UUID)
- userId (FK → users)
- expiresAt
- token (unique)
- createdAt
- updatedAt

**Table `accounts`** (pour OAuth futur)
- id (UUID)
- userId (FK → users)
- accountId
- providerId
- accessToken
- refreshToken
- expiresAt
- createdAt
- updatedAt

## 🎯 Prochaines Étapes (Futures Versions)

- [ ] CRUD Créateurs (influenceurs)
- [ ] Gestion des campagnes
- [ ] Tableau de bord analytics
- [ ] Profils des créateurs avec métriques
- [ ] Système de tags et catégories
- [ ] Recherche et filtres avancés
- [ ] Export de données (CSV, PDF)
- [ ] Notifications en temps réel
- [ ] Mode sombre
- [ ] OAuth (Google, GitHub)

## 🐛 Dépannage

### Erreur de connexion à la base de données
Vérifiez que :
- PostgreSQL est en cours d'exécution
- `DATABASE_URL` est correcte dans `.env.local`
- La base de données existe

### Erreur Better Auth
Vérifiez que :
- `BETTER_AUTH_SECRET` est défini (min 32 caractères)
- Les URLs `BETTER_AUTH_URL` et `NEXT_PUBLIC_BETTER_AUTH_URL` correspondent

### Erreurs Tailwind CSS
Si les styles ne s'appliquent pas, essayez :
```bash
rm -rf .next
npm run dev
```

## 📝 Licence

Ce projet est privé et propriétaire.

## 👨‍💻 Développement

Créé avec ❤️ en utilisant les meilleures pratiques Next.js 15 et TypeScript.
