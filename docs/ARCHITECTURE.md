# Architecture TALENTYLABS CRM

## 🎯 VERSION ACTUELLE : PROTOTYPE

### Qu'est-ce qui existe ?
- **Frontend uniquement** : Next.js 15 avec App Router
- **Stockage** : localStorage du navigateur (5-10MB max)
- **Données** : Talents, événements, photos, settings
- **Design** : UI complète et fonctionnelle

### Qu'est-ce qui N'existe PAS ?
- ❌ API backend
- ❌ Base de données réelle
- ❌ Serveur
- ❌ Cloud storage
- ❌ Authentification persistante

### Schéma actuel
```
┌─────────────────────────────┐
│   NAVIGATEUR (Chrome/Edge)  │
│                              │
│  ┌────────────────────────┐ │
│  │   Next.js Frontend     │ │
│  │   (localhost:3000)     │ │
│  └────────────────────────┘ │
│              │               │
│              ▼               │
│  ┌────────────────────────┐ │
│  │   localStorage         │ │
│  │   (5-10MB max)         │ │
│  │                        │ │
│  │   • Talents            │ │
│  │   • Événements         │ │
│  │   • Photos (2MB max)   │ │
│  │   • Paramètres         │ │
│  └────────────────────────┘ │
└─────────────────────────────┘
```

## ⚠️ LIMITATIONS

### Espace de stockage
- **Max total** : 5-10MB (selon navigateur)
- **Fichiers** : 2MB max par fichier
- **Erreur** : "QuotaExceededError" si dépassé

### Persistance
- ✅ Données conservées après fermeture du navigateur
- ❌ Perdues si cache vidé
- ❌ Pas de sync entre appareils
- ❌ Pas de backup automatique

## 🚀 PROCHAINES ÉTAPES (si production)

### Phase 1 : Backend + API
```
Frontend (Next.js)
      ↓
API REST (Node.js/Express)
      ↓
PostgreSQL Database
```

### Phase 2 : Cloud Storage
- AWS S3 / Cloudflare R2 pour fichiers
- CDN pour images optimisées

### Phase 3 : Authentification
- JWT tokens
- Sessions sécurisées
- Multi-utilisateurs

## 📊 Estimation Migration

**Temps** : 2-3 semaines
**Stack suggérée** :
- Backend : Node.js + Express
- DB : PostgreSQL (Supabase ou AWS RDS)
- Storage : AWS S3 ou Cloudflare R2
- Hosting : Vercel (frontend) + Railway/Render (backend)

---

**Version actuelle** : Prototype localStorage  
**Date** : Novembre 2025



