"use client";

import { useState } from "react";

import {
  CalendarDays,
  Download,
  FileDown,
  FileSpreadsheet,
  Printer,
  Search,
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

const tabs = ["Ventas", "Clientes", "Artículos", "Inventario"];

const salesRows = [
  {
    id: 1,
    article: "Coca-Cola 600 ml",
    units: 842,
    revenue: 15156,
    cost: 10525,
    profit: 4631,
    margin: "30.6%",
  },
  {
    id: 2,
    article: "Sabritas Original 105 g",
    units: 624,
    revenue: 9360,
    cost: 5928,
    profit: 3432,
    margin: "36.7%",
  },
  {
    id: 3,
    article: "Agua Ciel 1L",
    units: 510,
    revenue: 7140,
    cost: 4080,
    profit: 3060,
    margin: "42.9%",
  },
  {
    id: 4,
    article: "Pepsi 600 ml",
    units: 488,
    revenue: 8296,
    cost: 5758,
    profit: 2538,
    margin: "30.6%",
  },
];

const clientRows = [
  {
    id: 1,
    name: "Ana Martínez",
    phone: "222 145 8976",
    purchases: 24,
    total: 12450,
    lastPurchase: "28 Ago 2026",
    type: "Frecuente",
  },
  {
    id: 2,
    name: "Carlos Ramírez",
    phone: "221 356 7821",
    purchases: 19,
    total: 10280,
    lastPurchase: "30 Ago 2026",
    type: "Frecuente",
  },
  {
    id: 3,
    name: "Mariana Torres",
    phone: "222 555 1201",
    purchases: 1,
    total: 850,
    lastPurchase: "30 Ago 2026",
    type: "Nuevo",
  },
];

const articleRows = [
  {
    id: 1,
    name: "Coca-Cola 600 ml",
    family: "Bebidas",
    units: 842,
    revenue: 15156,
    profit: 4631,
  },
  {
    id: 2,
    name: "Sabritas Original",
    family: "Botanas",
    units: 624,
    revenue: 9360,
    profit: 3432,
  },
  {
    id: 3,
    name: "Agua Ciel 1L",
    family: "Bebidas",
    units: 510,
    revenue: 7140,
    profit: 3060,
  },
];

const inventoryRows = [
  {
    id: 1,
    article: "Coca-Cola 600 ml",
    stock: 125,
    minimum: 20,
    costValue: 1562.5,
    saleValue: 2250,
    status: "Normal",
  },
  {
    id: 2,
    article: "Sabritas Original",
    stock: 12,
    minimum: 20,
    costValue: 114,
    saleValue: 180,
    status: "Bajo",
  },
  {
    id: 3,
    article: "Galletas Emperador",
    stock: 0,
    minimum: 10,
    costValue: 0,
    saleValue: 0,
    status: "Agotado",
  },
];

export default function ReportesPage() {
  const [activeTab, setActiveTab] = useState("Ventas");

  const money = (value: number) =>
    `$${value.toLocaleString("es-MX", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Sidebar />

      <div className="ml-[250px] min-h-screen">
        <Header />

        <div className="p-10">
          {/* Encabezado */}
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
                Análisis
              </p>

              <h1 className="mt-2 text-3xl font-bold text-black">
                Reportes
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-[#777777]">
                Consulta, filtra, imprime y exporta información de ventas,
                clientes, artículos e inventario.
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="flex h-12 items-center gap-2 border border-black px-5 text-sm font-bold text-black transition-colors hover:bg-black hover:text-white"
            >
              <Printer size={17} />
              Imprimir
            </button>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex border-b border-[#DCDCDC]">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  border-b-2 px-6 py-4
                  text-sm font-semibold
                  transition-colors
                  ${
                    activeTab === tab
                      ? "border-[#D8A814] text-[#D8A814]"
                      : "border-transparent text-[#777777] hover:text-black"
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Filtros */}
          <section className="border border-[#E2E2E2] bg-white">
            <div className="border-b border-[#EEEEEE] px-7 py-5">
              <h2 className="font-bold text-black">
                Filtros del reporte
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 xl:grid-cols-5">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-[#777777]">
                  Desde
                </label>

                <div className="flex h-12 items-center border border-[#E0E0E0] bg-white px-4">
                  <CalendarDays
                    size={17}
                    className="mr-3 text-[#999999]"
                  />

                  <input
                    type="date"
                    defaultValue="2026-08-01"
                    className="w-full bg-transparent text-sm text-black outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-[#777777]">
                  Hasta
                </label>

                <div className="flex h-12 items-center border border-[#E0E0E0] bg-white px-4">
                  <CalendarDays
                    size={17}
                    className="mr-3 text-[#999999]"
                  />

                  <input
                    type="date"
                    defaultValue="2026-08-30"
                    className="w-full bg-transparent text-sm text-black outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-[#777777]">
                  Sucursal
                </label>

                <select className="h-12 w-full border border-[#E0E0E0] bg-white px-4 text-sm text-black outline-none focus:border-[#D8A814]">
                  <option>Todas las sucursales</option>
                  <option>Sucursal Centro</option>
                  <option>Sucursal Cholula</option>
                  <option>Sucursal Tehuacán</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-[#777777]">
                  Vendedor
                </label>

                <select className="h-12 w-full border border-[#E0E0E0] bg-white px-4 text-sm text-black outline-none focus:border-[#D8A814]">
                  <option>Todos los vendedores</option>
                  <option>Luis Martínez</option>
                  <option>Karen Castillo</option>
                  <option>José Ramírez</option>
                </select>
              </div>

              <div className="flex items-end">
                <button className="h-12 w-full bg-[#D8A814] px-5 text-sm font-bold text-white hover:bg-black">
                  Generar reporte
                </button>
              </div>
            </div>
          </section>

          {/* Tarjetas resumen */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="border border-[#D8A814] bg-[#D8A814] p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-wider">
                Ventas brutas
              </p>

              <p className="mt-4 text-3xl font-bold">
                $128,450
              </p>

              <p className="mt-2 text-sm">
                Periodo seleccionado
              </p>
            </div>

            <div className="border border-[#E2E2E2] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Costo
              </p>

              <p className="mt-4 text-3xl font-bold text-black">
                $74,200
              </p>

              <p className="mt-2 text-sm text-[#888888]">
                Mercancía vendida
              </p>
            </div>

            <div className="border border-[#E2E2E2] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Ganancia
              </p>

              <p className="mt-4 text-3xl font-bold text-black">
                $54,250
              </p>

              <p className="mt-2 text-sm text-[#D8A814]">
                42.2% de margen bruto
              </p>
            </div>

            <div className="border border-[#E2E2E2] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Tickets
              </p>

              <p className="mt-4 text-3xl font-bold text-black">
                286
              </p>

              <p className="mt-2 text-sm text-[#888888]">
                Ticket promedio $449
              </p>
            </div>
          </div>

          {/* Vista del reporte */}
          <section className="mt-6 border border-[#E2E2E2] bg-white">
            <div className="flex items-center justify-between border-b border-[#EEEEEE] px-7 py-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                  Vista previa
                </p>

                <h2 className="mt-1 text-xl font-bold text-black">
                  Reporte de {activeTab.toLowerCase()}
                </h2>

                <p className="mt-1 text-sm text-[#888888]">
                  01 Ago 2026 - 30 Ago 2026 · Todas las sucursales
                </p>
              </div>

              <div className="flex gap-2">
                <button className="flex h-10 items-center gap-2 border border-[#E0E0E0] px-4 text-sm font-semibold text-black hover:border-black">
                  <FileDown size={16} />
                  PDF
                </button>

                <button className="flex h-10 items-center gap-2 border border-[#E0E0E0] px-4 text-sm font-semibold text-black hover:border-black">
                  <FileSpreadsheet size={16} />
                  Excel
                </button>

                <button className="flex h-10 items-center gap-2 border border-[#E0E0E0] px-4 text-sm font-semibold text-black hover:border-black">
                  <Download size={16} />
                  CSV
                </button>
              </div>
            </div>

            {/* VENTAS */}
            {activeTab === "Ventas" && (
              <>
                <div className="grid grid-cols-[2fr_.7fr_1fr_1fr_1fr_.8fr] bg-[#FAFAFA] px-6 py-4">
                  <p className="text-xs font-bold uppercase text-[#777777]">
                    Artículo
                  </p>

                  <p className="text-right text-xs font-bold uppercase text-[#777777]">
                    Unidades
                  </p>

                  <p className="text-right text-xs font-bold uppercase text-[#777777]">
                    Venta
                  </p>

                  <p className="text-right text-xs font-bold uppercase text-[#777777]">
                    Costo
                  </p>

                  <p className="text-right text-xs font-bold uppercase text-[#777777]">
                    Ganancia
                  </p>

                  <p className="text-right text-xs font-bold uppercase text-[#777777]">
                    Margen
                  </p>
                </div>

                {salesRows.map((row) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-[2fr_.7fr_1fr_1fr_1fr_.8fr] items-center border-t border-[#EEEEEE] px-6 py-5"
                  >
                    <p className="font-bold text-black">
                      {row.article}
                    </p>

                    <p className="text-right font-semibold text-black">
                      {row.units}
                    </p>

                    <p className="text-right font-bold text-black">
                      {money(row.revenue)}
                    </p>

                    <p className="text-right text-sm text-[#666666]">
                      {money(row.cost)}
                    </p>

                    <p className="text-right font-bold text-[#D8A814]">
                      {money(row.profit)}
                    </p>

                    <p className="text-right text-sm font-semibold text-black">
                      {row.margin}
                    </p>
                  </div>
                ))}
              </>
            )}

            {/* CLIENTES */}
            {activeTab === "Clientes" && (
              <>
                <div className="grid grid-cols-[2fr_1.2fr_.8fr_1fr_1.2fr_.8fr] bg-[#FAFAFA] px-6 py-4">
                  <p className="text-xs font-bold uppercase text-[#777777]">
                    Cliente
                  </p>
                  <p className="text-xs font-bold uppercase text-[#777777]">
                    Teléfono
                  </p>
                  <p className="text-center text-xs font-bold uppercase text-[#777777]">
                    Compras
                  </p>
                  <p className="text-right text-xs font-bold uppercase text-[#777777]">
                    Total
                  </p>
                  <p className="text-right text-xs font-bold uppercase text-[#777777]">
                    Última compra
                  </p>
                  <p className="text-right text-xs font-bold uppercase text-[#777777]">
                    Tipo
                  </p>
                </div>

                {clientRows.map((row) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-[2fr_1.2fr_.8fr_1fr_1.2fr_.8fr] items-center border-t border-[#EEEEEE] px-6 py-5"
                  >
                    <p className="font-bold text-black">
                      {row.name}
                    </p>

                    <p className="text-sm text-[#666666]">
                      {row.phone}
                    </p>

                    <p className="text-center font-bold text-black">
                      {row.purchases}
                    </p>

                    <p className="text-right font-bold text-[#D8A814]">
                      {money(row.total)}
                    </p>

                    <p className="text-right text-sm text-[#666666]">
                      {row.lastPurchase}
                    </p>

                    <div className="text-right">
                      <span className="border border-[#D8A814] px-3 py-1 text-xs font-bold text-[#D8A814]">
                        {row.type}
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* ARTÍCULOS */}
            {activeTab === "Artículos" && (
              <>
                <div className="grid grid-cols-[2fr_1.2fr_.8fr_1fr_1fr] bg-[#FAFAFA] px-6 py-4">
                  <p className="text-xs font-bold uppercase text-[#777777]">
                    Artículo
                  </p>
                  <p className="text-xs font-bold uppercase text-[#777777]">
                    Familia
                  </p>
                  <p className="text-right text-xs font-bold uppercase text-[#777777]">
                    Unidades
                  </p>
                  <p className="text-right text-xs font-bold uppercase text-[#777777]">
                    Ventas
                  </p>
                  <p className="text-right text-xs font-bold uppercase text-[#777777]">
                    Ganancia
                  </p>
                </div>

                {articleRows.map((row) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-[2fr_1.2fr_.8fr_1fr_1fr] items-center border-t border-[#EEEEEE] px-6 py-5"
                  >
                    <p className="font-bold text-black">
                      {row.name}
                    </p>

                    <p className="text-sm text-[#666666]">
                      {row.family}
                    </p>

                    <p className="text-right font-bold text-black">
                      {row.units}
                    </p>

                    <p className="text-right font-bold text-black">
                      {money(row.revenue)}
                    </p>

                    <p className="text-right font-bold text-[#D8A814]">
                      {money(row.profit)}
                    </p>
                  </div>
                ))}
              </>
            )}

            {/* INVENTARIO */}
            {activeTab === "Inventario" && (
              <>
                <div className="grid grid-cols-[2fr_.8fr_.8fr_1fr_1fr_1fr] bg-[#FAFAFA] px-6 py-4">
                  <p className="text-xs font-bold uppercase text-[#777777]">
                    Artículo
                  </p>
                  <p className="text-center text-xs font-bold uppercase text-[#777777]">
                    Stock
                  </p>
                  <p className="text-center text-xs font-bold uppercase text-[#777777]">
                    Mínimo
                  </p>
                  <p className="text-right text-xs font-bold uppercase text-[#777777]">
                    Valor costo
                  </p>
                  <p className="text-right text-xs font-bold uppercase text-[#777777]">
                    Valor venta
                  </p>
                  <p className="text-right text-xs font-bold uppercase text-[#777777]">
                    Estado
                  </p>
                </div>

                {inventoryRows.map((row) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-[2fr_.8fr_.8fr_1fr_1fr_1fr] items-center border-t border-[#EEEEEE] px-6 py-5"
                  >
                    <p className="font-bold text-black">
                      {row.article}
                    </p>

                    <p className="text-center font-bold text-black">
                      {row.stock}
                    </p>

                    <p className="text-center text-sm text-[#777777]">
                      {row.minimum}
                    </p>

                    <p className="text-right text-sm text-[#666666]">
                      {money(row.costValue)}
                    </p>

                    <p className="text-right font-bold text-black">
                      {money(row.saleValue)}
                    </p>

                    <div className="text-right">
                      <span
                        className={`
                          px-3 py-1 text-xs font-bold
                          ${
                            row.status === "Normal"
                              ? "bg-[#D8A814] text-white"
                              : "border border-black text-black"
                          }
                        `}
                      >
                        {row.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Pie del reporte */}
            <div className="flex items-center justify-between border-t border-[#E5E5E5] bg-[#FAFAFA] px-7 py-5">
              <p className="text-xs text-[#888888]">
                Reporte generado para uso administrativo.
              </p>

              <p className="text-xs font-semibold text-black">
                CRM · 30 Agosto 2026
              </p>
            </div>
          </section>

          {/* Reportes rápidos */}
          <section className="mt-6 border border-[#E2E2E2] bg-white">
            <div className="border-b border-[#EEEEEE] px-7 py-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                Accesos rápidos
              </p>

              <h2 className="mt-1 text-xl font-bold text-black">
                Reportes frecuentes
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title: "Ventas de hoy",
                  description: "Resumen completo de las ventas del día.",
                },
                {
                  title: "Resumen semanal",
                  description: "Ventas, costos y utilidad de la semana.",
                },
                {
                  title: "Cierre mensual",
                  description: "Resumen administrativo del mes.",
                },
                {
                  title: "Inventario actual",
                  description: "Existencias y valuación por sucursal.",
                },
              ].map((item) => (
                <button
                  key={item.title}
                  className="border-r border-[#EEEEEE] p-6 text-left last:border-r-0 hover:bg-[#FAFAFA]"
                >
                  <p className="font-bold text-black">
                    {item.title}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#777777]">
                    {item.description}
                  </p>

                  <p className="mt-5 text-sm font-bold text-[#D8A814]">
                    Generar →
                  </p>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}