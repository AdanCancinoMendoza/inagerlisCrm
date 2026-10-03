"use client";

import { useState } from "react";
import POSHeader from "@/components/pos/POSHeader";
import CustomerModal from "@/components/clientes/CustomerModal";
import { Customer } from "@/components/clientes/CustomerTable";
import { Plus, Search, UserCheck, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

const initialPosCustomers: Customer[] = [
  { id: 1, name: "Ana López", phone: "222 145 8976", rfc: "LOPA920812A21", location: "Puebla", puntos: 120, saldo: 0 },
  { id: 2, name: "Carlos Martínez", phone: "221 356 7821", rfc: "", location: "Tehuacán", puntos: 45, saldo: 150 },
  { id: 3, name: "María Rodríguez", phone: "249 127 4432", rfc: "", location: "Tecamachalco", puntos: 310, saldo: 0 },
  { id: 4, name: "José Hernández", phone: "222 491 1200", rfc: "HEMJ8702118F4", location: "Puebla", puntos: 90, saldo: 500 },
];

export default function POSClientesPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>(initialPosCustomers);
  const [search, setSearch] = useState("");
  const [modalNuevo, setModalNuevo] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Customer | null>(null);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
  );

  const handleCrearNuevo = (data: { nombre: string; telefono: string; rfc: string; localidad: string }) => {
    const n: Customer = {
      id: Date.now(),
      name: data.nombre,
      phone: data.telefono,
      rfc: data.rfc,
      location: data.localidad || "Puebla",
      puntos: 0,
      saldo: 0,
    };
    setCustomers((prev) => [n, ...prev]);
  };

  const handleAsignarAVenta = (c: Customer) => {
    setClienteSeleccionado(c);
    // Redireccionar al POS de Venta con cliente seleccionado
    setTimeout(() => {
      router.push("/pos");
    }, 600);
  };

  return (
    <main className="min-h-screen bg-[#F4F4F4] text-black">
      <POSHeader activeTab="clientes" />

      <div className="p-8 max-w-[1400px] mx-auto">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Selección de Cliente POS</h1>
            <p className="text-sm text-[#777777]">Asigna un cliente a la venta actual o registra un nuevo cliente en caja.</p>
          </div>

          <button
            onClick={() => setModalNuevo(true)}
            className="flex h-11 items-center gap-2 bg-[#D8A814] px-6 text-sm font-bold text-white hover:bg-black transition-colors"
          >
            <Plus size={18} /> Registrar Cliente Rápido
          </button>
        </div>

        {/* Buscador */}
        <div className="mb-6 flex h-14 items-center border-2 border-[#D8A814] bg-white px-5">
          <Search size={22} className="mr-4 text-[#D8A814]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente por nombre o teléfono para asignar a la venta..."
            className="h-full w-full bg-transparent text-base outline-none"
          />
        </div>

        {/* Grid de tarjetas de cliente estilo POS */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((c) => {
            const isSelected = clienteSeleccionado?.id === c.id;

            return (
              <div
                key={c.id}
                className={`flex flex-col justify-between border bg-white p-5 transition-all ${
                  isSelected ? "border-2 border-[#D8A814] bg-[#FAFAFA]" : "border-[#DDDDDD] hover:border-black"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#050505] font-bold text-white text-lg">
                    {c.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-black truncate">{c.name}</p>
                    <p className="text-xs text-[#777777]">{c.phone || "Sin teléfono"}</p>
                    <p className="text-xs text-[#888888]">{c.location}</p>
                  </div>
                </div>

                <div className="my-4 flex items-center justify-between border-t border-[#F0F0F0] pt-3 text-xs">
                  <div>
                    <p className="text-[#888888]">Puntos Fidelidad</p>
                    <p className="font-bold text-[#D8A814] text-sm">{c.puntos || 0} pts</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#888888]">Saldo a Favor</p>
                    <p className="font-bold text-black text-sm">${c.saldo || 0}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleAsignarAVenta(c)}
                  className={`flex h-10 w-full items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-colors ${
                    isSelected
                      ? "bg-[#D8A814] text-white"
                      : "border border-black bg-white text-black hover:bg-black hover:text-white"
                  }`}
                >
                  <UserCheck size={16} />
                  {isSelected ? "Cliente Asignado" : "Asignar a Venta"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <CustomerModal
        open={modalNuevo}
        onClose={() => setModalNuevo(false)}
        onSave={handleCrearNuevo}
      />
    </main>
  );
}
