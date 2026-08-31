"use client";

import { useState } from "react";
import {
  CalendarDays,
  CreditCard,
  Download,
  Eye,
  Printer,
  ReceiptText,
  RotateCcw,
  Search,
  X,
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

type TicketStatus = "Pagado" | "Devuelto" | "Cancelado";

interface TicketItem {
  name: string;
  quantity: number;
  price: number;
}

interface Ticket {
  id: number;
  folio: string;
  date: string;
  time: string;
  customer: string;
  phone?: string;
  seller: string;
  branch: string;
  terminal: string;
  payment: string;
  subtotal: number;
  tax: number;
  total: number;
  status: TicketStatus;
  items: TicketItem[];
}

const tickets: Ticket[] = [
  {
    id: 1,
    folio: "T-000128",
    date: "30 Ago 2026",
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
      {
        name: "Coca-Cola 600 ml",
        quantity: 2,
        price: 18,
      },
      {
        name: "Sabritas Original 105 g",
        quantity: 3,
        price: 15,
      },
      {
        name: "Agua Ciel 1L",
        quantity: 2,
        price: 14,
      },
      {
        name: "Galletas Emperador",
        quantity: 1,
        price: 17,
      },
    ],
  },
  {
    id: 2,
    folio: "T-000127",
    date: "30 Ago 2026",
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
      {
        name: "Coca-Cola 2L",
        quantity: 2,
        price: 38,
      },
      {
        name: "Sabritas Original",
        quantity: 4,
        price: 15,
      },
      {
        name: "Productos varios",
        quantity: 1,
        price: 109,
      },
    ],
  },
  {
    id: 3,
    folio: "T-000126",
    date: "30 Ago 2026",
    time: "09:54 AM",
    customer: "Carlos Martínez",
    phone: "221 356 7821",
    seller: "María López",
    branch: "Sucursal Cholula",
    terminal: "Caja Principal",
    payment: "Tarjeta",
    subtotal: 1077.59,
    tax: 172.41,
    total: 1250,
    status: "Devuelto",
    items: [
      {
        name: "Producto mayoreo",
        quantity: 5,
        price: 250,
      },
    ],
  },
  {
    id: 4,
    folio: "T-000125",
    date: "29 Ago 2026",
    time: "06:32 PM",
    customer: "Público general",
    seller: "Luis Martínez",
    branch: "Sucursal Centro",
    terminal: "Caja 01",
    payment: "Efectivo",
    subtotal: 81.9,
    tax: 13.1,
    total: 95,
    status: "Cancelado",
    items: [
      {
        name: "Artículos varios",
        quantity: 3,
        price: 31.67,
      },
    ],
  },
];

