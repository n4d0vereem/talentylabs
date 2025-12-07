"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const dynamic = 'force-dynamic';
import { Label } from "@/components/ui/label";
import { Instagram, Phone, FileText, Image, Edit, Save, X, Footprints, TrendingUp, DollarSign, Target, Upload, Users, Heart, Eye, Calendar, Plus, Trash2, Briefcase } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { AvatarUpload } from "@/components/avatar-upload";
import { useState, useEffect } from "react";
import { getTalentById, updateTalent, getInsights, saveInsights, getMediaKit, saveMediaKit, deleteMediaKit, getCollaborations, createCollaboration, updateCollaboration as updateCollaborationAPI, deleteCollaboration as deleteCollaborationAPI, reorderCollaborations, getCategories, getDocuments, createDocument, deleteDocument, getTodos, createTodo, updateTodo, deleteTodo } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { TalentCalendar } from "@/components/talent-calendar";
import { useAgencyId } from "@/lib/temp-agency";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Talent {
  id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  category?: string;
  topSize?: string;
  bottomSize?: string;
  shoeSize?: string;
  foodIntolerances?: string;
  address?: string;
  addressComplement?: string;
  addressSecondary?: string;
  phone?: string;
  email?: string;
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
}

interface Collaboration {
  id: string;
  talentId: string;
  brandId: string;
  marque: string;
  mois: string;
  contenu?: string;
  datePreview?: string;
  datePublication?: string;
  budget: string;
  type: "entrant" | "sortant";
  gestionnaire?: string;
  facture?: string;
  displayOrder?: number;
  statut: "en_cours" | "termine" | "annule";
  createdAt?: string;
}

