"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSidebar } from "@/context/SidebarContext";

import MetricCard from "@/components/dashboard/MetricCard";
import TopProducts from "@/components/dashboard/TopProducts";
import FrequentCustomers from "@/components/dashboard/FrequentCustomers";
import TopSellers from "@/components/dashboard/TopSellers";
import PendingFollowUps from "@/components/dashboard/PendingFollowUps";
import VentasCortesDiaChart from "@/components/dashboard/VentasCortesDiaChart";
import { apiRequest } from "@/services/api";
import { getOrganizacionId, getUsuarioActual } from "@/services/auth";
import { getClientes, Cliente } from "@/services/clientes";
import { enqueueOfflineCalendario, syncOfflineCalendario } from "@/services/calendarioSync";
import { getResumenVentasYCortesDia, ResumenDiaVentasYCortes } from "@/services/cajaService";
import { Clock, CalendarDays, CalendarRange, RefreshCw } from "lucide-react";

type Periodo = "dia" | "semana" | "mes";

export default function InicioPage() {
  const { collapsed } = useSidebar();

  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<Periodo>("dia");
  const [referenceDate, setReferenceDate] = useState<Date>(() => new Date());

  // Datos crudos
  const [allVentas, setAllVentas] = useState<any[]>([]);
  const [allClientes, setAllClientes] = useState<Cliente[]>([]);
  const [allEventos, setAllEventos] = useState<any[]>([]);
  const [resumenCortesDia, setResumenCortesDia] = useState<ResumenDiaVentasYCortes | null>(null);
  const [currentUsuario, setCurrentUsuario] = useState<any>(null);

  // Carga inicial y obtención de datos reales
  const loadDashboardData = useCallback(async (isSilent = false) => {
    const user = getUsuarioActual();
    setCurrentUsuario(user);
    const orgId = getOrganizacionId() || user?.organizacionId;

    if (!orgId) {
      setLoading(false);
      return;
    }

    if (!isSilent) setLoading(true);

    try {
      const [resumen, ventasRaw, clientes, eventosRaw] = await Promise.all([
        apiRequest<any>(`/ventas/resumen/${orgId}`).catch(() => null),
        apiRequest<any[]>(`/ventas/organizacion/${orgId}`).catch(() => [] as any[]),
        getClientes(orgId).catch(() => [] as Cliente[]),
        apiRequest<any[]>(`/calendario?organizacionId=${orgId}`).catch(() => {
          if (typeof window !== "undefined") {
            try {
              const cached = localStorage.getItem(`inagerlis_offline_calendario_${orgId}`);
              return cached ? JSON.parse(cached) : [];
            } catch {
              return [];
            }
          }
          return [];
        }),
      ]);

      // Si /ventas/organizacion trae datos los usamos, de lo contrario usamos las ventas del resumen
      let ventasList: any[] = [];
      if (Array.isArray(ventasRaw) && ventasRaw.length > 0) {
        ventasList = ventasRaw;
      } else if (resumen?.ultimasVentas && Array.isArray(resumen.ultimasVentas)) {
        ventasList = resumen.ultimasVentas;
      }

      setAllVentas(ventasList);
      setAllClientes(Array.isArray(clientes) ? clientes : []);

      // Cargar resumen de ventas del día por horas y cortes de caja
      try {
        const cortesRes = await getResumenVentasYCortesDia(orgId, ventasList);
        setResumenCortesDia(cortesRes);
      } catch (e) {
        console.warn("Error cargando resumen de cortes de caja:", e);
      }

      if (Array.isArray(eventosRaw)) {
        setAllEventos(eventosRaw);
        if (typeof window !== "undefined" && eventosRaw.length > 0) {
          try {
            localStorage.setItem(`inagerlis_offline_calendario_${orgId}`, JSON.stringify(eventosRaw));
          } catch {}
        }
      }
    } catch (err) {
      console.error("Error al cargar datos del dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar al montar
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Detector de cambio de día automático (ej. al pasar las 12:00 AM) y refresco periódico
  useEffect(() => {
    const checkDayInterval = setInterval(() => {
      const now = new Date();
      // Si cambió el día calendario respecto a la fecha de referencia
      if (now.toDateString() !== referenceDate.toDateString()) {
        setReferenceDate(now);
        loadDashboardData(true);
      }
    }, 15000); // Chequea cada 15s

    // Refresco silencioso cada 2 minutos para captar ventas nuevas
    const pollingInterval = setInterval(() => {
      loadDashboardData(true);
    }, 120000);

    // Al regresar a la pestaña activa o restablecer conexión
    const handleFocusOrOnline = () => {
      const now = new Date();
      if (now.toDateString() !== referenceDate.toDateString()) {
        setReferenceDate(now);
      }
      loadDashboardData(true);
      const user = getUsuarioActual();
      const orgId = getOrganizacionId() || user?.organizacionId;
      if (
        orgId &&
        typeof window !== "undefined" &&
        navigator.onLine &&
        typeof syncOfflineCalendario === "function"
      ) {
        syncOfflineCalendario(orgId)
          .then((res) => {
            if (res && res.synced > 0) {
              try {
                const raw = localStorage.getItem(`inagerlis_offline_calendario_${orgId}`);
                if (raw) setAllEventos(JSON.parse(raw));
              } catch {}
            }
          })
          .catch((err) => console.warn("Error en auto-sync calendario:", err));
      }
    };

    window.addEventListener("focus", handleFocusOrOnline);
    window.addEventListener("online", handleFocusOrOnline);
    return () => {
      clearInterval(checkDayInterval);
      clearInterval(pollingInterval);
      window.removeEventListener("focus", handleFocusOrOnline);
      window.removeEventListener("online", handleFocusOrOnline);
    };
  }, [referenceDate, loadDashboardData]);

  // Cálculo de rango de fechas del periodo seleccionado
  const dateRange = useMemo(() => {
    const now = referenceDate;

    if (periodo === "dia") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      const label = now.toLocaleDateString("es-MX", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      return {
        start,
        end,
        badge: label.charAt(0).toUpperCase() + label.slice(1),
        title: "Resumen de hoy",
        salesTitle: "Ventas de hoy",
        salesDesc: "Ventas registradas hoy",
        emptySalesDesc: "Sin ventas registradas hoy",
        clientsDesc: "Registrados hoy",
      };
    }

    if (periodo === "semana") {
      const dayOfWeek = now.getDay();
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday, 0, 0, 0, 0);
      const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);

      const startStr = start.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
      const endStr = end.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
      return {
        start,
        end,
        badge: `${startStr} - ${endStr}`,
        title: "Resumen de esta semana",
        salesTitle: "Ventas de la semana",
        salesDesc: "Ventas acumuladas esta semana",
        emptySalesDesc: "Sin ventas registradas esta semana",
        clientsDesc: "Registrados esta semana",
      };
    }

    // periodo === "mes"
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const monthName = now.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
    return {
      start,
      end,
      badge: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      title: "Resumen de este mes",
      salesTitle: "Ventas del mes",
      salesDesc: "Ventas acumuladas este mes",
      emptySalesDesc: "Sin ventas registradas este mes",
      clientsDesc: "Registrados este mes",
    };
  }, [periodo, referenceDate]);

  // Métricas y datos filtrados por el periodo seleccionado
  const computedData = useMemo(() => {
    // 1. Filtrar ventas por el rango
    const ventasFiltradas = allVentas.filter((v) => {
      if (!v.createdAt) return false;
      const f = new Date(v.createdAt);
      return f >= dateRange.start && f <= dateRange.end;
    });

    const ventasTotal = ventasFiltradas.reduce((acc, v) => acc + Number(v.total || 0), 0);
    const totalTickets = ventasFiltradas.length;
    const ticketPromedio = totalTickets > 0 ? ventasTotal / totalTickets : 0;

    // 2. Clientes nuevos creados en el periodo
    const clientesNuevos = allClientes.filter((c) => {
      if (!c.createdAt) return false;
      const f = new Date(c.createdAt);
      return f >= dateRange.start && f <= dateRange.end;
    }).length;

    // 3. Clientes con compras en el periodo
    const clientesCompradores = new Set(
      ventasFiltradas.map((v) => v.clienteId).filter(Boolean)
    );
    const clientesFrecuentes = clientesCompradores.size;

    // 4. Top Productos en el periodo
    const articulosMap: Record<string, { name: string; sales: number }> = {};
    ventasFiltradas.forEach((v) => {
      if (Array.isArray(v.detalles)) {
        v.detalles.forEach((d: any) => {
          const artNombre = d.articulo?.nombre || d.nombreArticulo || "Artículo";
          if (!articulosMap[artNombre]) {
            articulosMap[artNombre] = { name: artNombre, sales: 0 };
          }
          articulosMap[artNombre].sales += Number(d.cantidad || 1);
        });
      }
    });

    const topProducts = Object.values(articulosMap)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    // 5. Mejores vendedores en el periodo
    const vendedoresMap: Record<string, { name: string; total: number; operations: number }> = {};
    ventasFiltradas.forEach((v) => {
      const nombreVendedor = v.usuario?.nombre || currentUsuario?.nombre || "Vendedor";
      if (!vendedoresMap[nombreVendedor]) {
        vendedoresMap[nombreVendedor] = { name: nombreVendedor, total: 0, operations: 0 };
      }
      vendedoresMap[nombreVendedor].total += Number(v.total || 0);
      vendedoresMap[nombreVendedor].operations += 1;
    });

    const topSellers = Object.values(vendedoresMap)
      .sort((a, b) => b.total - a.total)
      .map((s) => ({
        name: s.name,
        sales: `$${s.total.toLocaleString("es-MX", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        operations: s.operations,
      }));

    // 6. Clientes recurrentes
    const clientesGastosMap: Record<string, { name: string; purchases: number; spent: number }> = {};
    ventasFiltradas.forEach((v) => {
      if (v.cliente && v.cliente.nombre) {
        const cNombre = v.cliente.nombre;
        if (!clientesGastosMap[cNombre]) {
          clientesGastosMap[cNombre] = { name: cNombre, purchases: 0, spent: 0 };
        }
        clientesGastosMap[cNombre].purchases += 1;
        clientesGastosMap[cNombre].spent += Number(v.total || 0);
      }
    });

    let frequentCustomers = Object.values(clientesGastosMap)
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5)
      .map((c) => ({
        initial: c.name.charAt(0).toUpperCase(),
        name: c.name,
        purchases: c.purchases,
        spent: `$${c.spent.toLocaleString("es-MX", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
      }));

    // Si en el periodo no hubo clientes identificados, recurrimos a los frecuentes registrados
    if (frequentCustomers.length === 0) {
      const frecuentesGlobales = allClientes.filter(
        (c) => (c.comprasCount && c.comprasCount > 0) || (c.puntos && c.puntos > 0)
      );
      frequentCustomers = frecuentesGlobales.slice(0, 5).map((c) => ({
        initial: (c.nombre || "C").charAt(0).toUpperCase(),
        name: c.nombre,
        purchases: c.comprasCount || 1,
        spent: `$${(c.totalGastado || 0).toLocaleString("es-MX", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
      }));
    }

    return {
      ventasTotal,
      totalTickets,
      ticketPromedio,
      clientesNuevos,
      clientesFrecuentes,
      topProducts,
      topSellers,
      frequentCustomers,
    };
  }, [allVentas, allClientes, dateRange, currentUsuario]);

  // Recordatorios y Pedidos más cercanos
  const recordatoriosCercanos = useMemo(() => {
    if (!Array.isArray(allEventos) || allEventos.length === 0) return [];

    const hoyDate = new Date();
    const hoyStr = hoyDate.toISOString().split("T")[0];

    const mananaDate = new Date(hoyDate);
    mananaDate.setDate(mananaDate.getDate() + 1);
    const mananaStr = mananaDate.toISOString().split("T")[0];

    // Solo pendientes
    const pendientes = allEventos.filter(
      (ev) => ev.estado !== "COMPLETADO" && ev.estado !== "CANCELADO"
    );

    // Ordenar: Hoy primero, luego atrasados urgentes, luego futuros próximos
    const ordenados = [...pendientes].sort((a, b) => {
      const aEsHoy = a.fecha === hoyStr;
      const bEsHoy = b.fecha === hoyStr;
      if (aEsHoy && !bEsHoy) return -1;
      if (!aEsHoy && bEsHoy) return 1;

      const aAtrasado = a.fecha < hoyStr;
      const bAtrasado = b.fecha < hoyStr;
      if (aAtrasado && !bAtrasado) return -1;
      if (!aAtrasado && bAtrasado) return 1;

      const aKey = `${a.fecha} ${a.hora || "00:00"}`;
      const bKey = `${b.fecha} ${b.hora || "00:00"}`;
      return aKey.localeCompare(bKey);
    });

    return ordenados.slice(0, 5).map((ev) => {
      let proximidadLabel = ev.fecha;
      const esHoy = ev.fecha === hoyStr;
      const esAtrasado = ev.fecha < hoyStr;

      if (esHoy) {
        proximidadLabel = "Hoy";
      } else if (ev.fecha === mananaStr) {
        proximidadLabel = "Mañana";
      } else if (esAtrasado) {
        proximidadLabel = "Atrasado";
      } else {
        try {
          const [y, m, d] = ev.fecha.split("-");
          const dt = new Date(Number(y), Number(m) - 1, Number(d));
          proximidadLabel = dt.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
        } catch {
          proximidadLabel = ev.fecha;
        }
      }

      return {
        id: ev.id,
        title: ev.titulo,
        description: ev.descripcion,
        tipo: ev.tipo,
        fecha: ev.fecha,
        hora: ev.hora || null,
        monto: ev.monto ? Number(ev.monto) : null,
        clienteNombre: ev.clienteNombre,
        telefono: ev.telefono,
        prioridad: ev.prioridad,
        estado: ev.estado,
        urgent: ev.prioridad === "URGENTE",
        proximidadLabel,
        esHoy,
        esAtrasado,
      };
    });
  }, [allEventos]);

  // Completar rápido desde el dashboard
  const handleToggleRecordatorio = async (id: string) => {
    const orgId = getOrganizacionId() || currentUsuario?.organizacionId;
    const updated = allEventos.map((ev) =>
      ev.id === id ? { ...ev, estado: "COMPLETADO" } : ev
    );
    setAllEventos(updated);

    if (typeof window !== "undefined" && orgId) {
      try {
        localStorage.setItem(`inagerlis_offline_calendario_${orgId}`, JSON.stringify(updated));
      } catch {}
    }

    try {
      await apiRequest(`/calendario/${id}`, {
        method: "PUT",
        body: JSON.stringify({ estado: "COMPLETADO" }),
      });
    } catch (err) {
      if (orgId && typeof enqueueOfflineCalendario === "function") {
        enqueueOfflineCalendario(orgId, "UPDATE", { estado: "COMPLETADO" }, id);
      }
    }
  };

  const money = (val: number) =>
    `$${val.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Sidebar />

      <div
        className={`min-h-screen transition-all duration-300 ${
          collapsed ? "ml-[80px]" : "ml-[250px]"
        }`}
      >
        <Header />

        <div className="p-10">
          {/* Cabecera del Dashboard con Selector de Periodo */}
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
                Dashboard
              </p>

              <h2 className="mt-2 text-2xl font-bold text-black">
                {dateRange.title}
              </h2>
            </div>

            {/* Pestañas: Día, Semana, Mes */}
            <div className="flex items-center gap-2">
              <div className="flex border border-[#E0E0E0] bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setPeriodo("dia")}
                  className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    periodo === "dia"
                      ? "bg-black text-[#D8A814]"
                      : "bg-white text-[#777777] hover:bg-[#FAFAFA] hover:text-black"
                  }`}
                >
                  <Clock size={14} />
                  <span>Hoy</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPeriodo("semana")}
                  className={`flex items-center gap-2 border-l border-[#E0E0E0] px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    periodo === "semana"
                      ? "bg-black text-[#D8A814]"
                      : "bg-white text-[#777777] hover:bg-[#FAFAFA] hover:text-black"
                  }`}
                >
                  <CalendarDays size={14} />
                  <span>Esta semana</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPeriodo("mes")}
                  className={`flex items-center gap-2 border-l border-[#E0E0E0] px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    periodo === "mes"
                      ? "bg-black text-[#D8A814]"
                      : "bg-white text-[#777777] hover:bg-[#FAFAFA] hover:text-black"
                  }`}
                >
                  <CalendarRange size={14} />
                  <span>Este mes</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => loadDashboardData()}
                title="Actualizar datos"
                disabled={loading}
                className="flex h-[38px] w-[38px] items-center justify-center border border-[#E0E0E0] bg-white text-[#777777] shadow-sm transition-colors hover:border-black hover:text-black cursor-pointer"
              >
                <RefreshCw
                  size={14}
                  className={loading ? "animate-spin text-[#D8A814]" : ""}
                />
              </button>
            </div>
          </div>

          {/* Métricas Reales */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title={dateRange.salesTitle}
              value={money(computedData.ventasTotal)}
              description={
                computedData.ventasTotal > 0
                  ? `${dateRange.salesDesc} (${computedData.totalTickets} tickets)`
                  : dateRange.emptySalesDesc
              }
              accent
            />

            <MetricCard
              title="Clientes nuevos"
              value={computedData.clientesNuevos.toString()}
              description={dateRange.clientsDesc}
            />

            <MetricCard
              title="Clientes con compra"
              value={computedData.clientesFrecuentes.toString()}
              description="Con compras en el periodo"
            />

            <MetricCard
              title="Ticket promedio"
              value={money(computedData.ticketPromedio)}
              description={
                computedData.ticketPromedio > 0
                  ? "Promedio por operación"
                  : "Sin operaciones"
              }
            />
          </div>

          {/* Gráfica de Ventas del Día y Cortes de Caja */}
          <div className="mt-6">
            <VentasCortesDiaChart
              resumen={resumenCortesDia}
              loading={loading}
            />
          </div>

          {/* Primera fila */}
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <TopProducts products={computedData.topProducts} />

            <PendingFollowUps
              followUps={recordatoriosCercanos}
              onToggleCompletado={handleToggleRecordatorio}
            />
          </div>

          {/* Segunda fila */}
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <FrequentCustomers customers={computedData.frequentCustomers} />

            <TopSellers sellers={computedData.topSellers} />
          </div>
        </div>
      </div>
    </main>
  );
}