// Gestion des collaborateurs dans localStorage

export type CollaboratorRole = 
  | "Talent Manager"
  | "Commercial"
  | "Responsable Paie"
  | "Responsable Communication"
  | "Assistant"
  | "Directeur";

export type CollaboratorType = "Interne" | "Freelance" | "Prestataire";

export type CollaboratorStatus = "Actif" | "Inactif" | "En attente";

export interface Collaborator {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: CollaboratorRole;
  type: CollaboratorType;
  status: CollaboratorStatus;
  phone?: string;
  photo?: string;
  addedAt: string;
  // Préparation pour les droits d'accès futurs
  permissions?: {
    canViewAllTalents: boolean;
    canEditTalents: boolean;
    canViewFinance: boolean;
    canManageCampaigns: boolean;
  };
}

const STORAGE_KEY = "talentylabs_collaborators";

export function getCollaborators(): Collaborator[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading collaborators:", error);
    return [];
  }
}

export function getCollaboratorById(id: string): Collaborator | null {
  const collaborators = getCollaborators();
  return collaborators.find((c) => c.id === id) || null;
}

export function addCollaborator(
  collaborator: Omit<Collaborator, "id" | "addedAt">
): Collaborator {
  const collaborators = getCollaborators();
  const newCollaborator: Collaborator = {
    ...collaborator,
    id: Date.now().toString(),
    addedAt: new Date().toISOString(),
    permissions: collaborator.permissions || {
      canViewAllTalents: true,
      canEditTalents: false,
      canViewFinance: false,
      canManageCampaigns: false,
    },
  };

  collaborators.push(newCollaborator);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collaborators));
  return newCollaborator;
}

export function updateCollaborator(
  id: string,
  updates: Partial<Collaborator>
): Collaborator | null {
  const collaborators = getCollaborators();
  const index = collaborators.findIndex((c) => c.id === id);

  if (index === -1) return null;

  collaborators[index] = { ...collaborators[index], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collaborators));
  return collaborators[index];
}

export function deleteCollaborator(id: string): boolean {
  const collaborators = getCollaborators();
  const filtered = collaborators.filter((c) => c.id !== id);

  if (filtered.length === collaborators.length) return false;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}



