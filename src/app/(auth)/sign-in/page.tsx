"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Star } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn.email({
        email,
        password,
      });

      // Vérifier si la connexion a réussi
      if (result.error) {
        // Analyser le type d'erreur pour donner un message précis
        const errorMessage = result.error.message?.toLowerCase() || "";
        
        if (errorMessage.includes("user") && errorMessage.includes("not found")) {
          setError("Aucun compte associé à cet email. Veuillez vous inscrire d'abord.");
        } else if (errorMessage.includes("password") || errorMessage.includes("incorrect") || errorMessage.includes("invalid")) {
          setError("Mot de passe incorrect. Veuillez réessayer.");
        } else if (errorMessage.includes("email")) {
          setError("Format d'email invalide.");
        } else {
          setError("Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.");
        }
        setIsLoading(false);
        return;
      }

      // Rediriger vers le dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Sign-in error:", err);
      
      // Gestion des erreurs avec messages plus précis
      const errorMessage = err?.message?.toLowerCase() || "";
      
      if (errorMessage.includes("user") && (errorMessage.includes("not found") || errorMessage.includes("does not exist"))) {
        setError("❌ Aucun compte trouvé avec cet email. Veuillez créer un compte d'abord.");
      } else if (errorMessage.includes("password") || errorMessage.includes("incorrect") || errorMessage.includes("invalid")) {
        setError("🔒 Mot de passe incorrect. Veuillez réessayer.");
      } else if (errorMessage.includes("email")) {
        setError("📧 Format d'email invalide.");
      } else if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
        setError("🌐 Erreur de connexion. Vérifiez votre connexion internet.");
      } else {
        setError("❌ Identifiants incorrects. Vérifiez votre email et mot de passe.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Logos des agences d'influence
  const agencies = [
    "Makers Studio",
    "TalentyLabs",
    "Talents Co",
    "Influence",
  ];

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Partie gauche - Visuel vivant */}
      <div className="hidden lg:flex flex-col items-center justify-between p-16 bg-gradient-to-br from-teal-500 via-orange-400 to-pink-500 relative overflow-hidden">
        {/* Badge étoiles en haut */}
        <div className="w-full flex justify-center pt-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-full px-8 py-4 flex items-center gap-3">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-white text-white" />
              ))}
            </div>
            <span className="text-white text-base font-light tracking-wide">
              Helped over 100+ businesses
            </span>
          </div>
        </div>

        {/* Message principal - Plus grand et centré */}
        <div className="text-center space-y-8 max-w-2xl z-10 px-12">
          <h2 className="text-6xl font-light text-white leading-tight tracking-tight">
            Turn confusion into clarity, today.
          </h2>
          <p className="text-2xl text-white/95 font-light leading-relaxed">
            Gérez tous vos talents au même endroit et concentrez-vous sur leur croissance.
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
              <div className="h-1.5 w-20 bg-gradient-to-r from-teal-500 to-orange-500 rounded-full" />
            </div>
            <div>
              <h2 className="text-3xl font-light text-black tracking-tight mb-3">
                Se connecter
              </h2>
              <p className="text-base font-light text-black/50">
                Bienvenue sur la plateforme de gestion de talents
              </p>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-7">
            {error && (
              <div className="p-5 bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-sm text-red-600 font-light">{error}</p>
              </div>
            )}

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
                className="h-16 bg-black/5 border-0 rounded-2xl font-light text-base placeholder:text-black/30 focus-visible:ring-2 focus-visible:ring-teal-500/30 focus-visible:bg-white transition-all"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-base font-light text-black/70">
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-16 bg-black/5 border-0 rounded-2xl font-light text-base placeholder:text-black/30 focus-visible:ring-2 focus-visible:ring-teal-500/30 focus-visible:bg-white transition-all"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 rounded-lg border-black/20 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="remember" className="text-base font-light text-black/60">
                  Se souvenir de moi
                </label>
              </div>
              <Link
                href="/forgot-password"
                className="text-base font-light text-black/50 hover:text-teal-600 transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-16 bg-gradient-to-r from-teal-600 to-orange-500 hover:from-teal-700 hover:to-orange-600 text-white rounded-2xl font-light text-lg shadow-xl shadow-teal-500/20 transition-all hover:shadow-2xl hover:shadow-teal-500/30"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>

          {/* Lien vers inscription */}
          <div className="text-center pt-6">
            <p className="text-base font-light text-black/50">
              Pas encore de compte ?{" "}
              <Link
                href="/sign-up"
                className="text-teal-600 hover:text-teal-700 font-normal transition-colors underline-offset-4 hover:underline"
              >
                Créer un compte
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
