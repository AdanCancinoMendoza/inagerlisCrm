"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { PanelLeftClose, PanelLeftOpen, LogOut, ChevronDown, User, Download, Menu } from "lucide-react";
import { getUsuarioActual, logout, UsuarioPerfil } from "@/services/auth";
import { usePwa } from "@/context/PwaContext";

export default function Header() {
  const router = useRouter();
  const { collapsed, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { isInstallable, isInstalled, installPwa } = usePwa();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [usuario, setUsuario] = useState<UsuarioPerfil | null>(null);

  useEffect(() => {
    const current = getUsuarioActual();
    if (current) {
      setUsuario(current);
    }
  }, []);

  const handleLogout = () => {
    logout();
  };

  const nombreUsuario = usuario?.nombre || "Usuario";
  const rolUsuario = usuario?.rol === "ADMIN" ? "Administrador" : usuario?.rol === "GERENTE" ? "Gerente" : usuario?.rol || "Supervisor";
  const inicial = nombreUsuario.charAt(0).toUpperCase();

  return (
    <header className="flex h-16 sm:h-20 lg:h-24 items-center justify-between border-b border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] px-3 sm:px-6 lg:px-10 transition-colors w-full">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 pr-2">
        {/* Botón hamburguesa Mobile */}
        <button
          onClick={toggleMobileSidebar}
          title="Abrir menú de navegación"
          className="flex lg:hidden h-10 w-10 shrink-0 items-center justify-center border border-[#DDDDDD] dark:border-[#333333] bg-[#FAFAFA] dark:bg-[#1A1A1A] text-black dark:text-white hover:border-[var(--primary)] transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <Menu size={20} />
        </button>

        {/* Botón colapsar menú Desktop */}
        <button
          onClick={toggleSidebar}
          title={collapsed ? "Desplegar menú" : "Ocultar menú"}
          className="hidden lg:flex h-11 w-11 shrink-0 items-center justify-center border border-[#DDDDDD] dark:border-[#333333] bg-[#FAFAFA] dark:bg-[#1A1A1A] text-black dark:text-white hover:border-[var(--primary)] transition-all shadow-sm cursor-pointer"
        >
          {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>

        <div className="min-w-0">
          <h1 className="text-sm sm:text-lg lg:text-2xl font-bold text-black dark:text-white truncate">
            Hola, {nombreUsuario}
          </h1>

          <p className="hidden sm:block mt-0.5 text-xs sm:text-sm text-[#777777] dark:text-[#999999] truncate">
            {usuario?.organizacion?.nombre ? `${usuario.organizacion.nombre} · Resumen general` : "Aquí tienes el resumen de tu negocio."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-6 shrink-0">
        {isInstallable && !isInstalled && (
          <button
            onClick={installPwa}
            title="Instalar Inagerlis en tu dispositivo"
            className="hidden md:flex items-center gap-2 border border-[#D8A814] bg-[#FAF6E8] text-[#937107] hover:bg-[#D8A814] hover:text-black px-3.5 py-2 text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <Download size={15} />
            <span>Instalar App</span>
          </button>
        )}

        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#999999]">
            Organización
          </p>

          <p className="mt-1 font-bold text-black truncate max-w-[160px]">
            {usuario?.organizacion?.nombre || "Inagerlis CRM"}
          </p>
        </div>

        {/* Menú de Usuario / Cerrar Sesión */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 sm:gap-3 border border-[#E5E5E5] bg-[#FAFAFA] hover:bg-white p-1.5 sm:p-2 sm:px-3 transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center border border-black bg-black font-bold text-white text-xs sm:text-sm shrink-0">
              {inicial}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-bold text-black leading-tight truncate max-w-[130px]">{nombreUsuario}</p>
              <p className="text-[10px] font-semibold text-[var(--primary)]">{rolUsuario}</p>
            </div>
            <ChevronDown size={14} className={`text-[#777777] transition-transform shrink-0 ${userMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 border border-[#E5E5E5] bg-white shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="p-3 border-b border-[#EEEEEE] bg-[#FAFAFA]">
                <p className="text-xs font-bold text-black">{nombreUsuario}</p>
                <p className="text-[11px] text-[#777777] truncate">{usuario?.email || "usuario@empresa.com"}</p>
                <span className="mt-1.5 inline-block text-[9px] font-bold uppercase tracking-wider bg-black text-[#D8A814] px-2 py-0.5 border border-[#D8A814]/30">
                  {rolUsuario}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}