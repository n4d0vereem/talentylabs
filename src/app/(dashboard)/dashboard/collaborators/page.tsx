"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const dynamic = 'force-dynamic';
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import {
  getCollaborators,
  addCollaborator,
  updateCollaborator,
  deleteCollaborator,
  type Collaborator,
  type CollaboratorRole,
  type CollaboratorType,
  type CollaboratorStatus,
} from "@/lib/collaborators-storage";
import { UserPlus, Mail, Phone, X, Edit, Trash2, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const collaboratorSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  role: z.string().min(1, "Le rôle est requis"),
  type: z.string().min(1, "Le type est requis"),
});

type FormData = z.infer<typeof collaboratorSchema>;

export default function CollaboratorsPage() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(collaboratorSchema),
  });

  useEffect(() => {
    loadCollaborators();
  }, []);

  const loadCollaborators = () => {
    setCollaborators(getCollaborators());
  };

  const onSubmit = (data: FormData) => {
    addCollaborator({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      role: data.role as CollaboratorRole,
      type: data.type as CollaboratorType,
      status: "Actif",
    });
    loadCollaborators();
    setIsAddModalOpen(false);
    reset();
  };

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce collaborateur ?")) {
      deleteCollaborator(id);
      loadCollaborators();
    }
  };

  const handleToggleStatus = (id: string) => {
    const collaborator = collaborators.find((c) => c.id === id);
    if (collaborator) {
      updateCollaborator(id, {
        status: collaborator.status === "Actif" ? "Inactif" : "Actif",
      });
      loadCollaborators();
    }
  };

  const toggleSelectAll = () => {
    if (selectedCollaborators.length === collaborators.length) {
      setSelectedCollaborators([]);
    } else {
      setSelectedCollaborators(collaborators.map((c) => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedCollaborators((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
    );
  };

  const filteredCollaborators = collaborators.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(query) ||
      c.lastName.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.role.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* Header */}
      <div className="border-b border-black/5 bg-white px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light text-black">Collaborateurs</h1>
            <p className="text-sm text-black/40 font-light mt-1">
              Gérez votre équipe et leurs accès
            </p>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-accent rounded-full font-light"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Ajouter un collaborateur
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1600px] mx-auto p-8">
        <Card className="bg-white border border-black/5 rounded-3xl overflow-hidden">
          {/* Toolbar */}
          <div className="p-6 border-b border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="pl-10 h-10 rounded-xl border-black/10 bg-black/5 w-[300px]"
                />
              </div>
              {selectedCollaborators.length > 0 && (
                <p className="text-sm text-black/60 font-light">
                  {selectedCollaborators.length} sélectionné(s)
                </p>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-black/5">
                <tr className="text-left">
                  <th className="p-4 w-12">
                    <input
                      type="checkbox"
                      checked={
                        collaborators.length > 0 &&
                        selectedCollaborators.length === collaborators.length
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-black/20"
                    />
                  </th>
                  <th className="p-4 text-xs font-medium text-black/40 uppercase tracking-wide">
                    Nom
                  </th>
                  <th className="p-4 text-xs font-medium text-black/40 uppercase tracking-wide">
                    Rôle
                  </th>
                  <th className="p-4 text-xs font-medium text-black/40 uppercase tracking-wide">
                    Type
                  </th>
                  <th className="p-4 text-xs font-medium text-black/40 uppercase tracking-wide">
                    Email
                  </th>
                  <th className="p-4 text-xs font-medium text-black/40 uppercase tracking-wide">
                    Téléphone
                  </th>
                  <th className="p-4 text-xs font-medium text-black/40 uppercase tracking-wide">
                    Statut
                  </th>
                  <th className="p-4 text-xs font-medium text-black/40 uppercase tracking-wide">
                    Date d'ajout
                  </th>
                  <th className="p-4 text-xs font-medium text-black/40 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCollaborators.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-12 text-center">
                      <p className="text-black/40 font-light">
                        {searchQuery
                          ? "Aucun collaborateur trouvé"
                          : "Aucun collaborateur pour le moment"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCollaborators.map((collaborator, index) => (
                    <tr
                      key={collaborator.id}
                      className={`border-b border-black/5 hover:bg-black/5 transition-colors ${
                        selectedCollaborators.includes(collaborator.id)
                          ? "bg-yellow-50"
                          : ""
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedCollaborators.includes(
                            collaborator.id
                          )}
                          onChange={() => toggleSelect(collaborator.id)}
                          className="w-4 h-4 rounded border-black/20"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center text-black font-light">
                            {collaborator.firstName[0]}
                            {collaborator.lastName[0]}
                          </div>
                          <div>
                            <p className="font-light text-black">
                              {collaborator.firstName} {collaborator.lastName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-light text-black">
                          {collaborator.role}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className="text-xs px-3 py-1 rounded-full bg-black/5 text-black/60 font-light">
                          {collaborator.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-black/60 font-light">
                          <Mail className="w-4 h-4" />
                          {collaborator.email}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-black/60 font-light">
                          {collaborator.phone || "-"}
                        </p>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleStatus(collaborator.id)}
                          className={`text-xs px-3 py-1 rounded-full font-light transition-colors ${
                            collaborator.status === "Actif"
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {collaborator.status}
                        </button>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-black/60 font-light">
                          {new Date(collaborator.addedAt).toLocaleDateString(
                            "fr-FR"
                          )}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-black/5 rounded-lg"
                            onClick={() => handleDelete(collaborator.id)}
                          >
                            <Trash2 className="w-4 h-4 text-black/40" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal Ajouter Collaborateur */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <Card className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-light text-black">
                  Nouveau collaborateur
                </h2>
                <p className="text-sm text-black/40 font-light mt-1">
                  Ajoutez un membre à votre équipe
                </p>
              </div>
              <Button
                onClick={() => {
                  setIsAddModalOpen(false);
                  reset();
                }}
                variant="ghost"
                size="sm"
                className="rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Nom & Prénom */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-black/80 font-light">Prénom</Label>
                  <Input
                    {...register("firstName")}
                    placeholder="Jean"
                    className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-black/80 font-light">Nom</Label>
                  <Input
                    {...register("lastName")}
                    placeholder="Dupont"
                    className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email & Téléphone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-black/80 font-light">Email</Label>
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="jean@exemple.fr"
                    className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-black/80 font-light">Téléphone</Label>
                  <Input
                    {...register("phone")}
                    placeholder="+33 6 12 34 56 78"
                    className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                  />
                </div>
              </div>

              {/* Rôle & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-black/80 font-light">Rôle</Label>
                  <select
                    {...register("role")}
                    className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-black/5 px-4 text-black font-light"
                  >
                    <option value="">Sélectionner...</option>
                    <option value="Talent Manager">Talent Manager</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Responsable Paie">Responsable Paie</option>
                    <option value="Responsable Communication">
                      Responsable Communication
                    </option>
                    <option value="Assistant">Assistant</option>
                    <option value="Directeur">Directeur</option>
                  </select>
                  {errors.role && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.role.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-black/80 font-light">Type</Label>
                  <select
                    {...register("type")}
                    className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-black/5 px-4 text-black font-light"
                  >
                    <option value="">Sélectionner...</option>
                    <option value="Interne">Interne</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Prestataire">Prestataire</option>
                  </select>
                  {errors.type && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.type.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full btn-accent rounded-full font-light h-12"
              >
                Ajouter le collaborateur
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}



