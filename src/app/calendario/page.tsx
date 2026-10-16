"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSidebar } from "@/context/SidebarContext";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  Check,
  X,
  AlertTriangle,
  Clock,
  Send,
  MessageCircle,
  Package,
  Bell,
  Star,
  Trash2,
  Edit3,
  CalendarDays,
  ListFilter,
  CheckCircle2,
  Circle,
  Phone,
  User,
  DollarSign,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { apiRequest } from "@/services/api";
import { getOrganizacionId, getUsuarioActual } from "@/services/auth";
import { getDiasFestivosDelAno, getFestivoPorFecha, DiaFestivo } from "@/utils/festivos";
import { enqueueOfflineCalendario, syncOfflineCalendario } from "@/services/calendarioSync";
import { useSocket } from "@/hooks/useSocket";

export interface EventoItem {
  id: string;
  organizacionId: string;
  tipo: "PEDIDO" | "RECORDATORIO" | "NOTA";
  titulo: string;
  descripcion?: string | null;
  fecha: string; // YYYY-MM-DD
  hora?: string | null; // HH:mm
  monto?: number | null;
  clienteNombre?: string | null;
  telefono?: string | null;
  enviarWhatsapp?: boolean;
  estado: "PENDIENTE" | "EN_PROCESO" | "COMPLETADO" | "CANCELADO";
  prioridad: "BAJA" | "MEDIA" | "ALTA" | "URGENTE";
  createdAt?: string;
}

