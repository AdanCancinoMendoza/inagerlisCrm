"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  CalendarDays,
  CreditCard,
  Download,
  Printer,
  ReceiptText,
  RotateCcw,
  Search,
  X,
  Zap,
  Ban,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSocket } from "@/hooks/useSocket";
import { useSidebar } from "@/context/SidebarContext";
import { apiRequest } from "@/services/api";
import { getOrganizacionId, getUsuarioActual } from "@/services/auth";

type TicketStatus = "Pagado" | "Devuelto" | "Cancelado";

interface TicketItem {
  name: string;
  quantity: number;
  price: number;
}

interface Ticket {
  id: string | number;
  folio: string;
  date: string;
  rawDate: string;
  time: string;
  customer: string;
  phone?: string;
  seller: string;
  branch: string;
  branchId?: string;
  terminal: string;
  payment: string;
  subtotal: number;
  tax: number;
  total: number;
  status: TicketStatus;
  items: TicketItem[];
}

const fallbackTickets: Ticket[] = [
  {
    id: "demo-1",
    folio: "T-000128",
    date: "30 Ago 2026",
    rawDate: "2026-08-30",
    time: "10:42 AM",
    customer: "Ana Martínez",
    phone: "222 145 8976",
    seller: "María López",
    branch: "Sucursal Centro",
    terminal: "Caja 02",
    payment: "Tarjeta",
    subtotal: 108.62,
    tax: 17.38,
    total: 126,
    status: "Pagado",
    items: [
      { name: "Coca-Cola 600 ml", quantity: 2, price: 18 },
      { name: "Sabritas Original 105 g", quantity: 3, price: 15 },
      { name: "Agua Ciel 1L", quantity: 2, price: 14 },
      { name: "Galletas Emperador", quantity: 1, price: 17 },
    ],
  },
  {
    id: "demo-2",
    folio: "T-000127",
    date: "30 Ago 2026",
    rawDate: "2026-08-30",
    time: "10:18 AM",
    customer: "Público general",
    seller: "José Ramírez",
    branch: "Sucursal Centro",
    terminal: "Caja 01",
    payment: "Efectivo",
    subtotal: 211.21,
    tax: 33.79,
    total: 245,
    status: "Pagado",
    items: [
      { name: "Coca-Cola 2L", quantity: 2, price: 38 },
      { name: "Sabritas Original", quantity: 4, price: 15 },
    ],
  },
];

