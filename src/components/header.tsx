"use client";

import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "@/lib/auth-client";
import { Bell, Search, User, Settings, LogOut } from "lucide-react";
import Link from "next/link";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/creators": "Créateurs",
  "/dashboard/campaigns": "Campagnes",
  "/dashboard/analytics": "Analytics",
  "/dashboard/settings": "Paramètres",
};

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const pageTitle = pageTitles[pathname] || "Dashboard";

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/sign-in";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Left: Page title */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{pageTitle}</h2>
        </div>

        {/* Right: Search, notifications, user menu */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="pl-10 w-64 bg-gray-50"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
          </button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <Avatar>
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                    {session?.user?.name ? getInitials(session.user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session?.user?.name || "Utilisateur"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email || "email@example.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

