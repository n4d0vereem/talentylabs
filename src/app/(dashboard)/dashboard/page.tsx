"use client";

import { useSession } from "@/lib/auth-client";
import { Card } from "@/components/ui/card";

export const dynamic = 'force-dynamic';
import { Button } from "@/components/ui/button";
import { Loader2, Plus, TrendingUp, Users, Target } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getTalents, getAgencySettings, getUserAgency } from "@/lib/api-client";
import { useRouter } from "next/navigation";

interface Talent {
  id: string;
  firstName: string;
  lastName: string;
  category: string;
  image?: string;
  instagramData?: {
    handle: string;
    followers: string;
    engagement: string;
    avgLikes: string;
  };
}

interface AgencySettings {
  name: string;
  logo?: string;
}

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [totalFollowers, setTotalFollowers] = useState(0);
  const [avgEngagement, setAvgEngagement] = useState(0);
  const [agencySettings, setAgencySettings] = useState<AgencySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier si l'utilisateur a une agence et charger les données
  useEffect(() => {
    const loadData = async () => {
      // Attendre que la session soit complètement chargée
      if (isPending) {
        return;
      }

      // Si pas de session après chargement, rediriger vers sign-in
      if (!session?.user) {
        console.log("No session, redirecting to sign-in");
        router.push("/sign-in");
        return;
      }

      console.log("Session found:", session.user.email);
      
      try {
        setIsLoading(true);
        
        // Vérifier si l'utilisateur a une agence
        const userAgencyResponse = await getUserAgency();
        console.log("Agency response:", userAgencyResponse);
        
        if (!userAgencyResponse?.agency) {
          // Pas d'agence → rediriger vers onboarding
          console.log("No agency, redirecting to onboarding");
          router.push("/dashboard/onboarding");
          return;
        }

        const userAgencyId = userAgencyResponse.agency.id;
        setAgencyId(userAgencyId);
        console.log("Agency found:", userAgencyId);
        
        // Charger les settings de l'agence
        const settings = await getAgencySettings(userAgencyId);
        setAgencySettings(settings);

        // Charger les talents
        const loadedTalents = await getTalents(userAgencyId);
        setTalents(loadedTalents);
        
        // Calculer les stats
        let total = 0;
        let totalEng = 0;
        let count = 0;
        
        loadedTalents.forEach((talent: Talent) => {
          if (talent.instagramData?.followers) {
            const followers = talent.instagramData.followers;
            const num = parseFloat(followers.replace('K', '')) * 1000;
            total += num;
            
            if (talent.instagramData.engagement) {
              totalEng += parseFloat(talent.instagramData.engagement);
              count++;
            }
          }
        });
        
        setTotalFollowers(total);
        setAvgEngagement(count > 0 ? totalEng / count : 0);
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setIsLoading(false);
        // En cas d'erreur de session, rediriger vers sign-in
        if (error instanceof Error && error.message.includes("Unauthorized")) {
          router.push("/sign-in");
        } else {
          // Sinon, rediriger vers onboarding
          router.push("/dashboard/onboarding");
        }
      }
    };

    loadData();

    // Recharger quand la fenêtre redevient visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session, isPending, router]);

  if (isPending || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] p-8">
      <div className="max-w-[1400px] mx-auto space-y-12">
        {/* Header minimaliste */}
        <div className="flex items-end justify-between border-b border-black/5 pb-8">
          <div>
            <h1 className="text-5xl font-light tracking-tight text-black mb-3">
              Hello {agencySettings?.name || "Agence"} 👋
            </h1>
            <p className="text-base text-black/40 font-light">
              {talents.length} talents{totalFollowers > 0 && ` · ${(totalFollowers / 1000).toFixed(0)}K reach`}
            </p>
          </div>
          <Link href="/dashboard/creators">
            <Button className="btn-accent h-12 px-8 rounded-full font-light text-sm">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau talent
            </Button>
          </Link>
        </div>

        {/* Stats épurées */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white border border-black/5 rounded-2xl p-8">
            <p className="text-sm text-black/40 font-light mb-2">Talents actifs</p>
            <p className="text-5xl font-light text-black">{talents.length}</p>
          </div>
          <div className="bg-white border border-black/5 rounded-2xl p-8">
            <p className="text-sm text-black/40 font-light mb-2">Portée totale</p>
            <p className="text-5xl font-light text-black">
              {totalFollowers > 0 ? `${(totalFollowers / 1000).toFixed(0)}K` : '-'}
            </p>
          </div>
          <div className="bg-white border border-black/5 rounded-2xl p-8">
            <p className="text-sm text-black/40 font-light mb-2">Engagement moyen</p>
            <p className="text-5xl font-light text-black">
              {avgEngagement > 0 ? `${avgEngagement.toFixed(1)}%` : '-'}
            </p>
          </div>
        </div>

        {/* Liste des talents */}
        {talents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {talents.map((talent) => (
              <Link key={talent.id} href={`/dashboard/creators/${talent.id}?tab=overview`}>
                <Card className="bg-white border border-black/5 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group h-full flex flex-col">
                  <div className="relative h-56 w-full overflow-hidden flex-shrink-0">
                    {talent.image ? (
                      <img
                        src={talent.image}
                        alt={talent.firstName}
                        className="object-cover object-center w-full h-full transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
                        <span className="text-6xl font-light text-stone-400">
                          {talent.firstName?.[0]}{talent.lastName?.[0]}
                        </span>
                      </div>
                    )}
                    {talent.instagramData && (
                      <span className="absolute top-4 right-4 bg-white text-black text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                        Vérifié
                      </span>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-2xl font-light text-black mb-1">
                      {talent.firstName} {talent.lastName}
                    </h3>
                    <p className="text-sm text-black/60 font-light mb-4">
                      {talent.category}{talent.instagramData?.handle && ` · ${talent.instagramData.handle}`}
                    </p>
                    {talent.instagramData ? (
                      <div className="flex items-center justify-between text-sm text-black/80 mt-auto">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-black/60" />
                          <span>{talent.instagramData.followers}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-black/60" />
                          <span>{talent.instagramData.engagement}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-black/60" />
                          <span>{talent.instagramData.avgLikes}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-black/40 font-light mt-auto">
                        Données Instagram à venir
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}

            {/* Add Talent Card - Même structure que les autres */}
            <Link href="/dashboard/creators">
              <Card className="bg-white border-2 border-dashed border-black/10 rounded-3xl overflow-hidden shadow-sm hover:border-black/20 hover:shadow-md transition-all duration-300 cursor-pointer group h-full flex flex-col">
                {/* Section image vide pour alignement - même hauteur */}
                <div className="h-56 w-full bg-gradient-to-br from-black/5 to-black/10 flex items-center justify-center flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="h-10 w-10 text-black/30 group-hover:text-black/60 transition-colors" />
                  </div>
                </div>
                {/* Contenu aligné avec les autres cartes */}
                <div className="p-6 text-center flex-1 flex flex-col justify-center">
                  <h3 className="text-2xl font-light text-black mb-1 group-hover:text-black transition-colors">
                    Ajouter un talent
                  </h3>
                  <p className="text-sm text-black/40 font-light">
                    Enregistrez un nouveau profil d'influenceur.
                  </p>
                </div>
              </Card>
            </Link>
          </div>
        ) : (
          /* Empty state élégant */
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-20 h-20 rounded-full bg-black/5 flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-black/20" />
            </div>
            <h3 className="text-2xl font-light text-black/60 mb-2">Aucun talent</h3>
            <p className="text-sm text-black/40 font-light mb-8">
              Commencez par ajouter votre premier talent
            </p>
            <Link href="/dashboard/creators">
              <Button className="btn-accent h-12 px-8 rounded-full font-light">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un talent
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