export default function TicketsPage() {
  const { collapsed } = useSidebar();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedEstadoFilter, setSelectedEstadoFilter] = useState("Todos");
  const [selectedSucursal, setSelectedSucursal] = useState("Todas las sucursales");
  const [sucursales, setSucursales] = useState<{ id: string; nombre: string }[]>([]);

  // Estados para modal de Devolución / Cancelación
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    tipo: "DEVUELTO" | "CANCELADO";
    motivo: string;
  }>({
    open: false,
    tipo: "DEVUELTO",
    motivo: "",
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const usuario = typeof window !== "undefined" ? getUsuarioActual() : null;
  const orgId = typeof window !== "undefined" ? (getOrganizacionId() || usuario?.organizacionId) : null;
  const room = orgId ? `org_${orgId}` : undefined;
  const { socket } = useSocket(room);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const mapVentaToTicket = (v: any): Ticket => {
    const d = v.createdAt ? new Date(v.createdAt) : new Date();
    const dateStr = d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
    const rawDateStr = d.toISOString().split("T")[0];
    const timeStr = d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

    let st: TicketStatus = "Pagado";
    const estadoUpper = String(v.estado || "").toUpperCase();
    if (estadoUpper === "DEVUELTO") st = "Devuelto";
    else if (estadoUpper === "CANCELADO") st = "Cancelado";

    return {
      id: v.id,
      folio: v.folio || "T-000000",
      date: dateStr,
      rawDate: rawDateStr,
      time: timeStr,
      customer: v.cliente?.nombre || "Público general",
      phone: v.cliente?.telefono || undefined,
      seller: v.usuario?.nombre || "Cajero",
      branch: v.sucursal?.nombre || "Sucursal Principal",
      branchId: v.sucursalId,
      terminal: v.terminal?.nombre || "Caja Principal",
      payment: v.metodoPago || "Efectivo",
      subtotal: Number(v.subtotal) || 0,
      tax: Number(v.impuesto) || 0,
      total: Number(v.total) || 0,
      status: st,
      items: Array.isArray(v.detalles)
        ? v.detalles.map((det: any) => ({
            name: det.articulo?.nombre || det.nombre || "Artículo",
            quantity: Number(det.cantidad) || 1,
            price: Number(det.precioUnitario) || 0,
          }))
        : [],
    };
  };

  const fetchTickets = useCallback(async () => {
    if (!orgId) {
      setTickets(fallbackTickets);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const query = new URLSearchParams();
      query.set("organizacionId", orgId);
      if (selectedEstadoFilter !== "Todos") {
        const dbEstado =
          selectedEstadoFilter === "Pagados"
            ? "PAGADO"
            : selectedEstadoFilter === "Devueltos"
            ? "DEVUELTO"
            : "CANCELADO";
        query.set("estado", dbEstado);
      }
      if (selectedSucursal !== "Todas las sucursales") {
        query.set("sucursalId", selectedSucursal);
      }

      const remoteData = await apiRequest<any[]>(`/tickets?${query.toString()}`);
      if (Array.isArray(remoteData) && remoteData.length > 0) {
        setTickets(remoteData.map(mapVentaToTicket));
      } else if (Array.isArray(remoteData) && remoteData.length === 0) {
        setTickets([]);
      }
    } catch (err) {
      console.warn("No se pudieron cargar tickets remotos, usando fallback:", err);
      if (tickets.length === 0) {
        setTickets(fallbackTickets);
      }
    } finally {
      setLoading(false);
    }
  }, [orgId, selectedEstadoFilter, selectedSucursal]);

  const fetchSucursales = useCallback(async () => {
    if (!orgId) return;
    try {
      const data = await apiRequest<any[]>(`/sucursales?organizacionId=${orgId}`);
      if (Array.isArray(data)) {
        setSucursales(data.map((s) => ({ id: s.id, nombre: s.nombre })));
      }
    } catch {
      // Ignorar si falla
    }
  }, [orgId]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    fetchSucursales();
  }, [fetchSucursales]);

  // Actualización en tiempo real vía WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleActualizar = () => {
      fetchTickets();
    };

    socket.on("venta:creada", handleActualizar);
    return () => {
      socket.off("venta:creada", handleActualizar);
    };
  }, [socket, fetchTickets]);

  const money = (value: number) =>
    `$${value.toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const getStatusClass = (status: TicketStatus) => {
    if (status === "Pagado") {
      return "bg-[#D8A814] text-white";
    }
    if (status === "Devuelto") {
      return "border border-black text-black bg-white";
    }
    return "bg-[#EEEEEE] text-[#777777]";
  };

  // Filtrado en memoria
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch = `${t.folio} ${t.customer} ${t.seller}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchDate = selectedDate ? t.rawDate === selectedDate : true;
      return matchSearch && matchDate;
    });
  }, [tickets, search, selectedDate]);

  // Estadísticas calculadas dinámicamente
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const ticketsHoy = tickets.filter((t) => t.rawDate === todayStr);

    const facturadoHoy = ticketsHoy
      .filter((t) => t.status === "Pagado")
      .reduce((sum, t) => sum + t.total, 0);

    const devoluciones = tickets.filter((t) => t.status === "Devuelto");
    const totalDevuelto = devoluciones.reduce((sum, t) => sum + t.total, 0);

    const cancelados = tickets.filter((t) => t.status === "Cancelado");

    return {
      countHoy: ticketsHoy.length,
      facturadoHoy,
      countDevoluciones: devoluciones.length,
      montoDevuelto: totalDevuelto,
      countCancelados: cancelados.length,
    };
  }, [tickets]);

  // Ejecutar Devolución o Cancelación real con API
  const handleConfirmarCambioEstado = async () => {
    if (!selectedTicket) return;
    setActionLoading(true);

    try {
      const res = await apiRequest<any>(`/tickets/${selectedTicket.id}/estado`, {
        method: "PATCH",
        body: JSON.stringify({
          estado: confirmModal.tipo,
          motivo: confirmModal.motivo.trim() || `Operación ${confirmModal.tipo.toLowerCase()} desde Historial de Tickets`,
        }),
      });

      const nuevoStatus: TicketStatus = confirmModal.tipo === "DEVUELTO" ? "Devuelto" : "Cancelado";

      setTickets((prev) =>
        prev.map((t) => (t.id === selectedTicket.id ? { ...t, status: nuevoStatus } : t))
      );
      setSelectedTicket((prev) => (prev ? { ...prev, status: nuevoStatus } : null));

      setConfirmModal({ open: false, tipo: "DEVUELTO", motivo: "" });
      showToast(
        `Ticket ${selectedTicket.folio} marcado como ${nuevoStatus}. Existencias reingresadas al inventario.`
      );
    } catch (err: any) {
      alert("Error al procesar la operación: " + (err.message || "Error desconocido"));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Sidebar />

      <div className={`min-h-screen transition-all duration-300 ${collapsed ? "ml-[80px]" : "ml-[250px]"}`}>
        <Header />

        <div className="p-10">
          {/* Toast flotante */}
          {toastMessage && (
            <div className="fixed top-6 right-6 z-50 flex items-center gap-3 border-l-4 border-[#D8A814] bg-white p-4 shadow-xl">
              <CheckCircle2 size={20} className="text-[#D8A814]" />
              <p className="text-sm font-bold text-black">{toastMessage}</p>
            </div>
          )}

          {/* Encabezado */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
                Operaciones
              </p>
              <h1 className="mt-2 text-3xl font-bold text-black">
                Historial de tickets
              </h1>
              <p className="mt-2 text-sm text-[#777777]">
                Consulta ventas en tiempo real, reimprime tickets, realiza cancelaciones o devoluciones con restitución de inventario.
              </p>
            </div>

            <button
              onClick={() => fetchTickets()}
              disabled={loading}
              className="flex h-11 items-center gap-2 border border-[#E0E0E0] bg-white px-5 text-sm font-bold text-black hover:border-[#D8A814] transition-colors"
            >
              <RefreshCw size={16} className={loading ? "animate-spin text-[#D8A814]" : ""} />
              {loading ? "Actualizando..." : "Refrescar"}
            </button>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="border border-[#D8A814] bg-[#D8A814] p-6 text-white shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider">
                Tickets hoy
              </p>
              <p className="mt-3 text-3xl font-bold">
                {stats.countHoy}
              </p>
              <p className="mt-2 text-sm opacity-90">
                Operaciones del día
              </p>
            </div>

            <div className="border border-[#E2E2E2] bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Facturado hoy
              </p>
              <p className="mt-3 text-3xl font-bold text-black">
                {money(stats.facturadoHoy)}
              </p>
              <p className="mt-2 text-sm text-[#888888]">
                Ventas activas
              </p>
            </div>

            <div className="border border-[#E2E2E2] bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Devoluciones
              </p>
              <p className="mt-3 text-3xl font-bold text-black">
                {stats.countDevoluciones}
              </p>
              <p className="mt-2 text-sm text-[#888888]">
                {money(stats.montoDevuelto)} devueltos
              </p>
            </div>

            <div className="border border-[#E2E2E2] bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Cancelados
              </p>
              <p className="mt-3 text-3xl font-bold text-black">
                {stats.countCancelados}
              </p>
              <p className="mt-2 text-sm text-[#888888]">
                Operaciones anuladas
              </p>
            </div>
          </div>

          {/* Filtros */}
          <section className="mt-6 border border-[#E2E2E2] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap gap-3">
              <div className="flex h-12 min-w-[280px] flex-1 items-center border border-[#E0E0E0] px-4 focus-within:border-[#D8A814]">
                <Search size={18} className="mr-3 flex-none text-[#999999]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar folio, cliente o cajero..."
                  className="h-full w-full bg-transparent text-sm text-black outline-none"
                />
              </div>

              <div className="flex h-12 items-center border border-[#E0E0E0] px-4">
                <CalendarDays size={17} className="mr-3 text-[#999999]" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-sm text-black outline-none"
                />
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate("")}
                    className="ml-2 text-xs text-[#999999] hover:text-black"
                  >
                    ×
                  </button>
                )}
              </div>

              <select
                value={selectedSucursal}
                onChange={(e) => setSelectedSucursal(e.target.value)}
                className="h-12 min-w-[190px] border border-[#E0E0E0] bg-white px-4 text-sm text-black outline-none"
              >
                <option value="Todas las sucursales">Todas las sucursales</option>
                {sucursales.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>

              <select
                value={selectedEstadoFilter}
                onChange={(e) => setSelectedEstadoFilter(e.target.value)}
                className="h-12 min-w-[150px] border border-[#E0E0E0] bg-white px-4 text-sm text-black outline-none"
              >
                <option value="Todos">Todos los estados</option>
                <option value="Pagados">Pagados</option>
                <option value="Devueltos">Devueltos</option>
                <option value="Cancelados">Cancelados</option>
              </select>
            </div>
          </section>

          {/* Tabla de Tickets */}
          <section className="mt-6 border border-[#E2E2E2] bg-white shadow-sm overflow-hidden">
            <div className="grid grid-cols-[1fr_1.2fr_1.6fr_1.4fr_1fr_1fr_.8fr] bg-[#FAFAFA] px-6 py-4">
              <p className="text-xs font-bold uppercase text-[#777777]">Ticket</p>
              <p className="text-xs font-bold uppercase text-[#777777]">Fecha / Hora</p>
              <p className="text-xs font-bold uppercase text-[#777777]">Cliente</p>
              <p className="text-xs font-bold uppercase text-[#777777]">Atendió</p>
              <p className="text-xs font-bold uppercase text-[#777777]">Pago</p>
              <p className="text-right text-xs font-bold uppercase text-[#777777]">Total</p>
              <p className="text-right text-xs font-bold uppercase text-[#777777]">Estado</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-16">
                <Loader2 size={32} className="animate-spin text-[#D8A814]" />
                <span className="ml-3 text-sm text-[#777777]">Cargando historial de tickets...</span>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="grid w-full grid-cols-[1fr_1.2fr_1.6fr_1.4fr_1fr_1fr_.8fr] items-center border-t border-[#EEEEEE] px-6 py-5 text-left transition-colors hover:bg-[#FAFAFA]"
                >
                  <div className="flex items-center gap-3">
                    <ReceiptText size={17} className="text-[#D8A814]" />
                    <p className="font-bold text-black">{ticket.folio}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-black">{ticket.date}</p>
                    <p className="mt-1 text-xs text-[#999999]">{ticket.time}</p>
                  </div>

                  <p className="truncate pr-4 text-sm text-[#555555]">{ticket.customer}</p>

                  <p className="text-sm text-[#555555]">{ticket.seller}</p>

                  <div className="flex items-center gap-2">
                    <CreditCard size={15} className="text-[#999999]" />
                    <p className="text-sm text-[#555555]">{ticket.payment}</p>
                  </div>

                  <p className="text-right text-base font-bold text-black">{money(ticket.total)}</p>

                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 text-[11px] font-bold uppercase ${getStatusClass(
                        ticket.status
                      )}`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                </button>
              ))
            )}

            {!loading && filteredTickets.length === 0 && (
              <div className="px-8 py-16 text-center">
                <ReceiptText size={32} className="mx-auto text-[#CCCCCC]" />
                <p className="mt-4 font-bold text-black">No se encontraron tickets</p>
                <p className="mt-2 text-sm text-[#888888]">
                  Intenta cambiar los filtros de búsqueda o realiza una nueva venta en el Punto de Venta.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Modal Detalle / Reimpresión / Cancelación */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col border border-[#D8A814] bg-white shadow-2xl">
            {/* Cabecera */}
            <div className="flex items-center justify-between border-b border-[#EEEEEE] px-7 py-5">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-black">
                    Ticket {selectedTicket.folio}
                  </h2>
                  <span
                    className={`px-3 py-1 text-xs font-bold uppercase ${getStatusClass(
                      selectedTicket.status
                    )}`}
                  >
                    {selectedTicket.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#888888]">
                  Emitido el {selectedTicket.date} a las {selectedTicket.time}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="text-[#999999] hover:text-black"
              >
                <X size={22} />
              </button>
            </div>

            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 border-b border-[#EEEEEE] md:grid-cols-3">
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#999999]">Sucursal / Caja</p>
                  <p className="mt-2 font-bold text-black">{selectedTicket.branch}</p>
                  <p className="mt-1 text-sm text-[#777777]">{selectedTicket.terminal}</p>
                </div>

                <div className="border-[#EEEEEE] p-6 md:border-l">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#999999]">Cliente</p>
                  <p className="mt-2 font-bold text-black">{selectedTicket.customer}</p>
                  <p className="mt-1 text-sm text-[#777777]">{selectedTicket.phone || "Sin teléfono"}</p>
                </div>

                <div className="border-[#EEEEEE] p-6 md:border-l">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#999999]">Atendió / Método</p>
                  <p className="mt-2 font-bold text-black">{selectedTicket.seller}</p>
                  <p className="mt-1 text-sm text-[#777777]">{selectedTicket.payment}</p>
                </div>
              </div>

              {/* Vista dividida: Lista de artículos y Ticket para imprimir */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px]">
                <div className="border-[#EEEEEE] lg:border-r">
                  <div className="border-b border-[#EEEEEE] px-7 py-5">
                    <h3 className="font-bold text-black">Artículos del ticket</h3>
                    <p className="mt-1 text-sm text-[#888888]">
                      {selectedTicket.items.reduce((total, item) => total + item.quantity, 0)} unidades registradas
                    </p>
                  </div>

                  <div className="grid grid-cols-[1fr_.4fr_.6fr_.7fr] bg-[#FAFAFA] px-7 py-3">
                    <p className="text-[11px] font-bold uppercase text-[#888888]">Artículo</p>
                    <p className="text-center text-[11px] font-bold uppercase text-[#888888]">Cant.</p>
                    <p className="text-right text-[11px] font-bold uppercase text-[#888888]">Precio</p>
                    <p className="text-right text-[11px] font-bold uppercase text-[#888888]">Importe</p>
                  </div>

                  {selectedTicket.items.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="grid grid-cols-[1fr_.4fr_.6fr_.7fr] items-center border-t border-[#EEEEEE] px-7 py-4"
                    >
                      <p className="font-medium text-black">{item.name}</p>
                      <p className="text-center text-sm font-bold text-black">{item.quantity}</p>
                      <p className="text-right text-sm text-[#666666]">{money(item.price)}</p>
                      <p className="text-right font-bold text-black">{money(item.quantity * item.price)}</p>
                    </div>
                  ))}
                </div>

                {/* Recibo térmico */}
                <div className="bg-[#FAFAFA] p-7">
                  <div className="border border-[#D8A814] bg-white p-6 shadow-sm">
                    <div className="text-center">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center border border-[#D8A814] font-bold text-[#D8A814]">
                        IN
                      </div>
                      <p className="mt-3 text-base font-bold text-black">INAGERLIS POS</p>
                      <p className="mt-1 text-xs text-[#777777]">{selectedTicket.branch}</p>
                    </div>

                    <div className="my-4 border-t border-dashed border-[#BBBBBB]" />

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#777777]">Ticket:</span>
                        <span className="font-bold text-black">{selectedTicket.folio}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#777777]">Fecha:</span>
                        <span className="text-black">{selectedTicket.date} {selectedTicket.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#777777]">Caja:</span>
                        <span className="text-black">{selectedTicket.terminal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#777777]">Cajero:</span>
                        <span className="text-black">{selectedTicket.seller}</span>
                      </div>
                    </div>

                    <div className="my-4 border-t border-dashed border-[#BBBBBB]" />

                    <div className="space-y-2 text-xs">
                      {selectedTicket.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="truncate pr-2">{item.quantity}x {item.name}</span>
                          <span className="font-bold">{money(item.quantity * item.price)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="my-4 border-t border-dashed border-[#BBBBBB]" />

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-[#666666]">
                        <span>Subtotal</span>
                        <span>{money(selectedTicket.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-[#666666]">
                        <span>Impuestos</span>
                        <span>{money(selectedTicket.tax)}</span>
                      </div>
                      <div className="flex justify-between border-t border-black pt-2 text-base font-bold text-black">
                        <span>TOTAL</span>
                        <span>{money(selectedTicket.total)}</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-[#777777]">Método:</span>
                        <span className="font-bold">{selectedTicket.payment}</span>
                      </div>
                    </div>

                    <p className="mt-6 text-center text-xs text-[#777777]">
                      Gracias por su compra
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones del Modal */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E5E5] px-7 py-5">
              <div className="flex items-center gap-2">
                {selectedTicket.status === "Pagado" && (
                  <>
                    <button
                      type="button"
                      onClick={() => setConfirmModal({ open: true, tipo: "DEVUELTO", motivo: "" })}
                      className="flex h-11 items-center gap-2 border border-black px-4 text-xs font-bold text-black hover:bg-black hover:text-white transition-colors"
                    >
                      <RotateCcw size={15} />
                      Devolver venta
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmModal({ open: true, tipo: "CANCELADO", motivo: "" })}
                      className="flex h-11 items-center gap-2 border border-red-600 px-4 text-xs font-bold text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                    >
                      <Ban size={15} />
                      Cancelar venta
                    </button>
                  </>
                )}

                {selectedTicket.status !== "Pagado" && (
                  <div className="flex items-center gap-2 text-xs font-bold text-[#777777]">
                    <AlertTriangle size={15} className="text-[#D8A814]" />
                    Operación {selectedTicket.status.toLowerCase()} (stock reintegrado).
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex h-11 items-center gap-2 bg-[#D8A814] px-5 text-sm font-bold text-white hover:bg-black transition-colors"
                >
                  <Printer size={16} />
                  Reimprimir ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para Devolución / Cancelación */}
      {confirmModal.open && selectedTicket && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md border border-[#D8A814] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-3">
              <h3 className="text-lg font-bold text-black">
                {confirmModal.tipo === "DEVUELTO" ? "Confirmar Devolución" : "Confirmar Cancelación"}
              </h3>
              <button
                onClick={() => setConfirmModal({ open: false, tipo: "DEVUELTO", motivo: "" })}
                className="text-gray-400 hover:text-black"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-sm text-[#444]">
                ¿Estás seguro de marcar el ticket <strong className="text-black">{selectedTicket.folio}</strong> como{" "}
                <span className="font-bold text-[#D8A814]">
                  {confirmModal.tipo === "DEVUELTO" ? "DEVUELTO" : "CANCELADO"}
                </span>?
              </p>
              <div className="border-l-4 border-l-[#D8A814] bg-[#FFFBF0] p-3 text-xs text-[#856404]">
                <strong>Impacto en Inventario:</strong> Los artículos de esta venta se reingresarán automáticamente a las existencias de la sucursal y se registrará la entrada en el Kardex.
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#777] mb-1">
                  Motivo de la operación (opcional)
                </label>
                <input
                  type="text"
                  value={confirmModal.motivo}
                  onChange={(e) =>
                    setConfirmModal((prev) => ({ ...prev, motivo: e.target.value }))
                  }
                  placeholder="Ej. Producto defectuoso, error de captura, etc."
                  className="w-full border border-[#DDD] px-3 py-2 text-sm text-black outline-none focus:border-[#D8A814]"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-[#EEEEEE] pt-4">
              <button
                type="button"
                onClick={() => setConfirmModal({ open: false, tipo: "DEVUELTO", motivo: "" })}
                className="border border-[#DDD] px-4 py-2 text-xs font-bold text-black hover:bg-gray-100"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleConfirmarCambioEstado}
                disabled={actionLoading}
                className="flex items-center gap-2 bg-black px-5 py-2 text-xs font-bold text-white hover:bg-[#D8A814] transition-colors"
              >
                {actionLoading && <Loader2 size={14} className="animate-spin" />}
                {actionLoading ? "Procesando..." : "Confirmar operación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}