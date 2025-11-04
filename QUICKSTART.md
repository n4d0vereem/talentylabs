# 🚀 Quick Start Guide

## Installation en 5 minutes

### 1. Installer les dépendances
```bash
cd influencer-crm
npm install
```

### 2. Configurer PostgreSQL

**Option facile - Neon (gratuit) :**
1. Allez sur [neon.tech](https://neon.tech)
2. Créez un compte gratuit
3. Créez un nouveau projet
4. Copiez la connection string

**Option locale :**
```bash
# macOS
brew install postgresql@15
brew services start postgresql@15
createdb influencer_crm

# Linux
sudo apt install postgresql
sudo systemctl start postgresql
sudo -u postgres createdb influencer_crm
```

### 3. Créer `.env.local`

```bash
# Créer le fichier
touch .env.local
```

Copiez-collez ceci dans `.env.local` :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/influencer_crm"
BETTER_AUTH_SECRET="changez_moi_avec_un_secret_aleatoire_de_32_caracteres_minimum"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
```

**⚠️ Important :** Générez un vrai secret :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Initialiser la base de données

```bash
npm run db:generate
npm run db:push
```

### 5. Lancer l'app

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) 🎉

## Première connexion

1. Cliquez sur "Créer un compte"
2. Remplissez le formulaire :
   - Nom : Jean Dupont
   - Email : jean@example.com
   - Mot de passe : password123 (8 caractères minimum)
3. Vous êtes automatiquement connecté au dashboard !

## Structure de l'application

```
/sign-in          → Page de connexion
/sign-up          → Page d'inscription
/dashboard        → Dashboard principal
/dashboard/creators   → Créateurs (à venir)
/dashboard/campaigns  → Campagnes (à venir)
/dashboard/analytics  → Analytics (à venir)
/dashboard/settings   → Paramètres (à venir)
```

## Commandes utiles

```bash
npm run dev         # Développement
npm run build       # Build production
npm run db:studio   # Interface graphique DB
```

## Problèmes courants

**"Cannot connect to database"**
→ Vérifiez `DATABASE_URL` dans `.env.local`

**"BETTER_AUTH_SECRET is not defined"**
→ Ajoutez `BETTER_AUTH_SECRET` dans `.env.local`

**Styles ne fonctionnent pas**
→ `rm -rf .next && npm run dev`

---

**Besoin d'aide ?** Consultez [SETUP.md](./SETUP.md) pour le guide complet.

