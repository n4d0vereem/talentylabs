"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp, signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Star } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      setIsLoading(false);
      return;
    }

    try {
      // Créer le compte et se connecter automatiquement
      await signUp.email({
        email,
        password,
        name,
      });

      // Rediriger vers le dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Sign-up error:", err);
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  // Logos des agences d'influence
  const agencies = [
    "Makers Studio",
    "Eidoles",
    "Talents Co",
    "Influence",
  ];

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Partie gauche - Visuel vivant */}
      <div className="hidden lg:flex flex-col items-center justify-between p-16 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 relative overflow-hidden">
        {/* Badge étoiles en haut */}
        <div className="w-full flex justify-center pt-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-full px-8 py-4 flex items-center gap-3">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-white text-white" />
              ))}
            </div>
            <span className="text-white text-base font-light tracking-wide">
              Trusted by 100+ agencies worldwide
            </span>
          </div>
        </div>

        {/* Message principal */}
        <div className="text-center space-y-8 max-w-2xl z-10 px-12">
          <h2 className="text-6xl font-light text-white leading-tight tracking-tight">
            Gérez vos talents comme jamais auparavant.
          </h2>
          <p className="text-2xl text-white/95 font-light leading-relaxed">
            Rejoignez les agences qui ont transformé leur gestion de talents avec TalentyLabs.
          </p>
        </div>

        {/* Logos défilants en bas */}
        <div className="w-full overflow-hidden pb-8">
          <div className="flex gap-16 items-center justify-center animate-scroll">
            {agencies.concat(agencies).map((agency, index) => (
              <div
                key={index}
                className="text-white/70 font-light text-2xl whitespace-nowrap"
              >
                {agency}
              </div>
            ))}
          </div>
        </div>

        {/* Effet de dégradé overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Partie droite - Formulaire */}
      <div className="flex flex-col items-center justify-center p-16 bg-white">
        <div className="w-full max-w-lg space-y-10">
          {/* Logo TALENTYLABS */}
          <div className="flex flex-col items-start space-y-6">
            <div>
              <h1 className="text-5xl font-light text-black tracking-tight mb-3">
                talentylabs
              </h1>
              <div className="h-1.5 w-20 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full" />
            </div>
            <div>
              <h2 className="text-3xl font-light text-black tracking-tight mb-3">
                Créer un compte
              </h2>
              <p className="text-base font-light text-black/50">
                Commencez gratuitement dès aujourd'hui
              </p>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-5 bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-sm text-red-600 font-light">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <Label htmlFor="name" className="text-base font-light text-black/70">
                Nom complet
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Votre nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-16 bg-black/5 border-0 rounded-2xl font-light text-base placeholder:text-black/30 focus-visible:ring-2 focus-visible:ring-purple-500/30 focus-visible:bg-white transition-all"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-base font-light text-black/70">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-16 bg-black/5 border-0 rounded-2xl font-light text-base placeholder:text-black/30 focus-visible:ring-2 focus-visible:ring-purple-500/30 focus-visible:bg-white transition-all"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-base font-light text-black/70">
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 caractères"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-16 bg-black/5 border-0 rounded-2xl font-light text-base placeholder:text-black/30 focus-visible:ring-2 focus-visible:ring-purple-500/30 focus-visible:bg-white transition-all"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-base font-light text-black/70">
                Confirmer le mot de passe
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirmez votre mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-16 bg-black/5 border-0 rounded-2xl font-light text-base placeholder:text-black/30 focus-visible:ring-2 focus-visible:ring-purple-500/30 focus-visible:bg-white transition-all"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-16 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white rounded-2xl font-light text-lg shadow-xl shadow-purple-500/20 transition-all hover:shadow-2xl hover:shadow-purple-500/30 mt-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Création du compte...
                </>
              ) : (
                "Créer mon compte"
              )}
            </Button>
          </form>

          {/* Lien vers connexion */}
          <div className="text-center pt-6">
            <p className="text-base font-light text-black/50">
              Déjà un compte ?{" "}
              <Link
                href="/sign-in"
                className="text-purple-600 hover:text-purple-700 font-normal transition-colors underline-offset-4 hover:underline"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 25s linear infinite;
        }
      `}</style>
    </div>
  );
}
