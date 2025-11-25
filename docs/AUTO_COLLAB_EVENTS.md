# 🗓️ Création automatique d'événements pour les collaborations

## ✨ Fonctionnalité

Lorsqu'une collaboration est créée ou modifiée avec des dates de preview et/ou de publication, le système crée automatiquement les événements correspondants dans le planning du talent.

## 📋 Types d'événements créés

### 1. **PREVIEW**
- Créé automatiquement si `datePreview` est définie
- Type: `PREVIEW` (couleur rose/jaune)
- Titre: `PREVIEW - [Nom de la marque]`
- Description: `Preview de la collaboration avec [Nom de la marque]`
- Durée: Toute la journée (00:00 → 23:59)

### 2. **PUBLICATION**
- Créé automatiquement si `datePublication` est définie
- Type: `PUBLICATION` (couleur cyan/violet)
- Titre: `PUBLICATION - [Nom de la marque]`
- Description: `Publication de la collaboration avec [Nom de la marque]`
- Durée: Toute la journée (00:00 → 23:59)

## 🔄 Synchronisation automatique

### Création
Quand une collaboration est créée, les événements PREVIEW et PUBLICATION sont automatiquement créés si les dates sont renseignées.

### Modification
Quand une collaboration est modifiée :
- Les anciens événements liés sont supprimés
- Les nouveaux événements sont recréés avec les dates mises à jour

### Suppression
Quand une collaboration est supprimée, tous ses événements associés sont également supprimés.

## 📊 Migration des données existantes

Une route API a été créée pour migrer toutes les collaborations existantes :

```
GET /api/migrate-collab-events
```

### Utilisation en local
1. Démarrer le serveur de dev :
```bash
npm run dev
```

2. Appeler la route dans le navigateur ou avec curl :
```bash
curl http://localhost:3000/api/migrate-collab-events
```

### Utilisation en production
```bash
curl https://votre-domaine.com/api/migrate-collab-events
```

### Réponse
```json
{
  "success": true,
  "message": "Migration terminée avec succès",
  "stats": {
    "total": 15,
    "previewCreated": 8,
    "publicationCreated": 12,
    "skipped": 2
  },
  "details": [...]
}
```

## 🛠️ Implémentation technique

### Fichiers modifiés

1. **`/api/collaborations/route.ts`** (POST)
   - Ajout de la fonction `syncCollaborationEvents()`
   - Création automatique des événements après insert

2. **`/api/collaborations/[id]/route.ts`** (PUT & DELETE)
   - Synchronisation lors de la mise à jour
   - Suppression en cascade lors de la suppression

3. **`/api/migrate-collab-events/route.ts`** (GET)
   - Route de migration pour les données existantes

### Logique de synchronisation

```typescript
async function syncCollaborationEvents(
  collabId: string,
  talentId: string,
  marque: string,
  datePreview: string | null,
  datePublication: string | null
) {
  // 1. Supprimer les anciens événements
  // 2. Créer PREVIEW si date définie
  // 3. Créer PUBLICATION si date définie
}
```

## ✅ Avantages

1. **Automatisation complète** : Plus besoin de créer manuellement les événements
2. **Synchronisation garantie** : Les événements sont toujours à jour avec les collaborations
3. **Nettoyage automatique** : Suppression en cascade lors de la suppression d'une collaboration
4. **Visibilité claire** : Les dates importantes apparaissent directement dans le planning

## 🎯 Utilisation

### Pour créer une collaboration avec événements

```typescript
const newCollab = await createCollaboration({
  talentId: "talent_123",
  marque: "Nike",
  mois: "Janvier",
  datePreview: "2025-01-15",        // ✅ Crée l'événement PREVIEW
  datePublication: "2025-01-20",     // ✅ Crée l'événement PUBLICATION
  budget: "5000",
  type: "entrant",
  statut: "en_cours"
});
```

### Résultat dans le planning

- **15 janvier 2025** : Événement "PREVIEW - Nike" (couleur rose/jaune)
- **20 janvier 2025** : Événement "PUBLICATION - Nike" (couleur cyan/violet)

## 🚀 Prochaines étapes

Pour migrer les collaborations existantes :
1. Lancer le serveur de dev : `npm run dev`
2. Ouvrir : `http://localhost:3000/api/migrate-collab-events`
3. Vérifier dans le planning que les événements sont créés

---

**Note** : Cette fonctionnalité est active dès maintenant pour toutes les nouvelles collaborations et modifications. La migration des données existantes doit être lancée manuellement via la route API.

