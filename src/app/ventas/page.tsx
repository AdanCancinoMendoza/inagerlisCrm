"use client";

import POSHeader from "@/components/pos/POSHeader";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Banknote,
  Barcode,
  CreditCard,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  UserRound,
  WalletCards,
  X,
  CheckCircle2,
  ShieldAlert,
  AlertCircle,
  Percent,
  Award,
  UserCheck,
  UserPlus,
  Receipt,
  ArrowRight,
} from "lucide-react";
import { apiRequest } from "@/services/api";
import { getOrganizacionId, getUsuarioActual, hasPosPermiso } from "@/services/auth";
import { useSocket } from "@/hooks/useSocket";
import { Cliente, getClientes, createCliente } from "@/services/clientes";

type Product = {
  id: string | number;
  code: string;
  name: string;
  price: number;
  family: string;
  unit?: string;
  image?: string | null;
  stock: number;
  stockMinimo: number;
  stockIlimitado: boolean;
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
    stock: 25,
    stockMinimo: 5,
    stockIlimitado: false,
  },
  {
    id: 2,
    code: "750105530002",
    name: "Pepsi 600 ml",
    price: 17,
    family: "Bebidas",
    stock: 15,
    stockMinimo: 5,
    stockIlimitado: false,
  },
  {
    id: 3,
    code: "750047800030",
    name: "Sabritas Original 105 g",
    price: 15,
    family: "Botanas",
    stock: 8,
    stockMinimo: 10,
    stockIlimitado: false,
  },
  {
    id: 4,
    code: "750105535531",
    name: "Agua Ciel 1L",
    price: 14,
    family: "Bebidas",
    stock: 30,
    stockMinimo: 5,
    stockIlimitado: false,
  },
  {
    id: 5,
    code: "ART-005",
    name: "Galletas Emperador",
    price: 17,
    family: "Abarrotes",
    stock: 0,
    stockMinimo: 5,
    stockIlimitado: false,
  },
  {
    id: 6,
    code: "ART-006",
    name: "Servicio Express",
    price: 50,
    family: "Servicios",
    stock: 0,
    stockMinimo: 0,
    stockIlimitado: true,
  },
];

