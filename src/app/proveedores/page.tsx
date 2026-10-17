"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import AuthGuard from "@/components/auth/AuthGuard";
import { useSidebar } from "@/context/SidebarContext";
import ProveedorStats from "@/components/proveedores/ProveedorStats";
import ProveedorTable from "@/components/proveedores/ProveedorTable";
import ProveedorModal from "@/components/proveedores/ProveedorModal";
import ProveedorDetailModal from "@/components/proveedores/ProveedorDetailModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import {
  Proveedor,
  CreateProveedorInput,
  getProveedores,
  createProveedor,
  updateProveedor,
  deleteProveedor,
} from "@/services/proveedores";
import { getOrganizacionId, getUsuarioActual } from "@/services/auth";
import { useSocket } from "@/hooks/useSocket";
import {
  Truck,
  Plus,
  Search,
  RefreshCw,
  Download,
  Filter,
  WifiOff,
} from "lucide-react";

export default function ProveedoresPage() {
  const { collapsed } = useSidebar();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("Todas");
  const [selectedActivo, setSelectedActivo] = useState<string>("todos");
  const [isOffline, setIsOffline] = useState(false);

  // Modales
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);
  const [selectedProveedorId, setSelectedProveedorId] = useState<string | null>(null);
  const [proveedorToDelete, setProveedorToDelete] = useState<Proveedor | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Sockets
  const usuario = typeof window !== "undefined" ? getUsuarioActual() : null;
  const orgId = typeof window !== "undefined" ? getOrganizacionId() || usuario?.organizacionId : null;
  const room = orgId ? `org_${orgId}` : undefined;
  const { socket } = useSocket(room);

  // Detección de conectividad
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const loadData = useCallback(async () => {
    const currentOrgId = getOrganizacionId() || getUsuarioActual()?.organizacionId;
    if (!currentOrgId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getProveedores(currentOrgId);
      setProveedores(data);
    } catch (err) {
      console.error("Error al cargar proveedores:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sincronización en tiempo real vía Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleProveedorCreado = (nuevo: Proveedor) => {
      setProveedores((prev) => [nuevo, ...prev.filter((p) => p.id !== nuevo.id)]);
    };

    const handleProveedorActualizado = (actualizado: Proveedor) => {
      setProveedores((prev) =>
        prev.map((p) => (p.id === actualizado.id ? { ...p, ...actualizado } : p)),
      );
    };

    const handleProveedorEliminado = ({ id }: { id: string }) => {
      setProveedores((prev) => prev.filter((p) => p.id !== id));
      if (selectedProveedorId === id) setSelectedProveedorId(null);
    };

    socket.on("proveedor:creado", handleProveedorCreado);
    socket.on("proveedor:actualizado", handleProveedorActualizado);
    socket.on("proveedor:eliminado", handleProveedorEliminado);

    return () => {
      socket.off("proveedor:creado", handleProveedorCreado);
      socket.off("proveedor:actualizado", handleProveedorActualizado);
      socket.off("proveedor:eliminado", handleProveedorEliminado);
    };
  }, [socket, selectedProveedorId]);

  // Categorías únicas
  const categorias = [
    "Todas",
    ...Array.from(new Set(proveedores.map((p) => p.categoria).filter(Boolean) as string[])),
  ];

  // Filtro
  const filteredProveedores = proveedores.filter((p) => {
    const term = search.toLowerCase();
    const matchesSearch =
      p.nombre.toLowerCase().includes(term) ||
      (p.contacto && p.contacto.toLowerCase().includes(term)) ||
      (p.rfc && p.rfc.toLowerCase().includes(term)) ||
      (p.telefono && p.telefono.includes(term)) ||
      (p.ciudad && p.ciudad.toLowerCase().includes(term));

    const matchesCategoria =
      selectedCategoria === "Todas" || p.categoria?.toLowerCase() === selectedCategoria.toLowerCase();

    const matchesActivo =
      selectedActivo === "todos"
        ? true
        : selectedActivo === "activos"
        ? p.activo
        : !p.activo;

    return matchesSearch && matchesCategoria && matchesActivo;
  });

  // Guardar (Crear / Editar)
  const handleSaveProveedor = async (data: any) => {
    const currentOrgId = getOrganizacionId() || getUsuarioActual()?.organizacionId;
    if (!currentOrgId) return;

    if (editingProveedor) {
      await updateProveedor(editingProveedor.id, data);
    } else {
      await createProveedor({
        ...data,
        organizacionId: currentOrgId,
      });
    }
    await loadData();
  };

  // Eliminar
  const handleDeleteConfirm = async () => {
    if (!proveedorToDelete) return;
    setDeleting(true);
    try {
      await deleteProveedor(proveedorToDelete.id);
      setProveedorToDelete(null);
      await loadData();
    } catch (err) {
      console.error("Error al eliminar proveedor:", err);
    } finally {
      setDeleting(false);
    }
  };

  // Exportar directorio a CSV
  const handleExportCSV = () => {
    if (proveedores.length === 0) return;

    const headers = [
      "Nombre / Razón Social",
      "Contacto",
      "RFC",
      "Giro / Categoría",
      "Teléfono",
      "WhatsApp",
      "Email",
      "Dirección",
      "Ciudad",
      "Estado",
      "Días Crédito",
      "Límite Crédito",
      "Saldo Pendiente",
      "Banco",
      "Cuenta",
      "CLABE",
      "Estado",
    ];

    const rows = proveedores.map((p) => [
      `"${p.nombre.replace(/"/g, '""')}"`,
      `"${(p.contacto || "").replace(/"/g, '""')}"`,
      `"${p.rfc || ""}"`,
      `"${p.categoria || ""}"`,
      `"${p.telefono || ""}"`,
      `"${p.whatsapp || ""}"`,
      `"${p.email || ""}"`,
      `"${(p.direccion || "").replace(/"/g, '""')}"`,
      `"${p.ciudad || ""}"`,
      `"${p.estado || ""}"`,
      p.diasCredito || 0,
      p.limiteCredito || 0,
      p.saldoPendiente || 0,
      `"${p.banco || ""}"`,
      `"${p.cuentaBancaria || ""}"`,
      `"${p.clabe || ""}"`,
      p.activo ? "Activo" : "Inactivo",
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `directorio_proveedores_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AuthGuard>
      <div className="crm-layout-container bg-[#F7F7F7]">
        <Sidebar />

        <div className={`crm-main-content ${collapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}>
          <Header />

          <main className="flex-1 p-3 sm:p-6 lg:p-8 space-y-6 w-full max-w-full">
            {/* Banner Offline */}
            {isOffline && (
              <div className="flex items-center gap-3 border border-amber-300 bg-amber-50 p-4 text-xs font-semibold text-amber-900">
                <WifiOff size={18} className="shrink-0 text-amber-700" />
                <span>
                  Modo sin conexión activo: Visualizando catálogo local de proveedores guardado en este equipo. Los cambios se sincronizarán al restablecerse la red.
                </span>
              </div>
            )}

            {/* Cabecera del Módulo */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E5] pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D8A814]">
                    Cadena de Suministro
                  </span>
                </div>
                <h1 className="text-2xl font-bold uppercase tracking-[0.16em] text-black mt-1">
                  Proveedores
                </h1>
                <p className="text-xs text-[#777777] mt-0.5">
                  Directorio comercial de distribuidores, condiciones de crédito y catálogo de abastecimiento
                </p>
              </div>

              {/* Botones de Cabecera */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleExportCSV}
                  disabled={proveedores.length === 0}
                  title="Exportar directorio a formato CSV"
                  className="flex items-center gap-2 border border-[#D5D5D5] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[#333333] hover:bg-[#F2F2F2] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Download size={14} />
                  Exportar
                </button>

                <button
                  onClick={loadData}
                  disabled={loading}
                  title="Actualizar catálogo"
                  className="flex items-center justify-center border border-[#D5D5D5] bg-white h-9 w-9 text-[#333333] hover:bg-[#F2F2F2] transition-colors cursor-pointer"
                >
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>

                <button
                  onClick={() => {
                    setEditingProveedor(null);
                    setModalOpen(true);
                  }}
                  className="flex items-center gap-2 border border-black bg-black px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white hover:bg-[#D8A814] hover:border-[#D8A814] hover:text-black transition-colors active:scale-95 cursor-pointer"
                >
                  <Plus size={15} />
                  Nuevo Proveedor
                </button>
              </div>
            </div>

            {/* Estadísticas / KPIs */}
            <ProveedorStats proveedores={proveedores} />

            {/* Barra de Filtros y Búsqueda */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border border-[#E5E5E5] bg-white p-3.5">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]"
                />
                <input
                  type="text"
                  placeholder="Buscar por proveedor, contacto, RFC, teléfono o ciudad..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-[#D5D5D5] bg-[#FAFAFA] pl-9 pr-3 py-2 text-xs text-black focus:border-[#D8A814] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2">
                {/* Filtro por Categoría / Giro */}
                <select
                  value={selectedCategoria}
                  onChange={(e) => setSelectedCategoria(e.target.value)}
                  className="border border-[#D5D5D5] bg-[#FAFAFA] px-3 py-2 text-xs text-black focus:border-[#D8A814] focus:outline-hidden"
                >
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "Todas" ? "Todos los giros" : cat}
                    </option>
                  ))}
                </select>

                {/* Filtro por Estado */}
                <select
                  value={selectedActivo}
                  onChange={(e) => setSelectedActivo(e.target.value)}
                  className="border border-[#D5D5D5] bg-[#FAFAFA] px-3 py-2 text-xs text-black focus:border-[#D8A814] focus:outline-hidden"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activos">Solo activos</option>
                  <option value="inactivos">Solo inactivos</option>
                </select>
              </div>
            </div>

            {/* Tabla de Proveedores */}
            {loading ? (
              <div className="flex items-center justify-center py-20 border border-[#E5E5E5] bg-white text-xs uppercase tracking-widest text-[#777777]">
                Cargando catálogo de proveedores...
              </div>
            ) : (
              <ProveedorTable
                proveedores={filteredProveedores}
                onSelectProveedor={(prov) => setSelectedProveedorId(prov.id)}
                onEditProveedor={(prov) => {
                  setEditingProveedor(prov);
                  setModalOpen(true);
                }}
                onDeleteProveedor={(prov) => setProveedorToDelete(prov)}
              />
            )}
          </main>
        </div>

        {/* Modal de Crear / Editar */}
        <ProveedorModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingProveedor(null);
          }}
          onSave={handleSaveProveedor}
          proveedorToEdit={editingProveedor}
        />

        {/* Modal de Detalle */}
        <ProveedorDetailModal
          proveedorId={selectedProveedorId}
          onClose={() => setSelectedProveedorId(null)}
          onEdit={(prov) => {
            setSelectedProveedorId(null);
            setEditingProveedor(prov);
            setModalOpen(true);
          }}
        />

        {/* Modal de Confirmación de Eliminación */}
        <DeleteConfirmModal
          isOpen={Boolean(proveedorToDelete)}
          title="Eliminar Proveedor"
          itemName={proveedorToDelete?.nombre}
          warningMessage={`¿Estás seguro de que deseas eliminar a "${proveedorToDelete?.nombre}" del catálogo de proveedores? Se desasociará de los artículos vinculados.`}
          onConfirm={handleDeleteConfirm}
          onClose={() => setProveedorToDelete(null)}
          loading={deleting}
        />
      </div>
    </AuthGuard>
  );
}
