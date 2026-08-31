"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

const newCustomers = [
  {
    id: 1,
    initial: "M",
    name: "Mariana Torres",
    phone: "222 555 1201",
    rfc: "",
    location: "Puebla",
    date: "30 Ago 2026",
    firstPurchase: "$850",
  },
  {
    id: 2,
    initial: "J",
    name: "Jorge Mendoza",
    phone: "222 555 4412",
    rfc: "MEMJ900411AC2",
    location: "Cholula",
    date: "30 Ago 2026",
    firstPurchase: "$1,240",
  },
  {
    id: 3,
    initial: "S",
    name: "Sofía Hernández",
    phone: "221 653 9011",
    rfc: "",
    location: "Tehuacán",
    date: "29 Ago 2026",
    firstPurchase: "$420",
  },
  {
    id: 4,
    initial: "R",
    name: "Raúl Castillo",
    phone: "249 873 2210",
    rfc: "",
    location: "Tecamachalco",
    date: "29 Ago 2026",
    firstPurchase: "$2,180",
  },
];

export default function NuevosClientesPage() {
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
              Clientes nuevos
            </h1>

            <p className="mt-2 text-sm text-[#777777]">
              Clientes registrados recientemente en el punto de venta.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="border border-[#E5E5E5] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Nuevos hoy
              </p>
              <p className="mt-3 text-3xl font-bold text-black">8</p>
            </div>

            <div className="border border-[#E5E5E5] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Esta semana
              </p>
              <p className="mt-3 text-3xl font-bold text-black">31</p>
            </div>

            <div className="border border-[#D8A814] bg-[#D8A814] p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-wider">
                Primera compra
              </p>
              <p className="mt-3 text-3xl font-bold">$8,420</p>
            </div>
          </div>

          <div className="mb-6 flex items-center gap-3">
            <input
              placeholder="Buscar cliente..."
              className="h-12 flex-1 border border-[#E0E0E0] bg-white px-5 text-black outline-none focus:border-[#D8A814]"
            />

            <select className="h-12 min-w-[190px] border border-[#E0E0E0] bg-white px-4 text-black outline-none">
              <option>Todos los días</option>
              <option>Hoy</option>
              <option>Últimos 7 días</option>
              <option>Últimos 30 días</option>
            </select>
          </div>

          <div className="border border-[#E5E5E5] bg-white">
            <div className="grid grid-cols-[2fr_1.2fr_1.2fr_1.2fr_1fr] border-b border-[#E5E5E5] bg-[#FAFAFA] px-6 py-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Cliente
              </p>
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Teléfono
              </p>
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Localidad
              </p>
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Registro
              </p>
              <p className="text-right text-xs font-bold uppercase tracking-wider text-[#777777]">
                Primera compra
              </p>
            </div>

            {newCustomers.map((customer) => (
              <div
                key={customer.id}
                className="grid grid-cols-[2fr_1.2fr_1.2fr_1.2fr_1fr] items-center border-b border-[#EEEEEE] px-6 py-4 last:border-none"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#050505] font-bold text-white">
                    {customer.initial}
                  </div>

                  <div>
                    <p className="font-semibold text-black">{customer.name}</p>
                    <p className="mt-1 text-xs text-[#999999]">
                      {customer.rfc || "Sin RFC"}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-[#555555]">{customer.phone}</p>
                <p className="text-sm text-[#555555]">{customer.location}</p>
                <p className="text-sm text-[#555555]">{customer.date}</p>
                <p className="text-right font-bold text-[#D8A814]">
                  {customer.firstPurchase}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}