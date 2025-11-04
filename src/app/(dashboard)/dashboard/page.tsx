"use client";

import { useSession } from "@/lib/auth-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, TrendingUp, Users, Target } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getTalents, type Talent } from "@/lib/talents-storage";
import { getAgencySettings, type AgencySettings } from "@/lib/agency-settings";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const [talents, setTalents] = useState<Talent[]>([]);
  const [totalFollowers, setTotalFollowers] = useState(0);
  const [avgEngagement, setAvgEngagement] = useState(0);
  const [agencySettings, setAgencySettings] = useState<AgencySettings | null>(null);

  // Charger les talents et les settings depuis localStorage
  useEffect(() => {
    // Charger les settings de l'agence
    const settings = getAgencySettings();
    setAgencySettings(settings);

    const loadTalents = () => {
      const loadedTalents = getTalents();
      
      // Charger les photos depuis localStorage
      const talentsWithImages = loadedTalents.map(talent => {
        const storageKey = `talent_photo_${talent.firstName}_${talent.lastName}`;
        const savedImage = localStorage.getItem(storageKey);
        return {
          ...talent,
          image: savedImage || talent.image || `https://ui-avatars.com/api/?name=${talent.firstName}+${talent.lastName}&size=400&background=random`
        };
      });
      
      setTalents(talentsWithImages);
      
      // Calculer les stats (approximatif pour les nouveaux talents)
      let total = 0;
      let totalEng = 0;
      let count = 0;
      
      talentsWithImages.forEach(talent => {
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
    };

    loadTalents();

    // Recharger quand la fenêtre redevient visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadTalents();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (isPending) {
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
            <Button className="bg-black hover:bg-black/80 text-white h-12 px-8 rounded-full font-light text-sm">
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
                <Card className="bg-white border border-black/5 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group">
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={talent.image || `https://ui-avatars.com/api/?name=${talent.firstName}+${talent.lastName}&size=400&background=random`}
                      alt={talent.firstName}
                      className="object-cover object-center w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                    {talent.instagramData && (
                      <span className="absolute top-4 right-4 bg-white text-black text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                        Vérifié
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-light text-black mb-1">
                      {talent.firstName} {talent.lastName}
                    </h3>
                    <p className="text-sm text-black/60 font-light mb-4">
                      {talent.category}{talent.instagramData?.handle && ` · ${talent.instagramData.handle}`}
                    </p>
                    {talent.instagramData ? (
                      <div className="flex items-center justify-between text-sm text-black/80">
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
                      <div className="text-sm text-black/40 font-light">
                        Données Instagram à venir
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}

            {/* Add Talent Card */}
            <Link href="/dashboard/creators">
              <Card className="bg-white border border-black/5 rounded-3xl flex flex-col items-center justify-center p-6 text-center h-full hover:shadow-md transition-all duration-200 cursor-pointer">
                <div className="w-20 h-20 rounded-full bg-black/5 flex items-center justify-center mb-6">
                  <Plus className="h-10 w-10 text-black/20" />
                </div>
                <h3 className="text-2xl font-light text-black mb-2">
                  Ajouter un talent
                </h3>
                <p className="text-sm text-black/40 font-light mb-6">
                  Enregistrez un nouveau profil d'influenceur.
                </p>
                <Button className="bg-black hover:bg-black/80 text-white h-12 px-8 rounded-full font-light">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un talent
                </Button>
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
              <Button className="bg-black hover:bg-black/80 text-white h-12 px-8 rounded-full font-light">
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
