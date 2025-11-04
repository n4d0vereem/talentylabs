"use client";

import { Sidebar } from "@/components/sidebar";
import { useEffect } from "react";
import { initializeColors } from "@/lib/agency-settings";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialiser les couleurs au chargement
  useEffect(() => {
    initializeColors();
  }, []);

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <Sidebar />
      
      <div className="lg:pl-72">
        {children}
      </div>
    </div>
  );
}

