# 📸 Comment Ajouter les Photos des Talents

## 🎯 Instructions

Les photos des talents doivent être placées dans le dossier `public/talents/`.

### 1️⃣ Créer le dossier (si nécessaire)
```bash
mkdir -p public/talents
```

### 2️⃣ Télécharger les photos

Enregistrez les photos que vous m'avez montrées avec ces noms **exacts** :

1. **Jade Gattoni** (photo avec boucles d'oreilles dorées)
   - Nom du fichier : `jade-gattoni.jpg`
   - Chemin complet : `public/talents/jade-gattoni.jpg`

2. **Saonara Petto** (photo blonde avec téléphone)
   - Nom du fichier : `saonara-petto.jpg`
   - Chemin complet : `public/talents/saonara-petto.jpg`

### 3️⃣ Structure finale

```
talentylabs/
└── public/
    └── talents/
        ├── jade-gattoni.jpg
        └── saonara-petto.jpg
```

### 4️⃣ Recommandations Photos

Pour un rendu optimal :
- **Format** : JPG ou PNG
- **Dimensions** : Minimum 800x800px (carré de préférence)
- **Poids** : Optimisé (< 500KB idéalement)
- **Qualité** : Haute résolution pour les profils

---

## ✅ Vérification

Une fois les photos ajoutées :

1. Redémarrez le serveur si nécessaire :
```bash
npm run dev
```

2. Allez sur http://localhost:3000/dashboard
3. Les photos devraient s'afficher !

---

## 🔄 Alternative : Placeholders Temporaires

Si vous voulez tester sans les vraies photos, vous pouvez utiliser des placeholders :

```typescript
// Dans le code, remplacez temporairement par :
image: "https://ui-avatars.com/api/?name=Jade+Gattoni&size=400&background=random"
```

Mais pour la prod, utilisez toujours les vraies photos dans `public/talents/` ! 🎨

