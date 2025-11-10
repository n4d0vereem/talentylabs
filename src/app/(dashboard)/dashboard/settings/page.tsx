"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Save, Upload, RotateCcw, ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";
import { useAgencyId } from "@/lib/temp-agency";
import { getAgencySettings, updateAgencySettings, getCategories, createCategory, deleteCategory } from "@/lib/api-client";

interface AgencySettings {
  name: string;
  logo?: string;
  primaryColor: string;
  useDefaultColors: boolean;
}

export default function SettingsPage() {
  const { agencyId, isLoading: agencyLoading } = useAgencyId();
  const [settings, setSettings] = useState<AgencySettings>({
    name: "Eidoles",
    logo: "",
    primaryColor: "#000000",
    useDefaultColors: true,
  });
  
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [newCategory, setNewCategory] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (agencyLoading || !agencyId) return;
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [agencySettings, categoriesData] = await Promise.all([
          getAgencySettings(agencyId),
          getCategories(agencyId),
        ]);
        setSettings(agencySettings);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Erreur lors du chargement des paramètres:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [agencyId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Sauvegarder les paramètres via l'API
      await updateAgencySettings(agencyId, settings);
      
      // Appliquer immédiatement les couleurs
      const root = document.documentElement;
      root.style.setProperty('--agency-primary', settings.primaryColor);
      
      alert("✅ Paramètres sauvegardés avec succès !");
      
      // Rediriger vers le dashboard
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("❌ Erreur lors de la sauvegarde");
      setIsSaving(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const created = await createCategory({ name: newCategory.trim(), agencyId });
      setCategories([...categories, created]);
      setNewCategory("");
    } catch (error) {
      console.error("Erreur lors de l'ajout de la catégorie:", error);
      alert("❌ Erreur lors de l'ajout");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("❌ Erreur lors de la suppression");
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 400;
        const maxHeight = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const logoUrl = canvas.toDataURL('image/png', 0.9);
        setSettings({ ...settings, logo: logoUrl });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-black/5 pb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-black/60 hover:text-black hover:bg-black/5 font-light mb-6 -ml-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au Dashboard
            </Button>
          </Link>
          <h1 className="text-5xl font-light tracking-tight text-black mb-3">
            Paramètres
          </h1>
          <p className="text-base text-black/40 font-light">
            Personnalisez votre agence et l'apparence de votre dashboard
          </p>
        </div>

        {/* Informations de l'agence */}
        <Card className="bg-white border border-black/5 rounded-3xl p-10">
          <h2 className="text-2xl font-light text-black tracking-tight mb-8">
            Informations de l'agence
          </h2>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="agencyName" className="text-black/80 font-light">
                Nom de l'agence
              </Label>
              <Input
                id="agencyName"
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                placeholder="Eidoles"
                className="mt-2 h-12 rounded-xl border-black/10 bg-black/5 text-black placeholder:text-black/40 focus:border-black focus:ring-0"
              />
              <p className="text-xs text-black/40 font-light mt-2">
                Ce nom apparaîtra dans le dashboard et la sidebar
              </p>
            </div>

            <div>
              <Label className="text-black/80 font-light">Logo de l'agence</Label>
              <div className="mt-2 flex items-center gap-4">
                {settings.logo && (
                  <div className="w-32 h-32 bg-black/5 rounded-xl flex items-center justify-center overflow-hidden p-2">
                    <img 
                      src={settings.logo} 
                      alt="Logo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2 px-6 py-3 bg-black/5 hover:bg-black/10 rounded-xl transition-colors">
                    <Upload className="w-4 h-4 text-black/60" />
                    <span className="text-sm font-light text-black">
                      {settings.logo ? "Changer le logo" : "Uploader un logo"}
                    </span>
                  </div>
                </label>
              </div>
              <p className="text-xs text-black/40 font-light mt-2">
                Format recommandé : PNG transparent, 400x200px max
              </p>
            </div>
          </div>
        </Card>

        {/* Couleur d'accent */}
        <Card className="bg-white border border-black/5 rounded-3xl p-10">
          <h2 className="text-2xl font-light text-black tracking-tight mb-3">
            Couleur d'accent
          </h2>
          <p className="text-sm text-black/40 font-light mb-8">
            Personnalisez subtilement l'apparence avec une couleur d'accent qui apparaîtra sur certains éléments interactifs
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-black/5 rounded-xl">
              <input
                type="checkbox"
                id="useDefaultColors"
                checked={settings.useDefaultColors}
                onChange={(e) => {
                  const useDefault = e.target.checked;
                  setSettings({ 
                    ...settings, 
                    useDefaultColors: useDefault,
                    // Réinitialiser à la couleur par défaut si on coche
                    primaryColor: useDefault ? '#000000' : settings.primaryColor
                  });
                }}
                className="w-5 h-5 rounded border-black/20 text-black focus:ring-black"
              />
              <Label htmlFor="useDefaultColors" className="text-black/80 font-light cursor-pointer flex-1">
                Utiliser la couleur par défaut (Noir)
              </Label>
            </div>

            {!settings.useDefaultColors && (
              <div className="pt-4">
                <Label htmlFor="primaryColor" className="text-black/80 font-light">
                  Choisir une couleur personnalisée
                </Label>
                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="color"
                    id="primaryColor"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="w-16 h-12 rounded-xl border border-black/10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="h-12 rounded-xl border-black/10 bg-black/5 text-black font-mono"
                    placeholder="#000000"
                  />
                </div>
              </div>
            )}

            {/* Preview subtile */}
            <div className="mt-8 p-6 bg-black/5 rounded-2xl">
              <p className="text-sm text-black/60 font-light mb-4">Aperçu de la couleur d'accent :</p>
              <div className="flex items-center gap-6">
                {/* Barre colorée */}
                <div 
                  className="h-3 w-32 rounded-full transition-colors"
                  style={{ 
                    backgroundColor: settings.primaryColor
                  }}
                />
                {/* Petit cercle */}
                <div 
                  className="w-10 h-10 rounded-full transition-colors"
                  style={{ 
                    backgroundColor: settings.primaryColor
                  }}
                />
                {/* Texte exemple */}
                <span 
                  className="text-sm font-medium transition-colors"
                  style={{ 
                    color: settings.primaryColor
                  }}
                >
                  Texte d'exemple
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Catégories de talents */}
        <Card className="bg-white border border-black/5 rounded-3xl p-10">
          <h2 className="text-2xl font-light text-black tracking-tight mb-3">
            Catégories de talents
          </h2>
          <p className="text-sm text-black/40 font-light mb-8">
            Définissez les catégories disponibles lors de l'ajout d'un nouveau talent
          </p>
          
          <div className="space-y-4">
            {/* Ajout de catégorie */}
            <div className="flex gap-3">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Nouvelle catégorie..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newCategory.trim()) {
                    handleAddCategory();
                  }
                }}
                className="flex-1 h-12 rounded-xl border-black/10 bg-black/5"
              />
              <Button
                onClick={handleAddCategory}
                className="btn-accent rounded-xl font-light h-12 px-6"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </div>

            {/* Liste des catégories */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 bg-black/5 rounded-xl"
                >
                  <span className="text-sm font-light text-black">{category.name}</span>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-black/40 hover:text-black transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Bouton de sauvegarde */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full btn-accent h-14 rounded-full font-light text-base disabled:opacity-50"
        >
          {isSaving ? (
            <>Sauvegarde...</>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Sauvegarder les paramètres
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
