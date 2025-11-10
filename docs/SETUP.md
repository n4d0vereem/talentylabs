# Guide de Configuration - CRM Influenceurs

## 📋 Configuration Rapide

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration de la base de données PostgreSQL

#### Option A : PostgreSQL local

```bash
# Installer PostgreSQL (macOS)
brew install postgresql@15

# Démarrer PostgreSQL
brew services start postgresql@15

# Créer la base de données
createdb influencer_crm
```

#### Option B : PostgreSQL cloud (Neon, Supabase, etc.)

1. Créez un compte sur [Neon.tech](https://neon.tech) (gratuit)
2. Créez un nouveau projet
3. Copiez la connection string

### 3. Configuration des variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# PostgreSQL Connection String
# Format: postgresql://user:password@host:port/database
DATABASE_URL="postgresql://user:password@localhost:5432/influencer_crm"

# Better Auth Secret (générez-en un avec la commande ci-dessous)
BETTER_AUTH_SECRET="votre_secret_32_chars_minimum"

# URLs de l'application
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
```

**Générer un secret sécurisé :**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Initialiser la base de données

```bash
# Générer les migrations
npm run db:generate

# Appliquer les migrations
npm run db:push
```

### 5. Lancer l'application

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🔐 Première utilisation

1. Allez sur la page d'inscription : `/sign-up`
2. Créez votre compte avec :
   - Nom complet
   - Email
   - Mot de passe (minimum 8 caractères)
3. Vous serez automatiquement redirigé vers le dashboard

## 🛠️ Commandes utiles

```bash
# Développement
npm run dev                 # Démarrer le serveur de développement

# Production
npm run build              # Build de production
npm start                  # Lancer en production

# Base de données
npm run db:generate        # Générer les migrations Drizzle
npm run db:push            # Appliquer les migrations
npm run db:studio          # Ouvrir Drizzle Studio (interface graphique)
```

## 📊 Drizzle Studio

Pour explorer votre base de données avec une interface graphique :

```bash
npm run db:studio
```

Ouvrez [https://local.drizzle.studio](https://local.drizzle.studio)

## 🌐 Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | Connection string PostgreSQL | `postgresql://user:pass@localhost:5432/db` |
| `BETTER_AUTH_SECRET` | Clé secrète pour Better Auth (32+ chars) | `abc123...` (64 caractères hex) |
| `BETTER_AUTH_URL` | URL serveur de l'app | `http://localhost:3000` |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | URL client de l'app | `http://localhost:3000` |

## 🐛 Résolution de problèmes

### Erreur : "Cannot connect to database"

**Cause :** PostgreSQL n'est pas démarré ou `DATABASE_URL` incorrecte

**Solution :**
```bash
# Vérifier que PostgreSQL est actif
pg_isready

# Redémarrer PostgreSQL (macOS)
brew services restart postgresql@15

# Vérifier la connection string dans .env.local
```

### Erreur : "BETTER_AUTH_SECRET is not defined"

**Cause :** Variable d'environnement manquante

**Solution :**
```bash
# Générer un nouveau secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Ajouter dans .env.local
BETTER_AUTH_SECRET="<secret généré>"
```

### Erreur : "Table does not exist"

**Cause :** Migrations non appliquées

**Solution :**
```bash
# Générer et appliquer les migrations
npm run db:generate
npm run db:push
```

### Les styles Tailwind ne s'appliquent pas

**Cause :** Cache Next.js corrompu

**Solution :**
```bash
# Supprimer le cache et redémarrer
rm -rf .next
npm run dev
```

### Erreur de session / authentification

**Cause :** Cookies non configurés ou secret invalide

**Solution :**
1. Vérifiez que `BETTER_AUTH_SECRET` a au moins 32 caractères
2. Vérifiez que les URLs matchent (http vs https)
3. Videz les cookies du navigateur pour localhost:3000

## 📦 Structure de la base de données

### Table `users`
- `id` : UUID (PK)
- `email` : string (unique)
- `name` : string
- `emailVerified` : timestamp | null
- `image` : string | null
- `createdAt` : timestamp
- `updatedAt` : timestamp

### Table `sessions`
- `id` : UUID (PK)
- `userId` : UUID (FK → users.id)
- `expiresAt` : timestamp
- `token` : string (unique)
- `createdAt` : timestamp
- `updatedAt` : timestamp

### Table `accounts`
- `id` : UUID (PK)
- `userId` : UUID (FK → users.id)
- `accountId` : string
- `providerId` : string
- `accessToken` : string | null
- `refreshToken` : string | null
- `expiresAt` : timestamp | null
- `createdAt` : timestamp
- `updatedAt` : timestamp

## 🚀 Déploiement

### Vercel (recommandé)

1. Poussez votre code sur GitHub
2. Importez le projet sur [Vercel](https://vercel.com)
3. Configurez les variables d'environnement
4. Déployez

### Autres plateformes

Compatible avec :
- Netlify
- Railway
- Render
- AWS Amplify
- DigitalOcean App Platform

**Note :** Assurez-vous de configurer une base PostgreSQL en production et de mettre à jour les URLs dans les variables d'environnement.

## 📝 Checklist de déploiement

- [ ] Base de données PostgreSQL configurée
- [ ] Variables d'environnement définies
- [ ] Migrations appliquées (`npm run db:push`)
- [ ] Build de production réussi (`npm run build`)
- [ ] URLs mises à jour (BETTER_AUTH_URL)
- [ ] HTTPS activé en production
- [ ] Secret généré pour la production (différent du dev)

## 🤝 Support

Pour toute question ou problème :
1. Consultez la documentation [Next.js 15](https://nextjs.org/docs)
2. Consultez la documentation [Better Auth](https://better-auth.com)
3. Consultez la documentation [Drizzle ORM](https://orm.drizzle.team)

---

**Bon développement ! 🚀**

