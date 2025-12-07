/**
 * API Client - Helper functions pour appeler l'API depuis le frontend
 */

const API_BASE = "/api";

// ============================================
// TALENTS
// ============================================

export async function getTalents(agencyId: string) {
  const res = await fetch(`${API_BASE}/talents?agencyId=${agencyId}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch talents");
  return res.json();
}

export async function getTalentById(id: string) {
  const res = await fetch(`${API_BASE}/talents/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch talent");
  return res.json();
}

export async function createTalent(data: any) {
  const res = await fetch(`${API_BASE}/talents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create talent");
  return res.json();
}

export async function updateTalent(id: string, data: any) {
  const res = await fetch(`${API_BASE}/talents/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update talent");
  return res.json();
}

export async function deleteTalent(id: string) {
  const res = await fetch(`${API_BASE}/talents/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete talent");
  return res.json();
}

// ============================================
// COLLABORATIONS
// ============================================

export async function getCollaborations(talentId: string) {
  const res = await fetch(`${API_BASE}/collaborations?talentId=${talentId}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch collaborations");
  return res.json();
}

export async function createCollaboration(data: any) {
  const res = await fetch(`${API_BASE}/collaborations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create collaboration");
  return res.json();
}

export async function updateCollaboration(id: string, data: any) {
  const res = await fetch(`${API_BASE}/collaborations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update collaboration");
  return res.json();
}

export async function deleteCollaboration(id: string) {
  const res = await fetch(`${API_BASE}/collaborations/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete collaboration");
  return res.json();
}

export async function reorderCollaborations(orders: { id: string; displayOrder: number }[]) {
  const res = await fetch(`${API_BASE}/collaborations/reorder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ orders }),
  });
  if (!res.ok) throw new Error("Failed to reorder collaborations");
  return res.json();
}

// ============================================
// EVENTS
// ============================================

export async function getEvents(talentId: string) {
  const res = await fetch(`${API_BASE}/events?talentId=${talentId}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

export async function createEvent(data: any) {
  const res = await fetch(`${API_BASE}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create event");
  return res.json();
}

export async function updateEvent(id: string, data: any) {
  const res = await fetch(`${API_BASE}/events/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update event");
  return res.json();
}

export async function deleteEvent(id: string) {
  const res = await fetch(`${API_BASE}/events/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete event");
  return res.json();
}

// ============================================
// AGENCY SETTINGS
// ============================================

export async function getAgencySettings(agencyId: string) {
  const res = await fetch(`${API_BASE}/settings?agencyId=${agencyId}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch agency settings");
  return res.json();
}

export async function updateAgencySettings(agencyId: string, data: any) {
  const res = await fetch(`${API_BASE}/settings?agencyId=${agencyId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update agency settings");
  return res.json();
}

export async function createAgency(data: any) {
  const res = await fetch(`${API_BASE}/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create agency");
  return res.json();
}

// ============================================
// BRANDS
// ============================================

export async function getBrands(agencyId: string) {
  const res = await fetch(`${API_BASE}/brands?agencyId=${agencyId}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch brands");
  return res.json();
}

export async function createBrand(data: any) {
  const res = await fetch(`${API_BASE}/brands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create brand");
  return res.json();
}

export async function updateBrand(id: string, data: any) {
  const res = await fetch(`${API_BASE}/brands/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update brand");
  return res.json();
}

export async function deleteBrand(id: string) {
  const res = await fetch(`${API_BASE}/brands/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete brand");
  return res.json();
}

// ============================================
// CATEGORIES
// ============================================

export async function getCategories(agencyId: string) {
  const res = await fetch(`${API_BASE}/categories?agencyId=${agencyId}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function createCategory(data: any) {
  const res = await fetch(`${API_BASE}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create category");
  return res.json();
}

export async function deleteCategory(id: string) {
  const res = await fetch(`${API_BASE}/categories?id=${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete category");
  return res.json();
}

// ============================================
// INSIGHTS
// ============================================

export async function getInsights(talentId: string) {
  const res = await fetch(`${API_BASE}/insights?talentId=${talentId}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch insights");
  return res.json();
}

export async function saveInsights(data: any) {
  const res = await fetch(`${API_BASE}/insights`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save insights");
  return res.json();
}

// ============================================
// MEDIA KIT
// ============================================

export async function getMediaKit(talentId: string) {
  const res = await fetch(`${API_BASE}/mediakit?talentId=${talentId}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch media kit");
  return res.json();
}

export async function saveMediaKit(data: any) {
  const res = await fetch(`${API_BASE}/mediakit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save media kit");
  return res.json();
}

export async function deleteMediaKit(talentId: string) {
  const res = await fetch(`${API_BASE}/mediakit?talentId=${talentId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete media kit");
  return res.json();
}

// ============================================
// DOCUMENTS
// ============================================

export async function getDocuments(talentId: string) {
  const res = await fetch(`${API_BASE}/documents?talentId=${talentId}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch documents");
  return res.json();
}

export async function createDocument(data: { talentId: string; name: string; fileUrl: string }) {
  const res = await fetch(`${API_BASE}/documents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create document");
  return res.json();
}

export async function deleteDocument(documentId: string) {
  const res = await fetch(`${API_BASE}/documents?documentId=${documentId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete document");
  return res.json();
}

// ============================================
// TODOS
// ============================================

export async function getTodos(talentId: string) {
  const res = await fetch(`${API_BASE}/todos?talentId=${talentId}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch todos");
  return res.json();
}

export async function createTodo(data: { talentId: string; text: string; deadline?: string }) {
  const res = await fetch(`${API_BASE}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create todo");
  return res.json();
}

export async function updateTodo(todoId: string, data: { completed?: boolean; archived?: boolean }) {
  const res = await fetch(`${API_BASE}/todos`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ todoId, ...data }),
  });
  if (!res.ok) throw new Error("Failed to update todo");
  return res.json();
}

export async function deleteTodo(todoId: string) {
  const res = await fetch(`${API_BASE}/todos?todoId=${todoId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete todo");
  return res.json();
}

// ============================================
// USER PROFILE
// ============================================

export async function getUserProfile() {
  const res = await fetch(`${API_BASE}/user/profile`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch user profile");
  return res.json();
}

export async function updateUserProfile(data: { name?: string; email?: string; image?: string }) {
  const res = await fetch(`${API_BASE}/user/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update user profile");
  return res.json();
}

// ============================================
// USER AGENCY (agence de l'utilisateur connecté)
// ============================================

export async function getUserAgency() {
  const res = await fetch(`${API_BASE}/agency`, { credentials: "include" });
  if (!res.ok) {
    if (res.status === 401) {
      // Utilisateur non authentifié → retourner null au lieu de lancer une exception
      return { agency: null };
    }
    if (res.status === 404) {
      // Pas d'agence trouvée → normal pour un nouvel utilisateur
      return { agency: null };
    }
    throw new Error("Failed to fetch user agency");
  }
  return res.json();
}

export async function createUserAgency(data: { name: string; logo?: string; primaryColor?: string }) {
  const res = await fetch(`${API_BASE}/agency`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create agency");
  return res.json();
}

