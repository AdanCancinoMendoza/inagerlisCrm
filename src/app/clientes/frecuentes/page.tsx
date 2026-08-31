"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

const frequentCustomers = [
  {
    id: 1,
    initial: "A",
    name: "Ana Martínez",
    phone: "222 145 8976",
    location: "Puebla",
    purchases: 24,
    spent: "$12,450",
    lastPurchase: "28 Ago 2026",
  },
  {
    id: 2,
    initial: "C",
    name: "Carlos Ramírez",
    phone: "221 356 7821",
    location: "Tehuacán",
    purchases: 19,
    spent: "$10,280",
    lastPurchase: "30 Ago 2026",
  },
  {
    id: 3,
    initial: "P",
    name: "Pedro Gómez",
    phone: "222 780 1102",
    location: "Puebla",
    purchases: 16,
    spent: "$8,750",
    lastPurchase: "27 Ago 2026",
  },
  {
    id: 4,
    initial: "L",
    name: "Laura Pérez",
    phone: "249 224 0084",
    location: "Tecamachalco",
    purchases: 14,
    spent: "$7,620",
    lastPurchase: "26 Ago 2026",
  },
];

export default function ClientesFrecuentesPage() {
  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Sidebar />

      <div className="ml-[250px] min-h-screen">
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
              Identifica a los clientes con mayor frecuencia de compra.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="border border-[#D8A814] bg-[#D8A814] p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-wider">
                Clientes frecuentes
              </p>

              <p className="mt-3 text-3xl font-bold">
                74
              </p>
            </div>

            <div className="border border-[#E5E5E5] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Compras promedio
              </p>

              <p className="mt-3 text-3xl font-bold text-black">
                12.8
              </p>
            </div>

            <div className="border border-[#E5E5E5] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Valor promedio
              </p>

              <p className="mt-3 text-3xl font-bold text-black">
                $7,840
              </p>
            </div>
          </div>

          <div className="mb-6 flex items-center gap-3">
            <input
              placeholder="Buscar cliente..."
              className="h-12 flex-1 border border-[#E0E0E0] bg-white px-5 text-black outline-none focus:border-[#D8A814]"
            />

            <select className="h-12 min-w-[210px] border border-[#E0E0E0] bg-white px-4 text-black outline-none">
              <option>Mayor frecuencia</option>
              <option>Mayor gasto</option>
              <option>Compra más reciente</option>
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
                Última compra
              </p>
            </div>

            {frequentCustomers.map((customer, index) => (
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
                    {customer.initial}
                  </div>

                  <div>
                    <p className="font-semibold text-black">
                      {customer.name}
                    </p>

                    <p className="mt-1 text-xs text-[#999999]">
                      {customer.phone}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-[#555555]">
                  {customer.location}
                </p>

                <p className="text-center text-lg font-bold text-black">
                  {customer.purchases}
                </p>

                <p className="text-right font-bold text-[#D8A814]">
                  {customer.spent}
                </p>

                <p className="text-right text-sm text-[#555555]">
                  {customer.lastPurchase}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}