"use client";

import POSHeader from "@/components/pos/POSHeader";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Banknote,
  Barcode,
  ChevronDown,
  CircleUserRound,
  CreditCard,
  Minus,
  Package,
  Plus,
  ReceiptText,
  Search,
  ShoppingCart,
  Trash2,
  UserRound,
  WalletCards,
  X,
  CheckCircle2,
} from "lucide-react";

type Product = {
  id: number;
  code: string;
  name: string;
  price: number;
  family: string;
  image?: string;
};

type CartItem = Product & {
  quantity: number;
};

const fallbackProducts: Product[] = [
  {
    id: 1,
    code: "750105530001",
    name: "Coca-Cola 600 ml",
    price: 18,
    family: "Bebidas",
  },
  {
    id: 2,
    code: "750105530002",
    name: "Pepsi 600 ml",
    price: 17,
    family: "Bebidas",
  },
  {
    id: 3,
    code: "750047800030",
    name: "Sabritas Original 105 g",
    price: 15,
    family: "Botanas",
  },
  {
    id: 4,
    code: "750105535531",
    name: "Agua Ciel 1L",
    price: 14,
    family: "Bebidas",
  },
  {
    id: 5,
    code: "ART-005",
    name: "Galletas Emperador",
    price: 17,
    family: "Abarrotes",
  },
  {
    id: 6,
    code: "ART-006",
    name: "Leche Entera 1L",
    price: 29,
    family: "Lácteos",
  },
  {
    id: 7,
    code: "ART-007",
    name: "Pan Blanco",
    price: 35,
    family: "Panadería",
  },
  {
    id: 8,
    code: "ART-008",
    name: "Café soluble",
    price: 45,
    family: "Abarrotes",
  },
];

