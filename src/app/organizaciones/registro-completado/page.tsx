"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Building2,
  CalendarDays,
  Check,
  ShieldCheck,
  Store,
  UserRoundCheck,
} from "lucide-react";

type OrganizacionRegistro = {
  nombre: string;
  sucursalNombre: string;
  sucursalDireccion: string;
  adminNombre: string;
  adminCorreo: string;
  vendedorNombre: string;
  vendedorCorreo: string;
  plan: string;
  fechaFin: string;
};

const registroInicial: OrganizacionRegistro = {
  nombre: "Tu Organización",
  sucursalNombre: "Sucursal Principal",
  sucursalDireccion: "Matriz",
  adminNombre: "Administrador",
  adminCorreo: "",
  vendedorNombre: "Cajero",
  vendedorCorreo: "",
  plan: "BASICO",
  fechaFin: "",
};

export default function RegistroCompletadoPage() {
  const router = useRouter();
  const [registro] = useState<OrganizacionRegistro>(() => {
    if (typeof window === "undefined") {
      return registroInicial;
    }

    const registroGuardado = sessionStorage.getItem(
      "organizacion-preregistro"
    );

    if (!registroGuardado) {
      return registroInicial;
    }

    try {
      return { ...registroInicial, ...JSON.parse(registroGuardado) };
    } catch {
      return registroInicial;
    }
  });

  const planNombre = {
    BASICO: "Plan Básico",
    PROFESIONAL: "Plan Profesional",
    EMPRESA: "Plan Empresa",
  }[registro.plan] ?? registro.plan;

  const fechaFin = registro.fechaFin
    ? new Intl.DateTimeFormat("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(`${registro.fechaFin}T00:00:00`))
    : "Fecha por definir";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F7F7] p-8">
      <div className="w-full max-w-[950px] border border-[#E2E2E2] bg-white">
        {/* Cabecera */}
        <div className="border-b border-[#EEEEEE] p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center bg-[#D8A814] text-white">
            <Check size={30} />
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
            Registro completado
          </p>

          <h1 className="mt-2 text-3xl font-bold text-black">
            Organización creada correctamente
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#777777]">
            La organización, su primera sucursal y los usuarios iniciales ya
            están preparados para comenzar a trabajar.
          </p>
        </div>

        {/* Organización */}
        <div className="border-b border-[#EEEEEE] p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center bg-[#050505] text-white">
              <Building2 size={22} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase text-[#999999]">
                Organización
              </p>

              <h2 className="mt-1 text-xl font-bold text-black">
                {registro.nombre || "Organización sin nombre"}
              </h2>
            </div>

            <div className="ml-auto">
              <span className="bg-[#D8A814] px-3 py-1 text-xs font-bold text-white">
                ACTIVA
              </span>
            </div>
          </div>
        </div>

        {/* Datos */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Sucursal */}
          <div className="border-b border-[#EEEEEE] p-7 md:border-r">
            <div className="flex items-center gap-3">
              <Store size={20} className="text-[#D8A814]" />

              <p className="text-xs font-bold uppercase tracking-wide text-[#777777]">
                Sucursal inicial
              </p>
            </div>

            <p className="mt-4 text-lg font-bold text-black">
              {registro.sucursalNombre || "Sucursal inicial"}
            </p>

            <p className="mt-1 text-sm text-[#777777]">
              {registro.sucursalDireccion || "Dirección por definir"}
            </p>
          </div>

          {/* Membresía */}
          <div className="border-b border-[#EEEEEE] p-7">
            <div className="flex items-center gap-3">
              <CalendarDays
                size={20}
                className="text-[#D8A814]"
              />

              <p className="text-xs font-bold uppercase tracking-wide text-[#777777]">
                Membresía
              </p>
            </div>

            <p className="mt-4 text-lg font-bold text-black">
              {planNombre}
            </p>

            <p className="mt-1 text-sm text-[#777777]">
              Vigente hasta {fechaFin}
            </p>
          </div>

          {/* Admin */}
          <div className="p-7 md:border-r">
            <div className="flex items-center gap-3">
              <ShieldCheck
                size={20}
                className="text-[#D8A814]"
              />

              <p className="text-xs font-bold uppercase tracking-wide text-[#777777]">
                Administrador
              </p>
            </div>

            <p className="mt-4 text-lg font-bold text-black">
              {registro.adminNombre || "Administrador por definir"}
            </p>

            <p className="mt-1 text-sm text-[#777777]">
              {registro.adminCorreo || "Correo por definir"}
            </p>

            <p className="mt-3 text-xs font-bold text-[#D8A814]">
              ADMIN_ORGANIZACION
            </p>
          </div>

          {/* Vendedor */}
          <div className="p-7">
            <div className="flex items-center gap-3">
              <UserRoundCheck
                size={20}
                className="text-[#D8A814]"
              />

              <p className="text-xs font-bold uppercase tracking-wide text-[#777777]">
                Vendedor
              </p>
            </div>

            <p className="mt-4 text-lg font-bold text-black">
              {registro.vendedorNombre || "Vendedor por definir"}
            </p>

            <p className="mt-1 text-sm text-[#777777]">
              {registro.vendedorCorreo || "Correo por definir"}
            </p>

            <p className="mt-3 text-xs font-bold text-[#D8A814]">
              VENDEDOR
            </p>
          </div>
        </div>

        {/* Flujo */}
        <div className="border-t border-[#EEEEEE] bg-[#FAFAFA] p-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
            Estructura creada
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-semibold">
            <span className="border border-[#DDDDDD] bg-white px-4 py-3">
              {registro.nombre || "Organización"}
            </span>

            <span className="text-[#D8A814]">
              →
            </span>

            <span className="border border-[#DDDDDD] bg-white px-4 py-3">
              {registro.sucursalNombre || "Sucursal inicial"}
            </span>

            <span className="text-[#D8A814]">
              →
            </span>

            <span className="border border-[#DDDDDD] bg-white px-4 py-3">
              Administrador
            </span>

            <span className="text-[#D8A814]">
              +
            </span>

            <span className="border border-[#DDDDDD] bg-white px-4 py-3">
              Vendedor
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EEEEEE] p-7">
          <button
            onClick={() => router.push("/organizaciones")}
            className="h-12 border border-black px-6 text-sm font-bold text-black hover:bg-black hover:text-white"
          >
            Ver organizaciones
          </button>

          <button
            onClick={() => router.push("/login")}
            className="h-12 bg-[#D8A814] px-7 text-sm font-bold text-white hover:bg-black"
          >
            Continuar al login
          </button>
        </div>
      </div>
    </main>
  );
}