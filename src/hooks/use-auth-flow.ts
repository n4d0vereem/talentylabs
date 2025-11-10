/**
 * Hook personnalisé pour gérer le flow d'authentification complet
 * - Vérifie la session
 * - Vérifie l'agence
 * - Redirige vers onboarding si nécessaire
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getUserAgency } from "@/lib/api-client";

export function useAuthFlow() {
  const { data: session, isPending: isSessionPending } = useSession();
  const router = useRouter();
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const checkAuthAndAgency = async () => {
      // Attendre que la session soit chargée
      if (isSessionPending) {
        return;
      }

      // Si pas de session, rediriger vers sign-in
      if (!session?.user) {
        router.push("/sign-in");
        return;
      }

      try {
        // Vérifier si l'utilisateur a une agence
        const userAgencyResponse = await getUserAgency();
        
        if (!userAgencyResponse?.agency) {
          // Pas d'agence → marquer pour redirection vers onboarding
          setShouldRedirect(true);
          setIsLoading(false);
          return;
        }

        // Agence trouvée → tout est OK
        setAgencyId(userAgencyResponse.agency.id);
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors de la vérification de l'agence:", error);
        // En cas d'erreur, rediriger vers onboarding
        setShouldRedirect(true);
        setIsLoading(false);
      }
    };

    checkAuthAndAgency();
  }, [session, isSessionPending, router]);

  // Rediriger vers onboarding si nécessaire
  useEffect(() => {
    if (shouldRedirect && !isSessionPending && session?.user) {
      router.push("/dashboard/onboarding");
    }
  }, [shouldRedirect, isSessionPending, session, router]);

  return {
    session,
    agencyId,
    isLoading: isLoading || isSessionPending,
    isAuthenticated: !!session?.user,
    hasAgency: !!agencyId,
  };
}



