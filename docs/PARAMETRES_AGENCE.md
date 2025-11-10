# ⚙️ Système de Paramètres de l'Agence

## ✨ Fonctionnalités Ajoutées

### 1️⃣ Page de Paramètres (`/dashboard/settings`)

Une page complète pour personnaliser votre agence :

#### **Informations de l'agence**
- ✅ Nom de l'agence (affiché partout)
- ✅ Logo de l'agence (upload + compression automatique)

#### **Personnalisation des couleurs**
- ✅ 2 couleurs personnalisables :
  - Couleur primaire (boutons, accents principaux)
  - Couleur secondaire (accents secondaires)
- ✅ Option "Par défaut" pour garder les couleurs actuelles (Noir & Orange)
- ✅ Aperçu en temps réel des couleurs

---

## 🎨 Changements Visuels

### Dashboard (`/dashboard`)
**Avant** : "Talents" + Logo Eidoles

**Maintenant** : "Hello [Nom de l'agence] 👋"
```
Hello Eidoles 👋
2 talents · 221K reach
```

### Sidebar
**Avant** : Logo "talentylabs" fixe

**Maintenant** : Logo + nom de l'agence personnalisables
```
[Logo de l'agence]
EIDOLES (ou le nom de votre agence)
```

### Navigation
**Nouveau menu** : "Paramètres" ajouté dans la sidebar

---

## 🗄️ Gestion des Données

### Fichier : `src/lib/agency-settings.ts`

Fonctions disponibles :

#### `getAgencySettings()`
Récupère les paramètres de l'agence depuis localStorage
```typescript
const settings = getAgencySettings();
// { name: "Eidoles", logo: "...", primaryColor: "#000000", ... }
```

#### `updateAgencySettings(settings)`
Met à jour les paramètres et applique les couleurs
```typescript
updateAgencySettings({
  name: "My Agency",
  primaryColor: "#FF0000"
});
```

#### `resetAgencySettings()`
Réinitialise aux paramètres par défaut (Eidoles)

#### `applyColors(settings)`
Applique les couleurs au document via CSS variables

#### `initializeColors()`
Initialise les couleurs au chargement de l'app

---

## 🎯 Structure des Paramètres

```typescript
interface AgencySettings {
  name: string;              // Nom de l'agence
  logo?: string;             // Logo (Base64 compressé)
  primaryColor: string;      // Couleur primaire (hex)
  secondaryColor: string;    // Couleur secondaire (hex)
  useDefaultColors: boolean; // Utiliser couleurs par défaut
}
```

### Paramètres par Défaut
```typescript
{
  name: "Eidoles",
  logo: "https://...",
  primaryColor: "#000000",    // Noir
  secondaryColor: "#ff6b35",  // Orange
  useDefaultColors: true
}
```

---

## 🎨 Variables CSS Personnalisées

Dans `globals.css` :
```css
:root {
  /* Couleurs personnalisables de l'agence */
  --agency-primary: #000000;
  --agency-secondary: #ff6b35;
}
```

Ces variables sont mises à jour dynamiquement quand on change les couleurs dans les paramètres.

---

## 📋 Comment Utiliser

### 1. Accéder aux Paramètres
1. Cliquez sur **"Paramètres"** dans la sidebar
2. Ou allez sur `/dashboard/settings`

### 2. Modifier le Nom de l'Agence
1. Changez le nom dans le champ "Nom de l'agence"
2. Cliquez sur "Sauvegarder les paramètres"
3. La page se recharge automatiquement
4. Le nouveau nom apparaît partout !

### 3. Uploader un Logo
1. Cliquez sur "Uploader un logo"
2. Sélectionnez une image (PNG recommandé)
3. L'image est automatiquement compressée (400x200px max)
4. Cliquez sur "Sauvegarder"
5. Le logo apparaît dans la sidebar !

### 4. Personnaliser les Couleurs
1. Décochez "Utiliser les couleurs par défaut"
2. Choisissez vos couleurs avec les color pickers
3. Prévisualisez en temps réel
4. Cliquez sur "Sauvegarder"
5. Les couleurs sont appliquées partout !

### 5. Réinitialiser
1. Cliquez sur "Réinitialiser"
2. Confirmez
3. Retour aux paramètres par défaut (Eidoles)

---

## 🔄 Où Apparaît le Nom de l'Agence ?

### 1. Dashboard
```
Hello [Nom de l'agence] 👋
```

### 2. Sidebar (en haut)
```
[Logo si disponible]
[Nom de l'agence en majuscules]
```

### 3. Titre des onglets du navigateur (si configuré)

---

## 💾 Persistance

- **LocalStorage Key** : `talentylabs_agency_settings`
- **Format** : JSON compressé
- **Persistance** : Même après refresh/fermeture navigateur
- **Logo** : Compressé en Base64 (PNG @ 90%)

---

## 🎯 Exemples d'Usage

### Agence "Talents Co"
```typescript
{
  name: "Talents Co",
  logo: "data:image/png;base64,...",
  primaryColor: "#2563eb", // Bleu
  secondaryColor: "#f59e0b", // Amber
  useDefaultColors: false
}
```

Dashboard affichera :
```
Hello Talents Co 👋
```

### Agence "Influence Lab"
```typescript
{
  name: "Influence Lab",
  primaryColor: "#7c3aed", // Purple
  secondaryColor: "#ec4899", // Pink
  useDefaultColors: false
}
```

---

## 🔧 Intégration dans Votre Code

Pour utiliser les paramètres dans vos composants :

```typescript
import { getAgencySettings } from "@/lib/agency-settings";

const MyComponent = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const agencySettings = getAgencySettings();
    setSettings(agencySettings);
  }, []);

  return (
    <div>
      <h1>Bienvenue chez {settings?.name}</h1>
    </div>
  );
};
```

---

## ✨ Résultat

Maintenant chaque agence peut :
- ✅ Personnaliser son nom
- ✅ Uploader son logo
- ✅ Choisir ses couleurs de marque
- ✅ Ou garder le design par défaut

Le dashboard devient **vraiment personnel** ! 🎨✨

