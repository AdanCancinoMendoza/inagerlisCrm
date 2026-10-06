"use client";

import { useState, useEffect, useMemo } from "react";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  Edit,
  Eye,
  KeyRound,
  Lock,
  LockKeyhole,
  MoreHorizontal,
  Percent,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Store,
  Trash2,
  UserCheck,
  UserRound,
  UsersRound,
  X,
  XCircle,
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSidebar } from "@/context/SidebarContext";
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  Usuario,
} from "@/services/usuarios";
import {
  getPerfiles,
  createPerfil,
  updatePerfil,
  deletePerfil,
  Perfil,
  PermisosEstructura,
  PLANTILLA_PERMISOS_DEFAULT,
} from "@/services/perfiles";
import { apiRequest } from "@/services/api";
import { getOrganizacionId, getUsuarioActual, setUsuarioActual } from "@/services/auth";

const MODULOS_DISPONIBLES = [
  { key: "inicio", label: "Inicio / Dashboard", hasCrud: false },
  { key: "clientes", label: "Clientes", hasCrud: true },
  { key: "articulos", label: "Artículos y Catálogo", hasCrud: true },
  { key: "stock", label: "Stock / Inventario", hasCrud: true },
  { key: "promociones", label: "Promociones", hasCrud: true },
  { key: "ventas", label: "Ventas y Mostrador", hasCrud: true },
  { key: "caja", label: "Caja Registradora", hasCrud: false, customActions: [{ key: "abrir", label: "Abrir caja" }, { key: "cerrar", label: "Cerrar caja" }] },
  { key: "tickets", label: "Historial de Tickets", hasCrud: false, customActions: [{ key: "reimprimir", label: "Reimprimir" }, { key: "cancelar", label: "Cancelar ticket" }] },
  { key: "reportes", label: "Reportes y Analítica", hasCrud: false },
  { key: "usuarios", label: "Usuarios y Perfiles", hasCrud: true },
  { key: "configuracion", label: "Configuración del Negocio", hasCrud: false },
];

const POS_PERMISOS_INFO = [
  {
    key: "acceso",
    label: "Acceso al Punto de Venta",
    desc: "Permite iniciar sesión y operar en la pantalla de terminal POS.",
    icon: Store,
  },
  {
    key: "aplicarDescuentos",
    label: "Aplicar Descuentos",
    desc: "Autoriza aplicar rebajas y descuentos directos sobre el total o productos.",
    icon: Percent,
  },
  {
    key: "cancelarVenta",
    label: "Cancelar Ventas en Curso",
    desc: "Permite vaciar el carrito o anular una transacción antes de cobrar.",
    icon: XCircle,
  },
  {
    key: "cambiarPrecios",
    label: "Modificar Precios Manuales",
    desc: "Habilita la edición manual del precio unitario al momento del cobro.",
    icon: DollarSign,
  },
  {
    key: "abrirCajon",
    label: "Apertura de Cajón sin Venta",
    desc: "Permite enviar comando de apertura de la gaveta de efectivo sin ticket.",
    icon: KeyRound,
  },
  {
    key: "verCostos",
    label: "Ver Costos y Márgenes",
    desc: "Muestra el precio de compra del proveedor y el margen de ganancia.",
    icon: Eye,
  },
  {
    key: "devoluciones",
    label: "Procesar Devoluciones",
    desc: "Permite aceptar devoluciones de mercancía y reembolsos de dinero.",
    icon: RefreshCw,
  },
];

