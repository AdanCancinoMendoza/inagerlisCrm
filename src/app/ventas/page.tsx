"use client";

import { useState } from "react";

import {
  BarChart3,
  Boxes,
  CalendarDays,
  ChevronDown,
  DollarSign,
  Package,
  Search,
  ShoppingCart,
  TrendingUp,
  WalletCards,
  X,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

/* =========================================================
   DATOS DE PRUEBA
========================================================= */

const generalSales = [
  {
    period: "Lun",
    sales: 12400,
    cost: 7600,
    profit: 4800,
  },
  {
    period: "Mar",
    sales: 15800,
    cost: 9100,
    profit: 6700,
  },
  {
    period: "Mié",
    sales: 13900,
    cost: 8200,
    profit: 5700,
  },
  {
    period: "Jue",
    sales: 18200,
    cost: 10600,
    profit: 7600,
  },
  {
    period: "Vie",
    sales: 21400,
    cost: 11900,
    profit: 9500,
  },
  {
    period: "Sáb",
    sales: 26100,
    cost: 14500,
    profit: 11600,
  },
  {
    period: "Dom",
    sales: 19400,
    cost: 11000,
    profit: 8400,
  },
];

const products = [
  {
    id: 1,
    name: "Coca-Cola 600 ml",
    code: "750105530001",
    family: "Bebidas",
    purchasePrice: 12.5,
    salePrice: 18,
    units: 842,
    revenue: 15156,
    profit: 4631,
  },
  {
    id: 2,
    name: "Sabritas Original 105 g",
    code: "750047800030",
    family: "Botanas",
    purchasePrice: 9.5,
    salePrice: 15,
    units: 624,
    revenue: 9360,
    profit: 3432,
  },
  {
    id: 3,
    name: "Agua Ciel 1L",
    code: "750105535531",
    family: "Bebidas",
    purchasePrice: 8,
    salePrice: 14,
    units: 510,
    revenue: 7140,
    profit: 3060,
  },
  {
    id: 4,
    name: "Pepsi 600 ml",
    code: "750105530002",
    family: "Bebidas",
    purchasePrice: 11.8,
    salePrice: 17,
    units: 488,
    revenue: 8296,
    profit: 2537.6,
  },
  {
    id: 5,
    name: "Galletas Emperador",
    code: "750100012003",
    family: "Abarrotes",
    purchasePrice: 10,
    salePrice: 16,
    units: 411,
    revenue: 6576,
    profit: 2466,
  },
];

const weeklyProductData = [
  { period: "Lun", units: 84, sales: 1512, profit: 462 },
  { period: "Mar", units: 106, sales: 1908, profit: 583 },
  { period: "Mié", units: 96, sales: 1728, profit: 528 },
  { period: "Jue", units: 122, sales: 2196, profit: 671 },
  { period: "Vie", units: 145, sales: 2610, profit: 798 },
  { period: "Sáb", units: 168, sales: 3024, profit: 924 },
  { period: "Dom", units: 121, sales: 2178, profit: 665 },
];

const monthlyProductData = [
  { period: "Sem 1", units: 560, sales: 10080, profit: 3080 },
  { period: "Sem 2", units: 623, sales: 11214, profit: 3426 },
  { period: "Sem 3", units: 590, sales: 10620, profit: 3245 },
  { period: "Sem 4", units: 702, sales: 12636, profit: 3861 },
];

const yearlyProductData = [
  { period: "Ene", units: 1800, sales: 32400, profit: 9900 },
  { period: "Feb", units: 1920, sales: 34560, profit: 10560 },
  { period: "Mar", units: 2110, sales: 37980, profit: 11605 },
  { period: "Abr", units: 2040, sales: 36720, profit: 11220 },
  { period: "May", units: 2310, sales: 41580, profit: 12705 },
  { period: "Jun", units: 2450, sales: 44100, profit: 13475 },
  { period: "Jul", units: 2570, sales: 46260, profit: 14135 },
  { period: "Ago", units: 2680, sales: 48240, profit: 14740 },
  { period: "Sep", units: 2420, sales: 43560, profit: 13310 },
  { period: "Oct", units: 2790, sales: 50220, profit: 15345 },
  { period: "Nov", units: 2910, sales: 52380, profit: 16005 },
  { period: "Dic", units: 3240, sales: 58320, profit: 17820 },
];

type Period = "Semana" | "Mes" | "Año";
type Metric = "units" | "sales" | "profit";
type GeneralChart = "line" | "bar";

export default function VentasPage() {
  const [productModalOpen, setProductModalOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(products[0]);

  const [period, setPeriod] = useState<Period>("Semana");

  const [metric, setMetric] = useState<Metric>("units");

  const [generalChart, setGeneralChart] =
    useState<GeneralChart>("line");

  const [productSearch, setProductSearch] = useState("");

  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.code} ${product.family}`
      .toLowerCase()
      .includes(productSearch.toLowerCase())
  );

  const getProductChartData = () => {
    if (period === "Mes") return monthlyProductData;
    if (period === "Año") return yearlyProductData;

    return weeklyProductData;
  };

  const metricConfig = {
    units: {
      label: "Unidades vendidas",
      suffix: "",
      prefix: "",
    },
    sales: {
      label: "Ventas",
      prefix: "$",
      suffix: "",
    },
    profit: {
      label: "Ganancia",
      prefix: "$",
      suffix: "",
    },
  };

  const metricSelected = metricConfig[metric];

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Sidebar />

      <div className="ml-[250px] min-h-screen">
        <Header />

        <div className="p-10">
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
                Operaciones
              </p>

              <h1 className="mt-2 text-3xl font-bold text-black">
                Ventas
              </h1>

              <p className="mt-2 text-sm text-[#777777]">
                Analiza ventas, costos, ganancias y comportamiento de tus
                artículos.
              </p>
            </div>

            <div className="flex gap-3">
              <select className="h-12 border border-[#E0E0E0] bg-white px-4 text-sm font-medium text-black outline-none focus:border-[#D8A814]">
                <option>Sucursal Centro</option>
                <option>Sucursal Cholula</option>
                <option>Todas las sucursales</option>
              </select>

              <button className="flex h-12 items-center gap-2 border border-black px-5 text-sm font-bold text-black hover:bg-black hover:text-white">
                <CalendarDays size={17} />
                Este mes
                <ChevronDown size={15} />
              </button>
            </div>
          </div>

          {/* =================================================
              KPIs
          ================================================= */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="border border-[#D8A814] bg-[#D8A814] p-6 text-white">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider">
                  Ventas
                </p>

                <DollarSign size={21} />
              </div>

              <p className="mt-5 text-3xl font-bold">
                $127,200
              </p>

              <p className="mt-2 text-sm">
                +12.5% contra periodo anterior
              </p>
            </div>

            <div className="border border-[#E2E2E2] bg-white p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                  Costo de mercancía
                </p>

                <WalletCards
                  size={21}
                  className="text-[#777777]"
                />
              </div>

              <p className="mt-5 text-3xl font-bold text-black">
                $72,900
              </p>

              <p className="mt-2 text-sm text-[#888888]">
                Costo de productos vendidos
              </p>
            </div>

            <div className="border border-[#E2E2E2] bg-white p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                  Ganancia
                </p>

                <TrendingUp
                  size={21}
                  className="text-[#D8A814]"
                />
              </div>

              <p className="mt-5 text-3xl font-bold text-black">
                $54,300
              </p>

              <p className="mt-2 text-sm font-medium text-[#D8A814]">
                Ventas - costo de mercancía
              </p>
            </div>

            <div className="border border-[#E2E2E2] bg-white p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                  Margen
                </p>

                <BarChart3
                  size={21}
                  className="text-[#777777]"
                />
              </div>

              <p className="mt-5 text-3xl font-bold text-black">
                42.7%
              </p>

              <p className="mt-2 text-sm text-[#888888]">
                Margen bruto estimado
              </p>
            </div>
          </div>

          {/* =================================================
              GRÁFICA GENERAL
          ================================================= */}

          <section className="mt-6 border border-[#E2E2E2] bg-white">
            <div className="flex items-center justify-between border-b border-[#EEEEEE] px-7 py-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                  Rendimiento
                </p>

                <h2 className="mt-1 text-xl font-bold text-black">
                  Ventas, costos y ganancias
                </h2>

                <p className="mt-1 text-sm text-[#888888]">
                  Comparación general de la operación.
                </p>
              </div>

              <div className="flex border border-[#E0E0E0]">
                <button
                  onClick={() => setGeneralChart("line")}
                  className={`h-10 px-4 text-sm font-semibold ${
                    generalChart === "line"
                      ? "bg-[#050505] text-white"
                      : "bg-white text-[#777777]"
                  }`}
                >
                  Línea
                </button>

                <button
                  onClick={() => setGeneralChart("bar")}
                  className={`h-10 px-4 text-sm font-semibold ${
                    generalChart === "bar"
                      ? "bg-[#050505] text-white"
                      : "bg-white text-[#777777]"
                  }`}
                >
                  Barras
                </button>
              </div>
            </div>

            <div className="h-[390px] p-7">
              <ResponsiveContainer width="100%" height="100%">
                {generalChart === "line" ? (
                  <LineChart data={generalSales}>
                    <CartesianGrid
                      strokeDasharray="0"
                      stroke="#EEEEEE"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="period"
                      tickLine={false}
                      axisLine={false}
                    />

                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) =>
                        `$${(value / 1000).toFixed(0)}k`
                      }
                    />

                    <Tooltip
                      formatter={(value) => [
                        `$${Number(value).toLocaleString()}`,
                        "",
                      ]}
                    />

                    <Legend />

                    <Line
                      type="monotone"
                      dataKey="sales"
                      name="Ventas"
                      stroke="#D8A814"
                      strokeWidth={3}
                      dot={false}
                    />

                    <Line
                      type="monotone"
                      dataKey="cost"
                      name="Costo"
                      stroke="#777777"
                      strokeWidth={2}
                      dot={false}
                    />

                    <Line
                      type="monotone"
                      dataKey="profit"
                      name="Ganancia"
                      stroke="#050505"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                ) : (
                  <BarChart data={generalSales}>
                    <CartesianGrid
                      strokeDasharray="0"
                      stroke="#EEEEEE"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="period"
                      tickLine={false}
                      axisLine={false}
                    />

                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) =>
                        `$${(value / 1000).toFixed(0)}k`
                      }
                    />

                    <Tooltip
                      formatter={(value) => [
                        `$${Number(value).toLocaleString()}`,
                        "",
                      ]}
                    />

                    <Legend />

                    <Bar
                      dataKey="sales"
                      name="Ventas"
                      fill="#D8A814"
                    />

                    <Bar
                      dataKey="cost"
                      name="Costo"
                      fill="#999999"
                    />

                    <Bar
                      dataKey="profit"
                      name="Ganancia"
                      fill="#050505"
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </section>

          {/* =================================================
              DOS COLUMNAS
          ================================================= */}

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1.5fr]">
            {/* Ranking */}
            <section className="border border-[#E2E2E2] bg-white">
              <div className="border-b border-[#EEEEEE] px-7 py-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                  Productos
                </p>

                <h2 className="mt-1 text-xl font-bold text-black">
                  Más vendidos
                </h2>
              </div>

              {products.slice(0, 5).map((product, index) => (
                <button
                  key={product.id}
                  onClick={() => {
                    setSelectedProduct(product);
                  }}
                  className="flex w-full items-center gap-4 border-b border-[#EEEEEE] px-6 py-5 text-left last:border-none hover:bg-[#FAFAFA]"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center font-bold ${
                      index === 0
                        ? "bg-[#D8A814] text-white"
                        : "bg-[#F2F2F2] text-black"
                    }`}
                  >
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-black">
                      {product.name}
                    </p>

                    <p className="mt-1 text-xs text-[#888888]">
                      {product.units.toLocaleString()} unidades
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-[#D8A814]">
                      ${product.revenue.toLocaleString()}
                    </p>

                    <p className="mt-1 text-xs text-[#999999]">
                      ventas
                    </p>
                  </div>
                </button>
              ))}
            </section>

            {/* Análisis de artículo */}
            <section className="border border-[#E2E2E2] bg-white">
              <div className="border-b border-[#EEEEEE] px-7 py-6">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                      Análisis individual
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-black">
                      {selectedProduct.name}
                    </h2>

                    <p className="mt-1 text-sm text-[#888888]">
                      {selectedProduct.code} · {selectedProduct.family}
                    </p>
                  </div>

                  <button
                    onClick={() => setProductModalOpen(true)}
                    className="flex h-11 items-center gap-2 border border-black px-5 text-sm font-bold text-black hover:bg-black hover:text-white"
                  >
                    <Package size={17} />

                    Seleccionar producto
                  </button>
                </div>

                {/* Precio y utilidad */}
                <div className="mt-6 grid grid-cols-3 border border-[#EEEEEE]">
                  <div className="p-4">
                    <p className="text-[11px] uppercase text-[#999999]">
                      Precio compra
                    </p>

                    <p className="mt-1 text-lg font-bold text-black">
                      ${selectedProduct.purchasePrice.toFixed(2)}
                    </p>
                  </div>

                  <div className="border-l border-[#EEEEEE] p-4">
                    <p className="text-[11px] uppercase text-[#999999]">
                      Precio venta
                    </p>

                    <p className="mt-1 text-lg font-bold text-[#D8A814]">
                      ${selectedProduct.salePrice.toFixed(2)}
                    </p>
                  </div>

                  <div className="border-l border-[#EEEEEE] p-4">
                    <p className="text-[11px] uppercase text-[#999999]">
                      Utilidad unidad
                    </p>

                    <p className="mt-1 text-lg font-bold text-black">
                      $
                      {(
                        selectedProduct.salePrice -
                        selectedProduct.purchasePrice
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Opciones */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EEEEEE] px-7 py-4">
                <div className="flex border border-[#E0E0E0]">
                  {(["Semana", "Mes", "Año"] as Period[]).map(
                    (item) => (
                      <button
                        key={item}
                        onClick={() => setPeriod(item)}
                        className={`h-10 px-4 text-sm font-semibold ${
                          period === item
                            ? "bg-[#D8A814] text-white"
                            : "bg-white text-[#777777]"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>

                <div className="flex border border-[#E0E0E0]">
                  <button
                    onClick={() => setMetric("units")}
                    className={`h-10 px-4 text-sm font-semibold ${
                      metric === "units"
                        ? "bg-[#050505] text-white"
                        : "bg-white text-[#777777]"
                    }`}
                  >
                    Unidades
                  </button>

                  <button
                    onClick={() => setMetric("sales")}
                    className={`h-10 px-4 text-sm font-semibold ${
                      metric === "sales"
                        ? "bg-[#050505] text-white"
                        : "bg-white text-[#777777]"
                    }`}
                  >
                    Ventas
                  </button>

                  <button
                    onClick={() => setMetric("profit")}
                    className={`h-10 px-4 text-sm font-semibold ${
                      metric === "profit"
                        ? "bg-[#050505] text-white"
                        : "bg-white text-[#777777]"
                    }`}
                  >
                    Ganancia
                  </button>
                </div>
              </div>

              {/* Gráfica producto */}
              <div className="h-[350px] p-7">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getProductChartData()}>
                    <CartesianGrid
                      stroke="#EEEEEE"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="period"
                      tickLine={false}
                      axisLine={false}
                    />

                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) =>
                        metric === "units"
                          ? value.toLocaleString()
                          : `$${Number(value).toLocaleString()}`
                      }
                    />

                    <Tooltip
                      formatter={(value) => [
                        `${metricSelected.prefix}${Number(
                          value
                        ).toLocaleString()}${metricSelected.suffix}`,
                        metricSelected.label,
                      ]}
                    />

                    <Line
                      type="monotone"
                      dataKey={metric}
                      name={metricSelected.label}
                      stroke="#D8A814"
                      strokeWidth={3}
                      dot={{
                        fill: "#050505",
                        r: 4,
                      }}
                      activeDot={{
                        r: 6,
                        fill: "#D8A814",
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          {/* =================================================
              RESUMEN ARTÍCULOS
          ================================================= */}

          <section className="mt-6 border border-[#E2E2E2] bg-white">
            <div className="flex items-center justify-between border-b border-[#EEEEEE] px-7 py-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                  Rentabilidad
                </p>

                <h2 className="mt-1 text-xl font-bold text-black">
                  Rendimiento por artículo
                </h2>
              </div>

              <button
                onClick={() => setProductModalOpen(true)}
                className="text-sm font-bold text-[#D8A814] hover:text-black"
              >
                Explorar artículos
              </button>
            </div>

            <div className="grid grid-cols-[2fr_.8fr_.8fr_.8fr_.9fr_.9fr] bg-[#FAFAFA] px-6 py-4">
              <p className="text-xs font-bold uppercase text-[#777777]">
                Artículo
              </p>

              <p className="text-right text-xs font-bold uppercase text-[#777777]">
                Compra
              </p>

              <p className="text-right text-xs font-bold uppercase text-[#777777]">
                Venta
              </p>

              <p className="text-right text-xs font-bold uppercase text-[#777777]">
                Unidades
              </p>

              <p className="text-right text-xs font-bold uppercase text-[#777777]">
                Facturado
              </p>

              <p className="text-right text-xs font-bold uppercase text-[#777777]">
                Ganancia
              </p>
            </div>

            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => {
                  setSelectedProduct(product);
                  window.scrollTo({
                    top: 600,
                    behavior: "smooth",
                  });
                }}
                className="grid w-full grid-cols-[2fr_.8fr_.8fr_.8fr_.9fr_.9fr] items-center border-t border-[#EEEEEE] px-6 py-5 text-left hover:bg-[#FAFAFA]"
              >
                <div>
                  <p className="font-bold text-black">
                    {product.name}
                  </p>

                  <p className="mt-1 text-xs text-[#999999]">
                    {product.code}
                  </p>
                </div>

                <p className="text-right text-sm text-[#666666]">
                  ${product.purchasePrice.toFixed(2)}
                </p>

                <p className="text-right font-bold text-black">
                  ${product.salePrice.toFixed(2)}
                </p>

                <p className="text-right font-semibold text-black">
                  {product.units.toLocaleString()}
                </p>

                <p className="text-right font-bold text-black">
                  ${product.revenue.toLocaleString()}
                </p>

                <p className="text-right font-bold text-[#D8A814]">
                  $
                  {product.profit.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </p>
              </button>
            ))}
          </section>
        </div>
      </div>

      {/* =====================================================
          MODAL PRODUCTOS
      ====================================================== */}

      {productModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-5">
          <div className="flex max-h-[80vh] w-full max-w-[720px] flex-col border border-[#D8A814] bg-white">
            {/* Encabezado */}
            <div className="flex items-start justify-between border-b border-[#E5E5E5] px-7 py-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                  Ventas
                </p>

                <h2 className="mt-1 text-2xl font-bold text-black">
                  Seleccionar artículo
                </h2>

                <p className="mt-1 text-sm text-[#888888]">
                  Selecciona un producto para analizar sus ventas.
                </p>
              </div>

              <button
                onClick={() => setProductModalOpen(false)}
                className="text-[#777777] hover:text-black"
              >
                <X size={24} />
              </button>
            </div>

            {/* Buscador */}
            <div className="border-b border-[#EEEEEE] p-6">
              <div className="flex h-12 items-center border border-[#D8A814] px-4">
                <Search
                  size={19}
                  className="mr-3 text-[#888888]"
                />

                <input
                  autoFocus
                  value={productSearch}
                  onChange={(event) =>
                    setProductSearch(event.target.value)
                  }
                  placeholder="Buscar por nombre, código o familia..."
                  className="h-full flex-1 bg-transparent text-black outline-none"
                />
              </div>
            </div>

            {/* Productos */}
            <div
              className="
                flex-1 overflow-y-auto

                [&::-webkit-scrollbar]:w-1
                [&::-webkit-scrollbar-thumb]:bg-[#D8A814]
                [&::-webkit-scrollbar-track]:bg-[#F2F2F2]
              "
            >
              {filteredProducts.map((product) => {
                const selected =
                  selectedProduct.id === product.id;

                return (
                  <button
                    key={product.id}
                    onClick={() => {
                      setSelectedProduct(product);
                      setProductModalOpen(false);
                      setProductSearch("");
                    }}
                    className={`
                      flex w-full items-center gap-5
                      border-b border-[#EEEEEE]
                      px-6 py-5 text-left
                      last:border-none
                      ${
                        selected
                          ? "border-l-4 border-l-[#D8A814] bg-[#FAFAFA]"
                          : "border-l-4 border-l-transparent hover:bg-[#FAFAFA]"
                      }
                    `}
                  >
                    <div
                      className={`
                        flex h-12 w-12 flex-none
                        items-center justify-center
                        ${
                          selected
                            ? "bg-[#D8A814] text-white"
                            : "bg-[#050505] text-white"
                        }
                      `}
                    >
                      <Package size={21} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-black">
                        {product.name}
                      </p>

                      <p className="mt-1 text-xs text-[#888888]">
                        {product.code} · {product.family}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-black">
                        ${product.salePrice.toFixed(2)}
                      </p>

                      <p className="mt-1 text-xs text-[#888888]">
                        {product.units.toLocaleString()} ventas
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}