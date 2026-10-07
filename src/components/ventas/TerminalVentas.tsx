"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  ShoppingCart,
  Package,
  Barcode,
  Search,
  Plus,
  Minus,
  Trash2,
  UserRound,
  UserPlus,
  UserCheck,
  Award,
  Percent,
  Banknote,
  CreditCard,
  WalletCards,
  CheckCircle2,
  Printer,
  RotateCcw,
  Maximize2,
  X,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  Coins,
  Store,
  RefreshCw,
} from "lucide-react";
import { apiRequest } from "@/services/api";
import { getOrganizacionId, getUsuarioActual, hasPosPermiso } from "@/services/auth";
import { Cliente, getClientes, createCliente } from "@/services/clientes";
import { useSocket } from "@/hooks/useSocket";

/* =========================================================
   TIPOS DE DATOS DEL TERMINAL
========================================================= */
export type Product = {
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

export type CartItem = Product & {
  quantity: number;
};

type PaymentMethodType = "efectivo" | "tarjeta" | "transferencia";

interface TerminalVentasProps {
  onVentaCompletada?: (venta: any) => void;
  onOpenFullscreen?: () => void;
}

const fallbackProducts: Product[] = [
  {
    id: "fb-1",
    code: "750105530001",
    name: "Coca-Cola Original 600 ml",
    price: 18.5,
    family: "Bebidas",
    unit: "Pieza",
    stock: 24,
    stockMinimo: 5,
    stockIlimitado: false,
  },
  {
    id: "fb-2",
    code: "750105530002",
    name: "Pepsi Cola 600 ml",
    price: 17.0,
    family: "Bebidas",
    unit: "Pieza",
    stock: 18,
    stockMinimo: 5,
    stockIlimitado: false,
  },
  {
    id: "fb-3",
    code: "750047800030",
    name: "Sabritas Original 105 g",
    price: 16.5,
    family: "Botanas",
    unit: "Pieza",
    stock: 12,
    stockMinimo: 6,
    stockIlimitado: false,
  },
  {
    id: "fb-4",
    code: "750105535531",
    name: "Agua Mineral Ciel 1L",
    price: 15.0,
    family: "Bebidas",
    unit: "Pieza",
    stock: 30,
    stockMinimo: 8,
    stockIlimitado: false,
  },
  {
    id: "fb-5",
    code: "750100011122",
    name: "Galletas Chokis 76 g",
    price: 19.0,
    family: "Abarrotes",
    unit: "Pieza",
    stock: 15,
    stockMinimo: 5,
    stockIlimitado: false,
  },
  {
    id: "fb-6",
    code: "SERV-001",
    name: "Servicio de Recarga Telefónica",
    price: 50.0,
    family: "Servicios",
    unit: "Servicio",
    stock: 999,
    stockMinimo: 0,
    stockIlimitado: true,
  },
];

export default function TerminalVentas({
  onVentaCompletada,
  onOpenFullscreen,
}: TerminalVentasProps) {
  const { socket } = useSocket();

  // Estados de Catálogo de Productos
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedFamily, setSelectedFamily] = useState("Todos");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Estados de la Orden / Carrito
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Cliente | null>(null);
  const [clientesList, setClientesList] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Formulario de Cliente Rápido
  const [newCustNombre, setNewCustNombre] = useState("");
  const [newCustTelefono, setNewCustTelefono] = useState("");
  const [newCustRfc, setNewCustRfc] = useState("");
  const [newCustDescuento, setNewCustDescuento] = useState<number>(0);
  const [savingNewCustomer, setSavingNewCustomer] = useState(false);

  // Modal de Cobro & Pagos
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("efectivo");
  const [montoRecibido, setMontoRecibido] = useState<string>("");
  const [referenciaPago, setReferenciaPago] = useState<string>("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [lastSaleResult, setLastSaleResult] = useState<any>(null);

  // Notificaciones y Alertas de Caja
  const [alertMessage, setAlertMessage] = useState<{
    text: string;
    type: "error" | "warning" | "success";
  } | null>(null);

  const showAlert = (
    text: string,
    type: "error" | "warning" | "success" = "warning"
  ) => {
    setAlertMessage({ text, type });
    setTimeout(() => setAlertMessage(null), 4000);
  };

  // Carga de Productos Reales desde el Backend
  const loadProducts = useCallback(async () => {
    const usuario = getUsuarioActual();
    const orgId = getOrganizacionId() || usuario?.organizacionId;
    if (!orgId) return;

    setLoadingProducts(true);
    try {
      const data = await apiRequest<any[]>(`/articulos/organizacion/${orgId}`);
      if (Array.isArray(data) && data.length > 0) {
        const mapped: Product[] = data.map((art) => {
          const inv = art.inventarios && art.inventarios.length > 0 ? art.inventarios[0] : null;
          return {
            id: art.id,
            code: art.codigo,
            name: art.nombre,
            price: Number(art.precioVenta) || 0,
            family: art.familia?.nombre || "General",
            unit: art.unidad || "Pieza",
            image: art.imagen,
            stock: art.stock ?? art.totalStock ?? (inv ? inv.stockActual : 0),
            stockMinimo: inv?.stockMinimo ?? 5,
            stockIlimitado: Boolean(art.stockIlimitado),
          };
        });
        setProducts(mapped);
      }
    } catch (err) {
      console.warn("Usando catálogo de respaldo en caja:", err);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Carga de Clientes para el Selector
  const loadClientes = useCallback(async () => {
    const usuario = getUsuarioActual();
    const orgId = getOrganizacionId() || usuario?.organizacionId;
    if (!orgId) return;

    setLoadingClientes(true);
    try {
      const data = await getClientes(orgId);
      setClientesList(data);
    } catch (err) {
      console.warn("No se pudieron cargar clientes para POS:", err);
    } finally {
      setLoadingClientes(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadClientes();
  }, [loadProducts, loadClientes]);

  // Sincronización en Tiempo Real vía WebSockets (Socket.IO)
  useEffect(() => {
    if (!socket) return;

    const handleActualizarCatalogo = () => {
      loadProducts();
    };

    const handleStockUpdate = (data: { articuloId: string; nuevoStock: number }) => {
      setProducts((current) =>
        current.map((p) =>
          String(p.id) === String(data.articuloId)
            ? { ...p, stock: data.nuevoStock }
            : p
        )
      );
    };

    const handleClienteUpdate = () => {
      loadClientes();
    };

    socket.on("articulo:creado", handleActualizarCatalogo);
    socket.on("articulo:actualizado", handleActualizarCatalogo);
    socket.on("articulo:eliminado", handleActualizarCatalogo);
    socket.on("catalogo:precargado", handleActualizarCatalogo);
    socket.on("stock:actualizado", handleStockUpdate);

    socket.on("cliente:creado", handleClienteUpdate);
    socket.on("cliente:actualizado", handleClienteUpdate);
    socket.on("cliente:eliminado", handleClienteUpdate);

    return () => {
      socket.off("articulo:creado", handleActualizarCatalogo);
      socket.off("articulo:actualizado", handleActualizarCatalogo);
      socket.off("articulo:eliminado", handleActualizarCatalogo);
      socket.off("catalogo:precargado", handleActualizarCatalogo);
      socket.off("stock:actualizado", handleStockUpdate);

      socket.off("cliente:creado", handleClienteUpdate);
      socket.off("cliente:actualizado", handleClienteUpdate);
      socket.off("cliente:eliminado", handleClienteUpdate);
    };
  }, [socket, loadProducts, loadClientes]);

  // Formato de Moneda
  const money = (val: number) =>
    `$${val.toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Familias Únicas
  const families = useMemo(() => {
    return ["Todos", ...Array.from(new Set(products.map((p) => p.family)))];
  }, [products]);

  // Filtrado de Productos por Búsqueda y Familia
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q);
      const matchFamily =
        selectedFamily === "Todos" || p.family === selectedFamily;
      return matchSearch && matchFamily;
    });
  }, [products, search, selectedFamily]);

  // Agregar Producto al Carrito con Validación de Stock
  const handleAddProduct = (product: Product) => {
    if (!product.stockIlimitado) {
      if (product.stock <= 0) {
        showAlert(
          `⛔ Producto Agotado: No hay existencias de "${product.name}".`,
          "error"
        );
        return;
      }

      const existing = cart.find((item) => item.id === product.id);
      if (existing && existing.quantity >= product.stock) {
        showAlert(
          `⚠️ Máximo disponible: Solo hay ${product.stock} ${product.unit || "piezas"} de "${product.name}".`,
          "warning"
        );
        return;
      }
    }

    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  // Modificar Cantidad
  const handleChangeQuantity = (id: string | number, delta: number) => {
    if (delta > 0) {
      const item = cart.find((i) => i.id === id);
      const prod = products.find((p) => p.id === id);
      if (item && prod && !prod.stockIlimitado) {
        if (item.quantity + delta > prod.stock) {
          showAlert(
            `⚠️ Solo hay ${prod.stock} piezas disponibles de "${prod.name}".`,
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
          const next = item.quantity + delta;
          return next > 0 ? { ...item, quantity: next } : null;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Eliminar Producto
  const handleRemoveItem = (id: string | number) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  // Vaciar Carrito
  const handleClearCart = () => {
    if (cart.length === 0) return;
    setCart([]);
  };

  // Búsqueda por Tecla Enter (Escáner de Código de Barras)
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const q = search.trim().toLowerCase();
      if (!q) return;

      const exact = products.find(
        (p) => p.code.toLowerCase() === q || p.name.toLowerCase() === q
      );

      if (exact) {
        handleAddProduct(exact);
        setSearch("");
      } else if (filteredProducts.length === 1) {
        handleAddProduct(filteredProducts[0]);
        setSearch("");
      }
    }
  };

  /* =========================================================
     CÁLCULO FINANCIERO DE LA VENTA (LA SUMA DE TODO)
  ========================================================= */
  const subtotalBruto = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const puedeAplicarDescuento =
    typeof window !== "undefined" ? hasPosPermiso("aplicarDescuentos") : true;

  const descuentoPorcentaje =
    selectedCustomer && puedeAplicarDescuento
      ? Number(selectedCustomer.descuento || 0)
      : 0;

  const descuentoMonto = useMemo(() => {
    if (descuentoPorcentaje <= 0) return 0;
    return (subtotalBruto * descuentoPorcentaje) / 100;
  }, [subtotalBruto, descuentoPorcentaje]);

  const subtotalNeto = Math.max(0, subtotalBruto - descuentoMonto);
  const impuestoIva = subtotalNeto * 0.16;
  const total = subtotalNeto + impuestoIva;

  const totalArticulos = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const puntosEstimados = Math.floor(total / 10);

  // Cálculos de Cambio en Efectivo
  const parsedRecibido = parseFloat(montoRecibido) || 0;
  const cambioEntregar = Math.max(0, parsedRecibido - total);
  const faltantePagar = Math.max(0, total - parsedRecibido);

  // Abrir Modal de Cobro con valor por defecto
  const handleOpenCobroModal = () => {
    if (cart.length === 0) return;
    setMontoRecibido(total.toFixed(2));
    setReferenciaPago("");
    setIsPaymentModalOpen(true);
  };

  // Crear Cliente Rápido
  const handleCreateCustomerSubmit = async (e: React.FormEvent) => {
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
      setIsQuickAddOpen(false);
      setIsCustomerModalOpen(false);
      setNewCustNombre("");
      setNewCustTelefono("");
      setNewCustRfc("");
      setNewCustDescuento(0);
      showAlert(`Cliente "${nuevo.nombre}" vinculado a la venta.`, "success");
    } catch {
      showAlert("No se pudo registrar el cliente.", "error");
    } finally {
      setSavingNewCustomer(false);
    }
  };

  // Procesar Cobro Real contra la API
  const handleConfirmarCobro = async () => {
    if (cart.length === 0) return;

    if (paymentMethod === "efectivo" && parsedRecibido < total) {
      showAlert(
        `Importe insuficiente. Faltan ${money(faltantePagar)} para cubrir el total.`,
        "error"
      );
      return;
    }

    const usuario = getUsuarioActual();
    const orgId = getOrganizacionId() || usuario?.organizacionId;

    if (!orgId) {
      showAlert("No hay una organización activa vinculada a la sesión.", "error");
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
        impuesto: impuestoIva,
        total,
        metodoPago:
          paymentMethod === "efectivo"
            ? "Efectivo"
            : paymentMethod === "tarjeta"
            ? "Tarjeta"
            : "Transferencia",
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
      if (onVentaCompletada) {
        onVentaCompletada(resultado);
      }
    } catch (err: any) {
      console.error("Error al procesar cobro:", err);
      showAlert(err?.message || "Error al procesar la venta en caja.", "error");
    } finally {
      setProcessingPayment(false);
    }
  };

  // Reiniciar para Nueva Venta
  const handleResetNuevaVenta = () => {
    setCart([]);
    setSelectedCustomer(null);
    setPaymentSuccess(false);
    setLastSaleResult(null);
    setIsPaymentModalOpen(false);
    setMontoRecibido("");
    setReferenciaPago("");
    searchInputRef.current?.focus();
  };

  // Imprimir Ticket Térmico
  const handleImprimirTicket = () => {
    window.print();
  };

  const usuarioSesion = getUsuarioActual();

  return (
    <div className="flex flex-col h-full bg-[#F8F9FA] rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
      {/* ========================================================
          BARRA DE ESTADO / HEADER DE LA TERMINAL DE CAJA
      ======================================================== */}
      <div className="flex-none bg-white border-b border-[#E5E7EB] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white shadow-xs">
            <Store size={20} className="text-[var(--primary)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-black uppercase tracking-wider">
                Caja Registradora / POS
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                En Línea
              </span>
            </div>
            <p className="text-xs text-[#6B7280]">
              Cajero:{" "}
              <span className="font-bold text-black">
                {usuarioSesion?.nombre || "Cajero Principal"}
              </span>{" "}
              {usuarioSesion?.rol && `(${usuarioSesion.rol})`}
            </p>
          </div>
        </div>

        {/* Acciones Rápidas de Terminal */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadProducts}
            disabled={loadingProducts}
            title="Recargar catálogo de artículos"
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[#E5E7EB] bg-white text-xs font-semibold text-[#4B5563] hover:text-black hover:border-black transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw
              size={13}
              className={loadingProducts ? "animate-spin text-[var(--primary)]" : ""}
            />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          {onOpenFullscreen && (
            <button
              type="button"
              onClick={onOpenFullscreen}
              title="Abrir terminal en pantalla completa"
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-black text-white text-xs font-bold hover:bg-[var(--primary)] hover:text-black transition-all cursor-pointer shadow-2xs"
            >
              <Maximize2 size={13} />
              <span className="hidden sm:inline">Pantalla Completa</span>
            </button>
          )}
        </div>
      </div>

      {/* Alerta Flotante de Caja */}
      {alertMessage && (
        <div
          className={`flex-none px-4 py-2.5 flex items-center justify-between text-xs font-bold border-b transition-all ${
            alertMessage.type === "error"
              ? "bg-rose-50 text-rose-800 border-rose-200"
              : alertMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-amber-50 text-amber-800 border-amber-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {alertMessage.type === "error" ? (
              <ShieldAlert size={16} />
            ) : alertMessage.type === "success" ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            <span>{alertMessage.text}</span>
          </div>
          <button
            onClick={() => setAlertMessage(null)}
            className="hover:opacity-75 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ========================================================
          LAYOUT PRINCIPAL: CATÁLOGO (IZQUIERDA) + CARRITO (DERECHA)
      ======================================================== */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(350px,420px)] overflow-hidden min-h-[580px]">
        {/* ======================================================
            SECCIÓN IZQUIERDA: CATÁLOGO Y BUSCADOR (PRODUCTOS)
        ====================================================== */}
        <div className="flex flex-col min-w-0 border-r border-[#E5E7EB] bg-[#F9FAFB] p-4 lg:p-5 overflow-hidden">
          {/* Barra de Búsqueda y Código de Barras */}
          <div className="flex-none flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Barcode size={18} />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Escanea código de barras o escribe nombre..."
                className="w-full h-11 pl-10 pr-16 bg-white border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black shadow-2xs font-medium"
              />
              <span className="absolute inset-y-0 right-2.5 flex items-center">
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold text-gray-500 bg-gray-100 border border-gray-300 rounded shadow-2xs">
                  ENTER
                </kbd>
              </span>
            </div>

            <button
              type="button"
              onClick={() => searchInputRef.current?.focus()}
              className="flex items-center justify-center h-11 w-11 rounded-xl bg-white border border-[#E5E7EB] text-gray-600 hover:text-black hover:border-black transition-colors shadow-2xs cursor-pointer flex-none"
            >
              <Search size={18} />
            </button>
          </div>

          {/* Filtros de Familias / Categorías */}
          <div className="flex-none mt-3 flex items-center gap-1.5 overflow-x-auto pb-1.5 [&::-webkit-scrollbar]:h-1">
            {families.map((family) => {
              const count =
                family === "Todos"
                  ? products.length
                  : products.filter((p) => p.family === family).length;
              const isSelected = selectedFamily === family;

              return (
                <button
                  key={family}
                  type="button"
                  onClick={() => setSelectedFamily(family)}
                  className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex-none ${
                    isSelected
                      ? "bg-black text-white shadow-xs"
                      : "bg-white border border-[#E5E7EB] text-gray-600 hover:border-black hover:text-black"
                  }`}
                >
                  <span>{family}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Encabezado del Grid */}
          <div className="flex-none flex items-center justify-between mt-3 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Artículos Disponibles ({filteredProducts.length})
            </span>
            <span className="text-[11px] text-gray-400">
              Haz clic sobre el producto para agregarlo
            </span>
          </div>

          {/* Grid de Artículos Táctil */}
          <div className="flex-1 overflow-y-auto pr-1 pb-4">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-6 border-2 border-dashed border-gray-200 rounded-2xl bg-white/50">
                <Package size={36} className="text-gray-300 mb-2" />
                <p className="text-sm font-bold text-gray-700">
                  No se encontraron artículos
                </p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">
                  Intenta buscar con otro término o selecciona otra categoría.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                {filteredProducts.map((prod) => {
                  const isOutOfStock = !prod.stockIlimitado && prod.stock <= 0;
                  const isLowStock =
                    !prod.stockIlimitado &&
                    prod.stock > 0 &&
                    prod.stock <= prod.stockMinimo;

                  return (
                    <button
                      key={prod.id}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => handleAddProduct(prod)}
                      className={`group relative flex flex-col justify-between p-3 rounded-xl border text-left transition-all ${
                        isOutOfStock
                          ? "border-rose-200 bg-rose-50/40 opacity-60 cursor-not-allowed"
                          : "border-[#E5E7EB] bg-white hover:border-[var(--primary)] hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                      }`}
                    >
                      {/* Cabecera de la Tarjeta con Imagen y Badges */}
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <div className="h-12 w-12 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center overflow-hidden border border-[#EEEEEE] flex-none group-hover:scale-105 transition-transform">
                          {prod.image ? (
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="h-full w-full object-contain p-1"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <Package size={20} />
                          )}
                        </div>

                        {/* Badge de Stock */}
                        {prod.stockIlimitado ? (
                          <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200 rounded">
                            ♾️ Ilimitado
                          </span>
                        ) : isOutOfStock ? (
                          <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-rose-100 text-rose-700 border border-rose-300 rounded">
                            AGOTADO
                          </span>
                        ) : isLowStock ? (
                          <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 rounded">
                            ⚠️ {prod.stock} disp.
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-gray-100 text-gray-600 rounded">
                            {prod.stock} disp.
                          </span>
                        )}
                      </div>

                      {/* Datos del Producto */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-[var(--primary-hover)] transition-colors">
                          {prod.name}
                        </h4>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-gray-400">
                          <span className="truncate">{prod.family}</span>
                          <span className="font-mono">{prod.code}</span>
                        </div>
                      </div>

                      {/* Precio */}
                      <div className="mt-2.5 pt-2 border-t border-[#F3F4F6] flex items-center justify-between">
                        <span className="text-[11px] text-gray-500 font-medium">
                          {prod.unit || "Pza"}
                        </span>
                        <span className="text-sm font-black text-black font-mono">
                          {money(prod.price)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================
            SECCIÓN DERECHA: APARTADO DE CARRITO Y PAGAR
        ====================================================== */}
        <div className="flex flex-col h-full bg-white border-l border-[#E5E7EB] min-w-0">
          {/* Header de la Orden */}
          <div className="flex-none p-4 border-b border-[#E5E7EB] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-black" />
              <div>
                <h3 className="text-sm font-black text-black uppercase tracking-wider">
                  Orden Actual
                </h3>
                <span className="text-[11px] text-gray-500 font-medium">
                  {cart.length === 0
                    ? "Sin artículos agregados"
                    : `${totalArticulos} ${
                        totalArticulos === 1 ? "artículo" : "artículos"
                      }`}
                </span>
              </div>
            </div>

            {cart.length > 0 && (
              <button
                type="button"
                onClick={handleClearCart}
                className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
              >
                <Trash2 size={13} />
                Vaciar
              </button>
            )}
          </div>

          {/* WIDGET DE CLIENTE VINCULADO */}
          <div className="flex-none px-4 py-2.5 border-b border-[#E5E7EB] bg-[#F9FAFB]">
            {selectedCustomer ? (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs flex-none shadow-2xs">
                    {selectedCustomer.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-black truncate">
                        {selectedCustomer.nombre}
                      </p>
                      <UserCheck size={13} className="text-emerald-600 flex-none" />
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                        {selectedCustomer.puntos || 0} pts
                      </span>
                      {selectedCustomer.descuento > 0 && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-200">
                          {selectedCustomer.descuento}% desc.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-none">
                  <button
                    type="button"
                    onClick={() => setIsCustomerModalOpen(true)}
                    className="text-[11px] font-bold text-[var(--primary)] hover:underline cursor-pointer"
                  >
                    Cambiar
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCustomer(null)}
                    title="Desvincular cliente"
                    className="text-gray-400 hover:text-rose-600 p-1 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                    <UserRound size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-black block">
                      Público General
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Sin descuentos de cliente
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(true)}
                  className="flex items-center gap-1 text-xs font-bold text-black bg-white border border-[#E5E7EB] hover:border-black px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs"
                >
                  <UserPlus size={12} className="text-[var(--primary)]" />
                  <span>Vincular</span>
                </button>
              </div>
            )}
          </div>

          {/* LISTADO DE ARTÍCULOS EN EL CARRITO */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 [&::-webkit-scrollbar]:w-1.5">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
                <div className="h-14 w-14 rounded-2xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center mb-3 shadow-2xs">
                  <ShoppingCart size={24} />
                </div>
                <h4 className="text-sm font-bold text-gray-800">
                  El carrito está vacío
                </h4>
                <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                  Toca artículos del catálogo o escanea con el lector para agregarlos.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-[#F3F4F6] bg-[#FAFAFA] hover:bg-white hover:border-[#E5E7EB] transition-all shadow-2xs gap-2"
                >
                  {/* Nombre y Precio Unitario */}
                  <div className="flex-1 min-w-0 pr-1">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
                      <span className="font-mono">{money(item.price)}</span>
                      <span>× {item.quantity}</span>
                      {!item.stockIlimitado && item.stock <= item.stockMinimo && (
                        <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1 rounded">
                          (Stock: {item.stock})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Controles de Cantidad */}
                  <div className="flex items-center gap-2 flex-none">
                    <div className="flex items-center h-7 rounded-lg border border-[#E5E7EB] bg-white overflow-hidden shadow-2xs">
                      <button
                        type="button"
                        onClick={() => handleChangeQuantity(item.id, -1)}
                        className="h-full w-6 flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-black font-mono">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleChangeQuantity(item.id, 1)}
                        disabled={
                          !item.stockIlimitado && item.quantity >= item.stock
                        }
                        className={`h-full w-6 flex items-center justify-center transition-colors ${
                          !item.stockIlimitado && item.quantity >= item.stock
                            ? "opacity-30 cursor-not-allowed text-gray-300"
                            : "text-gray-600 hover:text-black hover:bg-gray-100 cursor-pointer"
                        }`}
                      >
                        <Plus size={11} />
                      </button>
                    </div>

                    {/* Subtotal del Artículo */}
                    <span className="min-w-[54px] text-right text-xs font-extrabold text-black font-mono">
                      {money(item.price * item.quantity)}
                    </span>

                    {/* Eliminar Artículo */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-gray-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ====================================================
              SUMA DE TODO (SUBTOTAL, DESCUENTOS, IVA Y PAGAR)
          ==================================================== */}
          <div className="flex-none p-4 border-t border-[#E5E7EB] bg-white space-y-3 shadow-lg">
            <div className="space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between items-center">
                <span>Subtotal ({totalArticulos} arts.)</span>
                <span className="font-semibold text-black font-mono">
                  {money(subtotalBruto)}
                </span>
              </div>

              {/* Descuento por Cliente */}
              {descuentoMonto > 0 && (
                <div className="flex justify-between items-center text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Percent size={11} />
                    Descuento cliente ({descuentoPorcentaje}%)
                  </span>
                  <span className="font-mono">-{money(descuentoMonto)}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span>IVA (16%)</span>
                <span className="font-semibold text-black font-mono">
                  {money(impuestoIva)}
                </span>
              </div>

              {selectedCustomer && (
                <div className="flex justify-between items-center text-[11px] text-amber-800 pt-1 border-t border-dashed border-gray-200">
                  <span className="flex items-center gap-1 font-semibold">
                    <Award size={11} />
                    Puntos a acumular
                  </span>
                  <span className="font-bold">+{puntosEstimados} pts</span>
                </div>
              )}
            </div>

            {/* Total Destacado */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
              <span className="text-sm font-extrabold text-black uppercase tracking-wider">
                Total a Pagar
              </span>
              <span className="text-2xl font-black text-black font-mono tracking-tight">
                {money(total)}
              </span>
            </div>

            {/* BOTÓN PRINCIPAL DE PAGAR */}
            <button
              type="button"
              disabled={cart.length === 0}
              onClick={handleOpenCobroModal}
              className="w-full h-12 rounded-xl bg-black hover:bg-[var(--primary)] text-white hover:text-black font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            >
              <Coins size={18} />
              <span>Pagar {cart.length > 0 ? money(total) : ""}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODAL DE VINCULACIÓN O REGISTRO RÁPIDO DE CLIENTE
      ======================================================== */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <UserRound size={18} className="text-black" />
                <h3 className="text-sm font-bold text-black uppercase tracking-wider">
                  {isQuickAddOpen ? "Nuevo Cliente Exprés" : "Seleccionar Cliente"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCustomerModalOpen(false);
                  setIsQuickAddOpen(false);
                }}
                className="text-gray-400 hover:text-black cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {isQuickAddOpen ? (
              <form onSubmit={handleCreateCustomerSubmit} className="p-5 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    required
                    type="text"
                    value={newCustNombre}
                    onChange={(e) => setNewCustNombre(e.target.value)}
                    placeholder="Ej. Carmen Rodríguez"
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      Teléfono / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={newCustTelefono}
                      onChange={(e) => setNewCustTelefono(e.target.value)}
                      placeholder="222 123 4567"
                      className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      RFC (Opcional)
                    </label>
                    <input
                      type="text"
                      value={newCustRfc}
                      onChange={(e) => setNewCustRfc(e.target.value.toUpperCase())}
                      placeholder="XAXX010101000"
                      className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm uppercase text-black focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    % Descuento Preferencial
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={newCustDescuento}
                    onChange={(e) => setNewCustDescuento(Number(e.target.value))}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm font-bold text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setIsQuickAddOpen(false)}
                    className="h-10 px-4 rounded-lg border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    disabled={savingNewCustomer}
                    className="h-10 px-5 rounded-lg bg-black hover:bg-[var(--primary)] text-white hover:text-black text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {savingNewCustomer ? "Guardando..." : "Guardar y Vincular"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 flex flex-col flex-1 overflow-hidden">
                <div className="flex gap-2 mb-3">
                  <div className="relative flex-1">
                    <Search
                      size={16}
                      className="absolute inset-y-0 left-3 my-auto text-gray-400"
                    />
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder="Buscar por nombre, teléfono o RFC..."
                      className="w-full h-10 pl-9 pr-3 border border-gray-300 rounded-lg text-xs text-black focus:outline-none focus:border-black"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsQuickAddOpen(true)}
                    className="h-10 px-3 bg-black text-white hover:bg-[var(--primary)] hover:text-black rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer flex-none"
                  >
                    <UserPlus size={14} />
                    <span>Nuevo</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 max-h-72 pr-1">
                  {clientesList.filter((c) => {
                    const q = customerSearch.toLowerCase();
                    return (
                      !q ||
                      c.nombre.toLowerCase().includes(q) ||
                      (c.telefono && c.telefono.includes(q)) ||
                      (c.rfc && c.rfc.toLowerCase().includes(q))
                    );
                  }).length === 0 ? (
                    <div className="text-center py-8 text-xs text-gray-500">
                      No se encontraron clientes coincidentes.
                    </div>
                  ) : (
                    clientesList
                      .filter((c) => {
                        const q = customerSearch.toLowerCase();
                        return (
                          !q ||
                          c.nombre.toLowerCase().includes(q) ||
                          (c.telefono && c.telefono.includes(q)) ||
                          (c.rfc && c.rfc.toLowerCase().includes(q))
                        );
                      })
                      .map((c) => {
                        const isSelected = selectedCustomer?.id === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setSelectedCustomer(c);
                              setIsCustomerModalOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? "border-2 border-black bg-gray-50"
                                : "border-gray-200 bg-white hover:border-black"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs flex-none">
                                {c.nombre.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-black truncate">
                                  {c.nombre}
                                </p>
                                <p className="text-[10px] text-gray-500 truncate">
                                  {c.telefono || c.rfc || "Sin teléfono"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-none">
                              {c.descuento > 0 && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  {c.descuento}% desc.
                                </span>
                              )}
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800">
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

      {/* ========================================================
          MODAL DE PAGAR & TICKETS (EFECTIVO, TARJETA, TRANSFERENCIA)
      ======================================================== */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
            {/* Cabecera */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <Coins size={18} className="text-black" />
                <h3 className="text-sm font-black text-black uppercase tracking-wider">
                  {paymentSuccess ? "Comprobante de Venta" : "Pagar Orden"}
                </h3>
              </div>
              {!processingPayment && (
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="text-gray-400 hover:text-black cursor-pointer"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* PANTALLA DE ÉXITO CON TICKET */}
            {paymentSuccess ? (
              <div className="p-6 flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                  <CheckCircle2 size={36} className="animate-bounce" />
                </div>
                <h4 className="text-xl font-black text-black">
                  ¡Cobro Exitoso!
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  La venta ha sido registrada en el sistema y el inventario actualizado.
                </p>

                {/* Recibo Resumido */}
                <div className="w-full mt-4 p-4 rounded-xl border border-gray-200 bg-gray-50 text-left space-y-2 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-gray-500">Folio Oficial:</span>
                    <span className="font-mono font-bold text-black text-sm">
                      {lastSaleResult?.folio || "T-000000"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Total Venta:</span>
                    <span className="font-mono font-black text-black text-base">
                      {money(total)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Método de Pago:</span>
                    <span className="font-bold text-black uppercase">
                      {paymentMethod}
                    </span>
                  </div>

                  {paymentMethod === "efectivo" && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Efectivo Recibido:</span>
                        <span className="font-mono font-bold text-black">
                          {money(parsedRecibido)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-emerald-700 font-bold">
                        <span>Cambio Entregado:</span>
                        <span className="font-mono text-sm">
                          {money(cambioEntregar)}
                        </span>
                      </div>
                    </>
                  )}

                  {selectedCustomer && (
                    <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-amber-800 font-bold">
                      <span>Cliente ({selectedCustomer.nombre}):</span>
                      <span>+{puntosEstimados} pts sumados</span>
                    </div>
                  )}
                </div>

                {/* Acciones de Cierre */}
                <div className="w-full mt-5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleImprimirTicket}
                    className="h-11 rounded-xl border border-black bg-white text-black hover:bg-gray-100 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer size={15} />
                    <span>Imprimir Ticket</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetNuevaVenta}
                    className="h-11 rounded-xl bg-black hover:bg-[var(--primary)] text-white hover:text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw size={15} />
                    <span>Nueva Venta</span>
                  </button>
                </div>
              </div>
            ) : (
              /* FORMULARIO DE PAGO */
              <div className="p-6 space-y-4">
                {/* Total a Pagar */}
                <div className="text-center p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                    Total a Pagar
                  </span>
                  <div className="text-3xl font-black text-black font-mono mt-1">
                    {money(total)}
                  </div>
                  {descuentoMonto > 0 && (
                    <p className="text-xs font-semibold text-emerald-700 mt-1">
                      Descuento aplicado: -{money(descuentoMonto)} ({descuentoPorcentaje}%)
                    </p>
                  )}
                </div>

                {/* Selección de Método de Pago */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-2">
                    Selecciona Método de Pago
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: "efectivo", label: "Efectivo", icon: Banknote },
                      { id: "tarjeta", label: "Tarjeta", icon: CreditCard },
                      { id: "transferencia", label: "Transferencia", icon: WalletCards },
                    ].map((m) => {
                      const Icon = m.icon;
                      const active = paymentMethod === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentMethod(m.id as PaymentMethodType)}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            active
                              ? "border-2 border-black bg-black text-white shadow-xs"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          <Icon size={20} className="mb-1" />
                          <span>{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* DETALLE SEGÚN MÉTODO DE PAGO */}
                {paymentMethod === "efectivo" && (
                  <div className="space-y-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                        Monto Recibido ($)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={montoRecibido}
                        onChange={(e) => setMontoRecibido(e.target.value)}
                        placeholder="0.00"
                        className="w-full h-11 px-3 border border-gray-300 rounded-lg text-lg font-black font-mono text-black focus:outline-none focus:border-black bg-white"
                      />
                    </div>

                    {/* Botones de Billetes Rápidos */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { label: "Exacto", val: total },
                        { label: "$50", val: 50 },
                        { label: "$100", val: 100 },
                        { label: "$200", val: 200 },
                        { label: "$500", val: 500 },
                        { label: "$1,000", val: 1000 },
                      ].map((b) => (
                        <button
                          key={b.label}
                          type="button"
                          onClick={() => setMontoRecibido(b.val.toFixed(2))}
                          className="px-2.5 py-1 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-800 hover:border-black transition-colors cursor-pointer shadow-2xs font-mono"
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>

                    {/* Indicador de Cambio o Faltante */}
                    <div className="pt-2 border-t border-gray-200">
                      {parsedRecibido < total ? (
                        <div className="flex justify-between items-center text-xs font-bold text-rose-700">
                          <span>Faltante por cubrir:</span>
                          <span className="font-mono text-sm">
                            {money(faltantePagar)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center text-xs font-extrabold text-emerald-800 bg-emerald-100 p-2 rounded-lg">
                          <span>Cambio a devolver:</span>
                          <span className="font-mono text-base">
                            {money(cambioEntregar)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {paymentMethod === "tarjeta" && (
                  <div className="space-y-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                        Referencia o Autorización de Terminal (Opcional)
                      </label>
                      <input
                        type="text"
                        value={referenciaPago}
                        onChange={(e) => setReferenciaPago(e.target.value)}
                        placeholder="Ej. AUT-884192 / Últimos 4 dígitos"
                        className="w-full h-10 px-3 border border-gray-300 rounded-lg text-xs font-medium text-black focus:outline-none focus:border-black bg-white"
                      />
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Cobra el importe de{" "}
                      <strong className="text-black font-mono">{money(total)}</strong>{" "}
                      en tu terminal bancaria física antes de confirmar.
                    </p>
                  </div>
                )}

                {paymentMethod === "transferencia" && (
                  <div className="space-y-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                        Clave de Rastreo o Comprobante SPEI
                      </label>
                      <input
                        type="text"
                        value={referenciaPago}
                        onChange={(e) => setReferenciaPago(e.target.value)}
                        placeholder="Ej. SPEI-99238491823"
                        className="w-full h-10 px-3 border border-gray-300 rounded-lg text-xs font-medium text-black focus:outline-none focus:border-black bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* Botón de Confirmación */}
                <button
                  type="button"
                  disabled={
                    processingPayment ||
                    (paymentMethod === "efectivo" && parsedRecibido < total)
                  }
                  onClick={handleConfirmarCobro}
                  className="w-full h-12 rounded-xl bg-black hover:bg-[var(--primary)] text-white hover:text-black font-extrabold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                >
                  {processingPayment ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Registrando Venta...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Confirmar Cobro ({money(total)})</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
