"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  CalendarDays,
  Download,
  FileDown,
  FileSpreadsheet,
  Printer,
  Search,
  Package,
  Users,
  ShoppingCart,
  Boxes,
  Loader2,
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSidebar } from "@/context/SidebarContext";
import { apiRequest } from "@/services/api";
import { getOrganizacionId, getUsuarioActual } from "@/services/auth";
import { getClientes, Cliente } from "@/services/clientes";

const tabs = ["Ventas", "Clientes", "Artículos", "Inventario"];

export default function ReportesPage() {
  const { collapsed } = useSidebar();
  const [activeTab, setActiveTab] = useState("Ventas");
  const [loading, setLoading] = useState(true);

  // Filtros
  const hoyStr = new Date().toISOString().split("T")[0];
  const inicioMesStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
  const [fechaDesde, setFechaDesde] = useState(inicioMesStr);
  const [fechaHasta, setFechaHasta] = useState(hoyStr);
  const [sucursalFiltro, setSucursalFiltro] = useState("Todas las sucursales");

  // Datos reales desde Backend
  const [sucursales, setSucursales] = useState<Array<{ id: string; nombre: string }>>([]);
  const [ventas, setVentas] = useState<any[]>([]);
  const [resumenVentas, setResumenVentas] = useState<any>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [articulos, setArticulos] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    const user = getUsuarioActual();
    const orgId = getOrganizacionId() || user?.organizacionId;

    if (!orgId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [resumenRes, ventasRes, clientesRes, articulosRes, sucursalesRes] = await Promise.allSettled([
        apiRequest<any>(`/ventas/resumen/${orgId}`),
        apiRequest<any[]>(`/ventas/organizacion/${orgId}`),
        getClientes(orgId),
        apiRequest<any[]>(`/articulos?organizacionId=${orgId}`),
        apiRequest<any[]>(`/sucursales?organizacionId=${orgId}`),
      ]);

      if (resumenRes.status === "fulfilled") setResumenVentas(resumenRes.value);
      if (ventasRes.status === "fulfilled") setVentas(Array.isArray(ventasRes.value) ? ventasRes.value : []);
      if (clientesRes.status === "fulfilled") setClientes(Array.isArray(clientesRes.value) ? clientesRes.value : []);
      if (articulosRes.status === "fulfilled") setArticulos(Array.isArray(articulosRes.value) ? articulosRes.value : []);
      if (sucursalesRes.status === "fulfilled") setSucursales(Array.isArray(sucursalesRes.value) ? sucursalesRes.value : []);
    } catch (err) {
      console.error("Error al cargar reportes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtrado de ventas por fechas
  const ventasFiltradas = useMemo(() => {
    return ventas.filter((v) => {
      const fechaVenta = new Date(v.createdAt).toISOString().split("T")[0];
      const matchDesde = !fechaDesde || fechaVenta >= fechaDesde;
      const matchHasta = !fechaHasta || fechaVenta <= fechaHasta;
      return matchDesde && matchHasta;
    });
  }, [ventas, fechaDesde, fechaHasta]);

  // Métricas calculadas en tiempo real
  const totalVentas = useMemo(() => {
    return ventasFiltradas.reduce((acc, v) => acc + Number(v.total || 0), 0);
  }, [ventasFiltradas]);

  const totalTickets = ventasFiltradas.length;
  const ticketPromedio = totalTickets > 0 ? totalVentas / totalTickets : 0;

  // Cálculo de artículos vendidos a partir de las ventas filtradas
  const salesRows = useMemo(() => {
    const map: Record<string, { id: string; article: string; units: number; revenue: number; cost: number; profit: number }> = {};

    ventasFiltradas.forEach((v) => {
      if (v.detalles && Array.isArray(v.detalles)) {
        v.detalles.forEach((d: any) => {
          const artId = d.articuloId || d.articulo?.id || d.nombre;
          const artName = d.articulo?.nombre || d.nombre || "Artículo";
          const precioCompra = Number(d.articulo?.precioCompra || 0);
          const cantidad = Number(d.cantidad || 0);
          const subtotal = Number(d.subtotal || 0);
          const costo = precioCompra * cantidad;
          const ganancia = subtotal - costo;

          if (!map[artId]) {
            map[artId] = {
              id: artId,
              article: artName,
              units: 0,
              revenue: 0,
              cost: 0,
              profit: 0,
            };
          }

          map[artId].units += cantidad;
          map[artId].revenue += subtotal;
          map[artId].cost += costo;
          map[artId].profit += ganancia;
        });
      }
    });

    return Object.values(map).map((row) => ({
      ...row,
      margin: row.revenue > 0 ? `${((row.profit / row.revenue) * 100).toFixed(1)}%` : "0%",
    }));
  }, [ventasFiltradas]);

  const totalCosto = useMemo(() => {
    return salesRows.reduce((acc, r) => acc + r.cost, 0);
  }, [salesRows]);

  const totalGanancia = totalVentas - totalCosto;
  const margenBruto = totalVentas > 0 ? `${((totalGanancia / totalVentas) * 100).toFixed(1)}%` : "0%";

  const money = (value: number) =>
    `$${(value || 0).toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Sidebar />

      <div className={`min-h-screen transition-all duration-300 ${collapsed ? "ml-[80px]" : "ml-[250px]"}`}>
        <Header />

        <div className="p-10">
          {/* Encabezado */}
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
                Reportes y Analíticas
              </p>

              <h1 className="mt-2 text-3xl font-bold text-black">
                Informes del negocio
              </h1>

              <p className="mt-2 text-sm text-[#777777]">
                Consulta ventas, catálogo, inventario y comportamiento de clientes con datos en tiempo real.
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="flex h-12 items-center gap-2 border border-black px-5 text-sm font-bold text-black transition-colors hover:bg-black hover:text-white"
            >
              <Printer size={17} />
              Imprimir
            </button>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex border-b border-[#DCDCDC]">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  border-b-2 px-6 py-4
                  text-sm font-semibold
                  transition-colors
                  ${
                    activeTab === tab
                      ? "border-[#D8A814] text-[#D8A814]"
                      : "border-transparent text-[#777777] hover:text-black"
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Filtros */}
          <section className="border border-[#E2E2E2] bg-white">
            <div className="border-b border-[#EEEEEE] px-7 py-5">
              <h2 className="font-bold text-black">
                Filtros del reporte
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-[#777777]">
                  Desde
                </label>

                <div className="flex h-12 items-center border border-[#E0E0E0] bg-white px-4">
                  <CalendarDays size={17} className="mr-3 text-[#999999]" />
                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    className="w-full bg-transparent text-sm text-black outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-[#777777]">
                  Hasta
                </label>

                <div className="flex h-12 items-center border border-[#E0E0E0] bg-white px-4">
                  <CalendarDays size={17} className="mr-3 text-[#999999]" />
                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    className="w-full bg-transparent text-sm text-black outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-[#777777]">
                  Sucursal
                </label>

                <select
                  value={sucursalFiltro}
                  onChange={(e) => setSucursalFiltro(e.target.value)}
                  className="h-12 w-full border border-[#E0E0E0] bg-white px-4 text-sm text-black outline-none focus:border-[#D8A814]"
                >
                  <option value="Todas las sucursales">Todas las sucursales</option>
                  {sucursales.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={loadData}
                  className="flex h-12 w-full items-center justify-center gap-2 bg-[#D8A814] px-5 text-sm font-bold text-white hover:bg-black transition-colors"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                  Actualizar reporte
                </button>
              </div>
            </div>
          </section>

          {/* Tarjetas resumen reales */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="border border-[#D8A814] bg-[#D8A814] p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-wider">
                Ventas brutas
              </p>

              <p className="mt-4 text-3xl font-bold">
                {money(totalVentas)}
              </p>

              <p className="mt-2 text-sm opacity-90">
                Periodo seleccionado
              </p>
            </div>

            <div className="border border-[#E2E2E2] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Costo mercancía
              </p>

              <p className="mt-4 text-3xl font-bold text-black">
                {money(totalCosto)}
              </p>

              <p className="mt-2 text-sm text-[#888888]">
                Costo base de compra
              </p>
            </div>

            <div className="border border-[#E2E2E2] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Ganancia estimada
              </p>

              <p className="mt-4 text-3xl font-bold text-black">
                {money(totalGanancia)}
              </p>

              <p className="mt-2 text-sm text-[#D8A814] font-semibold">
                {margenBruto} margen bruto
              </p>
            </div>

            <div className="border border-[#E2E2E2] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Tickets
              </p>

              <p className="mt-4 text-3xl font-bold text-black">
                {totalTickets}
              </p>

              <p className="mt-2 text-sm text-[#888888]">
                Ticket promedio {money(ticketPromedio)}
              </p>
            </div>
          </div>

          {/* Vista del reporte */}
          <section className="mt-6 border border-[#E2E2E2] bg-white">
            <div className="flex items-center justify-between border-b border-[#EEEEEE] px-7 py-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                  Vista previa
                </p>

                <h2 className="mt-1 text-xl font-bold text-black">
                  Reporte de {activeTab.toLowerCase()}
                </h2>

                <p className="mt-1 text-sm text-[#888888]">
                  {fechaDesde} al {fechaHasta} · {sucursalFiltro}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex h-10 items-center gap-2 border border-[#E0E0E0] px-4 text-sm font-semibold text-black hover:border-black"
                >
                  <FileDown size={16} />
                  PDF
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center text-sm text-[#777777]">
                <Loader2 size={32} className="mx-auto mb-3 animate-spin text-[#D8A814]" />
                Cargando datos del informe...
              </div>
            ) : null}

            {/* TAB: VENTAS */}
            {!loading && activeTab === "Ventas" && (
              <>
                <div className="grid grid-cols-[2fr_.7fr_1fr_1fr_1fr_.8fr] bg-[#FAFAFA] px-6 py-4">
                  <p className="text-xs font-bold uppercase text-[#777777]">Artículo</p>
                  <p className="text-right text-xs font-bold uppercase text-[#777777]">Unidades</p>
                  <p className="text-right text-xs font-bold uppercase text-[#777777]">Venta</p>
                  <p className="text-right text-xs font-bold uppercase text-[#777777]">Costo</p>
                  <p className="text-right text-xs font-bold uppercase text-[#777777]">Ganancia</p>
                  <p className="text-right text-xs font-bold uppercase text-[#777777]">Margen</p>
                </div>

                {salesRows.length === 0 ? (
                  <div className="py-16 text-center text-sm text-[#888888]">
                    <ShoppingCart size={40} className="mx-auto mb-3 text-[#CCCCCC]" />
                    <p className="font-bold text-black">No hay ventas registradas en el periodo seleccionado</p>
                    <p className="text-xs text-[#888888] mt-1">Realiza cobros en la terminal de ventas para ver el desglose aquí.</p>
                  </div>
                ) : (
                  salesRows.map((row) => (
                    <div
                      key={row.id}
                      className="grid grid-cols-[2fr_.7fr_1fr_1fr_1fr_.8fr] items-center border-t border-[#EEEEEE] px-6 py-5"
                    >
                      <p className="font-bold text-black">{row.article}</p>
                      <p className="text-right font-semibold text-black">{row.units}</p>
                      <p className="text-right font-bold text-black">{money(row.revenue)}</p>
                      <p className="text-right text-sm text-[#666666]">{money(row.cost)}</p>
                      <p className="text-right font-bold text-[#D8A814]">{money(row.profit)}</p>
                      <p className="text-right text-sm font-semibold text-black">{row.margin}</p>
                    </div>
                  ))
                )}
              </>
            )}

            {/* TAB: CLIENTES */}
            {!loading && activeTab === "Clientes" && (
              <>
                <div className="grid grid-cols-[2fr_1.2fr_.8fr_1fr_1.2fr_.8fr] bg-[#FAFAFA] px-6 py-4">
                  <p className="text-xs font-bold uppercase text-[#777777]">Cliente</p>
                  <p className="text-xs font-bold uppercase text-[#777777]">Teléfono</p>
                  <p className="text-center text-xs font-bold uppercase text-[#777777]">Compras</p>
                  <p className="text-right text-xs font-bold uppercase text-[#777777]">Total gastado</p>
                  <p className="text-right text-xs font-bold uppercase text-[#777777]">Puntos</p>
                  <p className="text-right text-xs font-bold uppercase text-[#777777]">Tipo</p>
                </div>

                {clientes.length === 0 ? (
                  <div className="py-16 text-center text-sm text-[#888888]">
                    <Users size={40} className="mx-auto mb-3 text-[#CCCCCC]" />
                    <p className="font-bold text-black">No hay clientes registrados</p>
                    <p className="text-xs text-[#888888] mt-1">Registra clientes en el CRM para consultar su historial de compras.</p>
                  </div>
                ) : (
                  clientes.map((c) => (
                    <div
                      key={c.id}
                      className="grid grid-cols-[2fr_1.2fr_.8fr_1fr_1.2fr_.8fr] items-center border-t border-[#EEEEEE] px-6 py-5"
                    >
                      <p className="font-bold text-black">{c.nombre}</p>
                      <p className="text-sm text-[#666666]">{c.telefono || "Sin teléfono"}</p>
                      <p className="text-center font-bold text-black">{c.comprasCount || 0}</p>
                      <p className="text-right font-bold text-[#D8A814]">{money(c.totalGastado || 0)}</p>
                      <p className="text-right text-sm text-[#666666]">{c.puntos || 0} pts</p>
                      <div className="text-right">
                        <span className="border border-[#D8A814] px-3 py-1 text-xs font-bold text-[#D8A814]">
                          {(c.comprasCount || 0) > 1 ? "Frecuente" : "Nuevo"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {/* TAB: ARTÍCULOS */}
            {!loading && activeTab === "Artículos" && (
              <>
                <div className="grid grid-cols-[2fr_1.2fr_.8fr_1fr_1fr] bg-[#FAFAFA] px-6 py-4">
                  <p className="text-xs font-bold uppercase text-[#777777]">Artículo</p>
                  <p className="text-xs font-bold uppercase text-[#777777]">Familia / Categoría</p>
                  <p className="text-right text-xs font-bold uppercase text-[#777777]">Precio Compra</p>
                  <p className="text-right text-xs font-bold uppercase text-[#777777]">Precio Venta</p>
                  <p className="text-right text-xs font-bold uppercase text-[#777777]">Margen Ganancia</p>
                </div>

                {articulos.length === 0 ? (
                  <div className="py-16 text-center text-sm text-[#888888]">
                    <Package size={40} className="mx-auto mb-3 text-[#CCCCCC]" />
                    <p className="font-bold text-black">No hay artículos en el catálogo</p>
                    <p className="text-xs text-[#888888] mt-1">Agrega productos en la sección de artículos.</p>
                  </div>
                ) : (
                  articulos.map((art) => {
                    const compra = Number(art.precioCompra || 0);
                    const venta = Number(art.precioVenta || 0);
                    const margen = venta - compra;
                    return (
                      <div
                        key={art.id}
                        className="grid grid-cols-[2fr_1.2fr_.8fr_1fr_1fr] items-center border-t border-[#EEEEEE] px-6 py-5"
                      >
                        <div>
                          <p className="font-bold text-black">{art.nombre}</p>
                          <p className="text-xs text-[#888888]">{art.codigo}</p>
                        </div>
                        <p className="text-sm text-[#666666]">{art.familia || "General"}</p>
                        <p className="text-right text-sm text-[#666666]">{money(compra)}</p>
                        <p className="text-right font-bold text-black">{money(venta)}</p>
                        <p className="text-right font-bold text-[#D8A814]">{money(margen)}</p>
                      </div>
                    );
                  })
                )}
              </>
            )}

            {/* TAB: INVENTARIO */}
            {!loading && activeTab === "Inventario" && (
              <>
                <div className="grid grid-cols-[2fr_.8fr_.8fr_1fr_1fr_1fr] bg-[#FAFAFA] px-6 py-4">
                  <p className="text-xs font-bold uppercase text-[#777777]">Artículo</p>
                  <p className="text-center text-xs font-bold uppercase text-[#777777]">Stock</p>
                  <p className="text-center text-xs font-bold uppercase text-[#777777]">Mínimo</p>
                  <p className="text-right text-xs font-bold uppercase text-[#777777]">Valor Costo</p>
                  <p className="text-right text-xs font-bold uppercase text-[#777777]">Valor Venta</p>
                  <p className="text-right text-xs font-bold uppercase text-[#777777]">Estado</p>
                </div>

                {articulos.length === 0 ? (
                  <div className="py-16 text-center text-sm text-[#888888]">
                    <Boxes size={40} className="mx-auto mb-3 text-[#CCCCCC]" />
                    <p className="font-bold text-black">No hay artículos en inventario</p>
                  </div>
                ) : (
                  articulos.map((art) => {
                    const stock = art.stockIlimitado ? 999 : (art.inventarios?.[0]?.stockActual ?? art.stockActual ?? 0);
                    const minimo = art.stockMinimo || 5;
                    const costoVal = stock * Number(art.precioCompra || 0);
                    const ventaVal = stock * Number(art.precioVenta || 0);
                    const status = art.stockIlimitado ? "Ilimitado" : stock <= 0 ? "Agotado" : stock <= minimo ? "Bajo" : "Normal";

                    return (
                      <div
                        key={art.id}
                        className="grid grid-cols-[2fr_.8fr_.8fr_1fr_1fr_1fr] items-center border-t border-[#EEEEEE] px-6 py-5"
                      >
                        <div>
                          <p className="font-bold text-black">{art.nombre}</p>
                          <p className="text-xs text-[#888888]">{art.codigo}</p>
                        </div>

                        <p className="text-center font-bold text-black">
                          {art.stockIlimitado ? "∞" : stock}
                        </p>

                        <p className="text-center text-sm text-[#777777]">
                          {art.stockIlimitado ? "—" : minimo}
                        </p>

                        <p className="text-right text-sm text-[#666666]">
                          {money(costoVal)}
                        </p>

                        <p className="text-right font-bold text-black">
                          {money(ventaVal)}
                        </p>

                        <div className="text-right">
                          <span
                            className={`
                              px-3 py-1 text-xs font-bold
                              ${
                                status === "Normal"
                                  ? "bg-[#D8A814] text-white"
                                  : status === "Agotado"
                                  ? "bg-red-500 text-white"
                                  : status === "Bajo"
                                  ? "bg-amber-500 text-white"
                                  : "bg-blue-600 text-white"
                              }
                            `}
                          >
                            {status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}

            {/* Pie del reporte */}
            <div className="flex items-center justify-between border-t border-[#E5E5E5] bg-[#FAFAFA] px-7 py-5">
              <p className="text-xs text-[#888888]">
                Reporte generado para uso administrativo y fiscal.
              </p>

              <p className="text-xs font-semibold text-black">
                {new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}