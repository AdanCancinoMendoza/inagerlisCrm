"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSidebar } from "@/context/SidebarContext";
import { Cliente, getClientes } from "@/services/clientes";
import { getOrganizacionId, getUsuarioActual } from "@/services/auth";
import { Users, Search, UserCheck } from "lucide-react";

export default function ClientesFrecuentesPage() {
  const { collapsed } = useSidebar();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [criterio, setCriterio] = useState<"frecuencia" | "gasto" | "puntos">("frecuencia");

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
        console.error("Error al cargar clientes frecuentes:", err);
        setClientes([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Filtrar clientes con actividad recurrente o compras
  const filteredList = useMemo(() => {
    const term = search.toLowerCase().trim();
    let res = clientes.filter((c) => {
      const match =
        c.nombre.toLowerCase().includes(term) ||
        (c.telefono && c.telefono.includes(term)) ||
        (c.localidad && c.localidad.toLowerCase().includes(term));
      return match;
    });

    if (criterio === "frecuencia") {
      res.sort((a, b) => (b.comprasCount || 0) - (a.comprasCount || 0));
    } else if (criterio === "gasto") {
      res.sort((a, b) => (b.totalGastado || 0) - (a.totalGastado || 0));
    } else if (criterio === "puntos") {
      res.sort((a, b) => (b.puntos || 0) - (a.puntos || 0));
    }

    return res;
  }, [clientes, search, criterio]);

  const totalFrecuentes = filteredList.filter((c) => (c.comprasCount || 0) > 1 || (c.puntos || 0) > 0).length;
  const totalCompras = filteredList.reduce((acc, c) => acc + (c.comprasCount || 0), 0);
  const promedioCompras = totalFrecuentes > 0 ? (totalCompras / totalFrecuentes).toFixed(1) : "0";
  const totalGastado = filteredList.reduce((acc, c) => acc + (c.totalGastado || 0), 0);
  const gastoPromedio = totalFrecuentes > 0 ? totalGastado / totalFrecuentes : 0;

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
              Clientes frecuentes
            </h1>

            <p className="mt-2 text-sm text-[#777777]">
              Identifica a los clientes con mayor frecuencia de compra y lealtad en tu negocio.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="border border-[#D8A814] bg-[#D8A814] p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-wider">
                Clientes frecuentes
              </p>

              <p className="mt-3 text-3xl font-bold">
                {totalFrecuentes}
              </p>
            </div>

            <div className="border border-[#E5E5E5] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Compras promedio
              </p>

              <p className="mt-3 text-3xl font-bold text-black">
                {promedioCompras}
              </p>
            </div>

            <div className="border border-[#E5E5E5] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Valor promedio
              </p>

              <p className="mt-3 text-3xl font-bold text-black">
                {money(gastoPromedio)}
              </p>
            </div>
          </div>

          <div className="mb-6 flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar cliente por nombre o teléfono..."
                className="h-12 w-full border border-[#E0E0E0] bg-white pl-11 pr-5 text-black outline-none focus:border-[#D8A814]"
              />
            </div>

            <select
              value={criterio}
              onChange={(e) => setCriterio(e.target.value as any)}
              className="h-12 min-w-[210px] border border-[#E0E0E0] bg-white px-4 text-black outline-none focus:border-[#D8A814]"
            >
              <option value="frecuencia">Mayor frecuencia</option>
              <option value="gasto">Mayor gasto</option>
              <option value="puntos">Mayor cantidad de puntos</option>
            </select>
          </div>

          <div className="border border-[#E5E5E5] bg-white">
            <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1.2fr] border-b border-[#E5E5E5] bg-[#FAFAFA] px-6 py-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Cliente
              </p>

              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Localidad
              </p>

              <p className="text-center text-xs font-bold uppercase tracking-wider text-[#777777]">
                Compras
              </p>

              <p className="text-right text-xs font-bold uppercase tracking-wider text-[#777777]">
                Total gastado
              </p>

              <p className="text-right text-xs font-bold uppercase tracking-wider text-[#777777]">
                Puntos
              </p>
            </div>

            {loading ? (
              <div className="py-12 text-center text-sm text-[#777777]">
                Cargando clientes frecuentes...
              </div>
            ) : filteredList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users size={40} className="text-[#CCCCCC]" />
                <p className="mt-3 text-base font-bold text-black">
                  No hay clientes registrados aún
                </p>
                <p className="mt-1 text-xs text-[#777777]">
                  Los clientes que registres y que realicen compras aparecerán aquí automáticamente.
                </p>
                <Link
                  href="/clientes"
                  className="mt-4 bg-[#D8A814] px-5 py-2.5 text-xs font-bold text-white hover:bg-black transition-colors"
                >
                  Ir al catálogo de clientes
                </Link>
              </div>
            ) : (
              filteredList.map((customer, index) => (
                <div
                  key={customer.id}
                  className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1.2fr] items-center border-b border-[#EEEEEE] px-6 py-4 last:border-none"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-full font-bold ${
                        index === 0
                          ? "bg-[#D8A814] text-white"
                          : "bg-[#050505] text-white"
                      }`}
                    >
                      {(customer.nombre || "C").charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <p className="font-semibold text-black">
                        {customer.nombre}
                      </p>

                      <p className="mt-1 text-xs text-[#999999]">
                        {customer.telefono || "Sin teléfono"}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-[#555555]">
                    {customer.localidad || "General"}
                  </p>

                  <p className="text-center text-lg font-bold text-black">
                    {customer.comprasCount || 0}
                  </p>

                  <p className="text-right font-bold text-[#D8A814]">
                    {money(customer.totalGastado || 0)}
                  </p>

                  <p className="text-right text-sm font-semibold text-[#555555]">
                    {customer.puntos || 0} pts
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