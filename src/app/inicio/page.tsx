"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSidebar } from "@/context/SidebarContext";

import MetricCard from "@/components/dashboard/MetricCard";
import TopProducts from "@/components/dashboard/TopProducts";
import FrequentCustomers from "@/components/dashboard/FrequentCustomers";
import TopSellers from "@/components/dashboard/TopSellers";
import PendingFollowUps from "@/components/dashboard/PendingFollowUps";
import { apiRequest } from "@/services/api";
import { getOrganizacionId, getUsuarioActual } from "@/services/auth";
import { getClientes, Cliente } from "@/services/clientes";

export default function InicioPage() {
  const { collapsed } = useSidebar();

  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState({
    ventasDia: 0,
    clientesNuevos: 0,
    clientesFrecuentes: 0,
    ticketPromedio: 0,
  });

  const [topProducts, setTopProducts] = useState<Array<{ name: string; sales: number }>>([]);
  const [frequentCustomers, setFrequentCustomers] = useState<
    Array<{ initial: string; name: string; purchases: number; spent: string }>
  >([]);
  const [topSellers, setTopSellers] = useState<
    Array<{ name: string; sales: string; operations: number }>
  >([]);

  const loadDashboardData = useCallback(async () => {
    const user = getUsuarioActual();
    const orgId = getOrganizacionId() || user?.organizacionId;

    if (!orgId) {
      setLoading(false);
      return;
    }

    try {
      // 1. Cargar resumen de ventas real
      const resumen = await apiRequest<any>(`/ventas/resumen/${orgId}`).catch(() => null);

      // 2. Cargar clientes reales
      const clientes = await getClientes(orgId).catch(() => [] as Cliente[]);

      const ventasTotal = resumen?.totalIngresos || 0;
      const ticketProm = resumen?.ticketPromedio || 0;
      const totalTickets = resumen?.totalTickets || 0;

      // Calcular clientes frecuentes y nuevos
      const frecuentes = clientes.filter(
        (c) => (c.comprasCount && c.comprasCount > 1) || (c.puntos && c.puntos > 0)
      );

      // Clientes creados en los últimos 30 días
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);
      const nuevos = clientes.filter((c) => {
        if (!c.createdAt) return false;
        return new Date(c.createdAt) >= hace30Dias;
      });

      setMetricas({
        ventasDia: ventasTotal,
        clientesNuevos: nuevos.length,
        clientesFrecuentes: frecuentes.length,
        ticketPromedio: ticketProm,
      });

      // Top Productos reales
      if (resumen?.topArticulos && Array.isArray(resumen.topArticulos)) {
        setTopProducts(
          resumen.topArticulos.map((art: any) => ({
            name: art.nombre,
            sales: art.unidades,
          }))
        );
      } else {
        setTopProducts([]);
      }

      // Clientes frecuentes reales
      if (frecuentes.length > 0) {
        setFrequentCustomers(
          frecuentes.slice(0, 5).map((c) => ({
            initial: (c.nombre || "C").charAt(0).toUpperCase(),
            name: c.nombre,
            purchases: c.comprasCount || 1,
            spent: `$${(c.totalGastado || 0).toLocaleString("es-MX", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
          }))
        );
      } else {
        setFrequentCustomers([]);
      }

      // Vendedores reales
      if (user?.nombre && totalTickets > 0) {
        setTopSellers([
          {
            name: user.nombre,
            sales: `$${ventasTotal.toLocaleString("es-MX", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            operations: totalTickets,
          },
        ]);
      } else {
        setTopSellers([]);
      }
    } catch (err) {
      console.error("Error al cargar datos del dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const money = (val: number) =>
    `$${val.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Sidebar />

      <div className={`min-h-screen transition-all duration-300 ${collapsed ? "ml-[80px]" : "ml-[250px]"}`}>
        <Header />

        <div className="p-10">
          {/* Título */}
          <div className="mb-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
              Dashboard
            </p>

            <h2 className="mt-2 text-2xl font-bold text-black">
              Resumen de hoy
            </h2>
          </div>

          {/* Métricas Reales */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Ventas acumuladas"
              value={money(metricas.ventasDia)}
              description={metricas.ventasDia > 0 ? "Ventas registradas" : "Sin ventas registradas hoy"}
              accent
            />

            <MetricCard
              title="Clientes nuevos"
              value={metricas.clientesNuevos.toString()}
              description="Registrados recientemente"
            />

            <MetricCard
              title="Clientes frecuentes"
              value={metricas.clientesFrecuentes.toString()}
              description="Con compras o puntos"
            />

            <MetricCard
              title="Ticket promedio"
              value={money(metricas.ticketPromedio)}
              description={metricas.ticketPromedio > 0 ? "Promedio por operación" : "Sin operaciones"}
            />
          </div>

          {/* Primera fila */}
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <TopProducts products={topProducts} />

            <PendingFollowUps followUps={[]} />
          </div>

          {/* Segunda fila */}
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <FrequentCustomers customers={frequentCustomers} />

            <TopSellers sellers={topSellers} />
          </div>
        </div>
      </div>
    </main>
  );
}