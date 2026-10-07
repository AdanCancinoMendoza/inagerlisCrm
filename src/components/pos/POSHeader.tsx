"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getNombrePerfil, getUsuarioActual } from "@/services/auth";
import { usePwa } from "@/context/PwaContext";
import {
  ChevronDown,
  Cpu,
  Download,
  ReceiptText,
  Settings,
  ShoppingCart,
  Terminal,
  UserRound,
  WalletCards,
  Zap,
} from "lucide-react";

interface POSHeaderProps {
  activeTab: "venta" | "caja" | "tickets" | "clientes" | "servicios" | "configuracion";
  ticketNumber?: string;
  onNuevaVenta?: () => void;
}

export default function POSHeader({
  activeTab,
  ticketNumber = "#000129",
  onNuevaVenta,
}: POSHeaderProps) {
  const router = useRouter();
  const { isInstallable, isInstalled, installPwa } = usePwa();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const u = getUsuarioActual();
      setUsuario(u);
    }
  }, []);

  const nombreUsuario = usuario?.nombre || "Usuario";
  const inicial = (nombreUsuario || "U").charAt(0).toUpperCase();
  const nombrePerfil = getNombrePerfil(usuario);

  return (
    <>
      {/* HEADER POS PRINCIPAL */}
      <header className="flex h-[78px] items-center border-b border-[var(--dark-border)] bg-[var(--dark-bg)] px-7 text-white transition-colors duration-300">
        <div className="flex min-w-[250px] items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border border-[#D8A814] font-bold text-[#D8A814]">
            C
          </div>

          <div>
            <p className="text-lg font-bold tracking-[0.12em]">POS</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#777777]">
              Terminal de venta
            </p>
          </div>
        </div>

        <div className="mx-auto flex items-center gap-8">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#777777]">
              Sucursal
            </p>
            <p className="mt-1 text-sm font-semibold">{usuario?.sucursal?.nombre || "Centro"}</p>
          </div>

          <div className="h-8 w-px bg-[var(--dark-border)]" />

          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#777777]">
              Terminal
            </p>
            <p className="mt-1 text-sm font-semibold text-[#D8A814]">Caja 01</p>
          </div>

          <div className="h-8 w-px bg-[#262626]" />

          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#777777]">
              Estado
            </p>

            <div className="mt-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#D8A814]" />
              <p className="text-sm font-semibold">Caja abierta</p>
            </div>
          </div>
        </div>

        <div className="relative flex min-w-[250px] items-center justify-end">
          {isInstallable && !isInstalled && (
            <button
              type="button"
              onClick={installPwa}
              title="Instalar App POS en tu navegador"
              className="mr-3 flex items-center gap-1.5 rounded border border-[#D8A814] bg-[#D8A814]/15 px-3 py-1.5 text-xs font-bold text-[#D8A814] hover:bg-[#D8A814] hover:text-black transition-all cursor-pointer active:scale-95 shadow-sm"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Instalar App</span>
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileMenuOpen((current) => !current)}
              className="flex items-center gap-3 text-left"
            >
              <div>
                <p className="text-right text-sm font-bold">{nombreUsuario}</p>
                <p className="mt-1 text-right text-xs text-[#D8A814]">{nombrePerfil}</p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D8A814] font-bold">
                {inicial}
              </div>

              <ChevronDown
                size={15}
                className={profileMenuOpen ? "rotate-180 text-[#D8A814]" : "text-white"}
              />
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 top-full z-20 mt-3 w-52 border border-[#E5E5E5] bg-white shadow-lg">
                <button
                  type="button"
                  onClick={() => router.push("/inicio")}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-black hover:bg-[#F5F5F5]"
                >
                  <span>Ir al CRM</span>
                  <span className="text-[#777777]">›</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    router.push("/login");
                  }}
                  className="flex w-full items-center justify-between border-t border-[#E5E5E5] px-4 py-3 text-left text-sm font-semibold text-[#D8A814] hover:bg-[#F5F5F5]"
                >
                  <span>Cerrar sesión</span>
                  <span className="text-[#777777]">›</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* SUBHEADER POS */}
      <div className="flex h-[58px] items-center border-b border-[#DDDDDD] bg-white px-7">
        <nav className="flex h-full items-center">
          <button
            onClick={() => router.push("/pos")}
            className={`flex h-full items-center gap-2 border-b-2 px-5 text-sm font-bold transition-colors ${
              activeTab === "venta"
                ? "border-[#D8A814] text-[#D8A814]"
                : "border-transparent text-[#777777] hover:text-black"
            }`}
          >
            <ShoppingCart size={17} />
            Venta
          </button>

          <button
            onClick={() => router.push("/pos/servicios")}
            className={`flex h-full items-center gap-2 border-b-2 px-5 text-sm font-bold transition-colors ${
              activeTab === "servicios"
                ? "border-[#D8A814] text-[#D8A814]"
                : "border-transparent text-[#777777] hover:text-black"
            }`}
          >
            <Zap size={17} />
            Servicios
          </button>

          <button
            onClick={() => router.push("/pos/caja")}
            className={`flex h-full items-center gap-2 border-b-2 px-5 text-sm font-bold transition-colors ${
              activeTab === "caja"
                ? "border-[#D8A814] text-[#D8A814]"
                : "border-transparent text-[#777777] hover:text-black"
            }`}
          >
            <WalletCards size={17} />
            Caja
          </button>

          <button
            onClick={() => router.push("/pos/tickets")}
            className={`flex h-full items-center gap-2 border-b-2 px-5 text-sm font-bold transition-colors ${
              activeTab === "tickets"
                ? "border-[#D8A814] text-[#D8A814]"
                : "border-transparent text-[#777777] hover:text-black"
            }`}
          >
            <ReceiptText size={17} />
            Tickets
          </button>

          <button
            onClick={() => router.push("/pos/clientes")}
            className={`flex h-full items-center gap-2 border-b-2 px-5 text-sm font-bold transition-colors ${
              activeTab === "clientes"
                ? "border-[#D8A814] text-[#D8A814]"
                : "border-transparent text-[#777777] hover:text-black"
            }`}
          >
            <UserRound size={17} />
            Clientes
          </button>

          <button
            onClick={() => router.push("/pos/configuracion")}
            className={`flex h-full items-center gap-2 border-b-2 px-5 text-sm font-bold transition-colors ${
              activeTab === "configuracion"
                ? "border-[#D8A814] text-[#D8A814]"
                : "border-transparent text-[#777777] hover:text-black"
            }`}
          >
            <Settings size={17} />
            Configuración
          </button>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="border-r border-[#DDDDDD] pr-5 text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#999999]">
              Venta
            </p>
            <p className="text-sm font-bold">{ticketNumber}</p>
          </div>

          <button
            onClick={() => {
              if (onNuevaVenta) onNuevaVenta();
              else router.push("/pos");
            }}
            className="h-9 border border-[#D8A814] px-4 text-xs font-bold text-[#D8A814] hover:bg-[#D8A814] hover:text-white transition-colors"
          >
            Nueva venta
          </button>
        </div>
      </div>
    </>
  );
}
