"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

const followUps = [
  {
    id: 1,
    customer: "Carlos Martínez",
    initial: "C",
    phone: "221 356 7821",
    type: "Llamada",
    note: "Confirmar si requiere nuevamente el pedido de mayoreo.",
    date: "30 Ago 2026",
    time: "10:30 AM",
    status: "Pendiente",
  },
  {
    id: 2,
    customer: "Ana López",
    initial: "A",
    phone: "222 145 8976",
    type: "Encargo",
    note: "Separar 5 cajas de refresco para recoger por la tarde.",
    date: "30 Ago 2026",
    time: "04:00 PM",
    status: "Pendiente",
  },
  {
    id: 3,
    customer: "José Hernández",
    initial: "J",
    phone: "222 491 1200",
    type: "Nota",
    note: "Enviar factura correspondiente a su última compra.",
    date: "31 Ago 2026",
    time: "11:00 AM",
    status: "Pendiente",
  },
  {
    id: 4,
    customer: "María Rodríguez",
    initial: "M",
    phone: "249 127 4432",
    type: "Seguimiento",
    note: "Cliente sin compras recientes. Contactar para ofrecer promoción.",
    date: "02 Sep 2026",
    time: "01:30 PM",
    status: "Pendiente",
  },
];

export default function SeguimientosPage() {
  const [activeFilter, setActiveFilter] = useState("Todos");

  const filters = [
    "Todos",
    "Hoy",
    "Próximos",
    "Vencidos",
    "Completados",
  ];

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Sidebar />

      <div className="ml-[250px] min-h-screen">
        <Header />

        <div className="p-10">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
                Clientes
              </p>

              <h1 className="mt-2 text-3xl font-bold text-black">
                Seguimientos
              </h1>

              <p className="mt-2 text-sm text-[#777777]">
                Gestiona encargos, notas, llamadas y actividades pendientes.
              </p>
            </div>

            <button className="h-12 bg-[#D8A814] px-6 font-bold text-white hover:bg-black">
              + Nuevo seguimiento
            </button>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="border border-[#D8A814] bg-[#D8A814] p-5 text-white">
              <p className="text-xs font-bold uppercase tracking-wider">
                Pendientes
              </p>
              <p className="mt-2 text-3xl font-bold">12</p>
            </div>

            <div className="border border-[#E5E5E5] bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Para hoy
              </p>
              <p className="mt-2 text-3xl font-bold text-black">4</p>
            </div>

            <div className="border border-[#E5E5E5] bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Próximos
              </p>
              <p className="mt-2 text-3xl font-bold text-black">7</p>
            </div>

            <div className="border border-[#E5E5E5] bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Vencidos
              </p>
              <p className="mt-2 text-3xl font-bold text-black">1</p>
            </div>
          </div>

          <div className="mb-6 flex border-b border-[#DDDDDD]">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`
                  border-b-2 px-6 py-4
                  text-sm font-semibold
                  transition-colors
                  ${
                    activeFilter === filter
                      ? "border-[#D8A814] text-[#D8A814]"
                      : "border-transparent text-[#777777] hover:text-black"
                  }
                `}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="mb-6 flex gap-3">
            <input
              placeholder="Buscar cliente o seguimiento..."
              className="h-12 flex-1 border border-[#E0E0E0] bg-white px-5 text-black outline-none focus:border-[#D8A814]"
            />

            <select className="h-12 min-w-[180px] border border-[#E0E0E0] bg-white px-4 text-black outline-none">
              <option>Todos los tipos</option>
              <option>Llamada</option>
              <option>Encargo</option>
              <option>Nota</option>
              <option>Seguimiento</option>
            </select>
          </div>

          <div className="border border-[#E5E5E5] bg-white">
            {followUps.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-5 border-b border-[#EEEEEE] p-6 last:border-none"
              >
                <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-[#050505] font-bold text-white">
                  {item.initial}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-bold text-black">
                      {item.customer}
                    </p>

                    <span className="border border-[#D8A814] px-2 py-1 text-[11px] font-bold uppercase text-[#D8A814]">
                      {item.type}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-[#999999]">
                    {item.phone}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-[#555555]">
                    {item.note}
                  </p>
                </div>

                <div className="min-w-[130px] text-right">
                  <p className="text-sm font-bold text-black">
                    {item.date}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-[#D8A814]">
                    {item.time}
                  </p>
                </div>

                <button className="h-10 border border-black px-4 text-xs font-bold text-black transition-colors hover:bg-black hover:text-white">
                  Completar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}