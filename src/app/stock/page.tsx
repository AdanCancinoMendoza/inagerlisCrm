"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSidebar } from "@/context/SidebarContext";
import { useTheme } from "@/context/ThemeContext";
import { apiRequest } from "@/services/api";
import { getOrganizacionId, getUsuarioActual } from "@/services/auth";
import { useSocket } from "@/hooks/useSocket";
import {
  Boxes,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Scale,
  Barcode,
  Clock,
  Edit3,
  X,
  Loader2,
  Building2,
  BarChart3,
  PieChart as PieIcon,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  ChevronRight,
  Check,
  DollarSign,
  History,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";

type Sucursal = {
  id: string;
  nombre: string;
  direccion?: string | null;
};

type ArticuloDetalle = {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  precioCompra: number;
  precioVenta: number;
  unidad: string;
  necesitaBascula: boolean;
  activo: boolean;
  imagen?: string | null;
  familia?: { id: string; nombre: string } | null;
  subfamilia?: { id: string; nombre: string } | null;
  stockActual: number;
  stockMinimo: number;
  stockMaximo: number;
  costoVal: number;
  ventaVal: number;
  estado: "AGOTADO" | "BAJO" | "OPTIMO" | "SOBRESTOCK";
  stockIlimitado?: boolean;
  inventarios?: any[];
};

type MovimientoItem = {
  id: string;
  articuloId: string;
  sucursalId: string;
  usuarioId?: string | null;
  tipo: "ENTRADA" | "SALIDA" | "AJUSTE" | "VENTA";
  cantidad: number;
  motivo?: string | null;
  createdAt: string;
  articulo?: { id: string; nombre: string; codigo: string; unidad: string; precioVenta?: number };
  sucursal?: { id: string; nombre: string };
  usuario?: { id: string; nombre: string; email?: string } | null;
};

type InventarioKPIs = {
  totalArticulos: number;
  totalUnidades: number;
  valorTotalCosto: number;
  valorTotalVenta: number;
  gananciaPotencial: number;
  margenPromedio: number;
  articulosAgotados: number;
  articulosStockBajo: number;
  articulosOptimos: number;
  articulosSobrestock: number;
};

type FamiliaStat = {
  nombre: string;
  unidades: number;
  valorCosto: number;
  valorVenta: number;
  articulosCount: number;
};

type EstadoStat = {
  name: string;
  cantidad: number;
  color: string;
};

export default function StockPage() {
  const { collapsed } = useSidebar();
  const { activePalette } = useTheme();
  const { socket, connected: socketConnected } = useSocket();

  // Estados de carga y datos principales
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSucursalId, setSelectedSucursalId] = useState<string>("ALL");
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [articulos, setArticulos] = useState<ArticuloDetalle[]>([]);
  const [kpis, setKpis] = useState<InventarioKPIs>({
    totalArticulos: 0,
    totalUnidades: 0,
    valorTotalCosto: 0,
    valorTotalVenta: 0,
    gananciaPotencial: 0,
    margenPromedio: 0,
    articulosAgotados: 0,
    articulosStockBajo: 0,
    articulosOptimos: 0,
    articulosSobrestock: 0,
  });
  const [porFamilia, setPorFamilia] = useState<FamiliaStat[]>([]);
  const [porEstado, setPorEstado] = useState<EstadoStat[]>([]);
  const [articulosCriticos, setArticulosCriticos] = useState<ArticuloDetalle[]>([]);
  const [topStock, setTopStock] = useState<ArticuloDetalle[]>([]);

  // Pestaña activa
  const [activeTab, setActiveTab] = useState<"tablero" | "existencias" | "kardex">("tablero");

  // Filtros de tabla
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFamilia, setFilterFamilia] = useState("ALL");
  const [filterEstado, setFilterEstado] = useState<"ALL" | "AGOTADO" | "BAJO" | "OPTIMO" | "SOBRESTOCK">("ALL");

  // Historial / Kardex
  const [movimientos, setMovimientos] = useState<MovimientoItem[]>([]);
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);
  const [filtroTipoMovimiento, setFiltroTipoMovimiento] = useState("TODOS");

  // Modales
  const [ajusteModalOpen, setAjusteModalOpen] = useState(false);
  const [selectedArticuloParaAjuste, setSelectedArticuloParaAjuste] = useState<ArticuloDetalle | null>(null);
  const [modalSearchTerm, setModalSearchTerm] = useState("");
  const [modalMostrarBuscador, setModalMostrarBuscador] = useState(false);
  const [tipoOperacion, setTipoOperacion] = useState<"ENTRADA" | "SALIDA" | "AJUSTE">("ENTRADA");
  const [cantidadAjuste, setCantidadAjuste] = useState<number>(1);
  const [motivoAjuste, setMotivoAjuste] = useState("");
  const [guardandoAjuste, setGuardandoAjuste] = useState(false);

  // Modal para Límites (Stock Mínimo y Máximo)
  const [limitesModalOpen, setLimitesModalOpen] = useState(false);
  const [selectedArticuloParaLimites, setSelectedArticuloParaLimites] = useState<ArticuloDetalle | null>(null);
  const [nuevoMinimo, setNuevoMinimo] = useState(5);
  const [nuevoMaximo, setNuevoMaximo] = useState(100);
  const [guardandoLimites, setGuardandoLimites] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Carga de inventario
  const fetchInventario = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setRefreshing(true);

    const usuario = getUsuarioActual();
    const orgId = getOrganizacionId() || usuario?.organizacionId || "default";

    try {
      const sucursalParam = selectedSucursalId !== "ALL" ? `?sucursalId=${selectedSucursalId}` : "";
      const res = await apiRequest<any>(`/articulos/inventario/${orgId}${sucursalParam}`);

      if (res) {
        if (res.kpis) setKpis(res.kpis);
        if (Array.isArray(res.articulos)) setArticulos(res.articulos);
        if (Array.isArray(res.sucursales)) setSucursales(res.sucursales);
        if (Array.isArray(res.porFamilia)) setPorFamilia(res.porFamilia);
        if (Array.isArray(res.porEstado)) setPorEstado(res.porEstado);
        if (Array.isArray(res.articulosCriticos)) setArticulosCriticos(res.articulosCriticos);
        if (Array.isArray(res.topStock)) setTopStock(res.topStock);
      }
    } catch (err) {
      console.error("Error al cargar inventario:", err);
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  // Carga de movimientos (Kardex)
  const fetchMovimientos = async () => {
    setLoadingMovimientos(true);
    const usuario = getUsuarioActual();
    const orgId = getOrganizacionId() || usuario?.organizacionId || "default";

    try {
      const params = new URLSearchParams();
      if (selectedSucursalId !== "ALL") params.append("sucursalId", selectedSucursalId);
      if (filtroTipoMovimiento !== "TODOS") params.append("tipo", filtroTipoMovimiento);
      params.append("limit", "100");

      const res = await apiRequest<MovimientoItem[]>(
        `/articulos/inventario/movimientos/${orgId}?${params.toString()}`
      );
      if (Array.isArray(res)) {
        setMovimientos(res);
      }
    } catch (err) {
      console.error("Error al cargar movimientos:", err);
    } finally {
      setLoadingMovimientos(false);
    }
  };

  useEffect(() => {
    fetchInventario();
  }, [selectedSucursalId]);

  useEffect(() => {
    if (activeTab === "kardex") {
      fetchMovimientos();
    }
  }, [activeTab, selectedSucursalId, filtroTipoMovimiento]);

  // Suscripción Socket.IO en tiempo real
  useEffect(() => {
    if (!socket) return;

    const handleStockUpdate = (data: { articuloId: string; sucursalId: string; nuevoStock: number }) => {
      setArticulos((prev) =>
        prev.map((art) => {
          if (art.id === data.articuloId) {
            const nuevoStock = data.nuevoStock;
            let nuevoEstado: "AGOTADO" | "BAJO" | "OPTIMO" | "SOBRESTOCK" = "OPTIMO";
            if (nuevoStock <= 0) nuevoEstado = "AGOTADO";
            else if (nuevoStock <= art.stockMinimo) nuevoEstado = "BAJO";
            else if (art.stockMaximo > 0 && nuevoStock > art.stockMaximo) nuevoEstado = "SOBRESTOCK";

            return {
              ...art,
              stockActual: nuevoStock,
              costoVal: nuevoStock * art.precioCompra,
              ventaVal: nuevoStock * art.precioVenta,
              estado: nuevoEstado,
            };
          }
          return art;
        })
      );
      // Refrescar analíticas en segundo plano
      fetchInventario(false);
    };

    const handleMovimiento = (mov: MovimientoItem) => {
      setMovimientos((prev) => [mov, ...prev.slice(0, 99)]);
    };

    socket.on("stock:actualizado", handleStockUpdate);
    socket.on("inventario:movimiento", handleMovimiento);

    return () => {
      socket.off("stock:actualizado", handleStockUpdate);
      socket.off("inventario:movimiento", handleMovimiento);
    };
  }, [socket]);

  // Lista filtrada de artículos
  const filteredArticulos = useMemo(() => {
    return articulos.filter((art) => {
      const matchSearch =
        art.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        art.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (art.familia?.nombre && art.familia.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchFamilia =
        filterFamilia === "ALL" || (art.familia && art.familia.id === filterFamilia);

      const matchEstado =
        filterEstado === "ALL" || art.estado === filterEstado;

      return matchSearch && matchFamilia && matchEstado;
    });
  }, [articulos, searchTerm, filterFamilia, filterEstado]);

  // Familias únicas para filtro
  const familiasList = useMemo(() => {
    const map = new Map<string, string>();
    articulos.forEach((a) => {
      if (a.familia) {
        map.set(a.familia.id, a.familia.nombre);
      }
    });
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [articulos]);

  // Filtro de artículos para el modal de ajuste de stock
  const articulosModalFiltrados = useMemo(() => {
    if (!modalSearchTerm.trim()) return articulos;
    const term = modalSearchTerm.toLowerCase().trim();
    return articulos.filter(
      (a) =>
        a.nombre.toLowerCase().includes(term) ||
        a.codigo.toLowerCase().includes(term) ||
        (a.familia?.nombre && a.familia.nombre.toLowerCase().includes(term))
    );
  }, [articulos, modalSearchTerm]);

  // Apertura modal de ajuste
  const handleOpenAjuste = (articulo?: ArticuloDetalle) => {
    if (articulo) {
      setSelectedArticuloParaAjuste(articulo);
      setCantidadAjuste(1);
      setModalMostrarBuscador(false);
    } else if (articulos.length > 0) {
      setSelectedArticuloParaAjuste(articulos[0]);
      setCantidadAjuste(1);
      setModalMostrarBuscador(true);
    } else {
      setSelectedArticuloParaAjuste(null);
      setCantidadAjuste(1);
      setModalMostrarBuscador(true);
    }
    setModalSearchTerm("");
    setTipoOperacion("ENTRADA");
    setMotivoAjuste("Recepción de compra a proveedor");
    setAjusteModalOpen(true);
  };

  // Si se abre el modal y no había artículos cargados, seleccionar el primero al estar listos
  useEffect(() => {
    if (ajusteModalOpen && !selectedArticuloParaAjuste && articulos.length > 0) {
      setSelectedArticuloParaAjuste(articulos[0]);
    }
  }, [ajusteModalOpen, selectedArticuloParaAjuste, articulos]);

  // Cálculo en vivo de existencia proyectada
  const stockProyectado = useMemo(() => {
    if (!selectedArticuloParaAjuste) return 0;
    const actual = selectedArticuloParaAjuste.stockActual;
    const cant = Math.max(0, cantidadAjuste);
    if (tipoOperacion === "ENTRADA") return actual + cant;
    if (tipoOperacion === "SALIDA") return Math.max(0, actual - cant);
    if (tipoOperacion === "AJUSTE") return cant;
    return actual;
  }, [selectedArticuloParaAjuste, tipoOperacion, cantidadAjuste]);

  // Ejecución de Ajuste
  const handleGuardarAjuste = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticuloParaAjuste) return;

    setGuardandoAjuste(true);
    const usuario = getUsuarioActual();
    const orgId = getOrganizacionId() || usuario?.organizacionId || "default";

    try {
      const sucId =
        selectedSucursalId !== "ALL"
          ? selectedSucursalId
          : sucursales.length > 0
          ? sucursales[0].id
          : undefined;

      const res = await apiRequest<any>("/articulos/inventario/ajuste", {
        method: "POST",
        body: JSON.stringify({
          organizacionId: orgId,
          articuloId: selectedArticuloParaAjuste.id,
          sucursalId: sucId,
          tipo: tipoOperacion,
          cantidad: tipoOperacion === "AJUSTE" ? stockProyectado : cantidadAjuste,
          nuevoStock: tipoOperacion === "AJUSTE" ? stockProyectado : undefined,
          motivo: motivoAjuste.trim() || `Operación de ${tipoOperacion}`,
          usuarioId: usuario?.id,
        }),
      });

      if (res && res.exito) {
        showToast(`Stock de "${selectedArticuloParaAjuste.nombre}" actualizado a ${res.nuevoStock} ${selectedArticuloParaAjuste.unidad}`);
        setAjusteModalOpen(false);
        await fetchInventario(false);
        if (activeTab === "kardex") {
          await fetchMovimientos();
        }
      }
    } catch (err: any) {
      alert(err.message || "Error al procesar el ajuste de inventario.");
    } finally {
      setGuardandoAjuste(false);
    }
  };

  // Guardar Límites de Stock
  const handleGuardarLimites = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticuloParaLimites) return;

    setGuardandoLimites(true);
    try {
      const sucId = selectedSucursalId !== "ALL" ? selectedSucursalId : undefined;
      await apiRequest<any>(`/articulos/inventario/limites/${selectedArticuloParaLimites.id}`, {
        method: "PUT",
        body: JSON.stringify({
          sucursalId: sucId,
          stockMinimo: nuevoMinimo,
          stockMaximo: nuevoMaximo,
        }),
      });

      showToast(`Umbrales actualizados (Mín: ${nuevoMinimo}, Máx: ${nuevoMaximo})`);
      setLimitesModalOpen(false);
      await fetchInventario(false);
    } catch (err: any) {
      alert(err.message || "Error al guardar límites de stock.");
    } finally {
      setGuardandoLimites(false);
    }
  };

  const primaryColor = activePalette?.hex || "#D8A814";

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Sidebar />

      <div className={`min-h-screen transition-all duration-300 ${collapsed ? "ml-0 md:ml-[80px]" : "ml-0 md:ml-[250px]"}`}>
        <Header />

        {/* Notificación Toast */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-[10000] flex items-center gap-3 bg-black px-5 py-3.5 text-white shadow-2xl animate-in slide-in-from-top-5 duration-200 border-l-4 border-black">
            <CheckCircle2 size={16} className="text-white flex-none" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        )}

        <div className="p-4 sm:p-6 lg:p-10">
          {/* Encabezado Superior */}
          <div className="mb-6 sm:mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p
                  className="text-xs font-bold uppercase tracking-[0.18em]"
                  style={{ color: primaryColor }}
                >
                  Inventario & Control de Stock
                </p>
                <div
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                    socketConnected
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-gray-100 text-gray-600 border border-gray-300"
                  }`}
                  title={socketConnected ? "Sincronización en vivo activa" : "Conectando..."}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${socketConnected ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
                  <span>{socketConnected ? "EN VIVO" : "OFFLINE"}</span>
                </div>
              </div>

              <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-black">
                Control de Inventario y Stock
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#777777]">
                Monitoreo de existencias en tiempo real, analíticas gráficas, alertas de reabastecimiento y auditoría de movimientos (Kardex).
              </p>
            </div>

            {/* Acciones del Header */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              {/* Filtro de Sucursal */}
              {sucursales.length > 0 && (
                <div className="flex items-center gap-1.5 border border-[#DDDDDD] bg-white px-3 py-2 shadow-2xs">
                  <Building2 size={14} className="text-[#888888]" />
                  <select
                    value={selectedSucursalId}
                    onChange={(e) => setSelectedSucursalId(e.target.value)}
                    className="text-xs font-bold text-black outline-none bg-transparent cursor-pointer"
                  >
                    <option value="ALL">Todas las Sucursales</option>
                    {sucursales.map((suc) => (
                      <option key={suc.id} value={suc.id}>
                        {suc.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Botón Refrescar */}
              <button
                type="button"
                onClick={() => fetchInventario(false)}
                disabled={refreshing}
                title="Actualizar datos"
                className="flex h-11 w-11 items-center justify-center border border-[#DDDDDD] bg-white text-black hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
              >
                <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
              </button>

              {/* Botón Principal: Ajuste de Stock */}
              <button
                type="button"
                onClick={() => handleOpenAjuste()}
                className="flex h-11 items-center justify-center gap-2 bg-black px-5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-[var(--primary)] cursor-pointer"
              >
                <Plus size={15} />
                <span>+ Registrar Movimiento</span>
              </button>
            </div>
          </div>

          {/* Navegación por Pestañas */}
          <div className="mb-6 flex border-b border-[#E0E0E0]">
            <button
              type="button"
              onClick={() => setActiveTab("tablero")}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === "tablero"
                  ? "border-black text-black"
                  : "border-transparent text-[#888888] hover:text-black"
              }`}
            >
              <BarChart3 size={16} />
              <span>Tablero & Analíticas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("existencias")}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === "existencias"
                  ? "border-black text-black"
                  : "border-transparent text-[#888888] hover:text-black"
              }`}
            >
              <Boxes size={16} />
              <span>Existencias Detalladas ({articulos.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("kardex")}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === "kardex"
                  ? "border-black text-black"
                  : "border-transparent text-[#888888] hover:text-black"
              }`}
            >
              <History size={16} />
              <span>Kardex / Historial</span>
            </button>
          </div>

          {/* ========================================================
              PESTAÑA 1: TABLERO & ANALÍTICAS GRÁFICAS
          ======================================================== */}
          {activeTab === "tablero" && (
            <div className="space-y-6">
              {/* Tarjetas de Métricas Principales (KPIs) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {/* 1. Unidades Físicas en Bodega */}
                <div className="border border-[#E5E5E5] bg-white p-5 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#888888]">
                      Existencias Totales
                    </p>
                    <div className="flex h-8 w-8 items-center justify-center bg-[#F5F5F5] text-black">
                      <Boxes size={16} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <h2 className="text-3xl font-extrabold text-black font-mono">
                      {kpis.totalUnidades.toLocaleString()}
                    </h2>
                    <p className="mt-1 text-xs text-[#777777]">
                      Unidades físicas en {kpis.totalArticulos} artículos registrados
                    </p>
                  </div>
                </div>

                {/* 2. Valuación a Costo de Compra */}
                <div className="border border-[#E5E5E5] bg-white p-5 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#888888]">
                      Capital Invertido (Costo)
                    </p>
                    <div className="flex h-8 w-8 items-center justify-center bg-[#F5F5F5] text-black">
                      <DollarSign size={16} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <h2 className="text-3xl font-extrabold text-black font-mono">
                      ${kpis.valorTotalCosto.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>
                    <p className="mt-1 text-xs text-[#777777]">
                      Valuación al costo de adquisición
                    </p>
                  </div>
                </div>

                {/* 3. Valor Proyectado en Venta */}
                <div className="border border-[#E5E5E5] bg-white p-5 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#888888]">
                      Valor Comercial (Venta)
                    </p>
                    <div className="flex h-8 w-8 items-center justify-center bg-[#F5F5F5] text-black">
                      <TrendingUp size={16} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <h2 className="text-3xl font-extrabold text-black font-mono">
                      ${kpis.valorTotalVenta.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>
                    <p className="mt-1 text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <span>Margen proyectado: {kpis.margenPromedio.toFixed(1)}%</span>
                    </p>
                  </div>
                </div>

                {/* 4. Resumen de Salud de Stock */}
                <div className="border border-[#E5E5E5] bg-white p-5 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#888888]">
                      Atención Inmediata
                    </p>
                    <div className="flex h-8 w-8 items-center justify-center bg-rose-50 text-rose-700">
                      <AlertTriangle size={16} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-3">
                    <div>
                      <span className="text-2xl font-extrabold text-rose-600 font-mono">
                        {kpis.articulosAgotados}
                      </span>
                      <p className="text-[10px] uppercase font-bold text-[#888888]">Agotados</p>
                    </div>
                    <span className="text-gray-300">/</span>
                    <div>
                      <span className="text-2xl font-extrabold text-amber-600 font-mono">
                        {kpis.articulosStockBajo}
                      </span>
                      <p className="text-[10px] uppercase font-bold text-[#888888]">Stock Bajo</p>
                    </div>
                    <span className="text-gray-300">/</span>
                    <div>
                      <span className="text-2xl font-extrabold text-emerald-600 font-mono">
                        {kpis.articulosOptimos}
                      </span>
                      <p className="text-[10px] uppercase font-bold text-[#888888]">Óptimos</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* GRÁFICAS DE CONTROL */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* GRÁFICA 1: Existencias y Valor por Categoría / Familia */}
                <div className="lg:col-span-2 border border-[#E5E5E5] bg-white p-6 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-bold text-black flex items-center gap-2">
                        <BarChart3 size={18} />
                        <span>Existencias por Familia / Categoría</span>
                      </h3>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#888888]">
                        Top Categorías
                      </span>
                    </div>
                    <p className="text-xs text-[#777777] mb-6">
                      Distribución de unidades físicas almacenadas en cada división de catálogo.
                    </p>

                    <div className="h-[280px] w-full">
                      {porFamilia.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs text-[#888888]">
                          No hay suficientes datos de categorías para graficar.
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={porFamilia.slice(0, 7)}
                            margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                          >
                            <XAxis
                              dataKey="nombre"
                              tick={{ fontSize: 11, fill: "#666666" }}
                              interval={0}
                              angle={-20}
                              textAnchor="end"
                            />
                            <YAxis
                              tick={{ fontSize: 11, fill: "#666666" }}
                              allowDecimals={false}
                            />
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-black text-white p-3 text-xs shadow-xl border border-gray-800">
                                      <p className="font-bold">{data.nombre}</p>
                                      <p className="mt-1 text-gray-300">
                                        Existencias: <span className="font-bold text-white">{data.unidades.toLocaleString()} unid.</span>
                                      </p>
                                      <p className="text-gray-300">
                                        Inversión: <span className="font-bold text-white">${data.valorCosto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                                      </p>
                                      <p className="text-gray-300">
                                        Productos: <span className="font-bold text-white">{data.articulosCount}</span>
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Bar
                              dataKey="unidades"
                              fill={primaryColor}
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Leyenda resumida de Familias */}
                  <div className="mt-4 pt-4 border-t border-[#EEEEEE] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {porFamilia.slice(0, 4).map((f) => (
                      <div key={f.nombre} className="bg-[#FAFAFA] p-2 border border-[#EEEEEE]">
                        <p className="font-bold text-black truncate">{f.nombre}</p>
                        <p className="text-[11px] text-[#777777] font-mono">{f.unidades.toLocaleString()} unidades</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* GRÁFICA 2: Estado de Salud del Inventario (Donut Chart) */}
                <div className="border border-[#E5E5E5] bg-white p-6 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-bold text-black flex items-center gap-2">
                        <PieIcon size={18} />
                        <span>Salud del Stock</span>
                      </h3>
                    </div>
                    <p className="text-xs text-[#777777] mb-4">
                      Estado operativo de todos los artículos catalogados.
                    </p>

                    <div className="h-[220px] w-full relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={porEstado}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="cantidad"
                          >
                            {porEstado.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: any, name: any) => [
                              `${value} artículos`,
                              name,
                            ]}
                            contentStyle={{
                              backgroundColor: "#000",
                              color: "#fff",
                              borderRadius: "0px",
                              fontSize: "12px",
                              border: "none",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Centro del Donut */}
                      <div className="absolute text-center pointer-events-none">
                        <p className="text-xl font-extrabold text-black font-mono">
                          {kpis.totalArticulos}
                        </p>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[#888888]">
                          Total Art.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Desglose / Leyenda personalizada */}
                  <div className="mt-4 pt-4 border-t border-[#EEEEEE] space-y-2">
                    {porEstado.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-xs flex-none"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-semibold text-black">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="font-bold text-black">{item.cantidad}</span>
                          <span className="text-[#888888] text-[10px]">
                            ({kpis.totalArticulos > 0 ? ((item.cantidad / kpis.totalArticulos) * 100).toFixed(0) : 0}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* LISTAS PRIORITARIAS: REABASTECIMIENTO CRÍTICO VS MAYOR INVENTARIO */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Artículos con Reabastecimiento Crítico */}
                <div className="border border-[#E5E5E5] bg-white p-6 shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-base font-bold text-black flex items-center gap-2">
                        <AlertCircle size={18} className="text-rose-600" />
                        <span>Artículos que Requieren Reorden</span>
                      </h3>
                      <p className="text-xs text-[#777777]">
                        Productos agotados o por debajo del stock mínimo recomendado.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterEstado("BAJO");
                        setActiveTab("existencias");
                      }}
                      className="text-xs font-bold uppercase tracking-wider text-black hover:text-[var(--primary)] transition-colors cursor-pointer"
                    >
                      Ver todos →
                    </button>
                  </div>

                  {articulosCriticos.length === 0 ? (
                    <div className="py-8 text-center border border-dashed border-[#DDDDDD] bg-[#FAFAFA]">
                      <CheckCircle2 size={32} className="mx-auto text-emerald-600 mb-2" />
                      <p className="text-xs font-bold text-black">¡Todo el stock en niveles óptimos!</p>
                      <p className="text-[11px] text-[#777777]">No hay productos con existencias por debajo del mínimo.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#EEEEEE]">
                      {articulosCriticos.slice(0, 5).map((art) => (
                        <div key={art.id} className="py-3 flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-black truncate">{art.nombre}</p>
                            <div className="flex items-center gap-2 text-[10px] text-[#888888] mt-0.5">
                              <span>SKU: {art.codigo}</span>
                              <span>•</span>
                              <span>Mínimo: {art.stockMinimo} {art.unidad}</span>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div>
                              <span className={`inline-block px-2 py-0.5 text-xs font-bold font-mono ${
                                art.stockActual <= 0 ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                              }`}>
                                {art.stockActual} {art.unidad}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenAjuste(art)}
                              className="bg-black hover:bg-[var(--primary)] text-white text-[11px] font-bold px-2.5 py-1 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Plus size={11} />
                              <span>Surtir</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Top Artículos con Mayor Existencia / Inversión */}
                <div className="border border-[#E5E5E5] bg-white p-6 shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-base font-bold text-black flex items-center gap-2">
                        <TrendingUp size={18} className="text-emerald-600" />
                        <span>Mayor Existencia en Bodega</span>
                      </h3>
                      <p className="text-xs text-[#777777]">
                        Artículos con mayor volumen físico disponible para la venta.
                      </p>
                    </div>
                  </div>

                  {topStock.length === 0 ? (
                    <div className="py-8 text-center border border-dashed border-[#DDDDDD] bg-[#FAFAFA]">
                      <Boxes size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-xs font-bold text-black">Sin existencias registradas aún</p>
                      <p className="text-[11px] text-[#777777]">Registra una entrada de stock para visualizar el balance.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#EEEEEE]">
                      {topStock.slice(0, 5).map((art) => (
                        <div key={art.id} className="py-3 flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-black truncate">{art.nombre}</p>
                            <div className="flex items-center gap-2 text-[10px] text-[#888888] mt-0.5">
                              <span>SKU: {art.codigo}</span>
                              <span>•</span>
                              <span>Costo total: ${art.costoVal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-extrabold text-black font-mono">
                              {art.stockActual.toLocaleString()} {art.unidad}
                            </span>
                            <p className="text-[10px] font-bold text-emerald-700">
                              ${art.ventaVal.toLocaleString("es-MX", { minimumFractionDigits: 2 })} en venta
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              PESTAÑA 2: EXISTENCIAS DETALLADAS (TABLA)
          ======================================================== */}
          {activeTab === "existencias" && (
            <div className="space-y-4">
              {/* Barra de Filtros y Búsqueda */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-white p-4 border border-[#DDDDDD] shadow-2xs">
                {/* Buscador */}
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999]" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, código de barras o categoría..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-[#EEEEEE] pl-10 pr-4 py-2.5 text-xs text-black outline-none focus:border-black focus:bg-white transition-colors"
                  />
                </div>

                {/* Filtro de Categoría / Familia */}
                {familiasList.length > 0 && (
                  <select
                    value={filterFamilia}
                    onChange={(e) => setFilterFamilia(e.target.value)}
                    className="h-10 border border-[#EEEEEE] bg-[#FAFAFA] px-3 text-xs font-bold text-black outline-none focus:border-black cursor-pointer"
                  >
                    <option value="ALL">Todas las Categorías</option>
                    {familiasList.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nombre}
                      </option>
                    ))}
                  </select>
                )}

                {/* Filtro de Estado de Stock */}
                <select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value as any)}
                  className="h-10 border border-[#EEEEEE] bg-[#FAFAFA] px-3 text-xs font-bold text-black outline-none focus:border-black cursor-pointer"
                >
                  <option value="ALL">Todos los Estados</option>
                  <option value="AGOTADO">Agotados (0)</option>
                  <option value="BAJO">Stock Bajo (&le; Mínimo)</option>
                  <option value="OPTIMO">Stock Óptimo</option>
                  <option value="SOBRESTOCK">Sobrestock (&gt; Máximo)</option>
                </select>

                <div className="text-xs font-bold text-[#777777] hidden lg:block whitespace-nowrap">
                  Mostrando: {filteredArticulos.length} de {articulos.length}
                </div>
              </div>

              {/* TABLA PRINCIPAL DE EXISTENCIAS */}
              <div className="border border-[#DDDDDD] bg-white shadow-2xs overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E0E0E0] bg-[#FAFAFA]">
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[#777777]">Artículo</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[#777777]">Categoría</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[#777777] text-center">Nivel de Stock</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[#777777] text-center">Existencia</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[#777777] text-center">Mín / Máx</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[#777777] text-right">Valuación (Costo)</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[#777777] text-center">Estado</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[#777777] text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEEEEE]">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="py-16 text-center">
                          <Loader2 size={28} className="animate-spin text-black mx-auto mb-2" />
                          <p className="text-xs text-[#777777]">Consultando existencias de inventario...</p>
                        </td>
                      </tr>
                    ) : filteredArticulos.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-16 text-center">
                          <Boxes size={36} className="text-[#CCCCCC] mx-auto mb-2" />
                          <p className="text-sm font-bold text-black">No se encontraron artículos</p>
                          <p className="text-xs text-[#777777] mt-1">Prueba cambiando los filtros de búsqueda o categoría.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredArticulos.map((art) => {
                        const maxReferencia = Math.max(art.stockMaximo || 50, art.stockActual, 1);
                        const porcentajeNivel = Math.min(100, Math.round((art.stockActual / maxReferencia) * 100));

                        return (
                          <tr key={art.id} className="hover:bg-[#FAFAFA] transition-colors">
                            {/* Artículo */}
                            <td className="py-3.5 px-4 max-w-[280px]">
                              <div className="font-bold text-black leading-snug line-clamp-2" title={art.nombre}>
                                {art.nombre}
                              </div>
                              <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#777777] mt-1">
                                <Barcode size={12} />
                                <span>{art.codigo}</span>
                                {art.necesitaBascula && (
                                  <span
                                    className="inline-flex items-center gap-0.5 rounded bg-amber-50 border border-amber-300 px-1 text-[9px] font-bold text-amber-900"
                                    title="Requiere pesaje en báscula"
                                  >
                                    <Scale size={9} />
                                    <span>Báscula</span>
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Categoría */}
                            <td className="py-3.5 px-4 text-[#666666]">
                              <span className="font-medium">{art.familia?.nombre || "Sin Categoría"}</span>
                            </td>

                            {/* Barra de Nivel Visual */}
                            <td className="py-3.5 px-4 w-[140px]">
                              {art.stockIlimitado ? (
                                <div className="text-center font-mono text-[11px] font-extrabold text-purple-700 bg-purple-50 py-1 rounded border border-purple-200">
                                  ♾️ Ilimitado
                                </div>
                              ) : (
                                <>
                                  <div className="w-full bg-[#EEEEEE] h-2 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full transition-all duration-300 ${
                                        art.estado === "AGOTADO"
                                          ? "bg-rose-600"
                                          : art.estado === "BAJO"
                                          ? "bg-amber-500"
                                          : art.estado === "SOBRESTOCK"
                                          ? "bg-indigo-600"
                                          : "bg-emerald-500"
                                      }`}
                                      style={{ width: `${art.stockActual <= 0 ? 0 : Math.max(5, porcentajeNivel)}%` }}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between text-[10px] text-[#888888] mt-1 font-mono">
                                    <span>0</span>
                                    <span>{porcentajeNivel}%</span>
                                    <span>{maxReferencia}</span>
                                  </div>
                                </>
                              )}
                            </td>

                            {/* Existencia Actual */}
                            <td className="py-3.5 px-4 text-center">
                              {art.stockIlimitado ? (
                                <span className="text-xs font-bold text-purple-700">
                                  Sin límite
                                </span>
                              ) : (
                                <>
                                  <span className="text-base font-extrabold text-black font-mono">
                                    {art.stockActual}
                                  </span>
                                  <span className="text-[10px] text-[#888888] ml-1 font-bold">
                                    {art.unidad}
                                  </span>
                                </>
                              )}
                            </td>

                            {/* Mín / Máx con botón de editar */}
                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedArticuloParaLimites(art);
                                  setNuevoMinimo(art.stockMinimo);
                                  setNuevoMaximo(art.stockMaximo);
                                  setLimitesModalOpen(true);
                                }}
                                className="group inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#F5F5F5] hover:bg-black hover:text-white transition-colors cursor-pointer"
                                title="Editar stock mínimo y máximo"
                              >
                                <span className="font-mono text-[11px] font-semibold">
                                  {art.stockMinimo} / {art.stockMaximo}
                                </span>
                                <Edit3 size={11} className="text-[#888888] group-hover:text-white" />
                              </button>
                            </td>

                            {/* Valuación */}
                            <td className="py-3.5 px-4 text-right font-mono">
                              <div className="font-bold text-black">
                                ${art.costoVal.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                              <div className="text-[10px] text-[#888888]">
                                @ ${art.precioCompra.toFixed(2)} / u
                              </div>
                            </td>

                            {/* Estado Badge */}
                            <td className="py-3.5 px-4 text-center">
                              {art.stockIlimitado ? (
                                <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                                  ♾️ ILIMITADO
                                </span>
                              ) : (
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                                    art.estado === "AGOTADO"
                                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                                      : art.estado === "BAJO"
                                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                                      : art.estado === "SOBRESTOCK"
                                      ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  }`}
                                >
                                  {art.estado}
                                </span>
                              )}
                            </td>

                            {/* Acciones */}
                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleOpenAjuste(art)}
                                className="inline-flex items-center gap-1 h-8 bg-black px-3 text-[11px] font-bold uppercase tracking-wider text-white hover:bg-[var(--primary)] transition-colors cursor-pointer shadow-2xs"
                              >
                                <Plus size={12} />
                                <span>Ajustar</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================
              PESTAÑA 3: KARDEX / HISTORIAL DE MOVIMIENTOS
          ======================================================== */}
          {activeTab === "kardex" && (
            <div className="space-y-4">
              {/* Filtros de Kardex */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 border border-[#DDDDDD] shadow-2xs">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={15} className="text-[#888888]" />
                  <span className="text-xs font-bold text-black uppercase">Filtro de Operación:</span>
                  <select
                    value={filtroTipoMovimiento}
                    onChange={(e) => setFiltroTipoMovimiento(e.target.value)}
                    className="border border-[#DDDDDD] bg-[#FAFAFA] px-3 py-1.5 text-xs font-bold text-black outline-none cursor-pointer"
                  >
                    <option value="TODOS">Todos los Movimientos</option>
                    <option value="ENTRADA">Entradas (+)</option>
                    <option value="SALIDA">Salidas (-)</option>
                    <option value="AJUSTE">Ajustes Manuales</option>
                    <option value="VENTA">Ventas de POS</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fetchMovimientos()}
                    disabled={loadingMovimientos}
                    className="inline-flex items-center gap-1 text-xs font-bold text-black hover:text-[var(--primary)] transition-colors cursor-pointer"
                  >
                    <RefreshCw size={13} className={loadingMovimientos ? "animate-spin" : ""} />
                    <span>Recargar historial</span>
                  </button>
                  <span className="text-xs text-[#888888]">Registros recientes: {movimientos.length}</span>
                </div>
              </div>

              {/* Tabla de Movimientos */}
              <div className="border border-[#DDDDDD] bg-white shadow-2xs overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E0E0E0] bg-[#FAFAFA]">
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[#777777]">Fecha y Hora</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[#777777]">Artículo / Producto</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[#777777] text-center">Operación</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[#777777] text-center">Cantidad</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[#777777]">Motivo / Justificación</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[#777777]">Sucursal</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[#777777]">Responsable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEEEEE]">
                    {loadingMovimientos ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center">
                          <Loader2 size={28} className="animate-spin text-black mx-auto mb-2" />
                          <p className="text-xs text-[#777777]">Cargando bitácora de movimientos...</p>
                        </td>
                      </tr>
                    ) : movimientos.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center">
                          <History size={36} className="text-[#CCCCCC] mx-auto mb-2" />
                          <p className="text-sm font-bold text-black">Sin movimientos registrados</p>
                          <p className="text-xs text-[#777777] mt-1">
                            Las entradas, salidas y ventas generarán bitácoras de auditoría en tiempo real.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      movimientos.map((m) => {
                        const dateFormatted = new Date(m.createdAt).toLocaleString("es-MX", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        });

                        return (
                          <tr key={m.id} className="hover:bg-[#FAFAFA] transition-colors">
                            {/* Fecha */}
                            <td className="py-3 px-4 whitespace-nowrap text-[#666666] font-mono text-[11px]">
                              {dateFormatted}
                            </td>

                            {/* Artículo */}
                            <td className="py-3 px-4 max-w-[250px]">
                              <p className="font-bold text-black truncate">{m.articulo?.nombre || "Artículo desconocido"}</p>
                              <p className="font-mono text-[10px] text-[#888888]">SKU: {m.articulo?.codigo}</p>
                            </td>

                            {/* Operación */}
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                                  m.tipo === "ENTRADA"
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                    : m.tipo === "SALIDA"
                                    ? "bg-rose-100 text-rose-800 border border-rose-300"
                                    : m.tipo === "VENTA"
                                    ? "bg-purple-100 text-purple-800 border border-purple-300"
                                    : "bg-blue-100 text-blue-800 border border-blue-300"
                                }`}
                              >
                                {m.tipo}
                              </span>
                            </td>

                            {/* Cantidad */}
                            <td className="py-3 px-4 text-center font-mono font-bold text-sm">
                              <span className={m.tipo === "SALIDA" || m.tipo === "VENTA" ? "text-rose-600" : "text-emerald-700"}>
                                {m.tipo === "SALIDA" || m.tipo === "VENTA" ? `-${m.cantidad}` : `+${m.cantidad}`}
                              </span>
                              <span className="text-[10px] text-[#888888] ml-1 font-normal font-sans">
                                {m.articulo?.unidad || "u"}
                              </span>
                            </td>

                            {/* Motivo */}
                            <td className="py-3 px-4 text-[#555555] max-w-[280px]">
                              <p className="truncate" title={m.motivo || ""}>
                                {m.motivo || "Ajuste de inventario"}
                              </p>
                            </td>

                            {/* Sucursal */}
                            <td className="py-3 px-4 text-[#777777]">
                              {m.sucursal?.nombre || "Matriz"}
                            </td>

                            {/* Responsable */}
                            <td className="py-3 px-4 text-[#777777]">
                              {m.usuario?.nombre || "Sistema / POS"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          MODAL: REGISTRAR MOVIMIENTO / AJUSTE DE STOCK
      ======================================================== */}
      {ajusteModalOpen && (
        <div
          onClick={() => setAjusteModalOpen(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative my-auto flex w-full max-w-lg flex-col border border-[#DDDDDD] bg-white shadow-2xl cursor-default overflow-hidden animate-in zoom-in-95 duration-150"
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-[#EEEEEE] px-6 py-4 bg-[#FAFAFA]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center bg-black text-white font-bold">
                  <Boxes size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-black">Registrar Movimiento de Stock</h3>
                  <p className="text-xs text-[#777777]">
                    Actualización de existencias físicas y auditoría Kardex
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAjusteModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center text-[#777777] hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGuardarAjuste}>
              <div className="p-6 space-y-4">
                {/* Selector de Artículo */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555]">
                      Artículo a Modificar *
                    </label>
                    <span className="text-[10px] text-[#777777] font-semibold">
                      {articulos.length > 0 ? `${articulos.length} productos disponibles` : "Cargando artículos..."}
                    </span>
                  </div>

                  {/* Buscador Rápido de Productos */}
                  <div className="relative mb-2">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" />
                    <input
                      type="text"
                      placeholder="Filtrar por nombre, código SKU o categoría..."
                      value={modalSearchTerm}
                      onChange={(e) => {
                        setModalSearchTerm(e.target.value);
                        setModalMostrarBuscador(true);
                      }}
                      onFocus={() => setModalMostrarBuscador(true)}
                      className="w-full bg-[#FAFAFA] border border-[#DDDDDD] pl-9 pr-8 py-2 text-xs font-semibold text-black outline-none focus:border-black focus:bg-white transition-all"
                    />
                    {modalSearchTerm && (
                      <button
                        type="button"
                        onClick={() => setModalSearchTerm("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-1"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Lista desplegable interactiva */}
                  {modalMostrarBuscador && (
                    <div className="border border-[#DDDDDD] bg-white max-h-48 overflow-y-auto mb-2 shadow-md divide-y divide-[#F0F0F0]">
                      {articulosModalFiltrados.length === 0 ? (
                        <div className="p-3 text-center text-xs text-[#888888]">
                          No se encontraron artículos con &ldquo;{modalSearchTerm}&rdquo;
                        </div>
                      ) : (
                        articulosModalFiltrados.slice(0, 40).map((art) => {
                          const isSelected = selectedArticuloParaAjuste?.id === art.id;
                          return (
                            <button
                              key={art.id}
                              type="button"
                              onClick={() => {
                                setSelectedArticuloParaAjuste(art);
                                setModalMostrarBuscador(false);
                              }}
                              className={`w-full text-left px-3 py-2 flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                                isSelected ? "bg-black text-white" : "hover:bg-[#F8F9FA] text-black"
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold truncate">{art.nombre}</p>
                                <p className={`text-[10px] font-mono ${isSelected ? "text-gray-300" : "text-[#777777]"}`}>
                                  SKU: {art.codigo} · {art.familia?.nombre || "General"}
                                </p>
                              </div>
                              <div className="text-right flex items-center gap-1.5 flex-none">
                                {art.stockIlimitado ? (
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200">
                                    ♾️ Ilimitado
                                  </span>
                                ) : (
                                  <span className={`text-[10px] font-mono font-bold ${
                                    isSelected
                                      ? "text-white"
                                      : art.stockActual <= 0
                                      ? "text-red-600"
                                      : art.stockActual <= art.stockMinimo
                                      ? "text-amber-600"
                                      : "text-emerald-700"
                                  }`}>
                                    {art.stockActual} {art.unidad}
                                  </span>
                                )}
                                {isSelected && <Check size={14} className="text-white" />}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* Dropdown nativo sincronizado */}
                  <select
                    value={selectedArticuloParaAjuste?.id || ""}
                    onChange={(e) => {
                      const found = articulos.find((a) => a.id === e.target.value);
                      if (found) {
                        setSelectedArticuloParaAjuste(found);
                        setModalMostrarBuscador(false);
                      }
                    }}
                    className="w-full border border-[#DDDDDD] bg-white px-3 py-2 text-xs font-semibold text-black outline-none focus:border-black cursor-pointer"
                  >
                    <option value="" disabled>-- Selecciona un artículo existente --</option>
                    {articulos.map((art) => (
                      <option key={art.id} value={art.id}>
                        {art.nombre} (SKU: {art.codigo}) — {art.stockIlimitado ? "♾️ Stock Ilimitado" : `Stock actual: ${art.stockActual} ${art.unidad}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Banner de Existencia Actual y Estado */}
                {selectedArticuloParaAjuste && (
                  <div className="space-y-2">
                    <div className="bg-[#F8F9FA] border border-[#E5E5E5] p-3 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#777777]">Existencia Actual</p>
                        <p className="text-lg font-extrabold text-black font-mono">
                          {selectedArticuloParaAjuste.stockActual} {selectedArticuloParaAjuste.unidad}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-[#777777]">Nuevo Stock Estimado</p>
                        <p className="text-lg font-extrabold font-mono text-[var(--primary)]">
                          {stockProyectado} {selectedArticuloParaAjuste.unidad}
                        </p>
                      </div>
                    </div>

                    {selectedArticuloParaAjuste.stockIlimitado ? (
                      <div className="bg-purple-50 border border-purple-200 p-2.5 flex items-center gap-2 text-purple-900 text-xs">
                        <span className="text-base flex-none">♾️</span>
                        <p className="text-[11px] leading-snug">
                          <strong>Producto con Stock Ilimitado:</strong> En el Punto de Venta se venderá rápidamente sin descontar existencias ni bloquearse por stock en 0.
                        </p>
                      </div>
                    ) : selectedArticuloParaAjuste.stockActual <= 0 ? (
                      <div className="bg-red-50 border border-red-200 p-2.5 flex items-center gap-2 text-red-800 text-xs">
                        <AlertCircle size={16} className="text-red-600 flex-none" />
                        <p className="text-[11px] leading-snug">
                          <strong>Actualmente Agotado:</strong> Este artículo está <strong>bloqueado para venta</strong> en el Punto de Venta hasta que registres una entrada de stock.
                        </p>
                      </div>
                    ) : selectedArticuloParaAjuste.stockActual <= selectedArticuloParaAjuste.stockMinimo ? (
                      <div className="bg-amber-50 border border-amber-200 p-2.5 flex items-center gap-2 text-amber-800 text-xs">
                        <AlertTriangle size={16} className="text-amber-600 flex-none" />
                        <p className="text-[11px] leading-snug">
                          <strong>Stock Bajo:</strong> Quedan {selectedArticuloParaAjuste.stockActual} {selectedArticuloParaAjuste.unidad}. En el Punto de Venta se muestra una alerta preventiva de existencias.
                        </p>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Tipo de Operación: Botones Tipo Toggle */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555] mb-1.5">
                    Tipo de Operación *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTipoOperacion("ENTRADA")}
                      className={`h-11 border text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        tipoOperacion === "ENTRADA"
                          ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                          : "border-[#DDDDDD] bg-white text-black hover:border-black"
                      }`}
                    >
                      <ArrowUpRight size={14} />
                      <span>Entrada (+)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTipoOperacion("SALIDA")}
                      className={`h-11 border text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        tipoOperacion === "SALIDA"
                          ? "border-rose-600 bg-rose-600 text-white shadow-xs"
                          : "border-[#DDDDDD] bg-white text-black hover:border-black"
                      }`}
                    >
                      <ArrowDownRight size={14} />
                      <span>Salida (-)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTipoOperacion("AJUSTE")}
                      className={`h-11 border text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        tipoOperacion === "AJUSTE"
                          ? "border-black bg-black text-white shadow-xs"
                          : "border-[#DDDDDD] bg-white text-black hover:border-black"
                      }`}
                    >
                      <SlidersHorizontal size={14} />
                      <span>Conteo (=)</span>
                    </button>
                  </div>
                </div>

                {/* Cantidad */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555] mb-1">
                    {tipoOperacion === "AJUSTE" ? "Conteo Físico Real (Total en Bodega) *" : "Cantidad a Ingresar / Descontar *"}
                  </label>
                  <input
                    type="number"
                    min={tipoOperacion === "AJUSTE" ? 0 : 1}
                    step={selectedArticuloParaAjuste?.necesitaBascula ? 0.001 : 1}
                    required
                    value={cantidadAjuste}
                    onChange={(e) => setCantidadAjuste(parseFloat(e.target.value) || 0)}
                    className="w-full border border-black bg-white px-3.5 py-2.5 text-base font-extrabold text-black font-mono outline-none"
                  />
                </div>

                {/* Motivo con chips rápidos */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555] mb-1">
                    Motivo / Justificación *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Compra de lote a proveedor, merma por caducidad..."
                    value={motivoAjuste}
                    onChange={(e) => setMotivoAjuste(e.target.value)}
                    className="w-full border border-[#DDDDDD] bg-white px-3.5 py-2.5 text-xs text-black outline-none focus:border-black"
                  />

                  {/* Chips rápidos */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[
                      "Compra a proveedor",
                      "Conteo físico mensual",
                      "Merma / producto dañado",
                      "Devolución de cliente",
                      "Consumo interno",
                    ].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setMotivoAjuste(chip)}
                        className="bg-[#F0F0F0] hover:bg-[#E0E0E0] text-[10px] font-semibold text-black px-2 py-0.5 rounded transition-colors cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-[#EEEEEE] bg-[#FAFAFA] px-6 py-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAjusteModalOpen(false)}
                  className="h-11 border border-[#DDDDDD] bg-white px-5 text-xs font-bold uppercase tracking-wider text-black hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoAjuste}
                  className="h-11 bg-black px-6 text-xs font-bold uppercase tracking-wider text-white hover:bg-[var(--primary)] transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  {guardandoAjuste && <Loader2 size={14} className="animate-spin" />}
                  <span>Guardar y Aplicar Stock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: EDITAR LÍMITES (STOCK MÍNIMO Y MÁXIMO)
      ======================================================== */}
      {limitesModalOpen && selectedArticuloParaLimites && (
        <div
          onClick={() => setLimitesModalOpen(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative my-auto flex w-full max-w-md flex-col border border-[#DDDDDD] bg-white shadow-2xl cursor-default overflow-hidden animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-[#EEEEEE] px-6 py-4 bg-[#FAFAFA]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center bg-black text-white">
                  <SlidersHorizontal size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-black">Umbrales de Inventario</h3>
                  <p className="text-xs text-[#777777] line-clamp-1">
                    {selectedArticuloParaLimites.nombre}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLimitesModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center text-[#777777] hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGuardarLimites}>
              <div className="p-6 space-y-4">
                <div className="bg-[#FAFAFA] p-3 border border-[#E5E5E5] text-xs text-[#666666]">
                  Establece el punto de reorden para disparar alertas amarillas automáticas y el tope de inventario para evitar compras excesivas.
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555] mb-1">
                      Stock Mínimo (Alerta) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={nuevoMinimo}
                      onChange={(e) => setNuevoMinimo(parseInt(e.target.value, 10) || 0)}
                      className="w-full border border-[#DDDDDD] bg-white px-3.5 py-2.5 text-sm font-extrabold text-black font-mono outline-none focus:border-black"
                    />
                    <p className="text-[10px] text-[#888888] mt-1">Dispara alerta de stock bajo.</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555] mb-1">
                      Stock Máximo *
                    </label>
                    <input
                      type="number"
                      min={nuevoMinimo}
                      required
                      value={nuevoMaximo}
                      onChange={(e) => setNuevoMaximo(parseInt(e.target.value, 10) || 0)}
                      className="w-full border border-[#DDDDDD] bg-white px-3.5 py-2.5 text-sm font-extrabold text-black font-mono outline-none focus:border-black"
                    />
                    <p className="text-[10px] text-[#888888] mt-1">Alerta de sobre-inventario.</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#EEEEEE] bg-[#FAFAFA] px-6 py-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setLimitesModalOpen(false)}
                  className="h-11 border border-[#DDDDDD] bg-white px-5 text-xs font-bold uppercase tracking-wider text-black hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoLimites}
                  className="h-11 bg-black px-6 text-xs font-bold uppercase tracking-wider text-white hover:bg-[var(--primary)] transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  {guardandoLimites && <Loader2 size={14} className="animate-spin" />}
                  <span>Guardar Umbrales</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}