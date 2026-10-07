"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSidebar } from "@/context/SidebarContext";
import { useTheme } from "@/context/ThemeContext";
import { apiRequest } from "@/services/api";
import { getOrganizacionId, getUsuarioActual } from "@/services/auth";
import {
  Scale,
  Plus,
  Package,
  Search,
  CheckCircle2,
  Trash2,
  X,
  Layers,
  Printer,
  Loader2,
  Info,
} from "lucide-react";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";

type UnidadMedida = {
  id: string;
  organizacionId?: string | null;
  nombre: string;
  abreviatura: string;
  descripcion?: string | null;
  tipo: string;
  necesitaBascula: boolean;
  activo: boolean;
  createdAt?: string;
};

export default function UnidadesPage() {
  const { collapsed } = useSidebar();
  const { activePalette } = useTheme();

  const [unidades, setUnidades] = useState<UnidadMedida[]>([]);
  const [articulosCountByUnidad, setArticulosCountByUnidad] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [unidadToDelete, setUnidadToDelete] = useState<UnidadMedida | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    abreviatura: "",
    descripcion: "",
    tipo: "conteo",
    necesitaBascula: false,
  });

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadUnidadesYArticulos = async () => {
    const usuario = getUsuarioActual();
    let orgId = getOrganizacionId() || usuario?.organizacionId || usuario?.organizacion?.id;

    if (!orgId) {
      try {
        const orgs = await apiRequest<any[]>("/organizaciones");
        if (Array.isArray(orgs) && orgs.length > 0) {
          orgId = orgs[0].id;
        }
      } catch {}
    }

    setLoading(true);
    try {
      const urlUnidades = orgId ? `/articulos/unidades/${orgId}` : `/articulos/unidades`;
      const urlArticulos = orgId ? `/articulos/organizacion/${orgId}` : `/articulos`;

      const [unidadesRes, articulosRes] = await Promise.all([
        apiRequest<UnidadMedida[]>(urlUnidades).catch(() => []),
        apiRequest<any[]>(urlArticulos).catch(() => []),
      ]);

      setUnidades(Array.isArray(unidadesRes) ? unidadesRes : []);

      if (Array.isArray(articulosRes)) {
        const counts: Record<string, number> = {};
        for (const art of articulosRes) {
          const u = (art.unidad || "Pieza").toLowerCase().trim();
          counts[u] = (counts[u] || 0) + 1;
        }
        setArticulosCountByUnidad(counts);
      }
    } catch (err: any) {
      console.error("Error al cargar unidades:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnidadesYArticulos();
  }, []);

  const handleCreateUnidad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.abreviatura.trim()) {
      alert("El nombre y la abreviatura son obligatorios");
      return;
    }

    const usuario = getUsuarioActual();
    let orgId = getOrganizacionId() || usuario?.organizacionId || usuario?.organizacion?.id;

    if (!orgId) {
      try {
        const orgs = await apiRequest<any[]>("/organizaciones");
        if (Array.isArray(orgs) && orgs.length > 0) {
          orgId = orgs[0].id;
        }
      } catch {}
    }

    setSaving(true);
    try {
      const nueva = await apiRequest<UnidadMedida>("/articulos/unidades", {
        method: "POST",
        body: JSON.stringify({
          organizacionId: orgId,
          nombre: formData.nombre.trim(),
          abreviatura: formData.abreviatura.trim(),
          descripcion: formData.descripcion.trim() || undefined,
          tipo: formData.tipo,
          necesitaBascula: formData.necesitaBascula,
        }),
      });

      showToast(`Unidad "${nueva.nombre}" guardada con éxito`);
      setModalOpen(false);
      setFormData({
        nombre: "",
        abreviatura: "",
        descripcion: "",
        tipo: "conteo",
        necesitaBascula: false,
      });
      await loadUnidadesYArticulos();
    } catch (err: any) {
      alert(err.message || "Error al crear la unidad de medida");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUnidad = async () => {
    if (!unidadToDelete) return;
    try {
      await apiRequest(`/articulos/unidades/${unidadToDelete.id}`, {
        method: "DELETE",
      });
      showToast(`Unidad "${unidadToDelete.nombre}" eliminada correctamente`);
      setUnidades((prev) => prev.filter((u) => u.id !== unidadToDelete.id));
      setUnidadToDelete(null);
    } catch (err: any) {
      alert(err.message || "Error al eliminar la unidad");
    }
  };

  const filteredUnidades = unidades.filter(
    (u) =>
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.abreviatura.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.descripcion && u.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
                Catálogo / Configuración
              </p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-black">
                Unidades de Medida
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#777777]">
                Configura las unidades de comercialización y define qué artículos requieren pesaje en báscula para impresión de etiquetas.
              </p>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 h-11 bg-black px-5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[var(--primary)] transition-colors cursor-pointer shadow-xs"
            >
              <Plus size={16} />
              <span>+ Nueva Unidad</span>
            </button>
          </div>

          {/* Barra de Búsqueda */}
          <div className="mb-6 flex items-center gap-4 bg-white p-4 border border-[#DDDDDD] shadow-xs">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999]" />
              <input
                type="text"
                placeholder="Buscar unidad por nombre, abreviatura o tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#EEEEEE] pl-10 pr-4 py-2 text-xs text-black outline-none focus:border-black focus:bg-white transition-colors"
              />
            </div>
            <div className="text-xs font-bold text-[#777777] hidden sm:block">
              Total: {unidades.length} unidades registradas
            </div>
          </div>

          {/* Estado de Carga */}
          {loading ? (
            <div className="py-20 text-center border border-[#DDDDDD] bg-white">
              <Loader2 size={32} className="animate-spin text-black mx-auto mb-3" />
              <p className="text-xs text-[#777777]">Consultando unidades de medida...</p>
            </div>
          ) : filteredUnidades.length === 0 ? (
            <div className="border border-dashed border-[#CCCCCC] bg-white p-12 text-center">
              <Scale size={40} className="mx-auto text-[#999999] mb-3" />
              <h3 className="text-base font-bold text-black">No se encontraron unidades</h3>
              <p className="text-xs text-[#777777] mt-1 mb-5">
                Crea una nueva unidad de medida para comenzar a catalogar productos.
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 h-10 bg-black px-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-[var(--primary)] transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>Crear Unidad</span>
              </button>
            </div>
          ) : (
            /* Cuadrícula de Unidades */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredUnidades.map((u) => {
                const totalArticulos =
                  articulosCountByUnidad[u.nombre.toLowerCase()] ||
                  articulosCountByUnidad[u.abreviatura.toLowerCase()] ||
                  0;

                return (
                  <div
                    key={u.id}
                    className="group relative flex flex-col justify-between border border-[#E5E5E5] bg-white p-5 shadow-xs transition-all hover:border-black hover:shadow-md"
                  >
                    <div>
                      {/* Cabecera de la Tarjeta */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center bg-black text-white font-mono text-sm font-bold shadow-xs">
                            {u.abreviatura}
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-black">{u.nombre}</h3>
                            <span className="text-[11px] font-mono text-[#888888]">
                              Abrev: {u.abreviatura}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-gray-100 text-gray-700 border-gray-200">
                          {u.tipo}
                        </span>
                      </div>

                      {/* Badge Destacado de Báscula / Balanza */}
                      <div className="mb-3">
                        {u.necesitaBascula ? (
                          <div className="inline-flex items-center gap-1.5 rounded bg-amber-50 border border-amber-300 px-2.5 py-1 text-[11px] font-bold text-amber-900 shadow-2xs">
                            <Scale size={13} className="text-amber-700" />
                            <span>REQUIERE BÁSCULA</span>
                            <span className="text-[10px] font-normal text-amber-800">
                              (Imprime etiqueta con peso)
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 rounded bg-gray-50 border border-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                            <span>Venta unitaria directa</span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-[#666666] leading-relaxed line-clamp-2 mb-4">
                        {u.descripcion || "Unidad registrada en el catálogo de la organización."}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#EEEEEE] flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#555555]">
                        <Package size={14} className="text-[#888888]" />
                        <span>{totalArticulos} artículos vinculados</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setUnidadToDelete(u)}
                        className="text-[#999999] hover:text-[#DC2626] p-1 transition-colors cursor-pointer"
                        title="Eliminar unidad"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODAL NUEVA UNIDAD DE MEDIDA */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative my-auto flex w-full max-w-lg flex-col border border-[#DDDDDD] bg-white shadow-2xl cursor-default overflow-hidden animate-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#EEEEEE] px-6 py-4 bg-[#FAFAFA]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center bg-black text-white">
                  <Scale size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-black">Nueva Unidad de Medida</h3>
                  <p className="text-xs text-[#777777]">Registra una unidad para tu catálogo y punto de venta</p>
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

            {/* Formulario */}
            <form onSubmit={handleCreateUnidad}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555] mb-1">
                    Nombre de la Unidad *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Bulto, Cubeta, Garrafón, Kilo Especial..."
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full border border-[#DDDDDD] bg-white px-3.5 py-2.5 text-xs text-black outline-none focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555] mb-1">
                      Abreviatura / Símbolo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Blt, Cbt, Gar..."
                      value={formData.abreviatura}
                      onChange={(e) => setFormData({ ...formData, abreviatura: e.target.value })}
                      className="w-full border border-[#DDDDDD] bg-white px-3.5 py-2.5 text-xs text-black font-mono outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555] mb-1">
                      Tipo de Magnitud
                    </label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      className="w-full border border-[#DDDDDD] bg-white px-3.5 py-2.5 text-xs text-black outline-none focus:border-black"
                    >
                      <option value="conteo">Conteo / Unidades</option>
                      <option value="peso">Peso / Masa</option>
                      <option value="volumen">Volumen / Capacidad</option>
                      <option value="empaque">Empaque / Agrupación</option>
                      <option value="longitud">Longitud / Lineal</option>
                    </select>
                  </div>
                </div>

                {/* OPCIÓN: ¿NECESITA BÁSCULA? */}
                <div className="border border-[#E5E5E5] bg-[#FAFBFB] p-4 rounded-lg">
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
                          ¿Necesita Báscula? (Para productos pesables)
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-[#666666] leading-relaxed">
                        Habilita esta opción si los artículos que usen esta unidad deben pesarse en la balanza del punto de venta o imprimir etiquetas con código de barras de peso embebido.
                      </p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555] mb-1">
                    Descripción (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Detalles sobre presentación o equivalencia..."
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full border border-[#DDDDDD] bg-white px-3.5 py-2 text-xs text-black outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-[#EEEEEE] bg-[#FAFAFA] px-6 py-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
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
                  <span>Guardar Unidad</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE ELIMINACIÓN GENERAL */}
      <DeleteConfirmModal
        isOpen={Boolean(unidadToDelete)}
        onClose={() => setUnidadToDelete(null)}
        onConfirm={handleDeleteUnidad}
        title="Eliminar Unidad de Medida"
        subtitle={unidadToDelete ? `Abrev: ${unidadToDelete.abreviatura}` : undefined}
        itemName={unidadToDelete?.nombre}
        itemDetails={
          unidadToDelete
            ? `Tipo: ${unidadToDelete.tipo} · ${unidadToDelete.necesitaBascula ? "Requiere báscula" : "Venta directa"}`
            : undefined
        }
        warningMessage="¿Deseas eliminar esta unidad de medida? Los productos existentes mantendrán el nombre asignado."
        confirmText="Eliminar Unidad"
      />
    </main>
  );
}
