"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession, signOut } from "@/lib/auth-client";
import { 
  LayoutDashboard, 
  Menu,
  X,
  UserPlus,
  Link as LinkIcon,
  BarChart3,
  Image,
  FileText,
  LogOut,
  ChevronLeft,
  Settings,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { getAgencySettings, type AgencySettings } from "@/lib/agency-settings";

const mainNavigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Talents",
    href: "/dashboard/creators",
    icon: UserPlus,
  },
];

const settingsNavigation = {
  name: "Paramètres",
  href: "/dashboard/settings",
  icon: Settings,
};

const talentTabs = [
  { id: "overview", name: "Vue d'ensemble", icon: BarChart3, href: "?tab=overview" },
  { id: "links", name: "Liens", icon: LinkIcon, href: "?tab=links" },
  { id: "stats", name: "Stats", icon: BarChart3, href: "?tab=stats" },
  { id: "media", name: "Kit Média", icon: Image, href: "?tab=media" },
  { id: "documents", name: "Documents", icon: FileText, href: "?tab=documents" }
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const [agencySettings, setAgencySettings] = useState<AgencySettings | null>(null);
  const logoutMenuRef = useRef<HTMLDivElement>(null);

  // Charger les paramètres de l'agence
  useEffect(() => {
    const settings = getAgencySettings();
    setAgencySettings(settings);
  }, [pathname]); // Recharger quand on change de page

  // Détecter si on est sur un profil de talent
  const isTalentProfile = pathname.startsWith("/dashboard/creators/") && pathname !== "/dashboard/creators";

  // Fermer le menu de déconnexion quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (logoutMenuRef.current && !logoutMenuRef.current.contains(event.target as Node)) {
        setShowLogoutMenu(false);
      }
    };

    if (showLogoutMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLogoutMenu]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-white border border-black/10 shadow-sm"
      >
        {isMobileMenuOpen ? (
          <X className="h-5 w-5 text-black" />
        ) : (
          <Menu className="h-5 w-5 text-black" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-72 bg-white border-r border-black/5 flex flex-col transition-transform duration-300",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo cliquable */}
        <Link href="/dashboard" className="block p-8 border-b border-black/5 hover:bg-black/5 transition-colors">
          {agencySettings?.logo ? (
            <div className="mb-2">
              <div className="w-full h-16 rounded-xl overflow-hidden bg-black/5">
                <img 
                  src={agencySettings.logo} 
                  alt={agencySettings.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : (
            <h1 className="text-3xl font-light text-black tracking-tight mb-2">
              {agencySettings?.name || "pomelo"}
            </h1>
          )}
          <p className="text-xs font-light text-black/40 tracking-wide uppercase">
            {agencySettings?.name || "Agence"}
          </p>
        </Link>

        {/* Navigation - Change selon le contexte */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {isTalentProfile ? (
            <>
              {/* Bouton retour */}
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-4 py-3 mb-4 rounded-xl text-sm font-light text-black/60 hover:bg-black/5 hover:text-black transition-all border border-black/10"
              >
                <ChevronLeft className="h-5 w-5" />
                Retour au dashboard
              </Link>

              {/* Onglets du talent */}
              {talentTabs.map((tab) => {
                const Icon = tab.icon;
                const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
                const currentTab = searchParams.get('tab') || 'overview';
                const isActive = currentTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.set('tab', tab.id);
                      router.push(url.pathname + url.search);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-light transition-all",
                      isActive
                        ? "bg-black text-white"
                        : "text-black/60 hover:bg-black/5 hover:text-black"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.name}
                  </button>
                );
              })}
            </>
          ) : (
            <>
              {/* Menu principal */}
              {mainNavigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-light transition-all",
                      isActive
                        ? "bg-black text-white"
                        : "text-black/60 hover:bg-black/5 hover:text-black"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Paramètres en bas */}
        <div className="px-6 pb-4">
          <Link
            href={settingsNavigation.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-light transition-all",
              pathname === settingsNavigation.href
                ? "bg-black text-white"
                : "text-black/60 hover:bg-black/5 hover:text-black"
            )}
          >
            <Settings className="h-5 w-5" />
            {settingsNavigation.name}
          </Link>
        </div>

        {/* User profile avec menu déroulant */}
        <div ref={logoutMenuRef} className="p-6 pt-4 border-t border-black/5 relative">
          <button
            onClick={() => setShowLogoutMenu(!showLogoutMenu)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-black/5 hover:bg-black/10 transition-colors"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback className="bg-black text-white font-light">
                {session?.user?.name ? getInitials(session.user.name) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-light text-black truncate">
                {session?.user?.name || "Utilisateur"}
              </p>
              <p className="text-xs text-black/40 truncate font-light">
                Manager
              </p>
            </div>
          </button>

          {/* Menu de déconnexion */}
          {showLogoutMenu && (
            <div className="absolute bottom-full left-6 right-6 mb-2 bg-white border border-black/10 rounded-xl shadow-lg overflow-hidden">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-light text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
