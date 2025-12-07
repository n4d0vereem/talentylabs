"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Enregistrer le service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('✅ Service Worker enregistré:', registration);
          })
          .catch((error) => {
            console.log('❌ Erreur Service Worker:', error);
          });
      });
    }

    // Écouter l'événement beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 animate-in slide-in-from-bottom">
      <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-medium text-black mb-1">Installer Eidoles CRM</h3>
            <p className="text-sm text-black/60 font-light">
              Accédez rapidement à l'app depuis votre écran d'accueil
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInstallPrompt(false)}
            className="rounded-full -mr-2 -mt-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <Button
          onClick={handleInstallClick}
          className="w-full btn-accent rounded-xl font-light"
        >
          <Download className="w-4 h-4 mr-2" />
          Installer l'application
        </Button>
      </div>
    </div>
  );
}

