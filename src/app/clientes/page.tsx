"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSidebar } from "@/context/SidebarContext";
import CustomerStats from "@/components/clientes/CustomerStats";
import CustomerTable, { Customer } from "@/components/clientes/CustomerTable";
import CustomerModal from "@/components/clientes/CustomerModal";

const initialCustomers: Customer[] = [
  {
    id: 1,
    initial: "A",
    name: "Ana López",
    phone: "222 145 8976",
    rfc: "LOPA920812A21",
    location: "Puebla",
    pending: 2,
    puntos: 120,
    saldo: 0,
  },
  {
    id: 2,
    initial: "C",
    name: "Carlos Martínez",
    phone: "221 356 7821",
    rfc: "",
    location: "Tehuacán",
    pending: 1,
    puntos: 45,
    saldo: 150,
  },
  {
    id: 3,
    initial: "M",
    name: "María Rodríguez",
    phone: "249 127 4432",
    rfc: "",
    location: "Tecamachalco",
    pending: 0,
    puntos: 310,
    saldo: 0,
  },
  {
    id: 4,
    initial: "J",
    name: "José Hernández",
    phone: "222 491 1200",
    rfc: "HEMJ8702118F4",
    location: "Puebla",
    pending: 3,
    puntos: 90,
    saldo: 500,
  },
];

export default function ClientesPage() {
  const { collapsed } = useSidebar();
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Todas las localidades");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search)) ||
      (c.rfc && c.rfc.toLowerCase().includes(search.toLowerCase()));

    const matchesLocation =
      selectedLocation === "Todas las localidades" || c.location === selectedLocation;

    return matchesSearch && matchesLocation;
  });

  const handleAddCustomer = (data: {
    nombre: string;
    telefono: string;
    rfc: string;
    localidad: string;
  }) => {
    const newCust: Customer = {
      id: Date.now(),
      name: data.nombre,
      phone: data.telefono,
      rfc: data.rfc,
      location: data.localidad || "Puebla",
      pending: 0,
      puntos: 0,
      saldo: 0,
    };
    setCustomers((prev) => [newCust, ...prev]);
  };

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Sidebar />

      <div className={`min-h-screen transition-all duration-300 ${collapsed ? "ml-[80px]" : "ml-[250px]"}`}>
        <Header />

        <div className="p-10">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
                CRM
              </p>

              <h1 className="mt-2 text-3xl font-bold text-black">Clientes</h1>

              <p className="mt-2 text-sm text-[#777777]">
                Gestiona y consulta la información de tus clientes.
              </p>
            </div>

            <button
              onClick={() => setShowCustomerModal(true)}
              className="h-12 bg-[#D8A814] px-6 font-bold text-white hover:bg-black transition-colors"
            >
              + Nuevo cliente
            </button>
          </div>

          <CustomerStats />

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, teléfono o RFC..."
                className="h-12 w-full border border-[#E0E0E0] bg-white px-5 text-black outline-none focus:border-[#D8A814]"
              />
            </div>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="h-12 min-w-[190px] border border-[#E0E0E0] bg-white px-4 text-black outline-none"
            >
              <option>Todas las localidades</option>
              <option>Puebla</option>
              <option>Tehuacán</option>
              <option>Tecamachalco</option>
            </select>
          </div>

          <CustomerTable
            customers={filteredCustomers}
            onSelectCustomer={(cust) => setSelectedCustomer(cust)}
          />
        </div>
      </div>

      <CustomerModal
        open={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSave={handleAddCustomer}
      />

      {/* Modal Detalle Cliente */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-[500px] border border-[#D8A814] bg-white p-7">
            <div className="flex items-start justify-between border-b border-[#EEEEEE] pb-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#050505] font-bold text-white text-lg">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-black">{selectedCustomer.name}</h3>
                  <p className="text-xs text-[#888888]">{selectedCustomer.location || "Sin localidad"}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-2xl text-[#777777] hover:text-black"
              >
                ×
              </button>
            </div>

            <div className="my-6 space-y-3 text-sm">
              <div className="flex justify-between border-b border-[#F0F0F0] py-2">
                <span className="font-semibold text-[#777777]">Teléfono:</span>
                <span className="font-bold text-black">{selectedCustomer.phone || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-[#F0F0F0] py-2">
                <span className="font-semibold text-[#777777]">RFC:</span>
                <span className="font-bold text-black">{selectedCustomer.rfc || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-[#F0F0F0] py-2">
                <span className="font-semibold text-[#777777]">Puntos Fidelidad:</span>
                <span className="font-bold text-[#D8A814]">{selectedCustomer.puntos || 0} pts</span>
              </div>
              <div className="flex justify-between border-b border-[#F0F0F0] py-2">
                <span className="font-semibold text-[#777777]">Saldo a Favor:</span>
                <span className="font-bold text-black">${selectedCustomer.saldo || 0}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="h-11 bg-black px-6 font-bold text-white hover:bg-[#D8A814]"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}