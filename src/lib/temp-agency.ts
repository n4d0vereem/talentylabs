/**
 * Hook pour récupérer l'agencyId de l'utilisateur connecté
 */

import { useState, useEffect } from "react";
import { getUserAgency } from "./api-client";

export function useAgencyId() {
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAgency = async () => {
      try {
        const response = await getUserAgency();
        if (response.agency) {
          setAgencyId(response.agency.id);
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'agence:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAgency();
  }, []);

  return { agencyId, isLoading };
}

