"use client";

import { useState } from "react";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

import CustomerStats from "@/components/clientes/CustomerStats";
import CustomerTable from "@/components/clientes/CustomerTable";
import CustomerModal from "@/components/clientes/CustomerModal";

export default function ClientesPage() {
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Sidebar />

      <div className="ml-[250px] min-h-screen">
        <Header />

        <div className="p-10">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
                CRM
              </p>

              <h1 className="mt-2 text-3xl font-bold text-black">
                Clientes
              </h1>

              <p className="mt-2 text-sm text-[#777777]">
                Gestiona y consulta la información de tus clientes.
              </p>
            </div>

            <button
              onClick={() => setShowCustomerModal(true)}
              className="h-12 bg-[#D8A814] px-6 font-bold text-white hover:bg-black"
            >
              + Nuevo cliente
            </button>
          </div>

          <CustomerStats />

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1">
              <input
                placeholder="Buscar por nombre, teléfono o RFC..."
                className="h-12 w-full border border-[#E0E0E0] bg-white px-5 text-black outline-none focus:border-[#D8A814]"
              />
            </div>

            <select className="h-12 min-w-[190px] border border-[#E0E0E0] bg-white px-4 text-black outline-none">
              <option>Todas las localidades</option>
              <option>Puebla</option>
              <option>Tehuacán</option>
              <option>Tecamachalco</option>
            </select>
          </div>

          <CustomerTable />
        </div>
      </div>

      <CustomerModal
        open={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
      />
    </main>
  );
}