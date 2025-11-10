# 📸 Upload de Photo des Talents

## ✨ Fonctionnalité Implémentée

Vous pouvez maintenant **changer la photo d'un talent en cliquant directement dessus** depuis son profil !

---

## 🎯 Comment Utiliser

### Étapes simples :

1. **Allez sur le profil d'un talent**
   - Dashboard → Cliquez sur Jade Gattoni ou Saonara Petto
   - Ou allez directement sur `/dashboard/creators/1`

2. **Cliquez sur la photo du talent**
   - La photo est dans l'onglet "Vue d'ensemble"
   - Au hover, vous verrez "Changer la photo" avec une icône caméra

3. **Sélectionnez une image**
   - Une fenêtre de sélection de fichier s'ouvre
   - Choisissez une photo (JPG, PNG, etc.)
   - Max 5MB

4. **La photo s'affiche instantanément !**
   - Preview locale immédiate
   - L'image est stockée en mémoire (pour le moment)

---

## 🎨 Effets Visuels

### Au survol de la photo :
- ✅ **Zoom léger** (scale 1.05)
- ✅ **Overlay semi-transparent** noir
- ✅ **Icône caméra** au centre
- ✅ **Texte "Changer la photo"**
- ✅ **Badge upload** en haut à droite

### Pendant l'upload :
- ⏳ **Loader animé** (spinner)
- ⏳ **Texte "Upload en cours..."**
- ⏳ **Fond flou** (backdrop-blur)
- ⏳ **Curseur "wait"**

### Indication discrète :
- 💡 **"Cliquez pour changer la photo"** sous l'image

---

## 🔧 Validations

Le composant vérifie :
- ✅ **Type de fichier** : Images uniquement (JPG, PNG, WEBP, etc.)
- ✅ **Taille** : Maximum 5MB
- ✅ **Messages d'erreur** : Alerts claires en cas de problème

---

## 📦 Composant Créé

**`src/components/avatar-upload.tsx`**

Ce composant réutilisable permet :
- Upload d'image avec preview
- Effets visuels élégants
- États de loading
- Validations intégrées
- Callback `onImageChange` pour sauvegarder

---

## 🚀 Prochaines Étapes (Optionnel)

### Sauvegarder sur un serveur

Pour l'instant, la photo est stockée localement dans le navigateur. Pour la sauvegarder :

1. **Créer une API route** (`app/api/upload/route.ts`)
2. **Uploader sur Cloudinary, S3, ou votre serveur**
3. **Mettre à jour la BDD** avec la nouvelle URL

Exemple :
```typescript
// Dans avatar-upload.tsx, ligne 41
const formData = new FormData();
formData.append('file', file);
formData.append('creatorId', creatorId);

const response = await fetch('/api/upload', { 
  method: 'POST', 
  body: formData 
});

const data = await response.json();
setImageUrl(data.url);
onImageChange?.(data.url);
```

---

## ✅ Avantages

- 🎯 **UX intuitive** : Cliquer sur l'image = changer l'image
- ⚡ **Preview instantanée** : Pas besoin d'attendre
- 🎨 **Design cohérent** : S'intègre au style minimaliste
- 🔒 **Validations** : Sécurisé (taille, type)
- ♻️ **Réutilisable** : Le composant peut être utilisé partout

---

## 🧪 Tester

1. Serveur : http://localhost:3000/dashboard
2. Cliquez sur **Jade Gattoni**
3. **Survolez sa photo** → Vous verrez l'overlay
4. **Cliquez** → Sélectionnez une image
5. **La photo change instantanément !** 🎉

---

Profitez de votre nouvel upload de photos ultra-simple ! 📸✨

