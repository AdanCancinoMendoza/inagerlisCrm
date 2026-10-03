"use client";

import { useEffect, useState } from "react";
import POSHeader from "@/components/pos/POSHeader";
import { useSocket } from "@/hooks/useSocket";
import {
  Download,
  Printer,
  ReceiptText,
  RotateCcw,
  Search,
  X,
  Zap,
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

const initialTickets: TicketPOS[] = [
  {
    id: 1,
    folio: "T-000128",
    hora: "10:42 AM",
    cliente: "Ana Martínez",
    metodo: "Tarjeta",
    total: 126,
    estado: "Pagado",
    items: [
      { name: "Coca-Cola 600 ml", quantity: 2, price: 18 },
      { name: "Sabritas Original 105 g", quantity: 3, price: 15 },
      { name: "Agua Ciel 1L", quantity: 2, price: 14 },
    ],
  },
  {
    id: 2,
    folio: "T-000127",
    hora: "10:18 AM",
    cliente: "Público general",
    metodo: "Efectivo",
    total: 245,
    estado: "Pagado",
    items: [
      { name: "Coca-Cola 2L", quantity: 2, price: 38 },
      { name: "Sabritas Original", quantity: 4, price: 15 },
    ],
  },
];

export default function POSTicketsPage() {
  const [tickets, setTickets] = useState<TicketPOS[]>(initialTickets);
  const [selectedTicket, setSelectedTicket] = useState<TicketPOS | null>(null);
  const [search, setSearch] = useState("");
  const [alertaSockets, setAlertaSockets] = useState(false);

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on("venta:creada", (data: any) => {
      setAlertaSockets(true);
      const newT: TicketPOS = {
        id: data.id || Date.now(),
        folio: data.folio || `T-${Math.floor(Math.random() * 10000)}`,
        hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        cliente: data.cliente?.nombre || "Público general",
        metodo: data.metodoPago || "Efectivo",
        total: Number(data.total) || 0,
        estado: "Pagado",
        items: data.detalles
          ? data.detalles.map((d: any) => ({
              name: d.articulo?.nombre || "Artículo",
              quantity: d.cantidad || 1,
              price: Number(d.precioUnitario) || 0,
            }))
          : [],
      };
      setTickets((prev) => [newT, ...prev]);
      setTimeout(() => setAlertaSockets(false), 4000);
    });

    return () => {
      socket.off("venta:creada");
    };
  }, [socket]);

  const money = (val: number) => `$${val.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

  const filteredTickets = tickets.filter(
    (t) =>
      t.folio.toLowerCase().includes(search.toLowerCase()) ||
      t.cliente.toLowerCase().includes(search.toLowerCase())
  );

  const handleDevolucion = (ticketId: string | number) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, estado: "Devuelto" } : t))
    );
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket((prev) => (prev ? { ...prev, estado: "Devuelto" } : null));
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
              <p className="font-bold text-black">¡Nueva venta cobrada! Añadida al historial de tickets.</p>
            </div>
            <span className="text-xs font-semibold uppercase text-[#D8A814]">En vivo</span>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tickets de la Terminal</h1>
            <p className="text-sm text-[#777777]">Consulta tickets emitidos en Caja 02 para reimpresión o devolución rápida.</p>
          </div>

          <div className="flex h-12 w-80 items-center border border-[#DDDDDD] bg-white px-4">
            <Search size={18} className="mr-3 text-[#999999]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por folio o cliente..."
              className="h-full w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        {/* Listado de tickets POS */}
        <div className="border border-[#DDDDDD] bg-white">
          <div className="grid grid-cols-[1.2fr_1fr_2fr_1.2fr_1.2fr_1.2fr] bg-[#FAFAFA] px-6 py-4 text-xs font-bold uppercase text-[#777777]">
            <p>Folio</p>
            <p>Hora</p>
            <p>Cliente</p>
            <p>Pago</p>
            <p className="text-right">Total</p>
            <p className="text-right">Estado</p>
          </div>

          {filteredTickets.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTicket(t)}
              className="grid grid-cols-[1.2fr_1fr_2fr_1.2fr_1.2fr_1.2fr] items-center border-t border-[#EEEEEE] px-6 py-4 text-left hover:bg-[#FAFAFA] w-full"
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
                      : "border border-black text-black"
                  }`}
                >
                  {t.estado}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal Detalle / Reimpresión POS */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-[480px] border border-[#D8A814] bg-white p-6">
            <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-4">
              <div>
                <h2 className="text-xl font-bold">Ticket {selectedTicket.folio}</h2>
                <p className="text-xs text-[#888888]">{selectedTicket.hora} · {selectedTicket.cliente}</p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-2xl text-[#777777]">×</button>
            </div>

            <div className="my-5 border border-[#D8A814] p-4 bg-[#FAFAFA] text-xs space-y-2 font-mono">
              <p className="text-center font-bold text-sm text-black">MI TIENDA - POS CAJA 02</p>
              <p className="text-center text-[10px] text-[#777777]">Folio: {selectedTicket.folio}</p>
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
              {selectedTicket.estado === "Pagado" && (
                <button
                  onClick={() => handleDevolucion(selectedTicket.id)}
                  className="flex h-10 items-center gap-2 border border-black px-4 text-xs font-bold text-black hover:bg-black hover:text-white"
                >
                  <RotateCcw size={14} /> Devolución
                </button>
              )}
              <button
                onClick={() => window.print()}
                className="ml-auto flex h-10 items-center gap-2 bg-[#D8A814] px-5 text-xs font-bold text-white hover:bg-black"
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
