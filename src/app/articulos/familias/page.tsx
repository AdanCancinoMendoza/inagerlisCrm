"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSidebar } from "@/context/SidebarContext";

const families = [
  {
    id: 1,
    name: "Bebidas",
    description: "Refrescos, aguas y bebidas preparadas",
    subfamilies: 6,
    products: 146,
  },
  {
    id: 2,
    name: "Botanas",
    description: "Papas, frituras y snacks",
    subfamilies: 8,
    products: 94,
  },
  {
    id: 3,
    name: "Abarrotes",
    description: "Productos básicos y alimentos empacados",
    subfamilies: 14,
    products: 287,
  },
  {
    id: 4,
    name: "Limpieza",
    description: "Productos de limpieza para el hogar",
    subfamilies: 9,
    products: 108,
  },
];

export default function FamiliasPage() {
  const { collapsed } = useSidebar();

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Sidebar />

      <div className={`min-h-screen transition-all duration-300 ${collapsed ? "ml-[80px]" : "ml-[250px]"}`}>
        <Header />

        <div className="p-10">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
                Artículos
              </p>

              <h1 className="mt-2 text-3xl font-bold text-black">
                Familias
              </h1>

              <p className="mt-2 text-sm text-[#777777]">
                Organiza tu catálogo por grupos de artículos.
              </p>
            </div>

            <button className="h-12 bg-[#D8A814] px-6 font-bold text-white hover:bg-black">
              + Nueva familia
            </button>
          </div>

          <div className="mb-6">
            <input
              placeholder="Buscar familia..."
              className="h-12 w-full border border-[#E0E0E0] bg-white px-5 text-black outline-none focus:border-[#D8A814]"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {families.map((family) => (
              <button
                key={family.id}
                className="border border-[#E2E2E2] bg-white p-6 text-left hover:border-[#D8A814]"
              >
                <div className="flex justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-black">
                      {family.name}
                    </h2>

                    <p className="mt-2 text-sm text-[#777777]">
                      {family.description}
                    </p>
                  </div>

                  <span className="text-xl text-[#D8A814]">
                    →
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 border-t border-[#EEEEEE] pt-5">
                  <div>
                    <p className="text-xs uppercase text-[#999999]">
                      Subfamilias
                    </p>

                    <p className="mt-1 text-xl font-bold text-black">
                      {family.subfamilies}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-[#999999]">
                      Artículos
                    </p>

                    <p className="mt-1 text-xl font-bold text-[#D8A814]">
                      {family.products}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}