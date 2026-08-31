"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

const pendingItems = [
  {
    id: 1,
    customer: "Carlos Martínez",
    initial: "C",
    phone: "221 356 7821",
    note: "Llamar para confirmar el pedido de mercancía.",
    date: "30 Ago 2026",
    time: "10:30 AM",
  },
  {
    id: 2,
    customer: "Ana López",
    initial: "A",
    phone: "222 145 8976",
    note: "Separar 5 cajas de producto para que pase a recogerlas.",
    date: "30 Ago 2026",
    time: "04:00 PM",
  },
  {
    id: 3,
    customer: "José Hernández",
    initial: "J",
    phone: "222 491 1200",
    note: "Enviar factura correspondiente al último pedido.",
    date: "31 Ago 2026",
    time: "11:00 AM",
  },
];

export default function PendientesPage() {
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
                Pendientes
              </h1>

              <p className="mt-2 text-sm text-[#777777]">
                Indicaciones, encargos y seguimientos relacionados con clientes.
              </p>
            </div>

            <button className="h-12 bg-[#D8A814] px-6 font-bold text-white hover:bg-black">
              + Nuevo pendiente
            </button>
          </div>

          <div className="mb-6 flex border-b border-[#DDDDDD]">
            {["Todos", "Hoy", "Próximos", "Vencidos"].map(
              (option, index) => (
                <button
                  key={option}
                  className={`
                    border-b-2 px-6 py-4 text-sm font-semibold
                    ${
                      index === 0
                        ? "border-[#D8A814] text-[#D8A814]"
                        : "border-transparent text-[#777777]"
                    }
                  `}
                >
                  {option}
                </button>
              )
            )}
          </div>

          <div className="border border-[#E5E5E5] bg-white">
            {pendingItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-5 border-b border-[#EEEEEE] p-6 last:border-none"
              >
                <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-[#050505] font-bold text-white">
                  {item.initial}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-black">
                      {item.customer}
                    </p>

                    <span className="text-xs text-[#999999]">
                      {item.phone}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-[#555555]">
                    {item.note}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-black">
                    {item.date}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-[#D8A814]">
                    {item.time}
                  </p>
                </div>

                <button className="border border-black px-4 py-2 text-xs font-bold text-black hover:bg-black hover:text-white">
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