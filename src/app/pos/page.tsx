"use client";

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

const openFoodFactsQueries = [
  "soft drink",
  "chips",
  "milk",
  "water",
  "coffee",
  "cookies",
  "bread",
  "yogurt",
  "juice",
  "chocolate",
];

const normalizeFamily = (value?: string) => {
  if (!value) return "General";

  return value
    .split(",")
    .map((item) => item.trim())
    .find(Boolean) || "General";
};

const getProductPrice = (index: number, name: string) => {
  const base = name.length % 7;
  const price = 14 + ((index + base) % 8) * 4 + (index % 3);
  return price;
};

const mapOpenFoodFactProduct = (item: any, index: number): Product | null => {
  const name =
    item.product_name ||
    item.product_name_es ||
    item.generic_name ||
    item.brands ||
    "Producto";

  const code = item.code || `OFF-${String(index + 1).padStart(6, "0")}`;
  const family = normalizeFamily(
    item.categories || item.categories_hierarchy?.[0] || item.category
  );

  return {
    id: Number(item._id || index + 1),
    code,
    name,
    price: getProductPrice(index, name),
    family,
    image: item.image_front_url || undefined,
  };
};

const fetchOpenFoodFactsProducts = async (): Promise<Product[]> => {
  try {
    const responses = await Promise.all(
      openFoodFactsQueries.map(async (query) => {
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
          query
        )}&search_simple=1&action=process&json=1&page_size=4&fields=product_name,product_name_es,code,categories,categories_hierarchy,category,brands,image_front_url`;

        const response = await fetch(url, { cache: "no-store" });

        if (!response.ok) {
          return [];
        }

        const data = await response.json();
        return Array.isArray(data.products) ? data.products : [];
      })
    );

    const mapped = responses
      .flat()
      .map((product, index) => mapOpenFoodFactProduct(product, index))
      .filter((product): product is Product => Boolean(product));

    if (mapped.length > 0) {
      return mapped.slice(0, 20);
    }

    return fallbackProducts;
  } catch {
    return fallbackProducts;
  }
};

export default function PosPage() {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedFamily, setSelectedFamily] = useState("Todos");
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    searchRef.current?.focus();

    let isMounted = true;

    const loadProducts = async () => {
      const fetchedProducts = await fetchOpenFoodFactsProducts();

      if (isMounted) {
        setProducts(fetchedProducts);
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

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

    setSearch("");
    searchRef.current?.focus();
  };

  const changeQuantity = (id: number, amount: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity + amount,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeProduct = (id: number) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const handleBarcode = (value: string) => {
    const product = products.find((item) => item.code === value.trim());

    if (!product) return;

    addProduct(product);
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
      return;
    }

    handleBarcode(value);
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
      selectedFamily === "Todos" ||
      product.family === selectedFamily;

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

  return (
    <main className="min-h-screen bg-[#F4F4F4] text-black">
      {/* ============================================
          HEADER POS
      ============================================ */}

      <header className="flex h-[78px] items-center border-b border-[#262626] bg-[#050505] px-7 text-white">
        <div className="flex min-w-[250px] items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border border-[#D8A814] font-bold text-[#D8A814]">
            C
          </div>

          <div>
            <p className="text-lg font-bold tracking-[0.12em]">
              POS
            </p>

            <p className="text-[10px] uppercase tracking-[0.18em] text-[#777777]">
              Terminal de venta
            </p>
          </div>
        </div>

        <div className="mx-auto flex items-center gap-8">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#777777]">
              Sucursal
            </p>

            <p className="mt-1 text-sm font-semibold">
              Centro
            </p>
          </div>

          <div className="h-8 w-px bg-[#262626]" />

          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#777777]">
              Terminal
            </p>

            <p className="mt-1 text-sm font-semibold text-[#D8A814]">
              Caja 02
            </p>
          </div>

          <div className="h-8 w-px bg-[#262626]" />

          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#777777]">
              Estado
            </p>

            <div className="mt-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#D8A814]" />

              <p className="text-sm font-semibold">
                Caja abierta
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex min-w-[250px] items-center justify-end">
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileMenuOpen((current) => !current)}
              className="flex items-center gap-3 text-left"
            >
              <div>
                <p className="text-right text-sm font-bold">
                  Adán Morales
                </p>

                <p className="mt-1 text-right text-xs text-[#D8A814]">
                  Cajero
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D8A814] font-bold">
                A
              </div>

              <ChevronDown
                size={15}
                className={profileMenuOpen ? "rotate-180 text-[#D8A814]" : "text-white"}
              />
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 top-full z-20 mt-3 w-52 border border-[#E5E5E5] bg-white shadow-lg">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-black hover:bg-[#F5F5F5]"
                >
                  <span>Perfil</span>
                  <span className="text-[#777777]">›</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    router.push("/login");
                  }}
                  className="flex w-full items-center justify-between border-t border-[#E5E5E5] px-4 py-3 text-left text-sm font-semibold text-[#D8A814] hover:bg-[#F5F5F5]"
                >
                  <span>Cerrar sesión</span>
                  <span className="text-[#777777]">›</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ============================================
          MENU POS
      ============================================ */}

      <div className="flex h-[58px] items-center border-b border-[#DDDDDD] bg-white px-7">
        <nav className="flex h-full items-center">
          <button className="flex h-full items-center gap-2 border-b-2 border-[#D8A814] px-5 text-sm font-bold text-[#D8A814]">
            <ShoppingCart size={17} />
            Venta
          </button>

          <button className="flex h-full items-center gap-2 border-b-2 border-transparent px-5 text-sm font-semibold text-[#777777] hover:text-black">
            <WalletCards size={17} />
            Caja
          </button>

          <button className="flex h-full items-center gap-2 border-b-2 border-transparent px-5 text-sm font-semibold text-[#777777] hover:text-black">
            <ReceiptText size={17} />
            Tickets
          </button>

          <button className="flex h-full items-center gap-2 border-b-2 border-transparent px-5 text-sm font-semibold text-[#777777] hover:text-black">
            <UserRound size={17} />
            Clientes
          </button>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="border-r border-[#DDDDDD] pr-5 text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#999999]">
              Venta
            </p>

            <p className="text-sm font-bold">
              #000129
            </p>
          </div>

          <button className="h-9 border border-[#D8A814] px-4 text-xs font-bold text-[#D8A814] hover:bg-[#D8A814] hover:text-white">
            Nueva venta
          </button>
        </div>
      </div>

      {/* ============================================
          CONTENIDO
      ============================================ */}

      <div className="grid min-h-[calc(100vh-136px)] grid-cols-[minmax(0,1fr)_430px]">
        {/* ========================================
            PRODUCTOS
        ======================================== */}

        <section className="min-w-0 border-r border-[#DDDDDD] p-7">
          {/* búsqueda */}
          <div className="flex gap-3">
            <div className="flex h-14 flex-1 items-center border-2 border-[#D8A814] bg-white px-5">
              <Barcode
                size={23}
                className="mr-4 flex-none text-[#D8A814]"
              />

              <input
                ref={searchRef}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Escanea código de barras o busca un producto..."
                className="h-full min-w-0 flex-1 bg-transparent text-base text-black outline-none"
              />

              <span className="ml-4 whitespace-nowrap text-xs font-semibold text-[#999999]">
                ENTER
              </span>
            </div>

            <button className="flex h-14 w-14 items-center justify-center border border-[#D8A814] bg-white text-[#D8A814] hover:bg-[#D8A814] hover:text-white">
              <Search size={21} />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-[#888888]">
            <Barcode size={14} />

            <p>
              El lector de código de barras puede escribir directamente en este
              campo.
            </p>
          </div>

          {/* familias */}
          <div className="mt-7 flex gap-2 overflow-x-auto pb-2">
            {families.map((family) => (
              <button
                key={family}
                onClick={() => setSelectedFamily(family)}
                className={`
                  h-10 whitespace-nowrap px-5
                  text-sm font-semibold
                  ${
                    selectedFamily === family
                      ? "bg-[#050505] text-white"
                      : "border border-[#DDDDDD] bg-white text-[#666666] hover:border-black hover:text-black"
                  }
                `}
              >
                {family}
              </button>
            ))}
          </div>

          {/* titulo */}
          <div className="mb-5 mt-8 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                Catálogo
              </p>

              <h1 className="mt-1 text-2xl font-bold">
                Productos
              </h1>
            </div>

            <p className="text-sm text-[#888888]">
              {filteredProducts.length} resultados
            </p>
          </div>

          {/* productos */}
          <div className="grid grid-cols-2 gap-3 2xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addProduct(product)}
                className="group min-h-[145px] border border-[#DDDDDD] bg-white p-5 text-left transition-colors hover:border-[#D8A814]"
              >
                <div className="flex items-start justify-between">
{product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-10 w-10 object-contain"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center bg-[#F2F2F2] text-[#777777] group-hover:bg-[#D8A814] group-hover:text-white">
                        <Package size={19} />
                      </div>
                    )}

                  <Plus
                    size={19}
                    className="text-[#BBBBBB] group-hover:text-[#D8A814]"
                  />
                </div>

                <p className="mt-5 line-clamp-2 font-bold text-black">
                  {product.name}
                </p>

                <div className="mt-3 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs text-[#999999]">
                      {product.code}
                    </p>

                    <p className="mt-1 text-xs text-[#777777]">
                      {product.family}
                    </p>
                  </div>

                  <p className="text-xl font-bold text-[#D8A814]">
                    {money(product.price)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ========================================
            CARRITO
        ======================================== */}

        <aside className="flex min-w-0 flex-col bg-white">
          {/* cliente */}
          <div className="border-b border-[#E5E5E5] p-5">
            <button className="flex w-full items-center gap-4 border border-[#E0E0E0] p-4 text-left hover:border-[#D8A814]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#050505] text-white">
                <CircleUserRound size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wider text-[#999999]">
                  Cliente
                </p>

                <p className="mt-1 truncate font-bold text-black">
                  Público general
                </p>
              </div>

              <p className="text-xs font-bold text-[#D8A814]">
                Cambiar
              </p>
            </button>
          </div>

          {/* header venta */}
          <div className="flex items-center justify-between border-b border-[#EEEEEE] px-6 py-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                Venta actual
              </p>

              <h2 className="mt-1 text-xl font-bold">
                {itemCount} artículos
              </h2>
            </div>

            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="flex h-9 items-center gap-2 px-3 text-xs font-bold text-[#777777] hover:text-black"
              >
                <Trash2 size={15} />
                Vaciar
              </button>
            )}
          </div>

          {/* items */}
          <div
            className="
              flex-1 overflow-y-auto
              [&::-webkit-scrollbar]:w-1
              [&::-webkit-scrollbar-thumb]:bg-[#D8A814]
              [&::-webkit-scrollbar-track]:bg-[#F2F2F2]
            "
          >
            {cart.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center px-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center border border-[#DDDDDD] text-[#BBBBBB]">
                  <ShoppingCart size={27} />
                </div>

                <h3 className="mt-5 font-bold text-black">
                  Venta vacía
                </h3>

                <p className="mt-2 max-w-[250px] text-sm leading-6 text-[#888888]">
                  Escanea un código de barras o selecciona un producto para
                  comenzar.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="border-b border-[#EEEEEE] px-6 py-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-none items-center justify-center bg-[#F2F2F2]">
                      <Package size={17} className="text-[#777777]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-black">
                        {item.name}
                      </p>

                      <p className="mt-1 text-xs text-[#999999]">
                        {item.code}
                      </p>
                    </div>

                    <button
                      onClick={() => removeProduct(item.id)}
                      className="text-[#BBBBBB] hover:text-black"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex h-9 items-center border border-[#DDDDDD]">
                      <button
                        onClick={() => changeQuantity(item.id, -1)}
                        className="flex h-full w-9 items-center justify-center text-[#777777] hover:bg-[#F2F2F2]"
                      >
                        <Minus size={14} />
                      </button>

                      <div className="flex h-full min-w-[38px] items-center justify-center border-x border-[#DDDDDD] text-sm font-bold">
                        {item.quantity}
                      </div>

                      <button
                        onClick={() => changeQuantity(item.id, 1)}
                        className="flex h-full w-9 items-center justify-center text-[#777777] hover:bg-[#F2F2F2]"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-[#999999]">
                        {money(item.price)} c/u
                      </p>

                      <p className="mt-1 text-lg font-bold">
                        {money(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* totales */}
          <div className="border-t border-[#DDDDDD] bg-[#FAFAFA] p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <p className="text-[#777777]">
                  Subtotal
                </p>

                <p className="font-semibold">
                  {money(subtotal)}
                </p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <p className="text-[#777777]">
                  Impuestos
                </p>

                <p className="font-semibold">
                  {money(tax)}
                </p>
              </div>

              <div className="flex items-end justify-between border-t border-[#CCCCCC] pt-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                    Total
                  </p>

                  <p className="mt-1 text-xs text-[#999999]">
                    {itemCount} unidades
                  </p>
                </div>

                <p className="text-3xl font-bold text-black">
                  {money(total)}
                </p>
              </div>
            </div>

            {/* tipos pago */}
            <div className="mt-5 grid grid-cols-3 gap-2">
              <button
                disabled={cart.length === 0}
                className="flex h-12 items-center justify-center gap-2 border border-[#DDDDDD] bg-white text-xs font-bold text-black hover:border-[#D8A814] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Banknote size={17} />
                Efectivo
              </button>

              <button
                disabled={cart.length === 0}
                className="flex h-12 items-center justify-center gap-2 border border-[#DDDDDD] bg-white text-xs font-bold text-black hover:border-[#D8A814] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CreditCard size={17} />
                Tarjeta
              </button>

              <button
                disabled={cart.length === 0}
                className="flex h-12 items-center justify-center gap-2 border border-[#DDDDDD] bg-white text-xs font-bold text-black hover:border-[#D8A814] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <WalletCards size={17} />
                Otro
              </button>
            </div>

            <button
              disabled={cart.length === 0}
              className="
                mt-3 flex h-16 w-full
                items-center justify-between
                bg-[#D8A814] px-6
                text-white
                transition-colors
                hover:bg-black
                disabled:cursor-not-allowed
                disabled:bg-[#CCCCCC]
              "
            >
              <div className="flex items-center gap-3">
                <ShoppingCart size={20} />

                <span className="font-bold">
                  COBRAR
                </span>
              </div>

              <span className="text-xl font-bold">
                {money(total)}
              </span>
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}