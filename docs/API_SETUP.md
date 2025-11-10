# 🚀 API + DATABASE SETUP - TALENTYLABS CRM

## ✅ CE QUI EST FAIT

### 1. PostgreSQL Local
```bash
Database: talentylabs
Host: localhost:5432
Status: ✅ Running
```

### 2. Schema Drizzle (12 tables)
- ✅ `users` - Utilisateurs Better Auth
- ✅ `sessions` - Sessions Better Auth
- ✅ `accounts` - Accounts Better Auth
- ✅ `agencies` - Agences (settings, logo, couleurs)
- ✅ `brands` - Marques partenaires (logo + initiales)
- ✅ `talent_categories` - Catégories de talents
- ✅ `talents` - Profils complets des talents
- ✅ `collaborations` - Partenariats avec marques
- ✅ `calendar_events` - Événements calendrier (RDV/Collabs)
- ✅ `talent_insights` - Statistiques éditables
- ✅ `media_kits` - Kits média (PDF)
- ✅ `collaborators` - Membres de l'équipe

### 3. Fichiers créés
```
src/db/
├── schema.ts         # Définition complète du schema
└── index.ts          # Connexion DB + export

.env.local            # Config DATABASE_URL
drizzle.config.ts     # Config Drizzle (mis à jour)
drizzle/
└── 0000_init.sql     # Migration initiale
```

---

## 📋 PROCHAINES ÉTAPES

### Phase 1 : API Routes (Next.js)
Créer les endpoints pour remplacer localStorage :

```
app/api/
├── talents/
│   ├── route.ts          # GET all, POST new
│   └── [id]/route.ts     # GET, PUT, DELETE
├── collaborations/
│   ├── route.ts
│   └── [id]/route.ts
├── events/
│   ├── route.ts
│   └── [id]/route.ts
├── brands/
│   └── route.ts
└── settings/
    └── route.ts
```

### Phase 2 : Migration localStorage → API
Remplacer progressivement :
1. Talents management
2. Collaborations
3. Calendar events
4. Agency settings
5. Insights

### Phase 3 : Better Auth + PostgreSQL
Configurer Better Auth pour utiliser PostgreSQL au lieu de mémoire.

---

## 🔧 COMMANDES UTILES

### Voir la database
```bash
psql talentylabs
```

### Régénérer les migrations
```bash
npx drizzle-kit generate
```

### Appliquer les migrations
```bash
DATABASE_URL="postgresql://localhost:5432/talentylabs" npx drizzle-kit push
```

### Studio Drizzle (interface web)
```bash
DATABASE_URL="postgresql://localhost:5432/talentylabs" npx drizzle-kit studio
```

---

## 📊 ARCHITECTURE FINALE

```
Frontend (Next.js)
      ↓
API Routes (Next.js)
      ↓
Drizzle ORM
      ↓
PostgreSQL (localhost:5432)
```

---

## ✅ AVANTAGES

- ✅ **100% TypeScript** (type-safe queries)
- ✅ **Gratuit** (tout en local)
- ✅ **Rapide** (localhost)
- ✅ **Illimité** (pas de quota)
- ✅ **Backup** possible (pg_dump)
- ✅ **Migration facile** vers cloud plus tard

---

**Date**: 2025-01-04  
**Status**: Database ready ✅  
**Next**: API Routes création



