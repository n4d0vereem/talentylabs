export interface Collaboration {
  id: string;
  talentId: string;
  brandId: string; // ID de la marque depuis agency settings
  marque: string; // Nom de la marque (pour compatibilité)
  mois: string; // Mois (ex: "Janvier", "Février")
  contenu: string; // Description du contenu
  datePreview?: string; // Date de preview
  datePublication?: string; // Date de publication
  budget: string; // Budget (ex: "700", "1000")
  type: "entrant" | "sortant"; // Entrant ou Sortant
  gestionnaire: string; // De qui (Saona, Andrea, etc.)
  facture?: string; // Numéro de facture
  statut: "en_cours" | "termine" | "annule"; // Statut
  createdAt: string;
}

const STORAGE_KEY_PREFIX = "talent_collaborations_";

export function getCollaborations(talentId: string): Collaboration[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${talentId}`);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error loading collaborations:", error);
    return [];
  }
}

export function addCollaboration(collaboration: Collaboration): void {
  const collaborations = getCollaborations(collaboration.talentId);
  collaborations.push(collaboration);
  localStorage.setItem(
    `${STORAGE_KEY_PREFIX}${collaboration.talentId}`,
    JSON.stringify(collaborations)
  );
}

export function updateCollaboration(collaboration: Collaboration): void {
  const collaborations = getCollaborations(collaboration.talentId);
  const index = collaborations.findIndex((c) => c.id === collaboration.id);
  if (index !== -1) {
    collaborations[index] = collaboration;
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}${collaboration.talentId}`,
      JSON.stringify(collaborations)
    );
  }
}

export function deleteCollaboration(talentId: string, collaborationId: string): void {
  const collaborations = getCollaborations(talentId);
  const filtered = collaborations.filter((c) => c.id !== collaborationId);
  localStorage.setItem(
    `${STORAGE_KEY_PREFIX}${talentId}`,
    JSON.stringify(filtered)
  );
}

export function getCollaborationById(talentId: string, collaborationId: string): Collaboration | null {
  const collaborations = getCollaborations(talentId);
  return collaborations.find((c) => c.id === collaborationId) || null;
}

