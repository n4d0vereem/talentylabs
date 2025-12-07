# 🎨 Créer les icônes PWA

## Option 1 : Utiliser le SVG fourni

Un fichier `icon.svg` a été créé dans `/public/` avec un "E" stylisé.

### Convertir SVG → PNG en ligne

1. Va sur https://svgtopng.com/
2. Upload `/public/icon.svg`
3. Télécharge en 512x512px → renomme en `icon-512.png`
4. Télécharge en 192x192px → renomme en `icon-192.png`
5. Place les 2 fichiers PNG dans `/public/`

---

## Option 2 : Avec le logo d'Eidoles

Si tu as déjà un logo :

1. **Prépare l'image** :
   - Ouvre ton logo dans Figma/Canva/Photoshop
   - Crée un canvas 512x512px
   - Centre le logo (360x360px max)
   - Fond : transparent OU blanc OU noir

2. **Exporte** :
   - Format : PNG
   - Qualité : Maximum
   - Nom : `icon-512.png`

3. **Crée la petite version** :
   - Redimensionne à 192x192px
   - Nom : `icon-192.png`

4. **Place dans `/public/`**

---

## Option 3 : Avec un générateur en ligne

### 1. PWA Asset Generator
https://www.pwabuilder.com/imageGenerator

- Upload ton logo
- Il génère automatiquement toutes les tailles
- Télécharge le pack
- Copie `icon-192.png` et `icon-512.png` dans `/public/`

### 2. Favicon.io
https://favicon.io/logo-generator/

- Choisis une lettre : "E"
- Couleur de fond : Noir
- Couleur du texte : Blanc
- Font : "Roboto" (light)
- Télécharge
- Renomme en `icon-192.png` et `icon-512.png`

---

## Option 4 : Avec ImageMagick (Terminal)

Si tu as ImageMagick installé :

```bash
cd /Users/nadfaqou/Documents/leested_infrastructure/influencer-crm/public

# Convertir SVG → PNG 512px
convert -background none icon.svg -resize 512x512 icon-512.png

# Convertir SVG → PNG 192px  
convert -background none icon.svg -resize 192x192 icon-192.png
```

---

## ✅ Vérification

Après avoir créé les icônes :

```bash
cd /Users/nadfaqou/Documents/leested_infrastructure/influencer-crm/public
ls -lh icon-*.png
```

Tu dois voir :
```
icon-192.png  (~5-20 KB)
icon-512.png  (~15-60 KB)
```

---

## 🧪 Tester

1. Refresh l'application : `http://localhost:3001`
2. Ouvre Chrome DevTools → Application → Manifest
3. Tu dois voir tes icônes affichées
4. Sur mobile, l'icône apparaîtra sur l'écran d'accueil

---

## 📱 Résultat attendu

Quand tu installes la PWA :
- **Android** : Icône sur l'écran d'accueil
- **iOS** : Icône sur le SpringBoard
- **Desktop** : Icône dans les apps installées

---

**Besoin d'aide ?** Le SVG placeholder fonctionne déjà, tu peux juste le convertir en PNG pour tester rapidement !