const DIAS_SEMANA = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export default function CalendarioPage() {
  const { collapsed } = useSidebar();
  const { socket, connected: socketConnected } = useSocket();
  const [loading, setLoading] = useState(true);

  // Fecha actual y fecha en vista del calendario
  const hoy = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState(hoy.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(hoy.getMonth()); // 0-11

  // Datos reales
  const [eventos, setEventos] = useState<EventoItem[]>([]);
  const [orgData, setOrgData] = useState<any>(null);
  const [usuarioActual, setUsuarioActual] = useState<any>(null);
  const [whatsappConectado, setWhatsappConectado] = useState(false);

  // Estados visuales y de filtrado
  const [vistaModo, setVistaModo] = useState<"mes" | "agenda">("mes");
  const [filtroTipo, setFiltroTipo] = useState<"TODOS" | "PEDIDO" | "RECORDATORIO" | "FESTIVOS">("TODOS");
  const [filtroEstado, setFiltroEstado] = useState<"TODOS" | "PENDIENTE" | "COMPLETADO">("TODOS");
  const [searchQuery, setSearchQuery] = useState("");

  // Modales
  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [eventoAEditar, setEventoAEditar] = useState<EventoItem | null>(null);

  // Modal WhatsApp
  const [modalWhatsappOpen, setModalWhatsappOpen] = useState(false);
  const [eventoParaWhatsapp, setEventoParaWhatsapp] = useState<EventoItem | null>(null);
  const [telefonoDestino, setTelefonoDestino] = useState("");
  const [mensajeWhatsapp, setMensajeWhatsapp] = useState("");
  const [enviandoWa, setEnviandoWa] = useState(false);

  // Modal Detalle / Eliminar
  const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoItem | null>(null);

  // Formulario de Evento / Pedido
  const [formData, setFormData] = useState<{
    tipo: "PEDIDO" | "RECORDATORIO" | "NOTA";
    titulo: string;
    descripcion: string;
    fecha: string;
    hora: string;
    monto: string;
    clienteNombre: string;
    destinoTelefonoTipo: "personal" | "particular";
    telefonoParticular: string;
    enviarWhatsapp: boolean;
    prioridad: "BAJA" | "MEDIA" | "ALTA" | "URGENTE";
    estado: "PENDIENTE" | "EN_PROCESO" | "COMPLETADO" | "CANCELADO";
  }>({
    tipo: "PEDIDO",
    titulo: "",
    descripcion: "",
    fecha: new Date().toISOString().split("T")[0],
    hora: "",
    monto: "",
    clienteNombre: "",
    destinoTelefonoTipo: "personal",
    telefonoParticular: "",
    enviarWhatsapp: false,
    prioridad: "MEDIA",
    estado: "PENDIENTE",
  });

  // Notificaciones
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Teléfono personal / corporativo resuelto
  const telefonoPersonal = useMemo(() => {
    return usuarioActual?.telefono || orgData?.whatsapp || orgData?.telefono || "249 153 7727";
  }, [usuarioActual, orgData]);

  // Carga de datos con arquitectura Offline-First
  const loadData = useCallback(async () => {
    const user = getUsuarioActual();
    setUsuarioActual(user);
    const orgId = getOrganizacionId() || user?.organizacionId;

    if (!orgId) {
      setLoading(false);
      return;
    }

    // 1. Cargar caché offline inmediatamente
    if (typeof window !== "undefined") {
      try {
        const cOrg = localStorage.getItem(`inagerlis_offline_org_${orgId}`);
        const cEvts = localStorage.getItem(`inagerlis_offline_calendario_${orgId}`);
        if (cOrg) setOrgData(JSON.parse(cOrg));
        if (cEvts) setEventos(JSON.parse(cEvts));
      } catch (err) {
        console.warn("Error leyendo caché de calendario:", err);
      }
    }

    setLoading(true);
    try {
      const [orgRes, eventosRes, waStatusRes] = await Promise.allSettled([
        apiRequest<any>(`/organizaciones/${orgId}`),
        apiRequest<EventoItem[]>(`/calendario?organizacionId=${orgId}`),
        apiRequest<any>(`/whatsapp/estado/${orgId}`),
      ]);

      if (orgRes.status === "fulfilled" && orgRes.value) {
        setOrgData(orgRes.value);
        if (typeof window !== "undefined") {
          localStorage.setItem(`inagerlis_offline_org_${orgId}`, JSON.stringify(orgRes.value));
        }
      }

      if (eventosRes.status === "fulfilled" && Array.isArray(eventosRes.value)) {
        setEventos(eventosRes.value);
        if (typeof window !== "undefined") {
          localStorage.setItem(`inagerlis_offline_calendario_${orgId}`, JSON.stringify(eventosRes.value));
        }
      }

      if (waStatusRes.status === "fulfilled" && waStatusRes.value) {
        setWhatsappConectado(waStatusRes.value.estado === "CONECTADO");
      }
    } catch (err) {
      console.warn("Servidor inalcanzable, operando calendario en modo offline:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sincronización en tiempo real vía WebSockets
  useEffect(() => {
    if (!socket) return;

    const user = getUsuarioActual();
    const orgId = getOrganizacionId() || user?.organizacionId;

    const handleCitaCreada = (nueva: EventoItem) => {
      setEventos((prev) => {
        const existe = prev.some((e) => e.id === nueva.id);
        const next = existe ? prev.map((e) => (e.id === nueva.id ? { ...e, ...nueva } : e)) : [nueva, ...prev];
        if (orgId && typeof window !== "undefined") {
          try {
            localStorage.setItem(`inagerlis_offline_calendario_${orgId}`, JSON.stringify(next));
          } catch {}
        }
        return next;
      });
      setSuccessMsg(`Nueva cita o pedido: "${nueva.titulo}"`);
      setTimeout(() => setSuccessMsg(null), 3500);
    };

    const handleCitaActualizada = (actualizada: EventoItem) => {
      setEventos((prev) => {
        const next = prev.map((e) => (e.id === actualizada.id ? { ...e, ...actualizada } : e));
        if (orgId && typeof window !== "undefined") {
          try {
            localStorage.setItem(`inagerlis_offline_calendario_${orgId}`, JSON.stringify(next));
          } catch {}
        }
        return next;
      });
    };

    const handleCitaEliminada = (data: { id: string }) => {
      setEventos((prev) => {
        const next = prev.filter((e) => e.id !== data.id);
        if (orgId && typeof window !== "undefined") {
          try {
            localStorage.setItem(`inagerlis_offline_calendario_${orgId}`, JSON.stringify(next));
          } catch {}
        }
        return next;
      });
    };

    socket.on("cita:creada", handleCitaCreada);
    socket.on("cita:actualizada", handleCitaActualizada);
    socket.on("cita:eliminada", handleCitaEliminada);

    return () => {
      socket.off("cita:creada", handleCitaCreada);
      socket.off("cita:actualizada", handleCitaActualizada);
      socket.off("cita:eliminada", handleCitaEliminada);
    };
  }, [socket]);

  // Detector de conectividad y auto-sincronización de cola offline
  useEffect(() => {
    const handleSync = async () => {
      const user = getUsuarioActual();
      const orgId = getOrganizacionId() || user?.organizacionId;
      if (
        orgId &&
        typeof window !== "undefined" &&
        navigator.onLine &&
        typeof syncOfflineCalendario === "function"
      ) {
        const res = await syncOfflineCalendario(orgId);
        if (res.synced > 0) {
          try {
            const raw = localStorage.getItem(`inagerlis_offline_calendario_${orgId}`);
            if (raw) setEventos(JSON.parse(raw));
          } catch {}
          setSuccessMsg(`¡Sincronización automática! Se subieron ${res.synced} eventos pendientes al servidor.`);
          setTimeout(() => setSuccessMsg(null), 4000);
        }
      }
    };

    window.addEventListener("online", handleSync);
    window.addEventListener("focus", handleSync);
    window.addEventListener("calendario_data_synced", handleSync);

    const interval = setInterval(handleSync, 20000);

    return () => {
      window.removeEventListener("online", handleSync);
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("calendario_data_synced", handleSync);
      clearInterval(interval);
    };
  }, []);

  // Manejador tecla ESC para cerrar cualquier modal abierto (Regla 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (modalCrearOpen && !guardando) setModalCrearOpen(false);
        if (modalWhatsappOpen && !enviandoWa) setModalWhatsappOpen(false);
        if (eventoSeleccionado) setEventoSeleccionado(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalCrearOpen, guardando, modalWhatsappOpen, enviandoWa, eventoSeleccionado]);

  // Días festivos del año activo
  const festivosDelAno = useMemo(() => {
    return getDiasFestivosDelAno(currentYear);
  }, [currentYear]);

  // Días festivos del mes activo
  const festivosDelMes = useMemo(() => {
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const prefix = `${currentYear}-${pad(currentMonth + 1)}`;
    return festivosDelAno.filter((f) => f.fecha.startsWith(prefix));
  }, [festivosDelAno, currentYear, currentMonth]);

  // Navegación de mes
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleIrAHoy = () => {
    setCurrentYear(hoy.getFullYear());
    setCurrentMonth(hoy.getMonth());
  };

  // Apertura del modal de creación prellenado para una fecha
  const abrirModalCrear = (fechaInicial?: string) => {
    const targetDate = fechaInicial || new Date().toISOString().split("T")[0];
    setEventoAEditar(null);
    setFormData({
      tipo: "PEDIDO",
      titulo: "",
      descripcion: "",
      fecha: targetDate,
      hora: "",
      monto: "",
      clienteNombre: "",
      destinoTelefonoTipo: "personal",
      telefonoParticular: "",
      enviarWhatsapp: false,
      prioridad: "MEDIA",
      estado: "PENDIENTE",
    });
    setModalCrearOpen(true);
  };

  // Apertura de edición
  const abrirModalEditar = (evento: EventoItem) => {
    setEventoAEditar(evento);
    const esPersonal = evento.telefono === telefonoPersonal;
    setFormData({
      tipo: evento.tipo,
      titulo: evento.titulo,
      descripcion: evento.descripcion || "",
      fecha: evento.fecha,
      hora: evento.hora || "",
      monto: evento.monto ? String(evento.monto) : "",
      clienteNombre: evento.clienteNombre || "",
      destinoTelefonoTipo: esPersonal ? "personal" : "particular",
      telefonoParticular: esPersonal ? "" : evento.telefono || "",
      enviarWhatsapp: Boolean(evento.enviarWhatsapp),
      prioridad: evento.prioridad,
      estado: evento.estado,
    });
    setEventoSeleccionado(null);
    setModalCrearOpen(true);
  };

  // Guardar Evento o Pedido
  const handleGuardarEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo.trim() || !formData.fecha) return;

    const user = getUsuarioActual();
    const orgId = getOrganizacionId() || user?.organizacionId;
    if (!orgId) return;

    setGuardando(true);
    setErrorMsg(null);

    const telefonoFinal =
      formData.destinoTelefonoTipo === "personal"
        ? telefonoPersonal
        : formData.telefonoParticular.trim();

    const payload = {
      organizacionId: orgId,
      tipo: formData.tipo,
      titulo: formData.titulo.trim(),
      descripcion: formData.descripcion.trim() || undefined,
      fecha: formData.fecha,
      hora: formData.hora.trim() || undefined,
      monto: formData.monto ? Number(formData.monto) : undefined,
      clienteNombre: formData.clienteNombre.trim() || undefined,
      telefono: telefonoFinal || undefined,
      enviarWhatsapp: formData.enviarWhatsapp,
      estado: formData.estado,
      prioridad: formData.prioridad,
    };

    try {
      if (eventoAEditar) {
        // Actualizar
        let res: EventoItem;
        try {
          res = await apiRequest<EventoItem>(`/calendario/${eventoAEditar.id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          });
        } catch {
          // Offline fallback
          res = { ...eventoAEditar, ...payload };
          enqueueOfflineCalendario(orgId, "UPDATE", payload, eventoAEditar.id);
        }

        const updated = eventos.map((ev) => (ev.id === eventoAEditar.id ? res : ev));
        setEventos(updated);
        if (typeof window !== "undefined") {
          localStorage.setItem(`inagerlis_offline_calendario_${orgId}`, JSON.stringify(updated));
        }

        setSuccessMsg(`"${res.titulo}" actualizado correctamente.`);
      } else {
        // Crear
        let res: any;
        const localId = `evt_local_${Date.now()}`;
        try {
          res = await apiRequest<any>("/calendario", {
            method: "POST",
            body: JSON.stringify(payload),
          });
        } catch {
          // Offline fallback
          res = {
            id: localId,
            ...payload,
            createdAt: new Date().toISOString(),
          };
          enqueueOfflineCalendario(orgId, "CREATE", payload, localId);
        }

        const updated = [res, ...eventos];
        setEventos(updated);
        if (typeof window !== "undefined") {
          localStorage.setItem(`inagerlis_offline_calendario_${orgId}`, JSON.stringify(updated));
        }

        if (res.whatsappEnviado) {
          setSuccessMsg(`"${res.titulo}" registrado y recordatorio enviado por WhatsApp con éxito.`);
        } else {
          setSuccessMsg(`"${res.titulo}" registrado correctamente en el calendario.`);
        }
      }

      setModalCrearOpen(false);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err?.message || "No se pudo guardar el evento.");
    } finally {
      setGuardando(false);
    }
  };

  // Eliminar Evento
  const handleEliminarEvento = async (id: string) => {
    const user = getUsuarioActual();
    const orgId = getOrganizacionId() || user?.organizacionId;

    const updated = eventos.filter((e) => e.id !== id);
    setEventos(updated);
    if (typeof window !== "undefined" && orgId) {
      localStorage.setItem(`inagerlis_offline_calendario_${orgId}`, JSON.stringify(updated));
    }
    setEventoSeleccionado(null);

    try {
      await apiRequest(`/calendario/${id}`, { method: "DELETE" });
      setSuccessMsg("Elemento eliminado del calendario.");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      if (orgId) {
        enqueueOfflineCalendario(orgId, "DELETE", undefined, id);
      }
      setSuccessMsg("Elemento eliminado localmente (se sincronizará al conectar).");
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  // Cambiar Estado rápido
  const handleToggleEstado = async (evento: EventoItem) => {
    const nuevoEstado: "PENDIENTE" | "COMPLETADO" = evento.estado === "COMPLETADO" ? "PENDIENTE" : "COMPLETADO";
    const user = getUsuarioActual();
    const orgId = getOrganizacionId() || user?.organizacionId;

    const updated = eventos.map((e) => (e.id === evento.id ? { ...e, estado: nuevoEstado } : e));
    setEventos(updated);
    if (typeof window !== "undefined" && orgId) {
      localStorage.setItem(`inagerlis_offline_calendario_${orgId}`, JSON.stringify(updated));
    }

    try {
      await apiRequest(`/calendario/${evento.id}`, {
        method: "PUT",
        body: JSON.stringify({ estado: nuevoEstado }),
      });
    } catch (err) {
      if (orgId) {
        enqueueOfflineCalendario(orgId, "UPDATE", { estado: nuevoEstado }, evento.id);
      }
    }
  };

  // Preparar envío de WhatsApp para un evento
  const abrirModalWhatsApp = (evento: EventoItem) => {
    setEventoParaWhatsapp(evento);
    const tel = evento.telefono || telefonoPersonal;
    setTelefonoDestino(tel);

    const horaTexto = evento.hora ? ` a las ${evento.hora}` : "";
    const fechaTexto = `${evento.fecha}${horaTexto}`;

    let msg = "";
    if (evento.tipo === "PEDIDO") {
      const cliente = evento.clienteNombre ? ` para *${evento.clienteNombre}*` : "";
      const monto = evento.monto ? `\n💰 Total: $${Number(evento.monto).toFixed(2)}` : "";
      const detalle = evento.descripcion ? `\n📝 Detalle: ${evento.descripcion}` : "";
      msg = `📦 *RECORDATORIO DE PEDIDO*\n\nHola, te recordamos el pedido *${evento.titulo}*${cliente}.\n📅 Entrega programada: *${fechaTexto}*${monto}${detalle}\n📌 Estado: *${evento.estado}*\n\n¡Gracias por tu preferencia!`;
    } else {
      const descripcion = evento.descripcion ? `\n\n📌 *Nota:* ${evento.descripcion}` : "";
      const prioridad =
        evento.prioridad === "URGENTE"
          ? " 🚨 [URGENTE]"
          : evento.prioridad === "ALTA"
          ? " ⚠️ [PRIORIDAD ALTA]"
          : "";
      msg = `⏰ *RECORDATORIO DEL SISTEMA*${prioridad}\n\n*${evento.titulo}*\n📅 Fecha: *${fechaTexto}*${descripcion}\n\nNotificación enviada desde el sistema CRM.`;
    }

    setMensajeWhatsapp(msg);
    setModalWhatsappOpen(true);
  };

  // Ejecutar Envío WhatsApp
  const handleEnviarWhatsAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telefonoDestino.trim() || !mensajeWhatsapp.trim() || !eventoParaWhatsapp) return;

    const user = getUsuarioActual();
    const orgId = getOrganizacionId() || user?.organizacionId;
    if (!orgId) return;

    setEnviandoWa(true);
    setErrorMsg(null);

    try {
      const res = await apiRequest<any>(`/calendario/${eventoParaWhatsapp.id}/enviar-whatsapp`, {
        method: "POST",
        body: JSON.stringify({
          telefono: telefonoDestino.trim(),
          mensaje: mensajeWhatsapp.trim(),
        }),
      });

      setSuccessMsg("¡Recordatorio enviado por WhatsApp con éxito!");
      setModalWhatsappOpen(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      // Si el servidor indica que Baileys no está conectado o falla, ofrecemos abrir WhatsApp Web / App directamente
      const rawPhone = telefonoDestino.replace(/\D/g, "");
      const fullPhone = rawPhone.length === 10 ? `521${rawPhone}` : rawPhone;
      const waUrl = `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(
        mensajeWhatsapp
      )}`;
      window.open(waUrl, "_blank");

      setSuccessMsg("Abriendo WhatsApp para envío directo...");
      setModalWhatsappOpen(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    } finally {
      setEnviandoWa(false);
    }
  };

  // Filtrado de eventos
  const eventosFiltrados = useMemo(() => {
    return eventos.filter((ev) => {
      // Filtro tipo
      if (filtroTipo === "PEDIDO" && ev.tipo !== "PEDIDO") return false;
      if (filtroTipo === "RECORDATORIO" && ev.tipo !== "RECORDATORIO" && ev.tipo !== "NOTA") return false;

      // Filtro estado
      if (filtroEstado === "PENDIENTE" && ev.estado === "COMPLETADO") return false;
      if (filtroEstado === "COMPLETADO" && ev.estado !== "COMPLETADO") return false;

      // Búsqueda
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitulo = ev.titulo.toLowerCase().includes(q);
        const matchCliente = ev.clienteNombre?.toLowerCase().includes(q);
        const matchDesc = ev.descripcion?.toLowerCase().includes(q);
        return matchTitulo || matchCliente || matchDesc;
      }

      return true;
    });
  }, [eventos, filtroTipo, filtroEstado, searchQuery]);

  // Generador de días para la vista mensual en cuadrícula
  const diasCuadricula = useMemo(() => {
    const primerDiaMes = new Date(currentYear, currentMonth, 1);
    const totalDiasMes = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Día de la semana del 1 de mes: getDay() da 0 para Domingo, 1 para Lunes.
    // Nosotros queremos Lunes = 0, ..., Domingo = 6.
    const dayOfWeek = (primerDiaMes.getDay() + 6) % 7;

    const dias = [];

    // Días del mes anterior para rellenar
    const totalDiasMesAnterior = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = dayOfWeek - 1; i >= 0; i--) {
      const d = totalDiasMesAnterior - i;
      const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
      const fechaStr = `${prevY}-${pad(prevM + 1)}-${pad(d)}`;
      dias.push({
        numero: d,
        esMesActual: false,
        fechaStr,
        festivo: getFestivoPorFecha(fechaStr),
      });
    }

    // Días del mes actual
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    for (let d = 1; d <= totalDiasMes; d++) {
      const fechaStr = `${currentYear}-${pad(currentMonth + 1)}-${pad(d)}`;
      dias.push({
        numero: d,
        esMesActual: true,
        fechaStr,
        festivo: getFestivoPorFecha(fechaStr),
      });
    }

    // Días del mes siguiente para completar múltiplos de 7
    const rest = 42 - dias.length; // 6 filas de 7
    for (let d = 1; d <= rest; d++) {
      const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      const fechaStr = `${nextY}-${pad(nextM + 1)}-${pad(d)}`;
      dias.push({
        numero: d,
        esMesActual: false,
        fechaStr,
        festivo: getFestivoPorFecha(fechaStr),
      });
    }

    return dias;
  }, [currentYear, currentMonth]);

  // Eventos agrupados para la vista de agenda
  const eventosAgrupadosAgenda = useMemo(() => {
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const hoyStr = `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`;

    const mananaDate = new Date(hoy);
    mananaDate.setDate(hoy.getDate() + 1);
    const mananaStr = `${mananaDate.getFullYear()}-${pad(mananaDate.getMonth() + 1)}-${pad(
      mananaDate.getDate()
    )}`;

    const grupos: { [key: string]: { titulo: string; items: EventoItem[] } } = {
      hoy: { titulo: "Hoy", items: [] },
      manana: { titulo: "Mañana", items: [] },
      estaSemana: { titulo: "Próximos 7 días", items: [] },
      proximos: { titulo: "Fechas Posteriores", items: [] },
      pasados: { titulo: "Historial de Fechas Anteriores", items: [] },
    };

    const sorted = [...eventosFiltrados].sort((a, b) => a.fecha.localeCompare(b.fecha));

    sorted.forEach((item) => {
      if (item.fecha === hoyStr) {
        grupos.hoy.items.push(item);
      } else if (item.fecha === mananaStr) {
        grupos.manana.items.push(item);
      } else if (item.fecha > mananaStr) {
        grupos.proximos.items.push(item);
      } else {
        grupos.pasados.items.push(item);
      }
    });

    return grupos;
  }, [eventosFiltrados, hoy]);

  return (
    <main className="min-h-screen bg-[#F7F7F7] text-black transition-colors duration-200 w-full max-w-full overflow-x-hidden">
      <Sidebar />

      <div className={`min-h-screen w-full max-w-full overflow-x-hidden min-w-0 transition-all duration-300 ${collapsed ? "ml-0 lg:ml-[80px]" : "ml-0 lg:ml-[250px]"}`}>
        <Header />

        <div className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 w-full max-w-full">
          {/* =========================================================
              ENCABEZADO CORPORATIVO CON BOTÓN DE REGISTRO
          ========================================================= */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E2E2] pb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                Planificación y Logística Operativa
              </p>
              <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-black">
                Calendario de Pedidos y Recordatorios
              </h1>
              <p className="mt-1 text-xs text-[#666666] max-w-3xl">
                Agenda pedidos especiales, entregas a domicilio y notas con alertas de WhatsApp directas a tu número personal o clientes.
              </p>
            </div>

            {/* BOTÓN ÚNICO DE REGISTRO (Diseño Inagerlis Sobrio) */}
            <button
              type="button"
              onClick={() => abrirModalCrear()}
              className="flex items-center justify-center gap-2 border border-black bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] hover:bg-[#222222] transition-colors cursor-pointer shadow-sm active:scale-95 shrink-0"
            >
              <Plus size={16} />
              <span>Nuevo Pedido o Recordatorio</span>
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

          {/* =========================================================
              RESUMEN DE MÉTRICAS OPERATIVAS
          ========================================================= */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-[#E5E5E5] bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">Pedidos Pendientes</p>
                <Package size={16} className="text-[var(--primary)]" />
              </div>
              <p className="text-2xl font-bold font-mono text-black mt-2">
                {eventos.filter((e) => e.tipo === "PEDIDO" && e.estado !== "COMPLETADO").length}
              </p>
              <p className="text-[10px] text-[#888888] mt-1">Por entregar o preparar</p>
            </div>

            <div className="border border-[#E5E5E5] bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">Recordatorios Activos</p>
                <Bell size={16} className="text-black" />
              </div>
              <p className="text-2xl font-bold font-mono text-black mt-2">
                {eventos.filter((e) => e.tipo !== "PEDIDO" && e.estado !== "COMPLETADO").length}
              </p>
              <p className="text-[10px] text-[#888888] mt-1">Notas y pagos pendientes</p>
            </div>

            <div className="border border-[#E5E5E5] bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">Festivos en {MESES[currentMonth]}</p>
                <Star size={16} className="text-[#D8A814]" />
              </div>
              <p className="text-2xl font-bold font-mono text-[#D8A814] mt-2">
                {festivosDelMes.length}
              </p>
              <p className="text-[10px] text-[#888888] mt-1">Fechas patrias y asuetos</p>
            </div>

            <div className="border border-[#E5E5E5] bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">WhatsApp Notificador</p>
                <MessageCircle size={16} className={whatsappConectado ? "text-emerald-600" : "text-[#888888]"} />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`h-2.5 w-2.5 ${whatsappConectado ? "bg-emerald-500" : "bg-amber-400"}`} />
                <p className="text-sm font-bold text-black">
                  {whatsappConectado ? "API Conectada" : "Enlace Directo"}
                </p>
              </div>
              <p className="text-[10px] text-[#888888] mt-1 font-mono truncate" title={telefonoPersonal}>
                {telefonoPersonal}
              </p>
            </div>
          </div>

          {/* =========================================================
              BARRA DE HERRAMIENTAS, FILTROS Y CONTROLES DEL CALENDARIO
          ========================================================= */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border border-[#E5E5E5] bg-white p-4 shadow-2xs">
            {/* Navegación de Mes */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-[#DDDDDD] bg-[#FAFAFA]">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-white text-black transition-colors cursor-pointer"
                  title="Mes anterior"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-white text-black transition-colors cursor-pointer"
                  title="Mes siguiente"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <h2 className="text-lg md:text-xl font-bold text-black min-w-[180px]">
                {MESES[currentMonth]} {currentYear}
              </h2>

              <button
                type="button"
                onClick={handleIrAHoy}
                className="px-3 py-1.5 border border-[#CCCCCC] bg-[#FAFAFA] text-xs font-bold uppercase tracking-wider text-black hover:border-black transition-colors cursor-pointer"
              >
                Hoy
              </button>
            </div>

            {/* Filtros de Tipo y Búsqueda */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center border border-[#DDDDDD] p-1 bg-[#FAFAFA]">
                <button
                  type="button"
                  onClick={() => setFiltroTipo("TODOS")}
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    filtroTipo === "TODOS" ? "bg-black text-white" : "text-[#777777] hover:text-black"
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroTipo("PEDIDO")}
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    filtroTipo === "PEDIDO" ? "bg-black text-white" : "text-[#777777] hover:text-black"
                  }`}
                >
                  Pedidos
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroTipo("RECORDATORIO")}
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    filtroTipo === "RECORDATORIO" ? "bg-black text-white" : "text-[#777777] hover:text-black"
                  }`}
                >
                  Recordatorios
                </button>
              </div>

              {/* Selector de Vista: Cuadrícula vs Agenda */}
              <div className="flex items-center border border-[#DDDDDD] p-1 bg-[#FAFAFA]">
                <button
                  type="button"
                  onClick={() => setVistaModo("mes")}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    vistaModo === "mes" ? "bg-black text-white" : "text-[#777777] hover:text-black"
                  }`}
                >
                  <CalendarDays size={14} />
                  <span>Mes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVistaModo("agenda")}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    vistaModo === "agenda" ? "bg-black text-white" : "text-[#777777] hover:text-black"
                  }`}
                >
                  <ListFilter size={14} />
                  <span>Agenda</span>
                </button>
              </div>
            </div>
          </div>

          {/* =========================================================
              VISTA 1: CUADRÍCULA MENSUAL (CREADA DESDE 0)
          ========================================================= */}
          {vistaModo === "mes" && (
            <div className="border border-[#E0E0E0] bg-white shadow-sm overflow-hidden">
              {/* Encabezado de Días de la Semana */}
              <div className="grid grid-cols-7 border-b border-[#E0E0E0] bg-[#FAFAFA] text-center">
                {DIAS_SEMANA.map((dia, idx) => (
                  <div
                    key={dia}
                    className={`py-2.5 text-xs font-bold uppercase tracking-[0.16em] ${
                      idx === 5 || idx === 6 ? "text-[#999999]" : "text-black"
                    }`}
                  >
                    {dia}
                  </div>
                ))}
              </div>

              {/* Celdas de Días */}
              <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#EAEAEA]">
                {diasCuadricula.map((diaItem, idx) => {
                  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
                  const hoyStr = `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`;
                  const esHoy = diaItem.fechaStr === hoyStr;

                  // Eventos en esta celda
                  const eventosCelda = eventosFiltrados.filter((e) => e.fecha === diaItem.fechaStr);
                  const festivo = diaItem.festivo;

                  return (
                    <div
                      key={`${diaItem.fechaStr}-${idx}`}
                      className={`min-h-[110px] md:min-h-[135px] p-2 flex flex-col justify-between transition-colors group relative ${
                        !diaItem.esMesActual
                          ? "bg-[#FCFCFC] text-[#AAAAAA]"
                          : esHoy
                          ? "bg-[#FFFDF5]"
                          : "bg-white hover:bg-[#FAFAFA]"
                      }`}
                    >
                      {/* Cabecera del Día */}
                      <div className="flex items-start justify-between">
                        <span
                          className={`text-xs font-mono font-bold px-1.5 py-0.5 border ${
                            esHoy
                              ? "border-black bg-black text-white"
                              : !diaItem.esMesActual
                              ? "border-transparent text-[#999999]"
                              : "border-transparent text-black"
                          }`}
                        >
                          {diaItem.numero}
                        </span>

                        {/* Botón flotante para agregar en este día */}
                        <button
                          type="button"
                          onClick={() => abrirModalCrear(diaItem.fechaStr)}
                          title={`Agregar evento el ${diaItem.fechaStr}`}
                          className="opacity-0 group-hover:opacity-100 p-1 border border-[#CCCCCC] bg-white hover:border-black text-black transition-opacity cursor-pointer shadow-2xs"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      {/* Contenido: Festivo y Eventos */}
                      <div className="my-1 space-y-1 flex-1 overflow-y-auto max-h-[85px]">
                        {/* DÍA FESTIVO (Destacado en dorado corporativo) */}
                        {festivo && (
                          <div
                            className={`border px-1.5 py-0.5 text-[9px] font-bold uppercase truncate shadow-2xs ${
                              festivo.esOficial
                                ? "border-[#D8A814] bg-[#FFFBF0] text-[#937107]"
                                : "border-[#E0E0E0] bg-[#FAFAFA] text-[#666666]"
                            }`}
                            title={`${festivo.nombre} (${festivo.esOficial ? "Oficial" : "Conmemorativo"}): ${
                              festivo.descripcion
                            }`}
                          >
                            <span className="text-[#D8A814] mr-1">★</span>
                            <span>{festivo.nombre}</span>
                          </div>
                        )}

                        {/* Eventos del día */}
                        {eventosCelda.map((ev) => {
                          const esPedido = ev.tipo === "PEDIDO";
                          const completado = ev.estado === "COMPLETADO";

                          return (
                            <button
                              key={ev.id}
                              type="button"
                              onClick={() => setEventoSeleccionado(ev)}
                              className={`w-full text-left border px-1.5 py-0.5 text-[10px] font-medium truncate flex items-center gap-1 transition-all cursor-pointer ${
                                completado
                                  ? "border-[#E0E0E0] bg-[#F5F5F5] text-[#888888] line-through"
                                  : esPedido
                                  ? "border-black bg-[#111111] text-white hover:bg-black"
                                  : "border-[#DDDDDD] bg-[#FAFAFA] text-black hover:border-black"
                              }`}
                              title={`${ev.titulo} ${ev.hora ? `(${ev.hora})` : ""} - Estado: ${ev.estado}`}
                            >
                              <span className="shrink-0 text-[10px]">
                                {esPedido ? "📦" : "⏰"}
                              </span>
                              <span className="font-bold truncate">{ev.titulo}</span>
                              {ev.monto && (
                                <span className="font-mono text-[9px] ml-auto shrink-0 opacity-80">
                                  ${Number(ev.monto).toFixed(0)}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Pie del día si hay muchos */}
                      {eventosCelda.length > 3 && (
                        <p className="text-[9px] font-mono text-[#888888] text-right">
                          +{eventosCelda.length - 3} más
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =========================================================
              VISTA 2: AGENDA Y PRÓXIMAS FECHAS
          ========================================================= */}
          {vistaModo === "agenda" && (
            <div className="space-y-6">
              {Object.entries(eventosAgrupadosAgenda).map(([key, grupo]) => {
                if (grupo.items.length === 0) return null;

                return (
                  <div key={key} className="border border-[#E0E0E0] bg-white shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 bg-[var(--primary)]" />
                        <h3 className="text-sm font-bold uppercase tracking-wider text-black">
                          {grupo.titulo} ({grupo.items.length})
                        </h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {grupo.items.map((evento) => {
                        const esPedido = evento.tipo === "PEDIDO";
                        const completado = evento.estado === "COMPLETADO";

                        return (
                          <div
                            key={evento.id}
                            className={`border p-4 flex flex-col justify-between space-y-3 transition-all ${
                              completado
                                ? "border-[#E5E5E5] bg-[#FAFAFA] opacity-75"
                                : "border-[#DCDCDC] bg-white shadow-2xs hover:border-black"
                            }`}
                          >
                            <div>
                              {/* Header del Item */}
                              <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#F0F0F0]">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">{esPedido ? "📦" : "⏰"}</span>
                                  <span
                                    className={`px-1.5 py-0.2 border text-[9px] font-bold uppercase tracking-wider ${
                                      esPedido
                                        ? "border-black bg-black text-white"
                                        : "border-[#D8A814] bg-[#FFFBF0] text-[#937107]"
                                    }`}
                                  >
                                    {evento.tipo}
                                  </span>
                                  {evento.prioridad === "URGENTE" && (
                                    <span className="border border-red-300 bg-red-50 text-red-700 px-1.5 py-0.2 text-[8px] font-bold uppercase">
                                      Urgente
                                    </span>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleToggleEstado(evento)}
                                  className={`flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 border cursor-pointer ${
                                    completado
                                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                                      : "border-[#CCCCCC] bg-white text-[#666666]"
                                  }`}
                                >
                                  {completado ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                                  <span>{completado ? "Completado" : "Pendiente"}</span>
                                </button>
                              </div>

                              {/* Título y Cliente */}
                              <h4
                                className={`text-base font-bold text-black mt-2 ${
                                  completado ? "line-through text-[#777777]" : ""
                                }`}
                              >
                                {evento.titulo}
                              </h4>

                              {evento.clienteNombre && (
                                <p className="text-xs text-[#555555] flex items-center gap-1.5 mt-0.5">
                                  <User size={12} className="text-[#888888]" />
                                  <span>Cliente: <strong className="text-black">{evento.clienteNombre}</strong></span>
                                </p>
                              )}

                              {evento.descripcion && (
                                <p className="text-xs text-[#777777] mt-1.5 line-clamp-2">
                                  {evento.descripcion}
                                </p>
                              )}

                              {/* Fecha, Hora y Monto */}
                              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-[#666666] pt-2 border-t border-[#F5F5F5]">
                                <span className="flex items-center gap-1 font-mono">
                                  <Clock size={12} className="text-[#888888]" />
                                  {evento.fecha} {evento.hora ? `• ${evento.hora}` : "• Todo el día"}
                                </span>

                                {evento.monto && (
                                  <span className="font-bold text-black font-mono ml-auto">
                                    ${Number(evento.monto).toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Acciones Rápidas */}
                            <div className="pt-2 border-t border-[#EEEEEE] flex items-center justify-between gap-2">
                              {/* Botón WhatsApp */}
                              <button
                                type="button"
                                onClick={() => abrirModalWhatsApp(evento)}
                                className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                                title="Enviar recordatorio a WhatsApp"
                              >
                                <MessageCircle size={13} />
                                <span>WhatsApp</span>
                              </button>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => abrirModalEditar(evento)}
                                  className="text-xs font-bold text-[#666666] hover:text-black cursor-pointer"
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleEliminarEvento(evento.id)}
                                  className="text-xs font-bold text-red-600 hover:text-red-800 cursor-pointer"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {eventosFiltrados.length === 0 && (
                <div className="border border-[#E0E0E0] bg-white p-12 text-center space-y-3">
                  <CalendarIcon size={36} className="mx-auto text-[#CCCCCC]" />
                  <h3 className="text-base font-bold text-black">No hay pedidos o recordatorios en esta lista</h3>
                  <p className="text-xs text-[#777777] max-w-sm mx-auto">
                    Comienza registrando tu primer pedido o nota para programar entregas y avisos por WhatsApp.
                  </p>
                  <button
                    type="button"
                    onClick={() => abrirModalCrear()}
                    className="inline-flex items-center gap-2 border border-black bg-black text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>Registrar Nuevo Elemento</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================
          MODAL: REGISTRAR O EDITAR PEDIDO / RECORDATORIO
          (Cumpliendo Regla 4: Backdrop, ESC, Botón Cancelar)
      ========================================================= */}
      {modalCrearOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget && !guardando) setModalCrearOpen(false);
          }}
        >
          <div
            className="w-full max-w-xl border border-[#DCDCDC] bg-white shadow-2xl cursor-default max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-[#E5E5E5] bg-[#FAFAFA] px-6 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
                  {eventoAEditar ? "Modificar Registro" : "Nuevo Registro"}
                </p>
                <h3 className="text-base font-bold text-black">
                  {formData.tipo === "PEDIDO" ? "Registrar Pedido con Entrega" : "Crear Nota o Recordatorio"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalCrearOpen(false)}
                disabled={guardando}
                className="text-[#777777] hover:text-black cursor-pointer"
                title="Cerrar (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleGuardarEvento} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Selector de Tipo */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                  Tipo de Registro *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tipo: "PEDIDO" })}
                    className={`flex items-center justify-center gap-2 p-3 border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      formData.tipo === "PEDIDO"
                        ? "border-black bg-black text-white"
                        : "border-[#DDDDDD] bg-[#FAFAFA] text-[#666666] hover:border-black"
                    }`}
                  >
                    <span>📦 Pedido de Cliente</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tipo: "RECORDATORIO" })}
                    className={`flex items-center justify-center gap-2 p-3 border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      formData.tipo === "RECORDATORIO"
                        ? "border-black bg-black text-white"
                        : "border-[#DDDDDD] bg-[#FAFAFA] text-[#666666] hover:border-black"
                    }`}
                  >
                    <span>⏰ Nota / Recordatorio</span>
                  </button>
                </div>
              </div>

              {/* Título */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                  {formData.tipo === "PEDIDO" ? "Título o Resumen del Pedido *" : "Título del Recordatorio *"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder={
                    formData.tipo === "PEDIDO"
                      ? "Ej. Pastel 3 leches 50 personas, Pedido de 20 paquetes"
                      : "Ej. Pagar renta de sucursal, Llamar a proveedor de harinas"
                  }
                  className="w-full h-11 border border-[#DCDCDC] bg-white px-4 text-sm text-black focus:border-[var(--primary)] outline-none"
                  autoFocus
                />
              </div>

              {/* Cliente y Monto (Solo para Pedidos) */}
              {formData.tipo === "PEDIDO" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                      Nombre del Cliente
                    </label>
                    <input
                      type="text"
                      value={formData.clienteNombre}
                      onChange={(e) => setFormData({ ...formData, clienteNombre: e.target.value })}
                      placeholder="Ej. María González"
                      className="w-full h-11 border border-[#DCDCDC] bg-white px-4 text-sm text-black focus:border-[var(--primary)] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                      Monto Total ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.monto}
                      onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                      placeholder="0.00"
                      className="w-full h-11 border border-[#DCDCDC] bg-white px-4 text-sm font-mono text-black focus:border-[var(--primary)] outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Fecha y Hora */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                    {formData.tipo === "PEDIDO" ? "Fecha de Entrega *" : "Fecha del Recordatorio *"}
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="w-full h-11 border border-[#DCDCDC] bg-white px-4 text-sm font-mono text-black focus:border-[var(--primary)] outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-black">
                      Hora Programada <span className="text-[#888888] font-normal lowercase">(opcional)</span>
                    </label>
                    {formData.hora && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, hora: "" })}
                        className="text-[11px] font-mono text-[#888888] hover:text-black cursor-pointer"
                        title="Limpiar horario"
                      >
                        ✕ Sin hora
                      </button>
                    )}
                  </div>
                  <input
                    type="time"
                    value={formData.hora}
                    onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                    className="w-full h-11 border border-[#DCDCDC] bg-white px-4 text-sm font-mono text-black focus:border-[var(--primary)] outline-none"
                  />
                  {!formData.hora && (
                    <p className="mt-1 text-[11px] text-[#888888]">
                      Sin hora fijada: se registrará para todo el día.
                    </p>
                  )}
                </div>
              </div>

              {/* Descripción o Especificaciones */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                  {formData.tipo === "PEDIDO" ? "Especificaciones y Detalles" : "Descripción o Notas"}
                </label>
                <textarea
                  rows={2}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Detalles sobre sabor, dirección de entrega, anticipos o notas de atención..."
                  className="w-full border border-[#DCDCDC] bg-white p-3 text-sm text-black focus:border-[var(--primary)] outline-none resize-none"
                />
              </div>

              {/* =========================================================
                  CONFIGURACIÓN DE WHATSAPP (OPCIONAL)
              ========================================================= */}
              <div className="border border-[#E0E0E0] bg-[#FAFAFA] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.enviarWhatsapp}
                      onChange={(e) => setFormData({ ...formData, enviarWhatsapp: e.target.checked })}
                      className="accent-black h-4 w-4 cursor-pointer"
                    />
                    <div className="flex items-center gap-1.5">
                      <MessageCircle
                        size={15}
                        className={formData.enviarWhatsapp ? "text-emerald-600" : "text-[#777777]"}
                      />
                      <span className="text-xs font-bold uppercase tracking-wider text-black">
                        Enviar Recordatorio por WhatsApp
                      </span>
                      <span className="text-[11px] text-[#888888] font-normal lowercase">(opcional)</span>
                    </div>
                  </label>

                  <span className="text-[10px] text-[#777777] font-mono">
                    {whatsappConectado ? "Servidor conectado" : "Enlace web disponible"}
                  </span>
                </div>

                {formData.enviarWhatsapp ? (
                  <div className="pt-3 border-t border-[#EAEAEA] space-y-3">
                    <p className="text-xs text-[#666666]">
                      ¿A qué número deseas dirigir el recordatorio de WhatsApp?
                    </p>

                    {/* Selección: Mi número personal vs Número particular */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        className={`flex items-start gap-2.5 p-3 border cursor-pointer transition-colors ${
                          formData.destinoTelefonoTipo === "personal"
                            ? "border-black bg-white"
                            : "border-[#DDDDDD] bg-[#F7F7F7] hover:border-[#BBBBBB]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="destinoTelefonoTipo"
                          checked={formData.destinoTelefonoTipo === "personal"}
                          onChange={() => setFormData({ ...formData, destinoTelefonoTipo: "personal" })}
                          className="mt-0.5 accent-black"
                        />
                        <div>
                          <p className="text-xs font-bold text-black">Mi WhatsApp Personal</p>
                          <p className="text-[11px] font-mono text-[#777777] mt-0.5">{telefonoPersonal}</p>
                        </div>
                      </label>

                      <label
                        className={`flex items-start gap-2.5 p-3 border cursor-pointer transition-colors ${
                          formData.destinoTelefonoTipo === "particular"
                            ? "border-black bg-white"
                            : "border-[#DDDDDD] bg-[#F7F7F7] hover:border-[#BBBBBB]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="destinoTelefonoTipo"
                          checked={formData.destinoTelefonoTipo === "particular"}
                          onChange={() => setFormData({ ...formData, destinoTelefonoTipo: "particular" })}
                          className="mt-0.5 accent-black"
                        />
                        <div>
                          <p className="text-xs font-bold text-black">Número en Particular</p>
                          <p className="text-[11px] text-[#777777] mt-0.5">Cliente, proveedor o colaborador</p>
                        </div>
                      </label>
                    </div>

                    {/* Campo si seleccionó número en particular */}
                    {formData.destinoTelefonoTipo === "particular" && (
                      <div className="pt-1">
                        <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">
                          Teléfono de WhatsApp (10 dígitos) *
                        </label>
                        <input
                          type="tel"
                          required={formData.destinoTelefonoTipo === "particular" && formData.enviarWhatsapp}
                          value={formData.telefonoParticular}
                          onChange={(e) => setFormData({ ...formData, telefonoParticular: e.target.value })}
                          placeholder="Ej. 249 123 4567 o 55 1234 5678"
                          className="w-full h-10 border border-[#DCDCDC] bg-white px-3 text-sm font-mono text-black focus:border-[var(--primary)] outline-none"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#777777] pl-6">
                    Sin envío automático al guardar. Podrás enviar o abrir recordatorios de WhatsApp manualmente cuando lo requieras.
                  </p>
                )}
              </div>

              {/* Prioridad y Estado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                    Prioridad
                  </label>
                  <select
                    value={formData.prioridad}
                    onChange={(e) => setFormData({ ...formData, prioridad: e.target.value as any })}
                    className="w-full h-11 border border-[#DCDCDC] bg-white px-4 text-xs font-bold text-black focus:border-[var(--primary)] outline-none"
                  >
                    <option value="BAJA">Baja</option>
                    <option value="MEDIA">Media / Normal</option>
                    <option value="ALTA">Alta</option>
                    <option value="URGENTE">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                    Estado
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                    className="w-full h-11 border border-[#DCDCDC] bg-white px-4 text-xs font-bold text-black focus:border-[var(--primary)] outline-none"
                  >
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="EN_PROCESO">En Proceso</option>
                    <option value="COMPLETADO">Completado / Entregado</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end gap-3 border-t border-[#EEEEEE] pt-4">
                <button
                  type="button"
                  onClick={() => setModalCrearOpen(false)}
                  disabled={guardando}
                  className="border border-[#CCCCCC] bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#555555] hover:text-black cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando || !formData.titulo.trim()}
                  className="flex items-center gap-2 border border-black bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#222222] cursor-pointer disabled:opacity-40"
                >
                  {guardando && <Loader2 size={14} className="animate-spin" />}
                  <span>{eventoAEditar ? "Actualizar" : "Guardar en Calendario"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: ENVIAR MENSAJE DE WHATSAPP DIRECTO
      ========================================================= */}
      {modalWhatsappOpen && eventoParaWhatsapp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget && !enviandoWa) setModalWhatsappOpen(false);
          }}
        >
          <div
            className="w-full max-w-lg border border-[#DCDCDC] bg-white shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E5E5E5] bg-[#FAFAFA] px-6 py-4">
              <div className="flex items-center gap-2">
                <MessageCircle size={18} className="text-emerald-600" />
                <h3 className="text-sm font-bold text-black">
                  Enviar Recordatorio por WhatsApp
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalWhatsappOpen(false)}
                disabled={enviandoWa}
                className="text-[#777777] hover:text-black cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEnviarWhatsAppSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                  Número de Teléfono Destino *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="tel"
                    required
                    value={telefonoDestino}
                    onChange={(e) => setTelefonoDestino(e.target.value)}
                    placeholder="Ej. 249 153 7727"
                    className="flex-1 h-11 border border-[#DCDCDC] bg-white px-4 text-sm font-mono text-black focus:border-[var(--primary)] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setTelefonoDestino(telefonoPersonal)}
                    className="px-3 h-11 border border-[#CCCCCC] bg-[#FAFAFA] text-[11px] font-bold uppercase text-black hover:border-black transition-colors cursor-pointer"
                    title="Usar mi número personal"
                  >
                    Mi Teléfono
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                  Mensaje a Enviar *
                </label>
                <textarea
                  rows={6}
                  required
                  value={mensajeWhatsapp}
                  onChange={(e) => setMensajeWhatsapp(e.target.value)}
                  className="w-full border border-[#DCDCDC] bg-white p-3 text-xs font-mono text-black focus:border-[var(--primary)] outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#EEEEEE]">
                <button
                  type="button"
                  onClick={() => {
                    const rawPhone = telefonoDestino.replace(/\D/g, "");
                    const fullPhone = rawPhone.length === 10 ? `521${rawPhone}` : rawPhone;
                    const waUrl = `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(
                      mensajeWhatsapp
                    )}`;
                    window.open(waUrl, "_blank");
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#555555] hover:text-black cursor-pointer"
                >
                  <ExternalLink size={13} />
                  <span>Abrir en WhatsApp Web</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalWhatsappOpen(false)}
                    disabled={enviandoWa}
                    className="border border-[#CCCCCC] bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#555555] hover:text-black cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={enviandoWa || !telefonoDestino.trim()}
                    className="flex items-center gap-1.5 border border-emerald-600 bg-emerald-600 text-white px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 cursor-pointer disabled:opacity-40"
                  >
                    {enviandoWa ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                    <span>Enviar Mensaje</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: DETALLES DE ELEMENTO SELECCIONADO
      ========================================================= */}
      {eventoSeleccionado && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEventoSeleccionado(null);
          }}
        >
          <div
            className="w-full max-w-md border border-[#DCDCDC] bg-white shadow-2xl cursor-default p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#F0F0F0] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{eventoSeleccionado.tipo === "PEDIDO" ? "📦" : "⏰"}</span>
                <div>
                  <span className="border border-black bg-black text-white px-2 py-0.2 text-[9px] font-bold uppercase">
                    {eventoSeleccionado.tipo}
                  </span>
                  <h4 className="text-base font-bold text-black mt-1">
                    {eventoSeleccionado.titulo}
                  </h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEventoSeleccionado(null)}
                className="text-[#777777] hover:text-black cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#F5F5F5]">
                <span className="text-[#777777]">Fecha programada:</span>
                <span className="font-mono font-bold text-black">
                  {eventoSeleccionado.fecha} {eventoSeleccionado.hora ? `(${eventoSeleccionado.hora})` : "(Todo el día)"}
                </span>
              </div>

              {eventoSeleccionado.clienteNombre && (
                <div className="flex justify-between py-1 border-b border-[#F5F5F5]">
                  <span className="text-[#777777]">Cliente:</span>
                  <span className="font-bold text-black">{eventoSeleccionado.clienteNombre}</span>
                </div>
              )}

              {eventoSeleccionado.monto && (
                <div className="flex justify-between py-1 border-b border-[#F5F5F5]">
                  <span className="text-[#777777]">Monto total:</span>
                  <span className="font-mono font-bold text-black">
                    ${Number(eventoSeleccionado.monto).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between py-1 border-b border-[#F5F5F5]">
                <span className="text-[#777777]">Estado:</span>
                <span className="font-bold uppercase text-black">{eventoSeleccionado.estado}</span>
              </div>

              {eventoSeleccionado.telefono && (
                <div className="flex justify-between py-1 border-b border-[#F5F5F5]">
                  <span className="text-[#777777]">WhatsApp:</span>
                  <span className="font-mono text-black">{eventoSeleccionado.telefono}</span>
                </div>
              )}

              {eventoSeleccionado.descripcion && (
                <div className="pt-2">
                  <span className="text-[#777777] block mb-1">Notas / Especificaciones:</span>
                  <p className="bg-[#FAFAFA] border border-[#EEEEEE] p-2.5 text-xs text-black leading-relaxed">
                    {eventoSeleccionado.descripcion}
                  </p>
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-between pt-3 border-t border-[#F0F0F0]">
              <button
                type="button"
                onClick={() => handleEliminarEvento(eventoSeleccionado.id)}
                className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-800 cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Eliminar</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const sel = eventoSeleccionado;
                    setEventoSeleccionado(null);
                    abrirModalWhatsApp(sel);
                  }}
                  className="flex items-center gap-1 border border-emerald-600 bg-emerald-600 text-white px-3 py-1.5 text-xs font-bold uppercase cursor-pointer"
                >
                  <MessageCircle size={13} />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => abrirModalEditar(eventoSeleccionado)}
                  className="flex items-center gap-1 border border-black bg-black text-white px-3 py-1.5 text-xs font-bold uppercase cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>Editar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
