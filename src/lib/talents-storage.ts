// Gestion des talents dans localStorage

export interface Talent {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  topSize: string;
  bottomSize: string;
  shoeSize: string;
  address: string;
  phone: string;
  email: string;
  category: string;
  foodIntolerances?: string;
  bio?: string;
  location?: string;
  image?: string;
  instagram?: string;
  tiktok?: string;
  snapchat?: string;
  instagramData?: {
    handle: string;
    followers: string;
    engagement: string;
    avgLikes: string;
  };
  createdAt: string;
}

const STORAGE_KEY = 'talentylabs_talents';

// Talents par défaut (Jade et Saonara)
const defaultTalents: Talent[] = [
  {
    id: "1",
    firstName: "Jade",
    lastName: "Gattoni",
    birthDate: "1998-03-15",
    topSize: "S",
    bottomSize: "38",
    shoeSize: "38",
    address: "12 Rue de la Paix, 75002 Paris, France",
    phone: "+33 6 12 34 56 78",
    email: "jade.gattoni@talentylabs.com",
    category: "Lifestyle & Fashion",
    bio: "Créatrice de contenu passionnée par la mode, le lifestyle et les voyages.",
    location: "Paris, France",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    instagram: "https://www.instagram.com/gattoni.jd",
    tiktok: "https://www.tiktok.com/@gattoni.jd",
    snapchat: "https://www.snapchat.com/add/gattoni_jd",
    instagramData: {
      handle: "@gattoni.jd",
      followers: "127K",
      engagement: "4.8%",
      avgLikes: "6.1K"
    },
    createdAt: "2023-01-15T10:00:00Z"
  },
  {
    id: "2",
    firstName: "Saonara",
    lastName: "Petto",
    birthDate: "1996-07-22",
    topSize: "M",
    bottomSize: "36",
    shoeSize: "37",
    address: "Avenue Princesse Grace, 98000 Monaco",
    phone: "+377 97 98 12 34",
    email: "saonara@talentylabs.com",
    category: "Fashion & Beauty",
    bio: "Influenceuse mode et beauté. Passionnée par les tendances et le style.",
    location: "Monaco",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    instagram: "https://www.instagram.com/saonarapetto",
    tiktok: "https://www.tiktok.com/@saonarapetto",
    instagramData: {
      handle: "@saonarapetto",
      followers: "94.2K",
      engagement: "5.2%",
      avgLikes: "4.9K"
    },
    createdAt: "2022-03-10T10:00:00Z"
  }
];

// Récupérer tous les talents
export function getTalents(): Talent[] {
  if (typeof window === 'undefined') return defaultTalents;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    // Première fois : initialiser avec les talents par défaut
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTalents));
    return defaultTalents;
  }
  
  return JSON.parse(stored);
}

// Récupérer un talent par ID
export function getTalentById(id: string): Talent | undefined {
  const talents = getTalents();
  return talents.find(t => t.id === id);
}

// Ajouter un nouveau talent
export function addTalent(talent: Omit<Talent, 'id' | 'createdAt'>): Talent {
  const talents = getTalents();
  
  const newTalent: Talent = {
    ...talent,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  
  talents.push(newTalent);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(talents));
  
  return newTalent;
}

// Mettre à jour un talent
export function updateTalent(id: string, updates: Partial<Talent>): Talent | null {
  const talents = getTalents();
  const index = talents.findIndex(t => t.id === id);
  
  if (index === -1) return null;
  
  talents[index] = { ...talents[index], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(talents));
  
  return talents[index];
}

// Supprimer un talent
export function deleteTalent(id: string): boolean {
  const talents = getTalents();
  const filtered = talents.filter(t => t.id !== id);
  
  if (filtered.length === talents.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

// Réinitialiser aux talents par défaut
export function resetTalents(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTalents));
}

