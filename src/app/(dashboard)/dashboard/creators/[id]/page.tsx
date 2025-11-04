"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Instagram, Mail, MapPin, Calendar, Link as LinkIcon, FileText, Image, Edit, Save, X, Phone, Ruler, Weight, Footprints } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { AvatarUpload } from "@/components/avatar-upload";
import { useState, useEffect } from "react";
import { getTalentById, updateTalent, type Talent } from "@/lib/talents-storage";

// Données des créateurs Eidoles
const creatorsData = [
  {
    id: "1",
    firstName: "Jade",
    lastName: "Gattoni",
    nickname: "gattoni.jd",
    birthDate: "1998-03-15",
    height: "172",
    weight: "58",
    shoeSize: "38",
    address: "12 Rue de la Paix, 75002 Paris, France",
    phone: "+33 6 12 34 56 78",
    category: "Lifestyle & Fashion",
    bio: "Créatrice de contenu passionnée par la mode, le lifestyle et les voyages. Collaborations authentiques et créatives.",
    location: "Paris, France",
    email: "jade.gattoni@eidoles.com",
    joinedDate: "Janvier 2023",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    instagram: {
      handle: "@gattoni.jd",
      url: "https://www.instagram.com/gattoni.jd",
      followers: "127K",
      following: "1,245",
      posts: "856",
      engagement: "4.8%",
      avgLikes: "6.1K",
      avgComments: "342",
      avgShares: "89",
      demographics: {
        audience: "18-34 ans (72%)",
        location: "France (68%), Europe (24%)",
        gender: "Femmes (64%), Hommes (36%)"
      }
    },
    tiktok: {
      handle: "@gattoni.jd",
      url: "https://www.tiktok.com/@gattoni.jd"
    },
    snapchat: {
      handle: "gattoni_jd",
      url: "https://www.snapchat.com/add/gattoni_jd"
    },
    links: [
      { name: "Instagram", url: "https://www.instagram.com/gattoni.jd", type: "social" },
      { name: "TikTok", url: "https://www.tiktok.com/@gattoni.jd", type: "social" },
      { name: "Snapchat", url: "https://www.snapchat.com/add/gattoni_jd", type: "social" },
      { name: "Email Pro", url: "mailto:jade.gattoni@eidoles.com", type: "contact" }
    ],
    documents: [
      { name: "Passeport", type: "ID", uploadDate: "15 Jan 2024" },
      { name: "Carte d'identité", type: "ID", uploadDate: "15 Jan 2024" },
      { name: "Contrat Eidoles", type: "Contrat", uploadDate: "10 Jan 2024" },
      { name: "Photo professionnelle", type: "Photo", uploadDate: "20 Fév 2024" }
    ],
    recentCampaigns: [
      { brand: "Louis Vuitton", date: "Oct 2024", performance: "+12% engagement" },
      { brand: "Dior", date: "Sept 2024", performance: "8.2K likes" },
      { brand: "Sézane", date: "Août 2024", performance: "145 conversions" }
    ]
  },
  {
    id: "2",
    firstName: "Saonara",
    lastName: "Petto",
    nickname: "saonarapetto",
    birthDate: "1996-07-22",
    height: "168",
    weight: "55",
    shoeSize: "37",
    address: "Avenue Princesse Grace, 98000 Monaco",
    phone: "+377 97 98 12 34",
    category: "Fashion & Beauty",
    bio: "Influenceuse mode et beauté. Passionnée par les tendances et le style. Partenariats créatifs avec des marques premium.",
    location: "Monaco",
    email: "saonara@eidoles.com",
    joinedDate: "Mars 2022",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    instagram: {
      handle: "@saonarapetto",
      url: "https://www.instagram.com/saonarapetto",
      followers: "94.2K",
      following: "892",
      posts: "743",
      engagement: "5.2%",
      avgLikes: "4.9K",
      avgComments: "298",
      avgShares: "76",
      demographics: {
        audience: "18-34 ans (78%)",
        location: "France (45%), Monaco (22%), Suisse (15%)",
        gender: "Femmes (71%), Hommes (29%)"
      }
    },
    tiktok: {
      handle: "@saonarapetto",
      url: "https://www.tiktok.com/@saonarapetto"
    },
    links: [
      { name: "Instagram", url: "https://www.instagram.com/saonarapetto", type: "social" },
      { name: "TikTok", url: "https://www.tiktok.com/@saonarapetto", type: "social" },
      { name: "Email Pro", url: "mailto:saonara@eidoles.com", type: "contact" }
    ],
    documents: [
      { name: "Passeport", type: "ID", uploadDate: "10 Mar 2022" },
      { name: "Contrat Eidoles", type: "Contrat", uploadDate: "05 Mar 2022" }
    ],
    recentCampaigns: [
      { brand: "Chanel Beauty", date: "Oct 2024", performance: "+15% engagement" },
      { brand: "Hermès", date: "Sept 2024", performance: "9.8K likes" },
      { brand: "Cartier", date: "Juil 2024", performance: "210 conversions" }
    ]
  }
];

