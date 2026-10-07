"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { PanelLeftClose, PanelLeftOpen, LogOut, ChevronDown, User } from "lucide-react";
import { getUsuarioActual, logout, UsuarioPerfil } from "@/services/auth";

export default function Header() {
  const router = useRouter();
  const { collapsed, toggleSidebar } = useSidebar();
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
    <header className="flex h-24 items-center justify-between border-b border-[#E5E5E5] bg-white px-10">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          title={collapsed ? "Desplegar menú" : "Ocultar menú"}
          className="flex h-11 w-11 items-center justify-center border border-[#DDDDDD] bg-[#FAFAFA] text-black hover:border-[var(--primary)] hover:bg-white transition-all shadow-sm cursor-pointer"
        >
          {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>

        <div>
          <h1 className="text-2xl font-bold text-black">
            Hola, {nombreUsuario}
          </h1>

          <p className="mt-1 text-sm text-[#777777]">
            {usuario?.organizacion?.nombre ? `${usuario.organizacion.nombre} · Resumen general` : "Aquí tienes el resumen de tu negocio."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#999999]">
            Organización
          </p>

          <p className="mt-1 font-bold text-black">
            {usuario?.organizacion?.nombre || "Imagertis CRM"}
          </p>
        </div>

        {/* Menú de Usuario / Cerrar Sesión */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-3 border border-[#E5E5E5] bg-[#FAFAFA] hover:bg-white p-2 px-3 transition-all cursor-pointer"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] font-bold text-white text-sm">
              {inicial}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-black leading-tight">{nombreUsuario}</p>
              <p className="text-[10px] font-semibold text-[var(--primary)]">{rolUsuario}</p>
            </div>
            <ChevronDown size={14} className={`text-[#777777] transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 border border-[#E5E5E5] bg-white shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="p-3 border-b border-[#EEEEEE] bg-[#FAFAFA]">
                <p className="text-xs font-bold text-black">{nombreUsuario}</p>
                <p className="text-[11px] text-[#777777] truncate">{usuario?.email || "usuario@empresa.com"}</p>
                <span className="mt-1.5 inline-block text-[9px] font-bold uppercase tracking-wider bg-[var(--primary)] text-white px-2 py-0.5">
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