export default function VentasPage() {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const usuario = typeof window !== "undefined" ? getUsuarioActual() : null;
  const orgId = typeof window !== "undefined" ? (getOrganizacionId() || usuario?.organizacionId) : null;
  const room = orgId ? `org_${orgId}` : undefined;
  const { socket } = useSocket(room);

  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<string>("Todos");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  // Estados de cliente vinculado
  const [selectedCustomer, setSelectedCustomer] = useState<Cliente | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [clientesList, setClientesList] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [newCustNombre, setNewCustNombre] = useState("");
  const [newCustTelefono, setNewCustTelefono] = useState("");
  const [newCustRfc, setNewCustRfc] = useState("");
  const [newCustDescuento, setNewCustDescuento] = useState(0);
  const [savingNewCustomer, setSavingNewCustomer] = useState(false);

  // Estados de cobro
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "tarjeta" | "otro">("efectivo");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [lastSaleResult, setLastSaleResult] = useState<any>(null);

  // Alerta flotante de stock / límites en POS
  const [posAlert, setPosAlert] = useState<{ message: string; type: "error" | "warning" | "info" } | null>(null);

  const showPosAlert = (message: string, type: "error" | "warning" | "info" = "warning") => {
    setPosAlert({ message, type });
    setTimeout(() => {
      setPosAlert(null);
    }, 4500);
  };

  const loadOrgProducts = async () => {
    const usuario = getUsuarioActual();
    const orgId = getOrganizacionId() || usuario?.organizacionId || "default";

    setLoadingProducts(true);
    try {
      const remoteArts = await apiRequest<any[]>(`/articulos/organizacion/${orgId}`);
      if (Array.isArray(remoteArts) && remoteArts.length > 0) {
        const mapped: Product[] = remoteArts.map((a) => {
          const inv = a.inventarios && a.inventarios.length > 0 ? a.inventarios[0] : null;
          return {
            id: a.id,
            code: a.codigo,
            name: a.nombre,
            price: Number(a.precioVenta) || 0,
            family: a.familia?.nombre || "General",
            unit: a.unidad || "Pieza",
            image: a.imagen,
            stock: a.stock ?? a.totalStock ?? 0,
            stockMinimo: inv?.stockMinimo ?? 5,
            stockIlimitado: Boolean(a.stockIlimitado),
          };
        });
        setProducts(mapped);
      }
    } catch {
      // Mantiene fallback si hay error de red
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadOrgClientes = useCallback(async () => {
    const usuario = getUsuarioActual();
    const orgId = getOrganizacionId() || usuario?.organizacionId;
    if (!orgId) return;

    setLoadingClientes(true);
    try {
      const data = await getClientes(orgId);
      setClientesList(data);
    } catch (err) {
      console.error("Error al cargar clientes para POS:", err);
    } finally {
      setLoadingClientes(false);
    }
  }, []);

  useEffect(() => {
    loadOrgProducts();
    loadOrgClientes();
  }, [loadOrgClientes]);

  // Sincronización en tiempo real vía Socket.io para el POS
  useEffect(() => {
    if (!socket) return;

    const handleActualizarCatalogo = () => {
      loadOrgProducts();
    };

    const handleActualizarClientes = () => {
      loadOrgClientes();
    };

    const handleStockActualizado = (data: { articuloId: string; nuevoStock: number }) => {
      setProducts((current) =>
        current.map((p) =>
          String(p.id) === String(data.articuloId)
            ? { ...p, stock: data.nuevoStock }
            : p
        )
      );
    };

    socket.on("articulo:creado", handleActualizarCatalogo);
    socket.on("articulo:actualizado", handleActualizarCatalogo);
    socket.on("articulo:eliminado", handleActualizarCatalogo);
    socket.on("catalogo:precargado", handleActualizarCatalogo);
    socket.on("stock:actualizado", handleStockActualizado);

    socket.on("cliente:creado", handleActualizarClientes);
    socket.on("cliente:actualizado", handleActualizarClientes);
    socket.on("cliente:eliminado", handleActualizarClientes);

    return () => {
      socket.off("articulo:creado", handleActualizarCatalogo);
      socket.off("articulo:actualizado", handleActualizarCatalogo);
      socket.off("articulo:eliminado", handleActualizarCatalogo);
      socket.off("catalogo:precargado", handleActualizarCatalogo);
      socket.off("stock:actualizado", handleStockActualizado);

      socket.off("cliente:creado", handleActualizarClientes);
      socket.off("cliente:actualizado", handleActualizarClientes);
      socket.off("cliente:eliminado", handleActualizarClientes);
    };
  }, [socket, loadOrgClientes]);

  const money = (value: number) =>
    `$${value.toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const addProduct = (product: Product) => {
    // Si no es un producto ilimitado, verificar existencias disponibles
    if (!product.stockIlimitado) {
      if (product.stock <= 0) {
        showPosAlert(
          `⛔ Producto Agotado: No hay existencias de "${product.name}". El sistema no permite vender productos sin stock.`,
          "error"
        );
        return;
      }

      const existing = cart.find((item) => item.id === product.id);
      if (existing && existing.quantity >= product.stock) {
        showPosAlert(
          `⚠️ Existencias máximas alcanzadas: Solo hay ${product.stock} ${product.unit || "piezas"} disponibles de "${product.name}".`,
          "warning"
        );
        return;
      }
    }

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

  const changeQuantity = (id: string | number, delta: number) => {
    if (delta > 0) {
      const item = cart.find((i) => i.id === id);
      const prod = products.find((p) => p.id === id);
      if (item && prod && !prod.stockIlimitado) {
        if (item.quantity + delta > prod.stock) {
          showPosAlert(
            `⚠️ Existencias máximas alcanzadas: Solo hay ${prod.stock} ${prod.unit || "piezas"} disponibles de "${prod.name}".`,
            "warning"
          );
          return;
        }
      }
    }

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

  const removeProduct = (id: string | number) => {
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

  // Cálculo de Subtotales, Descuento de Cliente y Totales
  const subtotalBruto = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const puedeAplicarDescuento =
    typeof window !== "undefined" ? hasPosPermiso("aplicarDescuentos") : true;

  const clienteDescuentoPorcentaje =
    selectedCustomer && puedeAplicarDescuento
      ? Number(selectedCustomer.descuento || 0)
      : 0;

  const descuentoMonto =
    clienteDescuentoPorcentaje > 0
      ? (subtotalBruto * clienteDescuentoPorcentaje) / 100
      : 0;

  const subtotalNeto = Math.max(0, subtotalBruto - descuentoMonto);
  const tax = subtotalNeto * 0.16;
  const total = subtotalNeto + tax;

  const itemCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const puntosEstimados = Math.floor(total / 10);

  // Registro de nuevo cliente rápido desde POS
  const handleCreateQuickCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustNombre.trim()) return;

    const usuario = getUsuarioActual();
    const orgId = getOrganizacionId() || usuario?.organizacionId;
    if (!orgId) return;

    setSavingNewCustomer(true);
    try {
      const nuevo = await createCliente({
        organizacionId: orgId,
        nombre: newCustNombre.trim(),
        telefono: newCustTelefono.trim() || undefined,
        rfc: newCustRfc.trim() || undefined,
        descuento: Number(newCustDescuento) || 0,
      });

      setClientesList((prev) => [nuevo, ...prev]);
      setSelectedCustomer(nuevo);
      setIsCustomerModalOpen(false);
      setIsQuickAddOpen(false);
      setNewCustNombre("");
      setNewCustTelefono("");
      setNewCustRfc("");
      setNewCustDescuento(0);
    } catch (err) {
      console.error("Error al registrar cliente rápido:", err);
      alert("No se pudo registrar el cliente.");
    } finally {
      setSavingNewCustomer(false);
    }
  };

  // Procesamiento real de la venta hacia el backend
  const handleProcessPayment = async () => {
    if (cart.length === 0) return;
    const usuario = getUsuarioActual();
    const orgId = getOrganizacionId() || usuario?.organizacionId;

    if (!orgId) {
      alert("No hay una organización activa vinculada a la sesión.");
      return;
    }

    setProcessingPayment(true);
    try {
      const payload = {
        organizacionId: orgId,
        sucursalId: usuario?.sucursalId || null,
        clienteId: selectedCustomer ? selectedCustomer.id : null,
        usuarioId: usuario?.id || null,
        subtotal: subtotalBruto,
        descuento: descuentoMonto,
        impuesto: tax,
        total,
        metodoPago:
          paymentMethod === "efectivo"
            ? "Efectivo"
            : paymentMethod === "tarjeta"
            ? "Tarjeta"
            : "Otro",
        detalles: cart.map((item) => ({
          articuloId: String(item.id),
          cantidad: item.quantity,
          precioUnitario: item.price,
          subtotal: item.price * item.quantity,
          nombre: item.name,
        })),
      };

      const resultado = await apiRequest<any>("/ventas", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setLastSaleResult(resultado);
      setPaymentSuccess(true);
    } catch (err: any) {
      console.error("Error al procesar la venta:", err);
      alert(err?.message || "Ocurrió un error al registrar la venta.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleNuevaVenta = () => {
    setCart([]);
    setPaymentSuccess(false);
    setLastSaleResult(null);
    setIsPaymentModalOpen(false);
    // Conservamos o limpiamos el cliente para la siguiente transacción
    setSelectedCustomer(null);
  };

  const puedeCancelar =
    typeof window !== "undefined" ? hasPosPermiso("cancelarVenta") : true;
  const tieneAcceso =
    typeof window !== "undefined" ? hasPosPermiso("acceso") : true;

  if (!tieneAcceso) {
    return (
      <main className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md border border-[#D8A814] bg-white p-8 shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-xl font-bold text-black">Acceso No Autorizado</h1>
          <p className="mt-2 text-sm text-[#666]">
            Tu perfil de usuario no cuenta con permisos para operar en el Punto de Venta (POS). Contacta a un administrador para habilitar el acceso.
          </p>
          <button
            onClick={() => router.push("/inicio")}
            className="mt-6 inline-flex h-11 items-center justify-center bg-black px-6 text-sm font-bold text-white hover:bg-[#D8A814] transition-colors"
          >
            Volver al CRM
          </button>
        </div>
      </main>
    );
  }

  // Filtrado de clientes en el modal de selección
  const filteredModalClientes = clientesList.filter((c) => {
    const q = customerSearch.toLowerCase();
    return (
      c.nombre.toLowerCase().includes(q) ||
      (c.telefono && c.telefono.includes(q)) ||
      (c.rfc && c.rfc.toLowerCase().includes(q))
    );
  });

  return (
    <main className="min-h-screen bg-[#F7F7F7] text-black">
      {/* HEADER POS */}
      <POSHeader
        activeTab="venta"
        ticketNumber="#000129"
        onNuevaVenta={handleNuevaVenta}
      />

      {/* Alerta Flotante de Stock en POS */}
      {posAlert && (
        <div
          className={`fixed top-4 right-4 z-[9999] flex items-center gap-3 px-5 py-3.5 text-white shadow-2xl animate-in slide-in-from-top-4 duration-200 border-l-4 ${
            posAlert.type === "error"
              ? "bg-[#1A1A1A] border-rose-600 text-white"
              : "bg-[#1A1A1A] border-amber-500 text-white"
          }`}
        >
          {posAlert.type === "error" ? (
            <ShieldAlert size={18} className="text-rose-500 flex-none" />
          ) : (
            <AlertCircle size={18} className="text-amber-400 flex-none" />
          )}
          <span className="text-xs font-bold leading-snug">{posAlert.message}</span>
          <button
            onClick={() => setPosAlert(null)}
            className="ml-2 text-gray-400 hover:text-white cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div className="grid h-[calc(100vh-136px)] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_370px] overflow-hidden">
        {/* SECCIÓN CATÁLOGO DE PRODUCTOS */}
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

          {/* Filtros de Familias */}
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
            <span className="text-xs text-[#6B7280]">Selecciona para agregar a la orden</span>
          </div>

          {/* Grid de Productos Adaptativo */}
          <div className="flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#D1D5DB]">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 pb-4">
              {filteredProducts.map((product) => {
                const isOutOfStock = !product.stockIlimitado && product.stock <= 0;
                const isLowStock = !product.stockIlimitado && product.stock > 0 && product.stock <= product.stockMinimo;

                return (
                  <button
                    key={product.id}
                    onClick={() => addProduct(product)}
                    className={`group relative flex flex-col justify-between rounded-xl border p-3.5 text-left shadow-xs transition-all ${
                      isOutOfStock
                        ? "border-red-200 bg-red-50/20 opacity-75 hover:border-red-400 cursor-not-allowed"
                        : "border-[#E5E7EB] bg-white hover:border-[var(--primary)] hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                    }`}
                  >
                    {/* Header de Tarjeta / Imagen y Badges */}
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary-light)] text-[var(--primary)] group-hover:scale-105 transition-transform overflow-hidden border border-[#EEEEEE]">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-contain p-0.5"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <Package size={18} />
                        )}
                      </div>

                      {product.stockIlimitado ? (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[9px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
                          ♾️ Ilimitado
                        </span>
                      ) : isOutOfStock ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold bg-red-100 text-red-700 border border-red-300">
                          AGOTADO
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                          ⚠️ {product.stock} disp.
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-500 bg-gray-100">
                          {product.stock} disp.
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5">
                      <p className="line-clamp-2 text-xs font-bold text-[#111827] leading-tight">
                        {product.name}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-[10px]">
                        <span className="font-medium text-[#9CA3AF] truncate">
                          {product.family}
                        </span>
                        {isLowStock && (
                          <span className="font-bold text-amber-700 text-[9px]">
                            ¡Stock bajo!
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2.5 border-t border-[#F3F4F6] pt-2 flex items-center justify-between">
                      <span className="text-[10px] text-[#6B7280] font-mono">
                        {product.code}
                      </span>
                      <span className="text-sm font-bold text-[var(--primary)] font-mono">
                        {money(product.price)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECCIÓN ORDEN ACTUAL Y VINCULACIÓN DE CLIENTE */}
        <aside className="flex min-w-0 h-full overflow-hidden flex-col bg-white border-l border-[#E5E7EB]">
          {/* Header de la Orden */}
          <div className="border-b border-[#EEEEEE] px-5 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#111827]">Orden Actual</h2>
              <p className="mt-0.5 text-xs text-[#6B7280]">
                {cart.length === 0
                  ? "Sin artículos agregados"
                  : `${itemCount} ${itemCount === 1 ? "artículo" : "artículos"} en la orden`}
              </p>
            </div>

            {cart.length > 0 && puedeCancelar && (
              <button
                onClick={() => setCart([])}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#EF4444] hover:underline"
              >
                <Trash2 size={14} />
                Vaciar
              </button>
            )}
          </div>

          {/* WIDGET DE CLIENTE VINCULADO A LA VENTA */}
          <div className="border-b border-[#E5E7EB] bg-[#F9FAFB] px-5 py-3 transition-all">
            {selectedCustomer ? (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-black text-xs font-bold text-white shadow-xs">
                    {selectedCustomer.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-xs font-bold text-black">
                        {selectedCustomer.nombre}
                      </p>
                      <UserCheck size={13} className="text-emerald-600 flex-none" />
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-[#B45309] bg-[#FFFBEB] px-1.5 py-0.2 rounded font-bold border border-[#FDE68A]">
                        <Award size={10} />
                        {selectedCustomer.puntos || 0} pts
                      </span>
                      {selectedCustomer.descuento > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded font-bold border border-emerald-200">
                          <Percent size={9} />
                          {selectedCustomer.descuento}% desc.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-none">
                  <button
                    onClick={() => setIsCustomerModalOpen(true)}
                    className="text-[11px] font-bold text-[#D8A814] hover:text-black transition-colors"
                  >
                    Cambiar
                  </button>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    title="Desvincular cliente"
                    className="text-[#999999] hover:text-[#EF4444] p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E5E7EB] text-[#4B5563]">
                    <UserRound size={14} />
                  </div>
                  <div>
                    <span className="font-semibold text-black block text-xs">Público General</span>
                    <span className="text-[10px] text-[#888888]">Sin descuentos ni puntos</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsCustomerModalOpen(true)}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#D8A814] bg-white px-2.5 py-1 text-xs font-bold text-[#D8A814] shadow-2xs hover:bg-[#D8A814] hover:text-white transition-all"
                >
                  <UserPlus size={12} />
                  Vincular cliente
                </button>
              </div>
            )}
          </div>

          {/* Lista de Productos del Carrito */}
          <div className="flex-1 overflow-y-auto px-5 py-3 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#D1D5DB]">
            {cart.length === 0 ? (
              <div className="flex h-full min-h-[220px] flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-light)] text-[var(--primary)] mb-3 shadow-xs">
                  <ShoppingCart size={24} />
                </div>
                <h3 className="text-sm font-bold text-[#111827]">El carrito está vacío</h3>
                <p className="mt-1 max-w-[200px] text-xs leading-relaxed text-[#6B7280]">
                  Toca productos del catálogo para comenzar la venta
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-[#F3F4F6] bg-[#FAFAFA] p-2.5 transition-all hover:bg-white hover:shadow-xs"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="truncate text-xs font-bold text-[#111827]">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-[#6B7280]">
                        <span>{money(item.price)} c/u</span>
                        {!item.stockIlimitado && item.stock <= item.stockMinimo && (
                          <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1 rounded">
                            (Stock: {item.stock})
                          </span>
                        )}
                        {item.stockIlimitado && (
                          <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-1 rounded">
                            (♾️ Ilimitado)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex h-7 items-center rounded-lg border border-[#E5E7EB] bg-white">
                        <button
                          onClick={() => changeQuantity(item.id, -1)}
                          className="flex h-full w-6 items-center justify-center text-[#6B7280] hover:text-black cursor-pointer"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-black font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => changeQuantity(item.id, 1)}
                          disabled={!item.stockIlimitado && item.quantity >= item.stock}
                          title={!item.stockIlimitado && item.quantity >= item.stock ? "Stock máximo alcanzado" : "Añadir unidad"}
                          className={`flex h-full w-6 items-center justify-center transition-colors ${
                            !item.stockIlimitado && item.quantity >= item.stock
                              ? "opacity-30 cursor-not-allowed text-gray-300"
                              : "text-[#6B7280] hover:text-black cursor-pointer"
                          }`}
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      <span className="min-w-[45px] text-right text-xs font-bold text-black font-mono">
                        {money(item.price * item.quantity)}
                      </span>

                      <button
                        onClick={() => removeProduct(item.id)}
                        className="ml-0.5 text-[#9CA3AF] hover:text-[#EF4444] cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TOTALES Y BOTÓN DE COBRAR */}
          <div className="border-t border-[#E5E7EB] bg-white p-5 space-y-3.5">
            {/* Desglose de Pago */}
            <div className="space-y-1.5 text-xs text-[#6B7280]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#111827]">{money(subtotalBruto)}</span>
              </div>

              {/* Descuento por Cliente */}
              {descuentoMonto > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded">
                  <span className="flex items-center gap-1">
                    <Percent size={11} />
                    Descuento cliente ({clienteDescuentoPorcentaje}%)
                  </span>
                  <span>-{money(descuentoMonto)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>IVA (16%)</span>
                <span className="font-semibold text-[#111827]">{money(tax)}</span>
              </div>

              {selectedCustomer && (
                <div className="flex items-center justify-between border-t border-dashed border-[#E5E7EB] pt-1 text-[11px] text-[#B45309]">
                  <span className="flex items-center gap-1 font-semibold">
                    <Award size={11} />
                    Puntos a acumular
                  </span>
                  <span className="font-bold">+{puntosEstimados} pts</span>
                </div>
              )}
            </div>

            {/* Total Destacado */}
            <div className="flex items-center justify-between border-t border-[#F3F4F6] pt-2">
              <span className="text-sm font-bold text-[#111827]">Total Pagar</span>
              <span className="text-2xl font-bold text-[var(--primary)]">
                {money(total)}
              </span>
            </div>

            {/* Botón Principal de Cobro */}
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
              Cobrar {cart.length > 0 ? money(total) : ""}
            </button>
          </div>
        </aside>
      </div>

      {/* MODAL DE SELECCIÓN O REGISTRO RÁPIDO DE CLIENTE */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-[#D8A814]">
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-[#EEEEEE] bg-[#FAFAFA] px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-black">
                  {isQuickAddOpen ? "Registrar Cliente Rápido" : "Vincular Cliente a la Venta"}
                </h3>
                <p className="text-xs text-[#777777]">
                  {isQuickAddOpen
                    ? "Guarda los datos del cliente para otorgar descuentos y puntos"
                    : "Selecciona un cliente para aplicar su descuento preferencial"}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCustomerModalOpen(false);
                  setIsQuickAddOpen(false);
                }}
                className="text-[#999999] hover:text-black"
              >
                <X size={18} />
              </button>
            </div>

            {isQuickAddOpen ? (
              /* FORMULARIO DE REGISTRO RÁPIDO DENTRO DE POS */
              <form onSubmit={handleCreateQuickCustomer} className="p-6 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-black">
                    Nombre Completo *
                  </label>
                  <input
                    required
                    value={newCustNombre}
                    onChange={(e) => setNewCustNombre(e.target.value)}
                    placeholder="Ej. Roberto Sánchez"
                    className="h-10 w-full rounded-lg border border-[#D8A814] px-3 text-sm text-black outline-none focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase text-black">
                      Teléfono
                    </label>
                    <input
                      value={newCustTelefono}
                      onChange={(e) => setNewCustTelefono(e.target.value)}
                      placeholder="222 123 4567"
                      className="h-10 w-full rounded-lg border border-[#E5E7EB] px-3 text-sm text-black outline-none focus:border-[#D8A814]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase text-black">
                      RFC (Opcional)
                    </label>
                    <input
                      value={newCustRfc}
                      onChange={(e) => setNewCustRfc(e.target.value.toUpperCase())}
                      placeholder="XAXX010101000"
                      className="h-10 w-full rounded-lg border border-[#E5E7EB] px-3 text-sm uppercase text-black outline-none focus:border-[#D8A814]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-black">
                    % Descuento Preferencial
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={newCustDescuento}
                      onChange={(e) => setNewCustDescuento(Number(e.target.value))}
                      placeholder="0"
                      className="h-10 w-full rounded-lg border border-[#E5E7EB] px-3 pr-8 text-sm font-bold text-black outline-none focus:border-[#D8A814]"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-gray-500">%</span>
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500">
                    Se aplicará a esta venta y a las futuras compras de este cliente.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#EEEEEE]">
                  <button
                    type="button"
                    onClick={() => setIsQuickAddOpen(false)}
                    className="h-10 rounded-lg border border-[#CCCCCC] px-4 text-xs font-bold text-[#555555] hover:bg-[#F3F4F6]"
                  >
                    Volver a lista
                  </button>
                  <button
                    type="submit"
                    disabled={savingNewCustomer}
                    className="h-10 rounded-lg bg-[#D8A814] px-5 text-xs font-bold text-white hover:bg-black transition-colors disabled:opacity-50"
                  >
                    {savingNewCustomer ? "Guardando..." : "Guardar y Vincular"}
                  </button>
                </div>
              </form>
            ) : (
              /* LISTA DE BÚSQUEDA Y SELECCIÓN DE CLIENTES */
              <div className="flex flex-col flex-1 overflow-hidden p-5">
                <div className="flex gap-2 mb-3">
                  <div className="relative flex-1">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]"
                    />
                    <input
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder="Buscar por nombre, teléfono o RFC..."
                      className="h-10 w-full rounded-lg border border-[#E5E7EB] pl-9 pr-3 text-xs text-black outline-none focus:border-[#D8A814]"
                    />
                  </div>

                  <button
                    onClick={() => setIsQuickAddOpen(true)}
                    className="inline-flex items-center gap-1 rounded-lg bg-black px-3 py-2 text-xs font-bold text-white hover:bg-[#D8A814] transition-colors flex-none"
                  >
                    <Plus size={13} />
                    Nuevo
                  </button>
                </div>

                {/* Opción para Público General (Desvincular) */}
                <button
                  onClick={() => {
                    setSelectedCustomer(null);
                    setIsCustomerModalOpen(false);
                  }}
                  className="mb-2 flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-3 text-left hover:border-black transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E5E7EB] text-xs font-bold text-black">
                      PG
                    </div>
                    <div>
                      <p className="text-xs font-bold text-black">Público General</p>
                      <p className="text-[10px] text-[#888888]">Venta estándar sin beneficios</p>
                    </div>
                  </div>
                  {!selectedCustomer && (
                    <span className="text-xs font-bold text-emerald-600">Actual</span>
                  )}
                </button>

                {/* Lista con Scroll de Clientes */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#D1D5DB] max-h-[340px]">
                  {loadingClientes ? (
                    <div className="flex h-32 items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#D8A814] border-t-transparent" />
                    </div>
                  ) : filteredModalClientes.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#888888]">
                      No se encontraron clientes con "{customerSearch}".
                    </div>
                  ) : (
                    filteredModalClientes.map((c) => {
                      const isSelected = selectedCustomer?.id === c.id;

                      return (
                        <button
                          key={c.id}
                          onClick={() => {
                            setSelectedCustomer(c);
                            setIsCustomerModalOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                            isSelected
                              ? "border-2 border-[#D8A814] bg-[#FFFBEB]"
                              : "border-[#EEEEEE] bg-white hover:border-[#D1D5DB] hover:bg-[#F9FAFB]"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-black font-bold text-white text-xs">
                              {c.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-black">
                                {c.nombre}
                              </p>
                              <p className="text-[10px] text-[#777777] truncate">
                                {c.telefono || c.rfc || "Sin teléfono"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-none pl-2">
                            {c.descuento > 0 && (
                              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                                {c.descuento}% desc.
                              </span>
                            )}
                            <span className="rounded bg-[#FFFBEB] px-1.5 py-0.5 text-[10px] font-bold text-[#B45309] border border-[#FDE68A]">
                              {c.puntos || 0} pts
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE COBRO / PAGO CON FOLIO REAL Y CONFIRMACIÓN */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#EEEEEE]">
            <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-4">
              <h3 className="text-lg font-bold text-black">
                {paymentSuccess ? "Comprobante de Venta" : "Procesar Cobro"}
              </h3>
              {!processingPayment && (
                <button
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="text-[#999999] hover:text-black"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {paymentSuccess ? (
              <div className="my-6 flex flex-col items-center text-center">
                <CheckCircle2 size={54} className="text-emerald-500 animate-bounce" />
                <h4 className="mt-3 text-xl font-bold text-black">¡Venta Registrada Exitosamente!</h4>
                
                {/* Folio y Monto */}
                <div className="mt-4 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-left space-y-2 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-[#E5E5E5]">
                    <span className="text-[#6B7280]">Folio de Ticket:</span>
                    <span className="font-mono text-sm font-bold text-black">
                      {lastSaleResult?.folio || "T-000000"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#6B7280]">Total Cobrado:</span>
                    <span className="text-base font-bold text-[var(--primary)]">
                      {money(total)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#6B7280]">Método de Pago:</span>
                    <span className="font-semibold text-black uppercase">
                      {paymentMethod}
                    </span>
                  </div>

                  {selectedCustomer && (
                    <div className="mt-2 pt-2 border-t border-[#E5E5E5] space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[#6B7280]">Cliente Vinculado:</span>
                        <span className="font-bold text-black truncate max-w-[180px]">
                          {selectedCustomer.nombre}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[#B45309] font-bold">
                        <span>Puntos Acumulados:</span>
                        <span>+{puntosEstimados} pts</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex w-full gap-3">
                  <button
                    onClick={handleNuevaVenta}
                    className="flex-1 rounded-xl bg-black py-3 text-xs font-bold text-white hover:bg-[#D8A814] transition-colors"
                  >
                    Nueva Venta
                  </button>

                  <button
                    onClick={() => router.push("/clientes")}
                    className="flex-1 rounded-xl border border-[#CCCCCC] py-3 text-xs font-bold text-black hover:bg-[#F3F4F6] transition-colors"
                  >
                    Ver en Clientes
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                <div className="rounded-xl bg-[#F9FAFB] p-4 text-center">
                  <p className="text-xs uppercase tracking-wider text-[#6B7280]">Total a cobrar</p>
                  <p className="mt-1 text-3xl font-bold text-[var(--primary)]">{money(total)}</p>
                  {descuentoMonto > 0 && (
                    <p className="mt-1 text-xs text-emerald-600 font-semibold">
                      Descuento aplicado: -{money(descuentoMonto)}
                    </p>
                  )}
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

                {selectedCustomer && (
                  <div className="rounded-lg bg-[#FFFBEB] p-3 text-xs text-[#92400E] border border-[#FDE68A] flex items-center justify-between">
                    <div>
                      <span className="font-bold block">{selectedCustomer.nombre}</span>
                      <span className="text-[11px]">Se registrará esta venta en su historial</span>
                    </div>
                    <span className="font-bold text-[#B45309]">+{puntosEstimados} pts</span>
                  </div>
                )}

                <button
                  onClick={handleProcessPayment}
                  disabled={processingPayment}
                  className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-[var(--primary)] text-sm font-bold text-white shadow-md hover:bg-[var(--primary-hover)] transition-all disabled:opacity-50"
                >
                  {processingPayment ? "Registrando Venta..." : "Confirmar Cobro"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}