export default function CreatorProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const creatorId = params.id as string;
  const activeTab = searchParams.get('tab') || 'overview';
  
  // State pour gérer le talent, l'édition et la photo
  const [creator, setCreator] = useState<Talent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [creatorImage, setCreatorImage] = useState("");
  const [editedData, setEditedData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    height: "",
    weight: "",
    shoeSize: "",
    address: "",
    phone: "",
    email: "",
    location: "",
    bio: "",
    instagram: "",
    tiktok: "",
    snapchat: "",
  });

  // Charger le talent depuis localStorage
  useEffect(() => {
    const talent = getTalentById(creatorId);
    if (talent) {
      setCreator(talent);
      
      // Charger la photo depuis localStorage
      const storageKey = `talent_photo_${talent.firstName}_${talent.lastName}`;
      const savedImage = localStorage.getItem(storageKey);
      setCreatorImage(savedImage || talent.image || `https://ui-avatars.com/api/?name=${talent.firstName}+${talent.lastName}&size=400&background=random`);
      
      // Initialiser les données d'édition
      setEditedData({
        firstName: talent.firstName,
        lastName: talent.lastName,
        birthDate: talent.birthDate,
        height: talent.height,
        weight: talent.weight,
        shoeSize: talent.shoeSize,
        address: talent.address,
        phone: talent.phone,
        email: talent.email,
        location: talent.location || "",
        bio: talent.bio || "",
        instagram: talent.instagram || "",
        tiktok: talent.tiktok || "",
        snapchat: talent.snapchat || "",
      });
    }
  }, [creatorId]);

  if (!creator) {
    return (
      <div className="min-h-screen bg-[#fafaf9] p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-light text-black mb-4">Talent introuvable</h1>
          <p className="text-black/40 font-light mb-8">
            Ce profil n'existe pas ou a été supprimé.
          </p>
          <Link href="/dashboard">
            <Button className="bg-black hover:bg-black/80 text-white rounded-full font-light">
              Retour au dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    if (!creator) return;
    
    try {
      // Mettre à jour le talent dans localStorage
      const updated = updateTalent(creator.id, {
        firstName: editedData.firstName,
        lastName: editedData.lastName,
        birthDate: editedData.birthDate,
        height: editedData.height,
        weight: editedData.weight,
        shoeSize: editedData.shoeSize,
        address: editedData.address,
        phone: editedData.phone,
        email: editedData.email,
        location: editedData.location,
        bio: editedData.bio,
        instagram: editedData.instagram,
        tiktok: editedData.tiktok,
        snapchat: editedData.snapchat,
      });

      if (updated) {
        setCreator(updated);
        setIsEditing(false);
        alert("✅ Profil mis à jour avec succès !");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      alert("❌ Erreur lors de la mise à jour");
    }
  };

  const handleCancel = () => {
    if (!creator) return;
    
    setIsEditing(false);
    // Réinitialiser les données
    setEditedData({
      firstName: creator.firstName,
      lastName: creator.lastName,
      birthDate: creator.birthDate,
      height: creator.height,
      weight: creator.weight,
      shoeSize: creator.shoeSize,
      address: creator.address,
      phone: creator.phone,
      email: creator.email,
      location: creator.location || "",
      bio: creator.bio || "",
      instagram: creator.instagram || "",
      tiktok: creator.tiktok || "",
      snapchat: creator.snapchat || "",
    });
  };

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* Header avec Hello */}
      <div className="border-b border-black/5 bg-white">
        <div className="max-w-[1400px] mx-auto px-8 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-black">
              Hello, {isEditing ? editedData.firstName : creator.firstName} {isEditing ? editedData.lastName : creator.lastName} 👋
            </h1>
            <p className="text-sm text-black/40 font-light mt-2">
              {creator.category}
            </p>
          </div>
          
          {activeTab === "overview" && !isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="border-black/10 hover:bg-black/5 rounded-full font-light"
            >
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          )}

          {isEditing && (
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                className="bg-black hover:bg-black/80 text-white rounded-full font-light"
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="border-black/10 hover:bg-black/5 rounded-full font-light"
              >
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-[1400px] mx-auto p-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Profil card */}
            <div className="bg-white border border-black/5 rounded-3xl p-10">
              <div className="grid lg:grid-cols-[200px_1fr] gap-10">
                <AvatarUpload
                  currentImage={creatorImage}
                  creatorName={`${creator.firstName} ${creator.lastName}`}
                  onImageChange={setCreatorImage}
                  className="aspect-square w-full"
                />

                <div className="space-y-6">
                  {isEditing ? (
                    <>
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

                      <div>
                        <Label className="text-black/80 font-light">Date de naissance</Label>
                        <Input
                          type="date"
                          value={editedData.birthDate}
                          onChange={(e) => setEditedData({...editedData, birthDate: e.target.value})}
                          className="mt-2 h-10 rounded-xl border-black/10 bg-black/5"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-black/80 font-light">Taille (cm)</Label>
                          <Input
                            value={editedData.height}
                            onChange={(e) => setEditedData({...editedData, height: e.target.value})}
                            className="mt-2 h-10 rounded-xl border-black/10 bg-black/5"
                          />
                        </div>
                        <div>
                          <Label className="text-black/80 font-light">Poids (kg)</Label>
                          <Input
                            value={editedData.weight}
                            onChange={(e) => setEditedData({...editedData, weight: e.target.value})}
                            className="mt-2 h-10 rounded-xl border-black/10 bg-black/5"
                          />
                        </div>
                        <div>
                          <Label className="text-black/80 font-light">Pointure</Label>
                          <Input
                            value={editedData.shoeSize}
                            onChange={(e) => setEditedData({...editedData, shoeSize: e.target.value})}
                            className="mt-2 h-10 rounded-xl border-black/10 bg-black/5"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-black/80 font-light">Adresse</Label>
                        <Input
                          value={editedData.address}
                          onChange={(e) => setEditedData({...editedData, address: e.target.value})}
                          className="mt-2 h-10 rounded-xl border-black/10 bg-black/5"
                        />
                      </div>

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
                    </>
                  ) : (
                    <>
                      <div>
                        <h2 className="text-3xl font-light text-black tracking-tight mb-2">
                          {creator.firstName} {creator.lastName}
                        </h2>
                        <p className="text-base text-black/40 font-light">
                          {creator.instagramData?.handle || creator.category}
                        </p>
                      </div>

                      <p className="text-base text-black/60 font-light leading-relaxed">
                        {creator.bio}
                      </p>

                      {/* Infos personnelles */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-3 text-sm text-black/60 font-light">
                          <Calendar className="w-4 h-4" />
                          {new Date(creator.birthDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-6 text-sm text-black/60 font-light">
                          <div className="flex items-center gap-2">
                            <Ruler className="w-4 h-4" />
                            {creator.height} cm
                          </div>
                          <div className="flex items-center gap-2">
                            <Weight className="w-4 h-4" />
                            {creator.weight} kg
                          </div>
                          <div className="flex items-center gap-2">
                            <Footprints className="w-4 h-4" />
                            {creator.shoeSize}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-black/60 font-light">
                          <MapPin className="w-4 h-4" />
                          {creator.address}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-black/60 font-light">
                          <Phone className="w-4 h-4" />
                          {creator.phone}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-black/60 font-light">
                          <Mail className="w-4 h-4" />
                          {creator.email}
                        </div>
                      </div>

                      {creator.instagram && (
                        <a 
                          href={creator.instagram} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <Button className="bg-black hover:bg-black/80 text-white rounded-full font-light">
                            <Instagram className="w-4 h-4 mr-2" />
                            Voir Instagram
                          </Button>
                        </a>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Stats grid */}
            {creator.instagramData && (
              <div className="grid grid-cols-4 gap-6">
                <div className="bg-white border border-black/5 rounded-2xl p-6">
                  <div className="text-3xl font-light text-black tracking-tight mb-2">
                    {creator.instagramData.followers}
                  </div>
                  <div className="text-xs text-black/40 font-light tracking-wide uppercase">
                    Followers
                  </div>
                </div>

                <div className="bg-white border border-black/5 rounded-2xl p-6">
                  <div className="text-3xl font-light text-black tracking-tight mb-2">
                    -
                  </div>
                  <div className="text-xs text-black/40 font-light tracking-wide uppercase">
                    Posts
                  </div>
                </div>

                <div className="bg-white border border-black/5 rounded-2xl p-6">
                  <div className="text-3xl font-light text-black tracking-tight mb-2">
                    {creator.instagramData.engagement}
                  </div>
                  <div className="text-xs text-black/40 font-light tracking-wide uppercase">
                    Engagement
                  </div>
                </div>

                <div className="bg-white border border-black/5 rounded-2xl p-6">
                  <div className="text-3xl font-light text-black tracking-tight mb-2">
                    {creator.instagramData.avgLikes}
                  </div>
                  <div className="text-xs text-black/40 font-light tracking-wide uppercase">
                    Likes moy.
                  </div>
                </div>
              </div>
            )}

            {/* Campagnes récentes */}
            {creatorsData.find(c => c.id === creator.id)?.recentCampaigns && (
              <div className="bg-white border border-black/5 rounded-3xl p-10">
                <h3 className="text-2xl font-light text-black tracking-tight mb-8">
                  Campagnes récentes
                </h3>
                <div className="space-y-6">
                  {creatorsData.find(c => c.id === creator.id)?.recentCampaigns?.map((campaign, index) => (
                    <div 
                      key={index}
                      className="pb-6 border-b border-black/5 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-lg font-light text-black">
                          {campaign.brand}
                        </div>
                        <div className="text-xs text-black/40 font-light">
                          {campaign.date}
                        </div>
                      </div>
                      <div className="text-sm text-black/60 font-light">
                        {campaign.performance}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "links" && (
          <div className="bg-white border border-black/5 rounded-3xl p-10">
            <h3 className="text-2xl font-light text-black tracking-tight mb-8">
              Liens du talent
            </h3>
            <div className="space-y-4">
              {creator.instagram && (
                <a
                  href={creator.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-black/5 rounded-xl hover:bg-black/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Instagram className="w-4 h-4 text-black/60" />
                    <span className="font-light text-black">Instagram</span>
                  </div>
                  <span className="text-xs text-black/40 font-light uppercase">social</span>
                </a>
              )}
              {creator.tiktok && (
                <a
                  href={creator.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-black/5 rounded-xl hover:bg-black/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <LinkIcon className="w-4 h-4 text-black/60" />
                    <span className="font-light text-black">TikTok</span>
                  </div>
                  <span className="text-xs text-black/40 font-light uppercase">social</span>
                </a>
              )}
              {creator.snapchat && (
                <a
                  href={creator.snapchat}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-black/5 rounded-xl hover:bg-black/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <LinkIcon className="w-4 h-4 text-black/60" />
                    <span className="font-light text-black">Snapchat</span>
                  </div>
                  <span className="text-xs text-black/40 font-light uppercase">social</span>
                </a>
              )}
              {creator.email && (
                <a
                  href={`mailto:${creator.email}`}
                  className="flex items-center justify-between p-4 bg-black/5 rounded-xl hover:bg-black/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-black/60" />
                    <span className="font-light text-black">Email Pro</span>
                  </div>
                  <span className="text-xs text-black/40 font-light uppercase">contact</span>
                </a>
              )}
              {!creator.instagram && !creator.tiktok && !creator.snapchat && !creator.email && (
                <p className="text-black/40 font-light text-center py-8">Aucun lien disponible</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "stats" && (
          <div className="space-y-8">
            <div className="bg-white border border-black/5 rounded-3xl p-10">
              <h3 className="text-2xl font-light text-black tracking-tight mb-8">
                Statistiques détaillées
              </h3>
              
              {creator.instagramData ? (
                <>
                  <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="p-6 bg-black/5 rounded-2xl">
                      <div className="text-2xl font-light text-black tracking-tight mb-2">
                        {creator.instagramData.followers}
                      </div>
                      <div className="text-xs text-black/40 font-light tracking-wide uppercase">
                        Followers
                      </div>
                    </div>

                    <div className="p-6 bg-black/5 rounded-2xl">
                      <div className="text-2xl font-light text-black tracking-tight mb-2">
                        {creator.instagramData.engagement}
                      </div>
                      <div className="text-xs text-black/40 font-light tracking-wide uppercase">
                        Engagement
                      </div>
                    </div>

                    <div className="p-6 bg-black/5 rounded-2xl">
                      <div className="text-2xl font-light text-black tracking-tight mb-2">
                        {creator.instagramData.avgLikes}
                      </div>
                      <div className="text-xs text-black/40 font-light tracking-wide uppercase">
                        Likes moyens
                      </div>
                    </div>
                  </div>

                  <p className="text-black/40 font-light text-sm">
                    Les statistiques détaillées seront disponibles prochainement.
                  </p>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-black/40 font-light text-lg mb-2">
                    Statistiques Instagram non disponibles
                  </p>
                  <p className="text-black/30 font-light text-sm">
                    Connectez le compte Instagram pour voir les statistiques détaillées
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "media" && (
          <div className="bg-white border border-black/5 rounded-3xl p-10">
            <h3 className="text-2xl font-light text-black tracking-tight mb-4">
              Kit Média
            </h3>
            <p className="text-sm text-black/40 font-light mb-8">
              Photos, logos, et ressources médias du talent
            </p>
            <div className="flex items-center justify-center h-64 bg-black/5 rounded-2xl">
              <div className="text-center">
                <Image className="w-12 h-12 text-black/20 mx-auto mb-4" />
                <p className="text-sm text-black/40 font-light">
                  Bientôt disponible
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="bg-white border border-black/5 rounded-3xl p-10">
            <h3 className="text-2xl font-light text-black tracking-tight mb-8">
              Documents légaux
            </h3>
            {creatorsData.find(c => c.id === creator.id)?.documents ? (
              <div className="space-y-4">
                {creatorsData.find(c => c.id === creator.id)?.documents?.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-black/5 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-black/60" />
                      <div>
                        <p className="font-light text-black">{doc.name}</p>
                        <p className="text-xs text-black/40 font-light">{doc.type}</p>
                      </div>
                    </div>
                    <span className="text-xs text-black/40 font-light">{doc.uploadDate}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-black/20 mx-auto mb-4" />
                <p className="text-black/40 font-light text-lg mb-2">
                  Aucun document disponible
                </p>
                <p className="text-black/30 font-light text-sm">
                  Les documents seront ajoutés prochainement
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
