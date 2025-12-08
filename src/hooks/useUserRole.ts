"use client";

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';

export function useUserRole() {
  const { data: session, isPending } = useSession();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      if (isPending) return;
      
      if (!session?.user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/user/role', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setRole(data.role || null);
        } else {
          setRole(null);
        }
      } catch (err) {
        console.error('Erreur récupération rôle:', err);
        setRole(null);
      } finally {
        setLoading(false);
      }
    }

    fetchRole();
  }, [session, isPending]);

  return { role, loading };
}
