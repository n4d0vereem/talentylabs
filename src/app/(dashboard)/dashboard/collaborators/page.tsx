'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Mail, CheckCircle, Ban, Clock, UserCheck, Trash2, XCircle, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  type?: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
  userId?: string; // ID du user associé pour les assignations
  assignedTalents?: Array<{ id: string; firstName: string; lastName: string; image?: string }>;
}

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  invitedBy: { name: string; email: string };
}

export default function CollaboratorsPage() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'TALENT_MANAGER',
    firstName: '',
    lastName: '',
    phone: '',
    type: 'Interne' as 'Interne' | 'Freelance' | 'Prestataire',
    talentId: '' // Pour assigner un talent spécifique si role === TALENT
  });
  const [inviting, setInviting] = useState(false);
  
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);
  const [talents, setTalents] = useState<any[]>([]);
  const [assignedTalentIds, setAssignedTalentIds] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);
  
  // 1. Charger les données
  useEffect(() => {
    async function loadData() {
      await loadTalents();
      await loadCollaborators();
    }
    loadData();
  }, []);
  
  async function loadTalents() {
    try {
      const res = await fetch('/api/talents');
      const data = await res.json();
      if (data.success) {
        setTalents(data.talents || []);
      }
    } catch (err) {
      console.error('Erreur chargement talents:', err);
    }
  }
  
  async function loadCollaborators() {
    try {
      const res = await fetch('/api/collaborators');
      const data = await res.json();
      
      if (data.success) {
        const collabs = data.collaborators || [];
        
        // Charger les talents assignés pour chaque collaborateur
        const collabsWithTalents = await Promise.all(
          collabs.map(async (collab: Collaborator) => {
            if (collab.userId && collab.status === 'ACTIVE') {
              try {
                const talentsRes = await fetch(`/api/collaborators/${collab.userId}/talents`);
                const talentsData = await talentsRes.json();
                if (talentsData.success && talentsData.talents) {
                  return { ...collab, assignedTalents: talentsData.talents };
                }
              } catch (err) {
                console.error('Erreur chargement talents pour', collab.name, err);
              }
            }
            return { ...collab, assignedTalents: [] };
          })
        );
        
        setCollaborators(collabsWithTalents);
        setInvitations(data.invitations || []);
      }
    } catch (err) {
      console.error('Erreur chargement collaborateurs:', err);
    } finally {
      setLoading(false);
    }
  }
  
  // 2. Inviter un collaborateur
  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    
    // Validation : si TALENT, un talent doit être sélectionné
    if (inviteForm.role === 'TALENT' && !inviteForm.talentId) {
      alert('⚠️ Veuillez sélectionner un talent à assigner');
      return;
    }
    
    setInviting(true);
    
    try {
      const res = await fetch('/api/collaborators/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm)
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert(`✅ Invitation envoyée à ${inviteForm.email} !`);
        setInviteDialogOpen(false);
        setInviteForm({ 
          email: '', 
          role: 'TALENT_MANAGER',
          firstName: '',
          lastName: '',
          phone: '',
          type: 'Interne',
          talentId: ''
        });
        loadCollaborators();
      } else {
        alert(`❌ Erreur : ${data.error}`);
      }
    } catch (err) {
      alert('❌ Erreur lors de l\'envoi de l\'invitation');
    } finally {
      setInviting(false);
    }
  }
  
  // 3. Ouvrir le dialogue d'assignation
  async function handleOpenAssignDialog(collab: Collaborator) {
    setSelectedCollaborator(collab);
    
    // Charger les talents déjà assignés
    try {
      const res = await fetch(`/api/collaborators/${collab.userId}/talents`);
      const data = await res.json();
      if (data.success) {
        setAssignedTalentIds(data.talentIds || []);
      }
    } catch (err) {
      console.error('Erreur chargement assignations:', err);
      setAssignedTalentIds([]);
    }
    
    setAssignDialogOpen(true);
  }
  
  // 4. Sauvegarder les assignations
  async function handleSaveAssignments() {
    if (!selectedCollaborator) return;
    
    setAssigning(true);
    try {
      const res = await fetch(`/api/collaborators/${selectedCollaborator.userId}/assign-talents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ talentIds: assignedTalentIds })
      });
      
      const data = await res.json();
      if (data.success) {
        alert('✅ Talents assignés avec succès !');
        setAssignDialogOpen(false);
        // Recharger les collaborateurs pour mettre à jour l'affichage
        await loadCollaborators();
      } else {
        alert(`❌ Erreur : ${data.error}`);
      }
    } catch (err) {
      alert('❌ Erreur lors de l\'assignation');
    } finally {
      setAssigning(false);
    }
  }
  
  // 5. Toggle talent selection
  function toggleTalentSelection(talentId: string) {
    setAssignedTalentIds(prev =>
      prev.includes(talentId)
        ? prev.filter(id => id !== talentId)
        : [...prev, talentId]
    );
  }
  
  // 6. Désactiver un collaborateur
  async function handleDisableCollaborator(userId: string) {
    console.log('⚡ FONCTION APPELÉE - handleDisableCollaborator avec userId:', userId);
    
    // TEMPORAIRE : Pas de confirmation pour tester
    // const shouldProceed = confirm('Voulez-vous vraiment désactiver ce collaborateur ?');
    // console.log('🔔 Confirmation:', shouldProceed);
    // if (!shouldProceed) return;
    
    try {
      console.log('🔄 Désactivation du collaborateur:', userId);
      const res = await fetch(`/api/collaborators/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DISABLED' })
      });
      
      console.log('📡 Réponse status:', res.status);
      const data = await res.json();
      console.log('📦 Réponse data:', data);
      
      if (data.success) {
        alert('✅ Collaborateur désactivé');
        await loadCollaborators();
      } else {
        alert(`❌ Erreur : ${data.error}`);
      }
    } catch (err) {
      console.error('❌ Erreur désactivation:', err);
      alert('❌ Erreur lors de la désactivation');
    }
  }
  
  // 7. Réactiver un collaborateur
  async function handleEnableCollaborator(userId: string) {
    try {
      const res = await fetch(`/api/collaborators/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVE' })
      });
      
      const data = await res.json();
      if (data.success) {
        alert('✅ Collaborateur réactivé');
        loadCollaborators();
      } else {
        alert(`❌ Erreur : ${data.error}`);
      }
    } catch (err) {
      alert('❌ Erreur lors de la réactivation');
    }
  }
  
  // 8. Retirer un collaborateur de l'agence
  async function handleDeleteCollaborator(userId: string) {
    console.log('⚡ FONCTION APPELÉE - handleDeleteCollaborator avec userId:', userId);
    
    // TEMPORAIRE : Pas de confirmation pour tester
    // const shouldProceed = confirm('⚠️ Retirer ce collaborateur de l\'agence ? Il ne perdra pas son compte mais n\'aura plus accès à vos données.');
    // console.log('🔔 Confirmation:', shouldProceed);
    // if (!shouldProceed) return;
    
    try {
      console.log('🔄 Retrait du collaborateur:', userId);
      const res = await fetch(`/api/collaborators/${userId}`, {
        method: 'DELETE'
      });
      
      console.log('📡 Réponse status:', res.status);
      const data = await res.json();
      console.log('📦 Réponse data:', data);
      
      if (data.success) {
        alert('✅ Collaborateur retiré de l\'agence');
        await loadCollaborators();
      } else {
        alert(`❌ Erreur : ${data.error}`);
      }
    } catch (err) {
      console.error('❌ Erreur retrait:', err);
      alert('❌ Erreur lors du retrait');
    }
  }
  
  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-100 rounded w-1/4"></div>
          <div className="h-4 bg-gray-100 rounded w-1/6"></div>
          <div className="h-96 bg-gray-50 rounded-xl border border-gray-200"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Collaborateurs</h1>
          <p className="text-gray-500 mt-1 text-sm">Gérez les accès à votre agence</p>
        </div>
        
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-black hover:bg-gray-800 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Inviter un collaborateur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Inviter un collaborateur</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={inviteForm.firstName}
                    onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                    placeholder="Jean"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={inviteForm.lastName}
                    onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                    placeholder="Dupont"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="collaborateur@example.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={inviteForm.phone}
                  onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
              
              <div>
                <Label htmlFor="role">Rôle d'accès *</Label>
                <select
                  id="role"
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value, talentId: '' })}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="TALENT_MANAGER">Talent Manager</option>
                  <option value="TALENT">Talent (Accès propre page uniquement)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {inviteForm.role === 'TALENT_MANAGER' 
                    ? '✓ Peut gérer plusieurs talents qui lui sont assignés' 
                    : '✓ Peut voir uniquement SA page talent (assignation obligatoire)'}
                </p>
              </div>
              
              {/* Sélection du talent si rôle = TALENT */}
              {inviteForm.role === 'TALENT' && (
                <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 p-3 rounded">
                  <Label htmlFor="talentId" className="text-blue-900">Quel talent est-il ? *</Label>
                  <select
                    id="talentId"
                    value={inviteForm.talentId}
                    onChange={(e) => setInviteForm({ ...inviteForm, talentId: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 mt-2"
                    required
                  >
                    <option value="">-- Sélectionner un talent --</option>
                    {talents.map((talent) => (
                      <option key={talent.id} value={talent.id}>
                        {talent.firstName} {talent.lastName} {talent.category ? `(${talent.category})` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-blue-700 mt-2 font-medium">
                    ⚠️ Ce collaborateur sera automatiquement redirigé vers cette page talent lors de sa connexion.
                  </p>
                </div>
              )}
              
              <div>
                <Label htmlFor="type">Type de collaborateur *</Label>
                <select
                  id="type"
                  value={inviteForm.type}
                  onChange={(e) => setInviteForm({ ...inviteForm, type: e.target.value as any })}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="Interne">Interne</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Prestataire">Prestataire</option>
                </select>
              </div>
              
              <Button type="submit" className="w-full" disabled={inviting}>
                {inviting ? 'Envoi en cours...' : 'Envoyer l\'invitation'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Dialogue d'assignation de talents */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Assigner des talents à {selectedCollaborator?.name}</DialogTitle>
            </DialogHeader>
            
            {talents.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>Aucun talent disponible</p>
                <p className="text-sm mt-2">Créez d'abord des talents depuis l'onglet Talents</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Sélectionnez les talents que {selectedCollaborator?.name} pourra gérer :
                </p>
                
                <div className="space-y-2">
                  {talents.map((talent) => (
                    <label
                      key={talent.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={assignedTalentIds.includes(talent.id)}
                        onChange={() => toggleTalentSelection(talent.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        {talent.image ? (
                          <img
                            src={talent.image}
                            alt={`${talent.firstName} ${talent.lastName}`}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {talent.firstName[0]}{talent.lastName[0]}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {talent.firstName} {talent.lastName}
                          </p>
                          {talent.category && (
                            <p className="text-sm text-gray-500">{talent.category}</p>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    {assignedTalentIds.length} talent(s) sélectionné(s)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setAssignDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleSaveAssignments}
                      disabled={assigning}
                      className="bg-black hover:bg-gray-800 text-white"
                    >
                      {assigning ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Invitations en attente */}
      {invitations.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
            Invitations en attente
          </h2>
          <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
            {invitations.map((inv) => (
              <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{inv.email}</p>
                    <p className="text-sm text-gray-500">
                      {inv.role === 'TALENT_MANAGER' ? 'Talent Manager' : 'Talent'} • 
                      Expire le {new Date(inv.expiresAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Liste des collaborateurs */}
      <div>
        <h2 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
          Équipe
        </h2>
        {collaborators.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-900 font-medium mb-1">Aucun collaborateur</p>
            <p className="text-sm text-gray-500">Commencez par inviter votre premier collaborateur</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Talents</th>
                  <th className="text-right p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {collaborators.map((collab) => (
                  <tr key={collab.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {collab.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{collab.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{collab.email}</td>
                    <td className="p-4 text-sm text-gray-600">{collab.phone || '—'}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {collab.role === 'TALENT_MANAGER' ? 'Talent Manager' : 
                         collab.role === 'ADMIN' ? 'Admin' : 'Talent'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                        {collab.type || 'Interne'}
                      </span>
                    </td>
                    <td className="p-4">
                      {collab.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
                          <span className="h-2 w-2 rounded-full bg-green-500"></span>
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                          <span className="h-2 w-2 rounded-full bg-gray-300"></span>
                          Inactif
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {collab.assignedTalents && collab.assignedTalents.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center -space-x-2">
                            {collab.assignedTalents.slice(0, 3).map((talent, idx) => (
                              <div
                                key={talent.id}
                                className="relative"
                                title={`${talent.firstName} ${talent.lastName}`}
                              >
                                {talent.image ? (
                                  <img
                                    src={talent.image}
                                    alt={`${talent.firstName} ${talent.lastName}`}
                                    className="h-8 w-8 rounded-full object-cover border-2 border-white"
                                  />
                                ) : (
                                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-white">
                                    <span className="text-xs font-medium text-gray-600">
                                      {talent.firstName[0]}{talent.lastName[0]}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                            {collab.assignedTalents.length > 3 && (
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white">
                                <span className="text-xs font-medium text-gray-600">
                                  +{collab.assignedTalents.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                          {collab.role === 'TALENT' && collab.assignedTalents.length === 1 && (
                            <span className="text-sm" title="C'est son propre profil">⭐</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">
                          {collab.role === 'TALENT' ? '⚠️ Non assigné' : 'Aucun'}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Bouton Gérer les talents (UNIQUEMENT pour TALENT_MANAGER actif) */}
                        {collab.role === 'TALENT_MANAGER' && collab.status === 'ACTIVE' && collab.userId && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenAssignDialog(collab)}
                            className="text-xs"
                          >
                            <UserCheck className="h-3 w-3 mr-1" />
                            Gérer
                          </Button>
                        )}
                        
                        {/* Menu dropdown minimaliste */}
                        {collab.userId && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-gray-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('Menu ouvert pour:', collab.name, 'userId:', collab.userId);
                                }}
                              >
                                <MoreVertical className="h-4 w-4 text-gray-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              {collab.status === 'ACTIVE' && (
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    console.log('🔴 Clic Désactiver pour userId:', collab.userId);
                                    handleDisableCollaborator(collab.userId!);
                                  }}
                                  className="text-orange-600 cursor-pointer"
                                >
                                  <Ban className="h-3 w-3 mr-2" />
                                  Désactiver
                                </DropdownMenuItem>
                              )}
                              
                              {collab.status === 'DISABLED' && (
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    console.log('🟢 Clic Réactiver pour userId:', collab.userId);
                                    handleEnableCollaborator(collab.userId!);
                                  }}
                                  className="text-green-600 cursor-pointer"
                                >
                                  <CheckCircle className="h-3 w-3 mr-2" />
                                  Réactiver
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault();
                                  console.log('🗑️ Clic Retirer pour userId:', collab.userId);
                                  handleDeleteCollaborator(collab.userId!);
                                }}
                                className="text-red-600 cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3 mr-2" />
                                Retirer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
