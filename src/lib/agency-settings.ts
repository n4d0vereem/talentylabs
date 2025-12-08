// Gestion des paramètres de l'agence dans localStorage

export interface Brand {
  id: string;
  name: string;
  logo?: string; // URL ou base64
  initials: string; // Ex: "CP" pour Cruel Pancake
  createdAt: string;
}

export interface AgencySettings {
  name: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string; // Garde pour compatibilité mais inutilisé
  useDefaultColors: boolean;
  talentCategories: string[];
  brands: Brand[]; // Liste des marques partenaires
}

const STORAGE_KEY = 'talentylabs_agency_settings';

// Paramètres par défaut (TalentyLabs)
const defaultSettings: AgencySettings = {
  name: "TalentyLabs",
  logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsR1VIXKGXfimfGgz9qZwKSm6mMmXoRla5Dw&s",
  primaryColor: "#000000",
  secondaryColor: "#ff6b35", // Inutilisé mais garde pour compatibilité
  useDefaultColors: true,
  talentCategories: ["Influenceur", "Créateur de contenu", "Artiste", "Sportif", "Mannequin"],
  brands: [],
};

// Récupérer les paramètres de l'agence
export function getAgencySettings(): AgencySettings {
  if (typeof window === 'undefined') return defaultSettings;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
    return defaultSettings;
  }
  
  return JSON.parse(stored);
}

// Mettre à jour les paramètres
export function updateAgencySettings(settings: Partial<AgencySettings>): AgencySettings {
  const current = getAgencySettings();
  const updated = { ...current, ...settings };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  
  // Appliquer la couleur au document
  applyColors(updated);
  
  return updated;
}

// Appliquer la couleur d'accent personnalisée
export function applyColors(settings: AgencySettings) {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  if (settings.useDefaultColors) {
    // Couleur par défaut (noir)
    root.style.setProperty('--agency-primary', '#000000');
  } else {
    // Couleur personnalisée
    root.style.setProperty('--agency-primary', settings.primaryColor);
  }
}

// Réinitialiser aux paramètres par défaut
export function resetAgencySettings(): AgencySettings {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
  applyColors(defaultSettings);
  return defaultSettings;
}

// Initialiser les couleurs au chargement (inutilisé maintenant, garde pour compatibilité)
export function initializeColors() {
  const settings = getAgencySettings();
  applyColors(settings);
}
