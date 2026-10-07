"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSidebar } from "@/context/SidebarContext";
import { useTheme } from "@/context/ThemeContext";
import { apiRequest } from "@/services/api";
import { getOrganizacionId, getUsuarioActual } from "@/services/auth";
import { useSocket } from "@/hooks/useSocket";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import {
  AlertCircle,
  ArrowRight,
  Barcode,
  Check,
  CheckCircle2,
  Edit2,
  FolderTree,
  Globe,
  ImageIcon,
  Info,
  LayoutGrid,
  List,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Scale,
  Search,
  Sparkles,
  Tag,
  Trash2,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";

type Articulo = {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  precioCompra: number;
  precioVenta: number;
  unidad: string;
  necesitaBascula?: boolean;
  stockIlimitado?: boolean;
  imagen?: string | null;
  activo: boolean;
  stock?: number;
  totalStock?: number;
  familia?: { id: string; nombre: string } | null;
  subfamilia?: { id: string; nombre: string } | null;
  createdAt?: string;
};

type UnidadMedidaItem = {
  id: string;
  nombre: string;
  abreviatura: string;
  tipo: string;
  necesitaBascula: boolean;
};

type FamiliaItem = {
  id: string;
  nombre: string;
  descripcion?: string | null;
  subfamilias?: Array<{ id: string; nombre: string }>;
  _count?: { articulos: number };
};

type ImagenResultado = {
  title: string;
  url: string;
  thumb: string;
  source: string;
};

export default function ArticulosPage() {
  const { collapsed } = useSidebar();
  const { activePalette } = useTheme();
  const { socket, connected: socketConnected } = useSocket();

  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [familias, setFamilias] = useState<FamiliaItem[]>([]);
  const [unidadesList, setUnidadesList] = useState<UnidadMedidaItem[]>([]);
  const [organizacionData, setOrganizacionData] = useState<{ nombre?: string; pais?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" } | null>(null);

  // Vistas y Pestañas
  const [activeTab, setActiveTab] = useState<"todos" | "familias">("todos");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFamilia, setSelectedFamilia] = useState("ALL");
  const [selectedEstado, setSelectedEstado] = useState<"ALL" | "ACTIVO" | "INACTIVO">("ALL");

  // Modal de Edición / Creación
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticulo, setEditingArticulo] = useState<Articulo | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    precioCompra: 0,
    precioVenta: 0,
    unidad: "Pieza",
    necesitaBascula: false,
    stockIlimitado: false,
    imagen: "",
    familiaId: "",
    subfamiliaId: "",
    activo: true,
    stockActual: 0,
  });

  // Modal / Buscador de Imágenes de Internet
  const [webSearchOpen, setWebSearchOpen] = useState(false);
  const [imageSearchQuery, setImageSearchQuery] = useState("");
  const [imageResults, setImageResults] = useState<ImagenResultado[]>([]);
  const [searchingImages, setSearchingImages] = useState(false);

  // Modal de Confirmación para Precargar Catálogo Sugerido
  const [preloadModalOpen, setPreloadModalOpen] = useState(false);
  const [preloading, setPreloading] = useState(false);

  // Modal de Eliminación de Artículo
  const [articuloToDelete, setArticuloToDelete] = useState<Articulo | null>(null);
  const [deletingArticulo, setDeletingArticulo] = useState(false);

  // Modal de Creación Rápida de Familia
  const [quickFamiliaModalOpen, setQuickFamiliaModalOpen] = useState(false);
  const [quickFamiliaNombre, setQuickFamiliaNombre] = useState("");
  const [quickFamiliaSubfamilia, setQuickFamiliaSubfamilia] = useState("");
  const [quickFamiliaDescripcion, setQuickFamiliaDescripcion] = useState("");
  const [savingQuickFamilia, setSavingQuickFamilia] = useState(false);

  const showToast = (text: string, type: "success" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchArticulos = async (showLoadingState = true) => {
    if (showLoadingState) setLoading(true);
    setErrorMsg(null);

    const usuario = getUsuarioActual();
    const orgId = getOrganizacionId() || usuario?.organizacionId;

    if (!orgId) {
      setLoading(false);
      return;
    }

    try {
      const [articulosRes, familiasRes, unidadesRes, orgRes] = await Promise.all([
        apiRequest<Articulo[]>(`/articulos/organizacion/${orgId}`),
        apiRequest<FamiliaItem[]>(`/articulos/familias/${orgId}`),
        apiRequest<UnidadMedidaItem[]>(`/articulos/unidades/${orgId}`).catch(() => []),
        apiRequest<any>(`/organizaciones/${orgId}`).catch(() => null),
      ]);

      setArticulos(Array.isArray(articulosRes) ? articulosRes : []);
      setFamilias(Array.isArray(familiasRes) ? familiasRes : []);
      setUnidadesList(Array.isArray(unidadesRes) ? unidadesRes : []);
      if (orgRes) {
        setOrganizacionData(orgRes);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error al cargar los artículos.");
    } finally {
      if (showLoadingState) setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticulos();
  }, []);

  // Socket.io listeners en tiempo real
  useEffect(() => {
    if (!socket) return;

    const handleArticuloCreado = (nuevo: Articulo) => {
      setArticulos((prev) => {
        const existe = prev.some((a) => a.id === nuevo.id);
        if (existe) return prev.map((a) => (a.id === nuevo.id ? { ...a, ...nuevo } : a));
        return [nuevo, ...prev];
      });
      showToast(`Nuevo artículo: ${nuevo.nombre}`, "info");
    };

    const handleArticuloActualizado = (actualizado: Articulo) => {
      setArticulos((prev) =>
        prev.map((a) => (a.id === actualizado.id ? { ...a, ...actualizado } : a))
      );
      showToast(`Artículo actualizado: ${actualizado.nombre}`, "info");
    };

    const handleArticuloEliminado = (data: { id: string }) => {
      setArticulos((prev) => prev.filter((a) => a.id !== data.id));
      showToast("Artículo eliminado del catálogo", "info");
    };

    const handleStockActualizado = (data: { articuloId: string; nuevoStock: number }) => {
      setArticulos((prev) =>
        prev.map((a) =>
          a.id === data.articuloId
            ? { ...a, stock: data.nuevoStock, totalStock: data.nuevoStock }
            : a
        )
      );
    };

    const handleCatalogoPrecargado = (data: { count: number }) => {
      fetchArticulos(false);
      showToast(`Catálogo precargado con ${data.count} artículos`, "success");
    };

    socket.on("articulo:creado", handleArticuloCreado);
    socket.on("articulo:actualizado", handleArticuloActualizado);
    socket.on("articulo:eliminado", handleArticuloEliminado);
    socket.on("stock:actualizado", handleStockActualizado);
    socket.on("catalogo:precargado", handleCatalogoPrecargado);

    return () => {
      socket.off("articulo:creado", handleArticuloCreado);
      socket.off("articulo:actualizado", handleArticuloActualizado);
      socket.off("articulo:eliminado", handleArticuloEliminado);
      socket.off("stock:actualizado", handleStockActualizado);
      socket.off("catalogo:precargado", handleCatalogoPrecargado);
    };
  }, [socket]);

  const filteredArticulos = useMemo(() => {
    return articulos.filter((art) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        art.nombre.toLowerCase().includes(q) ||
        art.codigo.toLowerCase().includes(q) ||
        (art.familia?.nombre && art.familia.nombre.toLowerCase().includes(q)) ||
        (art.subfamilia?.nombre && art.subfamilia.nombre.toLowerCase().includes(q));

      const matchesFamilia =
        selectedFamilia === "ALL" || art.familia?.id === selectedFamilia || art.familia?.nombre === selectedFamilia;

      const matchesEstado =
        selectedEstado === "ALL" ||
        (selectedEstado === "ACTIVO" && art.activo) ||
        (selectedEstado === "INACTIVO" && !art.activo);

      return matchesSearch && matchesFamilia && matchesEstado;
    });
  }, [articulos, searchTerm, selectedFamilia, selectedEstado]);

  const stats = useMemo(() => {
    const total = articulos.length;
    const activos = articulos.filter((a) => a.activo).length;
    const conPrecio = articulos.filter((a) => a.precioVenta > 0).length;
    const conImagen = articulos.filter((a) => Boolean(a.imagen)).length;
    const familiasCount = familias.length;
    return { total, activos, conPrecio, conImagen, familiasCount };
  }, [articulos, familias]);

  const handleOpenEdit = (articulo: Articulo) => {
    setEditingArticulo(articulo);
    setFormData({
      codigo: articulo.codigo,
      nombre: articulo.nombre,
      descripcion: articulo.descripcion || "",
      precioCompra: articulo.precioCompra || 0,
      precioVenta: articulo.precioVenta || 0,
      unidad: articulo.unidad || "Pieza",
      necesitaBascula: Boolean(articulo.necesitaBascula),
      stockIlimitado: Boolean(articulo.stockIlimitado),
      imagen: articulo.imagen || "",
      familiaId: articulo.familia?.id || "",
      subfamiliaId: articulo.subfamilia?.id || "",
      activo: articulo.activo,
      stockActual: articulo.stock || 0,
    });
    setWebSearchOpen(false);
    setImageResults([]);
    setModalOpen(true);
  };

  const handleOpenCreate = (preselectedFamiliaId?: string) => {
    setEditingArticulo(null);
    setFormData({
      codigo: "",
      nombre: "",
      descripcion: "",
      precioCompra: 0,
      precioVenta: 0,
      unidad: unidadesList[0]?.nombre || "Pieza",
      necesitaBascula: Boolean(unidadesList[0]?.necesitaBascula),
      stockIlimitado: false,
      imagen: "",
      familiaId: preselectedFamiliaId || familias[0]?.id || "",
      subfamiliaId: "",
      activo: true,
      stockActual: 0,
    });
    setWebSearchOpen(false);
    setImageResults([]);
    setModalOpen(true);
  };

  const handleSearchWebImages = async (queryToSearch?: string) => {
    const query = (queryToSearch ?? imageSearchQuery ?? formData.nombre).trim();
    if (!query || query.length < 2) {
      return;
    }

    setSearchingImages(true);
    try {
      const results = await apiRequest<ImagenResultado[]>(
        `/articulos/buscar-imagenes?q=${encodeURIComponent(query)}`
      );
      setImageResults(Array.isArray(results) ? results : []);
    } catch {
      setImageResults([]);
    } finally {
      setSearchingImages(false);
    }
  };

  const handleOpenImageSearch = () => {
    setWebSearchOpen(true);
    const initialQuery = formData.nombre.trim() || formData.codigo.trim();
    setImageSearchQuery(initialQuery);
    if (initialQuery.length >= 2) {
      handleSearchWebImages(initialQuery);
    }
  };

  const handleSelectImage = (url: string) => {
    setFormData((prev) => ({ ...prev, imagen: url }));
    setWebSearchOpen(false);
    showToast("Imagen asignada al artículo", "success");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.codigo.trim() || !formData.nombre.trim()) {
      alert("El código y el nombre del artículo son obligatorios.");
      return;
    }

    setSaving(true);
    const usuario = getUsuarioActual();
    const orgId = getOrganizacionId() || usuario?.organizacionId;

    try {
      if (editingArticulo) {
        await apiRequest(`/articulos/${editingArticulo.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        showToast("Artículo actualizado con éxito", "success");
      } else {
        await apiRequest(`/articulos?organizacionId=${orgId}`, {
          method: "POST",
          body: JSON.stringify({
            ...formData,
            organizacionId: orgId,
          }),
        });
        showToast("Artículo creado con éxito", "success");
      }

      setModalOpen(false);
      await fetchArticulos(false);
    } catch (err: any) {
      alert(err.message || "Error al guardar el artículo");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteArticulo = async () => {
    if (!articuloToDelete) return;

    setDeletingArticulo(true);
    try {
      await apiRequest(`/articulos/${articuloToDelete.id}`, {
        method: "DELETE",
      });
      showToast(`Artículo "${articuloToDelete.nombre}" eliminado`, "success");
      setArticulos((prev) => prev.filter((a) => a.id !== articuloToDelete.id));
      if (editingArticulo?.id === articuloToDelete.id) {
        setModalOpen(false);
      }
      setArticuloToDelete(null);
    } catch (err: any) {
      alert(err.message || "Error al eliminar el artículo.");
    } finally {
      setDeletingArticulo(false);
    }
  };

  const handleCreateQuickFamilia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickFamiliaNombre.trim()) return;

    setSavingQuickFamilia(true);
    const usuario = getUsuarioActual();
    const orgId = getOrganizacionId() || usuario?.organizacionId;

    try {
      const nueva = await apiRequest<FamiliaItem>("/articulos/familias", {
        method: "POST",
        body: JSON.stringify({
          organizacionId: orgId,
          nombre: quickFamiliaNombre.trim(),
          descripcion: quickFamiliaDescripcion.trim() || undefined,
        }),
      });

      if (quickFamiliaSubfamilia.trim() && nueva?.id) {
        await apiRequest("/articulos/subfamilias", {
          method: "POST",
          body: JSON.stringify({
            familiaId: nueva.id,
            nombre: quickFamiliaSubfamilia.trim(),
          }),
        }).catch(() => null);
      }

      showToast(`Familia "${nueva.nombre}" creada con éxito`, "success");
      setQuickFamiliaModalOpen(false);
      setQuickFamiliaNombre("");
      setQuickFamiliaSubfamilia("");
      setQuickFamiliaDescripcion("");

      // Recargar familias
      const familiasRes = await apiRequest<FamiliaItem[]>(`/articulos/familias/${orgId}`);
      if (Array.isArray(familiasRes)) {
        setFamilias(familiasRes);
      }

      // Si el modal de producto está abierto, asignar esta familia
      if (nueva?.id) {
        setFormData((prev) => ({ ...prev, familiaId: nueva.id }));
      }
    } catch (err: any) {
      alert(err.message || "Error al crear la familia rápida");
    } finally {
      setSavingQuickFamilia(false);
    }
  };

  const handlePrecargarCatalogo = async () => {
    const usuario = getUsuarioActual();
    const orgId = getOrganizacionId() || usuario?.organizacionId;

    if (!orgId) {
      alert("No se identificó la organización activa.");
      return;
    }

    setPreloading(true);
    try {
      const res: any = await apiRequest("/articulos/precargar-catalogo", {
        method: "POST",
        body: JSON.stringify({
          organizacionId: orgId,
        }),
      });

      setPreloadModalOpen(false);
      showToast(res.mensaje || "Catálogo precargado exitosamente", "success");
      await fetchArticulos(false);
    } catch (err: any) {
      alert(err.message || "Error al precargar el catálogo.");
    } finally {
      setPreloading(false);
    }
  };

  const paisOrg = organizacionData?.pais || "México";
  const selectedFamiliaObj = familias.find((f) => f.id === formData.familiaId);

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Sidebar />

      <div className={`min-h-screen transition-all duration-300 ${collapsed ? "ml-0 md:ml-[80px]" : "ml-0 md:ml-[250px]"}`}>
        <Header />

        {/* Toast Notificación */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-[10000] flex items-center gap-3 bg-black px-5 py-3.5 text-white shadow-2xl animate-in slide-in-from-top-5 duration-200 border-l-4 border-black">
            <CheckCircle2 size={16} className="text-white flex-none" />
            <span className="text-xs font-bold">{toastMessage.text}</span>
          </div>
        )}

        <div className="p-4 sm:p-6 lg:p-10">
          {/* Encabezado Principal */}
          <div className="mb-6 sm:mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p
                  className="text-xs font-bold uppercase tracking-[0.18em]"
                  style={{ color: activePalette?.hex || "var(--primary)" }}
                >
                  Catálogo de Productos
                </p>
                <div
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                    socketConnected
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-gray-100 text-gray-600 border border-gray-300"
                  }`}
                  title={socketConnected ? "Sincronización en vivo activa" : "Conectando Socket.io..."}
                >
                  {socketConnected ? <Wifi size={10} className="animate-pulse" /> : <WifiOff size={10} />}
                  <span>{socketConnected ? "EN VIVO" : "OFFLINE"}</span>
                </div>
              </div>

              <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-black">
                Artículos & Catálogo
              </h1>

              <p className="mt-1 text-xs sm:text-sm text-[#777777]">
                Visualiza tus productos en cuadrículas inteligentes por catálogo completo o agrupados por familias y subfamilias.
              </p>
            </div>

            {/* Botones de Acción Superiores */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setQuickFamiliaModalOpen(true)}
                className="flex h-10 sm:h-11 items-center justify-center border border-[#DDDDDD] bg-white px-3 sm:px-4 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-black hover:text-white cursor-pointer shadow-xs gap-1.5"
              >
                <FolderTree size={14} />
                <span>+ Familia Rápida</span>
              </button>

              <button
                type="button"
                onClick={() => setPreloadModalOpen(true)}
                className="flex h-10 sm:h-11 items-center justify-center border border-[#DDDDDD] bg-white px-3 sm:px-4 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-black hover:text-white cursor-pointer shadow-xs"
              >
                Precargar Catálogo
              </button>

              <button
                type="button"
                onClick={() => handleOpenCreate()}
                className="flex h-10 sm:h-11 items-center justify-center bg-black px-4 sm:px-5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-[var(--primary)] cursor-pointer gap-1.5"
              >
                <Plus size={15} />
                <span>+ Nuevo Producto</span>
              </button>
            </div>
          </div>

          {/* Selector de Pestañas / Cuadrículas */}
          <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[#E0E0E0] pb-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("todos")}
                className={`relative flex items-center gap-2 pb-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === "todos"
                    ? "text-black border-b-2 border-black"
                    : "text-[#888888] hover:text-black"
                }`}
              >
                <Package size={16} />
                <span>Todos los Productos</span>
                <span className="ml-1 rounded-full bg-[#EEEEEE] px-2 py-0.5 text-[10px] font-bold text-black">
                  {articulos.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("familias")}
                className={`relative flex items-center gap-2 pb-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === "familias"
                    ? "text-black border-b-2 border-black"
                    : "text-[#888888] hover:text-black"
                }`}
              >
                <FolderTree size={16} />
                <span>Familias & Subfamilias</span>
                <span className="ml-1 rounded-full bg-[#EEEEEE] px-2 py-0.5 text-[10px] font-bold text-black">
                  {familias.length}
                </span>
              </button>
            </div>

            {/* Alternador de Vista (Cuadrícula / Lista) para la pestaña de Todos */}
            {activeTab === "todos" && (
              <div className="flex items-center gap-1.5 self-end sm:self-auto bg-white border border-[#DDDDDD] p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  title="Vista en Cuadrícula"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-black text-white"
                      : "text-[#666666] hover:text-black hover:bg-gray-100"
                  }`}
                >
                  <LayoutGrid size={14} />
                  <span>Cuadrícula</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  title="Vista en Lista / Tabla"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    viewMode === "table"
                      ? "bg-black text-white"
                      : "text-[#666666] hover:text-black hover:bg-gray-100"
                  }`}
                >
                  <List size={14} />
                  <span>Tabla</span>
                </button>
              </div>
            )}
          </div>

          {/* VISTA 1: TODOS LOS PRODUCTOS */}
          {activeTab === "todos" && (
            <div>
              {/* Barra de Búsqueda y Filtros */}
              <div className="mb-6 flex flex-col gap-2.5 sm:gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, SKU, código de barras o categoría..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-11 sm:h-12 w-full border border-[#E0E0E0] bg-white pl-11 pr-4 text-xs sm:text-sm text-black outline-none transition-colors focus:border-black"
                  />
                </div>

                <select
                  value={selectedFamilia}
                  onChange={(e) => setSelectedFamilia(e.target.value)}
                  className="h-11 sm:h-12 min-w-[190px] border border-[#E0E0E0] bg-white px-3 sm:px-4 text-xs font-semibold text-black outline-none focus:border-black cursor-pointer"
                >
                  <option value="ALL">Todas las familias ({familias.length})</option>
                  {familias.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nombre}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedEstado}
                  onChange={(e) => setSelectedEstado(e.target.value as any)}
                  className="h-11 sm:h-12 min-w-[130px] border border-[#E0E0E0] bg-white px-3 sm:px-4 text-xs font-semibold text-black outline-none focus:border-black cursor-pointer"
                >
                  <option value="ALL">Todos los estados</option>
                  <option value="ACTIVO">Activos</option>
                  <option value="INACTIVO">Inactivos</option>
                </select>
              </div>

              {/* Cargando o Sin Artículos */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 border border-[#E2E2E2] bg-white">
                  <Loader2 size={32} className="animate-spin text-black" />
                  <p className="mt-3 text-sm font-semibold text-[#666666]">
                    Cargando catálogo de artículos...
                  </p>
                </div>
              ) : filteredArticulos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center px-4 border border-[#E2E2E2] bg-white">
                  <Package size={44} className="text-[#CCCCCC]" />
                  <p className="mt-3 text-base font-bold text-black">
                    No se encontraron artículos
                  </p>
                  <p className="mt-1 max-w-md text-xs text-[#777777]">
                    {searchTerm || selectedFamilia !== "ALL"
                      ? "Intenta modificar los filtros de búsqueda o categoría."
                      : "Tu organización aún no tiene artículos registrados. Puedes agregar uno manualmente o precargar el catálogo sugerido."}
                  </p>
                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleOpenCreate()}
                      className="bg-black px-4 py-2.5 text-xs font-bold uppercase text-white hover:bg-[var(--primary)] transition-colors cursor-pointer"
                    >
                      + Crear Producto
                    </button>
                    {!searchTerm && selectedFamilia === "ALL" && (
                      <button
                        type="button"
                        onClick={() => setPreloadModalOpen(true)}
                        className="border border-[#DDDDDD] bg-white px-4 py-2.5 text-xs font-bold uppercase text-black hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        Precargar Catálogo
                      </button>
                    )}
                  </div>
                </div>
              ) : viewMode === "grid" ? (
                /* CUADRÍCULA DE PRODUCTOS */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-5">
                  {filteredArticulos.map((art) => {
                    const stock = art.stock ?? art.totalStock ?? 0;
                    return (
                      <div
                        key={art.id}
                        className="group relative flex flex-col justify-between border border-[#E5E5E5] bg-white shadow-xs transition-all hover:border-black hover:shadow-md overflow-hidden"
                      >
                        {/* Cabecera / Fotografía */}
                        <div className="relative aspect-4/3 w-full bg-[#FAFAFA] border-b border-[#EEEEEE] flex items-center justify-center p-3 overflow-hidden">
                          {art.imagen ? (
                            <img
                              src={art.imagen}
                              alt={art.nombre}
                              className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-200"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-[#BBBBBB]">
                              <Package size={36} strokeWidth={1.5} />
                              <span className="text-[10px] uppercase font-bold tracking-wider mt-1">Sin Foto</span>
                            </div>
                          )}

                          {/* Badge de Estado flotante */}
                          <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border shadow-2xs ${
                                art.activo
                                  ? "bg-white/95 text-emerald-700 border-emerald-300"
                                  : "bg-white/95 text-gray-600 border-gray-300"
                              }`}
                            >
                              {art.activo ? "Activo" : "Inactivo"}
                            </span>
                          </div>

                          {/* Badge de Stock flotante */}
                          <div className="absolute top-2 right-2">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded border shadow-2xs ${
                                art.stockIlimitado
                                  ? "bg-purple-50 text-purple-800 border-purple-300"
                                  : stock > 5
                                  ? "bg-white/95 text-emerald-800 border-emerald-300"
                                  : stock > 0
                                  ? "bg-white/95 text-amber-800 border-amber-300"
                                  : "bg-white/95 text-red-700 border-red-300"
                              }`}
                            >
                              {art.stockIlimitado ? "♾️ Ilimitado" : `Stock: ${stock} ${art.unidad}`}
                            </span>
                          </div>
                        </div>

                        {/* Cuerpo de la Tarjeta */}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            {/* SKU / Código y Báscula */}
                            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                              <div className="flex items-center gap-1 font-mono text-[11px] text-[#666666] bg-[#F5F5F5] px-2 py-0.5 rounded w-fit">
                                <Barcode size={12} />
                                <span>{art.codigo}</span>
                              </div>

                              {art.necesitaBascula && (
                                <span
                                  className="inline-flex items-center gap-1 rounded bg-amber-50 border border-amber-300 px-1.5 py-0.5 text-[9px] font-bold text-amber-900 shadow-2xs"
                                  title="Requiere báscula para pesaje e impresión de etiquetas con peso"
                                >
                                  <Scale size={10} className="text-amber-700" />
                                  <span>Báscula</span>
                                </span>
                              )}
                            </div>

                            {/* Nombre del Artículo */}
                            <h3
                              className="text-sm font-bold text-black line-clamp-2 leading-snug group-hover:text-[var(--primary)] transition-colors"
                              title={art.nombre}
                            >
                              {art.nombre}
                            </h3>

                            {/* Familia y Subfamilia */}
                            <div className="mt-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#888888]">
                              <span>{art.familia?.nombre || "Sin Categoría"}</span>
                              {art.subfamilia && <span>• {art.subfamilia.nombre}</span>}
                            </div>
                          </div>

                          {/* Precios */}
                          <div className="mt-4 pt-3 border-t border-[#EEEEEE] flex items-baseline justify-between">
                            <div>
                              <p className="text-[10px] font-bold uppercase text-[#888888]">Precio Venta</p>
                              <p className="text-lg font-bold text-black font-mono">
                                ${art.precioVenta.toFixed(2)}
                              </p>
                            </div>

                            {art.precioCompra > 0 && (
                              <div className="text-right">
                                <p className="text-[10px] uppercase text-[#999999]">Costo</p>
                                <p className="text-xs font-mono text-[#777777]">
                                  ${art.precioCompra.toFixed(2)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Pie con Acciones */}
                        <div className="border-t border-[#EEEEEE] bg-[#FAFAFA] px-3 py-2 flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(art)}
                            className="inline-flex items-center gap-1 border border-[#DDDDDD] bg-white px-2.5 py-1 text-xs font-bold text-black hover:bg-black hover:text-white transition-colors cursor-pointer shadow-2xs"
                          >
                            <Edit2 size={11} />
                            <span>Editar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setArticuloToDelete(art)}
                            className="inline-flex items-center gap-1 border border-[#DDDDDD] bg-white px-2.5 py-1 text-xs font-bold text-[#DC2626] hover:bg-[#DC2626] hover:text-white transition-colors cursor-pointer shadow-2xs"
                            title="Eliminar artículo"
                          >
                            <Trash2 size={11} />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* VISTA EN TABLA */
                <section className="border border-[#E2E2E2] bg-white shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[650px]">
                      <thead>
                        <tr className="bg-[#FAFAFA] border-b border-[#EEEEEE] text-[11px] font-bold uppercase text-[#777777]">
                          <th className="px-5 py-3.5">Artículo & Foto</th>
                          <th className="px-4 py-3.5">Categoría / Familia</th>
                          <th className="px-4 py-3.5">Unidad</th>
                          <th className="px-4 py-3.5 text-right">P. Compra</th>
                          <th className="px-4 py-3.5 text-right">P. Venta</th>
                          <th className="px-4 py-3.5 text-center">Estado</th>
                          <th className="px-5 py-3.5 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EEEEEE] text-sm">
                        {filteredArticulos.map((art) => (
                          <tr
                            key={art.id}
                            className="hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                            onClick={() => handleOpenEdit(art)}
                          >
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <div className="h-11 w-11 flex-none rounded border border-[#EEEEEE] bg-white overflow-hidden flex items-center justify-center">
                                  {art.imagen ? (
                                    <img
                                      src={art.imagen}
                                      alt={art.nombre}
                                      className="h-full w-full object-contain p-1"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <Package size={18} className="text-[#999999]" />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-bold text-black text-xs sm:text-sm leading-snug">
                                      {art.nombre}
                                    </p>
                                    {art.necesitaBascula && (
                                      <span
                                        className="inline-flex items-center gap-1 rounded bg-amber-50 border border-amber-300 px-1.5 py-0.5 text-[9px] font-bold text-amber-900"
                                        title="Requiere báscula para pesaje e impresión"
                                      >
                                        <Scale size={10} className="text-amber-700" />
                                        <span>Báscula</span>
                                      </span>
                                    )}
                                  </div>
                                  <p className="font-mono text-[11px] text-[#777777]">
                                    {art.codigo}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <span className="inline-block bg-[#F5F5F5] px-2.5 py-0.5 text-xs font-semibold text-black rounded border border-[#E5E5E5]">
                                {art.familia?.nombre || "Sin Asignar"}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-xs text-[#555555]">
                              {art.unidad}
                            </td>

                            <td className="px-4 py-3 text-right font-mono text-xs text-[#777777]">
                              ${art.precioCompra.toFixed(2)}
                            </td>

                            <td className="px-4 py-3 text-right font-mono font-bold text-black">
                              ${art.precioVenta.toFixed(2)}
                            </td>

                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-block px-2.5 py-0.5 text-[10px] font-bold tracking-wider ${
                                  art.activo
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-gray-100 text-gray-600 border border-gray-200"
                                }`}
                              >
                                {art.activo ? "ACTIVO" : "INACTIVO"}
                              </span>
                            </td>

                            <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(art)}
                                  className="inline-flex items-center gap-1.5 border border-[#DDDDDD] bg-white px-3 py-1.5 text-xs font-bold text-black hover:bg-black hover:text-white transition-all cursor-pointer shadow-xs"
                                >
                                  <Edit2 size={12} />
                                  <span>Editar</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setArticuloToDelete(art)}
                                  className="inline-flex items-center gap-1.5 border border-[#DDDDDD] bg-white px-2.5 py-1.5 text-xs font-bold text-[#DC2626] hover:bg-[#DC2626] hover:text-white transition-all cursor-pointer shadow-xs"
                                  title="Eliminar artículo"
                                >
                                  <Trash2 size={12} />
                                  <span>Eliminar</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </div>
          )}

          {/* VISTA 2: CUADRÍCULA DE FAMILIAS CON SUS SUBFAMILIAS */}
          {activeTab === "familias" && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-black">Cuadrícula de Familias & Categorías</h2>
                  <p className="text-xs text-[#777777]">
                    Selecciona una familia para agregar un producto directamente o crea nuevas familias al instante.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setQuickFamiliaModalOpen(true)}
                  className="inline-flex items-center gap-2 h-10 bg-black px-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-[var(--primary)] transition-colors cursor-pointer shadow-xs"
                >
                  <Plus size={14} />
                  <span>+ Crear Familia Rápida</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {familias.map((fam) => (
                  <div
                    key={fam.id}
                    className="group relative flex flex-col justify-between border border-[#E5E5E5] bg-white p-6 shadow-xs transition-all hover:border-black hover:shadow-md"
                  >
                    <div>
                      {/* Cabecera de Familia */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center bg-black text-white font-bold text-base shadow-xs">
                            {fam.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-black">{fam.nombre}</h3>
                            <p className="text-xs text-[#777777] line-clamp-1">
                              {fam.descripcion || "Categoría de productos"}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                          {fam._count?.articulos || 0} prod.
                        </span>
                      </div>

                      {/* Subfamilias Pills */}
                      <div className="mt-4 mb-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-2">
                          Subfamilias ({fam.subfamilias?.length || 0}):
                        </p>
                        <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                          {fam.subfamilias && fam.subfamilias.length > 0 ? (
                            fam.subfamilias.map((sub) => (
                              <span
                                key={sub.id}
                                className="inline-flex items-center gap-1 bg-[#FAFAFA] border border-[#E5E5E5] px-2 py-0.5 text-[11px] font-semibold text-black rounded"
                              >
                                <Tag size={10} className="text-[#888888]" />
                                <span>{sub.nombre}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-xs italic text-[#999999]">Sin subfamilias divididas</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Acciones de la Tarjeta */}
                    <div className="pt-4 border-t border-[#EEEEEE] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFamilia(fam.id);
                          setActiveTab("todos");
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black hover:text-[var(--primary)] transition-colors cursor-pointer"
                      >
                        <span>Ver Productos</span>
                        <ArrowRight size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenCreate(fam.id)}
                        className="inline-flex items-center gap-1.5 bg-black px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[var(--primary)] transition-colors cursor-pointer shadow-xs"
                      >
                        <Plus size={12} />
                        <span>+ Agregar Producto</span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Tarjeta Especial para Crear Familia Rápida */}
                <div
                  onClick={() => setQuickFamiliaModalOpen(true)}
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#CCCCCC] bg-white hover:border-black hover:bg-[#FAFAFA] transition-all cursor-pointer min-h-[220px] text-center group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEEEEE] group-hover:bg-black group-hover:text-white transition-colors mb-3">
                    <Plus size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-black uppercase tracking-wider">
                    Crear Familia Rápida
                  </h3>
                  <p className="text-xs text-[#777777] mt-1 max-w-[200px]">
                    Agrega una nueva categoría al vuelo para catalogar nuevos productos.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL MÁS ANCHO PARA CREACIÓN / EDICIÓN DE ARTÍCULO */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative my-auto flex max-h-[92vh] w-full max-w-4xl flex-col border border-[#DDDDDD] bg-white shadow-2xl cursor-default overflow-hidden"
          >
            {/* Encabezado Modal */}
            <div className="flex items-center justify-between border-b border-[#EEEEEE] px-6 py-4 bg-[#FAFAFA]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center bg-black text-white">
                  <Tag size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-black">
                    {editingArticulo ? "Editar Artículo" : "Registrar Nuevo Artículo"}
                  </h3>
                  <p className="text-xs text-[#777777]">
                    {editingArticulo ? `SKU: ${editingArticulo.codigo}` : "Completa los datos del producto e imagen"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center text-[#777777] hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Formulario en Cuadrícula Ancha Responsiva */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Columna Izquierda: Imagen y Buscador Web (5 columnas) */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="border border-[#E5E5E5] bg-[#FAFBFB] p-4 rounded-lg">
                    <p className="text-xs font-bold text-black uppercase tracking-wider mb-2">
                      Fotografía del Producto
                    </p>

                    {/* Preview Cuadro */}
                    <div className="relative h-44 w-full rounded-lg border-2 border-dashed border-[#D1D5DB] bg-white overflow-hidden flex items-center justify-center shadow-xs">
                      {formData.imagen ? (
                        <img
                          src={formData.imagen}
                          alt="Vista previa"
                          className="h-full w-full object-contain p-2"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-[#9CA3AF]">
                          <ImageIcon size={32} />
                          <span className="text-[10px] font-bold mt-1.5 uppercase tracking-wider">Sin imagen asignada</span>
                        </div>
                      )}
                    </div>

                    {/* Botones de acción imagen */}
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleOpenImageSearch}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-black py-2 px-3 text-xs font-bold text-white hover:bg-[var(--primary)] transition-colors cursor-pointer"
                      >
                        <Search size={13} />
                        <span>Buscar Imagen en la Web</span>
                      </button>

                      {formData.imagen && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imagen: "" })}
                          className="flex items-center justify-center gap-1 border border-[#DDDDDD] bg-white py-2 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                          <span>Quitar</span>
                        </button>
                      )}
                    </div>

                    {/* Input directo de URL */}
                    <div className="mt-3 pt-3 border-t border-[#EAEAEA]">
                      <label className="block text-[10px] font-bold uppercase text-[#777777] mb-1">
                        URL Directa de Imagen (Opcional)
                      </label>
                      <input
                        type="url"
                        value={formData.imagen}
                        onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
                        placeholder="https://ejemplo.com/foto.jpg"
                        className="h-9 w-full rounded border border-[#DDDDDD] bg-white px-3 text-xs text-black outline-none focus:border-black font-mono"
                      />
                    </div>
                  </div>

                  {/* Panel Desplegable de Búsqueda Web */}
                  {webSearchOpen && (
                    <div className="border border-black bg-white p-4 rounded-lg shadow-md animate-in fade-in duration-150">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-black uppercase">
                          Resultados Web en Vivo
                        </span>
                        <button
                          type="button"
                          onClick={() => setWebSearchOpen(false)}
                          className="text-xs text-[#888888] hover:text-black font-bold cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={imageSearchQuery}
                          onChange={(e) => setImageSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSearchWebImages();
                            }
                          }}
                          placeholder="Nombre del producto o marca..."
                          className="h-9 flex-1 border border-[#CCCCCC] px-3 text-xs text-black outline-none focus:border-black"
                        />
                        <button
                          type="button"
                          onClick={() => handleSearchWebImages()}
                          disabled={searchingImages}
                          className="h-9 bg-black px-3.5 text-xs font-bold text-white hover:bg-[var(--primary)] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {searchingImages ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
                          <span>Buscar</span>
                        </button>
                      </div>

                      <div className="mt-3">
                        {searchingImages ? (
                          <div className="flex flex-col items-center justify-center py-6">
                            <Loader2 size={22} className="animate-spin text-black" />
                            <p className="mt-1.5 text-xs text-[#666666]">Buscando imágenes...</p>
                          </div>
                        ) : imageResults.length === 0 ? (
                          <p className="py-4 text-center text-xs text-[#888888]">
                            Sin resultados. Escribe una marca o término y presiona Buscar.
                          </p>
                        ) : (
                          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                            {imageResults.map((item, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectImage(item.url)}
                                className="group flex flex-col items-center rounded border border-[#E5E5E5] bg-[#FAFAFA] p-1.5 hover:border-black hover:bg-gray-100 transition-all text-left cursor-pointer"
                              >
                                <div className="h-16 w-full overflow-hidden bg-white flex items-center justify-center">
                                  <img
                                    src={item.thumb}
                                    alt={item.title}
                                    className="h-full w-full object-contain p-0.5 group-hover:scale-105 transition-transform"
                                    loading="lazy"
                                  />
                                </div>
                                <span className="mt-1 line-clamp-1 text-[9px] font-bold text-[#333333]">
                                  {item.title}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Columna Derecha: Datos del Producto (7 columnas) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase text-[#777777]">
                        Código de Barras / SKU <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.codigo}
                        onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                        placeholder="750105530001"
                        className="h-11 w-full border border-[#DDDDDD] px-3.5 text-sm text-black outline-none focus:border-black font-mono"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase text-[#777777]">
                        Nombre del Artículo <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        placeholder="Coca-Cola 600 ml"
                        className="h-11 w-full border border-[#DDDDDD] px-3.5 text-sm text-black outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase text-[#777777]">
                      Descripción / Presentación
                    </label>
                    <input
                      type="text"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      placeholder="Botella PET no retornable"
                      className="h-11 w-full border border-[#DDDDDD] px-3.5 text-sm text-black outline-none focus:border-black"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase text-[#777777]">
                        Precio Compra ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.precioCompra}
                        onChange={(e) => setFormData({ ...formData, precioCompra: parseFloat(e.target.value) || 0 })}
                        className="h-11 w-full border border-[#DDDDDD] px-3.5 text-sm text-black outline-none focus:border-black font-mono"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase text-[#777777]">
                        Precio Venta ($) <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.precioVenta}
                        onChange={(e) => setFormData({ ...formData, precioVenta: parseFloat(e.target.value) || 0 })}
                        className="h-11 w-full border border-black bg-[#FAFBFB] px-3.5 text-sm font-bold text-black outline-none focus:border-black font-mono"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold uppercase text-[#777777]">
                          Unidad de Medida
                        </label>
                        <a
                          href="/articulos/unidades"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-bold text-black hover:text-[var(--primary)] transition-colors"
                        >
                          Gestionar Unidades →
                        </a>
                      </div>
                      <select
                        value={formData.unidad}
                        onChange={(e) => {
                          const val = e.target.value;
                          const found = unidadesList.find(
                            (u) =>
                              u.nombre.toLowerCase() === val.toLowerCase() ||
                              u.abreviatura.toLowerCase() === val.toLowerCase()
                          );
                          setFormData((prev) => ({
                            ...prev,
                            unidad: val,
                            necesitaBascula: found ? found.necesitaBascula : prev.necesitaBascula,
                          }));
                        }}
                        className="h-11 w-full border border-[#DDDDDD] bg-white px-3 text-xs font-semibold text-black outline-none focus:border-black cursor-pointer"
                      >
                        {unidadesList.length > 0 ? (
                          unidadesList.map((u) => (
                            <option key={u.id} value={u.nombre}>
                              {u.nombre} ({u.abreviatura}) {u.necesitaBascula ? "⚖️ Báscula" : ""}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="Pieza">Pieza (Pza)</option>
                            <option value="Kg">Kilogramo (Kg) ⚖️ Báscula</option>
                            <option value="Gramo">Gramo (g) ⚖️ Báscula</option>
                            <option value="Litro">Litro (L)</option>
                            <option value="Paquete">Paquete (Pqt)</option>
                            <option value="Caja">Caja (Cja)</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* OPCIÓN: ¿NECESITA BÁSCULA? */}
                  <div className="border border-[#E5E5E5] bg-[#FAFBFB] p-3.5 rounded-lg">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.necesitaBascula}
                        onChange={(e) => setFormData({ ...formData, necesitaBascula: e.target.checked })}
                        className="h-5 w-5 accent-black mt-0.5 rounded cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Scale size={15} className="text-black" />
                          <span className="text-xs font-bold text-black uppercase tracking-wider">
                            ¿Necesita Báscula? (Para productos que va a imprimir / pesaje en balanza)
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-[#666666] leading-relaxed">
                          Activa esta casilla para productos a granel o pesables que requieren pesaje en la báscula del punto de venta o para imprimir etiquetas con código de barras de peso.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* OPCIÓN: ¿PRODUCTO ILIMITADO? (VENTAS RÁPIDAS) */}
                  <div className="border border-[#E5E5E5] bg-[#FAFBFB] p-3.5 rounded-lg">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.stockIlimitado}
                        onChange={(e) => setFormData({ ...formData, stockIlimitado: e.target.checked })}
                        className="h-5 w-5 accent-black mt-0.5 rounded cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">♾️</span>
                          <span className="text-xs font-bold text-black uppercase tracking-wider">
                            Producto con Stock Ilimitado (Ventas Rápidas / Sin Control de Inventario)
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-[#666666] leading-relaxed">
                          Ideal para servicios, artículos preparados al momento o productos donde no deseas bloquear ventas en el POS por falta de existencias registradas.
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold uppercase text-[#777777]">
                          Familia / Categoría
                        </label>
                        <button
                          type="button"
                          onClick={() => setQuickFamiliaModalOpen(true)}
                          className="text-[11px] font-bold text-black hover:text-[var(--primary)] transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Plus size={11} />
                          <span>+ Crear Familia Rápida</span>
                        </button>
                      </div>
                      <select
                        value={formData.familiaId}
                        onChange={(e) => setFormData({ ...formData, familiaId: e.target.value, subfamiliaId: "" })}
                        className="h-11 w-full border border-[#DDDDDD] bg-white px-3 text-xs font-semibold text-black outline-none focus:border-black cursor-pointer"
                      >
                        <option value="">-- Sin Familia --</option>
                        {familias.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedFamiliaObj?.subfamilias && selectedFamiliaObj.subfamilias.length > 0 ? (
                      <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase text-[#777777]">
                          Subfamilia
                        </label>
                        <select
                          value={formData.subfamiliaId}
                          onChange={(e) => setFormData({ ...formData, subfamiliaId: e.target.value })}
                          className="h-11 w-full border border-[#DDDDDD] bg-white px-3 text-xs font-semibold text-black outline-none focus:border-black cursor-pointer"
                        >
                          <option value="">-- Sin Subfamilia --</option>
                          {selectedFamiliaObj.subfamilias.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 pt-2 sm:pt-6">
                        <label className="flex items-center gap-2 text-xs font-bold text-black cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.activo}
                            onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                            className="h-4 w-4 accent-black"
                          />
                          <span>Artículo Activo para Ventas</span>
                        </label>
                      </div>
                    )}
                  </div>

                  {selectedFamiliaObj?.subfamilias && selectedFamiliaObj.subfamilias.length > 0 && (
                    <div className="pt-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-black cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.activo}
                          onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                          className="h-4 w-4 accent-black"
                        />
                        <span>Artículo Activo para Ventas</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones del Formulario */}
              <div className="pt-4 border-t border-[#EEEEEE] flex items-center justify-between gap-3">
                {editingArticulo ? (
                  <button
                    type="button"
                    onClick={() => setArticuloToDelete(editingArticulo)}
                    className="h-11 border border-red-200 bg-red-50 px-4 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 size={14} />
                    <span>Eliminar</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="h-11 border border-[#DDDDDD] px-5 text-xs font-bold uppercase tracking-wider text-black hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="h-11 bg-black px-6 text-xs font-bold uppercase tracking-wider text-white hover:bg-[var(--primary)] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-xs"
                  >
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    <span>{editingArticulo ? "Guardar Cambios" : "Crear Artículo"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CREACIÓN RÁPIDA DE FAMILIA */}
      {quickFamiliaModalOpen && (
        <div
          onClick={() => setQuickFamiliaModalOpen(false)}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative my-auto flex w-full max-w-lg flex-col border border-[#DDDDDD] bg-white shadow-2xl cursor-default overflow-hidden animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-[#EEEEEE] px-6 py-4 bg-[#FAFAFA]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center bg-black text-white">
                  <FolderTree size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-black">Crear Familia Rápida</h3>
                  <p className="text-xs text-[#777777]">Registra una categoría para asignar a tus productos</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickFamiliaModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center text-[#777777] hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateQuickFamilia}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555] mb-1">
                    Nombre de la Familia *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Bebidas, Abarrotes, Limpieza, Carnes..."
                    value={quickFamiliaNombre}
                    onChange={(e) => setQuickFamiliaNombre(e.target.value)}
                    className="w-full border border-[#DDDDDD] bg-white px-3.5 py-2.5 text-xs text-black outline-none focus:border-black"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555] mb-1">
                    Subfamilia Inicial (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Refrescos, Enlatados, Jabones..."
                    value={quickFamiliaSubfamilia}
                    onChange={(e) => setQuickFamiliaSubfamilia(e.target.value)}
                    className="w-full border border-[#DDDDDD] bg-white px-3.5 py-2.5 text-xs text-black outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555] mb-1">
                    Descripción (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Breve descripción de los productos en esta familia..."
                    value={quickFamiliaDescripcion}
                    onChange={(e) => setQuickFamiliaDescripcion(e.target.value)}
                    className="w-full border border-[#DDDDDD] bg-white px-3.5 py-2 text-xs text-black outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="border-t border-[#EEEEEE] bg-[#FAFAFA] px-6 py-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setQuickFamiliaModalOpen(false)}
                  className="h-11 border border-[#DDDDDD] bg-white px-5 text-xs font-bold uppercase tracking-wider text-black hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingQuickFamilia}
                  className="h-11 bg-black px-6 text-xs font-bold uppercase tracking-wider text-white hover:bg-[var(--primary)] transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  {savingQuickFamilia && <Loader2 size={14} className="animate-spin" />}
                  <span>Guardar Familia</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA PRECARGAR CATÁLOGO SUGERIDO */}
      {preloadModalOpen && (
        <div
          onClick={() => setPreloadModalOpen(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[90vh] w-full max-w-lg flex-col border border-[#DDDDDD] bg-white shadow-2xl cursor-default overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#EEEEEE] px-6 py-4 bg-[#FAFAFA]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center bg-black text-white">
                  <Package size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-black">
                    Precargar Catálogo Sugerido
                  </h3>
                  <p className="text-xs text-[#777777]">
                    País detectado: {paisOrg}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreloadModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center text-[#777777] hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-4">
              <div className="border border-[#E5E5E5] bg-[#FAFAFA] p-4 rounded-lg">
                <p className="text-sm font-semibold text-black leading-relaxed">
                  ¿Deseas precargar el catálogo de artículos sugeridos para tu organización en <strong>{paisOrg}</strong>?
                </p>
                <p className="mt-2 text-xs text-[#666666] leading-relaxed">
                  Se integrarán automáticamente los artículos más distribuidos con sus códigos SKU oficiales, familias y unidades de medida. Tus artículos registrados previamente se mantendrán intactos.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#EEEEEE] bg-[#FAFAFA] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPreloadModalOpen(false)}
                className="h-11 border border-[#DDDDDD] px-5 text-xs font-bold uppercase tracking-wider text-black hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handlePrecargarCatalogo}
                disabled={preloading}
                className="h-11 bg-black px-6 text-xs font-bold uppercase tracking-wider text-white hover:bg-[var(--primary)] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-xs"
              >
                {preloading && <Loader2 size={16} className="animate-spin" />}
                <span>{preloading ? "Precargando..." : "Confirmar y Precargar"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GENERAL DE CONFIRMACIÓN DE ELIMINACIÓN ESTILO SISTEMA */}
      <DeleteConfirmModal
        isOpen={Boolean(articuloToDelete)}
        onClose={() => setArticuloToDelete(null)}
        onConfirm={handleDeleteArticulo}
        title="Eliminar Artículo"
        subtitle={articuloToDelete ? `SKU: ${articuloToDelete.codigo}` : undefined}
        itemName={articuloToDelete?.nombre}
        itemDetails={
          articuloToDelete
            ? `Código / SKU: ${articuloToDelete.codigo} · Precio: $${articuloToDelete.precioVenta.toFixed(2)} · Stock: ${articuloToDelete.stock ?? articuloToDelete.totalStock ?? 0} ${articuloToDelete.unidad}`
            : undefined
        }
        warningMessage="¿Estás completamente seguro de que deseas eliminar este artículo del catálogo? Se borrará de forma permanente de la base de datos y se notificará en tiempo real."
        confirmText="Eliminar Artículo"
        loading={deletingArticulo}
      />
    </main>
  );
}