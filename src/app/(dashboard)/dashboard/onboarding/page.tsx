"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export const dynamic = 'force-dynamic';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Sparkles } from "lucide-react";
import { createUserAgency } from "@/lib/api-client";

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    agencyName: "",
    logo: "",
    primaryColor: "#000000",
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Veuillez sélectionner une image");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const logoUrl = canvas.toDataURL("image/png");
        setFormData({ ...formData, logo: logoUrl });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agencyName.trim()) {
      alert("Veuillez entrer un nom d'agence");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createUserAgency({
        name: formData.agencyName.trim(),
        logo: formData.logo,
        primaryColor: formData.primaryColor,
      });

      console.log("Agency created:", result);

      // Rediriger vers le dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la création de l'agence:", error);
      alert("❌ Erreur lors de la création de l'agence");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 flex items-center justify-center p-6">
      <Card className="bg-white border border-black/5 rounded-3xl p-12 max-w-2xl w-full shadow-xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-light text-black mb-3">
            Bienvenue sur TalentyLabs !
          </h1>
          <p className="text-lg text-black/60 font-light">
            Créez votre agence pour commencer à gérer vos talents
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Nom de l'agence */}
          <div>
            <Label className="text-black/80 font-light text-lg mb-3 block">
              Nom de votre agence <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.agencyName}
              onChange={(e) =>
                setFormData({ ...formData, agencyName: e.target.value })
              }
              placeholder="Eidoles, Makers Studio..."
              className="h-14 rounded-xl border-black/10 bg-black/5 text-lg font-light"
              required
            />
          </div>

          {/* Logo */}
          <div>
            <Label className="text-black/80 font-light text-lg mb-3 block">
              Logo de l'agence (optionnel)
            </Label>
            <div className="flex items-center gap-6">
              {formData.logo ? (
                <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-black/10 bg-black/5">
                  <img
                    src={formData.logo}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-black/10 bg-black/5 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-black/30" />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
                <label htmlFor="logo-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-black/10 hover:bg-black/5 rounded-full font-light cursor-pointer"
                    asChild
                  >
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      {formData.logo ? "Changer le logo" : "Télécharger un logo"}
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          </div>

          {/* Couleur principale */}
          <div>
            <Label className="text-black/80 font-light text-lg mb-3 block">
              Couleur principale (optionnel)
            </Label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) =>
                  setFormData({ ...formData, primaryColor: e.target.value })
                }
                className="w-20 h-14 rounded-xl border border-black/10 cursor-pointer"
              />
              <Input
                value={formData.primaryColor}
                onChange={(e) =>
                  setFormData({ ...formData, primaryColor: e.target.value })
                }
                placeholder="#000000"
                className="flex-1 h-14 rounded-xl border-black/10 bg-black/5 font-light"
              />
            </div>
          </div>

          {/* Bouton de soumission */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full btn-accent rounded-full font-light h-14 text-lg disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                Créer mon agence et commencer
              </>
            )}
          </Button>
        </form>

        <p className="text-sm text-black/40 font-light text-center mt-8">
          Vous pourrez modifier ces paramètres plus tard dans les réglages
        </p>
      </Card>
    </div>
  );
}

