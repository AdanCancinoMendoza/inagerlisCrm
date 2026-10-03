"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSidebar } from "@/context/SidebarContext";

const stock = [
  {
    id: 1,
    name: "Coca-Cola 600 ml",
    code: "750105530001",
    stock: 125,
    minimum: 20,
  },
  {
    id: 2,
    name: "Sabritas Original 105 g",
    code: "750047800030",
    stock: 12,
    minimum: 20,
  },
  {
    id: 3,
    name: "Galletas Emperador Chocolate",
    code: "750100012003",
    stock: 0,
    minimum: 10,
  },
  {
    id: 4,
    name: "Agua Ciel 1L",
    code: "750105535531",
    stock: 84,
    minimum: 15,
  },
];

export default function StockPage() {
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
                Inventario
              </p>

              <h1 className="mt-2 text-3xl font-bold text-black">
                Stock
              </h1>

              <p className="mt-2 text-sm text-[#777777]">
                Consulta y administra las existencias de tus artículos.
              </p>
            </div>

            <button className="h-12 bg-[#D8A814] px-6 font-bold text-white hover:bg-black">
              + Ajustar stock
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="border border-[#D8A814] bg-[#D8A814] p-6 text-white">
              <p className="text-xs font-bold uppercase">
                Artículos
              </p>

              <p className="mt-3 text-3xl font-bold">
                1,248
              </p>
            </div>

            <div className="border border-[#E2E2E2] bg-white p-6">
              <p className="text-xs font-bold uppercase text-[#777777]">
                Unidades
              </p>

              <p className="mt-3 text-3xl font-bold text-black">
                18,742
              </p>
            </div>

            <div className="border border-[#E2E2E2] bg-white p-6">
              <p className="text-xs font-bold uppercase text-[#777777]">
                Stock bajo
              </p>

              <p className="mt-3 text-3xl font-bold text-black">
                34
              </p>
            </div>

            <div className="border border-[#E2E2E2] bg-white p-6">
              <p className="text-xs font-bold uppercase text-[#777777]">
                Agotados
              </p>

              <p className="mt-3 text-3xl font-bold text-black">
                12
              </p>
            </div>
          </div>

          <div className="my-6 flex gap-3">
            <input
              placeholder="Buscar artículo..."
              className="h-12 flex-1 border border-[#E0E0E0] bg-white px-5 text-black outline-none focus:border-[#D8A814]"
            />

            <select className="h-12 min-w-[220px] border border-[#E0E0E0] bg-white px-4 text-black">
              <option>Sucursal Centro</option>
              <option>Sucursal Cholula</option>
              <option>Sucursal Tehuacán</option>
            </select>

            <select className="h-12 min-w-[160px] border border-[#E0E0E0] bg-white px-4 text-black">
              <option>Todos</option>
              <option>Normal</option>
              <option>Stock bajo</option>
              <option>Agotados</option>
            </select>
          </div>

          <div className="border border-[#E2E2E2] bg-white">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] bg-[#FAFAFA] px-6 py-4">
              <p className="text-xs font-bold uppercase text-[#777777]">
                Artículo
              </p>

              <p className="text-center text-xs font-bold uppercase text-[#777777]">
                Existencia
              </p>

              <p className="text-center text-xs font-bold uppercase text-[#777777]">
                Mínimo
              </p>

              <p className="text-right text-xs font-bold uppercase text-[#777777]">
                Estado
              </p>
            </div>

            {stock.map((item) => {
              const status =
                item.stock === 0
                  ? "AGOTADO"
                  : item.stock <= item.minimum
                  ? "BAJO"
                  : "NORMAL";

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center border-t border-[#EEEEEE] px-6 py-5"
                >
                  <div>
                    <p className="font-bold text-black">
                      {item.name}
                    </p>

                    <p className="mt-1 text-xs text-[#999999]">
                      {item.code}
                    </p>
                  </div>

                  <p className="text-center text-xl font-bold text-black">
                    {item.stock}
                  </p>

                  <p className="text-center text-sm text-[#777777]">
                    {item.minimum}
                  </p>

                  <div className="text-right">
                    <span
                      className={`px-3 py-1 text-xs font-bold ${
                        status === "NORMAL"
                          ? "bg-[#D8A814] text-white"
                          : "border border-black text-black"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}