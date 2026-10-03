"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSidebar } from "@/context/SidebarContext";

const articles = [
  {
    id: 1,
    code: "750105530001",
    name: "Coca-Cola 600 ml",
    family: "Bebidas",
    subfamily: "Refrescos",
    purchase: "$12.50",
    sale: "$18.00",
    unit: "Pieza",
    active: true,
  },
  {
    id: 2,
    code: "750105530002",
    name: "Pepsi 600 ml",
    family: "Bebidas",
    subfamily: "Refrescos",
    purchase: "$11.80",
    sale: "$17.00",
    unit: "Pieza",
    active: true,
  },
  {
    id: 3,
    code: "750047800030",
    name: "Sabritas Original 105 g",
    family: "Botanas",
    subfamily: "Papas",
    purchase: "$9.50",
    sale: "$15.00",
    unit: "Pieza",
    active: true,
  },
  {
    id: 4,
    code: "ART-004",
    name: "Azúcar 1 kg",
    family: "Abarrotes",
    subfamily: "Azúcar",
    purchase: "$23.00",
    sale: "$31.50",
    unit: "Kg",
    active: false,
  },
];

export default function ArticulosPage() {
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
                Catálogo
              </p>

              <h1 className="mt-2 text-3xl font-bold text-black">
                Artículos
              </h1>

              <p className="mt-2 text-sm text-[#777777]">
                Administra los artículos y servicios disponibles en tu
                organización.
              </p>
            </div>

            <div className="flex gap-3">
              <button className="h-12 border border-black px-6 font-bold text-black hover:bg-black hover:text-white">
                Importar
              </button>

              <button className="h-12 bg-[#D8A814] px-6 font-bold text-white hover:bg-black">
                + Nuevo artículo
              </button>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="border border-[#D8A814] bg-[#D8A814] p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-wider">
                Artículos
              </p>

              <p className="mt-3 text-3xl font-bold">
                1,248
              </p>
            </div>

            <div className="border border-[#E2E2E2] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Familias
              </p>

              <p className="mt-3 text-3xl font-bold text-black">
                48
              </p>
            </div>

            <div className="border border-[#E2E2E2] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Subfamilias
              </p>

              <p className="mt-3 text-3xl font-bold text-black">
                126
              </p>
            </div>

            <div className="border border-[#E2E2E2] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Activos
              </p>

              <p className="mt-3 text-3xl font-bold text-black">
                1,186
              </p>
            </div>
          </div>

          {/* Filtros */}
          <div className="my-6 flex gap-3">
            <input
              placeholder="Buscar por nombre, código o código de barras..."
              className="h-12 flex-1 border border-[#E0E0E0] bg-white px-5 text-black outline-none focus:border-[#D8A814]"
            />

            <select className="h-12 min-w-[180px] border border-[#E0E0E0] bg-white px-4 text-black">
              <option>Todas las familias</option>
              <option>Bebidas</option>
              <option>Botanas</option>
              <option>Abarrotes</option>
            </select>

            <select className="h-12 min-w-[150px] border border-[#E0E0E0] bg-white px-4 text-black">
              <option>Todos</option>
              <option>Activos</option>
              <option>Inactivos</option>
            </select>
          </div>

          {/* Tabla */}
          <section className="border border-[#E2E2E2] bg-white">
            <div className="grid grid-cols-[2.2fr_1fr_1fr_.8fr_.8fr_.7fr] bg-[#FAFAFA] px-6 py-4">
              <span className="text-xs font-bold uppercase text-[#777777]">
                Artículo
              </span>

              <span className="text-xs font-bold uppercase text-[#777777]">
                Familia
              </span>

              <span className="text-xs font-bold uppercase text-[#777777]">
                Subfamilia
              </span>

              <span className="text-right text-xs font-bold uppercase text-[#777777]">
                Compra
              </span>

              <span className="text-right text-xs font-bold uppercase text-[#777777]">
                Venta
              </span>

              <span className="text-right text-xs font-bold uppercase text-[#777777]">
                Estado
              </span>
            </div>

            {articles.map((article) => (
              <button
                key={article.id}
                className="grid w-full grid-cols-[2.2fr_1fr_1fr_.8fr_.8fr_.7fr] items-center border-t border-[#EEEEEE] px-6 py-5 text-left hover:bg-[#FAFAFA]"
              >
                <div>
                  <p className="font-bold text-black">
                    {article.name}
                  </p>

                  <div className="mt-1 flex gap-3 text-xs text-[#999999]">
                    <span>{article.code}</span>
                    <span>•</span>
                    <span>{article.unit}</span>
                  </div>
                </div>

                <p className="text-sm text-[#555555]">
                  {article.family}
                </p>

                <p className="text-sm text-[#555555]">
                  {article.subfamily}
                </p>

                <p className="text-right text-sm text-[#555555]">
                  {article.purchase}
                </p>

                <p className="text-right font-bold text-[#D8A814]">
                  {article.sale}
                </p>

                <div className="text-right">
                  <span
                    className={`px-3 py-1 text-xs font-bold ${
                      article.active
                        ? "bg-[#D8A814] text-white"
                        : "bg-[#EEEEEE] text-[#777777]"
                    }`}
                  >
                    {article.active ? "ACTIVO" : "INACTIVO"}
                  </span>
                </div>
              </button>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}