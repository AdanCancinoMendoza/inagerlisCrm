"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSidebar } from "@/context/SidebarContext";
import {
  Building2,
  Terminal as TerminalIcon,
  Plus,
  Loader2,
  Check,
  X,
  AlertTriangle,
  Store,
  MapPin,
  Phone,
  Power,
  Users,
  ShieldCheck,
  KeyRound,
  ChevronDown,
  ChevronUp,
  FolderTree,
  Receipt,
  UserPlus,
  ArrowLeft,
  Mail,
  UserCheck,
  Lock,
} from "lucide-react";
import { apiRequest } from "@/services/api";
import { getOrganizacionId, getUsuarioActual } from "@/services/auth";

type TipoCreacion = "opciones" | "sucursal" | "terminal" | "usuario" | "perfil";

export default function MiOrganizacionPage() {
  const { collapsed } = useSidebar();
  const [loading, setLoading] = useState(true);

  // Datos reales
  const [orgData, setOrgData] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [terminals, setTerminals] = useState<any[]>([]);
  const [perfiles, setPerfiles] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);

  // Estados visuales del esquema
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTabBranch, setActiveTabBranch] = useState<Record<string, "terminales" | "usuarios">>({});
  const [collapsedBranches, setCollapsedBranches] = useState<Record<string, boolean>>({});

  // MODAL ÚNICO DE CREACIÓN (Con selector amigable)
  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [tipoCrear, setTipoCrear] = useState<TipoCreacion>("opciones");
  const [savingElement, setSavingElement] = useState(false);

  // Formulario Sucursal
  const [sucursalForm, setSucursalForm] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
  });

  // Formulario Terminal
  const [terminalForm, setTerminalForm] = useState({
    nombre: "",
    sucursalId: "",
    usuarioEncargadoId: "",
  });

  // Formulario Usuario / Cajero
  const [usuarioForm, setUsuarioForm] = useState({
    nombre: "",
    email: "",
    password: "",
    pin: "",
    telefono: "",
    sucursalId: "",
    perfilId: "",
  });

  // Formulario Perfil
  const [perfilForm, setPerfilForm] = useState({
    nombre: "",
    descripcion: "",
    permisoCobrar: true,
    permisoDescuento: false,
    permisoCorte: true,
    permisoCancelar: false,
  });

  // Modal para Asignar / Cambiar Cajero de una Terminal
  const [modalAsignarCajero, setModalAsignarCajero] = useState(false);
  const [terminalSeleccionada, setTerminalSeleccionada] = useState<any>(null);
  const [cajeroSeleccionadoId, setCajeroSeleccionadoId] = useState<string>("");
  const [savingAsignacion, setSavingAsignacion] = useState(false);

  // Notificaciones
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cerrar Modal Único de Creación
  const closeModalCrear = useCallback(() => {
    if (savingElement) return;
    setModalCrearOpen(false);
    setTipoCrear("opciones");
    setSucursalForm({ nombre: "", direccion: "", telefono: "" });
    setTerminalForm({ nombre: "", sucursalId: "", usuarioEncargadoId: "" });
    setUsuarioForm({ nombre: "", email: "", password: "", pin: "", telefono: "", sucursalId: "", perfilId: "" });
    setPerfilForm({ nombre: "", descripcion: "", permisoCobrar: true, permisoDescuento: false, permisoCorte: true, permisoCancelar: false });
  }, [savingElement]);

  const closeModalAsignarCajero = useCallback(() => {
    if (savingAsignacion) return;
    setModalAsignarCajero(false);
    setTerminalSeleccionada(null);
  }, [savingAsignacion]);

  // Listener para cerrar cualquier modal con ESC (Regla 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (modalCrearOpen && !savingElement) closeModalCrear();
        if (modalAsignarCajero && !savingAsignacion) closeModalAsignarCajero();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalCrearOpen, savingElement, closeModalCrear, modalAsignarCajero, savingAsignacion, closeModalAsignarCajero]);

  // Carga de datos Offline-First
  const loadData = useCallback(async () => {
    const currentUser = getUsuarioActual();
    const orgId = getOrganizacionId() || currentUser?.organizacionId;

    if (!orgId) {
      setLoading(false);
      return;
    }

    // 1. Cargar desde caché local de inmediato
    if (typeof window !== "undefined") {
      try {
        const cOrg = localStorage.getItem(`inagerlis_offline_org_${orgId}`);
        const cBranches = localStorage.getItem(`inagerlis_offline_sucursales_${orgId}`);
        const cTerminals = localStorage.getItem(`inagerlis_offline_terminales_${orgId}`);
        const cPerfiles = localStorage.getItem(`inagerlis_offline_perfiles_${orgId}`);
        const cUsuarios = localStorage.getItem(`inagerlis_offline_usuarios_${orgId}`);

        if (cOrg) setOrgData(JSON.parse(cOrg));
        if (cBranches) setBranches(JSON.parse(cBranches));
        if (cTerminals) setTerminals(JSON.parse(cTerminals));
        if (cPerfiles) setPerfiles(JSON.parse(cPerfiles));

        let localUsers: any[] = cUsuarios ? JSON.parse(cUsuarios) : [];
        if (currentUser && !localUsers.some((u) => u.id === currentUser.id || u.email === currentUser.email)) {
          localUsers = [currentUser, ...localUsers];
        }
        if (localUsers.length > 0) setUsuarios(localUsers);
      } catch (err) {
        console.warn("Error leyendo caché local:", err);
      }
    }

    setLoading(true);
    try {
      const [orgRes, sucursalesRes, terminalesRes, perfilesRes, usuariosRes] = await Promise.allSettled([
        apiRequest<any>(`/organizaciones/${orgId}`),
        apiRequest<any[]>(`/sucursales?organizacionId=${orgId}`),
        apiRequest<any[]>(`/terminales?organizacionId=${orgId}`),
        apiRequest<any[]>(`/perfiles?organizacionId=${orgId}`),
        apiRequest<any[]>(`/usuarios?organizacionId=${orgId}`),
      ]);

      if (orgRes.status === "fulfilled" && orgRes.value) {
        setOrgData(orgRes.value);
        if (typeof window !== "undefined") {
          localStorage.setItem(`inagerlis_offline_org_${orgId}`, JSON.stringify(orgRes.value));
        }
      }

      if (sucursalesRes.status === "fulfilled" && Array.isArray(sucursalesRes.value)) {
        setBranches(sucursalesRes.value);
        if (typeof window !== "undefined") {
          localStorage.setItem(`inagerlis_offline_sucursales_${orgId}`, JSON.stringify(sucursalesRes.value));
        }
      }

      if (terminalesRes.status === "fulfilled" && Array.isArray(terminalesRes.value)) {
        setTerminals(terminalesRes.value);
        if (typeof window !== "undefined") {
          localStorage.setItem(`inagerlis_offline_terminales_${orgId}`, JSON.stringify(terminalesRes.value));
        }
      }

      if (perfilesRes.status === "fulfilled" && Array.isArray(perfilesRes.value)) {
        setPerfiles(perfilesRes.value);
        if (typeof window !== "undefined") {
          localStorage.setItem(`inagerlis_offline_perfiles_${orgId}`, JSON.stringify(perfilesRes.value));
        }
      }

      let fetchedUsers: any[] = [];
      if (usuariosRes.status === "fulfilled" && Array.isArray(usuariosRes.value)) {
        fetchedUsers = usuariosRes.value;
      }
      // Garantizar que el usuario en sesión aparezca siempre en la lista
      if (currentUser && !fetchedUsers.some((u) => u.id === currentUser.id || u.email === currentUser.email)) {
        fetchedUsers = [currentUser, ...fetchedUsers];
      }

      if (fetchedUsers.length > 0) {
        setUsuarios(fetchedUsers);
        if (typeof window !== "undefined") {
          localStorage.setItem(`inagerlis_offline_usuarios_${orgId}`, JSON.stringify(fetchedUsers));
        }
      }
    } catch (err) {
      console.warn("Servidor inalcanzable, operando en modo offline:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Manejo de Creación: Sucursal
  const handleSaveSucursal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sucursalForm.nombre.trim()) return;

    const user = getUsuarioActual();
    const orgId = getOrganizacionId() || user?.organizacionId;
    if (!orgId) return;

    setSavingElement(true);
    setErrorMsg(null);
    try {
      const res = await apiRequest<any>("/sucursales", {
        method: "POST",
        body: JSON.stringify({
          organizacionId: orgId,
          nombre: sucursalForm.nombre.trim(),
          direccion: sucursalForm.direccion.trim() || undefined,
          telefono: sucursalForm.telefono.trim() || undefined,
        }),
      }).catch(() => ({
        id: `suc_local_${Date.now()}`,
        organizacionId: orgId,
        nombre: sucursalForm.nombre.trim(),
        direccion: sucursalForm.direccion.trim() || "Matriz",
        telefono: sucursalForm.telefono.trim() || "",
        activo: true,
      }));

      const updated = [...branches, res];
      setBranches(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem(`inagerlis_offline_sucursales_${orgId}`, JSON.stringify(updated));
      }

      setSuccessMsg(`Sucursal "${res.nombre}" registrada correctamente.`);
      closeModalCrear();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err?.message || "No se pudo registrar la sucursal.");
    } finally {
      setSavingElement(false);
    }
  };

  // Manejo de Creación: Terminal
  const handleSaveTerminal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalForm.nombre.trim() || !terminalForm.sucursalId) return;

    const user = getUsuarioActual();
    const orgId = getOrganizacionId() || user?.organizacionId;
    if (!orgId) return;

    setSavingElement(true);
    setErrorMsg(null);
    try {
      const selectedSucursal = branches.find((b) => b.id === terminalForm.sucursalId);
      const res = await apiRequest<any>("/terminales", {
        method: "POST",
        body: JSON.stringify({
          nombre: terminalForm.nombre.trim(),
          sucursalId: terminalForm.sucursalId,
          usuarioEncargadoId: terminalForm.usuarioEncargadoId || undefined,
        }),
      }).catch(() => ({
        id: `term_local_${Date.now()}`,
        sucursalId: terminalForm.sucursalId,
        nombre: terminalForm.nombre.trim(),
        estado: "Cerrada",
        usuarioEncargadoId: terminalForm.usuarioEncargadoId || null,
        sucursal: selectedSucursal ? { id: selectedSucursal.id, nombre: selectedSucursal.nombre } : undefined,
      }));

      const updated = [...terminals, res];
      setTerminals(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem(`inagerlis_offline_terminales_${orgId}`, JSON.stringify(updated));
      }

      setSuccessMsg(`Terminal "${res.nombre}" registrada.`);
      closeModalCrear();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err?.message || "No se pudo registrar la terminal.");
    } finally {
      setSavingElement(false);
    }
  };

  // Manejo de Creación: Usuario / Cajero
  const handleSaveUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioForm.nombre.trim() || !usuarioForm.email.trim() || !usuarioForm.password.trim() || !usuarioForm.perfilId) {
      return;
    }

    const user = getUsuarioActual();
    const orgId = getOrganizacionId() || user?.organizacionId;
    if (!orgId) return;

    setSavingElement(true);
    setErrorMsg(null);
    try {
      const selectedPerfil = perfiles.find((p) => p.id === usuarioForm.perfilId);
      const selectedSucursal = branches.find((b) => b.id === usuarioForm.sucursalId);

      const res = await apiRequest<any>("/usuarios", {
        method: "POST",
        body: JSON.stringify({
          organizacionId: orgId,
          nombre: usuarioForm.nombre.trim(),
          email: usuarioForm.email.trim().toLowerCase(),
          password: usuarioForm.password,
          pin: usuarioForm.pin.trim() || undefined,
          telefono: usuarioForm.telefono.trim() || undefined,
          sucursalId: usuarioForm.sucursalId || undefined,
          perfilId: usuarioForm.perfilId,
          activo: true,
        }),
      }).catch(() => ({
        id: `usr_local_${Date.now()}`,
        organizacionId: orgId,
        nombre: usuarioForm.nombre.trim(),
        email: usuarioForm.email.trim().toLowerCase(),
        telefono: usuarioForm.telefono.trim(),
        pin: usuarioForm.pin.trim(),
        sucursalId: usuarioForm.sucursalId || null,
        perfilId: usuarioForm.perfilId,
        perfil: selectedPerfil ? { id: selectedPerfil.id, nombre: selectedPerfil.nombre, esAdmin: selectedPerfil.esAdmin } : { nombre: "Cajero" },
        sucursal: selectedSucursal ? { id: selectedSucursal.id, nombre: selectedSucursal.nombre } : null,
        activo: true,
      }));

      const updated = [...usuarios, res];
      setUsuarios(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem(`inagerlis_offline_usuarios_${orgId}`, JSON.stringify(updated));
      }

      setSuccessMsg(`Colaborador "${res.nombre}" registrado exitosamente.`);
      closeModalCrear();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err?.message || "No se pudo registrar el usuario.");
    } finally {
      setSavingElement(false);
    }
  };

  // Manejo de Creación: Perfil
  const handleSavePerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perfilForm.nombre.trim()) return;

    const user = getUsuarioActual();
    const orgId = getOrganizacionId() || user?.organizacionId;
    if (!orgId) return;

    setSavingElement(true);
    try {
      const permisos = {
        pos: {
          realizarCobros: perfilForm.permisoCobrar,
          aplicarDescuentos: perfilForm.permisoDescuento,
          corteCaja: perfilForm.permisoCorte,
          cancelarTickets: perfilForm.permisoCancelar,
        },
      };

      const res = await apiRequest<any>("/perfiles", {
        method: "POST",
        body: JSON.stringify({
          organizacionId: orgId,
          nombre: perfilForm.nombre.trim(),
          descripcion: perfilForm.descripcion.trim() || undefined,
          esAdmin: false,
          activo: true,
          permisos,
        }),
      }).catch(() => ({
        id: `perf_local_${Date.now()}`,
        organizacionId: orgId,
        nombre: perfilForm.nombre.trim(),
        descripcion: perfilForm.descripcion.trim(),
        esAdmin: false,
        activo: true,
        permisos,
      }));

      const updated = [...perfiles, res];
      setPerfiles(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem(`inagerlis_offline_perfiles_${orgId}`, JSON.stringify(updated));
      }

      setSuccessMsg(`Perfil "${res.nombre}" creado.`);
      closeModalCrear();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err?.message || "No se pudo crear el perfil.");
    } finally {
      setSavingElement(false);
    }
  };

  // Alternar Estado de Terminal
  const handleToggleTerminal = async (terminalId: string, currentEstado: string) => {
    const nuevoEstado = currentEstado === "Abierta" ? "Cerrada" : "Abierta";
    const user = getUsuarioActual();
    const orgId = getOrganizacionId() || user?.organizacionId;

    const updated = terminals.map((t) => (t.id === terminalId ? { ...t, estado: nuevoEstado } : t));
    setTerminals(updated);
    if (typeof window !== "undefined" && orgId) {
      localStorage.setItem(`inagerlis_offline_terminales_${orgId}`, JSON.stringify(updated));
    }

    try {
      await apiRequest(`/terminales/${terminalId}/estado`, {
        method: "PATCH",
        body: JSON.stringify({ estado: nuevoEstado }),
      });
    } catch (err) {
      console.warn("Estado sincronizado en local:", err);
    }
  };

  // Asignar Cajero a Terminal
  const openModalAsignarCajero = (terminal: any) => {
    setTerminalSeleccionada(terminal);
    setCajeroSeleccionadoId(terminal.usuarioEncargadoId || "");
    setModalAsignarCajero(true);
  };

  const handleSaveAsignacionCajero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalSeleccionada) return;

    const user = getUsuarioActual();
    const orgId = getOrganizacionId() || user?.organizacionId;
    setSavingAsignacion(true);

    try {
      await apiRequest(`/terminales/${terminalSeleccionada.id}`, {
        method: "PUT",
        body: JSON.stringify({
          usuarioEncargadoId: cajeroSeleccionadoId || null,
        }),
      }).catch(() => null);

      const updated = terminals.map((t) =>
        t.id === terminalSeleccionada.id ? { ...t, usuarioEncargadoId: cajeroSeleccionadoId || null } : t
      );
      setTerminals(updated);
      if (typeof window !== "undefined" && orgId) {
        localStorage.setItem(`inagerlis_offline_terminales_${orgId}`, JSON.stringify(updated));
      }

      setSuccessMsg("Cajero asignado correctamente a la caja.");
      closeModalAsignarCajero();
      setTimeout(() => setSuccessMsg(null), 4000);
    } finally {
      setSavingAsignacion(false);
    }
  };

  // Filtrado de sucursales
  const filteredBranches = useMemo(() => {
    if (!searchQuery.trim()) return branches;
    const q = searchQuery.toLowerCase().trim();
    return branches.filter((branch) => {
      const matchBranch = branch.nombre?.toLowerCase().includes(q) || branch.direccion?.toLowerCase().includes(q);
      const branchTerminals = terminals.filter((t) => t.sucursalId === branch.id);
      const matchTerminal = branchTerminals.some((t) => t.nombre?.toLowerCase().includes(q));
      const branchUsers = usuarios.filter((u) => u.sucursalId === branch.id || (!u.sucursalId && branches.length === 1));
      const matchUser = branchUsers.some((u) => u.nombre?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
      return matchBranch || matchTerminal || matchUser;
    });
  }, [branches, terminals, usuarios, searchQuery]);

  const handleExpandAll = () => {
    setCollapsedBranches({});
  };

  const handleCollapseAll = () => {
    const c: Record<string, boolean> = {};
    branches.forEach((b) => {
      c[b.id] = true;
    });
    setCollapsedBranches(c);
  };

  const toggleBranchCollapse = (branchId: string) => {
    setCollapsedBranches((prev) => ({
      ...prev,
      [branchId]: !prev[branchId],
    }));
  };

  return (
    <main className="crm-layout-container bg-[#F7F7F7] text-black transition-colors duration-200">
      <Sidebar />

      <div className={`crm-main-content ${collapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}>
        <Header />

        <div className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 w-full min-w-0">
          {/* =========================================================
              ENCABEZADO CORPORATIVO CON BOTÓN ÚNICO DE CREACIÓN
          ========================================================= */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E2E2] pb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                Esquema Jerárquico Corporativo
              </p>
              <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-black">
                Mi Organización y Estructura Operativa
              </h1>
              <p className="mt-1 text-xs text-[#666666] max-w-3xl">
                Visualiza y manipula la jerarquía completa de tu negocio: desde la matriz central, pasando por las sucursales, hasta las terminales de cobro con sus perfiles autorizados y colaboradores.
              </p>
            </div>

            {/* BOTÓN ÚNICO DE REGISTRO (Solicitado explícitamente: solo 1 botón que pregunta qué quieres) */}
            <button
              type="button"
              onClick={() => {
                setTipoCrear("opciones");
                setModalCrearOpen(true);
              }}
              className="flex items-center justify-center gap-2 border border-black bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] hover:bg-[#222222] transition-colors cursor-pointer shadow-sm active:scale-95 shrink-0"
            >
              <Plus size={16} />
              <span>Registrar o Crear</span>
            </button>
          </div>

          {/* Notificaciones */}
          {successMsg && (
            <div className="flex items-center justify-between border border-emerald-300 bg-emerald-50 px-5 py-3 text-emerald-800">
              <div className="flex items-center gap-2.5">
                <Check size={16} className="text-emerald-600 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">{successMsg}</span>
              </div>
              <button type="button" onClick={() => setSuccessMsg(null)}>
                <X size={15} />
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center justify-between border border-red-300 bg-red-50 px-5 py-3 text-red-800">
              <div className="flex items-center gap-2.5">
                <AlertTriangle size={16} className="text-red-600 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">{errorMsg}</span>
              </div>
              <button type="button" onClick={() => setErrorMsg(null)}>
                <X size={15} />
              </button>
            </div>
          )}

          {/* BARRA DE HERRAMIENTAS Y CONTROLES DEL ÁRBOL */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[#E5E5E5] bg-white p-3 shadow-2xs">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar sucursal, terminal o colaborador..."
                className="w-full h-10 border border-[#DDDDDD] bg-[#FAFAFA] pl-9 pr-3 text-xs text-black placeholder-[#888888] focus:border-[var(--primary)] focus:bg-white outline-none"
              />
              <span className="absolute left-3 top-2.5 text-[#888888]">
                <FolderTree size={15} />
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExpandAll}
                className="px-3 py-2 border border-[#DDDDDD] bg-[#FAFAFA] text-[11px] font-bold uppercase tracking-wider text-[#555555] hover:text-black hover:border-black transition-colors cursor-pointer"
              >
                Expandir Todo
              </button>
              <button
                type="button"
                onClick={handleCollapseAll}
                className="px-3 py-2 border border-[#DDDDDD] bg-[#FAFAFA] text-[11px] font-bold uppercase tracking-wider text-[#555555] hover:text-black hover:border-black transition-colors cursor-pointer"
              >
                Colapsar Todo
              </button>
              <div className="flex items-center gap-1.5 px-3 py-2 border border-black bg-black text-white text-[11px] font-bold uppercase tracking-wider">
                <FolderTree size={14} className="text-[var(--primary)]" />
                <span>Vista Árbol</span>
              </div>
            </div>
          </div>

          {/* =========================================================
              NIVEL 1 · CABEZA DE ORGANIZACIÓN (MATRIZ CENTRAL)
          ========================================================= */}
          <div className="border-2 border-[#D8A814] bg-white p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-5 border-b border-[#F0F0F0]">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-[#D8A814] bg-[#FAF6E8] text-[#D8A814] shadow-2xs">
                  <Building2 size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                      Nivel 1 · Cabeza de Organización
                    </span>
                    <span className="border border-emerald-400 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                      Matriz Central
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-black mt-1">
                    {orgData?.nombre || "Inagerlis Inc"}
                  </h2>
                </div>
              </div>

              {/* Resumen Métrico */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="border border-[#E5E5E5] bg-[#FAFAFA] px-4 py-2 min-w-[110px]">
                  <p className="text-[10px] uppercase font-bold text-[#777777] tracking-wider">Sucursales</p>
                  <p className="text-xl font-bold font-mono text-black">{branches.length}</p>
                </div>
                <div className="border border-[#E5E5E5] bg-[#FAFAFA] px-4 py-2 min-w-[110px]">
                  <p className="text-[10px] uppercase font-bold text-[#777777] tracking-wider">Terminales POS</p>
                  <p className="text-xl font-bold font-mono text-[var(--primary)]">{terminals.length}</p>
                </div>
                <div className="border border-[#E5E5E5] bg-[#FAFAFA] px-4 py-2 min-w-[110px]">
                  <p className="text-[10px] uppercase font-bold text-[#777777] tracking-wider">Equipo / Cajeros</p>
                  <p className="text-xl font-bold font-mono text-black">{usuarios.length}</p>
                </div>
                <div className="border border-[#E5E5E5] bg-[#FAFAFA] px-4 py-2 min-w-[110px]">
                  <p className="text-[10px] uppercase font-bold text-[#777777] tracking-wider">Perfiles</p>
                  <p className="text-xl font-bold font-mono text-black">{perfiles.length}</p>
                </div>
              </div>
            </div>

            {/* Fila Inferior con Metadatos Fiscales y Corporativos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">Razón Social</p>
                <p className="font-semibold text-black mt-0.5">{orgData?.nombre || "Inagerlis Inc"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">RFC Corporativo</p>
                <p className="font-mono font-bold text-black mt-0.5">{orgData?.rfc || "XAXX010101000"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">Dirección Central</p>
                <p className="text-black mt-0.5">{orgData?.direccion || "Sede central corporativa"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">Régimen e Impuestos</p>
                <p className="text-black font-semibold mt-0.5">
                  {orgData?.regimenFiscal || "601 - General de Ley"} · {orgData?.ivaActivo !== false ? `IVA ${orgData?.porcentajeIva || "16"}%` : "IVA 0% (Exento)"}
                </p>
              </div>
            </div>
          </div>

          {/* =========================================================
              CONECTOR CENTRAL DEL DIAGRAMA DE ÁRBOL
          ========================================================= */}
          <div className="flex flex-col items-center my-0">
            <div className="w-[2px] h-8 bg-[#D8A814]" />
            <div className="border border-[#D8A814] bg-[#FFFBF0] text-[#937107] px-5 py-1.5 text-xs font-bold uppercase tracking-[0.18em] shadow-2xs">
              Nivel 2 · Ramas de Sucursales ({filteredBranches.length})
            </div>
            <div className="w-[2px] h-8 bg-[#D8A814]" />
          </div>

          {/* =========================================================
              NIVEL 2: RAMAS DE SUCURSALES Y NIVEL 3 (ÁRBOL OPERATIVO)
          ========================================================= */}
          {loading && branches.length === 0 ? (
            <div className="border border-[#E2E2E2] bg-white p-12 text-center">
              <Loader2 size={28} className="animate-spin mx-auto text-[var(--primary)]" />
              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-[#777777]">
                Cargando estructura organizacional...
              </p>
            </div>
          ) : filteredBranches.length === 0 ? (
            <div className="border border-[#E2E2E2] bg-white p-10 text-center space-y-3">
              <Store size={40} className="mx-auto text-[#CCCCCC]" />
              <h3 className="text-base font-bold text-black">
                No hay sucursales registradas todavía
              </h3>
              <p className="text-xs text-[#777777] max-w-sm mx-auto">
                Registra tu primera sucursal para organizar tus cajas de cobro y equipo de colaboradores.
              </p>
              <button
                type="button"
                onClick={() => {
                  setTipoCrear("sucursal");
                  setModalCrearOpen(true);
                }}
                className="mt-2 inline-flex items-center gap-2 border border-black bg-black text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                <Plus size={15} />
                <span>Registrar Sucursal</span>
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredBranches.map((branch, index) => {
                const branchTerminals = terminals.filter((t) => t.sucursalId === branch.id);
                // Colaboradores asignados a esta sucursal (o usuarios generales de la organización si solo hay 1 sucursal)
                const branchUsers = usuarios.filter((u) => u.sucursalId === branch.id || (!u.sucursalId && branches.length === 1));
                const isCollapsed = collapsedBranches[branch.id] || false;

                return (
                  <div key={branch.id} className="border border-[#DCDCDC] bg-white shadow-sm">
                    {/* Encabezado Sucursal */}
                    <div className="p-5 border-b border-[#EEEEEE] bg-[#FAFAFA] flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-11 w-11 items-center justify-center border border-[#D8A814] bg-[#FAF6E8] text-[#D8A814] shrink-0">
                          <Store size={22} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">
                              Sucursal #{index + 1}
                            </span>
                            <span className="border border-emerald-400 bg-emerald-50 px-2 py-0.2 text-[9px] font-bold uppercase text-emerald-700">
                              Activa
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-black mt-0.5">
                            {branch.nombre}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#777777] mt-0.5">
                            <span className="flex items-center gap-1">
                              <MapPin size={13} className="text-[#999999]" />
                              {branch.direccion || "Dirección no especificada"}
                            </span>
                            {branch.telefono && (
                              <span className="flex items-center gap-1">
                                <Phone size={13} className="text-[#999999]" />
                                {branch.telefono}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleBranchCollapse(branch.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-[#CCCCCC] bg-white hover:border-black text-xs font-bold uppercase tracking-wider text-[#555555] hover:text-black transition-colors cursor-pointer"
                        >
                          {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                          <span>{isCollapsed ? "Expandir" : "Ocultar"}</span>
                        </button>
                      </div>
                    </div>

                    {/* CONTENIDO NIVEL 3: TERMINALES Y USUARIOS VISIBLES */}
                    {!isCollapsed && (
                      <div className="p-6 bg-white space-y-6">
                        {/* Título Nivel 3 */}
                        <div className="border-b border-[#F0F0F0] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
                              Nivel 3 · Terminales de Cobro y Equipo de Trabajo
                            </p>
                            <p className="text-xs text-[#777777] mt-0.5">
                              Visualiza las cajas registradoras POS y los colaboradores autorizados para operar en caja.
                            </p>
                          </div>
                          <div className="text-xs font-mono text-[#888888]">
                            {branchTerminals.length} Cajas POS · {branchUsers.length} Colaboradores
                          </div>
                        </div>

                        {/* DOS SUB-RAMAS: TERMINALES Y COLABORADORES */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* SUB-RAMA 1: TERMINALES Y CAJAS POS */}
                          <div className="border border-[#E2E2E2] bg-[#FAFAFA] p-5">
                            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5] mb-4">
                              <div className="flex items-center gap-2">
                                <TerminalIcon size={16} className="text-[var(--primary)]" />
                                <h4 className="text-xs font-bold uppercase tracking-wider text-black">
                                  Terminales y Cajas POS ({branchTerminals.length})
                                </h4>
                              </div>
                              <span className="text-[10px] text-[#777777] font-mono">Puntos de Venta</span>
                            </div>

                            {branchTerminals.length === 0 ? (
                              <div className="border border-dashed border-[#DDDDDD] bg-white p-6 text-center">
                                <p className="text-xs font-bold text-black uppercase tracking-wider">
                                  Sin cajas registradas en esta sucursal
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTerminalForm({
                                      nombre: `Caja 0${branchTerminals.length + 1}`,
                                      sucursalId: branch.id,
                                      usuarioEncargadoId: "",
                                    });
                                    setTipoCrear("terminal");
                                    setModalCrearOpen(true);
                                  }}
                                  className="mt-3 inline-flex items-center gap-1.5 border border-black bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
                                >
                                  <Plus size={14} />
                                  <span>Agregar Caja en {branch.nombre}</span>
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {branchTerminals.map((terminal) => {
                                  const isOpen = terminal.estado === "Abierta" || terminal.status;
                                  const assignedUser = usuarios.find((u) => u.id === terminal.usuarioEncargadoId);

                                  return (
                                    <div
                                      key={terminal.id}
                                      className="border border-[#DDDDDD] bg-white p-4 shadow-2xs space-y-3"
                                    >
                                      {/* Header de la Caja */}
                                      <div className="flex items-center justify-between pb-2 border-b border-[#F0F0F0]">
                                        <div className="flex items-center gap-2.5">
                                          <div className="h-7 w-7 border border-[#CCCCCC] bg-[#FAFAFA] flex items-center justify-center font-bold text-black text-xs font-mono">
                                            &gt;_
                                          </div>
                                          <div>
                                            <h5 className="text-sm font-bold text-black">
                                              {terminal.nombre}
                                            </h5>
                                            <p className="text-[10px] font-mono text-[#777777]">
                                              {terminal.codigo || `TERM-${terminal.id.slice(0, 4).toUpperCase()}`} · Sucursal: {branch.nombre}
                                            </p>
                                          </div>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => handleToggleTerminal(terminal.id, terminal.estado)}
                                          className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border cursor-pointer ${
                                            isOpen
                                              ? "border-emerald-600 bg-emerald-600 text-white"
                                              : "border-[#CCCCCC] bg-white text-[#777777]"
                                          }`}
                                          title="Haz clic para abrir o cerrar caja"
                                        >
                                          <Power size={11} />
                                          <span>{isOpen ? "Abierta" : "Cerrada"}</span>
                                        </button>
                                      </div>

                                      {/* Cajero Asignado */}
                                      <div className="border border-[#F0F0F0] bg-[#FAFAFA] p-2.5">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
                                            Cajero Asignado
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => openModalAsignarCajero(terminal)}
                                            className="text-[10px] font-bold uppercase text-[var(--primary)] hover:underline cursor-pointer"
                                          >
                                            {assignedUser ? "Cambiar" : "+ Asignar Cajero"}
                                          </button>
                                        </div>

                                        {assignedUser ? (
                                          <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 border border-black bg-black text-white flex items-center justify-center font-bold text-[10px]">
                                              {assignedUser.nombre.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-xs font-bold text-black">
                                              {assignedUser.nombre}
                                            </span>
                                            <span className="text-[10px] text-[#777777]">
                                              ({assignedUser.perfil?.nombre || "Cajero"})
                                            </span>
                                          </div>
                                        ) : (
                                          <p className="text-xs text-[#888888] italic">
                                            Sin cajero fijo asignado (Uso rotativo)
                                          </p>
                                        )}
                                      </div>

                                      {/* Perfiles de Acceso Autorizados */}
                                      <div>
                                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#777777] mb-1.5">
                                          <span>Perfiles de Acceso Autorizados</span>
                                          <span className="text-[var(--primary)]">Gestionar</span>
                                        </div>
                                        <div className="space-y-1.5">
                                          <div className="flex items-center justify-between border border-[#EAEAEA] bg-[#FAFAFA] px-2.5 py-1 text-xs">
                                            <div className="flex items-center gap-1.5">
                                              <span className="h-2 w-2 bg-[var(--primary)]" />
                                              <span className="font-bold text-black text-[11px]">Administrador</span>
                                              <span className="text-[10px] text-[#777777] hidden sm:inline">· Control total</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <span className="border border-[#DDDDDD] bg-white px-1.5 py-0.2 text-[9px] font-bold uppercase">Cobros</span>
                                              <span className="border border-[var(--primary)] bg-[#FAF6E8] text-[#937107] px-1.5 py-0.2 text-[9px] font-bold uppercase">Admin</span>
                                            </div>
                                          </div>

                                          <div className="flex items-center justify-between border border-[#EAEAEA] bg-[#FAFAFA] px-2.5 py-1 text-xs">
                                            <div className="flex items-center gap-1.5">
                                              <span className="h-2 w-2 bg-[#777777]" />
                                              <span className="font-bold text-black text-[11px]">Cajero</span>
                                              <span className="text-[10px] text-[#777777] hidden sm:inline">· Operación en Punto de Venta</span>
                                            </div>
                                            <span className="border border-[#DDDDDD] bg-white px-1.5 py-0.2 text-[9px] font-bold uppercase">Cobros</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Pie de la Caja */}
                                      <div className="pt-2 border-t border-[#F0F0F0] flex items-center justify-between text-[10px] text-[#777777]">
                                        <span>POS Listo para Venta</span>
                                        <span className="font-mono text-emerald-700 font-bold">Cobro Activo</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* SUB-RAMA 2: EQUIPO Y COLABORADORES ("muestra los usuarios correctamente") */}
                          <div className="border border-[#E2E2E2] bg-[#FAFAFA] p-5">
                            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5] mb-4">
                              <div className="flex items-center gap-2">
                                <Users size={16} className="text-[var(--primary)]" />
                                <h4 className="text-xs font-bold uppercase tracking-wider text-black">
                                  Colaboradores y Cajeros Asignados ({branchUsers.length})
                                </h4>
                              </div>
                              <span className="text-[10px] text-[#777777] font-mono">Personal Activo</span>
                            </div>

                            {branchUsers.length === 0 ? (
                              <div className="border border-dashed border-[#DDDDDD] bg-white p-6 text-center">
                                <Users size={32} className="mx-auto text-[#CCCCCC]" />
                                <p className="mt-2 text-xs font-bold text-black uppercase tracking-wider">
                                  Sin colaboradores en esta sucursal
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUsuarioForm((prev) => ({
                                      ...prev,
                                      sucursalId: branch.id,
                                      perfilId: perfiles[0]?.id || "",
                                    }));
                                    setTipoCrear("usuario");
                                    setModalCrearOpen(true);
                                  }}
                                  className="mt-3 inline-flex items-center gap-1.5 border border-black bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
                                >
                                  <UserPlus size={14} />
                                  <span>Registrar Colaborador</span>
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {branchUsers.map((user) => {
                                  const initials = user.nombre ? user.nombre.slice(0, 2).toUpperCase() : "US";
                                  const isUserAdmin = user.perfil?.esAdmin || user.rol === "ADMIN";
                                  const assignedTerminal = terminals.find((t) => t.usuarioEncargadoId === user.id);

                                  return (
                                    <div
                                      key={user.id}
                                      className="border border-[#DDDDDD] bg-white p-4 shadow-2xs flex flex-col justify-between space-y-2.5"
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3">
                                          <div className="h-10 w-10 border border-black bg-black text-white flex items-center justify-center font-bold text-xs shrink-0">
                                            {initials}
                                          </div>
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <h5 className="text-sm font-bold text-black">
                                                {user.nombre}
                                              </h5>
                                              {isUserAdmin && (
                                                <span className="border border-[var(--primary)] bg-[#FAF6E8] text-[#937107] px-1.5 py-0.2 text-[9px] font-bold uppercase">
                                                  Admin
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-xs text-[#666666] mt-0.5">
                                              {user.email}
                                            </p>
                                          </div>
                                        </div>

                                        {user.pin ? (
                                          <span className="border border-emerald-300 bg-emerald-50 text-emerald-800 px-2 py-0.5 text-[9px] font-bold font-mono uppercase shrink-0">
                                            PIN Activo
                                          </span>
                                        ) : (
                                          <span className="border border-[#E0E0E0] bg-[#FAFAFA] text-[#888888] px-2 py-0.5 text-[9px] font-bold uppercase shrink-0">
                                            Sin PIN
                                          </span>
                                        )}
                                      </div>

                                      {/* Perfil y Estado de Asignación a Caja POS */}
                                      <div className="pt-2 border-t border-[#F0F0F0] flex flex-wrap items-center justify-between gap-2 text-xs">
                                        <span className="text-[11px] font-bold text-[#555555]">
                                          Perfil: <strong className="text-black font-semibold">{user.perfil?.nombre || "Cajero General"}</strong>
                                        </span>

                                        {assignedTerminal ? (
                                          <span className="border border-emerald-300 bg-emerald-50 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                                            Operando: {assignedTerminal.nombre}
                                          </span>
                                        ) : (
                                          <span className="text-[10px] text-[#777777] italic">
                                            Acceso general a sucursal
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================
          MODAL ÚNICO DE CREACIÓN: PREGUNTA QUÉ DESEAS CREAR
          (Cumpliendo Regla 4: Backdrop, ESC, Botón Cerrar)
      ========================================================= */}
      {modalCrearOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModalCrear();
          }}
        >
          <div
            className="w-full max-w-xl border border-[#DCDCDC] bg-white shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-[#E5E5E5] bg-[#FAFAFA] px-6 py-4">
              <div className="flex items-center gap-3">
                {tipoCrear !== "opciones" && (
                  <button
                    type="button"
                    onClick={() => setTipoCrear("opciones")}
                    className="flex h-8 w-8 items-center justify-center border border-[#DCDCDC] bg-white text-[#555555] hover:text-black cursor-pointer mr-1"
                    title="Volver a opciones"
                  >
                    <ArrowLeft size={16} />
                  </button>
                )}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
                    Registro en Organización
                  </p>
                  <h3 className="text-base font-bold text-black">
                    {tipoCrear === "opciones" && "¿Qué deseas registrar o crear?"}
                    {tipoCrear === "sucursal" && "Registrar Nueva Sucursal"}
                    {tipoCrear === "terminal" && "Registrar Terminal de Cobro (POS)"}
                    {tipoCrear === "usuario" && "Registrar Colaborador o Cajero"}
                    {tipoCrear === "perfil" && "Crear Perfil de Permisos"}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModalCrear}
                disabled={savingElement}
                className="text-[#777777] hover:text-black cursor-pointer"
                title="Cerrar (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            {/* PASO 1: SELECCIONAR QUÉ DESEA CREAR (4 OPCIONES AMIGABLES) */}
            {tipoCrear === "opciones" && (
              <div className="p-6 space-y-3">
                <p className="text-xs text-[#777777] mb-4">
                  Selecciona el elemento que deseas agregar a la estructura de tu organización:
                </p>

                {/* Opción 1: Sucursal */}
                <button
                  type="button"
                  onClick={() => setTipoCrear("sucursal")}
                  className="w-full flex items-center justify-between p-4 border border-[#E0E0E0] bg-white hover:border-black transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="h-10 w-10 border border-[#DDDDDD] bg-[#FAFAFA] flex items-center justify-center text-black group-hover:border-[var(--primary)] group-hover:text-[var(--primary)]">
                      <Store size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-black">
                        Nueva Sucursal
                      </h4>
                      <p className="text-xs text-[#777777]">
                        Registra una nueva tienda, sede física o punto de operación.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[var(--primary)]">Elegir →</span>
                </button>

                {/* Opción 2: Terminal */}
                <button
                  type="button"
                  onClick={() => {
                    if (branches.length > 0) {
                      setTerminalForm((prev) => ({
                        ...prev,
                        sucursalId: branches[0].id,
                        nombre: `Caja 0${terminals.length + 1}`,
                      }));
                    }
                    setTipoCrear("terminal");
                  }}
                  className="w-full flex items-center justify-between p-4 border border-[#E0E0E0] bg-white hover:border-black transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="h-10 w-10 border border-[#DDDDDD] bg-[#FAFAFA] flex items-center justify-center text-black group-hover:border-[var(--primary)] group-hover:text-[var(--primary)]">
                      <TerminalIcon size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-black">
                        Nueva Terminal / Caja POS
                      </h4>
                      <p className="text-xs text-[#777777]">
                        Añade una caja de cobro y asígnala a una sucursal existente.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[var(--primary)]">Elegir →</span>
                </button>

                {/* Opción 3: Usuario / Cajero */}
                <button
                  type="button"
                  onClick={() => {
                    setUsuarioForm((prev) => ({
                      ...prev,
                      sucursalId: branches[0]?.id || "",
                      perfilId: perfiles[0]?.id || "",
                    }));
                    setTipoCrear("usuario");
                  }}
                  className="w-full flex items-center justify-between p-4 border border-[#E0E0E0] bg-white hover:border-black transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="h-10 w-10 border border-[#DDDDDD] bg-[#FAFAFA] flex items-center justify-center text-black group-hover:border-[var(--primary)] group-hover:text-[var(--primary)]">
                      <Users size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-black">
                        Nuevo Colaborador o Cajero
                      </h4>
                      <p className="text-xs text-[#777777]">
                        Da de alta a un usuario con su perfil, correo y PIN de cobro.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[var(--primary)]">Elegir →</span>
                </button>

                {/* Opción 4: Perfil de Acceso */}
                <button
                  type="button"
                  onClick={() => setTipoCrear("perfil")}
                  className="w-full flex items-center justify-between p-4 border border-[#E0E0E0] bg-white hover:border-black transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="h-10 w-10 border border-[#DDDDDD] bg-[#FAFAFA] flex items-center justify-center text-black group-hover:border-[var(--primary)] group-hover:text-[var(--primary)]">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-black">
                        Nuevo Perfil de Permisos
                      </h4>
                      <p className="text-xs text-[#777777]">
                        Configura un nuevo rol con permisos para cobro y arqueos.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[var(--primary)]">Elegir →</span>
                </button>
              </div>
            )}

            {/* FORMULARIO 1: REGISTRAR SUCURSAL */}
            {tipoCrear === "sucursal" && (
              <form onSubmit={handleSaveSucursal}>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                      Nombre de la Sucursal *
                    </label>
                    <input
                      type="text"
                      required
                      value={sucursalForm.nombre}
                      onChange={(e) => setSucursalForm({ ...sucursalForm, nombre: e.target.value })}
                      placeholder="Ej. Sucursal Matriz, Centro, Plaza Norte"
                      className="w-full h-11 border border-[#DCDCDC] bg-white px-4 text-sm text-black focus:border-[var(--primary)] outline-none"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={sucursalForm.direccion}
                      onChange={(e) => setSucursalForm({ ...sucursalForm, direccion: e.target.value })}
                      placeholder="Calle, número, colonia, código postal"
                      className="w-full h-11 border border-[#DCDCDC] bg-white px-4 text-sm text-black focus:border-[var(--primary)] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      value={sucursalForm.telefono}
                      onChange={(e) => setSucursalForm({ ...sucursalForm, telefono: e.target.value })}
                      placeholder="Ej. +52 55 1234 5678"
                      className="w-full h-11 border border-[#DCDCDC] bg-white px-4 text-sm text-black focus:border-[var(--primary)] outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-[#EEEEEE] bg-[#FAFAFA] px-6 py-4">
                  <button
                    type="button"
                    onClick={() => setTipoCrear("opciones")}
                    className="border border-[#CCCCCC] bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#555555] hover:text-black cursor-pointer"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    disabled={savingElement || !sucursalForm.nombre.trim()}
                    className="flex items-center gap-2 border border-black bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#222222] cursor-pointer disabled:opacity-40"
                  >
                    {savingElement && <Loader2 size={14} className="animate-spin" />}
                    <span>Guardar Sucursal</span>
                  </button>
                </div>
              </form>
            )}

            {/* FORMULARIO 2: REGISTRAR TERMINAL */}
            {tipoCrear === "terminal" && (
              <form onSubmit={handleSaveTerminal}>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                      Sucursal de Operación *
                    </label>
                    <select
                      required
                      value={terminalForm.sucursalId}
                      onChange={(e) => setTerminalForm({ ...terminalForm, sucursalId: e.target.value })}
                      className="w-full h-11 border border-[#DCDCDC] bg-white px-4 text-xs font-bold text-black focus:border-[var(--primary)] outline-none"
                    >
                      <option value="" disabled>Selecciona una sucursal</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.nombre} ({b.direccion || "Matriz"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                      Nombre de la Caja / Terminal *
                    </label>
                    <input
                      type="text"
                      required
                      value={terminalForm.nombre}
                      onChange={(e) => setTerminalForm({ ...terminalForm, nombre: e.target.value })}
                      placeholder="Ej. Caja 01, Terminal Rápida"
                      className="w-full h-11 border border-[#DCDCDC] bg-white px-4 text-sm text-black focus:border-[var(--primary)] outline-none"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                      Cajero Titular Asignado (Opcional)
                    </label>
                    <select
                      value={terminalForm.usuarioEncargadoId}
                      onChange={(e) => setTerminalForm({ ...terminalForm, usuarioEncargadoId: e.target.value })}
                      className="w-full h-11 border border-[#DCDCDC] bg-white px-4 text-xs font-bold text-black focus:border-[var(--primary)] outline-none"
                    >
                      <option value="">Sin cajero fijo (Cualquier cajero puede cobrar)</option>
                      {usuarios.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nombre} - {u.perfil?.nombre || "Cajero"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-[#EEEEEE] bg-[#FAFAFA] px-6 py-4">
                  <button
                    type="button"
                    onClick={() => setTipoCrear("opciones")}
                    className="border border-[#CCCCCC] bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#555555] hover:text-black cursor-pointer"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    disabled={savingElement || !terminalForm.nombre.trim() || !terminalForm.sucursalId}
                    className="flex items-center gap-2 border border-black bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#222222] cursor-pointer disabled:opacity-40"
                  >
                    {savingElement && <Loader2 size={14} className="animate-spin" />}
                    <span>Guardar Terminal</span>
                  </button>
                </div>
              </form>
            )}

            {/* FORMULARIO 3: REGISTRAR USUARIO / CAJERO */}
            {tipoCrear === "usuario" && (
              <form onSubmit={handleSaveUsuario}>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={usuarioForm.nombre}
                        onChange={(e) => setUsuarioForm({ ...usuarioForm, nombre: e.target.value })}
                        placeholder="Ej. Juan Pérez"
                        className="w-full h-11 border border-[#DCDCDC] bg-white px-4 text-sm text-black focus:border-[var(--primary)] outline-none"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                        Correo electrónico *
                      </label>
                      <input
                        type="email"
                        required
                        value={usuarioForm.email}
                        onChange={(e) => setUsuarioForm({ ...usuarioForm, email: e.target.value })}
                        placeholder="juan@empresa.com"
                        className="w-full h-11 border border-[#DCDCDC] bg-white px-4 text-sm text-black focus:border-[var(--primary)] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                        Contraseña (mínimo 6) *
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={usuarioForm.password}
                        onChange={(e) => setUsuarioForm({ ...usuarioForm, password: e.target.value })}
                        placeholder="******"
                        className="w-full h-11 border border-[#DCDCDC] bg-white px-4 text-sm text-black focus:border-[var(--primary)] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                        PIN de Acceso Rápido (4 dígitos)
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={usuarioForm.pin}
                        onChange={(e) => setUsuarioForm({ ...usuarioForm, pin: e.target.value.replace(/\D/g, "") })}
                        placeholder="1234"
                        className="w-full h-11 border border-[#DCDCDC] bg-white px-4 text-sm font-mono tracking-widest text-black focus:border-[var(--primary)] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                        Perfil o Rol *
                      </label>
                      <select
                        required
                        value={usuarioForm.perfilId}
                        onChange={(e) => setUsuarioForm({ ...usuarioForm, perfilId: e.target.value })}
                        className="w-full h-11 border border-[#DCDCDC] bg-white px-4 text-xs font-bold text-black focus:border-[var(--primary)] outline-none"
                      >
                        <option value="" disabled>Selecciona un perfil</option>
                        {perfiles.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} {p.esAdmin ? "(Admin)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                        Sucursal Asignada
                      </label>
                      <select
                        value={usuarioForm.sucursalId}
                        onChange={(e) => setUsuarioForm({ ...usuarioForm, sucursalId: e.target.value })}
                        className="w-full h-11 border border-[#DCDCDC] bg-white px-4 text-xs font-bold text-black focus:border-[var(--primary)] outline-none"
                      >
                        <option value="">Matriz / Todas las sucursales</option>
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-[#EEEEEE] bg-[#FAFAFA] px-6 py-4">
                  <button
                    type="button"
                    onClick={() => setTipoCrear("opciones")}
                    className="border border-[#CCCCCC] bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#555555] hover:text-black cursor-pointer"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    disabled={savingElement || !usuarioForm.nombre.trim() || !usuarioForm.email.trim() || !usuarioForm.password.trim()}
                    className="flex items-center gap-2 border border-black bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#222222] cursor-pointer disabled:opacity-40"
                  >
                    {savingElement && <Loader2 size={14} className="animate-spin" />}
                    <span>Registrar Colaborador</span>
                  </button>
                </div>
              </form>
            )}

            {/* FORMULARIO 4: REGISTRAR PERFIL DE ACCESO */}
            {tipoCrear === "perfil" && (
              <form onSubmit={handleSavePerfil}>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                      Nombre del Perfil *
                    </label>
                    <input
                      type="text"
                      required
                      value={perfilForm.nombre}
                      onChange={(e) => setPerfilForm({ ...perfilForm, nombre: e.target.value })}
                      placeholder="Ej. Cajero Turno Vespertino, Supervisor Cajas"
                      className="w-full h-11 border border-[#DCDCDC] bg-white px-4 text-sm text-black focus:border-[var(--primary)] outline-none"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                      Descripción
                    </label>
                    <input
                      type="text"
                      value={perfilForm.descripcion}
                      onChange={(e) => setPerfilForm({ ...perfilForm, descripcion: e.target.value })}
                      placeholder="Ej. Autorización para cobros y arqueos"
                      className="w-full h-11 border border-[#DCDCDC] bg-white px-4 text-sm text-black focus:border-[var(--primary)] outline-none"
                    />
                  </div>

                  <div className="border-t border-[#EEEEEE] pt-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-black mb-2">
                      Permisos para Punto de Venta:
                    </p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs text-black cursor-pointer">
                        <input
                          type="checkbox"
                          checked={perfilForm.permisoCobrar}
                          onChange={(e) => setPerfilForm({ ...perfilForm, permisoCobrar: e.target.checked })}
                          className="accent-[var(--primary)]"
                        />
                        <span>Cobrar y emitir comprobantes de venta</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs text-black cursor-pointer">
                        <input
                          type="checkbox"
                          checked={perfilForm.permisoDescuento}
                          onChange={(e) => setPerfilForm({ ...perfilForm, permisoDescuento: e.target.checked })}
                          className="accent-[var(--primary)]"
                        />
                        <span>Aplicar descuentos a ventas</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs text-black cursor-pointer">
                        <input
                          type="checkbox"
                          checked={perfilForm.permisoCorte}
                          onChange={(e) => setPerfilForm({ ...perfilForm, permisoCorte: e.target.checked })}
                          className="accent-[var(--primary)]"
                        />
                        <span>Efectuar cortes y arqueos de caja</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-[#EEEEEE] bg-[#FAFAFA] px-6 py-4">
                  <button
                    type="button"
                    onClick={() => setTipoCrear("opciones")}
                    className="border border-[#CCCCCC] bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#555555] hover:text-black cursor-pointer"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    disabled={savingElement || !perfilForm.nombre.trim()}
                    className="flex items-center gap-2 border border-black bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#222222] cursor-pointer disabled:opacity-40"
                  >
                    {savingElement && <Loader2 size={14} className="animate-spin" />}
                    <span>Crear Perfil</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL ASIGNAR CAJERO A TERMINAL
      ========================================================= */}
      {modalAsignarCajero && terminalSeleccionada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModalAsignarCajero();
          }}
        >
          <div
            className="w-full max-w-md border border-[#DCDCDC] bg-white shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E5E5E5] bg-[#FAFAFA] px-6 py-4">
              <h3 className="text-sm font-bold text-black">
                Asignar Cajero a {terminalSeleccionada.nombre}
              </h3>
              <button
                type="button"
                onClick={closeModalAsignarCajero}
                disabled={savingAsignacion}
                className="text-[#777777] hover:text-black cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAsignacionCajero}>
              <div className="p-6 space-y-4">
                <p className="text-xs text-[#777777]">
                  Selecciona el colaborador o cajero responsable para esta caja registradora:
                </p>

                <select
                  value={cajeroSeleccionadoId}
                  onChange={(e) => setCajeroSeleccionadoId(e.target.value)}
                  className="w-full h-11 border border-[#DCDCDC] bg-white px-4 text-xs font-bold text-black focus:border-[var(--primary)] outline-none"
                >
                  <option value="">Sin cajero asignado (Uso rotativo)</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre} - {u.perfil?.nombre || "Cajero"} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-[#EEEEEE] bg-[#FAFAFA] px-6 py-4">
                <button
                  type="button"
                  onClick={closeModalAsignarCajero}
                  disabled={savingAsignacion}
                  className="border border-[#CCCCCC] bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#555555] hover:text-black cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingAsignacion}
                  className="flex items-center gap-2 border border-black bg-black text-white px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#222222] cursor-pointer"
                >
                  {savingAsignacion && <Loader2 size={14} className="animate-spin" />}
                  <span>Guardar Asignación</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