export default function POSPage() {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [selectedFamily, setSelectedFamily] = useState<string>("Todos");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("Público general");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "tarjeta" | "otro">("efectivo");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const money = (value: number) =>
    `$${value.toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const addProduct = (product: Product) => {
    setCart((current) => {
      const exists = current.find((item) => item.id === product.id);

      if (exists) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });
  };

  const changeQuantity = (id: number, delta: number) => {
    setCart((current) =>
      current
        .map((item) => {
          if (item.id !== id) return item;

          const nextQuantity = item.quantity + delta;
          return nextQuantity > 0 ? { ...item, quantity: nextQuantity } : null;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeProduct = (id: number) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key !== "Enter") return;
    const value = search.trim();
    if (!value) return;

    const exactProduct = products.find(
      (product) =>
        product.code.toLowerCase() === value.toLowerCase() ||
        product.name.toLowerCase() === value.toLowerCase()
    );

    if (exactProduct) {
      addProduct(exactProduct);
      setSearch("");
    }
  };

  const families = [
    "Todos",
    ...Array.from(new Set(products.map((product) => product.family))),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.code.toLowerCase().includes(search.toLowerCase());

    const matchesFamily =
      selectedFamily === "Todos" || product.family === selectedFamily;

    return matchesSearch && matchesFamily;
  });

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const tax = subtotal * 0.16;
  const total = subtotal + tax;

  const itemCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const handleProcessPayment = () => {
    setPaymentSuccess(true);
    setTimeout(() => {
      setCart([]);
      setPaymentSuccess(false);
      setIsPaymentModalOpen(false);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-[#F7F7F7] text-black">
      {/* HEADER POS */}
      <POSHeader activeTab="venta" ticketNumber="#000129" onNuevaVenta={() => setCart([])} />

      {/* CONTENIDO PRINCIPAL: Máxima prioridad al catálogo de productos */}
      <div className="grid h-[calc(100vh-136px)] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px] overflow-hidden">
        {/* SECCIÓN CATÁLOGO DE PRODUCTOS (AMPLIADO) */}
        <section className="flex flex-col min-w-0 border-r border-[#E2E2E2] bg-[#F9FAFB] p-6 overflow-hidden">
          {/* Barra de Búsqueda y Código de Barras */}
          <div className="flex-none">
            <div className="flex gap-3">
              <div className="flex h-12 flex-1 items-center rounded-xl border border-[#E5E7EB] bg-white px-4 shadow-sm focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                <Barcode size={22} className="mr-3 text-[#9CA3AF] flex-none" />

                <input
                  ref={searchRef}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Escanea código de barras o busca un producto..."
                  className="h-full min-w-0 flex-1 bg-transparent text-sm text-black outline-none placeholder:text-[#9CA3AF]"
                />

                <span className="ml-2 rounded bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-bold text-[#6B7280]">
                  ENTER
                </span>
              </div>

              <button className="flex h-12 w-12 flex-none items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#4B5563] shadow-sm hover:border-black hover:text-black">
                <Search size={19} />
              </button>
            </div>
          </div>

          {/* Filtros de Familias / Categorías */}
          <div className="mt-4 flex-none flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-[#D1D5DB]">
            {families.map((family) => (
              <button
                key={family}
                onClick={() => setSelectedFamily(family)}
                className={`
                  h-9 whitespace-nowrap rounded-lg px-4 text-xs font-bold transition-all
                  ${
                    selectedFamily === family
                      ? "bg-black text-white shadow-sm"
                      : "border border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#9CA3AF] hover:text-black"
                  }
                `}
              >
                {family}
              </button>
            ))}
          </div>

          {/* Encabezado del Catálogo */}
          <div className="mb-3 mt-4 flex-none flex items-center justify-between">
            <h1 className="text-base font-bold text-black">
              Productos ({filteredProducts.length})
            </h1>
            <span className="text-xs text-[#6B7280]">Selecciona para agregar</span>
          </div>

          {/* Grid de Productos Adaptativo con alta prioridad visual */}
          <div className="flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#D1D5DB]">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 pb-4">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addProduct(product)}
                  className="group flex flex-col justify-between rounded-xl border border-[#E5E7EB] bg-white p-3.5 text-left shadow-xs transition-all hover:border-[var(--primary)] hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary-light)] text-[var(--primary)] group-hover:scale-105 transition-transform">
                      <Package size={17} />
                    </div>

                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F3F4F6] text-[#6B7280] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                      <Plus size={14} />
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="line-clamp-2 text-xs font-bold text-[#111827] leading-tight">
                      {product.name}
                    </p>
                    <span className="mt-1 block text-[10px] font-medium text-[#9CA3AF]">
                      {product.family}
                    </span>
                  </div>

                  <div className="mt-3 border-t border-[#F3F4F6] pt-2 text-right">
                    <span className="text-sm font-bold text-[var(--primary)]">
                      {money(product.price)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* SECCIÓN ORDEN ACTUAL (CARRITO ESTILIZADO SEGÚN IMAGEN 2) */}
        <aside className="flex min-w-0 h-full overflow-hidden flex-col bg-white border-l border-[#E5E7EB]">
          {/* Header de la Orden */}
          <div className="border-b border-[#EEEEEE] px-6 py-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#111827]">Orden Actual</h2>
              <p className="mt-0.5 text-xs text-[#6B7280]">
                {cart.length === 0
                  ? "Sin artículos agregados"
                  : `${itemCount} ${itemCount === 1 ? "artículo" : "artículos"} en la orden`}
              </p>
            </div>

            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#EF4444] hover:underline"
              >
                <Trash2 size={14} />
                Vaciar
              </button>
            )}
          </div>

          {/* Área de Lista de Productos o Estado Vacío */}
          <div className="flex-1 overflow-y-auto px-6 py-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#D1D5DB]">
            {cart.length === 0 ? (
              /* ESTADO VACÍO FIEL A LA IMAGEN 2 DE REFERENCIA */
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary-light)] text-[var(--primary)] mb-4 shadow-xs">
                  <ShoppingCart size={28} />
                </div>

                <h3 className="text-base font-bold text-[#111827]">
                  El carrito está vacío
                </h3>

                <p className="mt-2 max-w-[220px] text-xs leading-relaxed text-[#6B7280]">
                  Haz clic en los productos del catálogo para agregarlos a la venta
                </p>
              </div>
            ) : (
              /* LISTA DE ARTÍCULOS SELECCIONADOS */
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-[#F3F4F6] bg-[#FAFAFA] p-3 transition-all hover:bg-white hover:shadow-xs"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="truncate text-xs font-bold text-[#111827]">
                        {item.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#6B7280]">
                        {money(item.price)} c/u
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex h-7 items-center rounded-lg border border-[#E5E7EB] bg-white">
                        <button
                          onClick={() => changeQuantity(item.id, -1)}
                          className="flex h-full w-7 items-center justify-center text-[#6B7280] hover:text-black"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-black">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => changeQuantity(item.id, 1)}
                          className="flex h-full w-7 items-center justify-center text-[#6B7280] hover:text-black"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="min-w-[50px] text-right text-xs font-bold text-black">
                        {money(item.price * item.quantity)}
                      </span>

                      <button
                        onClick={() => removeProduct(item.id)}
                        className="ml-1 text-[#9CA3AF] hover:text-[#EF4444]"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TOTALES Y BOTÓN DE COBRAR ESTILIZADO SEGÚN IMAGEN 2 */}
          <div className="border-t border-[#E5E7EB] bg-white p-6 space-y-4">
            {/* Desglose de Pago */}
            <div className="space-y-1.5 text-xs text-[#6B7280]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#111827]">{money(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (16%)</span>
                <span className="font-semibold text-[#111827]">{money(tax)}</span>
              </div>
            </div>

            {/* Total Destacado */}
            <div className="flex items-center justify-between border-t border-[#F3F4F6] pt-3">
              <span className="text-base font-bold text-[#111827]">Total Pagar</span>
              <span className="text-2xl font-bold text-[var(--primary)]">
                {money(total)}
              </span>
            </div>

            {/* Botón Principal de Cobro (Estilo de la Imagen 2) */}
            <button
              disabled={cart.length === 0}
              onClick={() => setIsPaymentModalOpen(true)}
              className="
                flex h-12 w-full items-center justify-center rounded-xl
                bg-[var(--primary)] text-sm font-bold text-white
                shadow-sm transition-all hover:bg-[var(--primary-hover)]
                disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none
              "
            >
              Cobrar
            </button>
          </div>
        </aside>
      </div>

      {/* MODAL DE COBRO / PAGO */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-4">
              <h3 className="text-lg font-bold text-black">Procesar Pago</h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-[#999999] hover:text-black"
              >
                <X size={20} />
              </button>
            </div>

            {paymentSuccess ? (
              <div className="my-8 flex flex-col items-center text-center">
                <CheckCircle2 size={56} className="text-emerald-500 animate-bounce" />
                <h4 className="mt-4 text-xl font-bold text-black">¡Venta Completada!</h4>
                <p className="mt-1 text-sm text-[#777777]">
                  Cobro procesado exitosamente
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                <div className="rounded-xl bg-[#F9FAFB] p-4 text-center">
                  <p className="text-xs uppercase tracking-wider text-[#6B7280]">Monto a cobrar</p>
                  <p className="mt-1 text-3xl font-bold text-[var(--primary)]">{money(total)}</p>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-[#374151]">
                    Método de Pago
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "efectivo", label: "Efectivo", icon: Banknote },
                      { id: "tarjeta", label: "Tarjeta", icon: CreditCard },
                      { id: "otro", label: "Otro", icon: WalletCards },
                    ].map((method) => {
                      const Icon = method.icon;
                      const active = paymentMethod === method.id;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id as any)}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                            active
                              ? "border-2 border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]"
                              : "border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#9CA3AF]"
                          }`}
                        >
                          <Icon size={20} className="mb-1" />
                          {method.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={handleProcessPayment}
                  className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-[var(--primary)] text-sm font-bold text-white shadow-md hover:bg-[var(--primary-hover)] transition-all"
                >
                  Confirmar Cobro
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}