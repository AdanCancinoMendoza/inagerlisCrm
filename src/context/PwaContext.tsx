"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Download, X, Smartphone, Monitor, CheckCircle2 } from "lucide-react";

interface PwaContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  installPwa: () => Promise<boolean>;
  dismissBanner: () => void;
  showBanner: boolean;
}

const PwaContext = createContext<PwaContextType>({
  isInstallable: false,
  isInstalled: false,
  installPwa: async () => false,
  dismissBanner: () => {},
  showBanner: false,
});

export const usePwa = () => useContext(PwaContext);

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Detectar si ya está en modo standalone (instalada)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Registrar Service Worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("PWA Service Worker activo con scope:", registration.scope);
          })
          .catch((err) => {
            console.warn("Error al registrar PWA Service Worker:", err);
          });
      });
    }

    // 3. Capturar evento de instalación nativo
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);

      const dismissed = localStorage.getItem("crm_pwa_banner_dismissed");
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installPwa = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      // Si el navegador no disparó el prompt (iOS o desktop manual), mostrar instrucciones
      return false;
    }

    try {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsInstalled(true);
        setIsInstallable(false);
        setShowBanner(false);
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error al ejecutar prompt de instalación:", err);
      return false;
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
    setBannerDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("crm_pwa_banner_dismissed", "true");
    }
  };

  return (
    <PwaContext.Provider
      value={{
        isInstallable,
        isInstalled,
        installPwa,
        dismissBanner,
        showBanner: showBanner && !bannerDismissed && !isInstalled,
      }}
    >
      {children}

      {/* Banner flotante de instalación PWA */}
      {showBanner && !bannerDismissed && !isInstalled && isInstallable && (
        <aside
          aria-label="Instalación de la aplicación"
          className="fixed bottom-5 right-5 z-50 max-w-sm rounded-lg border border-[#D8A814]/40 bg-[#141414] p-4 text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#D8A814] text-black shadow-md font-bold">
              <Download size={22} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Instalar Inagerlis POS
                </h2>
                <button
                  onClick={dismissBanner}
                  className="text-neutral-400 hover:text-white p-1 transition-colors"
                  title="Cerrar aviso"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="mt-1 text-xs text-neutral-300 leading-relaxed">
                Descarga la app en tu navegador para abrirla a pantalla completa y utilizar el POS sin barras de navegación.
              </p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={installPwa}
                  className="flex items-center gap-1.5 rounded bg-[#D8A814] px-3.5 py-1.5 text-xs font-bold text-black transition-all hover:bg-[#c49811] hover:shadow cursor-pointer active:scale-95"
                >
                  <Download size={14} />
                  Descargar e Instalar
                </button>
                <button
                  onClick={dismissBanner}
                  className="rounded px-2.5 py-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  Más tarde
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}
    </PwaContext.Provider>
  );
}
