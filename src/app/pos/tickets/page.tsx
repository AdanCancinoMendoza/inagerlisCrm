"use client";

import { useEffect, useState, useCallback } from "react";
import POSHeader from "@/components/pos/POSHeader";
import { useSocket } from "@/hooks/useSocket";
import { apiRequest } from "@/services/api";
import { getOrganizacionId, getUsuarioActual } from "@/services/auth";
import {
  Download,
  Printer,
  ReceiptText,
  RotateCcw,
  Search,
  X,
  Zap,
  Loader2,
  RefreshCw,
  Ban,
} from "lucide-react";

interface TicketItem {
  name: string;
  quantity: number;
  price: number;
}

interface TicketPOS {
  id: string | number;
  folio: string;
  hora: string;
  cliente: string;
  metodo: string;
  total: number;
  estado: "Pagado" | "Devuelto" | "Cancelado";
  items: TicketItem[];
}

export default function POSTicketsPage() {
  const [tickets, setTickets] = useState<TicketPOS[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<TicketPOS | null>(null);
  const [search, setSearch] = useState("");
  const [alertaSockets, setAlertaSockets] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const usuario = typeof window !== "undefined" ? getUsuarioActual() : null;
  const orgId = typeof window !== "undefined" ? (getOrganizacionId() || usuario?.organizacionId) : null;
  const room = orgId ? `org_${orgId}` : undefined;
  const { socket } = useSocket(room);

  const mapVentaToPOSTicket = (v: any): TicketPOS => {
    const d = v.createdAt ? new Date(v.createdAt) : new Date();
    const timeStr = d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

    let st: "Pagado" | "Devuelto" | "Cancelado" = "Pagado";
    const estadoUpper = String(v.estado || "").toUpperCase();
    if (estadoUpper === "DEVUELTO") st = "Devuelto";
    else if (estadoUpper === "CANCELADO") st = "Cancelado";

    return {
      id: v.id,
      folio: v.folio || "T-000000",
      hora: timeStr,
      cliente: v.cliente?.nombre || "Público general",
      metodo: v.metodoPago || "Efectivo",
      total: Number(v.total) || 0,
      estado: st,
      items: Array.isArray(v.detalles)
        ? v.detalles.map((det: any) => ({
            name: det.articulo?.nombre || det.nombre || "Artículo",
            quantity: Number(det.cantidad) || 1,
            price: Number(det.precioUnitario) || 0,
          }))
        : [],
    };
  };

  const loadTickets = useCallback(async () => {
    if (!orgId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await apiRequest<any[]>(`/tickets?organizacionId=${orgId}`);
      if (Array.isArray(data)) {
        setTickets(data.map(mapVentaToPOSTicket));
      } else {
        setTickets([]);
      }
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    if (!socket) return;

    const handleVenta = (data: any) => {
      setAlertaSockets(true);
      loadTickets();
      setTimeout(() => setAlertaSockets(false), 4500);
    };

    socket.on("venta:creada", handleVenta);
    return () => {
      socket.off("venta:creada", handleVenta);
    };
  }, [socket, loadTickets]);

  const money = (val: number) => `$${val.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

  const filteredTickets = tickets.filter(
    (t) =>
      t.folio.toLowerCase().includes(search.toLowerCase()) ||
      t.cliente.toLowerCase().includes(search.toLowerCase())
  );

  const handleDevolucion = async (ticketId: string | number) => {
    const motivo = prompt("Ingresa el motivo de la devolución (opcional):", "Devolución rápida en caja");
    if (motivo === null) return; // cancelado por usuario

    setActionLoading(true);
    try {
      await apiRequest(`/tickets/${ticketId}/estado`, {
        method: "PATCH",
        body: JSON.stringify({
          estado: "DEVUELTO",
          motivo: motivo.trim() || "Devolución rápida en caja POS",
        }),
      });

      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, estado: "Devuelto" } : t))
      );
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket((prev) => (prev ? { ...prev, estado: "Devuelto" } : null));
      }
      alert("Ticket marcado como Devuelto. Las existencias se han reingresado al inventario.");
    } catch (err: any) {
      alert("Error al procesar devolución: " + (err.message || "Error desconocido"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelar = async (ticketId: string | number) => {
    const motivo = prompt("Ingresa el motivo de cancelación (opcional):", "Error de captura en caja");
    if (motivo === null) return;

    setActionLoading(true);
    try {
      await apiRequest(`/tickets/${ticketId}/estado`, {
        method: "PATCH",
        body: JSON.stringify({
          estado: "CANCELADO",
          motivo: motivo.trim() || "Cancelación de ticket en caja POS",
        }),
      });

      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, estado: "Cancelado" } : t))
      );
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket((prev) => (prev ? { ...prev, estado: "Cancelado" } : null));
      }
      alert("Ticket cancelado exitosamente. Las existencias se han reingresado al inventario.");
    } catch (err: any) {
      alert("Error al cancelar ticket: " + (err.message || "Error desconocido"));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F4F4] text-black">
      <POSHeader activeTab="tickets" />

      <div className="p-8 max-w-[1400px] mx-auto">
        {alertaSockets && (
          <div className="mb-6 flex items-center justify-between border-l-4 border-l-[#D8A814] bg-white p-4 shadow-md">
            <div className="flex items-center gap-3">
              <Zap size={20} className="text-[#D8A814] animate-pulse" />
              <p className="font-bold text-black">¡Nueva venta cobrada! El historial se ha sincronizado en vivo.</p>
            </div>
            <span className="text-xs font-semibold uppercase text-[#D8A814]">En vivo</span>
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Tickets de la Terminal</h1>
            <p className="text-sm text-[#777777]">Consulta tickets emitidos para reimpresión, cancelación o devolución con reingreso automático de inventario.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-80 items-center border border-[#DDDDDD] bg-white px-4">
              <Search size={18} className="mr-3 text-[#999999]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por folio o cliente..."
                className="h-full w-full bg-transparent text-sm outline-none"
              />
            </div>

            <button
              onClick={() => loadTickets()}
              disabled={loading}
              className="flex h-11 items-center gap-2 border border-[#DDDDDD] bg-white px-4 text-xs font-bold text-black hover:border-[#D8A814]"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-[#D8A814]" : ""} />
              {loading ? "Cargando..." : "Refrescar"}
            </button>
          </div>
        </div>

        {/* Listado de tickets POS */}
        <div className="border border-[#DDDDDD] bg-white shadow-sm overflow-hidden">
          <div className="grid grid-cols-[1.2fr_1fr_2fr_1.2fr_1.2fr_1.2fr] bg-[#FAFAFA] px-6 py-4 text-xs font-bold uppercase text-[#777777]">
            <p>Folio</p>
            <p>Hora</p>
            <p>Cliente</p>
            <p>Pago</p>
            <p className="text-right">Total</p>
            <p className="text-right">Estado</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-14 text-sm text-[#777777]">
              <Loader2 size={24} className="animate-spin text-[#D8A814] mr-2" />
              Cargando tickets de la base de datos...
            </div>
          ) : (
            filteredTickets.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className="grid grid-cols-[1.2fr_1fr_2fr_1.2fr_1.2fr_1.2fr] items-center border-t border-[#EEEEEE] px-6 py-4 text-left hover:bg-[#FAFAFA] w-full transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ReceiptText size={16} className="text-[#D8A814]" />
                  <span className="font-bold">{t.folio}</span>
                </div>
                <p className="text-sm">{t.hora}</p>
                <p className="text-sm font-medium">{t.cliente}</p>
                <p className="text-sm text-[#666666]">{t.metodo}</p>
                <p className="text-right font-bold text-base">{money(t.total)}</p>
                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase ${
                      t.estado === "Pagado"
                        ? "bg-[#D8A814] text-white"
                        : t.estado === "Devuelto"
                        ? "border border-black text-black"
                        : "bg-[#EEE] text-[#888]"
                    }`}
                  >
                    {t.estado}
                  </span>
                </div>
              </button>
            ))
          )}

          {!loading && filteredTickets.length === 0 && (
            <div className="p-12 text-center text-sm text-[#888888]">
              No hay tickets registrados con este criterio de búsqueda.
            </div>
          )}
        </div>
      </div>

      {/* Modal Detalle / Reimpresión POS */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-[480px] border border-[#D8A814] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-4">
              <div>
                <h2 className="text-xl font-bold">Ticket {selectedTicket.folio}</h2>
                <p className="text-xs text-[#888888]">{selectedTicket.hora} · {selectedTicket.cliente}</p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-2xl text-[#777777] hover:text-black">×</button>
            </div>

            <div className="my-5 border border-[#D8A814] p-4 bg-[#FAFAFA] text-xs space-y-2 font-mono">
              <p className="text-center font-bold text-sm text-black">INAGERLIS POS</p>
              <p className="text-center text-[10px] text-[#777777]">Folio: {selectedTicket.folio} · Estado: {selectedTicket.estado.toUpperCase()}</p>
              <div className="border-t border-dashed my-2" />
              {selectedTicket.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{item.quantity}x {item.name}</span>
                  <span className="font-bold">{money(item.quantity * item.price)}</span>
                </div>
              ))}
              <div className="border-t border-dashed my-2" />
              <div className="flex justify-between text-sm font-bold text-black font-sans">
                <span>TOTAL:</span>
                <span>{money(selectedTicket.total)}</span>
              </div>
              <p className="text-center text-[10px] text-[#777777] mt-3 font-sans">Gracias por su compra</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#EEEEEE]">
              {selectedTicket.estado === "Pagado" ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDevolucion(selectedTicket.id)}
                    disabled={actionLoading}
                    className="flex h-10 items-center gap-1.5 border border-black px-3 text-xs font-bold text-black hover:bg-black hover:text-white transition-colors"
                  >
                    <RotateCcw size={13} /> Devolución
                  </button>
                  <button
                    onClick={() => handleCancelar(selectedTicket.id)}
                    disabled={actionLoading}
                    className="flex h-10 items-center gap-1.5 border border-red-600 px-3 text-xs font-bold text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                  >
                    <Ban size={13} /> Cancelar
                  </button>
                </div>
              ) : (
                <span className="text-xs font-semibold text-[#888]">
                  Ticket {selectedTicket.estado.toLowerCase()}
                </span>
              )}

              <button
                onClick={() => window.print()}
                className="ml-auto flex h-10 items-center gap-2 bg-[#D8A814] px-5 text-xs font-bold text-white hover:bg-black transition-colors"
              >
                <Printer size={14} /> Reimprimir
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
