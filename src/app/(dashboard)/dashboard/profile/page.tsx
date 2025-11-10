"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { AvatarUpload } from "@/components/avatar-upload";
import { updateUserProfile } from "@/lib/api-client";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  useEffect(() => {
    if (session?.user) {
      // Extraire le nom et prénom depuis le nom complet ou l'email
      const nameParts = session.user.name?.split(" ") || [];
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      setFormData({
        firstName: firstName,
        lastName: lastName,
        email: session.user.email || "",
      });
      setProfileImage(session.user.image || "");
      setIsLoading(false);
    }
  }, [session]);

  // Sauvegarder automatiquement l'image quand elle change
  useEffect(() => {
    const saveImage = async () => {
      if (profileImage && profileImage !== session?.user?.image && session?.user) {
        try {
          console.log("💾 Sauvegarde de la photo...");
          await updateUserProfile({ image: profileImage });
          console.log("✅ Photo de profil mise à jour - Rechargement...");
          // Attendre un peu puis recharger pour mettre à jour la session
          setTimeout(() => {
            window.location.reload();
          }, 500);
        } catch (error) {
          console.error("❌ Erreur lors de la mise à jour de la photo:", error);
          alert("Erreur lors de la sauvegarde de la photo");
        }
      }
    };

    // Attendre un peu avant de sauvegarder (debounce)
    const timer = setTimeout(saveImage, 1500);
    return () => clearTimeout(timer);
  }, [profileImage, session?.user?.image, session?.user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      await updateUserProfile({
        name: fullName,
        email: formData.email,
        image: profileImage,
      });

      alert("✅ Profil mis à jour !");
      // Recharger la page pour mettre à jour la session
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      alert("❌ Erreur lors de la mise à jour");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 lg:p-12">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-black/60 hover:text-black transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-light">Retour au dashboard</span>
            </Link>
            <h1 className="text-4xl font-light text-black">Mon profil</h1>
            <p className="text-sm text-black/40 font-light mt-2">
              Gérez vos informations personnelles
            </p>
          </div>
        </div>

        {/* Photo de profil */}
        <Card className="bg-white border border-black/5 rounded-3xl p-8">
          <div className="flex flex-col items-center space-y-4">
            <h2 className="text-xl font-light text-black">Photo de profil</h2>
            <p className="text-sm text-black/40 font-light text-center">
              Cliquez sur la photo pour la modifier
            </p>
            <AvatarUpload
              currentImage={profileImage}
              creatorName={`${formData.firstName} ${formData.lastName}`}
              onImageChange={setProfileImage}
              className="w-40 h-40 rounded-full"
            />
          </div>
        </Card>

        {/* Informations personnelles */}
        <Card className="bg-white border border-black/5 rounded-3xl p-8">
          <h2 className="text-2xl font-light text-black mb-6">
            Informations personnelles
          </h2>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-black/80 font-light">Prénom</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                  placeholder="John"
                />
              </div>
              <div>
                <Label className="text-black/80 font-light">Nom</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <Label className="text-black/80 font-light">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                placeholder="john.doe@example.com"
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full btn-accent rounded-full font-light h-14 mt-8 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Sauvegarder les modifications
              </>
            )}
          </Button>
        </Card>
      </div>
    </div>
  );
}

