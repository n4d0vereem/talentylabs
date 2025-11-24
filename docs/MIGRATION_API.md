# 🔄 GUIDE MIGRATION localStorage → API

## ✅ CE QUI EST FAIT

### **API Routes créées** (9 endpoints)
```
✅ /api/talents          → GET, POST
✅ /api/talents/[id]     → GET, PUT, DELETE
✅ /api/collaborations   → GET, POST
✅ /api/collaborations/[id] → GET, PUT, DELETE
✅ /api/events           → GET, POST
✅ /api/events/[id]      → GET, PUT, DELETE
✅ /api/settings         → GET, POST, PUT
✅ /api/brands           → GET, POST
✅ /api/brands/[id]      → GET, PUT, DELETE
✅ /api/categories       → GET, POST, DELETE
✅ /api/insights         → GET, POST (upsert)
✅ /api/mediakit         → GET, POST, DELETE
```

### **Helper API Client** 
`src/lib/api-client.ts` - Fonctions prêtes à utiliser

### **Better Auth + PostgreSQL**
✅ Configuré et connecté à la DB

---

## 📋 MIGRATION ÉTAPE PAR ÉTAPE

### **AVANT (localStorage)**
```typescript
import { getTalents, addTalent } from "@/lib/talents-storage";

const talents = getTalents();
addTalent(newTalent);
```

### **APRÈS (API)**
```typescript
import { getTalents, createTalent } from "@/lib/api-client";

const talents = await getTalents(agencyId);
await createTalent(newTalent);
```

---

## 🔧 FICHIERS À MIGRER

### 1️⃣ Dashboard principal
**Fichier**: `src/app/(dashboard)/dashboard/page.tsx`

**Changements**:
```typescript
// AVANT
import { getTalents } from "@/lib/talents-storage";
const [talents, setTalents] = useState<Talent[]>(getTalents());

// APRÈS
import { getTalents } from "@/lib/api-client";
const [talents, setTalents] = useState<Talent[]>([]);

useEffect(() => {
  const loadTalents = async () => {
    const data = await getTalents("agency_id_from_session");
    setTalents(data);
  };
  loadTalents();
}, []);
```

---

### 2️⃣ Formulaire ajout talent
**Fichier**: `src/app/(dashboard)/dashboard/creators/page.tsx`

**Changements**:
```typescript
// AVANT
import { addTalent } from "@/lib/talents-storage";
const newTalent = addTalent({ ... });

// APRÈS
import { createTalent } from "@/lib/api-client";
const newTalent = await createTalent({
  ...data,
  agencyId: "agency_id_from_session"
});
```

---

### 3️⃣ Profil talent détaillé
**Fichier**: `src/app/(dashboard)/dashboard/creators/[id]/page.tsx`

**Changements**:
```typescript
// AVANT
import { getTalentById, updateTalent } from "@/lib/talents-storage";
const creator = getTalentById(creatorId);

// APRÈS
import { getTalentById, updateTalent } from "@/lib/api-client";
const [creator, setCreator] = useState(null);

useEffect(() => {
  const loadTalent = async () => {
    const data = await getTalentById(creatorId);
    setCreator(data);
  };
  loadTalent();
}, [creatorId]);

// Pour les insights
import { getInsights, saveInsights } from "@/lib/api-client";
const insights = await getInsights(creatorId);
await saveInsights({ talentId: creatorId, ...insightsData });

// Pour les collaborations
import { getCollaborations, createCollaboration } from "@/lib/api-client";
const collabs = await getCollaborations(creatorId);
await createCollaboration({ talentId: creatorId, ...data });

// Pour les événements
import { getEvents, createEvent } from "@/lib/api-client";
const events = await getEvents(creatorId);
await createEvent({ talentId: creatorId, ...data });
```

---

### 4️⃣ Settings agence
**Fichier**: `src/app/(dashboard)/dashboard/settings/page.tsx`

