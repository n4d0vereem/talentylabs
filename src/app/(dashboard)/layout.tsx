"use client";

import { Sidebar } from "@/components/sidebar";
import { PWAInstall } from "@/components/pwa-install";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <Sidebar />
      
      <div className="lg:pl-72">
        {children}
      </div>

      {/* PWA Install Prompt */}
      <PWAInstall />
    </div>
  );
}

