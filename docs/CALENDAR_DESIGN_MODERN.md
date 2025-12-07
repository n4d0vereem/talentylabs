# 🎨 Calendrier Moderne - Design Ultra-Clean

## ✨ Design inspiré de l'image de référence

Le calendrier a été redesigné pour être **ultra-moderne, épuré et professionnel** tout en gardant toutes les fonctionnalités (drag & drop, création, édition, etc.).

## 🎨 Palette de couleurs pastel

### Couleurs principales
```css
RDV:         #C7D2FE (Violet pastel doux)
EVENT:       #FBC4E4 (Rose pastel)
PREVIEW:     #FEF3C7 (Jaune pastel doux)
PUBLICATION: #BFDBFE (Bleu ciel pastel)
TOURNAGE:    #FED7AA (Orange/pêche pastel)
```

### Couleurs pour la vue compacte (overview)
```css
RDV:         #EEF2FF (Violet ultra-light)
EVENT:       #FCE7F3 (Rose ultra-light)
PREVIEW:     #FEFCE8 (Jaune ultra-light)
PUBLICATION: #EFF6FF (Bleu ultra-light)
TOURNAGE:    #FFF7ED (Orange ultra-light)
```

## 📐 Caractéristiques du design

### Border-radius (coins arrondis)
- **Événements** : 16px (très arrondi comme dans l'image)
- **Vue mois** : 12px
- **Vue semaine/jour** : 14px
- **Légende** : 8px (border-radius-lg)

### Espacement et padding
- **Événements principaux** : `8px 12px`
- **Vue mois** : `6px 10px`
- **Marges entre événements** : `3px 4px`
- **Hauteur minimale des lignes** : 100px (vue mois), 50px (vue semaine)

### Typographie
- **Taille événements** : 13px (principal), 12px (vue mois)
- **Font-weight** : 500 (medium)
- **Line-height** : 1.4
- **Headers** : 14px, font-weight 600

### Ombres
- **Événements** : `0 1px 2px rgba(0,0,0,0.06)` (très subtile)
- Pas d'ombre portée agressive

## 🎯 Fonctionnalités conservées

Toutes les features actuelles sont **100% fonctionnelles** :

✅ **Drag & Drop** : Déplacer les événements
✅ **Resize** : Modifier la durée
✅ **Création** : Cliquer sur une plage horaire
✅ **Édition** : Cliquer sur un événement existant
✅ **Suppression** : Via le modal de détails
✅ **Vues multiples** : Mois / Semaine / Jour
✅ **Navigation** : Flèches et bouton "Aujourd'hui"
✅ **Création auto** : Événements PREVIEW/PUBLICATION depuis collaborations

## 🔧 Comment customiser davantage

### 1. Changer les couleurs

Dans `talent-calendar.tsx`, cherchez `eventStyleGetter` :

```typescript
const colors: Record<string, { bg: string; text: string }> = {
  RDV: { 
    bg: "#VOTRE_COULEUR", 
    text: "#COULEUR_TEXTE" 
  },
  // ...
};
```

### 2. Ajuster les border-radius

Dans le `<style jsx global>` :

```css
.calendar-modern .rbc-event {
  border-radius: 16px !important; /* Modifier ici */
}
```

### 3. Modifier l'espacement

```css
.calendar-modern .rbc-event {
  padding: 8px 12px !important; /* Ajuster */
  margin: 3px 4px !important;   /* Ajuster */
}
```

### 4. Changer la hauteur des slots

```css
.calendar-modern .rbc-time-slot {
  min-height: 50px; /* Modifier pour plus/moins d'espace */
}
```

### 5. Ajouter de nouveaux types d'événements

1. **Ajouter dans le type TypeScript** :
```typescript
type: "RDV" | "EVENT" | "PREVIEW" | "PUBLICATION" | "TOURNAGE" | "NOUVEAU_TYPE"
```

2. **Ajouter la couleur** :
```typescript
NOUVEAU_TYPE: { 
  bg: "#COULEUR", 
  text: "#TEXTE" 
}
```

3. **Ajouter dans le formulaire** :
```tsx
<option value="NOUVEAU_TYPE">Nouveau Type</option>
```

4. **Ajouter dans la légende** :
```tsx
<div className="flex items-center gap-2">
  <div className="w-4 h-4 rounded-lg" style={{ background: "#COULEUR" }}></div>
  <span className="text-sm text-black/70 font-medium">NOUVEAU TYPE</span>
</div>
```

5. **Mettre à jour le schema.ts** (commentaire uniquement)

## 🎨 Palettes de couleurs alternatives

### Option 1 : Couleurs vives mais élégantes
```css
RDV:         #A78BFA (Violet plus intense)
EVENT:       #F472B6 (Rose plus vif)
PREVIEW:     #FDE047 (Jaune éclatant)
PUBLICATION: #60A5FA (Bleu plus fort)
TOURNAGE:    #FB923C (Orange plus chaud)
```

### Option 2 : Tons neutres et professionnels
```css
RDV:         #E5E7EB (Gris clair)
EVENT:       #D1D5DB (Gris moyen)
PREVIEW:     #FEF3C7 (Jaune doux)
PUBLICATION: #DBEAFE (Bleu très pâle)
TOURNAGE:    #FED7AA (Pêche doux)
```

### Option 3 : Style sombre (pour thème dark)
```css
RDV:         #4C1D95 (Violet foncé)
EVENT:       #831843 (Rose foncé)
PREVIEW:     #78350F (Jaune/marron)
PUBLICATION: #1E3A8A (Bleu marine)
TOURNAGE:    #9A3412 (Orange brûlé)
```

## 📱 Responsive

Le design est **automatiquement responsive** grâce à react-big-calendar. Les événements s'adaptent aux différentes tailles d'écran.

## 🚀 Améliorations futures possibles

### Fonctionnalités avancées
1. **Vue agenda** : Liste des événements à venir
2. **Filtres par type** : Afficher/masquer certains types
3. **Recherche** : Trouver un événement par nom
4. **Export** : Télécharger en PDF ou iCal
5. **Récurrence** : Événements répétitifs
6. **Rappels** : Notifications avant l'événement
7. **Multi-talents** : Voir plusieurs planning en même temps

### Améliorations visuelles
1. **Animations** : Transitions fluides lors du drag & drop
2. **Tooltips** : Info-bulle au survol
3. **Avatars** : Photos des participants sur les événements
4. **Badges** : Icônes selon le type d'événement
5. **Timeline** : Vue chronologique linéaire
6. **Mini-calendrier** : Navigation par mois/année

## 🎓 Documentation react-big-calendar

Le calendrier utilise **react-big-calendar** :
- Documentation : https://jquense.github.io/react-big-calendar/
- GitHub : https://github.com/jquense/react-big-calendar

Pour des customisations avancées, consultez :
- `eventPropGetter` : Style dynamique par événement
- `slotPropGetter` : Style dynamique par plage horaire
- `dayPropGetter` : Style dynamique par jour
- `components` : Remplacer les composants internes

## 💡 Conseils

1. **Testez les couleurs** : Utilisez un outil comme Coolors.co pour créer des palettes harmonieuses
2. **Contraste** : Vérifiez que le texte est lisible sur le fond (ratio 4.5:1 minimum)
3. **Cohérence** : Gardez le même style de border-radius partout
4. **Performance** : Limitez les ombres et effets pour de meilleures performances avec beaucoup d'événements

---

**Design actuel** : Moderne, pastel, épuré, professionnel ✨
**Customisable** : 100% personnalisable via CSS et TypeScript 🎨
**Fonctionnel** : Toutes les features conservées 🚀




