"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSidebar } from "@/context/SidebarContext";
import { Cliente, getClientes } from "@/services/clientes";
import { getOrganizacionId, getUsuarioActual } from "@/services/auth";
import { Users, Search, UserPlus } from "lucide-react";

export default function NuevosClientesPage() {
  const { collapsed } = useSidebar();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState<"todos" | "hoy" | "7dias" | "30dias">("todos");

  useEffect(() => {
    const user = getUsuarioActual();
    const orgId = getOrganizacionId() || user?.organizacionId;

    if (!orgId) {
      setLoading(false);
      return;
    }

    getClientes(orgId)
      .then((data) => {
        setClientes(data || []);
      })
      .catch((err) => {
        console.error("Error al cargar nuevos clientes:", err);
        setClientes([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Filtrar según periodo y término de búsqueda
  const filteredList = useMemo(() => {
    const now = new Date();
    const hoyInicio = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const hace7Dias = new Date();
    hace7Dias.setDate(now.getDate() - 7);
    const hace30Dias = new Date();
    hace30Dias.setDate(now.getDate() - 30);

    const term = search.toLowerCase().trim();

    return clientes
      .filter((c) => {
        const match =
          c.nombre.toLowerCase().includes(term) ||
          (c.telefono && c.telefono.includes(term)) ||
          (c.rfc && c.rfc.toLowerCase().includes(term)) ||
          (c.localidad && c.localidad.toLowerCase().includes(term));

        if (!match) return false;

        if (periodo === "hoy") {
          return c.createdAt ? new Date(c.createdAt) >= hoyInicio : false;
        }
        if (periodo === "7dias") {
          return c.createdAt ? new Date(c.createdAt) >= hace7Dias : false;
        }
        if (periodo === "30dias") {
          return c.createdAt ? new Date(c.createdAt) >= hace30Dias : false;
        }
        return true;
      })
      .sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      });
  }, [clientes, search, periodo]);

  // Contadores dinámicos
  const now = new Date();
  const hoyInicio = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const hace7Dias = new Date();
  hace7Dias.setDate(now.getDate() - 7);

  const nuevosHoy = clientes.filter((c) => c.createdAt && new Date(c.createdAt) >= hoyInicio).length;
  const nuevosSemana = clientes.filter((c) => c.createdAt && new Date(c.createdAt) >= hace7Dias).length;
  const totalGastoNuevos = filteredList.reduce((acc, c) => acc + (c.totalGastado || 0), 0);

  const money = (val: number) =>
    `$${val.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Sidebar />

      <div className={`min-h-screen transition-all duration-300 ${collapsed ? "ml-[80px]" : "ml-[250px]"}`}>
        <Header />

        <div className="p-10">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
              Clientes
            </p>

            <h1 className="mt-2 text-3xl font-bold text-black">
              Clientes nuevos
            </h1>

            <p className="mt-2 text-sm text-[#777777]">
              Clientes registrados recientemente en tu punto de venta y sucursal.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="border border-[#E5E5E5] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Nuevos hoy
              </p>
              <p className="mt-3 text-3xl font-bold text-black">{nuevosHoy}</p>
            </div>

            <div className="border border-[#E5E5E5] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Esta semana
              </p>
              <p className="mt-3 text-3xl font-bold text-black">{nuevosSemana}</p>
            </div>

            <div className="border border-[#D8A814] bg-[#D8A814] p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-wider">
                Total gastado por nuevos
              </p>
              <p className="mt-3 text-3xl font-bold">{money(totalGastoNuevos)}</p>
            </div>
          </div>

          <div className="mb-6 flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar cliente nuevo..."
                className="h-12 w-full border border-[#E0E0E0] bg-white pl-11 pr-5 text-black outline-none focus:border-[#D8A814]"
              />
            </div>

            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value as any)}
              className="h-12 min-w-[190px] border border-[#E0E0E0] bg-white px-4 text-black outline-none focus:border-[#D8A814]"
            >
              <option value="todos">Todos los registros</option>
              <option value="hoy">Registrados hoy</option>
              <option value="7dias">Últimos 7 días</option>
              <option value="30dias">Últimos 30 días</option>
            </select>
          </div>

          <div className="border border-[#E5E5E5] bg-white">
            <div className="grid grid-cols-[2fr_1.2fr_1.2fr_1.2fr_1fr] border-b border-[#E5E5E5] bg-[#FAFAFA] px-6 py-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Cliente
              </p>
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Teléfono
              </p>
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Localidad
              </p>
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Fecha de registro
              </p>
              <p className="text-right text-xs font-bold uppercase tracking-wider text-[#777777]">
                Compras acumuladas
              </p>
            </div>

            {loading ? (
              <div className="py-12 text-center text-sm text-[#777777]">
                Cargando nuevos clientes...
              </div>
            ) : filteredList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users size={40} className="text-[#CCCCCC]" />
                <p className="mt-3 text-base font-bold text-black">
                  No hay clientes registrados en este periodo
                </p>
                <p className="mt-1 text-xs text-[#777777]">
                  Cuando registres nuevos clientes en el sistema aparecerán listados aquí.
                </p>
                <Link
                  href="/clientes"
                  className="mt-4 bg-[#D8A814] px-5 py-2.5 text-xs font-bold text-white hover:bg-black transition-colors"
                >
                  Ir al catálogo de clientes
                </Link>
              </div>
            ) : (
              filteredList.map((customer) => (
                <div
                  key={customer.id}
                  className="grid grid-cols-[2fr_1.2fr_1.2fr_1.2fr_1fr] items-center border-b border-[#EEEEEE] px-6 py-4 last:border-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#050505] font-bold text-white">
                      {(customer.nombre || "C").charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <p className="font-semibold text-black">{customer.nombre}</p>
                      <p className="mt-1 text-xs text-[#999999]">
                        {customer.rfc || "Sin RFC"}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-[#555555]">{customer.telefono || "Sin teléfono"}</p>
                  <p className="text-sm text-[#555555]">{customer.localidad || "General"}</p>
                  <p className="text-sm text-[#555555]">
                    {customer.createdAt
                      ? new Date(customer.createdAt).toLocaleDateString("es-MX", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Reciente"}
                  </p>
                  <p className="text-right font-bold text-[#D8A814]">
                    {money(customer.totalGastado || 0)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}