**Changements**:
```typescript
// AVANT
import { getAgencySettings, saveAgencySettings } from "@/lib/agency-settings";
const settings = getAgencySettings();

// APRÈS
import { getAgencySettings, updateAgencySettings } from "@/lib/api-client";
import { getBrands, createBrand, deleteBrand } from "@/lib/api-client";
import { getCategories, createCategory, deleteCategory } from "@/lib/api-client";

const settings = await getAgencySettings(agencyId);
await updateAgencySettings(agencyId, { name, logo, primaryColor });

// Pour les brands
const brands = await getBrands(agencyId);
await createBrand({ name, initials, logo, agencyId });
await deleteBrand(brandId);

// Pour les categories
const categories = await getCategories(agencyId);
await createCategory({ name, agencyId });
await deleteCategory(categoryId);
```

---

### 5️⃣ Calendar component
**Fichier**: `src/components/talent-calendar.tsx`

**Changements**:
```typescript
// AVANT
const eventsKey = `talent_calendar_${talentId}`;
const saved = localStorage.getItem(eventsKey);

// APRÈS
import { getEvents, createEvent, updateEvent, deleteEvent } from "@/lib/api-client";

useEffect(() => {
  const loadEvents = async () => {
    const data = await getEvents(talentId);
    setEvents(data.map(e => ({
      ...e,
      start: new Date(e.start),
      end: new Date(e.end)
    })));
  };
  loadEvents();
}, [talentId]);

// Ajouter
await createEvent({ talentId, title, start, end, type, ... });

// Mettre à jour (drag & drop)
await updateEvent(eventId, { start: newStart, end: newEnd });

// Supprimer
await deleteEvent(eventId);
```

---

## 🚀 ORDRE DE MIGRATION RECOMMANDÉ

1. ✅ **Dashboard** (liste talents) - Rapide
2. ✅ **Formulaire ajout** - Rapide
3. ✅ **Settings** (agence, brands, categories) - Moyen
4. ✅ **Profil talent** (infos de base) - Moyen
5. ✅ **Insights** - Rapide
6. ✅ **Media Kit** - Rapide
7. ✅ **Collaborations** - Moyen
8. ✅ **Calendar** - Long (drag & drop)

**Temps estimé total**: 2-3 heures

---

## ⚡ AVANTAGES API vs localStorage

| Feature | localStorage | API + PostgreSQL |
|---------|--------------|------------------|
| **Limite** | 5-10 MB | ∞ illimité |
| **Partage** | ❌ Un seul navigateur | ✅ Multi-device |
| **Backup** | ❌ Pas de backup | ✅ pg_dump |
| **Recherche** | ❌ Lent | ✅ Index SQL |
| **Collab** | ❌ Impossible | ✅ Multi-user |
| **Sécurité** | ❌ Visible client | ✅ Serveur sécurisé |
| **Type-safe** | ⚠️ JSON parse | ✅ Drizzle ORM |

---

## 🔑 GESTION DE L'AGENCY ID

Pour l'instant, l'`agencyId` doit être récupéré depuis la session Better Auth.

**Option temporaire** (dev):
```typescript
// Hardcode pour dev
const AGENCY_ID = "agency_dev_001";
```

**Option production** (après Better Auth setup):
```typescript
import { useSession } from "@/lib/auth-client";

const { data: session } = useSession();
const agencyId = session?.user?.agencyId;
```

---

## 📝 CHECKLIST MIGRATION

- [ ] Migrer Dashboard (liste talents)
- [ ] Migrer Formulaire ajout talent
- [ ] Migrer Profil talent (base)
- [ ] Migrer Insights
- [ ] Migrer Media Kit
- [ ] Migrer Collaborations
- [ ] Migrer Calendar events
- [ ] Migrer Settings (agence)
- [ ] Migrer Brands
- [ ] Migrer Categories
- [ ] Supprimer anciens fichiers localStorage
- [ ] Tester toutes les features
- [ ] Setup Better Auth avec agencyId

---

**Date**: 2025-01-04  
**Status**: API ready, migration en attente








