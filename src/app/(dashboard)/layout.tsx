"use client";

import { Sidebar } from "@/components/sidebar";
import { PWAInstall } from "@/components/pwa-install";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [shouldShowSidebar, setShouldShowSidebar] = useState(true);
  
  // Vérifier si on doit afficher la sidebar
  useEffect(() => {
    async function checkUserStatus() {
      try {
        // Ne pas afficher la sidebar sur la page d'onboarding
        if (pathname === '/dashboard/onboarding') {
          setShouldShowSidebar(false);
          return;
        }
        
        // Vérifier le statut de l'utilisateur
        const res = await fetch('/api/user/role', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          
          // Cacher la sidebar si désactivé ou pas d'agence
          if (data.status === 'DISABLED' || !data.agencyId) {
            setShouldShowSidebar(false);
          } else {
            setShouldShowSidebar(true);
          }
        }
      } catch (err) {
        console.error('Error checking user status:', err);
      }
    }
    
    checkUserStatus();
  }, [pathname]);
  
  // Initialiser les couleurs côté client uniquement
  useEffect(() => {
    try {
      const stored = localStorage.getItem('talentylabs_agency_settings');
      if (stored) {
        const settings = JSON.parse(stored);
        const root = document.documentElement;
        if (settings.useDefaultColors) {
          root.style.setProperty('--agency-primary', '#000000');
        } else {
          root.style.setProperty('--agency-primary', settings.primaryColor || '#000000');
        }
      }
    } catch(e) {
      console.error('Error loading colors:', e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {shouldShowSidebar && <Sidebar />}
      
      <div className={shouldShowSidebar ? "lg:pl-72" : ""}>
        {children}
      </div>

      {/* PWA Install Prompt */}
      <PWAInstall />
    </div>
  );
}

