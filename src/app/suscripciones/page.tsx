"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSidebar } from "@/context/SidebarContext";
import SuscripcionesView from "@/components/suscripciones/SuscripcionesView";
import { Sparkles } from "lucide-react";

export default function SuscripcionesPage() {
  const { collapsed } = useSidebar();

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Sidebar />

      <div className={`min-h-screen transition-all duration-300 ${collapsed ? "ml-[80px]" : "ml-[250px]"}`}>
        <Header />

        <div className="p-6 md:p-10">
          {/* Banner de Encabezado CRM */}
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
                Administración & Facturación CRM
              </p>

              <h1 className="mt-2 text-3xl font-bold text-black">
                Suscripción y Planes
              </h1>

              <p className="mt-2 text-sm text-[#777777]">
                Consulta tu plan actual, explora las opciones disponibles y administra tus métodos de pago en el CRM.
              </p>
            </div>

            <div className="flex items-center gap-3 border border-[#E5E5E5] bg-white p-3 px-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center bg-[#FAF6E8] text-[#D8A814]">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-xs text-[#888888] font-semibold uppercase">Estado CRM</p>
                <p className="text-sm font-bold text-black flex items-center gap-2">
                  Plan Pro Empresarial
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </p>
              </div>
            </div>
          </div>

          <SuscripcionesView />
        </div>
      </div>
    </main>
  );
}
