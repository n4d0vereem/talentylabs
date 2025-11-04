// Gestion des paramètres de l'agence dans localStorage

export interface AgencySettings {
  name: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  useDefaultColors: boolean;
}

const STORAGE_KEY = 'pomelo_agency_settings';

// Paramètres par défaut (Eidoles)
const defaultSettings: AgencySettings = {
  name: "Eidoles",
  logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsR1VIXKGXfimfGgz9qZwKSm6mMmXoRla5Dw&s",
  primaryColor: "#000000",
  secondaryColor: "#ff6b35",
  useDefaultColors: true,
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
  
  // Appliquer les couleurs au document
  applyColors(updated);
  
  return updated;
}

// Appliquer les couleurs personnalisées
export function applyColors(settings: AgencySettings) {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  if (settings.useDefaultColors) {
    // Couleurs par défaut (noir et orange)
    root.style.setProperty('--agency-primary', '#000000');
    root.style.setProperty('--agency-secondary', '#ff6b35');
  } else {
    // Couleurs personnalisées
    root.style.setProperty('--agency-primary', settings.primaryColor);
    root.style.setProperty('--agency-secondary', settings.secondaryColor);
  }
}

// Réinitialiser aux paramètres par défaut
export function resetAgencySettings(): AgencySettings {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
  applyColors(defaultSettings);
  return defaultSettings;
}

// Initialiser les couleurs au chargement
export function initializeColors() {
  const settings = getAgencySettings();
  applyColors(settings);
}

