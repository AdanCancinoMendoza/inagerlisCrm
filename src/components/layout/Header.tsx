"use client";

import { useSidebar } from "@/context/SidebarContext";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

export default function Header() {
  const { collapsed, toggleSidebar } = useSidebar();

  return (
    <header className="flex h-24 items-center justify-between border-b border-[#E5E5E5] bg-white px-10">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          title={collapsed ? "Desplegar menú" : "Ocultar menú"}
          className="flex h-11 w-11 items-center justify-center border border-[#DDDDDD] bg-[#FAFAFA] text-black hover:border-[#D8A814] hover:bg-white transition-all shadow-sm"
        >
          {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>

        <div>
          <h1 className="text-2xl font-bold text-black">
            Buenos días, Adán
          </h1>

          <p className="mt-1 text-sm text-[#777777]">
            Aquí tienes el resumen de tu negocio.
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#999999]">
          Domingo
        </p>

        <p className="mt-1 font-bold text-black">
          30 Agosto 2026
        </p>
      </div>
    </header>
  );
}