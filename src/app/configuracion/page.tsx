"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { COLOR_PALETTES, FONT_OPTIONS, BACKGROUND_TONES, useTheme } from "@/context/ThemeContext";
import { useSidebar } from "@/context/SidebarContext";
import {
  Check,
  Building2,
  Terminal as TerminalIcon,
  Plus,
  Loader2,
  Trash2,
  AlertTriangle,
  X,
  ShieldAlert,
  KeyRound,
  Users,
  FolderTree,
  Receipt,
  RotateCcw,
  Eye,
  EyeOff,
  Layers,
  Calculator,
  Percent,
  Palette,
  Type,
  Sparkles,
  LayoutGrid,
} from "lucide-react";
import SuscripcionesView from "@/components/suscripciones/SuscripcionesView";
import { apiRequest } from "@/services/api";
import { getOrganizacionId, getUsuarioActual } from "@/services/auth";
import { getConfiguracionFiscal, setConfiguracionFiscal } from "@/services/fiscal";

type MantenimientoTipo =
  | "productos"
  | "familias"
  | "clientes"
  | "ventas"
  | "reset_total";

export default function ConfiguracionPage() {
  const { collapsed } = useSidebar();
  const {
    activePalette,
    setPalette,
    customBg,
    setCustomBg,
    customFontId,
    setCustomFontId,
    resetToDefault,
    isSavingOrg,
    orgThemeStatus,
    organizacionNombre,
    saveCurrentThemeToOrg,
  } = useTheme();
  const [activeTab, setActiveTab] = useState("General");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Estados para Mantenimiento y Purga con Clave de Administrador
  const [modalMantenimiento, setModalMantenimiento] = useState(false);
  const [tipoMantenimiento, setTipoMantenimiento] = useState<MantenimientoTipo | null>(null);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmWordInput, setConfirmWordInput] = useState("");
  const [executingMantenimiento, setExecutingMantenimiento] = useState(false);
  const [modalErrorMsg, setModalErrorMsg] = useState<string | null>(null);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | null>(null);

  // Datos reales de la Organización
  const [orgForm, setOrgForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
    rfc: "",
    razonSocial: "",
    codigoPostal: "",
    regimenFiscal: "601",
    ivaActivo: true,
    porcentajeIva: 16,
  });

  // Preferencias
  const [preferencias, setPreferencias] = useState({
    ventasSinCliente: true,
    solicitarCliente: false,
    impuestosAuto: true,
    bloquearTerminalesInactivas: true,
  });

  const loadData = useCallback(async () => {
    const user = getUsuarioActual();
    const orgId = getOrganizacionId() || user?.organizacionId;

    if (!orgId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const orgRes = await apiRequest<any>(`/organizaciones/${orgId}`).catch(() => null);

      if (orgRes) {
        const ivaActivo = orgRes.ivaActivo !== undefined ? Boolean(orgRes.ivaActivo) : true;
        const porcentajeIva = orgRes.porcentajeIva !== undefined ? Number(orgRes.porcentajeIva) : 16;
        const regimenFiscal = orgRes.regimenFiscal || "601";
        const rfc = orgRes.rfc || "";
        const razonSocial = orgRes.nombre || "";

        setOrgForm({
          nombre: orgRes.nombre || "",
          telefono: orgRes.telefono || "",
          email: orgRes.email || "",
          direccion: orgRes.direccion || "",
          rfc: rfc,
          razonSocial: razonSocial,
          codigoPostal: "",
          regimenFiscal: regimenFiscal,
          ivaActivo: ivaActivo,
          porcentajeIva: porcentajeIva,
        });

        // Sincronizar en caché offline local
        setConfiguracionFiscal(orgId, {
          rfc,
          razonSocial,
          regimenFiscal,
          ivaActivo,
          porcentajeIva,
        });
      } else {
        // Cargar desde cache offline si el backend está desconectado
        const offlineFiscal = getConfiguracionFiscal(orgId);
        setOrgForm((prev) => ({
          ...prev,
          rfc: offlineFiscal.rfc || prev.rfc,
          razonSocial: offlineFiscal.razonSocial || prev.razonSocial,
          regimenFiscal: offlineFiscal.regimenFiscal || prev.regimenFiscal,
          ivaActivo: offlineFiscal.ivaActivo,
          porcentajeIva: offlineFiscal.porcentajeIva,
        }));
      }
    } catch (err) {
      console.error("Error al cargar configuración:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = getUsuarioActual();
    const orgId = getOrganizacionId() || user?.organizacionId;
    if (!orgId) return;

    setSaving(true);
    try {
      await apiRequest(`/organizaciones/${orgId}`, {
        method: "PUT",
        body: JSON.stringify({
          nombre: orgForm.nombre,
          telefono: orgForm.telefono,
          email: orgForm.email,
          direccion: orgForm.direccion,
          rfc: orgForm.rfc,
        }),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error al actualizar organización:", err);
      alert("Error al guardar cambios de la organización.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFiscal = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = getUsuarioActual();
    const orgId = getOrganizacionId() || user?.organizacionId;
    if (!orgId) return;

    setSaving(true);
    try {
      // 1. Guardar de inmediato en cache local offline (Offline-first)
      setConfiguracionFiscal(orgId, {
        rfc: orgForm.rfc,
        razonSocial: orgForm.razonSocial,
        regimenFiscal: orgForm.regimenFiscal,
        ivaActivo: orgForm.ivaActivo,
        porcentajeIva: Number(orgForm.porcentajeIva),
      });

      // 2. Persistir en backend
      await apiRequest(`/organizaciones/${orgId}`, {
        method: "PUT",
        body: JSON.stringify({
          rfc: orgForm.rfc,
          regimenFiscal: orgForm.regimenFiscal,
          ivaActivo: orgForm.ivaActivo,
          porcentajeIva: Number(orgForm.porcentajeIva),
        }),
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.warn("Backend no disponible al guardar datos fiscales, guardado local offline activo:", err);
      // Mantener confirmación de guardado local aunque la red esté caída
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const MANTENIMIENTO_ACTIONS: Record<
    MantenimientoTipo,
    {
      titulo: string;
      subtitulo: string;
      descripcion: string;
      endpoint: string;
      impactos: string[];
      btnText: string;
      palabraConfirmar: string;
    }
  > = {
    productos: {
      titulo: "Eliminar Todos los Productos",
      subtitulo: "VACIADO TOTAL DEL CATÁLOGO DE ARTÍCULOS",
      descripcion:
        "Elimina permanentemente todos los artículos, variantes, precios y existencias en inventario de todas las sucursales. La memoria caché offline de productos se purgará de inmediato.",
      endpoint: "/mantenimiento/eliminar-productos",
      impactos: [
        "Se eliminarán todos los artículos registrados en el catálogo.",
        "Se vaciarán las existencias de inventario en todas las sucursales.",
        "Se purgará la caché local offline del Punto de Venta (POS).",
      ],
      btnText: "Eliminar todos los productos",
      palabraConfirmar: "ELIMINAR",
    },
    familias: {
      titulo: "Eliminar Subfamilias y Familias",
      subtitulo: "CATEGORIZACIÓN Y AGRUPACIONES DE PRODUCTOS",
      descripcion:
        "Elimina todas las familias y subfamilias creadas para organizar el catálogo. Los artículos existentes permanecerán intactos pero quedarán clasificados sin categoría.",
      endpoint: "/mantenimiento/eliminar-familias",
      impactos: [
        "Se eliminarán todas las familias principales de la organización.",
        "Se eliminarán todas las subfamilias asociadas.",
        "Los artículos del catálogo permanecerán intactos sin categoría.",
      ],
      btnText: "Eliminar familias y subfamilias",
      palabraConfirmar: "ELIMINAR",
    },
    clientes: {
      titulo: "Eliminar Directorio de Clientes",
      subtitulo: "BASE DE DATOS Y CARTERA DE CLIENTES",
      descripcion:
        "Elimina todos los clientes registrados, sus historiales de contacto, saldos y puntos acumulados. Las ventas existentes conservarán sus importes pero quedarán desasociadas del cliente.",
      endpoint: "/mantenimiento/eliminar-clientes",
      impactos: [
        "Se eliminarán todos los clientes del directorio de la organización.",
        "Se perderán saldos a favor y puntos de fidelidad acumulados.",
        "Las ventas registradas previamente conservarán sus tickets como venta general.",
      ],
      btnText: "Eliminar todos los clientes",
      palabraConfirmar: "ELIMINAR",
    },
    ventas: {
      titulo: "Eliminar Ventas, Tickets e Historial",
      subtitulo: "HISTORIAL DE TRANSACCIONES Y REGISTRO DE VENTAS",
      descripcion:
        "Elimina de forma irreversible todas las ventas efectuadas, los detalles de tickets y comprobantes, y los movimientos de stock generados por ventas. También purga ventas offline locales pendientes.",
      endpoint: "/mantenimiento/eliminar-ventas",
      impactos: [
        "Se eliminarán todas las ventas y sus detalles de cobro.",
        "Se eliminará el historial de tickets emitidos y comprobantes.",
        "Se purgará la cola de ventas offline locales en navegadores.",
        "Los balances y cortes de caja se reiniciarán a cero.",
      ],
      btnText: "Eliminar historial de ventas y tickets",
      palabraConfirmar: "ELIMINAR",
    },
    reset_total: {
      titulo: "Limpieza Total del Sistema (Reset Completo)",
      subtitulo: "RESTABLECIMIENTO MAESTRO DE LA ORGANIZACIÓN",
      descripcion:
        "Purga absolutamente todos los productos, existencias, familias, subfamilias, clientes y el historial completo de ventas y tickets. Deja la tienda totalmente limpia como el primer día, preservando únicamente sucursales, terminales y usuarios.",
      endpoint: "/mantenimiento/reset-total",
      impactos: [
        "Se eliminarán todos los artículos e inventarios de sucursales.",
        "Se eliminarán todas las familias y subfamilias.",
        "Se eliminarán todos los clientes registrados.",
        "Se eliminarán todas las ventas, tickets e historial comercial.",
        "Se limpiarán todas las memorias locales y cachés offline del POS.",
      ],
      btnText: "Ejecutar limpieza total del sistema",
      palabraConfirmar: "RESET TOTAL",
    },
  };

  const closeMantenimientoModal = useCallback(() => {
    if (executingMantenimiento) return;
    setModalMantenimiento(false);
    setTipoMantenimiento(null);
    setConfirmWordInput("");
    setAdminPasswordInput("");
    setShowPassword(false);
    setModalErrorMsg(null);
  }, [executingMantenimiento]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modalMantenimiento && !executingMantenimiento) {
        closeMantenimientoModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalMantenimiento, executingMantenimiento, closeMantenimientoModal]);

  const handleOpenMantenimientoModal = (tipo: MantenimientoTipo) => {
    setTipoMantenimiento(tipo);
    setConfirmWordInput("");
    setAdminPasswordInput("");
    setShowPassword(false);
    setModalErrorMsg(null);
    setModalMantenimiento(true);
  };

  const handleExecuteMantenimiento = async () => {
    if (!tipoMantenimiento) return;
    const config = MANTENIMIENTO_ACTIONS[tipoMantenimiento];
    if (!config) return;

    if (confirmWordInput.trim().toUpperCase() !== config.palabraConfirmar) {
      setModalErrorMsg(`Debes escribir exactamente '${config.palabraConfirmar}' para confirmar.`);
      return;
    }

    if (!adminPasswordInput.trim()) {
      setModalErrorMsg("Debes ingresar la clave del administrador para autorizar la acción.");
      return;
    }

    const user = getUsuarioActual();
    const orgId = getOrganizacionId() || user?.organizacionId;

    if (!orgId) {
      setModalErrorMsg("No se encontró una organización activa en la sesión.");
      return;
    }

    setExecutingMantenimiento(true);
    setModalErrorMsg(null);
    setDeleteErrorMsg(null);
    setDeleteSuccessMsg(null);

    try {
      const res = await apiRequest<any>(config.endpoint, {
        method: "POST",
        body: JSON.stringify({
          organizacionId: orgId,
          claveAdmin: adminPasswordInput.trim(),
          usuarioId: user?.id,
        }),
      });

      // Limpieza de cachés offline locales según corresponda
      if (typeof window !== "undefined") {
        if (tipoMantenimiento === "productos" || tipoMantenimiento === "reset_total") {
          localStorage.removeItem(`inagerlis_offline_products_${orgId}`);
          localStorage.removeItem(`inagerlis_offline_products_${orgId}_updated`);
        }
        if (tipoMantenimiento === "ventas" || tipoMantenimiento === "reset_total") {
          localStorage.removeItem("inagerlis_offline_sales");
          localStorage.removeItem("inagerlis_offline_sales_history");
        }
      }

      setDeleteSuccessMsg(res?.mensaje || "Operación de mantenimiento completada exitosamente.");
      setModalMantenimiento(false);
      setAdminPasswordInput("");
      setConfirmWordInput("");
      setTipoMantenimiento(null);
      setTimeout(() => setDeleteSuccessMsg(null), 8000);
    } catch (err: any) {
      console.error("Error en mantenimiento:", err);
      setModalErrorMsg(err?.message || "Clave de administrador incorrecta o error al procesar.");
    } finally {
      setExecutingMantenimiento(false);
    }
  };

  const tabs = [
    "General",
    "Fiscal",
    "Preferencias",
    "Mantenimiento",
    "Suscripciones",
  ];

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Sidebar />

      <div className={`min-h-screen transition-all duration-300 ${collapsed ? "ml-[80px]" : "ml-[250px]"}`}>
        <Header />

        <div className="p-10">
          {/* Encabezado */}
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
              Administración
            </p>

            <h1 className="mt-2 text-3xl font-bold text-black">
              Configuración de la tienda
            </h1>

            <p className="mt-2 text-sm text-[#777777]">
              Administra la información general, fiscal, preferencias del sistema y mantenimiento de tu organización.
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-8 flex border-b border-[#DCDCDC]">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  border-b-2 px-6 py-4
                  text-sm font-semibold
                  transition-colors
                  ${
                    activeTab === tab
                      ? "border-[#D8A814] text-[#D8A814]"
                      : "border-transparent text-[#777777] hover:text-black"
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Notificaciones globales */}
          {deleteSuccessMsg && (
            <div className="mb-8 flex items-center justify-between border border-emerald-300 bg-emerald-50 px-6 py-4 text-emerald-800">
              <div className="flex items-center gap-3">
                <Check size={18} className="text-emerald-600 shrink-0" />
                <span className="text-sm font-semibold">{deleteSuccessMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setDeleteSuccessMsg(null)}
                className="text-emerald-700 hover:text-emerald-900"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {deleteErrorMsg && (
            <div className="mb-8 flex items-center justify-between border border-red-300 bg-red-50 px-6 py-4 text-red-800">
              <div className="flex items-center gap-3">
                <AlertTriangle size={18} className="text-red-600 shrink-0" />
                <span className="text-sm font-semibold">{deleteErrorMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setDeleteErrorMsg(null)}
                className="text-red-700 hover:text-red-900"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* GENERAL */}
          {activeTab === "General" && (
            <form onSubmit={handleSaveGeneral} className="border border-[#E2E2E2] bg-white">
              <div className="border-b border-[#E5E5E5] px-8 py-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                    Información
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-black">
                    Datos generales
                  </h2>
                </div>

                {saveSuccess && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 border border-emerald-200">
                    ✓ Cambios guardados exitosamente
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-8 p-8 xl:grid-cols-[220px_1fr]">
                {/* Logo */}
                <div>
                  <p className="mb-3 text-sm font-bold text-black">
                    Logo de la tienda
                  </p>

                  <div className="flex h-40 w-40 items-center justify-center border border-[#D8A814] bg-[#FAFAFA]">
                    <span className="text-4xl font-bold text-[#D8A814]">
                      {orgForm.nombre ? orgForm.nombre.slice(0, 3).toUpperCase() : "POS"}
                    </span>
                  </div>
                </div>

                {/* Campos */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-bold text-black">
                      Nombre comercial
                    </label>

                    <input
                      value={orgForm.nombre}
                      onChange={(e) => setOrgForm({ ...orgForm, nombre: e.target.value })}
                      placeholder="Nombre de tu negocio o tienda"
                      className="h-12 w-full border border-[#D8A814] px-4 text-black outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-black">
                      Teléfono
                    </label>

                    <input
                      value={orgForm.telefono}
                      onChange={(e) => setOrgForm({ ...orgForm, telefono: e.target.value })}
                      placeholder="Teléfono de contacto"
                      className="h-12 w-full border border-[#D8A814] px-4 text-black outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-black">
                      Correo
                    </label>

                    <input
                      type="email"
                      value={orgForm.email}
                      onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })}
                      placeholder="correo@ejemplo.com"
                      className="h-12 w-full border border-[#D8A814] px-4 text-black outline-none focus:border-black"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-bold text-black">
                      Dirección principal
                    </label>

                    <input
                      value={orgForm.direccion}
                      onChange={(e) => setOrgForm({ ...orgForm, direccion: e.target.value })}
                      placeholder="Calle, número, colonia, ciudad"
                      className="h-12 w-full border border-[#D8A814] px-4 text-black outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t border-[#E5E5E5] px-8 py-5">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 h-12 bg-[#D8A814] px-7 font-bold text-white hover:bg-black transition-colors disabled:opacity-50"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  Guardar cambios
                </button>
              </div>
            </form>
          )}

          {/* FISCAL */}
          {activeTab === "Fiscal" && (
            <form onSubmit={handleSaveFiscal} className="border border-[#E2E2E2] bg-white">
              <div className="border-b border-[#E5E5E5] px-8 py-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                    Datos Fiscales y Facturación
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-black">
                    Configuración Fiscal y Régimen de IVA
                  </h2>
                  <p className="mt-1 text-xs text-[#777777]">
                    Administra tu razón social, RFC, régimen tributario y el cálculo del IVA aplicable a ventas en caja y tickets.
                  </p>
                </div>

                {saveSuccess && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 border border-emerald-200">
                    ✓ Datos fiscales guardados exitosamente
                  </span>
                )}
              </div>

              <div className="p-8 space-y-8">
                {/* 1. Identificación Fiscal */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-black mb-4">
                    1. Identificación y Registro Fiscal (SAT)
                  </h3>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black">
                        Razón social
                      </label>
                      <input
                        value={orgForm.razonSocial || orgForm.nombre}
                        onChange={(e) => setOrgForm({ ...orgForm, razonSocial: e.target.value })}
                        placeholder="Razón social registrada"
                        className="h-12 w-full border border-[#D8A814] px-4 text-sm text-black outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black">
                        RFC (Registro Federal de Contribuyentes)
                      </label>
                      <input
                        value={orgForm.rfc}
                        onChange={(e) => setOrgForm({ ...orgForm, rfc: e.target.value.toUpperCase() })}
                        placeholder="XAXX010101000"
                        maxLength={13}
                        className="h-12 w-full border border-[#D8A814] px-4 text-sm uppercase font-mono text-black outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black">
                        Régimen Fiscal
                      </label>
                      <select
                        value={orgForm.regimenFiscal}
                        onChange={(e) => setOrgForm({ ...orgForm, regimenFiscal: e.target.value })}
                        className="h-12 w-full border border-[#D8A814] px-4 text-xs font-semibold text-black outline-none focus:border-black bg-white cursor-pointer"
                      >
                        <option value="601">601 - General de Ley Personas Morales</option>
                        <option value="612">612 - Personas Físicas con Actividades Empresariales</option>
                        <option value="621">621 - Incorporación Fiscal (RIF)</option>
                        <option value="626">626 - Régimen Simplificado de Confianza (RESICO)</option>
                        <option value="605">605 - Sueldos y Salarios</option>
                        <option value="616">616 - Sin obligaciones fiscales</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Control del IVA */}
                <div className="border-t border-[#E5E5E5] pt-8">
                  <div className="flex items-center justify-between pb-4 border-b border-[#EEEEEE]">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-black">
                        2. Control y Cálculo del Impuesto al Valor Agregado (IVA)
                      </h3>
                      <p className="mt-1 text-xs text-[#777777]">
                        Activa o desactiva el IVA para tus ventas y ajusta el porcentaje aplicable según tu régimen fiscal o zona geográfica.
                      </p>
                    </div>

                    {/* Toggle rectangular estricto */}
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold uppercase tracking-wider ${orgForm.ivaActivo ? "text-emerald-700" : "text-[#777777]"}`}>
                        {orgForm.ivaActivo ? "IVA Activo" : "IVA Desactivado"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setOrgForm({ ...orgForm, ivaActivo: !orgForm.ivaActivo })}
                        className={`relative h-8 w-14 transition-colors ${orgForm.ivaActivo ? "bg-[#D8A814]" : "bg-[#CCCCCC]"}`}
                      >
                        <span className={`absolute top-1 h-6 w-6 bg-white transition-all ${orgForm.ivaActivo ? "left-7" : "left-1"}`} />
                      </button>
                    </div>
                  </div>

                  {/* Configuración de Porcentaje */}
                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-black mb-3">
                        Tasa o porcentaje de IVA aplicable
                      </label>

                      {/* Botones de selección rápida (bordes rectangulares) */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {[
                          { label: "16% General", value: 16 },
                          { label: "8% Frontera", value: 8 },
                          { label: "0% Tasa Cero", value: 0 },
                        ].map((tasa) => {
                          const isSelected = orgForm.ivaActivo && Number(orgForm.porcentajeIva) === tasa.value;
                          return (
                            <button
                              key={tasa.value}
                              type="button"
                              onClick={() => {
                                setOrgForm({
                                  ...orgForm,
                                  ivaActivo: true,
                                  porcentajeIva: tasa.value,
                                });
                              }}
                              className={`h-11 px-3 text-xs font-bold uppercase tracking-wider border transition-colors ${
                                isSelected
                                  ? "border-black bg-black text-white"
                                  : "border-[#DCDCDC] bg-white text-black hover:border-[#999999]"
                              }`}
                            >
                              {tasa.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Entrada numérica para porcentaje personalizado */}
                      <div>
                        <label className="block text-[11px] font-semibold text-[#555555] mb-1.5 uppercase tracking-wider">
                          Porcentaje exacto de IVA (%)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            disabled={!orgForm.ivaActivo}
                            value={orgForm.porcentajeIva}
                            onChange={(e) =>
                              setOrgForm({
                                ...orgForm,
                                porcentajeIva: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)),
                              })
                            }
                            className="h-12 w-full border border-[#D8A814] pl-4 pr-10 text-base font-bold font-mono text-black outline-none focus:border-black disabled:bg-[#F2F2F2] disabled:border-[#DCDCDC] disabled:text-[#888888]"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#777777]">
                            %
                          </span>
                        </div>
                        <p className="mt-1.5 text-[11px] text-[#777777]">
                          {orgForm.ivaActivo
                            ? `Se aplicará el ${orgForm.porcentajeIva}% sobre el subtotal neto de cada venta en POS.`
                            : "Al estar desactivado, las ventas no incluirán desglose de IVA (0.00%)."}
                        </p>
                      </div>
                    </div>

                    {/* Tarjeta de Simulación en Tiempo Real */}
                    <div className="border border-[#E5E5E5] bg-[#FAFAFA] p-6">
                      <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
                        <div className="flex items-center gap-2">
                          <Calculator size={16} className="text-[#D8A814]" />
                          <span className="text-xs font-bold uppercase tracking-wider text-black">
                            Simulación en Punto de Venta
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${
                          orgForm.ivaActivo
                            ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                            : "border-gray-300 bg-gray-100 text-gray-700"
                        }`}>
                          {orgForm.ivaActivo ? `IVA ${orgForm.porcentajeIva}%` : "EXENTO"}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2 text-xs">
                        <div className="flex justify-between text-[#555555]">
                          <span>Subtotal de prueba:</span>
                          <span className="font-mono font-semibold">$1,000.00 MXN</span>
                        </div>
                        <div className="flex justify-between text-[#555555]">
                          <span>
                            IVA calculado ({orgForm.ivaActivo ? `${orgForm.porcentajeIva}%` : "Desactivado"}):
                          </span>
                          <span className="font-mono font-semibold">
                            ${orgForm.ivaActivo ? ((1000 * Number(orgForm.porcentajeIva)) / 100).toFixed(2) : "0.00"} MXN
                          </span>
                        </div>
                        <div className="pt-2 border-t border-[#E5E5E5] flex justify-between items-center text-sm font-bold text-black">
                          <span>Total al cliente:</span>
                          <span className="font-mono text-base text-[#D8A814]">
                            ${orgForm.ivaActivo ? (1000 + (1000 * Number(orgForm.porcentajeIva)) / 100).toFixed(2) : "1,000.00"} MXN
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 border border-[#EEEEEE] bg-white p-3 text-[11px] text-[#666666]">
                        <strong className="text-black font-semibold">Nota:</strong> Este cambio se sincroniza automáticamente con el Punto de Venta y se almacena en la caché offline para mantener la venta aún sin conexión.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t border-[#E5E5E5] px-8 py-5">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 h-12 bg-[#D8A814] px-7 font-bold text-white hover:bg-black transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  Guardar datos fiscales
                </button>
              </div>
            </form>
          )}

          {/* PREFERENCIAS */}
          {activeTab === "Preferencias" && (
            <div className="space-y-6">
              {/* SECCIÓN DE TEMAS Y PERSONALIZACIÓN DE LA ORGANIZACIÓN */}
              <section className="border border-[#E2E2E2] bg-white p-8 space-y-8">
                {/* Encabezado y Acción de Guardado en la Organización */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F0F0F0] pb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <Palette size={16} className="text-[#D8A814]" />
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                        Personalización Visual de la Organización
                      </p>
                    </div>

                    <h2 className="mt-1 text-2xl font-bold text-black">
                      Gama de Colores e Identidad del Sistema
                    </h2>
                    <p className="mt-1 text-sm text-[#777777]">
                      Personaliza los colores, estilo de letra y tono de fondo. Esta configuración se almacena en la base de datos de tu Organización y se sincroniza automáticamente para todas sus sucursales, terminales y usuarios.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => saveCurrentThemeToOrg()}
                      disabled={isSavingOrg}
                      className="inline-flex items-center gap-2 border border-black bg-black px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
                      title="Guardar preferencias en la base de datos de la Organización"
                    >
                      {isSavingOrg ? (
                        <>
                          <Loader2 size={13} className="animate-spin text-[#D8A814]" />
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <>
                          <Check size={13} className="text-[#D8A814]" />
                          <span>Guardar en Organización</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={resetToDefault}
                      className="inline-flex items-center gap-2 border border-[#CCCCCC] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:border-black hover:bg-[#FAFAFA] transition-colors cursor-pointer"
                      title="Restablecer tema oficial Inagerlis Gold"
                    >
                      <RotateCcw size={13} className="text-[#D8A814]" />
                      <span>Restaurar Inagerlis</span>
                    </button>
                  </div>
                </div>

                {/* Barra de Estado de Sincronización con la Organización */}
                <div className="flex flex-wrap items-center justify-between gap-3 border border-[#E5E5E5] bg-[#FAFAFA] px-4 py-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold uppercase tracking-wider text-[#777777] text-[10px]">
                      Organización:
                    </span>
                    <span className="font-bold text-black font-mono">
                      {organizacionNombre || "Empresa Principal"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {orgThemeStatus === "saving" && (
                      <span className="flex items-center gap-1.5 text-amber-700 font-semibold text-[11px]">
                        <Loader2 size={12} className="animate-spin" />
                        Sincronizando con la base de datos...
                      </span>
                    )}
                    {orgThemeStatus === "saved" && (
                      <span className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
                        <Check size={13} className="text-emerald-600 stroke-[3]" />
                        Guardado en la base de datos de la Organización
                      </span>
                    )}
                    {orgThemeStatus === "offline" && (
                      <span className="flex items-center gap-1.5 text-amber-800 font-semibold text-[11px]">
                        ⚡ Guardado localmente (se sincronizará automáticamente al conectar)
                      </span>
                    )}
                    {orgThemeStatus === "idle" && (
                      <span className="text-[#777777] text-[11px]">
                        Los cambios seleccionados se guardan automáticamente para tu organización.
                      </span>
                    )}
                  </div>
                </div>

                {/* 1. Gama de Colores e Identidad (Diseño de tarjetas clásico) */}
                <div>
                  <div className="mb-4">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-black">
                      1. Gama de Colores e Identidad del Sistema ({COLOR_PALETTES.length} Opciones)
                    </p>
                    <p className="text-xs text-[#777777] mt-0.5">
                      Selecciona la paleta de color principal que adaptará automáticamente el color del sistema entero (CRM + Punto de Venta).
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                    {COLOR_PALETTES.map((p) => {
                      const isSelected = activePalette.id === p.id;

                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPalette(p.id)}
                          className={`group relative flex flex-col items-center justify-between p-4 border text-center transition-all cursor-pointer ${
                            isSelected
                              ? "border-2 border-black bg-white shadow-md ring-2 ring-black/10"
                              : "border-[#EEEEEE] bg-[#FAFAFA] hover:border-[#CCCCCC] hover:bg-white"
                          }`}
                        >
                          <div className="w-full border border-[#E5E5E5] overflow-hidden mb-3">
                            <div
                              className="h-4 w-full flex items-center justify-end px-1"
                              style={{ backgroundColor: p.darkBg }}
                            >
                              <span className="h-1.5 w-1.5" style={{ backgroundColor: p.hex }} />
                            </div>
                            <div
                              className="h-7 w-full flex items-center justify-center p-1"
                              style={{ backgroundColor: p.light }}
                            >
                              <div
                                className="flex h-5 w-5 items-center justify-center text-white font-bold text-[10px] shadow-sm"
                                style={{ backgroundColor: p.hex }}
                              >
                                {isSelected && <Check size={12} />}
                              </div>
                            </div>
                          </div>

                          <p className="text-xs font-bold text-black">{p.name}</p>
                          <span className="mt-1 text-[10px] font-mono text-[#777777] uppercase">{p.hex}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Selector de Tono de Fondo Global (Mismo diseño de tarjetas) */}
                <div className="pt-6 border-t border-[#F0F0F0]">
                  <div className="mb-4">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-black">
                      2. Tono de Fondo Global de Pantallas ({BACKGROUND_TONES.length} Tonos)
                    </p>
                    <p className="text-xs text-[#777777] mt-0.5">
                      Modifica el color de fondo general sobre el que se despliegan tus módulos y tarjetas (afecta a todo el CRM y POS).
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-7">
                    {BACKGROUND_TONES.map((bg) => {
                      const isSelected = customBg.toLowerCase() === bg.hex.toLowerCase();

                      return (
                        <button
                          key={bg.id}
                          type="button"
                          onClick={() => setCustomBg(bg.hex)}
                          className={`group relative flex flex-col items-center justify-between p-4 border text-center transition-all cursor-pointer ${
                            isSelected
                              ? "border-2 border-black bg-white shadow-md ring-2 ring-black/10"
                              : "border-[#EEEEEE] bg-[#FAFAFA] hover:border-[#CCCCCC] hover:bg-white"
                          }`}
                        >
                          <div className="w-full border border-[#E5E5E5] overflow-hidden mb-3">
                            <div
                              className="h-4 w-full flex items-center justify-end px-1"
                              style={{ backgroundColor: "#0F172A" }}
                            >
                              <span className="h-1.5 w-1.5" style={{ backgroundColor: activePalette.hex }} />
                            </div>
                            <div
                              className="h-7 w-full flex items-center justify-center p-1"
                              style={{ backgroundColor: bg.hex }}
                            >
                              <div
                                className="flex h-5 w-5 items-center justify-center text-white font-bold text-[10px] shadow-sm"
                                style={{ backgroundColor: activePalette.hex }}
                              >
                                {isSelected && <Check size={12} />}
                              </div>
                            </div>
                          </div>

                          <p className="text-xs font-bold text-black">{bg.name}</p>
                          <span className="mt-1 text-[10px] font-mono text-[#777777] uppercase">{bg.hex}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Selector de Tipografía Global (Mismo diseño de tarjetas) */}
                <div className="pt-6 border-t border-[#F0F0F0]">
                  <div className="mb-4">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-black">
                      3. Estilo de Letras y Tipografía Global ({FONT_OPTIONS.length} Familias)
                    </p>
                    <p className="text-xs text-[#777777] mt-0.5">
                      Define la fuente tipográfica con la que se mostrarán los textos, números y títulos en toda la aplicación.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                    {FONT_OPTIONS.map((f) => {
                      const isSelected = customFontId === f.id;

                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setCustomFontId(f.id)}
                          className={`group relative flex flex-col items-center justify-between p-4 border text-center transition-all cursor-pointer ${
                            isSelected
                              ? "border-2 border-black bg-white shadow-md ring-2 ring-black/10"
                              : "border-[#EEEEEE] bg-[#FAFAFA] hover:border-[#CCCCCC] hover:bg-white"
                          }`}
                        >
                          <div className="w-full border border-[#E5E5E5] overflow-hidden mb-3">
                            <div
                              className="h-4 w-full flex items-center justify-end px-1"
                              style={{ backgroundColor: "#050505" }}
                            >
                              <span className="h-1.5 w-1.5" style={{ backgroundColor: activePalette.hex }} />
                            </div>
                            <div
                              className="h-7 w-full flex items-center justify-center p-1 bg-white"
                              style={{ fontFamily: f.family }}
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-black">Aa 123</span>
                                {isSelected && (
                                  <div
                                    className="flex h-4 w-4 items-center justify-center text-white text-[9px] font-bold shadow-sm"
                                    style={{ backgroundColor: activePalette.hex }}
                                  >
                                    <Check size={10} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <p className="text-xs font-bold text-black">{f.name}</p>
                          <span className="mt-1 text-[10px] font-mono text-[#777777] uppercase">{f.category}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section className="border border-[#E2E2E2] bg-white">
                <div className="border-b border-[#E5E5E5] px-8 py-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                    Sistema
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-black">
                    Preferencias de Operación
                  </h2>
                </div>

                <div className="divide-y divide-[#EEEEEE]">
                  <div className="flex items-center justify-between px-8 py-6">
                    <div>
                      <p className="font-bold text-black">Permitir ventas a público en general sin registrar cliente</p>
                      <p className="mt-1 text-sm text-[#777777]">Permite cobrar directamente en el POS sin obligar a seleccionar un cliente.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreferencias({ ...preferencias, ventasSinCliente: !preferencias.ventasSinCliente })}
                      className={`relative h-7 w-12 transition-colors ${preferencias.ventasSinCliente ? "bg-[#D8A814]" : "bg-[#CCCCCC]"}`}
                    >
                      <span className={`absolute top-1 h-5 w-5 bg-white transition-all ${preferencias.ventasSinCliente ? "left-6" : "left-1"}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between px-8 py-6">
                    <div>
                      <p className="font-bold text-black">Aplicar desglose de impuestos automáticamente</p>
                      <p className="mt-1 text-sm text-[#777777]">Calcula IVA sobre el total de tickets y artículos en caja.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreferencias({ ...preferencias, impuestosAuto: !preferencias.impuestosAuto })}
                      className={`relative h-7 w-12 transition-colors ${preferencias.impuestosAuto ? "bg-[#D8A814]" : "bg-[#CCCCCC]"}`}
                    >
                      <span className={`absolute top-1 h-5 w-5 bg-white transition-all ${preferencias.impuestosAuto ? "left-6" : "left-1"}`} />
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* MANTENIMIENTO */}
          {activeTab === "Mantenimiento" && (
            <div className="space-y-6">
              {/* Encabezado Mantenimiento */}
              <section className="border border-[#E2E2E2] bg-white p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center border border-[#D8A814] bg-[#FFFBF0] text-[#D8A814]">
                    <ShieldAlert size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
                      Control Administrativo y Purga
                    </p>
                    <h2 className="mt-0.5 text-xl font-bold text-black">
                      Mantenimiento y Depuración del Sistema
                    </h2>
                  </div>
                </div>
                <p className="mt-3 text-sm text-[#777777] max-w-3xl leading-relaxed">
                  Herramientas seguras para reiniciar catálogos, vaciar bases de datos y limpiar el sistema. Por seguridad estricta, cada una de estas operaciones <strong className="text-black font-semibold">requiere obligatoriamente la clave del administrador</strong> para ser ejecutada.
                </p>
              </section>

              {/* Grid de Acciones de Depuración */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Familias y Subfamilias */}
                <div className="border border-[#E2E2E2] bg-white p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-[#EEEEEE]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center border border-[#E0E0E0] bg-[#FAFAFA] text-black">
                          <FolderTree size={18} />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#777777]">
                            Categorías
                          </p>
                          <h3 className="text-sm font-bold text-black">
                            Familias y Subfamilias
                          </h3>
                        </div>
                      </div>
                      <span className="border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                        Clave Admin
                      </span>
                    </div>

                    <p className="mt-4 text-xs text-[#666666] leading-relaxed">
                      Elimina todas las familias y subfamilias registradas. Los productos existentes no se borrarán, pero quedarán clasificados sin categoría.
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#EEEEEE] flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleOpenMantenimientoModal("familias")}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 border border-red-600 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                      <span>Eliminar familias y subfamilias</span>
                    </button>
                  </div>
                </div>

                {/* 2. Productos */}
                <div className="border border-[#E2E2E2] bg-white p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-[#EEEEEE]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center border border-[#E0E0E0] bg-[#FAFAFA] text-black">
                          <Layers size={18} />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#777777]">
                            Catálogo
                          </p>
                          <h3 className="text-sm font-bold text-black">
                            Todos los Productos
                          </h3>
                        </div>
                      </div>
                      <span className="border border-red-300 bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700">
                        Clave Admin
                      </span>
                    </div>

                    <p className="mt-4 text-xs text-[#666666] leading-relaxed">
                      Elimina absolutamente todos los artículos e inventarios de todas las sucursales. Limpia la memoria local offline del Punto de Venta.
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#EEEEEE] flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleOpenMantenimientoModal("productos")}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 border border-red-600 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                      <span>Eliminar todos los productos</span>
                    </button>
                  </div>
                </div>

                {/* 3. Clientes */}
                <div className="border border-[#E2E2E2] bg-white p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-[#EEEEEE]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center border border-[#E0E0E0] bg-[#FAFAFA] text-black">
                          <Users size={18} />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#777777]">
                            Directorio
                          </p>
                          <h3 className="text-sm font-bold text-black">
                            Directorio de Clientes
                          </h3>
                        </div>
                      </div>
                      <span className="border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                        Clave Admin
                      </span>
                    </div>

                    <p className="mt-4 text-xs text-[#666666] leading-relaxed">
                      Elimina toda la base de datos de clientes, saldos a favor y puntos de fidelidad. Los registros de ventas previas se preservan como ventas generales.
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#EEEEEE] flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleOpenMantenimientoModal("clientes")}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 border border-red-600 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                      <span>Eliminar todos los clientes</span>
                    </button>
                  </div>
                </div>

                {/* 4. Ventas y Tickets */}
                <div className="border border-[#E2E2E2] bg-white p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-[#EEEEEE]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center border border-[#E0E0E0] bg-[#FAFAFA] text-black">
                          <Receipt size={18} />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#777777]">
                            Transacciones
                          </p>
                          <h3 className="text-sm font-bold text-black">
                            Ventas, Tickets e Historial
                          </h3>
                        </div>
                      </div>
                      <span className="border border-red-300 bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700">
                        Clave Admin
                      </span>
                    </div>

                    <p className="mt-4 text-xs text-[#666666] leading-relaxed">
                      Elimina todas las ventas realizadas, el historial completo de tickets y movimientos de stock por venta. También purga ventas offline locales pendientes.
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#EEEEEE] flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleOpenMantenimientoModal("ventas")}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 border border-red-600 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                      <span>Eliminar ventas y tickets</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Master Card: Limpieza Total del Sistema */}
              <section className="border-2 border-red-500 bg-white">
                <div className="border-b border-red-200 bg-red-50/70 px-8 py-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center border border-red-400 bg-red-100 text-red-700">
                      <RotateCcw size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-700">
                        Restablecimiento Maestro
                      </p>
                      <h2 className="text-base font-bold text-black">
                        Limpieza Total del Sistema (Reset Completo)
                      </h2>
                    </div>
                  </div>
                  <span className="border border-red-400 bg-red-600 text-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]">
                    Máximo Riesgo
                  </span>
                </div>

                <div className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="max-w-2xl">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-black">
                        Purga integral de todos los datos comerciales
                      </h3>
                      <p className="mt-2 text-sm text-[#666666] leading-relaxed">
                        Esta acción ejecutará una limpieza completa y simultánea: eliminará todos los productos, inventarios, familias, subfamilias, clientes y el historial entero de ventas y tickets. Se conservarán únicamente las sucursales, terminales y usuarios para una nueva puesta en marcha.
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-xs font-bold text-red-700">
                        <KeyRound size={14} className="shrink-0 text-red-600" />
                        <span>Requiere la clave del administrador y confirmación de seguridad explícita.</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenMantenimientoModal("reset_total")}
                        className="flex items-center gap-2 border border-red-600 bg-red-600 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-sm hover:bg-red-700 hover:border-red-700 transition-colors"
                      >
                        <RotateCcw size={16} />
                        <span>Limpieza total del sistema</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* SUSCRIPCIONES */}
          {activeTab === "Suscripciones" && (
            <SuscripcionesView />
          )}
        </div>
      </div>

      {/* MODAL DE SEGURIDAD PROTEGIDO CON CLAVE DE ADMINISTRADOR */}
      {modalMantenimiento && tipoMantenimiento && (() => {
        const config = MANTENIMIENTO_ACTIONS[tipoMantenimiento];
        const isConfirmWordValid = confirmWordInput.trim().toUpperCase() === config.palabraConfirmar;
        const isPasswordFilled = adminPasswordInput.trim().length > 0;
        const canSubmit = isConfirmWordValid && isPasswordFilled && !executingMantenimiento;

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm cursor-pointer"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeMantenimientoModal();
              }
            }}
          >
            <div
              className="w-full max-w-lg border border-[#DCDCDC] bg-white shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-red-200 bg-red-50/80 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center border border-red-300 bg-red-100 text-red-600">
                    <ShieldAlert size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-red-600">
                      {config.subtitulo}
                    </p>
                    <h3 className="text-base font-bold text-black">
                      {config.titulo}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeMantenimientoModal}
                  disabled={executingMantenimiento}
                  className="flex h-9 w-9 items-center justify-center border border-transparent text-[#777777] hover:text-black hover:bg-black/5 hover:border-[#DCDCDC] transition-all cursor-pointer"
                  title="Cerrar modal (Esc)"
                  aria-label="Cerrar modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <p className="text-sm text-[#444444] leading-relaxed">
                  {config.descripcion}
                </p>

                {/* Lista de consecuencias */}
                <div className="border border-[#EEEEEE] bg-[#FAFAFA] p-4 text-xs font-medium text-[#555555] space-y-2">
                  <p className="font-bold text-black uppercase tracking-wider text-[11px]">
                    Impactos de esta operación:
                  </p>
                  {config.impactos.map((impacto, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 bg-red-500 shrink-0 mt-1" />
                      <span>{impacto}</span>
                    </div>
                  ))}
                </div>

                {/* Error en el modal si falló la clave */}
                {modalErrorMsg && (
                  <div className="flex items-center gap-2 border border-red-300 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700">
                    <AlertTriangle size={15} className="shrink-0 text-red-600" />
                    <span>{modalErrorMsg}</span>
                  </div>
                )}

                {/* Paso 1: Palabra de confirmación */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.14em] text-black mb-1.5">
                    1. Escribe <span className="font-mono text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5">{config.palabraConfirmar}</span> para confirmar:
                  </label>
                  <input
                    type="text"
                    value={confirmWordInput}
                    onChange={(e) => setConfirmWordInput(e.target.value)}
                    placeholder={config.palabraConfirmar}
                    disabled={executingMantenimiento}
                    className="w-full border border-[#CCCCCC] bg-white px-4 py-2.5 text-sm font-mono tracking-widest text-black uppercase focus:border-red-600 focus:outline-none"
                    autoFocus
                  />
                </div>

                {/* Paso 2: Clave del Administrador */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.14em] text-black mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <KeyRound size={13} className="text-[#D8A814]" />
                      <span>2. Clave del Administrador:</span>
                    </span>
                    <span className="text-[10px] text-[#777777] font-normal normal-case">Contraseña o PIN admin</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      placeholder="Ingresa la clave de administrador"
                      disabled={executingMantenimiento}
                      className="w-full border border-[#CCCCCC] bg-white pl-4 pr-10 py-2.5 text-sm text-black focus:border-red-600 focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && canSubmit) {
                          handleExecuteMantenimiento();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777777] hover:text-black"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-[#EEEEEE] bg-[#FAFAFA] px-6 py-4">
                <button
                  type="button"
                  onClick={closeMantenimientoModal}
                  disabled={executingMantenimiento}
                  className="border border-[#CCCCCC] bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#555555] hover:bg-[#F0F0F0] hover:text-black transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleExecuteMantenimiento}
                  disabled={!canSubmit}
                  className="flex items-center gap-2 border border-red-600 bg-red-600 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {executingMantenimiento ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Validando y procesando...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      <span>{config.btnText}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </main>
  );
}