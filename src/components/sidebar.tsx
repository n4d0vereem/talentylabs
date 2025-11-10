"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession, signOut } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  LayoutDashboard, 
  Menu,
  X,
  UserPlus,
  BarChart3,
  Image,
  FileText,
  LogOut,
  ChevronLeft,
  Settings,
  TrendingUp,
  User,
  Users,
  Calendar,
  Briefcase,
  MoreVertical,
  Edit,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getAgencySettings, type AgencySettings } from "@/lib/agency-settings";
import { useSearchParams } from "next/navigation";

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
  {
    name: "Collaborateurs",
    href: "/dashboard/collaborators",
    icon: Users,
  },
];

const settingsNavigation = {
  name: "Paramètres",
  href: "/dashboard/settings",
  icon: Settings,
};

  const talentTabs = [
    { id: "overview", name: "Vue d'ensemble", icon: BarChart3, href: "?tab=overview" },
    { id: "planning", name: "Planning", icon: Calendar, href: "?tab=planning" },
    { id: "collaborations", name: "Collaborations", icon: Briefcase, href: "?tab=collaborations" },
    { id: "insights", name: "Insights", icon: TrendingUp, href: "?tab=insights" },
    { id: "mediakit", name: "Kit Média", icon: FileText, href: "?tab=mediakit" },
    { id: "content", name: "Content Library", icon: Image, href: "?tab=content" },
    { id: "documents", name: "Documents", icon: FileText, href: "?tab=documents" },
    { id: "info", name: "Informations", icon: User, href: "?tab=info" }
  ];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending: isSessionPending } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [agencySettings, setAgencySettings] = useState<AgencySettings | null>(null);

  // Détecter si on est sur la page d'onboarding
  const isOnboarding = pathname === "/dashboard/onboarding";

  // Charger les paramètres de l'agence (sauf sur onboarding)
  useEffect(() => {
    if (!isOnboarding) {
      const settings = getAgencySettings();
      setAgencySettings(settings);
    } else {
      // Sur onboarding, ne pas charger les anciens settings
      setAgencySettings(null);
    }
  }, [pathname, isOnboarding]); // Recharger quand on change de page

  // Détecter si on est sur un profil de talent
  const isTalentProfile = pathname.startsWith("/dashboard/creators/") && pathname !== "/dashboard/creators";
  
  // Obtenir l'onglet actif depuis les paramètres de recherche
  const currentTab = searchParams?.get('tab') || 'overview';


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
        {/* Logo cliquable - Version minimaliste compacte */}
        <Link href="/dashboard" className="block px-6 py-6 border-b border-black/5 hover:bg-black/5 transition-colors">
          {agencySettings?.logo ? (
            <div className="flex items-center gap-3">
              {/* Logo compact */}
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/5 flex items-center justify-center flex-shrink-0">
                <img 
                  src={agencySettings.logo} 
                  alt={agencySettings.name} 
                  className="w-10 h-10 object-contain"
                />
              </div>
              {/* Texte à côté */}
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-black tracking-tight truncate">
                  {agencySettings?.name || "Agence"}
                </p>
                <p className="text-xs font-light text-black/40 tracking-wide uppercase">
                  Management
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-light text-black tracking-tight mb-1">
                {agencySettings?.name || "talentylabs"}
              </h1>
              <p className="text-xs font-light text-black/40 tracking-wide uppercase">
                Management
              </p>
            </div>
          )}
        </Link>

        {/* Navigation - Change selon le contexte */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {isOnboarding ? (
            /* Sur onboarding, afficher un message d'accueil */
            <div className="text-center py-12 px-4">
              <p className="text-sm text-black/60 font-light leading-relaxed">
                Créez votre agence pour accéder à toutes les fonctionnalités 🚀
              </p>
            </div>
          ) : isTalentProfile ? (
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
                        ? "btn-accent"
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
                        ? "btn-accent"
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
        <div className="p-6 pt-4 border-t border-black/5 relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-black/5 hover:bg-black/10 transition-colors">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback className="bg-black text-white font-light">
                    {isSessionPending ? (
                      "..."
                    ) : (
                      session?.user?.name ? getInitials(session.user.name) : 
                      (session?.user?.email ? session.user.email.charAt(0).toUpperCase() : "U")
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-light text-black truncate">
                    {isSessionPending ? (
                      "Chargement..."
                    ) : (
                      session?.user?.name || 
                      (session?.user?.email ? session.user.email.split("@")[0].charAt(0).toUpperCase() + session.user.email.split("@")[0].slice(1) : "Utilisateur")
                    )}
                  </p>
                  <p className="text-xs text-black/40 truncate font-light">
                    {isSessionPending ? (
                      "..."
                    ) : (
                      session?.user?.email || "Non connecté"
                    )}
                  </p>
                </div>
                <MoreVertical className="h-4 w-4 text-black/40" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border border-black/10 shadow-lg rounded-xl p-2">
              <DropdownMenuItem
                onClick={() => router.push("/dashboard/profile")}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-black/5 transition-colors"
              >
                <Edit className="h-4 w-4 text-black/60" />
                <span className="text-sm font-light text-black">Éditer le profil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2 bg-black/10" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-red-50 transition-colors text-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-light">Se déconnecter</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