// Composant pour une ligne draggable
function SortableRow({ collab, onEdit }: { collab: Collaboration; onEdit: (collab: Collaboration) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: collab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`transition-colors ${
        collab.statut === "termine"
          ? "bg-emerald-50/40 hover:bg-emerald-50/60"
          : "hover:bg-black/5"
      }`}
    >
      <td className="px-6 py-4" onClick={() => onEdit(collab)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-black to-black/80 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-white">
              {collab.marque.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <span className="text-sm font-medium text-black">{collab.marque}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-black/70" onClick={() => onEdit(collab)}>{collab.mois}</td>
      <td className="px-6 py-4 text-sm text-black/70 max-w-md" onClick={() => onEdit(collab)}>{collab.contenu || "-"}</td>
      <td className="px-6 py-4 text-sm text-black/70 whitespace-nowrap" onClick={() => onEdit(collab)}>
        {collab.datePreview || "-"}
      </td>
      <td className="px-6 py-4 text-sm text-black/70 whitespace-nowrap" onClick={() => onEdit(collab)}>
        {collab.datePublication || "-"}
      </td>
      <td className="px-6 py-4 text-sm font-medium text-black whitespace-nowrap" onClick={() => onEdit(collab)}>
        {collab.budget}€
      </td>
      <td className="px-6 py-4" onClick={() => onEdit(collab)}>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            collab.type === "entrant"
              ? "bg-green-100 text-green-700"
              : "bg-orange-100 text-orange-700"
          }`}
        >
          {collab.type === "entrant" ? "Entrant" : "Sortant"}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-black/70" onClick={() => onEdit(collab)}>{collab.gestionnaire || "-"}</td>
      <td className="px-6 py-4" onClick={() => onEdit(collab)}>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            collab.statut === "en_cours"
              ? "bg-blue-100 text-blue-700"
              : collab.statut === "termine"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {collab.statut === "en_cours"
            ? "En cours"
            : collab.statut === "termine"
            ? "Terminé"
            : "Annulé"}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-black/70" onClick={() => onEdit(collab)}>{collab.facture || "-"}</td>
      <td className="px-6 py-4 text-right">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(collab);
          }}
          variant="ghost"
          size="sm"
          className="rounded-full hover:bg-black/5"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </td>
    </tr>
  );
}

export default function CreatorProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { agencyId } = useAgencyId();
  const creatorId = params.id as string;
  const activeTab = searchParams.get('tab') || 'overview';
  
  const [creator, setCreator] = useState<Talent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [creatorImage, setCreatorImage] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEditingInsights, setIsEditingInsights] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [mediakitUrl, setMediakitUrl] = useState<string | null>(null);
  const [editedData, setEditedData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    category: "",
    topSize: "",
    bottomSize: "",
    shoeSize: "",
    foodIntolerances: "",
    address: "",
    addressComplement: "",
    addressSecondary: "",
    phone: "",
    email: "",
    location: "",
    bio: "",
    instagram: "",
    tiktok: "",
    snapchat: "",
  });
  const [insightsData, setInsightsData] = useState({
    instagramFollowers: "",
    instagramEngagement: "",
    instagramAvgLikes: "",
    instagramGrowth: "",
    tiktokFollowers: "",
    tiktokEngagement: "",
    tiktokViews: "",
    snapchatFollowers: "",
    snapchatViews: "",
    youtubeSubscribers: "",
    youtubeEngagement: "",
    youtubeAvgViews: "",
  });

  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [isAddingCollab, setIsAddingCollab] = useState(false);
  const [isEditingCollab, setIsEditingCollab] = useState(false);
  const [selectedCollab, setSelectedCollab] = useState<Collaboration | null>(null);
  const [collabFormData, setCollabFormData] = useState({
    marque: "",
    mois: "",
    contenu: "",
    datePreview: "",
    datePublication: "",
    budget: "",
    type: "entrant" as "entrant" | "sortant",
    gestionnaire: "",
    facture: "",
    statut: "en_cours" as "en_cours" | "termine" | "annule",
  });

  // State pour les todos
  interface Todo {
    id: string;
    text: string;
    deadline: string;
    completed: boolean;
    archived: boolean;
  }

  const [todos, setTodos] = useState<Todo[]>([]);
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [newTodoText, setNewTodoText] = useState("");
  const [newTodoDeadline, setNewTodoDeadline] = useState("");

  // State pour les documents
  interface Document {
    id: string;
    talentId: string;
    name: string;
    fileUrl: string;
    uploadedAt: string;
  }

  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);

  // Sensors pour le drag and drop avec press delay
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Gérer la fin du drag
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = collaborations.findIndex((c) => c.id === active.id);
      const newIndex = collaborations.findIndex((c) => c.id === over.id);

      const newCollaborations = arrayMove(collaborations, oldIndex, newIndex);
      setCollaborations(newCollaborations);

      // Sauvegarder le nouvel ordre dans la base de données
      try {
        const orders = newCollaborations.map((collab, index) => ({
          id: collab.id,
          displayOrder: index,
        }));
        await reorderCollaborations(orders);
      } catch (error) {
        console.error("Erreur lors de la sauvegarde de l'ordre:", error);
        // Revenir à l'ordre précédent en cas d'erreur
        setCollaborations(collaborations);
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        if (!agencyId) return;
        
        // Charger les catégories via l'API
        const cats = await getCategories(agencyId);
        setCategories(cats.map((c: any) => c.name));
        
        // Charger le talent via l'API
        const talent = await getTalentById(creatorId);
        if (talent) {
          setCreator(talent);
          setCreatorImage(talent.image || `https://ui-avatars.com/api/?name=${talent.firstName}+${talent.lastName}&size=400&background=random`);
          
          setEditedData({
            firstName: talent.firstName,
            lastName: talent.lastName,
            birthDate: talent.birthDate || "",
            category: talent.category || "",
            topSize: talent.topSize || "",
            bottomSize: talent.bottomSize || "",
            shoeSize: talent.shoeSize || "",
            foodIntolerances: talent.foodIntolerances || "",
            address: talent.address || "",
            addressComplement: talent.addressComplement || "",
            addressSecondary: talent.addressSecondary || "",
            phone: talent.phone || "",
            email: talent.email || "",
            location: talent.location || "",
            bio: talent.bio || "",
            instagram: talent.instagram || "",
            tiktok: talent.tiktok || "",
            snapchat: talent.snapchat || "",
          });

          // Charger les insights via l'API
          const insights = await getInsights(creatorId);
          if (insights && insights.id) {
            setInsightsData({
              instagramFollowers: insights.instagramFollowers || "",
              instagramEngagement: insights.instagramEngagement || "",
              instagramAvgLikes: insights.instagramAvgLikes || "",
              instagramGrowth: insights.instagramGrowth || "+2.5K",
              tiktokFollowers: insights.tiktokFollowers || "",
              tiktokEngagement: insights.tiktokEngagement || "",
              tiktokViews: insights.tiktokViews || "",
              snapchatFollowers: insights.snapchatFollowers || "",
              snapchatViews: insights.snapchatViews || "",
              youtubeSubscribers: insights.youtubeSubscribers || "",
              youtubeEngagement: insights.youtubeEngagement || "",
              youtubeAvgViews: insights.youtubeAvgViews || "",
            });
          } else {
            // Données par défaut depuis instagramData si disponible
            setInsightsData({
              instagramFollowers: talent.instagramData?.followers || "",
              instagramEngagement: talent.instagramData?.engagement || "",
              instagramAvgLikes: talent.instagramData?.avgLikes || "",
              instagramGrowth: "+2.5K",
              tiktokFollowers: "",
              tiktokEngagement: "",
              tiktokViews: "",
              snapchatFollowers: "",
              snapchatViews: "",
              youtubeSubscribers: "",
              youtubeEngagement: "",
              youtubeAvgViews: "",
            });
          }

          // Charger le media kit via l'API
          const mediakit = await getMediaKit(creatorId);
          if (mediakit && mediakit.pdfUrl) {
            setMediakitUrl(mediakit.pdfUrl);
          }

          // Charger les collaborations via l'API
          const collabs = await getCollaborations(creatorId);
          setCollaborations(collabs);

          // Charger les todos via l'API
          const todosData = await getTodos(creatorId);
          setTodos(todosData);

          // Charger les documents via l'API
          const docsData = await getDocuments(creatorId);
          setDocuments(docsData);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [creatorId, agencyId]);

  // Auto-save de l'image dès qu'elle change
  useEffect(() => {
    const saveImage = async () => {
      if (!creator || !creatorImage) return;
      
      // Ne sauvegarder que si l'image a vraiment changé (pas juste le chargement initial)
      if (creatorImage === creator.image || creatorImage.includes('ui-avatars.com')) return;
      
      try {
        console.log("💾 Auto-save de l'image du talent...");
        await updateTalent(creator.id, { image: creatorImage });
        console.log("✅ Image sauvegardée automatiquement");
        
        // Mettre à jour le creator pour refléter le changement
        setCreator({ ...creator, image: creatorImage });
      } catch (error) {
        console.error("Erreur lors de la sauvegarde automatique de l'image:", error);
      }
    };

    // Délai de 500ms pour éviter les saves multiples lors du chargement
    const timer = setTimeout(saveImage, 500);
    return () => clearTimeout(timer);
  }, [creatorImage, creator]);

  const handleSave = async () => {
    if (!creator) return;
    try {
      const updated = await updateTalent(creator.id, {
        firstName: editedData.firstName,
        lastName: editedData.lastName,
        birthDate: editedData.birthDate,
        category: editedData.category,
        topSize: editedData.topSize,
        bottomSize: editedData.bottomSize,
        shoeSize: editedData.shoeSize,
        foodIntolerances: editedData.foodIntolerances,
        address: editedData.address,
        addressComplement: editedData.addressComplement,
        addressSecondary: editedData.addressSecondary,
        phone: editedData.phone,
        email: editedData.email,
        location: editedData.location,
        bio: editedData.bio,
        instagram: editedData.instagram,
        tiktok: editedData.tiktok,
        snapchat: editedData.snapchat,
        image: creatorImage, // Sauvegarder l'image !
      });

      if (updated) {
        setCreator(updated);
        setIsEditMode(false);
        alert("✅ Profil mis à jour !");
      }
    } catch (error) {
      alert("❌ Erreur");
    }
  };

  const handleSaveInsights = async () => {
    if (!creator) return;
    try {
      // Sauvegarder les insights via l'API
      await saveInsights({
        talentId: creator.id,
        ...insightsData,
      });
      setIsEditingInsights(false);
      
      alert("✅ Insights mis à jour !");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des insights:", error);
      alert("❌ Erreur lors de la sauvegarde");
    }
  };

  const handleAddCollaboration = async () => {
    if (!creator) return;
    if (!collabFormData.marque || !collabFormData.mois || !collabFormData.budget) {
      alert("Veuillez remplir au moins la marque, le mois et le budget");
      return;
    }

    try {
      const newCollab = await createCollaboration({
        talentId: creator.id,
        ...collabFormData,
      });

      setCollaborations([...collaborations, newCollab]);
      setIsAddingCollab(false);
      setCollabFormData({
        marque: "",
        mois: "",
        contenu: "",
        datePreview: "",
        datePublication: "",
        budget: "",
        type: "entrant",
        gestionnaire: "",
        facture: "",
        statut: "en_cours",
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout de la collaboration:", error);
      alert("❌ Erreur lors de l'ajout");
    }
  };

  const handleEditCollaboration = (collab: Collaboration) => {
    setSelectedCollab(collab);
    setCollabFormData({
      marque: collab.marque,
      mois: collab.mois,
      contenu: collab.contenu || "",
      datePreview: collab.datePreview || "",
      datePublication: collab.datePublication || "",
      budget: collab.budget,
      type: collab.type,
      gestionnaire: collab.gestionnaire || "",
      facture: collab.facture || "",
      statut: collab.statut,
    });
    setIsEditingCollab(true);
  };

  const handleUpdateCollaboration = async () => {
    if (!creator || !selectedCollab) return;
    if (!collabFormData.marque || !collabFormData.mois || !collabFormData.budget) {
      alert("Veuillez remplir au moins la marque, le mois et le budget");
      return;
    }

    try {
      const updatedCollab = await updateCollaborationAPI(selectedCollab.id, {
        ...collabFormData,
      });

      setCollaborations(collaborations.map(c => c.id === updatedCollab.id ? updatedCollab : c));
      setIsEditingCollab(false);
      setSelectedCollab(null);
      setCollabFormData({
        marque: "",
        mois: "",
        contenu: "",
        datePreview: "",
        datePublication: "",
        budget: "",
        type: "entrant",
        gestionnaire: "",
        facture: "",
        statut: "en_cours",
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la collaboration:", error);
      alert("❌ Erreur lors de la mise à jour");
    }
  };

  const handleDeleteCollaboration = async (collabId: string) => {
    if (!creator) return;
    
    console.log("🗑️ Suppression de la collaboration:", collabId);
    
    try {
      await deleteCollaborationAPI(collabId);
      setCollaborations(collaborations.filter(c => c.id !== collabId));
      console.log("✅ Collaboration supprimée avec succès");
      alert("✅ Collaboration supprimée");
    } catch (error) {
      console.error("❌ Erreur lors de la suppression:", error);
      alert("❌ Erreur lors de la suppression");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafaf9] p-8 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-black/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div>
            <p className="text-xl font-light text-black mb-2">Chargement du profil</p>
            <p className="text-sm text-black/40 font-light">Veuillez patienter...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-[#fafaf9] p-8 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-black/5 rounded-full flex items-center justify-center">
            <span className="text-4xl">😕</span>
          </div>
          <div>
            <h1 className="text-3xl font-light text-black mb-2">Profil non trouvé</h1>
            <p className="text-sm text-black/40 font-light mb-6">
              Ce talent n'existe pas ou a été supprimé
            </p>
            <Link href="/dashboard">
              <Button className="btn-accent rounded-full font-light px-8">
                ← Retour au dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Utiliser les données des insights au lieu des données statiques
  const displayFollowers = insightsData.instagramFollowers || creator.instagramData?.followers || "0";
  const displayEngagement = insightsData.instagramEngagement || creator.instagramData?.engagement || "0%";
  const displayAvgLikes = insightsData.instagramAvgLikes || creator.instagramData?.avgLikes || "0";
  const displayGrowth = insightsData.instagramGrowth || "+0";

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* Header */}
      <div className="border-b border-black/5 bg-white px-4 sm:px-8 py-4 sm:py-6">
        <Link href="/dashboard" className="text-sm text-black/60 hover:text-black font-light mb-4 inline-block pl-12 sm:pl-0">
          ← Retour à la liste
        </Link>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-5 w-full sm:w-auto pl-12 sm:pl-0">
            {/* Photo du talent */}
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-black/5 flex-shrink-0">
              <img 
                src={creatorImage} 
                alt={`${creator.firstName} ${creator.lastName}`}
                className="w-full h-full object-cover"
              />
            </div>
          <div>
              <h1 className="text-2xl sm:text-4xl font-light text-black">
              Hello {creator.firstName} 👋
            </h1>
              <p className="text-xs sm:text-sm text-black/40 font-light mt-1">{creator.category}</p>
            </div>
          </div>
          {activeTab === "overview" && !isEditMode && (
            <Button
              onClick={() => setIsEditMode(true)}
              variant="outline"
              size="sm"
              className="border-black/10 hover:bg-black/5 rounded-full font-light"
            >
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === "overview" && (
          <div>
            {/* Stats globales tous réseaux */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
              <Card className="bg-white border border-black/5 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-black/40" />
                  <p className="text-sm text-black/40 font-light">Followers Instagram</p>
                </div>
                <p className="text-3xl font-light text-black">{displayFollowers}</p>
                <p className="text-xs text-green-600 font-light mt-1">{displayGrowth} ce mois</p>
              </Card>

              <Card className="bg-white border border-black/5 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="w-5 h-5 text-black/40" />
                  <p className="text-sm text-black/40 font-light">Engagement</p>
                </div>
                <p className="text-3xl font-light text-black">{displayEngagement}</p>
                <p className="text-xs text-green-600 font-light mt-1">Excellent</p>
              </Card>

              <Card className="bg-white border border-black/5 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Eye className="w-5 h-5 text-black/40" />
                  <p className="text-sm text-black/40 font-light">Vues TikTok</p>
                </div>
                <p className="text-3xl font-light text-black">{insightsData.tiktokViews || "-"}</p>
                <p className="text-xs text-black/40 font-light mt-1">Vues moyennes</p>
              </Card>

              <Card className="bg-white border border-black/5 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-black/40" />
                  <p className="text-sm text-black/40 font-light">CA Total</p>
                </div>
                <p className="text-3xl font-light text-black">
                  {collaborations.reduce((sum, collab) => sum + parseFloat(collab.budget || "0"), 0).toLocaleString('fr-FR')}€
                </p>
                <p className="text-xs text-black/40 font-light mt-1">{collaborations.length} collaboration{collaborations.length > 1 ? 's' : ''}</p>
              </Card>
            </div>

            {/* Grid 2 colonnes pour Planning/Finance et Todolist */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Colonne gauche: Planning et Finance */}
              <div className="space-y-6">
                {/* Événements à venir - Toutes les collaborations */}
                <Card className="bg-white border border-black/5 rounded-3xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-light text-black">Événements à venir</h3>
                    <Button
                      onClick={() => router.push(`/dashboard/creators/${creator.id}?tab=planning`)}
                      variant="outline"
                      size="sm"
                      className="rounded-xl font-light border-black/10"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Voir le planning complet
                    </Button>
                  </div>
                  
                  {/* Liste scrollable des collaborations */}
                  <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
                    {collaborations.length > 0 ? (
                      collaborations.map((collab) => (
                        <div
                          key={collab.id}
                          className={`rounded-2xl p-4 transition-colors cursor-pointer ${
                            collab.statut === "termine"
                              ? "bg-emerald-50/40 hover:bg-emerald-50/60"
                              : "bg-black/5 hover:bg-black/10"
                          }`}
                          onClick={() => router.push(`/dashboard/creators/${creator.id}?tab=collaborations`)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-black to-black/80 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-medium text-white">
                                  {collab.marque.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-black">{collab.marque}</p>
                                <p className="text-sm text-black/60">{collab.mois}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-black">{parseFloat(collab.budget).toLocaleString('fr-FR')}€</p>
                              {collab.datePublication && (
                                <p className="text-xs text-black/40">{new Date(collab.datePublication).toLocaleDateString('fr-FR')}</p>
                              )}
                            </div>
                          </div>
                          
                          {/* Badges et infos */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                collab.type === "entrant"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {collab.type === "entrant" ? "Entrant" : "Sortant"}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                collab.statut === "en_cours"
                                  ? "bg-blue-100 text-blue-700"
                                  : collab.statut === "termine"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {collab.statut === "en_cours"
                                ? "En cours"
                                : collab.statut === "termine"
                                ? "Terminé"
                                : "Annulé"}
                            </span>
                            {collab.contenu && (
                              <span className="text-xs text-black/60 font-light">
                                {collab.contenu}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-black/40 font-light">Aucune collaboration à venir</p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Finance */}
                <Card className="bg-white border border-black/5 rounded-3xl p-8">
                  <h3 className="text-xl sm:text-2xl font-light text-black mb-4 sm:mb-6">Finance</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-black/40 font-light mb-1">CA cumulé</p>
                      <p className="text-3xl font-light text-black">
                        {collaborations.reduce((sum, collab) => sum + parseFloat(collab.budget || "0"), 0).toLocaleString('fr-FR')}€
                      </p>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-black/5 rounded-xl">
                      <span className="text-sm font-light text-black">Factures en attente</span>
                      <span className="text-lg font-medium text-black">
                        {collaborations.filter(c => c.facture && c.facture.trim() !== "").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-black/5 rounded-xl">
                      <span className="text-sm font-light text-black">Collaborations</span>
                      <span className="text-lg font-medium text-black">{collaborations.length}</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Colonne droite: Todo List */}
              <Card className="bg-white border border-black/5 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-light text-black">To-do List</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsAddingTodo(true)}
                      variant="outline"
                      size="sm"
                      className="rounded-xl font-light border-black/10"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>
                </div>

                {/* Formulaire d'ajout de todo */}
                {isAddingTodo && (
                  <div className="mb-4 p-4 bg-black/5 rounded-2xl space-y-3">
                    <Input
                      placeholder="Nouvelle tâche..."
                      value={newTodoText}
                      onChange={(e) => setNewTodoText(e.target.value)}
                      className="h-10 rounded-xl border-black/10 bg-white"
                    />
                    <Input
                      type="date"
                      value={newTodoDeadline}
                      onChange={(e) => setNewTodoDeadline(e.target.value)}
                      className="h-10 rounded-xl border-black/10 bg-white"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={async () => {
                          if (newTodoText.trim()) {
                            try {
                              const newTodo = await createTodo({
                                talentId: creatorId,
                                text: newTodoText,
                                deadline: newTodoDeadline || undefined,
                              });
                              setTodos([...todos, newTodo]);
                              setNewTodoText("");
                              setNewTodoDeadline("");
                              setIsAddingTodo(false);
                            } catch (error) {
                              console.error("Erreur lors de la création du todo:", error);
                              alert("❌ Erreur lors de la création");
                            }
                          }
                        }}
                        size="sm"
                        className="btn-accent rounded-xl font-light"
                      >
                        Créer
                      </Button>
                      <Button
                        onClick={() => {
                          setIsAddingTodo(false);
                          setNewTodoText("");
                          setNewTodoDeadline("");
                        }}
                        variant="outline"
                        size="sm"
                        className="rounded-xl font-light border-black/10"
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                )}

                {/* Liste des todos actifs */}
                <div className="space-y-2 mb-4">
                  {todos.filter(t => !t.archived).length > 0 ? (
                    todos.filter(t => !t.archived).map((todo) => (
                      <div
                        key={todo.id}
                        className={`group flex items-start gap-3 p-4 rounded-2xl transition-all ${
                          todo.completed 
                            ? "bg-gray-100" 
                            : "bg-black/5 hover:bg-black/10"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={async () => {
                            try {
                              await updateTodo(todo.id, { completed: !todo.completed });
                              setTodos(todos.map(t => 
                                t.id === todo.id ? { ...t, completed: !t.completed } : t
                              ));
                            } catch (error) {
                              console.error("Erreur lors de la mise à jour du todo:", error);
                            }
                          }}
                          className="mt-1 rounded border-black/20 cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className={`text-sm font-light ${
                            todo.completed 
                              ? "text-gray-400 line-through" 
                              : "text-black"
                          }`}>
                            {todo.text}
                          </p>
                          {todo.deadline && (
                            <p className={`text-xs font-light mt-1 ${
                              todo.completed ? "text-gray-300" : "text-black/40"
                            }`}>
                              Échéance: {new Date(todo.deadline).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                        <Button
                          onClick={async () => {
                            try {
                              await updateTodo(todo.id, { archived: true });
                              setTodos(todos.map(t => 
                                t.id === todo.id ? { ...t, archived: true } : t
                              ));
                            } catch (error) {
                              console.error("Erreur lors de l'archivage du todo:", error);
                            }
                          }}
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity rounded-xl text-black/40 hover:text-black"
                        >
                          Archiver
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-black/40 font-light text-sm">Aucune tâche</p>
                    </div>
                  )}
                </div>

                {/* Stats en bas */}
                <div className="flex items-center justify-between pt-4 border-t border-black/5">
                  <p className="text-sm text-black/40 font-light">
                    {todos.filter(t => !t.archived && !t.completed).length} tâche{todos.filter(t => !t.archived && !t.completed).length > 1 ? 's' : ''} restante{todos.filter(t => !t.archived && !t.completed).length > 1 ? 's' : ''}
                  </p>
                  {todos.filter(t => t.archived).length > 0 && (
                    <Button
                      onClick={() => {
                        // Option pour voir les todos archivés
                        alert(`${todos.filter(t => t.archived).length} tâche(s) archivée(s)`);
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-xs text-black/40 hover:text-black font-light"
                    >
                      {todos.filter(t => t.archived).length} archivée{todos.filter(t => t.archived).length > 1 ? 's' : ''}
                    </Button>
                  )}
                </div>
              </Card>
            </div>

            {/* Campaigns Manager - Tableau en bas */}
            <Card className="bg-white border border-black/5 rounded-3xl p-8 mt-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-light text-black">Collaborations</h3>
                  <p className="text-sm text-black/40 font-light">Suivi des campagnes et partenariats</p>
                </div>
                <Button
                  onClick={() => router.push(`/dashboard/creators/${creator.id}?tab=collaborations`)}
                  className="btn-accent rounded-full font-light"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Voir tout
                </Button>
              </div>

              {/* Tableau des collaborations */}
              <div className="space-y-3">
                {collaborations.length > 0 ? (
                  <>
                    {/* Version Desktop - Grid */}
                    <div className="hidden lg:block">
                    <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs text-black/40 font-light uppercase">
                      <div className="col-span-3">Marque</div>
                      <div className="col-span-2">Mois</div>
                      <div className="col-span-2">Contenu</div>
                      <div className="col-span-2">Budget</div>
                      <div className="col-span-2">Type</div>
                      <div className="col-span-1">Statut</div>
                    </div>

                    {collaborations.slice(0, 5).map((collab) => (
                      <div
                        key={collab.id}
                        className={`rounded-2xl p-4 transition-colors cursor-pointer ${
                          collab.statut === "termine"
                            ? "bg-emerald-50/40 hover:bg-emerald-50/60"
                            : "bg-black/5 hover:bg-black/10"
                        }`}
                        onClick={() => router.push(`/dashboard/creators/${creator.id}?tab=collaborations`)}
                      >
                        <div className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-black to-black/80 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-medium text-white">
                                  {collab.marque.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <p className="font-light text-black">{collab.marque}</p>
                            </div>
                          </div>
                          <div className="col-span-2 text-sm text-black/60">{collab.mois}</div>
                          <div className="col-span-2 text-sm text-black/60 truncate">{collab.contenu || "-"}</div>
                          <div className="col-span-2 text-sm font-medium text-black">{parseFloat(collab.budget).toLocaleString('fr-FR')}€</div>
                          <div className="col-span-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                collab.type === "entrant"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {collab.type === "entrant" ? "Entrant" : "Sortant"}
                            </span>
                          </div>
                          <div className="col-span-1">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                collab.statut === "en_cours"
                                  ? "bg-blue-100 text-blue-700"
                                  : collab.statut === "termine"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {collab.statut === "en_cours"
                                ? "En cours"
                                : collab.statut === "termine"
                                ? "Terminé"
                                : "Annulé"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    </div>

                    {/* Version Mobile - Cards épurées */}
                    <div className="lg:hidden space-y-3">
                      {collaborations.slice(0, 5).map((collab) => (
                        <div
                          key={collab.id}
                          className={`rounded-2xl p-4 transition-colors cursor-pointer ${
                            collab.statut === "termine"
                              ? "bg-emerald-50/40 hover:bg-emerald-50/60"
                              : "bg-black/5 hover:bg-black/10"
                          }`}
                          onClick={() => router.push(`/dashboard/creators/${creator.id}?tab=collaborations`)}
                        >
                          {/* Ligne 1: Marque + Budget */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-black to-black/80 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-medium text-white">
                                  {collab.marque.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-black truncate">{collab.marque}</p>
                                <p className="text-xs text-black/60">{collab.mois}</p>
                              </div>
                            </div>
                            <p className="text-lg font-medium text-black ml-3">{parseFloat(collab.budget).toLocaleString('fr-FR')}€</p>
                          </div>

                          {/* Ligne 2: Badges Type + Statut */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                collab.type === "entrant"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {collab.type === "entrant" ? "Entrant" : "Sortant"}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                collab.statut === "en_cours"
                                  ? "bg-blue-100 text-blue-700"
                                  : collab.statut === "termine"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {collab.statut === "en_cours"
                                ? "En cours"
                                : collab.statut === "termine"
                                ? "Terminé"
                                : "Annulé"}
                            </span>
                            {collab.contenu && (
                              <span className="text-xs text-black/60 truncate">{collab.contenu}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {collaborations.length > 5 && (
                      <div className="text-center pt-4">
                        <Button
                          onClick={() => router.push(`/dashboard/creators/${creator.id}?tab=collaborations`)}
                          variant="outline"
                          className="rounded-full font-light border-black/10"
                        >
                          Voir les {collaborations.length - 5} autres collaborations
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-black/5 rounded-2xl p-8 text-center">
                    <p className="text-black/40 font-light mb-4">Aucune collaboration pour le moment</p>
                    <Button
                      onClick={() => router.push(`/dashboard/creators/${creator.id}?tab=collaborations`)}
                      className="btn-accent rounded-full font-light"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Créer une collaboration
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Onglet Planning */}
        {activeTab === "planning" && (
          <div>
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-light text-black mb-2">Planning</h2>
              <p className="text-sm text-black/40 font-light">
                Gérez les rendez-vous et collaborations de {creator.firstName}
              </p>
            </div>
            <TalentCalendar talentId={creator.id} />
          </div>
        )}

        {/* Onglet Collaborations */}
        {activeTab === "collaborations" && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-light text-black mb-2">Collaborations</h2>
                <p className="text-sm text-black/40 font-light">
                  Gérez les partenariats et campagnes de {creator.firstName}
                </p>
              </div>
              <Button
                onClick={() => {
                  // Réinitialiser le formulaire
                  setCollabFormData({
                    marque: "",
                    mois: "",
                    contenu: "",
                    datePreview: "",
                    datePublication: "",
                    budget: "",
                    type: "entrant",
                    gestionnaire: "",
                    facture: "",
                    statut: "en_cours",
                  });
                  setIsEditingCollab(false);
                  setSelectedCollab(null);
                  setIsAddingCollab(true);
                }}
                className="btn-accent rounded-xl font-light"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle collaboration
              </Button>
            </div>

            {/* Tableau des collaborations */}
            <Card className="bg-white border border-black/5 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <table className="w-full">
                    <thead className="bg-black/5">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-black/60 uppercase tracking-wider">Marque</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-black/60 uppercase tracking-wider">Mois</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-black/60 uppercase tracking-wider">Contenu</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-black/60 uppercase tracking-wider">Preview</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-black/60 uppercase tracking-wider">Publication</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-black/60 uppercase tracking-wider">Budget</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-black/60 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-black/60 uppercase tracking-wider">De qui</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-black/60 uppercase tracking-wider">Statut</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-black/60 uppercase tracking-wider">Facture</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-black/60 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <SortableContext
                      items={collaborations.map((c) => c.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <tbody className="divide-y divide-black/5">
                        {collaborations.length > 0 ? (
                          collaborations.map((collab) => (
                            <SortableRow
                              key={collab.id}
                              collab={collab}
                              onEdit={handleEditCollaboration}
                            />
                          ))
                        ) : (
                          <tr>
                            <td colSpan={11} className="px-6 py-12 text-center text-sm text-black/40">
                              Aucune collaboration. Cliquez sur "Nouvelle collaboration" pour en ajouter une.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </SortableContext>
                  </table>
                </DndContext>
              </div>
            </Card>

            {/* Modal Ajout Collaboration */}
            {isAddingCollab && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8">
                <Card className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-light text-black">Nouvelle collaboration</h3>
                    <Button
                      onClick={() => {
                        setIsAddingCollab(false);
                        setCollabFormData({
                          marque: "",
                          mois: "",
                          contenu: "",
                          datePreview: "",
                          datePublication: "",
                          budget: "",
                          type: "entrant",
                          gestionnaire: "",
                          facture: "",
                          statut: "en_cours",
                        });
                      }}
                      variant="ghost"
                      size="sm"
                      className="rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-black/80 font-light">Marque <span className="text-red-500">*</span></Label>
                        <Input
                          value={collabFormData.marque}
                          onChange={(e) => setCollabFormData({...collabFormData, marque: e.target.value})}
                          placeholder="Ex: Nike, Adidas, L'Oréal..."
                          className="mt-2 h-12 rounded-xl border-black/10 bg-black/5 text-base font-light"
                        />
                      </div>
                      <div>
                        <Label className="text-black/80 font-light">Mois <span className="text-red-500">*</span></Label>
                        <select
                          value={collabFormData.mois}
                          onChange={(e) => setCollabFormData({...collabFormData, mois: e.target.value})}
                          className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-black/5 px-4 text-black font-light"
                        >
                          <option value="">Sélectionner...</option>
                          <option value="Janvier">Janvier</option>
                          <option value="Février">Février</option>
                          <option value="Mars">Mars</option>
                          <option value="Avril">Avril</option>
                          <option value="Mai">Mai</option>
                          <option value="Juin">Juin</option>
                          <option value="Juillet">Juillet</option>
                          <option value="Août">Août</option>
                          <option value="Septembre">Septembre</option>
                          <option value="Octobre">Octobre</option>
                          <option value="Novembre">Novembre</option>
                          <option value="Décembre">Décembre</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-black/80 font-light">Contenu</Label>
                      <Input
                        value={collabFormData.contenu}
                        onChange={(e) => setCollabFormData({...collabFormData, contenu: e.target.value})}
                        placeholder="1 TikTok + 1 IG Story..."
                        className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-black/80 font-light">Date de preview</Label>
                        <Input
                          type="date"
                          value={collabFormData.datePreview}
                          onChange={(e) => setCollabFormData({...collabFormData, datePreview: e.target.value})}
                          className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                        />
                      </div>
                      <div>
                        <Label className="text-black/80 font-light">Date de publication</Label>
                        <Input
                          type="date"
                          value={collabFormData.datePublication}
                          onChange={(e) => setCollabFormData({...collabFormData, datePublication: e.target.value})}
                          className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-black/80 font-light">Budget (€) <span className="text-red-500">*</span></Label>
                        <Input
                          type="number"
                          value={collabFormData.budget}
                          onChange={(e) => setCollabFormData({...collabFormData, budget: e.target.value})}
                          placeholder="1000"
                          className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                        />
                      </div>
                      <div>
                        <Label className="text-black/80 font-light">Type</Label>
                        <select
                          value={collabFormData.type}
                          onChange={(e) => setCollabFormData({...collabFormData, type: e.target.value as "entrant" | "sortant"})}
                          className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-black/5 px-4 text-black font-light"
                        >
                          <option value="entrant">Entrant</option>
                          <option value="sortant">Sortant</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-black/80 font-light">De qui</Label>
                        <Input
                          value={collabFormData.gestionnaire}
                          onChange={(e) => setCollabFormData({...collabFormData, gestionnaire: e.target.value})}
                          placeholder="Saona, Andrea..."
                          className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                        />
                      </div>
                      <div>
                        <Label className="text-black/80 font-light">N° Facture</Label>
                        <Input
                          value={collabFormData.facture}
                          onChange={(e) => setCollabFormData({...collabFormData, facture: e.target.value})}
                          placeholder="FACTURE 2025001"
                          className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-black/80 font-light">Statut</Label>
                      <select
                        value={collabFormData.statut}
                        onChange={(e) => setCollabFormData({...collabFormData, statut: e.target.value as "en_cours" | "termine" | "annule"})}
                        className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-black/5 px-4 text-black font-light"
                      >
                        <option value="en_cours">En cours</option>
                        <option value="termine">Terminé</option>
                        <option value="annule">Annulé</option>
                      </select>
                    </div>

                    <Button
                      onClick={handleAddCollaboration}
                      className="w-full btn-accent rounded-xl font-light h-12 mt-6"
                    >
                      Ajouter la collaboration
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Modal Édition Collaboration */}
            {isEditingCollab && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8">
                <Card className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-light text-black">Modifier la collaboration</h3>
                    <Button
                      onClick={() => {
                        setIsEditingCollab(false);
                        setSelectedCollab(null);
                        setCollabFormData({
                          marque: "",
                          mois: "",
                          contenu: "",
                          datePreview: "",
                          datePublication: "",
                          budget: "",
                          type: "entrant",
                          gestionnaire: "",
                          facture: "",
                          statut: "en_cours",
                        });
                      }}
                      variant="ghost"
                      size="sm"
                      className="rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-black/80 font-light">Marque <span className="text-red-500">*</span></Label>
                        <Input
                          value={collabFormData.marque}
                          onChange={(e) => setCollabFormData({...collabFormData, marque: e.target.value})}
                          placeholder="Ex: Nike, Adidas, L'Oréal..."
                          className="mt-2 h-12 rounded-xl border-black/10 bg-black/5 text-base font-light"
                        />
                      </div>
                      <div>
                        <Label className="text-black/80 font-light">Mois <span className="text-red-500">*</span></Label>
                        <select
                          value={collabFormData.mois}
                          onChange={(e) => setCollabFormData({...collabFormData, mois: e.target.value})}
                          className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-black/5 px-4 text-black font-light"
                        >
                          <option value="">Sélectionner...</option>
                          <option value="Janvier">Janvier</option>
                          <option value="Février">Février</option>
                          <option value="Mars">Mars</option>
                          <option value="Avril">Avril</option>
                          <option value="Mai">Mai</option>
                          <option value="Juin">Juin</option>
                          <option value="Juillet">Juillet</option>
                          <option value="Août">Août</option>
                          <option value="Septembre">Septembre</option>
                          <option value="Octobre">Octobre</option>
                          <option value="Novembre">Novembre</option>
                          <option value="Décembre">Décembre</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-black/80 font-light">Contenu</Label>
                      <Input
                        value={collabFormData.contenu}
                        onChange={(e) => setCollabFormData({...collabFormData, contenu: e.target.value})}
                        placeholder="1 TikTok + 1 IG Story..."
                        className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-black/80 font-light">Date de preview</Label>
                        <Input
                          type="date"
                          value={collabFormData.datePreview}
                          onChange={(e) => setCollabFormData({...collabFormData, datePreview: e.target.value})}
                          className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                        />
                      </div>
                      <div>
                        <Label className="text-black/80 font-light">Date de publication</Label>
                        <Input
                          type="date"
                          value={collabFormData.datePublication}
                          onChange={(e) => setCollabFormData({...collabFormData, datePublication: e.target.value})}
                          className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-black/80 font-light">Budget (€) <span className="text-red-500">*</span></Label>
                        <Input
                          type="number"
                          value={collabFormData.budget}
                          onChange={(e) => setCollabFormData({...collabFormData, budget: e.target.value})}
                          placeholder="1000"
                          className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                        />
                      </div>
                      <div>
                        <Label className="text-black/80 font-light">Type</Label>
                        <select
                          value={collabFormData.type}
                          onChange={(e) => setCollabFormData({...collabFormData, type: e.target.value as "entrant" | "sortant"})}
                          className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-black/5 px-4 text-black font-light"
                        >
                          <option value="entrant">Entrant</option>
                          <option value="sortant">Sortant</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-black/80 font-light">De qui</Label>
                        <Input
                          value={collabFormData.gestionnaire}
                          onChange={(e) => setCollabFormData({...collabFormData, gestionnaire: e.target.value})}
                          placeholder="Saona, Andrea..."
                          className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                        />
                      </div>
                      <div>
                        <Label className="text-black/80 font-light">N° Facture</Label>
                        <Input
                          value={collabFormData.facture}
                          onChange={(e) => setCollabFormData({...collabFormData, facture: e.target.value})}
                          placeholder="FACTURE 2025001"
                          className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-black/80 font-light">Statut</Label>
                      <select
                        value={collabFormData.statut}
                        onChange={(e) => setCollabFormData({...collabFormData, statut: e.target.value as "en_cours" | "termine" | "annule"})}
                        className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-black/5 px-4 text-black font-light"
                      >
                        <option value="en_cours">En cours</option>
                        <option value="termine">Terminé</option>
                        <option value="annule">Annulé</option>
                      </select>
                    </div>

                    <div className="flex gap-4 mt-6">
                      <Button
                        onClick={handleUpdateCollaboration}
                        className="flex-1 btn-accent rounded-xl font-light h-12"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Modifier la collaboration
                      </Button>
                      <Button
                        onClick={async () => {
                          if (!selectedCollab) return;
                          
                          console.log("🗑️ Suppression de la collaboration:", selectedCollab.id);
                          
                          try {
                            await deleteCollaborationAPI(selectedCollab.id);
                            setCollaborations(collaborations.filter(c => c.id !== selectedCollab.id));
                            setIsEditingCollab(false);
                            setSelectedCollab(null);
                            setCollabFormData({
                              marque: "",
                              mois: "",
                              contenu: "",
                              datePreview: "",
                              datePublication: "",
                              budget: "",
                              type: "entrant",
                              gestionnaire: "",
                              facture: "",
                              statut: "en_cours",
                            });
                            console.log("✅ Collaboration supprimée avec succès");
                            alert("✅ Collaboration supprimée");
                          } catch (error) {
                            console.error("❌ Erreur lors de la suppression:", error);
                            alert("❌ Erreur lors de la suppression");
                          }
                        }}
                        variant="outline"
                        className="border-red-200 hover:bg-red-50 text-red-600 rounded-xl font-light h-12 px-6"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {activeTab === "insights" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-light text-black mb-2">Insights détaillés</h2>
                <p className="text-sm text-black/40 font-light">Statistiques des réseaux sociaux (édition manuelle)</p>
              </div>
              {!isEditingInsights ? (
                <Button
                  onClick={() => setIsEditingInsights(true)}
                  variant="outline"
                  className="border-black/10 hover:bg-black/5 rounded-full font-light"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier les statistiques
                </Button>
              ) : (
                <div className="flex gap-3">
                  <Button
                    onClick={handleSaveInsights}
                    className="btn-accent rounded-full font-light"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                  <Button
                    onClick={() => setIsEditingInsights(false)}
                    variant="outline"
                    className="border-black/10 hover:bg-black/5 rounded-full font-light"
                  >
                    Annuler
                  </Button>
                </div>
              )}
            </div>

            {/* Instagram Insights */}
            <Card className="bg-white border border-black/5 rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <Instagram className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                <h3 className="text-xl sm:text-2xl font-light text-black">Instagram</h3>
              </div>
              
              {isEditingInsights ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label className="text-black/80 font-light">Followers</Label>
                    <Input
                      value={insightsData.instagramFollowers}
                      onChange={(e) => setInsightsData({...insightsData, instagramFollowers: e.target.value})}
                      placeholder="120K"
                      className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                    />
                  </div>
                  <div>
                    <Label className="text-black/80 font-light">Taux d'engagement</Label>
                    <Input
                      value={insightsData.instagramEngagement}
                      onChange={(e) => setInsightsData({...insightsData, instagramEngagement: e.target.value})}
                      placeholder="8.5%"
                      className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                    />
                  </div>
                  <div>
                    <Label className="text-black/80 font-light">Likes moyens</Label>
                    <Input
                      value={insightsData.instagramAvgLikes}
                      onChange={(e) => setInsightsData({...insightsData, instagramAvgLikes: e.target.value})}
                      placeholder="10K"
                      className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                    />
                  </div>
                  <div>
                    <Label className="text-black/80 font-light">Croissance mensuelle</Label>
                    <Input
                      value={insightsData.instagramGrowth}
                      onChange={(e) => setInsightsData({...insightsData, instagramGrowth: e.target.value})}
                      placeholder="+2.5K"
                      className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="p-6 bg-black/5 rounded-2xl">
                    <p className="text-sm text-black/40 font-light mb-2">Followers</p>
                    <p className="text-3xl font-light text-black mb-1">{insightsData.instagramFollowers || "-"}</p>
                  </div>
                  <div className="p-6 bg-black/5 rounded-2xl">
                    <p className="text-sm text-black/40 font-light mb-2">Engagement</p>
                    <p className="text-3xl font-light text-black mb-1">{insightsData.instagramEngagement || "-"}</p>
                  </div>
                  <div className="p-6 bg-black/5 rounded-2xl">
                    <p className="text-sm text-black/40 font-light mb-2">Likes moyens</p>
                    <p className="text-3xl font-light text-black mb-1">{insightsData.instagramAvgLikes || "-"}</p>
                  </div>
                  <div className="p-6 bg-black/5 rounded-2xl">
                    <p className="text-sm text-black/40 font-light mb-2">Croissance</p>
                    <p className="text-3xl font-light text-black mb-1">{insightsData.instagramGrowth || "-"}</p>
                  </div>
                </div>
              )}
            </Card>

            {/* TikTok Insights */}
            <Card className="bg-white border border-black/5 rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-black rounded-lg"></div>
                <h3 className="text-xl sm:text-2xl font-light text-black">TikTok</h3>
              </div>
              
              {isEditingInsights ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div>
                    <Label className="text-black/80 font-light">Followers</Label>
                    <Input
                      value={insightsData.tiktokFollowers}
                      onChange={(e) => setInsightsData({...insightsData, tiktokFollowers: e.target.value})}
                      placeholder="250K"
                      className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                    />
                  </div>
                  <div>
                    <Label className="text-black/80 font-light">Taux d'engagement</Label>
                    <Input
                      value={insightsData.tiktokEngagement}
                      onChange={(e) => setInsightsData({...insightsData, tiktokEngagement: e.target.value})}
                      placeholder="12%"
                      className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                    />
                  </div>
                  <div>
                    <Label className="text-black/80 font-light">Vues moyennes</Label>
                    <Input
                      value={insightsData.tiktokViews}
                      onChange={(e) => setInsightsData({...insightsData, tiktokViews: e.target.value})}
                      placeholder="500K"
                      className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="p-4 sm:p-6 bg-black/5 rounded-2xl">
                    <p className="text-sm text-black/40 font-light mb-2">Followers</p>
                    <p className="text-2xl sm:text-3xl font-light text-black mb-1">{insightsData.tiktokFollowers || "-"}</p>
                  </div>
                  <div className="p-4 sm:p-6 bg-black/5 rounded-2xl">
                    <p className="text-sm text-black/40 font-light mb-2">Engagement</p>
                    <p className="text-2xl sm:text-3xl font-light text-black mb-1">{insightsData.tiktokEngagement || "-"}</p>
                  </div>
                  <div className="p-4 sm:p-6 bg-black/5 rounded-2xl">
                    <p className="text-sm text-black/40 font-light mb-2">Vues moyennes</p>
                    <p className="text-2xl sm:text-3xl font-light text-black mb-1">{insightsData.tiktokViews || "-"}</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Snapchat Insights */}
            <Card className="bg-white border border-black/5 rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-yellow-400 rounded-lg"></div>
                <h3 className="text-xl sm:text-2xl font-light text-black">Snapchat</h3>
              </div>
              
              {isEditingInsights ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label className="text-black/80 font-light">Abonnés</Label>
                    <Input
                      value={insightsData.snapchatFollowers}
                      onChange={(e) => setInsightsData({...insightsData, snapchatFollowers: e.target.value})}
                      placeholder="50K"
                      className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                    />
                  </div>
                  <div>
                    <Label className="text-black/80 font-light">Vues moyennes</Label>
                    <Input
                      value={insightsData.snapchatViews}
                      onChange={(e) => setInsightsData({...insightsData, snapchatViews: e.target.value})}
                      placeholder="30K"
                      className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-4 sm:p-6 bg-black/5 rounded-2xl">
                    <p className="text-sm text-black/40 font-light mb-2">Abonnés</p>
                    <p className="text-2xl sm:text-3xl font-light text-black mb-1">{insightsData.snapchatFollowers || "-"}</p>
                  </div>
                  <div className="p-4 sm:p-6 bg-black/5 rounded-2xl">
                    <p className="text-sm text-black/40 font-light mb-2">Vues moyennes</p>
                    <p className="text-2xl sm:text-3xl font-light text-black mb-1">{insightsData.snapchatViews || "-"}</p>
                  </div>
                </div>
              )}
            </Card>

            {/* YouTube Insights */}
            <Card className="bg-white border border-black/5 rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-600 rounded-lg flex items-center justify-center">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-light text-black">YouTube</h3>
              </div>
              
              {isEditingInsights ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div>
                    <Label className="text-black/80 font-light">Abonnés</Label>
                    <Input
                      value={insightsData.youtubeSubscribers}
                      onChange={(e) => setInsightsData({...insightsData, youtubeSubscribers: e.target.value})}
                      placeholder="100K"
                      className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                    />
                  </div>
                  <div>
                    <Label className="text-black/80 font-light">Taux d'engagement</Label>
                    <Input
                      value={insightsData.youtubeEngagement}
                      onChange={(e) => setInsightsData({...insightsData, youtubeEngagement: e.target.value})}
                      placeholder="8%"
                      className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                    />
                  </div>
                  <div>
                    <Label className="text-black/80 font-light">Vues moyennes</Label>
                    <Input
                      value={insightsData.youtubeAvgViews}
                      onChange={(e) => setInsightsData({...insightsData, youtubeAvgViews: e.target.value})}
                      placeholder="50K"
                      className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="p-4 sm:p-6 bg-black/5 rounded-2xl">
                    <p className="text-sm text-black/40 font-light mb-2">Abonnés</p>
                    <p className="text-2xl sm:text-3xl font-light text-black mb-1">{insightsData.youtubeSubscribers || "-"}</p>
                  </div>
                  <div className="p-4 sm:p-6 bg-black/5 rounded-2xl">
                    <p className="text-sm text-black/40 font-light mb-2">Engagement</p>
                    <p className="text-2xl sm:text-3xl font-light text-black mb-1">{insightsData.youtubeEngagement || "-"}</p>
                  </div>
                  <div className="p-4 sm:p-6 bg-black/5 rounded-2xl">
                    <p className="text-sm text-black/40 font-light mb-2">Vues moyennes</p>
                    <p className="text-2xl sm:text-3xl font-light text-black mb-1">{insightsData.youtubeAvgViews || "-"}</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === "mediakit" && (
          <Card className="bg-white border border-black/5 rounded-3xl p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-light text-black mb-2">Kit Média</h2>
                <p className="text-sm text-black/40 font-light">
                  Document PDF à destination des marques pour les négociations
                </p>
              </div>
            </div>

            {mediakitUrl ? (
              <div className="space-y-6">
                {/* Preview du PDF */}
                <div className="border-2 border-black/10 rounded-2xl overflow-hidden bg-white">
                  <div className="bg-black/5 p-4 border-b border-black/10">
                    <p className="text-sm text-black/60 font-light">
                      📄 Prévisualisation du Kit Média
                    </p>
                  </div>
                  <object
                    data={mediakitUrl}
                    type="application/pdf"
                    className="w-full h-[600px]"
                  >
                    <embed
                      src={mediakitUrl}
                      type="application/pdf"
                      className="w-full h-[600px]"
                    />
                  </object>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <a
                    href={mediakitUrl}
                    download={`MediaKit_${creator?.firstName}_${creator?.lastName}.pdf`}
                    className="flex-1"
                  >
                    <Button className="w-full btn-accent rounded-full font-light">
                      <Upload className="w-4 h-4 mr-2" />
                      Télécharger le Kit Média
                    </Button>
                  </a>
                  <Button
                    type="button"
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      console.log("🗑️ Début de la suppression");
                      console.log("creatorId:", creatorId);
                      console.log("mediakitUrl:", mediakitUrl);
                      
                      try {
                        console.log("📡 Appel de l'API deleteMediaKit...");
                        const result = await deleteMediaKit(creatorId);
                        console.log("✅ Résultat de la suppression:", result);
                        
                        setMediakitUrl(null);
                        alert("✅ Kit Média supprimé avec succès !");
                      } catch (error: any) {
                        console.error("❌ Erreur lors de la suppression:", error);
                        alert(`❌ Erreur: ${error.message}`);
                      }
                    }}
                    variant="outline"
                    className="border-red-200 hover:bg-red-50 text-red-600 rounded-full font-light"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-black/5 rounded-full flex items-center justify-center">
                  <FileText className="w-12 h-12 text-black/20" />
                </div>
                <h3 className="text-xl font-light text-black mb-2">
                  Aucun Kit Média
                </h3>
                <p className="text-sm text-black/40 font-light mb-6">
                  Uploadez un PDF pour créer le Kit Média du talent
                </p>
                <label className="cursor-pointer inline-block">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      if (file.type !== "application/pdf") {
                        alert("Veuillez sélectionner un fichier PDF");
                        return;
                      }

                      try {
                        const reader = new FileReader();
                        reader.onload = async (event) => {
                          const pdfUrl = event.target?.result as string;
                          await saveMediaKit({
                            talentId: creatorId,
                            pdfUrl,
                          });
                          setMediakitUrl(pdfUrl);
                          alert("✅ Kit Média uploadé avec succès !");
                        };
                        reader.readAsDataURL(file);
                      } catch (error) {
                        console.error("Erreur lors de l'upload du media kit:", error);
                        alert("❌ Erreur lors de l'upload");
                      }
                    }}
                    className="hidden"
                  />
                  <div className="btn-accent rounded-full font-light inline-flex items-center px-6 py-3 cursor-pointer hover:opacity-90 transition-opacity">
                    <Upload className="w-4 h-4 mr-2" />
                    Uploader le Kit Média (PDF)
                  </div>
                </label>
              </div>
            )}
          </Card>
        )}

        {activeTab === "content" && (
          <Card className="bg-white border border-black/5 rounded-3xl p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-light text-black mb-2">Content Library</h2>
                <p className="text-sm text-black/40 font-light">Photos et contenus du talent</p>
              </div>
              <Button className="btn-accent rounded-full font-light">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="aspect-square bg-black/5 rounded-2xl hover:bg-black/10 transition-colors cursor-pointer"></div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === "documents" && (
          <Card className="bg-white border border-black/5 rounded-3xl p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-light text-black mb-2">Documents</h2>
                <p className="text-sm text-black/40 font-light">Documents officiels du talent (passeport, ID, contrats, etc.)</p>
              </div>
              <div>
                <input
                  id="document-upload-input"
                  type="file"
                  accept=".pdf,image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const docName = prompt("Nom du document (ex: Passeport, Carte d'identité, Contrat):", "");
                    if (!docName || !docName.trim()) {
                      alert("Veuillez saisir un nom pour le document");
                      e.target.value = ""; // Reset input
                      return;
                    }

                    setIsUploadingDocument(true);
                    try {
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const fileUrl = event.target?.result as string;
                        const newDoc = await createDocument({
                          talentId: creatorId,
                          name: docName.trim(),
                          fileUrl,
                        });
                        setDocuments([...documents, newDoc]);
                        alert("✅ Document uploadé avec succès !");
                        e.target.value = ""; // Reset input for next upload
                      };
                      reader.readAsDataURL(file);
                    } catch (error) {
                      console.error("Erreur lors de l'upload du document:", error);
                      alert("❌ Erreur lors de l'upload");
                      e.target.value = ""; // Reset input
                    } finally {
                      setIsUploadingDocument(false);
                    }
                  }}
                  className="hidden"
                />
                <Button 
                  type="button"
                  onClick={() => {
                    document.getElementById('document-upload-input')?.click();
                  }}
                  className="btn-accent rounded-full font-light" 
                  disabled={isUploadingDocument}
                >
                <Upload className="w-4 h-4 mr-2" />
                  {isUploadingDocument ? "Upload en cours..." : "Ajouter un document"}
              </Button>
            </div>
            </div>

            <div className="space-y-3">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <div key={doc.id} className="p-6 bg-black/5 rounded-2xl flex items-center justify-between hover:bg-black/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-black to-black/80 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-black">{doc.name}</p>
                        <p className="text-sm text-black/40 font-light">
                          Uploadé le {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={doc.fileUrl}
                        download={`${doc.name}.pdf`}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl font-light border-black/10"
                        >
                          Télécharger
                        </Button>
                      </a>
                      <Button
                        onClick={async () => {
                          if (confirm(`Supprimer "${doc.name}" ?`)) {
                            try {
                              await deleteDocument(doc.id);
                              setDocuments(documents.filter(d => d.id !== doc.id));
                              alert("✅ Document supprimé");
                            } catch (error) {
                              console.error("Erreur lors de la suppression:", error);
                              alert("❌ Erreur lors de la suppression");
                            }
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="rounded-xl font-light border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 bg-black/5 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                    <FileText className="w-16 h-16 text-black/20 mx-auto mb-4" />
                    <p className="font-light text-black/40 mb-2">Aucun document</p>
                    <p className="text-sm text-black/30 font-light">Cliquez sur "Ajouter un document" pour uploader</p>
                </div>
              </div>
              )}
            </div>
          </Card>
        )}

        {activeTab === "info" && (
          <div className="space-y-6">
            {/* Header avec bouton Sauvegarder */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-light text-black mb-2">Informations personnelles</h2>
                <p className="text-sm text-black/40 font-light">Modifier les informations du talent</p>
              </div>
              <Button onClick={handleSave} className="btn-accent rounded-full font-light whitespace-nowrap">
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
            </div>

            {/* Informations générales */}
            <Card className="bg-white border border-black/5 rounded-3xl p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl font-light text-black mb-4 sm:mb-6">Informations générales</h3>
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-black/80 font-light">Prénom</Label>
                    <Input
                      value={editedData.firstName}
                      onChange={(e) => setEditedData({...editedData, firstName: e.target.value})}
                      className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                    />
                  </div>
                  <div>
                    <Label className="text-black/80 font-light">Nom</Label>
                    <Input
                      value={editedData.lastName}
                      onChange={(e) => setEditedData({...editedData, lastName: e.target.value})}
                      className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-black/80 font-light">Date de naissance</Label>
                    <Input
                      type="date"
                      value={editedData.birthDate}
                      onChange={(e) => setEditedData({...editedData, birthDate: e.target.value})}
                      className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                    />
                  </div>
                  <div>
                    <Label className="text-black/80 font-light">Catégorie</Label>
                    <select
                      value={editedData.category}
                      onChange={(e) => setEditedData({...editedData, category: e.target.value})}
                      className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-black/5 text-black font-light px-4"
                    >
                      <option value="">Sélectionner...</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            {/* Informations physiques */}
            <Card className="bg-white border border-black/5 rounded-3xl p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl font-light text-black mb-4 sm:mb-6">Informations physiques</h3>
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-black/80 font-light">Taille du haut</Label>
                    <Input
                      value={editedData.topSize}
                      onChange={(e) => setEditedData({...editedData, topSize: e.target.value})}
                      placeholder="S, M, L, XL..."
                      className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                    />
                  </div>
                  <div>
                    <Label className="text-black/80 font-light">Taille du bas</Label>
                    <Input
                      value={editedData.bottomSize}
                      onChange={(e) => setEditedData({...editedData, bottomSize: e.target.value})}
                      placeholder="36, 38, 40..."
                      className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                    />
                  </div>
                  <div>
                    <Label className="text-black/80 font-light">Pointure</Label>
                    <Input
                      value={editedData.shoeSize}
                      onChange={(e) => setEditedData({...editedData, shoeSize: e.target.value})}
                      placeholder="38"
                      className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-black/80 font-light">Intolérances alimentaires</Label>
                  <Input
                    value={editedData.foodIntolerances}
                    onChange={(e) => setEditedData({...editedData, foodIntolerances: e.target.value})}
                    placeholder="Gluten, lactose, fruits à coque..."
                    className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                  />
                </div>
              </div>
            </Card>

            {/* Coordonnées */}
            <Card className="bg-white border border-black/5 rounded-3xl p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl font-light text-black mb-4 sm:mb-6">Coordonnées</h3>
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <Label className="text-black/80 font-light">Adresse complète</Label>
                  <Input
                    value={editedData.address}
                    onChange={(e) => setEditedData({...editedData, address: e.target.value})}
                    placeholder="123 Rue de la Paix, 75001 Paris"
                    className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                  />
                </div>

                <div>
                  <Label className="text-black/80 font-light">Complément d'adresse</Label>
                  <Input
                    value={editedData.addressComplement}
                    onChange={(e) => setEditedData({...editedData, addressComplement: e.target.value})}
                    placeholder="Appartement 3B, 2ème étage, Porte gauche..."
                    className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                  />
                </div>

                <div>
                  <Label className="text-black/80 font-light">Adresse secondaire</Label>
                  <Input
                    value={editedData.addressSecondary}
                    onChange={(e) => setEditedData({...editedData, addressSecondary: e.target.value})}
                    placeholder="45 Rue de Lyon, 13001 Marseille"
                    className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-black/80 font-light">Téléphone</Label>
                    <Input
                      value={editedData.phone}
                      onChange={(e) => setEditedData({...editedData, phone: e.target.value})}
                      placeholder="+33 6 12 34 56 78"
                      className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                    />
                  </div>
                  <div>
                    <Label className="text-black/80 font-light">Email</Label>
                    <Input
                      value={editedData.email}
                      onChange={(e) => setEditedData({...editedData, email: e.target.value})}
                      placeholder="email@exemple.com"
                      className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Réseaux sociaux */}
            <Card className="bg-white border border-black/5 rounded-3xl p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl font-light text-black mb-4 sm:mb-6">Réseaux sociaux</h3>
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <Label className="text-black/80 font-light flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </Label>
                  <Input
                    value={editedData.instagram}
                    onChange={(e) => setEditedData({...editedData, instagram: e.target.value})}
                    placeholder="https://instagram.com/username"
                    className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                  />
                </div>

                <div>
                  <Label className="text-black/80 font-light">TikTok</Label>
                  <Input
                    value={editedData.tiktok}
                    onChange={(e) => setEditedData({...editedData, tiktok: e.target.value})}
                    placeholder="https://tiktok.com/@username"
                    className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                  />
                </div>

                <div>
                  <Label className="text-black/80 font-light">Snapchat</Label>
                  <Input
                    value={editedData.snapchat}
                    onChange={(e) => setEditedData({...editedData, snapchat: e.target.value})}
                    placeholder="https://snapchat.com/add/username"
                    className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                  />
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Mode édition overlay sur overview */}
      {isEditMode && activeTab === "overview" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <Card className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-light text-black">Modification rapide</h3>
              <Button
                onClick={() => setIsEditMode(false)}
                variant="ghost"
                size="sm"
                className="rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-black/80 font-light">Prénom</Label>
                  <Input
                    value={editedData.firstName}
                    onChange={(e) => setEditedData({...editedData, firstName: e.target.value})}
                    className="mt-2 h-10 rounded-xl border-black/10 bg-black/5"
                  />
                </div>
                <div>
                  <Label className="text-black/80 font-light">Nom</Label>
                  <Input
                    value={editedData.lastName}
                    onChange={(e) => setEditedData({...editedData, lastName: e.target.value})}
                    className="mt-2 h-10 rounded-xl border-black/10 bg-black/5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-black/80 font-light">Téléphone</Label>
                  <Input
                    value={editedData.phone}
                    onChange={(e) => setEditedData({...editedData, phone: e.target.value})}
                    className="mt-2 h-10 rounded-xl border-black/10 bg-black/5"
                  />
                </div>
                <div>
                  <Label className="text-black/80 font-light">Email</Label>
                  <Input
                    value={editedData.email}
                    onChange={(e) => setEditedData({...editedData, email: e.target.value})}
                    className="mt-2 h-10 rounded-xl border-black/10 bg-black/5"
                  />
                </div>
              </div>

              <Button onClick={handleSave} className="w-full btn-accent rounded-full font-light mt-6">
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