export default function UsuariosPage() {
  const { collapsed } = useSidebar();
  const [activeTab, setActiveTab] = useState<"Usuarios" | "Perfiles" | "Permisos">("Usuarios");

  // Datos reales
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [sucursales, setSucursales] = useState<any[]>([]);

  // Estados de carga
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filtros de usuarios
  const [searchQuery, setSearchQuery] = useState("");
  const [filtroPerfil, setFiltroPerfil] = useState("TODOS");
  const [filtroSucursal, setFiltroSucursal] = useState("TODAS");

  // Estado del editor de permisos
  const [selectedPerfilId, setSelectedPerfilId] = useState<string>("");
  const [permisosEditados, setPermisosEditados] = useState<PermisosEstructura | null>(null);

  // Modales
  const [modalUsuarioOpen, setModalUsuarioOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [usuarioForm, setUsuarioForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    password: "",
    pin: "",
    perfilId: "",
    sucursalId: "",
    activo: true,
  });

  const [modalPerfilOpen, setModalPerfilOpen] = useState(false);
  const [editingPerfil, setEditingPerfil] = useState<Perfil | null>(null);
  const [perfilForm, setPerfilForm] = useState({
    nombre: "",
    descripcion: "",
    plantillaBase: "cajero",
  });

  const [confirmDelete, setConfirmDelete] = useState<{
    tipo: "usuario" | "perfil";
    id: string;
    nombre: string;
  } | null>(null);

  // Toast
  const [toast, setToast] = useState<{
    mensaje: string;
    tipo: "success" | "error" | "info";
  } | null>(null);

  const showToast = (mensaje: string, tipo: "success" | "error" | "info" = "success") => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 4000);
  };

  // Cargar datos iniciales
  const cargarDatos = async () => {
    const orgId = getOrganizacionId() || getUsuarioActual()?.organizacionId;
    if (!orgId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [usersData, perfilesData, sucursalesData] = await Promise.all([
        getUsuarios(orgId).catch(() => []),
        getPerfiles(orgId).catch(() => []),
        apiRequest<any[]>(`/sucursales?organizacionId=${orgId}`).catch(() => []),
      ]);

      setUsuarios(usersData || []);
      setPerfiles(perfilesData || []);
      setSucursales(sucursalesData || []);

      if (perfilesData && perfilesData.length > 0 && !selectedPerfilId) {
        setSelectedPerfilId(perfilesData[0].id);
        setPermisosEditados(perfilesData[0].permisos);
      }
    } catch (err: any) {
      showToast(err.message || "Error al cargar información", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Al cambiar el perfil seleccionado en la pestaña de Permisos
  const perfilSeleccionado = useMemo(() => {
    return perfiles.find((p) => p.id === selectedPerfilId) || perfiles[0] || null;
  }, [perfiles, selectedPerfilId]);

  useEffect(() => {
    if (perfilSeleccionado) {
      setPermisosEditados(JSON.parse(JSON.stringify(perfilSeleccionado.permisos || PLANTILLA_PERMISOS_DEFAULT)));
    }
  }, [perfilSeleccionado]);

  // Filtrado de usuarios
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.nombre.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.telefono && u.telefono.toLowerCase().includes(q)) ||
        (u.perfil && u.perfil.nombre.toLowerCase().includes(q));

      const matchPerfil =
        filtroPerfil === "TODOS" || u.perfilId === filtroPerfil || u.perfil?.nombre === filtroPerfil;

      const matchSucursal =
        filtroSucursal === "TODAS" || u.sucursalId === filtroSucursal;

      return matchSearch && matchPerfil && matchSucursal;
    });
  }, [usuarios, searchQuery, filtroPerfil, filtroSucursal]);

  // Manejar apertura de modal de usuario
  const handleOpenUsuarioModal = (usuario?: Usuario) => {
    if (usuario) {
      setEditingUsuario(usuario);
      setUsuarioForm({
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono || "",
        password: "",
        pin: "",
        perfilId: usuario.perfilId || (perfiles[0]?.id ?? ""),
        sucursalId: usuario.sucursalId || "",
        activo: usuario.activo,
      });
    } else {
      setEditingUsuario(null);
      setUsuarioForm({
        nombre: "",
        email: "",
        telefono: "",
        password: "",
        pin: "",
        perfilId: perfiles[0]?.id || "",
        sucursalId: sucursales[0]?.id || "",
        activo: true,
      });
    }
    setModalUsuarioOpen(true);
  };

  // Guardar usuario
  const handleSaveUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    const orgId = getOrganizacionId() || getUsuarioActual()?.organizacionId;
    if (!orgId) return;

    if (!usuarioForm.nombre.trim() || !usuarioForm.email.trim()) {
      showToast("Nombre y correo electrónico son requeridos", "error");
      return;
    }

    if (!editingUsuario && (!usuarioForm.password || usuarioForm.password.length < 6)) {
      showToast("La contraseña debe tener al menos 6 caracteres", "error");
      return;
    }

    if (!usuarioForm.perfilId) {
      showToast("Debes seleccionar un perfil para el usuario", "error");
      return;
    }

    try {
      setSaving(true);
      if (editingUsuario) {
        const payload: any = {
          nombre: usuarioForm.nombre,
          email: usuarioForm.email,
          telefono: usuarioForm.telefono || undefined,
          perfilId: usuarioForm.perfilId,
          sucursalId: usuarioForm.sucursalId || undefined,
          activo: usuarioForm.activo,
        };
        if (usuarioForm.password.trim()) payload.password = usuarioForm.password.trim();
        if (usuarioForm.pin.trim()) payload.pin = usuarioForm.pin.trim();

        await updateUsuario(editingUsuario.id, payload);
        showToast("Usuario actualizado correctamente", "success");
      } else {
        await createUsuario({
          organizacionId: orgId,
          nombre: usuarioForm.nombre,
          email: usuarioForm.email,
          telefono: usuarioForm.telefono || undefined,
          password: usuarioForm.password,
          pin: usuarioForm.pin || undefined,
          perfilId: usuarioForm.perfilId,
          sucursalId: usuarioForm.sucursalId || undefined,
          activo: usuarioForm.activo,
        });
        showToast("Usuario creado correctamente", "success");
      }

      setModalUsuarioOpen(false);
      await cargarDatos();
    } catch (err: any) {
      showToast(err.message || "Error al guardar el usuario", "error");
    } finally {
      setSaving(false);
    }
  };

  // Manejar eliminación de usuario
  const handleDeleteUsuario = async (id: string) => {
    try {
      setSaving(true);
      const res = await deleteUsuario(id);
      showToast(res.mensaje || "Operación realizada", "success");
      setConfirmDelete(null);
      await cargarDatos();
    } catch (err: any) {
      showToast(err.message || "Error al eliminar usuario", "error");
    } finally {
      setSaving(false);
    }
  };

  // Manejar apertura de modal de perfil
  const handleOpenPerfilModal = (perfil?: Perfil) => {
    if (perfil) {
      setEditingPerfil(perfil);
      setPerfilForm({
        nombre: perfil.nombre,
        descripcion: perfil.descripcion || "",
        plantillaBase: "personalizado",
      });
    } else {
      setEditingPerfil(null);
      setPerfilForm({
        nombre: "",
        descripcion: "",
        plantillaBase: "cajero",
      });
    }
    setModalPerfilOpen(true);
  };

  // Guardar perfil
  const handleSavePerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    const orgId = getOrganizacionId() || getUsuarioActual()?.organizacionId;
    if (!orgId) return;

    if (!perfilForm.nombre.trim()) {
      showToast("El nombre del perfil es requerido", "error");
      return;
    }

    try {
      setSaving(true);
      if (editingPerfil) {
        await updatePerfil(editingPerfil.id, {
          nombre: perfilForm.nombre.trim(),
          descripcion: perfilForm.descripcion.trim() || undefined,
        });
        showToast("Perfil actualizado correctamente", "success");
      } else {
        // Asignar plantilla base
        let plantilla = PLANTILLA_PERMISOS_DEFAULT;
        if (perfilForm.plantillaBase === "admin") {
          plantilla = {
            modulos: {
              inicio: { ver: true },
              clientes: { ver: true, crear: true, editar: true, eliminar: true },
              articulos: { ver: true, crear: true, editar: true, eliminar: true },
              stock: { ver: true, crear: true, editar: true, eliminar: true },
              promociones: { ver: true, crear: true, editar: true, eliminar: true },
              ventas: { ver: true, crear: true, editar: true, eliminar: true },
              caja: { ver: true, abrir: true, cerrar: true },
              tickets: { ver: true, cancelar: true, reimprimir: true },
              reportes: { ver: true },
              usuarios: { ver: true, crear: true, editar: true, eliminar: true },
              configuracion: { ver: true },
            },
            pos: {
              acceso: true,
              aplicarDescuentos: true,
              cancelarVenta: true,
              cambiarPrecios: true,
              abrirCajon: true,
              verCostos: true,
              devoluciones: true,
            },
          };
        } else if (perfilForm.plantillaBase === "vendedor") {
          plantilla = {
            modulos: {
              inicio: { ver: true },
              clientes: { ver: true, crear: true, editar: true, eliminar: false },
              articulos: { ver: true, crear: false, editar: false, eliminar: false },
              stock: { ver: true, crear: false, editar: false, eliminar: false },
              promociones: { ver: true, crear: false, editar: false, eliminar: false },
              ventas: { ver: true, crear: true, editar: false, eliminar: false },
              caja: { ver: false, abrir: false, cerrar: false },
              tickets: { ver: true, cancelar: false, reimprimir: true },
              reportes: { ver: false },
              usuarios: { ver: false, crear: false, editar: false, eliminar: false },
              configuracion: { ver: false },
            },
            pos: {
              acceso: true,
              aplicarDescuentos: true,
              cancelarVenta: false,
              cambiarPrecios: false,
              abrirCajon: false,
              verCostos: false,
              devoluciones: false,
            },
          };
        }

        const nuevo = await createPerfil({
          organizacionId: orgId,
          nombre: perfilForm.nombre.trim(),
          descripcion: perfilForm.descripcion.trim() || undefined,
          esAdmin: perfilForm.plantillaBase === "admin",
          permisos: plantilla,
        });

        showToast("Perfil creado exitosamente", "success");
        setSelectedPerfilId(nuevo.id);
      }

      setModalPerfilOpen(false);
      await cargarDatos();
    } catch (err: any) {
      showToast(err.message || "Error al guardar el perfil", "error");
    } finally {
      setSaving(false);
    }
  };

  // Eliminar perfil
  const handleDeletePerfil = async (id: string) => {
    try {
      setSaving(true);
      await deletePerfil(id);
      showToast("Perfil eliminado correctamente", "success");
      setConfirmDelete(null);
      await cargarDatos();
    } catch (err: any) {
      showToast(err.message || "Error al eliminar perfil", "error");
    } finally {
      setSaving(false);
    }
  };

  // Alternar permiso de módulo
  const toggleModuloPermiso = (moduloKey: string, accionKey: string) => {
    if (!permisosEditados || perfilSeleccionado?.esAdmin) return;
    setPermisosEditados((prev) => {
      if (!prev) return prev;
      const modulos = { ...prev.modulos };
      const currentMod = (modulos as any)[moduloKey] || {};
      const currentVal = Boolean(currentMod[accionKey]);

      (modulos as any)[moduloKey] = {
        ...currentMod,
        [accionKey]: !currentVal,
      };

      // Si se desactiva "ver", desactivar las acciones secundarias
      if (accionKey === "ver" && currentVal) {
        (modulos as any)[moduloKey] = {
          ver: false,
          crear: false,
          editar: false,
          eliminar: false,
          abrir: false,
          cerrar: false,
          cancelar: false,
          reimprimir: false,
        };
      }

      // Si se activa cualquier acción, asegurar que "ver" esté activo
      if (accionKey !== "ver" && !currentVal) {
        (modulos as any)[moduloKey].ver = true;
      }

      return {
        ...prev,
        modulos,
      };
    });
  };

  // Alternar permiso de POS
  const togglePosPermiso = (posKey: keyof PermisosEstructura["pos"]) => {
    if (!permisosEditados || perfilSeleccionado?.esAdmin) return;
    setPermisosEditados((prev) => {
      if (!prev) return prev;
      const pos = { ...prev.pos };
      pos[posKey] = !pos[posKey];
      return {
        ...prev,
        pos,
      };
    });
  };

  // Guardar permisos en backend
  const handleGuardarPermisos = async () => {
    if (!selectedPerfilId || !permisosEditados) return;

    try {
      setSaving(true);
      await updatePerfil(selectedPerfilId, {
        permisos: permisosEditados,
      });

      // Si el usuario en sesión tiene este perfil, actualizar su localStorage
      const u = getUsuarioActual();
      if (u && u.perfilId === selectedPerfilId) {
        setUsuarioActual({
          ...u,
          perfil: {
            ...u.perfil!,
            permisos: permisosEditados,
          },
        });
      }

      showToast("Permisos guardados y aplicados exitosamente", "success");
      await cargarDatos();
    } catch (err: any) {
      showToast(err.message || "Error al guardar permisos", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Sidebar />

      <div
        className={`min-h-screen transition-all duration-300 ${
          collapsed ? "ml-[80px]" : "ml-[250px]"
        }`}
      >
        <Header />

        <div className="p-8 md:p-10">
          {/* Toast Notification */}
          {toast && (
            <div
              className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 border px-5 py-4 shadow-2xl transition-all duration-300 ${
                toast.tipo === "success"
                  ? "border-[#D8A814] bg-[#0A0A0A] text-white"
                  : toast.tipo === "error"
                  ? "border-red-600 bg-red-950 text-white"
                  : "border-[#444] bg-[#1a1a1a] text-white"
              }`}
            >
              {toast.tipo === "success" ? (
                <CheckCircle2 size={18} className="text-[#D8A814]" />
              ) : toast.tipo === "error" ? (
                <AlertCircle size={18} className="text-red-400" />
              ) : (
                <ShieldCheck size={18} className="text-blue-400" />
              )}
              <span className="text-sm font-semibold">{toast.mensaje}</span>
            </div>
          )}

          {/* Encabezado */}
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
                Administración y Seguridad
              </p>
              <h1 className="mt-1.5 text-3xl font-extrabold text-[#0D0D0D]">
                Usuarios y Permisos
              </h1>
              <p className="mt-1 text-sm text-[#666666]">
                Gestiona cuentas de usuario, perfiles de acceso y permisos para módulos y el punto de venta.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={cargarDatos}
                title="Recargar datos"
                disabled={loading}
                className="flex h-12 w-12 items-center justify-center border border-[#E0E0E0] bg-white text-[#555] transition-colors hover:border-black hover:text-black disabled:opacity-50"
              >
                <RefreshCw size={18} className={loading ? "animate-spin text-[#D8A814]" : ""} />
              </button>

              {activeTab === "Usuarios" && (
                <button
                  onClick={() => handleOpenUsuarioModal()}
                  className="flex h-12 items-center gap-2 bg-[#D8A814] px-6 text-sm font-bold text-white transition-colors hover:bg-black"
                >
                  <Plus size={18} />
                  Nuevo usuario
                </button>
              )}

              {activeTab === "Perfiles" && (
                <button
                  onClick={() => handleOpenPerfilModal()}
                  className="flex h-12 items-center gap-2 bg-[#D8A814] px-6 text-sm font-bold text-white transition-colors hover:bg-black"
                >
                  <Plus size={18} />
                  Nuevo perfil
                </button>
              )}

              {activeTab === "Permisos" && (
                <button
                  onClick={handleGuardarPermisos}
                  disabled={saving || perfilSeleccionado?.esAdmin}
                  className="flex h-12 items-center gap-2 bg-[#D8A814] px-6 text-sm font-bold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? <RefreshCw size={18} className="animate-spin" /> : <Check size={18} />}
                  Guardar permisos
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex border-b border-[#DCDCDC]">
            {(["Usuarios", "Perfiles", "Permisos"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2.5 border-b-2 px-6 py-4 text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? "border-[#D8A814] text-[#D8A814]"
                    : "border-transparent text-[#777777] hover:text-black"
                }`}
              >
                {tab === "Usuarios" && <UserRound size={17} />}
                {tab === "Perfiles" && <Shield size={17} />}
                {tab === "Permisos" && <LockKeyhole size={17} />}
                <span>{tab}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    activeTab === tab
                      ? "bg-[#D8A814]/15 text-[#D8A814]"
                      : "bg-[#EEEEEE] text-[#777777]"
                  }`}
                >
                  {tab === "Usuarios"
                    ? usuarios.length
                    : tab === "Perfiles"
                    ? perfiles.length
                    : perfilSeleccionado?.nombre || "0"}
                </span>
              </button>
            ))}
          </div>

          {/* ============================================================== */}
          {/* TAB 1: USUARIOS                                                */}
          {/* ============================================================== */}
          {activeTab === "Usuarios" && (
            <>
              {/* Métricas rápidas */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="border border-[#D8A814] bg-[#D8A814] p-6 text-white shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/90">
                    Total Usuarios
                  </p>
                  <p className="mt-2 text-3xl font-extrabold">{usuarios.length}</p>
                </div>

                <div className="border border-[#E2E2E2] bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                    Usuarios Activos
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-black">
                    {usuarios.filter((u) => u.activo).length}
                  </p>
                </div>

                <div className="border border-[#E2E2E2] bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                    Perfiles Creados
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-black">
                    {perfiles.length}
                  </p>
                </div>

                <div className="border border-[#E2E2E2] bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                    Sucursales
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-black">
                    {sucursales.length || 1}
                  </p>
                </div>
              </div>

              {/* Filtros de búsqueda */}
              <div className="my-6 flex flex-col gap-3 md:flex-row">
                <div className="flex h-12 flex-1 items-center border border-[#E0E0E0] bg-white px-4">
                  <Search size={18} className="mr-3 text-[#999999]" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre, correo, teléfono o perfil..."
                    className="h-full w-full bg-transparent text-sm text-black outline-none"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-black">
                      <X size={16} />
                    </button>
                  )}
                </div>

                <select
                  value={filtroPerfil}
                  onChange={(e) => setFiltroPerfil(e.target.value)}
                  className="h-12 min-w-[200px] border border-[#E0E0E0] bg-white px-4 text-sm font-medium text-black outline-none"
                >
                  <option value="TODOS">Todos los perfiles</option>
                  {perfiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} {p.esAdmin ? "(Admin)" : ""}
                    </option>
                  ))}
                </select>

                <select
                  value={filtroSucursal}
                  onChange={(e) => setFiltroSucursal(e.target.value)}
                  className="h-12 min-w-[200px] border border-[#E0E0E0] bg-white px-4 text-sm font-medium text-black outline-none"
                >
                  <option value="TODAS">Todas las sucursales</option>
                  {sucursales.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tabla de usuarios */}
              <section className="overflow-hidden border border-[#E2E2E2] bg-white shadow-sm">
                <div className="hidden grid-cols-[2fr_1.3fr_1.3fr_1fr_1fr_0.8fr] bg-[#FAFAFA] px-6 py-4 md:grid">
                  <p className="text-xs font-bold uppercase text-[#777777]">Usuario</p>
                  <p className="text-xs font-bold uppercase text-[#777777]">Perfil / Permisos</p>
                  <p className="text-xs font-bold uppercase text-[#777777]">Sucursal</p>
                  <p className="text-xs font-bold uppercase text-[#777777]">Acceso POS</p>
                  <p className="text-xs font-bold uppercase text-[#777777]">Estado</p>
                  <p className="text-right text-xs font-bold uppercase text-[#777777]">Acciones</p>
                </div>

                {loading ? (
                  <div className="flex h-48 flex-col items-center justify-center gap-3">
                    <RefreshCw size={24} className="animate-spin text-[#D8A814]" />
                    <p className="text-sm font-medium text-[#777777]">Cargando usuarios...</p>
                  </div>
                ) : usuariosFiltrados.length === 0 ? (
                  <div className="flex h-48 flex-col items-center justify-center gap-2 p-8 text-center">
                    <UsersRound size={32} className="text-[#AAAAAA]" />
                    <p className="text-base font-bold text-black">No se encontraron usuarios</p>
                    <p className="text-xs text-[#777777]">
                      {searchQuery
                        ? "Prueba cambiando el término de búsqueda o limpiando los filtros."
                        : "Comienza registrando tu primer usuario o cajero en el sistema."}
                    </p>
                  </div>
                ) : (
                  usuariosFiltrados.map((u) => {
                    const inicial = (u.nombre || "U").charAt(0).toUpperCase();
                    const esAdmin = u.perfil?.esAdmin;
                    const tienePos = u.perfil?.permisos?.pos?.acceso ?? false;

                    return (
                      <div
                        key={u.id}
                        className="grid grid-cols-1 items-center border-t border-[#EEEEEE] px-6 py-4.5 transition-colors hover:bg-[#FAFAFA] md:grid-cols-[2fr_1.3fr_1.3fr_1fr_1fr_0.8fr]"
                      >
                        {/* Usuario */}
                        <div className="flex items-center gap-3.5">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0D0D0D] text-sm font-bold text-white">
                            {inicial}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-black">{u.nombre}</p>
                            <p className="truncate text-xs text-[#777777]">{u.email}</p>
                            {u.telefono && (
                              <p className="text-[11px] text-[#999999]">Tel: {u.telefono}</p>
                            )}
                          </div>
                        </div>

                        {/* Perfil */}
                        <div className="mt-2 flex items-center gap-2 md:mt-0">
                          {esAdmin ? (
                            <ShieldAlert size={16} className="shrink-0 text-[#D8A814]" />
                          ) : (
                            <ShieldCheck size={16} className="shrink-0 text-[#888888]" />
                          )}
                          <span
                            className={`inline-block rounded px-2.5 py-1 text-xs font-semibold ${
                              esAdmin
                                ? "bg-[#D8A814]/15 text-[#9A7400]"
                                : "bg-[#F0F0F0] text-[#333333]"
                            }`}
                          >
                            {u.perfil?.nombre || "Sin perfil"}
                          </span>
                        </div>

                        {/* Sucursal */}
                        <div className="mt-2 flex items-center gap-2 text-sm text-[#555555] md:mt-0">
                          <Building2 size={16} className="shrink-0 text-[#999999]" />
                          <span className="truncate">{u.sucursal?.nombre || "General / Todas"}</span>
                        </div>

                        {/* Acceso POS */}
                        <div className="mt-2 md:mt-0">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                              tienePos
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                tienePos ? "bg-emerald-500" : "bg-gray-400"
                              }`}
                            />
                            {tienePos ? "POS Activo" : "Sin POS"}
                          </span>
                        </div>

                        {/* Estado */}
                        <div className="mt-2 md:mt-0">
                          <span
                            className={`inline-block px-2.5 py-1 text-[11px] font-extrabold tracking-wider ${
                              u.activo
                                ? "bg-[#D8A814] text-white"
                                : "bg-[#EAEAEA] text-[#777777]"
                            }`}
                          >
                            {u.activo ? "ACTIVO" : "INACTIVO"}
                          </span>
                        </div>

                        {/* Acciones */}
                        <div className="mt-3 flex items-center justify-end gap-2 md:mt-0">
                          <button
                            onClick={() => handleOpenUsuarioModal(u)}
                            title="Editar usuario"
                            className="flex h-8 w-8 items-center justify-center rounded border border-[#E0E0E0] bg-white text-[#555] transition-colors hover:border-[#D8A814] hover:text-[#D8A814]"
                          >
                            <Edit size={14} />
                          </button>

                          <button
                            onClick={() =>
                              setConfirmDelete({
                                tipo: "usuario",
                                id: u.id,
                                nombre: u.nombre,
                              })
                            }
                            title="Eliminar usuario"
                            className="flex h-8 w-8 items-center justify-center rounded border border-[#E0E0E0] bg-white text-[#555] transition-colors hover:border-red-500 hover:text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </section>
            </>
          )}

          {/* ============================================================== */}
          {/* TAB 2: PERFILES                                                */}
          {/* ============================================================== */}
          {activeTab === "Perfiles" && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {perfiles.map((p) => {
                const esAdmin = p.esAdmin;
                const posAcceso = p.permisos?.pos?.acceso;
                const modulosVer = Object.values(p.permisos?.modulos || {}).filter(
                  (m: any) => m?.ver
                ).length;

                return (
                  <div
                    key={p.id}
                    className="flex flex-col justify-between border border-[#E2E2E2] bg-white p-7 shadow-sm transition-all hover:border-[#D8A814]"
                  >
                    <div>
                      {/* Cabecera de la tarjeta */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-12 w-12 items-center justify-center font-bold ${
                              esAdmin
                                ? "bg-[#D8A814] text-white"
                                : "bg-[#0A0A0A] text-white"
                            }`}
                          >
                            <Shield size={22} />
                          </div>

                          <div>
                            <h2 className="text-xl font-bold text-black">{p.nombre}</h2>
                            {esAdmin && (
                              <span className="mt-0.5 inline-block text-[10px] font-extrabold uppercase tracking-wider text-[#D8A814]">
                                Super Administrador
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenPerfilModal(p)}
                            title="Editar nombre y descripción"
                            className="flex h-8 w-8 items-center justify-center border border-[#E5E5E5] text-[#666] hover:border-black hover:text-black"
                          >
                            <Edit size={14} />
                          </button>

                          {!esAdmin && (
                            <button
                              onClick={() =>
                                setConfirmDelete({
                                  tipo: "perfil",
                                  id: p.id,
                                  nombre: p.nombre,
                                })
                              }
                              title="Eliminar perfil"
                              className="flex h-8 w-8 items-center justify-center border border-[#E5E5E5] text-[#666] hover:border-red-500 hover:text-red-500"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Descripción */}
                      <p className="mt-4 min-h-[44px] text-sm leading-relaxed text-[#666666]">
                        {p.descripcion || "Sin descripción proporcionada para este perfil."}
                      </p>

                      {/* Resumen de capacidades */}
                      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#F0F0F0] pt-4">
                        <div className="rounded bg-[#FAFAFA] p-3">
                          <p className="text-[11px] font-bold uppercase text-[#888888]">
                            Módulos con acceso
                          </p>
                          <p className="mt-1 text-base font-extrabold text-black">
                            {esAdmin ? "Todos (11/11)" : `${modulosVer} de 11`}
                          </p>
                        </div>

                        <div className="rounded bg-[#FAFAFA] p-3">
                          <p className="text-[11px] font-bold uppercase text-[#888888]">
                            Punto de Venta
                          </p>
                          <p
                            className={`mt-1 text-base font-extrabold ${
                              posAcceso ? "text-emerald-600" : "text-gray-400"
                            }`}
                          >
                            {posAcceso ? "Habilitado" : "Deshabilitado"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Footer de la tarjeta con acción para configurar */}
                    <div className="mt-6 border-t border-[#EEEEEE] pt-5">
                      <div className="mb-4 flex items-center justify-between text-xs text-[#777777]">
                        <span className="flex items-center gap-1.5 font-medium">
                          <UsersRound size={15} />
                          Usuarios asignados
                        </span>
                        <span className="text-base font-bold text-[#D8A814]">
                          {p.usuariosCount ?? 0}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedPerfilId(p.id);
                          setActiveTab("Permisos");
                        }}
                        className="flex h-11 w-full items-center justify-center gap-2 bg-[#0D0D0D] text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#D8A814]"
                      >
                        <LockKeyhole size={14} />
                        Ajustar Permisos
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: PERMISOS (AJUSTE DE MÓDULOS Y PUNTO DE VENTA)            */}
          {/* ============================================================== */}
          {activeTab === "Permisos" && (
            <div className="space-y-8">
              {/* Barra de selección de perfil activo */}
              <div className="flex flex-col justify-between gap-4 border border-[#E2E2E2] bg-white p-6 shadow-sm md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center bg-[#D8A814] text-white">
                    <ShieldCheck size={24} />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#D8A814]">
                      Editando Permisos Para
                    </p>
                    <h2 className="text-xl font-extrabold text-black">
                      {perfilSeleccionado?.nombre || "Selecciona un perfil"}
                    </h2>
                    <p className="text-xs text-[#777777]">
                      {perfilSeleccionado?.descripcion || "Ajusta visibilidad de módulos y facultades de venta."}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="text-xs font-bold uppercase text-[#777777]">
                    Cambiar Perfil:
                  </label>
                  <select
                    value={selectedPerfilId}
                    onChange={(e) => setSelectedPerfilId(e.target.value)}
                    className="h-11 min-w-[220px] border border-[#D8A814] bg-white px-4 text-sm font-bold text-black outline-none"
                  >
                    {perfiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} {p.esAdmin ? "(Admin)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Aviso si es Super Administrador */}
              {perfilSeleccionado?.esAdmin && (
                <div className="flex items-start gap-4 border border-[#D8A814] bg-[#D8A814]/10 p-5">
                  <ShieldAlert size={22} className="shrink-0 text-[#D8A814]" />
                  <div>
                    <h3 className="text-sm font-bold text-black">
                      Perfil con Facultades de Administrador Principal
                    </h3>
                    <p className="mt-1 text-xs text-[#555555]">
                      Este perfil tiene acceso irrestricto garantizado a todos los módulos actuales y futuros, así como a todas las facultades del Punto de Venta. Para restringir permisos, crea o selecciona un perfil secundario (ej. Cajero o Vendedor).
                    </p>
                  </div>
                </div>
              )}

              {/* SECCIÓN 1: MÓDULOS DEL SISTEMA */}
              <section className="overflow-hidden border border-[#E2E2E2] bg-white shadow-sm">
                <div className="border-b border-[#EEEEEE] bg-[#FAFAFA] px-7 py-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-extrabold text-black">
                        1. Visibilidad y Acciones de Módulos (CRM / Panel)
                      </h3>
                      <p className="text-xs text-[#777777]">
                        Define qué módulos aparecen en la barra lateral y qué operaciones puede realizar el usuario.
                      </p>
                    </div>

                    {!perfilSeleccionado?.esAdmin && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (!permisosEditados) return;
                            const modulos: any = {};
                            MODULOS_DISPONIBLES.forEach((m) => {
                              modulos[m.key] = {
                                ver: true,
                                crear: true,
                                editar: true,
                                eliminar: true,
                                abrir: true,
                                cerrar: true,
                                cancelar: true,
                                reimprimir: true,
                              };
                            });
                            setPermisosEditados({ ...permisosEditados, modulos });
                          }}
                          className="border border-[#D8A814] px-3 py-1.5 text-xs font-bold text-[#D8A814] hover:bg-[#D8A814] hover:text-white transition-colors"
                        >
                          Habilitar todos
                        </button>

                        <button
                          onClick={() => {
                            if (!permisosEditados) return;
                            const modulos: any = {};
                            MODULOS_DISPONIBLES.forEach((m) => {
                              modulos[m.key] = {
                                ver: false,
                                crear: false,
                                editar: false,
                                eliminar: false,
                                abrir: false,
                                cerrar: false,
                                cancelar: false,
                                reimprimir: false,
                              };
                            });
                            setPermisosEditados({ ...permisosEditados, modulos });
                          }}
                          className="border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          Deshabilitar todos
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Encabezados de la tabla */}
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] bg-[#F4F4F4] px-7 py-3 text-xs font-extrabold uppercase text-[#666666]">
                  <p>Módulo</p>
                  <p className="text-center">Ver en Menú</p>
                  <p className="text-center">Crear / Agregar</p>
                  <p className="text-center">Editar / Modificar</p>
                  <p className="text-center">Eliminar / Cancelar</p>
                </div>

                {/* Filas de módulos */}
                <div className="divide-y divide-[#EEEEEE]">
                  {MODULOS_DISPONIBLES.map((mod) => {
                    const modPermiso = (permisosEditados?.modulos as any)?.[mod.key] || {};
                    const isSuperAdmin = perfilSeleccionado?.esAdmin;

                    const verVal = isSuperAdmin ? true : Boolean(modPermiso.ver);
                    const crearVal = isSuperAdmin ? true : Boolean(modPermiso.crear || modPermiso.abrir);
                    const editarVal = isSuperAdmin ? true : Boolean(modPermiso.editar || modPermiso.cerrar || modPermiso.reimprimir);
                    const eliminarVal = isSuperAdmin ? true : Boolean(modPermiso.eliminar || modPermiso.cancelar);

                    return (
                      <div
                        key={mod.key}
                        className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center px-7 py-4.5 hover:bg-[#FAFAFA]"
                      >
                        <div className="flex items-center gap-3">
                          <LockKeyhole
                            size={16}
                            className={verVal ? "text-[#D8A814]" : "text-gray-300"}
                          />
                          <div>
                            <p className="text-sm font-bold text-black">{mod.label}</p>
                            <p className="text-[11px] text-[#888888]">
                              Ruta: /{mod.key === "inicio" ? "inicio" : mod.key}
                            </p>
                          </div>
                        </div>

                        {/* Ver */}
                        <div className="flex justify-center">
                          <button
                            type="button"
                            disabled={isSuperAdmin}
                            onClick={() => toggleModuloPermiso(mod.key, "ver")}
                            className={`flex h-7 w-12 items-center rounded-full transition-colors ${
                              verVal ? "justify-end bg-[#D8A814]" : "justify-start bg-[#CCCCCC]"
                            } ${isSuperAdmin ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            <span className="mx-1 h-5 w-5 rounded-full bg-white shadow-sm" />
                          </button>
                        </div>

                        {/* Crear */}
                        <div className="flex justify-center">
                          {mod.hasCrud || mod.customActions?.some((a) => a.key === "abrir") ? (
                            <button
                              type="button"
                              disabled={isSuperAdmin || !verVal}
                              onClick={() =>
                                toggleModuloPermiso(
                                  mod.key,
                                  mod.key === "caja" ? "abrir" : "crear"
                                )
                              }
                              className={`flex h-7 w-12 items-center rounded-full transition-colors ${
                                crearVal ? "justify-end bg-[#D8A814]" : "justify-start bg-[#CCCCCC]"
                              } ${isSuperAdmin || !verVal ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              <span className="mx-1 h-5 w-5 rounded-full bg-white shadow-sm" />
                            </button>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </div>

                        {/* Editar */}
                        <div className="flex justify-center">
                          {mod.hasCrud || mod.customActions?.some((a) => a.key === "cerrar" || a.key === "reimprimir") ? (
                            <button
                              type="button"
                              disabled={isSuperAdmin || !verVal}
                              onClick={() =>
                                toggleModuloPermiso(
                                  mod.key,
                                  mod.key === "caja"
                                    ? "cerrar"
                                    : mod.key === "tickets"
                                    ? "reimprimir"
                                    : "editar"
                                )
                              }
                              className={`flex h-7 w-12 items-center rounded-full transition-colors ${
                                editarVal ? "justify-end bg-[#D8A814]" : "justify-start bg-[#CCCCCC]"
                              } ${isSuperAdmin || !verVal ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              <span className="mx-1 h-5 w-5 rounded-full bg-white shadow-sm" />
                            </button>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </div>

                        {/* Eliminar */}
                        <div className="flex justify-center">
                          {mod.hasCrud || mod.customActions?.some((a) => a.key === "cancelar") ? (
                            <button
                              type="button"
                              disabled={isSuperAdmin || !verVal}
                              onClick={() =>
                                toggleModuloPermiso(
                                  mod.key,
                                  mod.key === "tickets" ? "cancelar" : "eliminar"
                                )
                              }
                              className={`flex h-7 w-12 items-center rounded-full transition-colors ${
                                eliminarVal ? "justify-end bg-[#D8A814]" : "justify-start bg-[#CCCCCC]"
                              } ${isSuperAdmin || !verVal ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              <span className="mx-1 h-5 w-5 rounded-full bg-white shadow-sm" />
                            </button>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* SECCIÓN 2: PUNTO DE VENTA (POS) */}
              <section className="border border-[#E2E2E2] bg-white p-7 shadow-sm">
                <div className="mb-6 flex flex-col justify-between gap-3 border-b border-[#EEEEEE] pb-5 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-lg font-extrabold text-black">
                      2. Permisos Específicos para Punto de Venta (Terminal POS)
                    </h3>
                    <p className="text-xs text-[#777777]">
                      Autoriza o restringe facultades críticas durante el cobro y la operación en mostrador.
                    </p>
                  </div>

                  {!perfilSeleccionado?.esAdmin && (
                    <button
                      onClick={() => {
                        if (!permisosEditados) return;
                        const pos = {
                          acceso: true,
                          aplicarDescuentos: true,
                          cancelarVenta: true,
                          cambiarPrecios: true,
                          abrirCajon: true,
                          verCostos: true,
                          devoluciones: true,
                        };
                        setPermisosEditados({ ...permisosEditados, pos });
                      }}
                      className="border border-[#D8A814] px-4 py-2 text-xs font-bold text-[#D8A814] hover:bg-[#D8A814] hover:text-white transition-colors"
                    >
                      Autorizar todas las facultades POS
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {POS_PERMISOS_INFO.map((item) => {
                    const Icon = item.icon;
                    const isSuperAdmin = perfilSeleccionado?.esAdmin;
                    const activo = isSuperAdmin
                      ? true
                      : Boolean(permisosEditados?.pos?.[item.key as keyof PermisosEstructura["pos"]]);

                    return (
                      <div
                        key={item.key}
                        className={`flex items-start justify-between border p-5 transition-colors ${
                          activo
                            ? "border-[#D8A814]/40 bg-[#FFFDF5]"
                            : "border-[#E5E5E5] bg-white"
                        }`}
                      >
                        <div className="flex items-start gap-3.5 pr-4">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded ${
                              activo
                                ? "bg-[#D8A814] text-white"
                                : "bg-[#F0F0F0] text-[#777777]"
                            }`}
                          >
                            <Icon size={19} />
                          </div>

                          <div>
                            <p className="text-sm font-bold text-black">{item.label}</p>
                            <p className="mt-1 text-xs leading-relaxed text-[#666666]">
                              {item.desc}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isSuperAdmin}
                          onClick={() =>
                            togglePosPermiso(item.key as keyof PermisosEstructura["pos"])
                          }
                          className={`flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                            activo
                              ? "justify-end bg-[#D8A814]"
                              : "justify-start bg-[#CCCCCC]"
                          } ${isSuperAdmin ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          <span className="mx-1 h-5 w-5 rounded-full bg-white shadow-sm" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Botón inferior de confirmación */}
                <div className="mt-8 flex justify-end border-t border-[#EEEEEE] pt-6">
                  <button
                    onClick={handleGuardarPermisos}
                    disabled={saving || perfilSeleccionado?.esAdmin}
                    className="flex h-12 items-center gap-2 bg-[#D8A814] px-8 text-sm font-bold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? <RefreshCw size={18} className="animate-spin" /> : <Check size={18} />}
                    Guardar y Aplicar Permisos
                  </button>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL: NUEVO / EDITAR USUARIO                                   */}
      {/* ============================================================== */}
      {modalUsuarioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl border border-[#D8A814] bg-white p-7 shadow-2xl">
            <div className="mb-6 flex items-center justify-between border-b border-[#EEEEEE] pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#D8A814]">
                  {editingUsuario ? "Actualizar Registro" : "Crear Cuenta"}
                </p>
                <h3 className="text-xl font-extrabold text-black">
                  {editingUsuario ? "Editar Usuario" : "Nuevo Usuario"}
                </h3>
              </div>

              <button
                onClick={() => setModalUsuarioOpen(false)}
                className="text-[#888] hover:text-black"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUsuario} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-[#555]">
                  Nombre Completo *
                </label>
                <input
                  required
                  value={usuarioForm.nombre}
                  onChange={(e) =>
                    setUsuarioForm({ ...usuarioForm, nombre: e.target.value })
                  }
                  placeholder="Ej. Juan Pérez"
                  className="mt-1 h-11 w-full border border-[#D1D1D1] bg-[#FAFAFA] px-3 text-sm text-black outline-none focus:border-[#D8A814] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase text-[#555]">
                    Correo Electrónico *
                  </label>
                  <input
                    required
                    type="email"
                    value={usuarioForm.email}
                    onChange={(e) =>
                      setUsuarioForm({ ...usuarioForm, email: e.target.value })
                    }
                    placeholder="juan@empresa.com"
                    className="mt-1 h-11 w-full border border-[#D1D1D1] bg-[#FAFAFA] px-3 text-sm text-black outline-none focus:border-[#D8A814] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-[#555]">
                    Teléfono
                  </label>
                  <input
                    value={usuarioForm.telefono}
                    onChange={(e) =>
                      setUsuarioForm({ ...usuarioForm, telefono: e.target.value })
                    }
                    placeholder="249 123 4567"
                    className="mt-1 h-11 w-full border border-[#D1D1D1] bg-[#FAFAFA] px-3 text-sm text-black outline-none focus:border-[#D8A814] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase text-[#555]">
                    {editingUsuario
                      ? "Nueva Contraseña (Opcional)"
                      : "Contraseña de Acceso *"}
                  </label>
                  <input
                    type="password"
                    required={!editingUsuario}
                    value={usuarioForm.password}
                    onChange={(e) =>
                      setUsuarioForm({ ...usuarioForm, password: e.target.value })
                    }
                    placeholder={editingUsuario ? "••••••••" : "Mínimo 6 caracteres"}
                    className="mt-1 h-11 w-full border border-[#D1D1D1] bg-[#FAFAFA] px-3 text-sm text-black outline-none focus:border-[#D8A814] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-[#555]">
                    PIN Acceso Rápido POS (4-6 Dígitos)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={usuarioForm.pin}
                    onChange={(e) =>
                      setUsuarioForm({ ...usuarioForm, pin: e.target.value.replace(/\D/g, "") })
                    }
                    placeholder="Ej. 1234"
                    className="mt-1 h-11 w-full border border-[#D1D1D1] bg-[#FAFAFA] px-3 text-sm text-black outline-none focus:border-[#D8A814] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase text-[#555]">
                    Perfil Asignado *
                  </label>
                  <select
                    required
                    value={usuarioForm.perfilId}
                    onChange={(e) =>
                      setUsuarioForm({ ...usuarioForm, perfilId: e.target.value })
                    }
                    className="mt-1 h-11 w-full border border-[#D1D1D1] bg-[#FAFAFA] px-3 text-sm font-semibold text-black outline-none focus:border-[#D8A814] focus:bg-white"
                  >
                    <option value="">Selecciona un perfil...</option>
                    {perfiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} {p.esAdmin ? "(Admin)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-[#555]">
                    Sucursal Asignada
                  </label>
                  <select
                    value={usuarioForm.sucursalId}
                    onChange={(e) =>
                      setUsuarioForm({ ...usuarioForm, sucursalId: e.target.value })
                    }
                    className="mt-1 h-11 w-full border border-[#D1D1D1] bg-[#FAFAFA] px-3 text-sm font-semibold text-black outline-none focus:border-[#D8A814] focus:bg-white"
                  >
                    <option value="">Todas / Sucursal General</option>
                    {sucursales.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="usuarioActivoCheck"
                  checked={usuarioForm.activo}
                  onChange={(e) =>
                    setUsuarioForm({ ...usuarioForm, activo: e.target.checked })
                  }
                  className="h-4 w-4 accent-[#D8A814]"
                />
                <label
                  htmlFor="usuarioActivoCheck"
                  className="text-xs font-bold text-black cursor-pointer"
                >
                  Usuario Activo (Permite iniciar sesión en CRM y Punto de Venta)
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#EEEEEE] pt-5">
                <button
                  type="button"
                  onClick={() => setModalUsuarioOpen(false)}
                  className="h-11 px-5 text-sm font-semibold text-[#666] hover:text-black"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex h-11 items-center gap-2 bg-[#D8A814] px-6 text-sm font-bold text-white hover:bg-black transition-colors disabled:opacity-50"
                >
                  {saving && <RefreshCw size={16} className="animate-spin" />}
                  {editingUsuario ? "Actualizar Usuario" : "Crear Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: NUEVO / EDITAR PERFIL                                    */}
      {/* ============================================================== */}
      {modalPerfilOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg border border-[#D8A814] bg-white p-7 shadow-2xl">
            <div className="mb-6 flex items-center justify-between border-b border-[#EEEEEE] pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#D8A814]">
                  Gestión de Seguridad
                </p>
                <h3 className="text-xl font-extrabold text-black">
                  {editingPerfil ? "Editar Perfil" : "Nuevo Perfil"}
                </h3>
              </div>

              <button
                onClick={() => setModalPerfilOpen(false)}
                className="text-[#888] hover:text-black"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePerfil} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-[#555]">
                  Nombre del Perfil *
                </label>
                <input
                  required
                  value={perfilForm.nombre}
                  onChange={(e) =>
                    setPerfilForm({ ...perfilForm, nombre: e.target.value })
                  }
                  placeholder="Ej. Cajero Nocturno, Supervisor de Tienda"
                  className="mt-1 h-11 w-full border border-[#D1D1D1] bg-[#FAFAFA] px-3 text-sm text-black outline-none focus:border-[#D8A814] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#555]">
                  Descripción del Perfil
                </label>
                <textarea
                  rows={2}
                  value={perfilForm.descripcion}
                  onChange={(e) =>
                    setPerfilForm({ ...perfilForm, descripcion: e.target.value })
                  }
                  placeholder="Describe las funciones y responsabilidades de este perfil..."
                  className="mt-1 w-full border border-[#D1D1D1] bg-[#FAFAFA] p-3 text-sm text-black outline-none focus:border-[#D8A814] focus:bg-white"
                />
              </div>

              {!editingPerfil && (
                <div>
                  <label className="text-xs font-bold uppercase text-[#555]">
                    Plantilla Base de Permisos
                  </label>
                  <select
                    value={perfilForm.plantillaBase}
                    onChange={(e) =>
                      setPerfilForm({ ...perfilForm, plantillaBase: e.target.value })
                    }
                    className="mt-1 h-11 w-full border border-[#D1D1D1] bg-[#FAFAFA] px-3 text-sm font-semibold text-black outline-none focus:border-[#D8A814] focus:bg-white"
                  >
                    <option value="cajero">Cajero (Operación POS y corte de caja)</option>
                    <option value="vendedor">Vendedor (Venta y consulta de stock)</option>
                    <option value="admin">Administrador (Acceso total)</option>
                    <option value="personalizado">En blanco (Personalizar desde cero)</option>
                  </select>
                  <p className="mt-1 text-[11px] text-[#777777]">
                    Podrás ajustar cada permiso individualmente tras crearlo.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-[#EEEEEE] pt-5">
                <button
                  type="button"
                  onClick={() => setModalPerfilOpen(false)}
                  className="h-11 px-5 text-sm font-semibold text-[#666] hover:text-black"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex h-11 items-center gap-2 bg-[#D8A814] px-6 text-sm font-bold text-white hover:bg-black transition-colors disabled:opacity-50"
                >
                  {saving && <RefreshCw size={16} className="animate-spin" />}
                  {editingPerfil ? "Guardar Cambios" : "Crear Perfil"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CONFIRMACIÓN DE ELIMINACIÓN                             */}
      {/* ============================================================== */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md border border-red-500 bg-white p-7 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black">
                  Confirmar Eliminación
                </h3>
                <p className="text-xs text-[#777]">Esta acción no se puede deshacer.</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-[#444]">
              ¿Estás seguro de que deseas eliminar el {confirmDelete.tipo}{" "}
              <strong className="text-black">{confirmDelete.nombre}</strong>?
            </p>

            <div className="mt-6 flex justify-end gap-3 border-t border-[#EEEEEE] pt-4">
              <button
                onClick={() => setConfirmDelete(null)}
                className="h-10 px-4 text-sm font-semibold text-[#666] hover:text-black"
              >
                Cancelar
              </button>
              <button
                disabled={saving}
                onClick={() =>
                  confirmDelete.tipo === "usuario"
                    ? handleDeleteUsuario(confirmDelete.id)
                    : handleDeletePerfil(confirmDelete.id)
                }
                className="h-10 bg-red-600 px-5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? "Eliminando..." : "Eliminar Definitivamente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}