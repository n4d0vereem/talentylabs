"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addTalent } from "@/lib/talents-storage";

const addCreatorSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis."),
  lastName: z.string().min(1, "Le nom est requis."),
  birthDate: z.string().min(1, "La date de naissance est requise."),
  height: z.string().min(1, "La taille est requise."),
  weight: z.string().min(1, "Le poids est requis."),
  shoeSize: z.string().min(1, "La pointure est requise."),
  address: z.string().min(1, "L'adresse est requise."),
  phone: z.string().min(1, "Le numéro de téléphone est requis."),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  snapchat: z.string().optional(),
}).refine(
  (data) => data.instagram || data.tiktok || data.snapchat,
  {
    message: "Au moins un réseau social est requis (Instagram, TikTok ou Snapchat).",
    path: ["instagram"],
  }
);

type AddCreatorFormValues = z.infer<typeof addCreatorSchema>;

export default function AddCreatorPage() {
  const router = useRouter();
  const form = useForm<AddCreatorFormValues>({
    resolver: zodResolver(addCreatorSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      birthDate: "",
      height: "",
      weight: "",
      shoeSize: "",
      address: "",
      phone: "",
      instagram: "",
      tiktok: "",
      snapchat: "",
    },
  });

  const { register, handleSubmit, formState, reset } = form;
  const { errors, isSubmitting } = formState;

  const onSubmit = (data: AddCreatorFormValues) => {
    try {
      // Créer un email à partir du nom et prénom
      const email = `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}@eidoles.com`;
      
      // Déterminer la catégorie automatiquement (peut être modifié plus tard)
      const category = "Influenceur";
      
      // Extraire la ville de l'adresse
      const location = data.address.split(',').slice(-2).join(',').trim();
      
      // Ajouter le talent au localStorage
      const newTalent = addTalent({
        firstName: data.firstName,
        lastName: data.lastName,
        birthDate: data.birthDate,
        height: data.height,
        weight: data.weight,
        shoeSize: data.shoeSize,
        address: data.address,
        phone: data.phone,
        email: email,
        category: category,
        location: location,
        bio: `Talent ajouté le ${new Date().toLocaleDateString('fr-FR')}`,
        instagram: data.instagram || undefined,
        tiktok: data.tiktok || undefined,
        snapchat: data.snapchat || undefined,
      });

      console.log("Nouveau talent ajouté:", newTalent);
      alert("✅ Talent ajouté avec succès !");
      
      // Rediriger vers le dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Erreur lors de l'ajout du talent:", error);
      alert("❌ Erreur lors de l'ajout du talent");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-black/60 hover:text-black hover:bg-black/5 font-light mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
          <h1 className="text-5xl font-light tracking-tight text-black mb-3">
            Nouveau talent
          </h1>
          <p className="text-base text-black/40 font-light">
            Remplissez les informations du talent
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Informations personnelles */}
          <Card className="bg-white border border-black/5 rounded-3xl p-8">
            <CardHeader className="mb-6 p-0">
              <CardTitle className="text-2xl font-light text-black tracking-tight">
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName" className="text-black/80 font-light">
                    Prénom <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Jade"
                    {...register("firstName")}
                    className="mt-2 h-12 rounded-xl border-black/10 bg-black/5 text-black placeholder:text-black/40 focus:border-black focus:ring-0"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-black/80 font-light">
                    Nom <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Gattoni"
                    {...register("lastName")}
                    className="mt-2 h-12 rounded-xl border-black/10 bg-black/5 text-black placeholder:text-black/40 focus:border-black focus:ring-0"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="birthDate" className="text-black/80 font-light">
                  Date de naissance <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  {...register("birthDate")}
                  className="mt-2 h-12 rounded-xl border-black/10 bg-black/5 text-black focus:border-black focus:ring-0"
                />
                {errors.birthDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.birthDate.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informations physiques */}
          <Card className="bg-white border border-black/5 rounded-3xl p-8">
            <CardHeader className="mb-6 p-0">
              <CardTitle className="text-2xl font-light text-black tracking-tight">
                Informations physiques
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="height" className="text-black/80 font-light">
                    Taille (cm) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="height"
                    type="text"
                    placeholder="170"
                    {...register("height")}
                    className="mt-2 h-12 rounded-xl border-black/10 bg-black/5 text-black placeholder:text-black/40 focus:border-black focus:ring-0"
                  />
                  {errors.height && (
                    <p className="text-red-500 text-sm mt-1">{errors.height.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="weight" className="text-black/80 font-light">
                    Poids (kg) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="weight"
                    type="text"
                    placeholder="60"
                    {...register("weight")}
                    className="mt-2 h-12 rounded-xl border-black/10 bg-black/5 text-black placeholder:text-black/40 focus:border-black focus:ring-0"
                  />
                  {errors.weight && (
                    <p className="text-red-500 text-sm mt-1">{errors.weight.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="shoeSize" className="text-black/80 font-light">
                    Pointure <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="shoeSize"
                    type="text"
                    placeholder="38"
                    {...register("shoeSize")}
                    className="mt-2 h-12 rounded-xl border-black/10 bg-black/5 text-black placeholder:text-black/40 focus:border-black focus:ring-0"
                  />
                  {errors.shoeSize && (
                    <p className="text-red-500 text-sm mt-1">{errors.shoeSize.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coordonnées */}
          <Card className="bg-white border border-black/5 rounded-3xl p-8">
            <CardHeader className="mb-6 p-0">
              <CardTitle className="text-2xl font-light text-black tracking-tight">
                Coordonnées
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              <div>
                <Label htmlFor="address" className="text-black/80 font-light">
                  Adresse <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="15 Avenue des Champs-Élysées, 75008 Paris"
                  {...register("address")}
                  className="mt-2 h-12 rounded-xl border-black/10 bg-black/5 text-black placeholder:text-black/40 focus:border-black focus:ring-0"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="text-black/80 font-light">
                  Numéro de téléphone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  {...register("phone")}
                  className="mt-2 h-12 rounded-xl border-black/10 bg-black/5 text-black placeholder:text-black/40 focus:border-black focus:ring-0"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Réseaux sociaux */}
          <Card className="bg-white border border-black/5 rounded-3xl p-8">
            <CardHeader className="mb-6 p-0">
              <CardTitle className="text-2xl font-light text-black tracking-tight">
                Réseaux sociaux
              </CardTitle>
              <p className="text-sm text-black/60 font-light mt-2">
                Au moins un réseau social est requis
              </p>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              <div>
                <Label htmlFor="instagram" className="text-black/80 font-light">
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  type="url"
                  placeholder="https://www.instagram.com/gattoni.jd"
                  {...register("instagram")}
                  className="mt-2 h-12 rounded-xl border-black/10 bg-black/5 text-black placeholder:text-black/40 focus:border-black focus:ring-0"
                />
                {errors.instagram && (
                  <p className="text-red-500 text-sm mt-1">{errors.instagram.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="tiktok" className="text-black/80 font-light">
                  TikTok
                </Label>
                <Input
                  id="tiktok"
                  type="url"
                  placeholder="https://www.tiktok.com/@username"
                  {...register("tiktok")}
                  className="mt-2 h-12 rounded-xl border-black/10 bg-black/5 text-black placeholder:text-black/40 focus:border-black focus:ring-0"
                />
                {errors.tiktok && (
                  <p className="text-red-500 text-sm mt-1">{errors.tiktok.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="snapchat" className="text-black/80 font-light">
                  Snapchat
                </Label>
                <Input
                  id="snapchat"
                  type="url"
                  placeholder="https://www.snapchat.com/add/username"
                  {...register("snapchat")}
                  className="mt-2 h-12 rounded-xl border-black/10 bg-black/5 text-black placeholder:text-black/40 focus:border-black focus:ring-0"
                />
                {errors.snapchat && (
                  <p className="text-red-500 text-sm mt-1">{errors.snapchat.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Boutons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-black hover:bg-black/80 text-white h-14 rounded-full font-light text-base"
            >
              {isSubmitting ? (
                <>Ajout en cours...</>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  Ajouter le talent
                </>
              )}
            </Button>
            
            <Link href="/dashboard" className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full h-14 rounded-full border-black/10 text-black/80 hover:bg-black/5 font-light text-base"
              >
                Annuler
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
