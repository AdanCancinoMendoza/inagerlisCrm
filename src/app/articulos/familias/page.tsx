"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSidebar } from "@/context/SidebarContext";
import { useTheme } from "@/context/ThemeContext";
import { apiRequest } from "@/services/api";
import { getOrganizacionId, getUsuarioActual } from "@/services/auth";
import {
  FolderTree,
  Plus,
  Package,
  Search,
  CheckCircle2,
  Trash2,
  X,
  Layers,
  ArrowRight,
  Loader2,
  Tag,
} from "lucide-react";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import Link from "next/link";

type Subfamilia = {
  id: string;
  nombre: string;
  descripcion?: string | null;
};

type Familia = {
  id: string;
  nombre: string;
  descripcion?: string | null;
  subfamilias?: Subfamilia[];
  _count?: { articulos: number };
};

export default function FamiliasPage() {
  const { collapsed } = useSidebar();
  const { activePalette } = useTheme();
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modales
  const [createFamiliaModal, setCreateFamiliaModal] = useState(false);
  const [subfamiliaModalOpen, setSubfamiliaModalOpen] = useState(false);
  const [selectedFamiliaParaSub, setSelectedFamiliaParaSub] = useState<string>("");
  const [familiaToDelete, setFamiliaToDelete] = useState<Familia | null>(null);
  const [subfamiliaToDelete, setSubfamiliaToDelete] = useState<{ id: string; nombre: string; familiaNombre: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Formularios
  const [nombreFamilia, setNombreFamilia] = useState("");
  const [descripcionFamilia, setDescripcionFamilia] = useState("");
  const [subfamiliaInicial, setSubfamiliaInicial] = useState("");

  const [nombreSubfamilia, setNombreSubfamilia] = useState("");
  const [descripcionSubfamilia, setDescripcionSubfamilia] = useState("");

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadFamilias = async () => {
    const usuario = getUsuarioActual();
    const orgId = getOrganizacionId() || usuario?.organizacionId;
    if (!orgId) {
      setLoading(false);
      return;
    }

    try {
      const data = await apiRequest<Familia[]>(`/articulos/familias/${orgId}`);
      setFamilias(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error al cargar familias:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFamilias();
  }, []);

  const handleOpenNuevaSubfamilia = (familia?: Familia) => {
    if (familia) {
      setSelectedFamiliaParaSub(familia.id);
    } else if (familias.length > 0) {
      setSelectedFamiliaParaSub(familias[0].id);
    } else {
      setSelectedFamiliaParaSub("");
    }
    setNombreSubfamilia("");
    setDescripcionSubfamilia("");
    setSubfamiliaModalOpen(true);
  };

  const handleCreateFamilia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreFamilia.trim()) return;

    setSaving(true);
    const usuario = getUsuarioActual();
    const orgId = getOrganizacionId() || usuario?.organizacionId;

    try {
      const nueva = await apiRequest<Familia>("/articulos/familias", {
        method: "POST",
        body: JSON.stringify({
          organizacionId: orgId,
          nombre: nombreFamilia.trim(),
          descripcion: descripcionFamilia.trim() || undefined,
        }),
      });

      // Si especificó subfamilia inicial
      if (subfamiliaInicial.trim() && nueva?.id) {
        await apiRequest("/articulos/subfamilias", {
          method: "POST",
          body: JSON.stringify({
            familiaId: nueva.id,
            nombre: subfamiliaInicial.trim(),
          }),
        }).catch(() => null);
      }

      setCreateFamiliaModal(false);
      setNombreFamilia("");
      setDescripcionFamilia("");
      setSubfamiliaInicial("");
      showToast(`Familia "${nueva.nombre}" creada con éxito`);
      await loadFamilias();
    } catch (err: any) {
      alert(err.message || "Error al crear familia");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSubfamilia = async (e: React.FormEvent, keepOpen = false) => {
    e.preventDefault();
    if (!selectedFamiliaParaSub || !nombreSubfamilia.trim()) return;

    setSaving(true);
    try {
      const famTarget = familias.find((f) => f.id === selectedFamiliaParaSub);
      await apiRequest("/articulos/subfamilias", {
        method: "POST",
        body: JSON.stringify({
          familiaId: selectedFamiliaParaSub,
          nombre: nombreSubfamilia.trim(),
          descripcion: descripcionSubfamilia.trim() || undefined,
        }),
      });

      showToast(`Subfamilia "${nombreSubfamilia.trim()}" agregada a "${famTarget?.nombre || "Familia"}"`);
      setNombreSubfamilia("");
      setDescripcionSubfamilia("");
      if (!keepOpen) {
        setSubfamiliaModalOpen(false);
      }
      await loadFamilias();
    } catch (err: any) {
      alert(err.message || "Error al agregar subfamilia");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubfamilia = async () => {
    if (!subfamiliaToDelete) return;
    try {
      await apiRequest(`/articulos/subfamilias/${subfamiliaToDelete.id}`, {
        method: "DELETE",
      });
      showToast(`Subfamilia "${subfamiliaToDelete.nombre}" eliminada`);
      setSubfamiliaToDelete(null);
      await loadFamilias();
    } catch (err: any) {
      alert(err.message || "Error al eliminar subfamilia");
    }
  };

  const handleDeleteFamilia = async () => {
    if (!familiaToDelete) return;
    try {
      await apiRequest(`/articulos/familias/${familiaToDelete.id}`, {
        method: "DELETE",
      });
      showToast(`Familia "${familiaToDelete.nombre}" eliminada`);
      setFamilias((prev) => prev.filter((f) => f.id !== familiaToDelete.id));
      setFamiliaToDelete(null);
    } catch (err: any) {
      alert(err.message || "Error al eliminar familia");
    }
  };

  const filteredFamilias = familias.filter((f) => {
    const q = searchTerm.toLowerCase();
    return (
      f.nombre.toLowerCase().includes(q) ||
      (f.descripcion && f.descripcion.toLowerCase().includes(q)) ||
      (f.subfamilias && f.subfamilias.some((s) => s.nombre.toLowerCase().includes(q)))
    );
  });

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Sidebar />

      <div className={`min-h-screen transition-all duration-300 ${collapsed ? "ml-0 md:ml-[80px]" : "ml-0 md:ml-[250px]"}`}>
        <Header />

        {toastMessage && (
          <div className="fixed top-6 right-6 z-[10000] flex items-center gap-3 bg-black px-5 py-3.5 text-white shadow-2xl animate-in slide-in-from-top-5 duration-200 border-l-4 border-black">
            <CheckCircle2 size={16} className="text-white flex-none" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        )}

        <div className="p-4 sm:p-6 lg:p-10">
          {/* Header de la Vista */}
          <div className="mb-6 sm:mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-[0.18em]"
                style={{ color: activePalette?.hex || "var(--primary)" }}
              >
                Catálogo / Categorías
              </p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-black">
                Familias y Subfamilias
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#777777]">
                Organiza jerárquicamente tus artículos por familias y divisiones para navegación rápida en el POS y reportes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleOpenNuevaSubfamilia()}
                className="inline-flex items-center justify-center gap-2 h-11 border border-black bg-white px-5 text-xs font-bold uppercase tracking-wider text-black hover:bg-black hover:text-white transition-all cursor-pointer shadow-xs"
              >
                <Tag size={15} />
                <span>+ Nueva Subfamilia</span>
              </button>

              <button
                type="button"
                onClick={() => setCreateFamiliaModal(true)}
                className="inline-flex items-center justify-center gap-2 h-11 bg-black px-5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[var(--primary)] transition-all cursor-pointer shadow-xs"
              >
                <Plus size={16} />
                <span>+ Nueva Familia</span>
              </button>
            </div>
          </div>

          {/* Buscador */}
          <div className="mb-6 flex items-center gap-4 bg-white p-4 border border-[#DDDDDD] shadow-xs">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999]" />
              <input
                type="text"
                placeholder="Buscar por familia o subfamilia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#EEEEEE] pl-10 pr-4 py-2 text-xs text-black outline-none focus:border-black focus:bg-white transition-colors"
              />
            </div>
            <div className="text-xs font-bold text-[#777777] hidden sm:block">
              {filteredFamilias.length} familias registradas
            </div>
          </div>

          {/* Cuadrícula de Familias */}
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 size={32} className="animate-spin text-black mx-auto mb-3" />
              <p className="text-xs text-[#777777]">Cargando familias del catálogo...</p>
            </div>
          ) : filteredFamilias.length === 0 ? (
            <div className="border border-dashed border-[#CCCCCC] bg-white p-12 text-center">
              <FolderTree size={40} className="mx-auto text-[#999999] mb-3" />
              <h3 className="text-base font-bold text-black">No se encontraron familias</h3>
              <p className="text-xs text-[#777777] mt-1 mb-5">
                Crea tu primera categoría o precarga el catálogo de tu organización.
              </p>
              <button
                onClick={() => setCreateFamiliaModal(true)}
                className="inline-flex items-center gap-2 h-10 bg-black px-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-[var(--primary)] transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>Crear Familia Rápida</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredFamilias.map((fam) => (
                <div
                  key={fam.id}
                  className="group relative flex flex-col justify-between border border-[#E5E5E5] bg-white p-6 shadow-xs transition-all hover:border-black hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center bg-black text-white font-bold text-base shadow-xs">
                          {fam.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-black">{fam.nombre}</h3>
                          <p className="text-xs text-[#777777] line-clamp-1">
                            {fam.descripcion || "Sin descripción"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setFamiliaToDelete(fam)}
                        className="text-[#999999] hover:text-[#DC2626] p-1.5 transition-colors cursor-pointer"
                        title="Eliminar familia"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Subfamilias Pills */}
                    <div className="mt-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#888888]">
                          Subfamilias ({fam.subfamilias?.length || 0})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenNuevaSubfamilia(fam)}
                          className="text-[11px] font-bold text-black hover:text-[var(--primary)] transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Plus size={12} />
                          <span>Agregar subfamilia</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 min-h-[36px]">
                        {fam.subfamilias && fam.subfamilias.length > 0 ? (
                          fam.subfamilias.map((sub) => (
                            <span
                              key={sub.id}
                              className="group/pill inline-flex items-center gap-1 bg-[#F5F5F5] hover:bg-[#EEEEEE] border border-[#EEEEEE] pl-2.5 pr-1.5 py-1 text-[11px] font-semibold text-black rounded transition-colors"
                            >
                              <Tag size={10} className="text-[#888888]" />
                              <span>{sub.nombre}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSubfamiliaToDelete({
                                    id: sub.id,
                                    nombre: sub.nombre,
                                    familiaNombre: fam.nombre,
                                  });
                                }}
                                title={`Eliminar subfamilia "${sub.nombre}"`}
                                className="text-[#999999] hover:text-red-600 hover:bg-white rounded p-0.5 ml-0.5 opacity-60 group-hover/pill:opacity-100 transition-all cursor-pointer"
                              >
                                <X size={11} />
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] italic text-[#999999]">
                            Sin subfamilias divididas
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer de Tarjeta con Totales y Enlaces */}
                  <div className="pt-4 border-t border-[#EEEEEE] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package size={15} className="text-[#888888]" />
                      <span className="text-xs font-bold text-black">
                        {fam._count?.articulos || 0} artículos
                      </span>
                    </div>

                    <Link
                      href={`/articulos?familia=${encodeURIComponent(fam.id)}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black hover:text-[var(--primary)] transition-colors"
                    >
                      <span>Ver Productos</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL CREAR FAMILIA */}
      {createFamiliaModal && (
        <div
          onClick={() => setCreateFamiliaModal(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer overflow-y-auto"
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
                  <h3 className="text-base font-bold text-black">Nueva Familia</h3>
                  <p className="text-xs text-[#777777]">Categoría principal para agrupar artículos</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCreateFamiliaModal(false)}
                className="flex h-8 w-8 items-center justify-center text-[#777777] hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateFamilia}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555] mb-1">
                    Nombre de la Familia *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Bebidas, Abarrotes, Limpieza, Farmacia..."
                    value={nombreFamilia}
                    onChange={(e) => setNombreFamilia(e.target.value)}
                    className="w-full border border-[#DDDDDD] bg-white px-3.5 py-2.5 text-xs text-black outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555] mb-1">
                    Subfamilia Inicial (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Refrescos, Jugos, Enlatados..."
                    value={subfamiliaInicial}
                    onChange={(e) => setSubfamiliaInicial(e.target.value)}
                    className="w-full border border-[#DDDDDD] bg-white px-3.5 py-2.5 text-xs text-black outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555] mb-1">
                    Descripción (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Descripción breve de los productos que componen esta categoría..."
                    value={descripcionFamilia}
                    onChange={(e) => setDescripcionFamilia(e.target.value)}
                    className="w-full border border-[#DDDDDD] bg-white px-3.5 py-2 text-xs text-black outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="border-t border-[#EEEEEE] bg-[#FAFAFA] px-6 py-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateFamiliaModal(false)}
                  className="h-11 border border-[#DDDDDD] bg-white px-5 text-xs font-bold uppercase tracking-wider text-black hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 bg-black px-6 text-xs font-bold uppercase tracking-wider text-white hover:bg-[var(--primary)] transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  <span>Guardar Familia</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR SUBFAMILIA */}
      {subfamiliaModalOpen && (
        <div
          onClick={() => setSubfamiliaModalOpen(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative my-auto flex w-full max-w-lg flex-col border border-[#DDDDDD] bg-white shadow-2xl cursor-default overflow-hidden animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-[#EEEEEE] px-6 py-4 bg-[#FAFAFA]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center bg-black text-white">
                  <Tag size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-black">Nueva Subfamilia</h3>
                  <p className="text-xs text-[#777777]">
                    Subcategoría para organizar artículos dentro de una familia
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSubfamiliaModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center text-[#777777] hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => handleCreateSubfamilia(e, false)}>
              <div className="p-6 space-y-4">
                {/* Selector de Familia */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555] mb-1">
                    Familia a la que pertenece *
                  </label>
                  <select
                    value={selectedFamiliaParaSub}
                    onChange={(e) => setSelectedFamiliaParaSub(e.target.value)}
                    required
                    className="w-full border border-[#DDDDDD] bg-white px-3.5 py-2.5 text-xs font-semibold text-black outline-none focus:border-black cursor-pointer"
                  >
                    <option value="" disabled>-- Selecciona la familia --</option>
                    {familias.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nombre de la Subfamilia */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555] mb-1">
                    Nombre de la Subfamilia *
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Ej. Aguas minerales, Frituras de maíz, Harinas..."
                    value={nombreSubfamilia}
                    onChange={(e) => setNombreSubfamilia(e.target.value)}
                    className="w-full border border-[#DDDDDD] bg-white px-3.5 py-2.5 text-xs text-black outline-none focus:border-black"
                  />
                </div>

                {/* Descripción Opcional */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555] mb-1">
                    Descripción (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Detalles sobre esta subcategoría..."
                    value={descripcionSubfamilia}
                    onChange={(e) => setDescripcionSubfamilia(e.target.value)}
                    className="w-full border border-[#DDDDDD] bg-white px-3.5 py-2 text-xs text-black outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="border-t border-[#EEEEEE] bg-[#FAFAFA] px-6 py-4 flex flex-wrap items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSubfamiliaModalOpen(false)}
                  className="h-11 border border-[#DDDDDD] bg-white px-4 text-xs font-bold uppercase tracking-wider text-black hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={saving || !nombreSubfamilia.trim()}
                  onClick={(e) => handleCreateSubfamilia(e as any, true)}
                  className="h-11 border border-black bg-white px-4 text-xs font-bold uppercase tracking-wider text-black hover:bg-black hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  Guardar y Agregar Otra
                </button>
                <button
                  type="submit"
                  disabled={saving || !nombreSubfamilia.trim()}
                  className="h-11 bg-black px-5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[var(--primary)] transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  <span>Guardar Subfamilia</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN GENERAL DE FAMILIA */}
      <DeleteConfirmModal
        isOpen={Boolean(familiaToDelete)}
        onClose={() => setFamiliaToDelete(null)}
        onConfirm={handleDeleteFamilia}
        title="Eliminar Familia"
        subtitle="Catálogo y categorías"
        itemName={familiaToDelete?.nombre}
        itemDetails={
          familiaToDelete
            ? `${familiaToDelete._count?.articulos || 0} artículos · ${familiaToDelete.subfamilias?.length || 0} subfamilias`
            : undefined
        }
        warningMessage="¿Estás completamente seguro de que deseas eliminar esta familia? Los artículos existentes que pertenezcan a esta familia no serán eliminados, pero quedarán sin categoría asignada."
        confirmText="Eliminar Familia"
      />

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN DE SUBFAMILIA */}
      <DeleteConfirmModal
        isOpen={Boolean(subfamiliaToDelete)}
        onClose={() => setSubfamiliaToDelete(null)}
        onConfirm={handleDeleteSubfamilia}
        title="Eliminar Subfamilia"
        subtitle={`Familia: ${subfamiliaToDelete?.familiaNombre || ""}`}
        itemName={subfamiliaToDelete?.nombre}
        warningMessage="¿Estás seguro de que deseas eliminar esta subfamilia? Los artículos que la tenían asignada conservarán su familia principal pero quedarán sin esta subcategoría específica."
        confirmText="Eliminar Subfamilia"
      />
    </main>
  );
}