export default function TicketsPage() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [search, setSearch] = useState("");

  const filteredTickets = tickets.filter((ticket) =>
    `${ticket.folio} ${ticket.customer} ${ticket.seller}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

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
      return "border border-black text-black";
    }

    return "bg-[#EEEEEE] text-[#777777]";
  };

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Sidebar />

      <div className="ml-[250px] min-h-screen">
        <Header />

        <div className="p-10">
          {/* Encabezado */}
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
              Operaciones
            </p>

            <h1 className="mt-2 text-3xl font-bold text-black">
              Historial de tickets
            </h1>

            <p className="mt-2 text-sm text-[#777777]">
              Consulta ventas realizadas, pagos, clientes, cancelaciones y
              devoluciones.
            </p>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="border border-[#D8A814] bg-[#D8A814] p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-wider">
                Tickets hoy
              </p>

              <p className="mt-3 text-3xl font-bold">
                286
              </p>

              <p className="mt-2 text-sm">
                Operaciones realizadas
              </p>
            </div>

            <div className="border border-[#E2E2E2] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Facturado
              </p>

              <p className="mt-3 text-3xl font-bold text-black">
                $128,450
              </p>

              <p className="mt-2 text-sm text-[#888888]">
                Ventas del día
              </p>
            </div>

            <div className="border border-[#E2E2E2] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Devoluciones
              </p>

              <p className="mt-3 text-3xl font-bold text-black">
                4
              </p>

              <p className="mt-2 text-sm text-[#888888]">
                $2,480 devueltos
              </p>
            </div>

            <div className="border border-[#E2E2E2] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Cancelados
              </p>

              <p className="mt-3 text-3xl font-bold text-black">
                2
              </p>

              <p className="mt-2 text-sm text-[#888888]">
                Operaciones canceladas
              </p>
            </div>
          </div>

          {/* Filtros */}
          <section className="mt-6 border border-[#E2E2E2] bg-white p-6">
            <div className="flex flex-wrap gap-3">
              <div className="flex h-12 min-w-[280px] flex-1 items-center border border-[#E0E0E0] px-4 focus-within:border-[#D8A814]">
                <Search
                  size={18}
                  className="mr-3 flex-none text-[#999999]"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar ticket, cliente o vendedor..."
                  className="h-full w-full bg-transparent text-sm text-black outline-none"
                />
              </div>

              <div className="flex h-12 items-center border border-[#E0E0E0] px-4">
                <CalendarDays
                  size={17}
                  className="mr-3 text-[#999999]"
                />

                <input
                  type="date"
                  className="bg-transparent text-sm text-black outline-none"
                />
              </div>

              <select className="h-12 min-w-[190px] border border-[#E0E0E0] bg-white px-4 text-sm text-black outline-none">
                <option>Todas las sucursales</option>
                <option>Sucursal Centro</option>
                <option>Sucursal Cholula</option>
              </select>

              <select className="h-12 min-w-[170px] border border-[#E0E0E0] bg-white px-4 text-sm text-black outline-none">
                <option>Todas las cajas</option>
                <option>Caja 01</option>
                <option>Caja 02</option>
                <option>Caja Principal</option>
              </select>

              <select className="h-12 min-w-[150px] border border-[#E0E0E0] bg-white px-4 text-sm text-black outline-none">
                <option>Todos</option>
                <option>Pagados</option>
                <option>Devueltos</option>
                <option>Cancelados</option>
              </select>
            </div>
          </section>

          {/* Tabla */}
          <section className="mt-6 border border-[#E2E2E2] bg-white">
            <div className="grid grid-cols-[1fr_1.2fr_1.6fr_1.4fr_1fr_1fr_.8fr] bg-[#FAFAFA] px-6 py-4">
              <p className="text-xs font-bold uppercase text-[#777777]">
                Ticket
              </p>

              <p className="text-xs font-bold uppercase text-[#777777]">
                Fecha
              </p>

              <p className="text-xs font-bold uppercase text-[#777777]">
                Cliente
              </p>

              <p className="text-xs font-bold uppercase text-[#777777]">
                Vendedor
              </p>

              <p className="text-xs font-bold uppercase text-[#777777]">
                Pago
              </p>

              <p className="text-right text-xs font-bold uppercase text-[#777777]">
                Total
              </p>

              <p className="text-right text-xs font-bold uppercase text-[#777777]">
                Estado
              </p>
            </div>

            {filteredTickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className="
                  grid w-full
                  grid-cols-[1fr_1.2fr_1.6fr_1.4fr_1fr_1fr_.8fr]
                  items-center
                  border-t border-[#EEEEEE]
                  px-6 py-5
                  text-left
                  transition-colors
                  hover:bg-[#FAFAFA]
                "
              >
                <div className="flex items-center gap-3">
                  <ReceiptText
                    size={17}
                    className="text-[#D8A814]"
                  />

                  <p className="font-bold text-black">
                    {ticket.folio}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-black">
                    {ticket.date}
                  </p>

                  <p className="mt-1 text-xs text-[#999999]">
                    {ticket.time}
                  </p>
                </div>

                <p className="truncate pr-4 text-sm text-[#555555]">
                  {ticket.customer}
                </p>

                <p className="text-sm text-[#555555]">
                  {ticket.seller}
                </p>

                <div className="flex items-center gap-2">
                  <CreditCard
                    size={15}
                    className="text-[#999999]"
                  />

                  <p className="text-sm text-[#555555]">
                    {ticket.payment}
                  </p>
                </div>

                <p className="text-right text-base font-bold text-black">
                  {money(ticket.total)}
                </p>

                <div className="text-right">
                  <span
                    className={`
                      inline-block px-3 py-1
                      text-[11px] font-bold uppercase
                      ${getStatusClass(ticket.status)}
                    `}
                  >
                    {ticket.status}
                  </span>
                </div>
              </button>
            ))}

            {filteredTickets.length === 0 && (
              <div className="px-8 py-16 text-center">
                <ReceiptText
                  size={32}
                  className="mx-auto text-[#CCCCCC]"
                />

                <p className="mt-4 font-bold text-black">
                  No encontramos tickets
                </p>

                <p className="mt-2 text-sm text-[#888888]">
                  Intenta cambiar los filtros de búsqueda.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* =====================================================
          MODAL DETALLE DEL TICKET
      ====================================================== */}

      {selectedTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-5 py-8">
          <div className="flex max-h-[92vh] w-full max-w-[900px] flex-col border border-[#D8A814] bg-white">
            {/* Header modal */}
            <div className="flex items-start justify-between border-b border-[#E5E5E5] px-7 py-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
                  Detalle de venta
                </p>

                <div className="mt-1 flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-black">
                    Ticket {selectedTicket.folio}
                  </h2>

                  <span
                    className={`
                      px-3 py-1
                      text-[11px] font-bold uppercase
                      ${getStatusClass(selectedTicket.status)}
                    `}
                  >
                    {selectedTicket.status}
                  </span>
                </div>

                <p className="mt-2 text-sm text-[#888888]">
                  {selectedTicket.date} · {selectedTicket.time}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="text-[#777777] transition-colors hover:text-black"
              >
                <X size={24} />
              </button>
            </div>

            <div
              className="
                flex-1 overflow-y-auto
                [&::-webkit-scrollbar]:w-1
                [&::-webkit-scrollbar-thumb]:bg-[#D8A814]
                [&::-webkit-scrollbar-track]:bg-[#F1F1F1]
              "
            >
              {/* Información superior */}
              <div className="grid grid-cols-1 border-b border-[#EEEEEE] md:grid-cols-3">
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#999999]">
                    Sucursal
                  </p>

                  <p className="mt-2 font-bold text-black">
                    {selectedTicket.branch}
                  </p>

                  <p className="mt-1 text-sm text-[#777777]">
                    {selectedTicket.terminal}
                  </p>
                </div>

                <div className="border-[#EEEEEE] p-6 md:border-l">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#999999]">
                    Cliente
                  </p>

                  <p className="mt-2 font-bold text-black">
                    {selectedTicket.customer}
                  </p>

                  <p className="mt-1 text-sm text-[#777777]">
                    {selectedTicket.phone || "Sin teléfono registrado"}
                  </p>
                </div>

                <div className="border-[#EEEEEE] p-6 md:border-l">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#999999]">
                    Atendió
                  </p>

                  <p className="mt-2 font-bold text-black">
                    {selectedTicket.seller}
                  </p>

                  <p className="mt-1 text-sm text-[#777777]">
                    {selectedTicket.payment}
                  </p>
                </div>
              </div>

              {/* Vista ticket */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px]">
                {/* Productos */}
                <div className="border-[#EEEEEE] lg:border-r">
                  <div className="border-b border-[#EEEEEE] px-7 py-5">
                    <h3 className="font-bold text-black">
                      Artículos vendidos
                    </h3>

                    <p className="mt-1 text-sm text-[#888888]">
                      {selectedTicket.items.reduce(
                        (total, item) => total + item.quantity,
                        0
                      )}{" "}
                      unidades en este ticket
                    </p>
                  </div>

                  <div className="grid grid-cols-[1fr_.4fr_.6fr_.7fr] bg-[#FAFAFA] px-7 py-3">
                    <p className="text-[11px] font-bold uppercase text-[#888888]">
                      Artículo
                    </p>

                    <p className="text-center text-[11px] font-bold uppercase text-[#888888]">
                      Cant.
                    </p>

                    <p className="text-right text-[11px] font-bold uppercase text-[#888888]">
                      Precio
                    </p>

                    <p className="text-right text-[11px] font-bold uppercase text-[#888888]">
                      Importe
                    </p>
                  </div>

                  {selectedTicket.items.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="grid grid-cols-[1fr_.4fr_.6fr_.7fr] items-center border-t border-[#EEEEEE] px-7 py-4"
                    >
                      <p className="font-medium text-black">
                        {item.name}
                      </p>

                      <p className="text-center text-sm font-bold text-black">
                        {item.quantity}
                      </p>

                      <p className="text-right text-sm text-[#666666]">
                        {money(item.price)}
                      </p>

                      <p className="text-right font-bold text-black">
                        {money(item.quantity * item.price)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Ticket tipo impresión */}
                <div className="bg-[#FAFAFA] p-7">
                  <div className="border border-[#D8A814] bg-white p-6">
                    <div className="text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center border border-[#D8A814] font-bold text-[#D8A814]">
                        C
                      </div>

                      <p className="mt-3 text-lg font-bold text-black">
                        MI TIENDA
                      </p>

                      <p className="mt-1 text-xs text-[#777777]">
                        {selectedTicket.branch}
                      </p>

                      <p className="text-xs text-[#777777]">
                        RFC: MIT260101XX1
                      </p>
                    </div>

                    <div className="my-5 border-t border-dashed border-[#BBBBBB]" />

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#777777]">
                          Ticket
                        </span>

                        <span className="font-bold text-black">
                          {selectedTicket.folio}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[#777777]">
                          Fecha
                        </span>

                        <span className="text-black">
                          {selectedTicket.date}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[#777777]">
                          Caja
                        </span>

                        <span className="text-black">
                          {selectedTicket.terminal}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[#777777]">
                          Cajero
                        </span>

                        <span className="text-black">
                          {selectedTicket.seller}
                        </span>
                      </div>
                    </div>

                    <div className="my-5 border-t border-dashed border-[#BBBBBB]" />

                    <div className="space-y-3">
                      {selectedTicket.items.map((item, index) => (
                        <div
                          key={`receipt-${item.name}-${index}`}
                          className="text-xs"
                        >
                          <p className="font-medium text-black">
                            {item.name}
                          </p>

                          <div className="mt-1 flex justify-between text-[#777777]">
                            <span>
                              {item.quantity} × {money(item.price)}
                            </span>

                            <span className="font-medium text-black">
                              {money(item.quantity * item.price)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="my-5 border-t border-dashed border-[#BBBBBB]" />

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-[#666666]">
                        <span>Subtotal</span>
                        <span>{money(selectedTicket.subtotal)}</span>
                      </div>

                      <div className="flex justify-between text-[#666666]">
                        <span>Impuestos</span>
                        <span>{money(selectedTicket.tax)}</span>
                      </div>

                      <div className="flex justify-between border-t border-black pt-3 text-lg font-bold text-black">
                        <span>TOTAL</span>

                        <span>
                          {money(selectedTicket.total)}
                        </span>
                      </div>
                    </div>

                    <div className="my-5 border-t border-dashed border-[#BBBBBB]" />

                    <div className="flex justify-between text-xs">
                      <span className="text-[#777777]">
                        Método de pago
                      </span>

                      <span className="font-bold text-black">
                        {selectedTicket.payment}
                      </span>
                    </div>

                    <p className="mt-7 text-center text-xs text-[#777777]">
                      Gracias por su compra
                    </p>
                  </div>
                </div>
              </div>

              {/* Auditoría */}
              <div className="border-t border-[#EEEEEE] px-7 py-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                  Actividad
                </p>

                <h3 className="mt-1 font-bold text-black">
                  Historial del ticket
                </h3>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="border-l-2 border-[#D8A814] pl-4">
                    <p className="text-sm font-bold text-black">
                      Venta creada
                    </p>

                    <p className="mt-1 text-xs text-[#888888]">
                      {selectedTicket.time} · {selectedTicket.seller}
                    </p>
                  </div>

                  <div className="border-l-2 border-[#D8A814] pl-4">
                    <p className="text-sm font-bold text-black">
                      Pago registrado
                    </p>

                    <p className="mt-1 text-xs text-[#888888]">
                      {selectedTicket.payment} · {money(selectedTicket.total)}
                    </p>
                  </div>

                  <div className="border-l-2 border-[#D8A814] pl-4">
                    <p className="text-sm font-bold text-black">
                      Ticket generado
                    </p>

                    <p className="mt-1 text-xs text-[#888888]">
                      {selectedTicket.terminal}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E5E5] px-7 py-5">
              <button
                type="button"
                className="flex h-11 items-center gap-2 border border-black px-5 text-sm font-bold text-black hover:bg-black hover:text-white"
              >
                <RotateCcw size={16} />
                Iniciar devolución
              </button>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="flex h-11 items-center gap-2 border border-[#D8A814] px-5 text-sm font-bold text-[#D8A814] hover:bg-[#D8A814] hover:text-white"
                >
                  <Download size={16} />
                  Descargar
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex h-11 items-center gap-2 bg-[#D8A814] px-5 text-sm font-bold text-white hover:bg-black"
                >
                  <Printer size={16} />
                  Reimprimir ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}