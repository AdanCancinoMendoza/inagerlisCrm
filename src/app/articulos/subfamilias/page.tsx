"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSidebar } from "@/context/SidebarContext";

const subfamilies = [
  {
    id: 1,
    name: "Refrescos",
    family: "Bebidas",
    products: 52,
  },
  {
    id: 2,
    name: "Agua",
    family: "Bebidas",
    products: 31,
  },
  {
    id: 3,
    name: "Papas",
    family: "Botanas",
    products: 42,
  },
  {
    id: 4,
    name: "Galletas",
    family: "Abarrotes",
    products: 68,
  },
];

export default function SubfamiliasPage() {
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
                Subfamilias
              </h1>

              <p className="mt-2 text-sm text-[#777777]">
                Crea divisiones dentro de cada familia.
              </p>
            </div>

            <button className="h-12 bg-[#D8A814] px-6 font-bold text-white hover:bg-black">
              + Nueva subfamilia
            </button>
          </div>

          <div className="border border-[#E2E2E2] bg-white">
            <div className="grid grid-cols-[2fr_2fr_1fr_.5fr] bg-[#FAFAFA] px-6 py-4">
              <p className="text-xs font-bold uppercase text-[#777777]">
                Subfamilia
              </p>

              <p className="text-xs font-bold uppercase text-[#777777]">
                Familia
              </p>

              <p className="text-center text-xs font-bold uppercase text-[#777777]">
                Artículos
              </p>

              <span />
            </div>

            {subfamilies.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[2fr_2fr_1fr_.5fr] items-center border-t border-[#EEEEEE] px-6 py-5"
              >
                <p className="font-bold text-black">
                  {item.name}
                </p>

                <p className="text-sm text-[#555555]">
                  {item.family}
                </p>

                <p className="text-center font-bold text-[#D8A814]">
                  {item.products}
                </p>

                <button className="text-right font-bold text-black">
                  ···
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}