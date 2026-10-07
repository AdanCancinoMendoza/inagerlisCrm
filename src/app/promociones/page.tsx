"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Megaphone,
  Plus,
  Send,
  MessageCircle,
  Phone,
  User,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Smartphone,
  Share2,
  RefreshCw,
  Loader2,
  Check,
  Tag,
  ArrowRight,
  Search,
  X,
  Package,
  Gift,
  Clock,
  Layers,
  Percent,
  Settings,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSidebar } from "@/context/SidebarContext";
import { useTheme } from "@/context/ThemeContext";
import { apiRequest } from "@/services/api";
import { getOrganizacionId, getUsuarioActual } from "@/services/auth";
import { getClientes, Cliente } from "@/services/clientes";
import { useSocket } from "@/hooks/useSocket";

/* =========================================================
   TIPOS DE DATOS
========================================================= */

type CampanaItem = {
  id: string;
  nombre: string;
  canal: string;
  mensaje: string;
  estado: string;
  totalDestinatarios: number;
  enviados: number;
  fechaEnvio?: string | null;
  createdAt: string;
};

type ArticuloItem = {
  id: string;
  nombre: string;
  codigo: string;
  precioVenta: number;
  unidad: string;
  imagen?: string | null;
};

type OrganizacionData = {
  id: string;
  nombre: string;
  telefono?: string | null;
  whatsapp?: string | null;
  email?: string | null;
};

type ResultadoEnvio = {
  exito: boolean;
  totalClientes: number;
  destinatarios: {
    clienteId: string;
    nombre: string;
    telefono: string;
    telefonoFormato: string;
    mensajePersonalizado: string;
    whatsappUrl: string;
  }[];
  campana?: any;
};

/* =========================================================
   PLANTILLAS PREDETERMINADAS
========================================================= */
const PLANTILLAS_PREDEFINIDAS = [
  {
    id: "articulo",
    nombre: "Promoción de Producto POS",
    descripcion: "Impulsa la venta de un artículo con precio especial",
    titulo: "¡Oferta Especial en {articulo}!",
    texto:
      "¡Hola {cliente}! 👋 En {organizacion} tenemos una promoción especial para ti:\n\n🔥 *{articulo}* a solo *{precio}*.\n\nVen por el tuyo hoy mismo o escríbenos a este número para apartarlo. ¡Te esperamos! ✨",
  },
  {
    id: "descuento",
    nombre: "Descuento Exclusivo",
    descripcion: "Ofrece un cupón o descuento por tiempo limitado",
    titulo: "Descuento Especial de {descuento}",
    texto:
      "¡Hola {cliente}! 🎉 Como agradecimiento por tu preferencia en {organizacion}, te obsequiamos un *{descuento} de descuento* en tu próxima compra.\n\nMuestra este mensaje al pagar en caja. ¡Válido durante toda esta semana! 🛍️",
  },
  {
    id: "puntos",
    nombre: "Fidelidad y Puntos Acumulados",
    descripcion: "Informa al cliente de sus beneficios y saldo de puntos",
    titulo: "¡Tus Puntos Acumulados en {organizacion}!",
    texto:
      "¡Hola {cliente}! 🌟 En {organizacion} tienes *{puntos} puntos acumulados* listos para canjear en tus productos favoritos.\n\nVisítanos y aprovéchalos en tu siguiente ticket. ¡Gracias por confiar en nosotros!",
  },
  {
    id: "reactivacion",
    nombre: "Reactivación de Clientes",
    descripcion: "Recupera clientes que no han comprado recientemente",
    titulo: "¡Te extrañamos en {organizacion}!",
    texto:
      "¡Hola {cliente}! Hace tiempo que no te vemos en {organizacion} y queremos consentirte.\n\nVen esta semana y recibe un obsequio especial en tu compra diciendo que recibiste este WhatsApp. ¡Nos dará mucho gusto atenderte de nuevo!",
  },
  {
    id: "personalizado",
    nombre: "Mensaje Personalizado",
    descripcion: "Redacta un anuncio libre con tus propias palabras",
    titulo: "Aviso Especial para Clientes",
    texto:
      "¡Hola {cliente}! 👋 Tenemos novedades importantes en {organizacion}. ¡Contáctanos a este WhatsApp para más información!",
  },
];

export default function PromocionesPage() {
  const { collapsed } = useSidebar();
  const { activePalette } = useTheme();

  // Estados principales de datos
  const [cargando, setCargando] = useState(true);
  const [orgData, setOrgData] = useState<OrganizacionData | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [campanas, setCampanas] = useState<CampanaItem[]>([]);
  const [articulos, setArticulos] = useState<ArticuloItem[]>([]);

  // Estados de Modales
  const [modalCampanaOpen, setModalCampanaOpen] = useState(false);
  const [modalWhatsappOpen, setModalWhatsappOpen] = useState(false);
  const [modalDetalleCampana, setModalDetalleCampana] = useState<CampanaItem | null>(null);
  const [modalResultado, setModalResultado] = useState<ResultadoEnvio | null>(null);

  // Estados de Formulario de Campaña
  const [tipoCampana, setTipoCampana] = useState<string>("articulo");
  const [nombreCampana, setNombreCampana] = useState("");
  const [mensajeCampana, setMensajeCampana] = useState("");
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<ArticuloItem | null>(null);
  const [busquedaArticulo, setBusquedaArticulo] = useState("");
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState("15%");
  const [segmentoSeleccionado, setSegmentoSeleccionado] = useState<string>("whatsapp");
  const [clientesSeleccionadosIds, setClientesSeleccionadosIds] = useState<string[]>([]);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [enviandoCampana, setEnviandoCampana] = useState(false);

  // Estados de Configuración de WhatsApp de Organización
  const [nuevoWhatsappOrg, setNuevoWhatsappOrg] = useState("");
  const [guardandoWhatsapp, setGuardandoWhatsapp] = useState(false);
  const [alertaExitoWhatsapp, setAlertaExitoWhatsapp] = useState(false);

  // Conexión Socket para eventos en tiempo real
  const orgIdStored = typeof window !== "undefined" ? getOrganizacionId() : "";
  const { socket } = useSocket(orgIdStored ? `org_${orgIdStored}` : "");

  /* =========================================================
     CARGA DE DATOS
  ========================================================= */
  const cargarDatos = async () => {
    setCargando(true);
    try {
      const orgId = getOrganizacionId();

      // Cargar datos de la Organización
      try {
        const orgsRes = await apiRequest<OrganizacionData[]>("/organizaciones");
        if (Array.isArray(orgsRes) && orgsRes.length > 0) {
          const orgEncontrada = orgId
            ? orgsRes.find((o) => o.id === orgId) || orgsRes[0]
            : orgsRes[0];
          setOrgData(orgEncontrada);
          setNuevoWhatsappOrg(orgEncontrada.whatsapp || orgEncontrada.telefono || "");
        }
      } catch (err) {
        console.warn("No se pudo cargar organización:", err);
      }

      // Cargar Clientes
      try {
        const clientesRes = await getClientes(orgId || "default");
        if (Array.isArray(clientesRes)) {
          setClientes(clientesRes);
        }
      } catch (err) {
        console.warn("No se pudieron cargar clientes:", err);
      }

      // Cargar Campañas
      try {
        const campanasRes = await apiRequest<CampanaItem[]>(
          `/ventas/campanas/${orgId || "default"}`
        );
        if (Array.isArray(campanasRes)) {
          setCampanas(campanasRes);
        }
      } catch (err) {
        console.warn("No se pudieron cargar campañas:", err);
      }

      // Cargar Catálogo de Artículos
      try {
        if (orgId) {
          const artsRes = await apiRequest<ArticuloItem[]>(`/articulos/organizacion/${orgId}`);
          if (Array.isArray(artsRes)) {
            setArticulos(artsRes);
          }
        }
      } catch (err) {
        console.warn("No se pudieron cargar artículos:", err);
      }
    } catch (e) {
      console.error("Error al cargar datos en Promociones:", e);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Escucha Socket
  useEffect(() => {
    if (!socket) return;
    const handleVenta = () => {
      cargarDatos();
    };
    socket.on("venta:creada", handleVenta);
    return () => {
      socket.off("venta:creada", handleVenta);
    };
  }, [socket]);

  /* =========================================================
     SEGMENTACIÓN DE AUDIENCIAS
  ========================================================= */
  const clientesConWhatsapp = useMemo(
    () => clientes.filter((c) => Boolean(c.telefono && c.telefono.trim().length >= 8)),
    [clientes]
  );

  const clientesFrecuentes = useMemo(
    () =>
      clientesConWhatsapp.filter(
        (c) => (c.puntos && c.puntos > 0) || (c.comprasCount && c.comprasCount > 0)
      ),
    [clientesConWhatsapp]
  );

  const clientesNuevos = useMemo(() => {
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    return clientesConWhatsapp.filter((c) => {
      if (!c.createdAt) return true;
      return new Date(c.createdAt) >= hace30Dias;
    });
  }, [clientesConWhatsapp]);

  // Selección de segmento automática
  useEffect(() => {
    if (segmentoSeleccionado === "whatsapp") {
      setClientesSeleccionadosIds(clientesConWhatsapp.map((c) => c.id));
    } else if (segmentoSeleccionado === "frecuentes") {
      setClientesSeleccionadosIds(clientesFrecuentes.map((c) => c.id));
    } else if (segmentoSeleccionado === "nuevos") {
      setClientesSeleccionadosIds(clientesNuevos.map((c) => c.id));
    } else if (segmentoSeleccionado === "todos") {
      setClientesSeleccionadosIds(clientes.map((c) => c.id));
    }
  }, [segmentoSeleccionado, clientesConWhatsapp, clientesFrecuentes, clientesNuevos, clientes]);

  /* =========================================================
     CÁLCULO DE MÉTRICAS KPI
  ========================================================= */
  const totalCampanasCreadas = campanas.length;
  const campanasActivasCount = campanas.filter(
    (c) => c.estado === "ACTIVA" || c.estado === "ENVIADA"
  ).length;
  const totalMensajesEnviados = campanas.reduce(
    (acc, c) => acc + (c.enviados || c.totalDestinatarios || 0),
    0
  );
  const porcentajeCoberturaWhatsapp =
    clientes.length > 0
      ? Math.round((clientesConWhatsapp.length / clientes.length) * 100)
      : 100;

  /* =========================================================
     APLICAR PLANTILLA AL FORMULARIO
  ========================================================= */
  const aplicarPlantilla = (idPlantilla: string, articuloExtra?: ArticuloItem) => {
    setTipoCampana(idPlantilla);
    const plantilla =
      PLANTILLAS_PREDEFINIDAS.find((p) => p.id === idPlantilla) ||
      PLANTILLAS_PREDEFINIDAS[0];

    let texto = plantilla.texto;
    let titulo = plantilla.titulo;

    const art = articuloExtra || articuloSeleccionado;
    if (art) {
      texto = texto
        .replace(/{articulo}/g, art.nombre)
        .replace(/{precio}/g, `$${Number(art.precioVenta || 0).toFixed(2)}`);
      titulo = titulo.replace(/{articulo}/g, art.nombre);
    }

    texto = texto.replace(/{descuento}/g, descuentoPorcentaje);
    titulo = titulo.replace(/{descuento}/g, descuentoPorcentaje);

    setNombreCampana(titulo);
    setMensajeCampana(texto);
  };

  /* =========================================================
     ABRIR CREADOR DE CAMPAÑA DESDE ATAJOS
  ========================================================= */
  const abrirCreadorConModo = (modo: "articulo" | "descuento" | "personalizado" | "segmento", segmentoTarget?: string) => {
    if (modo === "segmento" && segmentoTarget) {
      setSegmentoSeleccionado(segmentoTarget);
      aplicarPlantilla("personalizado");
    } else if (modo === "articulo") {
      const primerArt = articulos[0] || null;
      if (primerArt) {
        setArticuloSeleccionado(primerArt);
        aplicarPlantilla("articulo", primerArt);
      } else {
        aplicarPlantilla("articulo");
      }
    } else if (modo === "descuento") {
      aplicarPlantilla("descuento");
    } else {
      aplicarPlantilla("personalizado");
    }
    setModalCampanaOpen(true);
  };

  /* =========================================================
     PREVIEW EN TIEMPO REAL DEL MENSAJE WHATSAPP
  ========================================================= */
  const previewMensajeGenerado = useMemo(() => {
    const clienteMuestra =
      clientes.find((c) => clientesSeleccionadosIds.includes(c.id)) ||
      clientes[0] || {
        nombre: "Adan Cancino",
        puntos: 150,
        descuento: 15,
      };

    const orgNombre = orgData?.nombre || "Nuestra Empresa";
    const orgWhatsapp = orgData?.whatsapp || orgData?.telefono || "+52 249 153 7727";
    const artNombre = articuloSeleccionado?.nombre || "Producto en Promoción";
    const artPrecio = articuloSeleccionado
      ? `$${Number(articuloSeleccionado.precioVenta).toFixed(2)}`
      : "$45.00";

    return (mensajeCampana || "Escribe el mensaje de la campaña...")
      .replace(/{cliente}/g, clienteMuestra.nombre)
      .replace(/{organizacion}/g, orgNombre)
      .replace(/{telefono_org}/g, orgWhatsapp)
      .replace(/{puntos}/g, String(clienteMuestra.puntos || 0))
      .replace(/{descuento}/g, descuentoPorcentaje)
      .replace(/{articulo}/g, artNombre)
      .replace(/{precio}/g, artPrecio);
  }, [
    mensajeCampana,
    clientes,
    clientesSeleccionadosIds,
    orgData,
    articuloSeleccionado,
    descuentoPorcentaje,
  ]);

  /* =========================================================
     GUARDAR WHATSAPP DE LA ORGANIZACIÓN
  ========================================================= */
  const handleGuardarWhatsappOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgData?.id) return;
    setGuardandoWhatsapp(true);
    try {
      const limpia = nuevoWhatsappOrg.trim();
      const res = await apiRequest<OrganizacionData>(`/organizaciones/${orgData.id}`, {
        method: "PUT",
        body: JSON.stringify({
          whatsapp: limpia,
          telefono: limpia,
        }),
      });

      setOrgData((prev) => (prev ? { ...prev, whatsapp: limpia, telefono: limpia } : prev));
      setAlertaExitoWhatsapp(true);
      setTimeout(() => {
        setAlertaExitoWhatsapp(false);
        setModalWhatsappOpen(false);
      }, 1500);
    } catch (err) {
      console.error("Error al actualizar WhatsApp de organización:", err);
      alert("No se pudo guardar el número de WhatsApp.");
    } finally {
      setGuardandoWhatsapp(false);
    }
  };

  /* =========================================================
     DISPARAR / ENVIAR CAMPAÑA POR WHATSAPP
  ========================================================= */
  const handleEnviarCampana = async () => {
    if (!nombreCampana.trim()) {
      alert("Por favor ingresa un nombre para la campaña.");
      return;
    }
    if (!mensajeCampana.trim()) {
      alert("Por favor escribe el mensaje para la campaña.");
      return;
    }
    if (clientesSeleccionadosIds.length === 0) {
      alert("Selecciona al menos un cliente con número de WhatsApp.");
      return;
    }

    setEnviandoCampana(true);
    try {
      const orgId = getOrganizacionId() || orgData?.id || "default";
      const payload = {
        organizacionId: orgId,
        nombreCampana: nombreCampana.trim(),
        mensaje: mensajeCampana.trim(),
        clientesIds: clientesSeleccionadosIds,
        articuloNombre: articuloSeleccionado?.nombre,
        articuloPrecio: articuloSeleccionado?.precioVenta,
      };

      const resultado = await apiRequest<ResultadoEnvio>("/ventas/campanas/enviar", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setModalCampanaOpen(false);
      setModalResultado(resultado);
      cargarDatos(); // Refrescar lista de campañas y métricas
    } catch (err) {
      console.error("Error al enviar campaña:", err);
      alert("Ocurrió un error al despachar la campaña de WhatsApp.");
    } finally {
      setEnviandoCampana(false);
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

        <div className="p-6 md:p-10 space-y-6">
          {/* =========================================================
              ENCABEZADO DE LA SECCIÓN
          ========================================================= */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-[0.18em]"
                style={{ color: "var(--primary)" }}
              >
                CRM
              </p>

              <h1 className="mt-1 text-3xl font-extrabold text-black">
                Promociones
              </h1>

              <p className="mt-1.5 max-w-2xl text-xs sm:text-sm text-[#777777]">
                Envía promociones, ofertas de productos y recordatorios personalizados directamente
                al WhatsApp de tus clientes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cargarDatos}
                title="Actualizar datos"
                className="h-11 w-11 border border-[#E2E2E2] bg-white flex items-center justify-center text-gray-700 hover:text-black hover:border-black transition-colors cursor-pointer shadow-2xs"
              >
                <RefreshCw size={16} className={cargando ? "animate-spin" : ""} />
              </button>

              <button
                type="button"
                onClick={() => abrirCreadorConModo("personalizado")}
                className="h-11 px-6 font-bold text-xs uppercase tracking-wider text-white transition-all hover:bg-black flex items-center gap-2 shadow-xs cursor-pointer"
                style={{ backgroundColor: "var(--primary)" }}
              >
                <Plus size={16} />
                <span>Nueva campaña</span>
              </button>
            </div>
          </div>

          {/* =========================================================
              TARJETAS KPI SUPERIORES (MATCHING SCREENSHOT)
          ========================================================= */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* Card 1: Campañas Creadas (Theme Color) */}
            <div
              className="p-6 text-white shadow-2xs transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: "var(--primary)" }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.15em] opacity-90">
                Campañas
              </p>
              <p className="mt-4 text-4xl font-extrabold font-mono">
                {totalCampanasCreadas}
              </p>
              <p className="mt-2 text-xs font-medium opacity-90">
                Campañas creadas
              </p>
            </div>

            {/* Card 2: Activas */}
            <div className="border border-[#E2E2E2] bg-white p-6 shadow-2xs transition-transform hover:-translate-y-0.5">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#777777]">
                Activas
              </p>
              <p className="mt-4 text-4xl font-extrabold font-mono text-black">
                {campanasActivasCount}
              </p>
              <p className="mt-2 text-xs text-[#888888]">
                Ejecutándose actualmente
              </p>
            </div>

            {/* Card 3: Mensajes Enviados */}
            <div className="border border-[#E2E2E2] bg-white p-6 shadow-2xs transition-transform hover:-translate-y-0.5">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#777777]">
                Mensajes enviados
              </p>
              <p className="mt-4 text-4xl font-extrabold font-mono text-black">
                {totalMensajesEnviados.toLocaleString()}
              </p>
              <p className="mt-2 text-xs text-[#888888]">
                Enviados vía WhatsApp
              </p>
            </div>

            {/* Card 4: Cobertura WhatsApp */}
            <div className="border border-[#E2E2E2] bg-white p-6 shadow-2xs transition-transform hover:-translate-y-0.5">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#777777]">
                Clientes con WhatsApp
              </p>
              <p className="mt-4 text-4xl font-extrabold font-mono text-black">
                {clientesConWhatsapp.length}
              </p>
              <p className="mt-2 text-xs text-[#888888]">
                {porcentajeCoberturaWhatsapp}% del catálogo ({clientes.length} registrados)
              </p>
            </div>
          </div>

          {/* =========================================================
              BANNER DE CONEXIÓN WHATSAPP (MATCHING SCREENSHOT)
          ========================================================= */}
          <section className="border border-[#E2E2E2] bg-white shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-7 py-6 gap-4">
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#050505] text-xl font-bold text-white shadow-xs">
                  <Smartphone size={24} className="text-emerald-400" />
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-black">
                      WhatsApp
                    </h2>

                    {orgData?.whatsapp ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        CONECTADO
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        NÚMERO PENDIENTE
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm font-mono font-bold text-[#555555]">
                    {orgData?.whatsapp || "Sin número registrado aún"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalWhatsappOpen(true)}
                className="h-11 border border-black px-5 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-black hover:text-white cursor-pointer shadow-2xs"
              >
                Administrar conexión
              </button>
            </div>

            <div className="grid grid-cols-1 border-t border-[#EEEEEE] sm:grid-cols-3">
              <div className="px-7 py-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#999999]">
                  Estado
                </p>
                <p className="mt-1 text-xs font-semibold text-black">
                  {orgData?.whatsapp ? "Disponible para campañas masivas" : "Configura el número oficial"}
                </p>
              </div>

              <div className="border-[#EEEEEE] px-7 py-4 sm:border-l">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#999999]">
                  Última sincronización
                </p>
                <p className="mt-1 text-xs font-semibold text-black">
                  En tiempo real · {orgData?.nombre || "Mi Empresa"}
                </p>
              </div>

              <div className="border-[#EEEEEE] px-7 py-4 sm:border-l">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#999999]">
                  Mensajes disponibles
                </p>
                <p className="mt-1 text-xs font-semibold text-black">
                  Sin límite configurado
                </p>
              </div>
            </div>
          </section>

          {/* =========================================================
              CUADRÍCULA DE 3 COLUMNAS: CREAR / AUDIENCIAS / AUTOMATIZACIÓN
          ========================================================= */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            {/* Columna 1: Crear Nueva Campaña */}
            <section className="border border-[#E2E2E2] bg-white p-7 shadow-2xs flex flex-col justify-between">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-[0.16em]"
                  style={{ color: "var(--primary)" }}
                >
                  Crear
                </p>

                <h2 className="mt-2 text-xl font-bold text-black">
                  Nueva campaña
                </h2>

                <p className="mt-2 text-xs text-[#777777] leading-relaxed">
                  Envía ofertas, promociones o recordatorios a un grupo de clientes vía WhatsApp.
                </p>

                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    onClick={() => abrirCreadorConModo("articulo")}
                    className="flex w-full items-center justify-between border border-[#E5E5E5] px-5 py-3.5 text-left transition-all hover:border-black hover:bg-gray-50/50 cursor-pointer group"
                  >
                    <div>
                      <p className="text-xs font-bold text-black flex items-center gap-2">
                        <Package size={14} style={{ color: "var(--primary)" }} />
                        <span>Promocionar artículo</span>
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#888888]">
                        Selecciona un producto del catálogo POS ({articulos.length} disponibles)
                      </p>
                    </div>
                    <span
                      className="text-sm font-bold transition-transform group-hover:translate-x-1"
                      style={{ color: "var(--primary)" }}
                    >
                      →
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => abrirCreadorConModo("descuento")}
                    className="flex w-full items-center justify-between border border-[#E5E5E5] px-5 py-3.5 text-left transition-all hover:border-black hover:bg-gray-50/50 cursor-pointer group"
                  >
                    <div>
                      <p className="text-xs font-bold text-black flex items-center gap-2">
                        <Percent size={14} style={{ color: "var(--primary)" }} />
                        <span>Promocionar descuento</span>
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#888888]">
                        Descuento especial por tiempo limitado
                      </p>
                    </div>
                    <span
                      className="text-sm font-bold transition-transform group-hover:translate-x-1"
                      style={{ color: "var(--primary)" }}
                    >
                      →
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => abrirCreadorConModo("personalizado")}
                    className="flex w-full items-center justify-between border border-[#E5E5E5] px-5 py-3.5 text-left transition-all hover:border-black hover:bg-gray-50/50 cursor-pointer group"
                  >
                    <div>
                      <p className="text-xs font-bold text-black flex items-center gap-2">
                        <MessageCircle size={14} style={{ color: "var(--primary)" }} />
                        <span>Mensaje personalizado</span>
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#888888]">
                        Crea un mensaje desde cero con variables dinámicas
                      </p>
                    </div>
                    <span
                      className="text-sm font-bold transition-transform group-hover:translate-x-1"
                      style={{ color: "var(--primary)" }}
                    >
                      →
                    </span>
                  </button>
                </div>
              </div>
            </section>

            {/* Columna 2: Audiencias / Segmentos Sugeridos */}
            <section className="border border-[#E2E2E2] bg-white p-7 shadow-2xs">
              <p
                className="text-xs font-bold uppercase tracking-[0.16em]"
                style={{ color: "var(--primary)" }}
              >
                Audiencias
              </p>

              <h2 className="mt-2 text-xl font-bold text-black">
                Segmentos sugeridos
              </h2>

              <p className="mt-2 text-xs text-[#777777]">
                Haz clic en cualquier segmento para seleccionarlo inmediatamente:
              </p>

              <div className="mt-6 space-y-4">
                <button
                  type="button"
                  onClick={() => abrirCreadorConModo("segmento", "frecuentes")}
                  className="flex w-full items-center justify-between border-b border-[#EEEEEE] pb-3 text-left hover:bg-gray-50/70 p-2 transition-colors cursor-pointer group"
                >
                  <div>
                    <p className="text-xs font-bold text-black group-hover:underline">
                      Clientes frecuentes
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#888888]">
                      Con compras previas o puntos
                    </p>
                  </div>
                  <span
                    className="text-sm font-black font-mono"
                    style={{ color: "var(--primary)" }}
                  >
                    {clientesFrecuentes.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => abrirCreadorConModo("segmento", "nuevos")}
                  className="flex w-full items-center justify-between border-b border-[#EEEEEE] pb-3 text-left hover:bg-gray-50/70 p-2 transition-colors cursor-pointer group"
                >
                  <div>
                    <p className="text-xs font-bold text-black group-hover:underline">
                      Clientes nuevos
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#888888]">
                      Registrados últimos 30 días
                    </p>
                  </div>
                  <span
                    className="text-sm font-black font-mono"
                    style={{ color: "var(--primary)" }}
                  >
                    {clientesNuevos.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => abrirCreadorConModo("segmento", "whatsapp")}
                  className="flex w-full items-center justify-between border-b border-[#EEEEEE] pb-3 text-left hover:bg-gray-50/70 p-2 transition-colors cursor-pointer group"
                >
                  <div>
                    <p className="text-xs font-bold text-black group-hover:underline">
                      Clientes con WhatsApp
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#888888]">
                      Con número telefónico válido
                    </p>
                  </div>
                  <span
                    className="text-sm font-black font-mono text-emerald-600"
                  >
                    {clientesConWhatsapp.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => abrirCreadorConModo("segmento", "todos")}
                  className="flex w-full items-center justify-between text-left hover:bg-gray-50/70 p-2 transition-colors cursor-pointer group"
                >
                  <div>
                    <p className="text-xs font-bold text-black group-hover:underline">
                      Todos los clientes
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#888888]">
                      Catálogo total registrado
                    </p>
                  </div>
                  <span className="text-sm font-black font-mono text-black">
                    {clientes.length}
                  </span>
                </button>
              </div>
            </section>

            {/* Columna 3: Automatización / Campañas Inteligentes (Dark Card) */}
            <section className="border border-[#050505] bg-[#050505] p-7 text-white shadow-2xs flex flex-col justify-between">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-[0.16em]"
                  style={{ color: "var(--primary)" }}
                >
                  Automatización
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  Campañas inteligentes
                </h2>

                <p className="mt-2 text-xs leading-relaxed text-[#AAAAAA]">
                  Plantillas diseñadas para automatizar la comunicación y fidelidad de tus clientes.
                </p>

                <div className="mt-6 space-y-4">
                  <div
                    onClick={() => {
                      aplicarPlantilla("reactivacion");
                      setModalCampanaOpen(true);
                    }}
                    className="border-b border-[#292929] pb-3 hover:text-[var(--primary)] cursor-pointer transition-colors"
                  >
                    <p className="text-xs font-bold">Recompra & Reactivación</p>
                    <p className="mt-0.5 text-[11px] text-[#888888]">
                      Invita a clientes inactivos con un beneficio de regreso.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      aplicarPlantilla("puntos");
                      setModalCampanaOpen(true);
                    }}
                    className="border-b border-[#292929] pb-3 hover:text-[var(--primary)] cursor-pointer transition-colors"
                  >
                    <p className="text-xs font-bold">Fidelidad y Puntos</p>
                    <p className="mt-0.5 text-[11px] text-[#888888]">
                      Notifica a cada cliente cuántos puntos tiene para canjear.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      aplicarPlantilla("descuento");
                      setModalCampanaOpen(true);
                    }}
                    className="hover:text-[var(--primary)] cursor-pointer transition-colors"
                  >
                    <p className="text-xs font-bold">Venta Especial Semanal</p>
                    <p className="mt-0.5 text-[11px] text-[#888888]">
                      Difunde promociones de fin de semana en segundos.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  aplicarPlantilla("descuento");
                  setModalCampanaOpen(true);
                }}
                className="mt-6 h-11 w-full font-bold text-xs uppercase tracking-wider text-white transition-all hover:bg-white hover:text-black cursor-pointer shadow-xs"
                style={{ backgroundColor: "var(--primary)" }}
              >
                Lanzar campaña rápida
              </button>
            </section>
          </div>

          {/* =========================================================
              SECCIÓN: HISTORIAL DE CAMPAÑAS RECIENTES (TABLA REAL)
          ========================================================= */}
          <section className="border border-[#E2E2E2] bg-white shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] px-7 py-5">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-[0.16em]"
                  style={{ color: "var(--primary)" }}
                >
                  Historial
                </p>
                <h2 className="mt-1 text-xl font-bold text-black">
                  Campañas recientes ({campanas.length})
                </h2>
              </div>

              <button
                type="button"
                onClick={() => abrirCreadorConModo("personalizado")}
                className="text-xs font-bold uppercase tracking-wider transition-colors hover:underline cursor-pointer"
                style={{ color: "var(--primary)" }}
              >
                + Crear Campaña
              </button>
            </div>

            {/* Cabecera de la Tabla */}
            <div className="hidden lg:grid grid-cols-[2fr_1.2fr_2fr_0.8fr_0.8fr_1fr] bg-[#FAFAFA] px-6 py-3 border-b border-[#EEEEEE] text-[11px] font-bold uppercase tracking-wider text-[#777777]">
              <span>Campaña</span>
              <span>Canal / Audiencia</span>
              <span>Mensaje</span>
              <span className="text-center">Enviados</span>
              <span className="text-center">Fecha</span>
              <span className="text-right">Estado / Acciones</span>
            </div>

            {/* Contenido de la Tabla */}
            {campanas.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Megaphone size={36} className="mx-auto text-gray-300" />
                <p className="text-sm font-bold text-black">No hay campañas registradas todavía</p>
                <p className="text-xs text-[#777777] max-w-sm mx-auto">
                  Crea tu primera campaña para promocionar artículos o enviar descuentos por WhatsApp a tus clientes.
                </p>
                <button
                  type="button"
                  onClick={() => abrirCreadorConModo("personalizado")}
                  className="h-10 px-5 text-xs font-bold text-white uppercase tracking-wider cursor-pointer"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  Crear primera campaña
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#EEEEEE]">
                {campanas.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col lg:grid lg:grid-cols-[2fr_1.2fr_2fr_0.8fr_0.8fr_1fr] items-start lg:items-center px-6 py-4 hover:bg-[#FAFAFA] transition-colors gap-2 lg:gap-0"
                  >
                    {/* Campaña */}
                    <div>
                      <p className="text-xs font-bold text-black">{c.nombre}</p>
                      <p className="text-[10px] text-[#888888] font-mono">
                        ID: {c.id.slice(0, 8)}...
                      </p>
                    </div>

                    {/* Canal / Audiencia */}
                    <div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <MessageCircle size={11} />
                        <span>{c.canal || "WhatsApp"}</span>
                      </span>
                      <p className="text-[10px] text-[#777777] mt-0.5">
                        {c.totalDestinatarios || c.enviados || 0} destinatarios
                      </p>
                    </div>

                    {/* Contenido */}
                    <p className="text-xs text-[#555555] line-clamp-2 pr-4 font-sans">
                      {c.mensaje}
                    </p>

                    {/* Enviados */}
                    <div className="text-left lg:text-center">
                      <span className="text-xs font-bold font-mono text-black">
                        {c.enviados || c.totalDestinatarios || 0}
                      </span>
                      <span className="text-[10px] text-[#888888] block">mensajes</span>
                    </div>

                    {/* Fecha */}
                    <div className="text-left lg:text-center text-xs text-[#666666] font-mono">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString("es-MX") : "Hoy"}
                    </div>

                    {/* Estado y Acciones */}
                    <div className="flex items-center justify-end gap-2 w-full lg:w-auto">
                      <span className="inline-block px-2.5 py-1 text-[10px] font-extrabold uppercase rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                        {c.estado || "ENVIADA"}
                      </span>

                      <button
                        type="button"
                        onClick={() => setModalDetalleCampana(c)}
                        className="h-8 px-2.5 bg-black hover:bg-gray-800 text-white text-[10px] font-bold uppercase tracking-wider rounded cursor-pointer transition-colors"
                      >
                        Ver Detalle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* =========================================================
          MODAL 1: CREADOR COMPLETO DE CAMPAÑA WHATSAPP
      ========================================================= */}
      {modalCampanaOpen && (
        <div
          onClick={() => setModalCampanaOpen(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative my-auto flex w-full max-w-5xl flex-col border border-[#DDDDDD] bg-white shadow-2xl cursor-default overflow-hidden animate-in zoom-in-95 duration-150"
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-[#EEEEEE] px-6 py-4 bg-[#FAFAFA]">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center text-white rounded-md shadow-xs"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  <Megaphone size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-black">
                    Crear y Enviar Campaña de WhatsApp
                  </h3>
                  <p className="text-xs text-[#777777]">
                    Llega de forma directa y personalizada a tus clientes registrados
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalCampanaOpen(false)}
                className="flex h-8 w-8 items-center justify-center text-[#777777] hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cuerpo del Modal (2 Columnas: Configuración + Preview) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[75vh] overflow-y-auto">
              {/* Lado Izquierdo: Formulario de la Campaña */}
              <div className="lg:col-span-7 p-6 space-y-5 border-b lg:border-b-0 lg:border-r border-[#EEEEEE]">
                {/* Selector de Plantilla */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555] mb-2">
                    Plantilla Rápida
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PLANTILLAS_PREDEFINIDAS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => aplicarPlantilla(p.id)}
                        className={`text-left p-2.5 border text-xs transition-all cursor-pointer rounded ${
                          tipoCampana === p.id
                            ? "border-black bg-gray-50 text-black font-bold shadow-2xs"
                            : "border-[#DDDDDD] bg-white hover:border-gray-400 text-gray-700"
                        }`}
                      >
                        <p className="font-bold truncate">{p.nombre}</p>
                        <p className="text-[10px] text-[#888888] line-clamp-1 mt-0.5">
                          {p.descripcion}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Si es Promoción de Artículo: Selector de Producto */}
                {tipoCampana === "articulo" && (
                  <div className="p-3.5 border border-amber-200 bg-amber-50/40 rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                        <Package size={13} />
                        <span>Seleccionar Artículo del POS ({articulos.length})</span>
                      </label>
                      {articuloSeleccionado && (
                        <span className="text-[11px] font-bold text-emerald-800">
                          ${Number(articuloSeleccionado.precioVenta).toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar producto por nombre o código..."
                        value={busquedaArticulo}
                        onChange={(e) => setBusquedaArticulo(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-amber-300 outline-none focus:border-black rounded"
                      />
                    </div>

                    <div className="max-h-32 overflow-y-auto divide-y divide-amber-100 bg-white border border-amber-200 rounded text-xs">
                      {articulos
                        .filter(
                          (a) =>
                            a.nombre.toLowerCase().includes(busquedaArticulo.toLowerCase()) ||
                            a.codigo.toLowerCase().includes(busquedaArticulo.toLowerCase())
                        )
                        .slice(0, 15)
                        .map((art) => {
                          const isSelected = articuloSeleccionado?.id === art.id;
                          return (
                            <button
                              key={art.id}
                              type="button"
                              onClick={() => {
                                setArticuloSeleccionado(art);
                                aplicarPlantilla("articulo", art);
                              }}
                              className={`w-full flex items-center justify-between p-2 text-left transition-colors cursor-pointer ${
                                isSelected ? "bg-amber-100/70 font-bold" : "hover:bg-gray-50"
                              }`}
                            >
                              <div className="truncate pr-2">
                                <p className="text-black font-semibold truncate">{art.nombre}</p>
                                <p className="text-[10px] text-gray-400 font-mono">
                                  Cod: {art.codigo} · {art.unidad}
                                </p>
                              </div>
                              <span className="font-mono font-bold text-black shrink-0">
                                ${Number(art.precioVenta).toFixed(2)}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Si es Descuento: Campo de % */}
                {tipoCampana === "descuento" && (
                  <div className="flex items-center gap-3 p-3 border border-[#EEEEEE] bg-[#FAFAFA] rounded">
                    <label className="text-xs font-bold text-black shrink-0">
                      Porcentaje de Descuento:
                    </label>
                    <input
                      type="text"
                      value={descuentoPorcentaje}
                      onChange={(e) => {
                        setDescuentoPorcentaje(e.target.value);
                        setMensajeCampana((prev) =>
                          prev.replace(/\b\d+%\b/g, e.target.value)
                        );
                      }}
                      placeholder="15%"
                      className="w-24 px-3 py-1 text-xs font-bold text-center border border-gray-300 bg-white outline-none rounded"
                    />
                    <span className="text-[11px] text-[#777777]">
                      Se actualiza automáticamente en el mensaje
                    </span>
                  </div>
                )}

                {/* Nombre de la Campaña */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555] mb-1">
                    Título de la Campaña *
                  </label>
                  <input
                    type="text"
                    required
                    value={nombreCampana}
                    onChange={(e) => setNombreCampana(e.target.value)}
                    placeholder="Ej. Promoción Especial de Aceite..."
                    className="w-full border border-[#DDDDDD] bg-white px-3.5 py-2 text-xs font-semibold text-black outline-none focus:border-black rounded"
                  />
                </div>

                {/* Mensaje con Chips Dinámicos */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555]">
                      Mensaje de WhatsApp *
                    </label>
                    <span className="text-[10px] text-[#888888]">Variables dinámicas:</span>
                  </div>

                  {/* Chips para Insertar Variables */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {[
                      { tag: "{cliente}", desc: "Nombre cliente" },
                      { tag: "{organizacion}", desc: "Tu negocio" },
                      { tag: "{telefono_org}", desc: "WhatsApp negocio" },
                      { tag: "{articulo}", desc: "Artículo" },
                      { tag: "{precio}", desc: "Precio" },
                      { tag: "{puntos}", desc: "Puntos" },
                      { tag: "{descuento}", desc: "% Descuento" },
                    ].map((item) => (
                      <button
                        key={item.tag}
                        type="button"
                        onClick={() => setMensajeCampana((prev) => `${prev} ${item.tag}`)}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded transition-colors cursor-pointer"
                      >
                        + {item.tag}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={5}
                    required
                    value={mensajeCampana}
                    onChange={(e) => setMensajeCampana(e.target.value)}
                    placeholder="Escribe el mensaje de la campaña..."
                    className="w-full border border-[#DDDDDD] bg-white p-3 text-xs text-black outline-none focus:border-black font-sans leading-relaxed rounded"
                  />
                </div>

                {/* Selección de Audiencia / Destinatarios */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555]">
                      Destinatarios ({clientesSeleccionadosIds.length} seleccionados)
                    </label>

                    {/* Filtros Rápidos de Segmento */}
                    <div className="flex items-center gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setSegmentoSeleccionado("whatsapp")}
                        className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                          segmentoSeleccionado === "whatsapp"
                            ? "bg-emerald-700 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Con WhatsApp ({clientesConWhatsapp.length})
                      </button>

                      <button
                        type="button"
                        onClick={() => setSegmentoSeleccionado("frecuentes")}
                        className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                          segmentoSeleccionado === "frecuentes"
                            ? "bg-emerald-700 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Frecuentes ({clientesFrecuentes.length})
                      </button>

                      <button
                        type="button"
                        onClick={() => setSegmentoSeleccionado("nuevos")}
                        className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                          segmentoSeleccionado === "nuevos"
                            ? "bg-emerald-700 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Nuevos ({clientesNuevos.length})
                      </button>
                    </div>
                  </div>

                  {/* Buscador de Clientes */}
                  <div className="relative mb-2">
                    <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Filtrar por nombre o teléfono..."
                      value={busquedaCliente}
                      onChange={(e) => setBusquedaCliente(e.target.value)}
                      className="w-full pl-7 pr-3 py-1.5 text-xs bg-white border border-[#DDDDDD] outline-none focus:border-black rounded"
                    />
                  </div>

                  {/* Lista con Checkboxes */}
                  <div className="border border-[#EEEEEE] max-h-40 overflow-y-auto divide-y divide-[#F5F5F5] bg-[#FAFAFA] rounded">
                    {clientesConWhatsapp.length === 0 ? (
                      <div className="p-4 text-center text-xs text-[#888888]">
                        No hay clientes con teléfono de WhatsApp registrado en el sistema.
                      </div>
                    ) : (
                      clientesConWhatsapp
                        .filter(
                          (c) =>
                            c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
                            (c.telefono && c.telefono.includes(busquedaCliente))
                        )
                        .map((cli) => {
                          const isChecked = clientesSeleccionadosIds.includes(cli.id);
                          return (
                            <label
                              key={cli.id}
                              className={`flex items-center justify-between p-2 text-xs cursor-pointer transition-colors ${
                                isChecked ? "bg-white" : "hover:bg-gray-100 opacity-60"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setClientesSeleccionadosIds((prev) => [...prev, cli.id]);
                                    } else {
                                      setClientesSeleccionadosIds((prev) =>
                                        prev.filter((id) => id !== cli.id)
                                      );
                                    }
                                  }}
                                  className="h-3.5 w-3.5 rounded accent-emerald-600 cursor-pointer"
                                />
                                <div>
                                  <p className="font-bold text-black">{cli.nombre}</p>
                                  <p className="text-[10px] font-mono text-[#777777]">
                                    {cli.telefono} · {cli.puntos || 0} pts
                                  </p>
                                </div>
                              </div>
                              <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                                Listo
                              </span>
                            </label>
                          );
                        })
                    )}
                  </div>
                </div>
              </div>

              {/* Lado Derecho: Mockup Chat WhatsApp en Vivo */}
              <div className="lg:col-span-5 p-6 bg-[#F3F4F6] flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      Vista Previa en WhatsApp
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      En vivo
                    </span>
                  </div>

                  {/* Teléfono / Chat WhatsApp */}
                  <div className="border border-gray-300 bg-[#EFEAE2] rounded-xl overflow-hidden shadow-md">
                    {/* Header Verde WhatsApp */}
                    <div className="bg-[#075E54] text-white p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                          {orgData?.nombre ? orgData.nombre.charAt(0).toUpperCase() : "I"}
                        </div>
                        <div>
                          <p className="font-bold text-xs leading-tight">
                            {orgData?.nombre || "Inagerlis Inc"}
                          </p>
                          <p className="text-[9px] text-emerald-200">
                            en línea · Cuenta Comercial Verificada
                          </p>
                        </div>
                      </div>
                      <Smartphone size={16} className="text-white/80" />
                    </div>

                    {/* Cuerpo del Chat */}
                    <div className="p-4 min-h-[260px] flex flex-col justify-end space-y-3">
                      <div className="self-center bg-[#FFEECD] text-[#554228] px-2.5 py-0.5 rounded text-[9px] text-center font-medium shadow-2xs">
                        🔒 Mensaje cifrado de extremo a extremo
                      </div>

                      {/* Burbuja Verde Saliente */}
                      <div className="self-end max-w-[95%] bg-[#DCF8C6] text-black p-3 rounded-lg rounded-tr-none shadow-sm text-xs leading-relaxed font-sans space-y-1.5">
                        <p className="whitespace-pre-line">{previewMensajeGenerado}</p>
                        <div className="flex items-center justify-end gap-1 text-[9px] text-gray-500 font-mono">
                          <span>
                            {new Date().toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="text-blue-500 font-bold">✓✓</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Banner Informativo */}
                <div className="p-3 bg-white border border-gray-200 rounded text-xs space-y-1">
                  <p className="font-bold text-black flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    <span>WhatsApp Oficial: {orgData?.whatsapp || "Pendiente"}</span>
                  </p>
                  <p className="text-[11px] text-gray-500 leading-snug">
                    El sistema sustituye las variables automáticamente para cada cliente antes del envío.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer con Acciones */}
            <div className="border-t border-[#EEEEEE] bg-[#FAFAFA] px-6 py-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setModalCampanaOpen(false)}
                className="h-10 px-4 text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-black cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleEnviarCampana}
                disabled={enviandoCampana || clientesSeleccionadosIds.length === 0}
                className="h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-all rounded shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {enviandoCampana ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
                <span>
                  Enviar Campaña a {clientesSeleccionadosIds.length} Clientes
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: ADMINISTRAR CONEXIÓN DE WHATSAPP OFICIAL
      ========================================================= */}
      {modalWhatsappOpen && (
        <div
          onClick={() => setModalWhatsappOpen(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative my-auto flex w-full max-w-md flex-col border border-[#DDDDDD] bg-white shadow-2xl cursor-default overflow-hidden animate-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#EEEEEE] px-6 py-4 bg-[#FAFAFA]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center bg-emerald-600 text-white rounded">
                  <Smartphone size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-black">
                    Conexión Oficial de WhatsApp
                  </h3>
                  <p className="text-xs text-[#777777]">
                    Número emisor para campañas y tickets
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalWhatsappOpen(false)}
                className="text-gray-400 hover:text-black cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenido */}
            <form onSubmit={handleGuardarWhatsappOrg} className="p-6 space-y-4">
              {alertaExitoWhatsapp && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>¡Número de WhatsApp guardado correctamente!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-black mb-1">
                  Número de WhatsApp de la Organización *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. +52 249 153 7727"
                  value={nuevoWhatsappOrg}
                  onChange={(e) => setNuevoWhatsappOrg(e.target.value)}
                  className="w-full h-11 border border-gray-300 bg-white px-3.5 text-sm font-mono font-bold text-black outline-none focus:border-black rounded"
                />
                <p className="text-[11px] text-[#777777] mt-1.5">
                  Incluye la lada o código de país si es aplicable (ej. +52 para México).
                </p>
              </div>

              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded text-xs space-y-1 text-gray-600">
                <p className="font-bold text-black">¿Cómo funciona?</p>
                <p>
                  Tus clientes verán este número como contacto oficial en sus mensajes personalizados y tickets de venta.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalWhatsappOpen(false)}
                  className="h-10 px-4 text-xs font-bold uppercase text-gray-600 hover:text-black cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoWhatsapp}
                  className="h-10 px-5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider rounded cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {guardandoWhatsapp ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>Guardar Número</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: RESULTADO DE ENVÍO Y ENLACES DIRECTOS WHATSAPP
      ========================================================= */}
      {modalResultado && (
        <div
          onClick={() => setModalResultado(null)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative my-auto flex w-full max-w-2xl flex-col border border-[#DDDDDD] bg-white shadow-2xl cursor-default overflow-hidden animate-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#EEEEEE] px-6 py-4 bg-emerald-50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-emerald-600 text-white rounded-full">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-emerald-950">
                    Campaña Lista para Envío
                  </h3>
                  <p className="text-xs text-emerald-800">
                    Se prepararon {modalResultado.destinatarios.length} mensajes personalizados
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalResultado(null)}
                className="text-gray-400 hover:text-black cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenido con Botones WhatsApp */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <p className="text-xs text-gray-600">
                Haz clic en <strong>"Abrir Chat"</strong> para abrir el WhatsApp de cada cliente con el mensaje y enlace listos para enviar de inmediato:
              </p>

              <div className="divide-y divide-gray-100 border border-gray-200 rounded overflow-hidden">
                {modalResultado.destinatarios.map((dest) => (
                  <div
                    key={dest.clienteId}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-black">{dest.nombre}</p>
                      <p className="text-[10px] font-mono text-emerald-700">
                        WhatsApp: +{dest.telefonoFormato}
                      </p>
                      <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5 font-sans">
                        {dest.mensajePersonalizado}
                      </p>
                    </div>

                    <a
                      href={dest.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded text-xs font-bold shadow-2xs transition-colors shrink-0 cursor-pointer"
                    >
                      <MessageCircle size={14} />
                      <span>Abrir Chat</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[#EEEEEE] bg-[#FAFAFA] px-6 py-3.5 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setModalResultado(null)}
                className="h-10 px-5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Aceptar y Finalizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 4: DETALLE DE CAMPAÑA HISTÓRICA
      ========================================================= */}
      {modalDetalleCampana && (
        <div
          onClick={() => setModalDetalleCampana(null)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative my-auto flex w-full max-w-lg flex-col border border-[#DDDDDD] bg-white shadow-2xl cursor-default overflow-hidden animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-[#EEEEEE] px-6 py-4 bg-[#FAFAFA]">
              <div>
                <h3 className="text-base font-bold text-black">{modalDetalleCampana.nombre}</h3>
                <p className="text-xs text-[#777777]">
                  {modalDetalleCampana.createdAt
                    ? new Date(modalDetalleCampana.createdAt).toLocaleString("es-MX")
                    : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalDetalleCampana(null)}
                className="text-gray-400 hover:text-black cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 border border-gray-200 rounded">
                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Canal</span>
                  <p className="font-bold text-emerald-800">
                    {modalDetalleCampana.canal || "WhatsApp"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Estado</span>
                  <p className="font-bold text-black">{modalDetalleCampana.estado}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Enviados</span>
                  <p className="font-bold text-black">
                    {modalDetalleCampana.enviados || modalDetalleCampana.totalDestinatarios || 0}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Destinatarios</span>
                  <p className="font-bold text-black">
                    {modalDetalleCampana.totalDestinatarios || 0}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                  Mensaje Emitido:
                </span>
                <div className="p-3.5 bg-[#DCF8C6]/50 border border-emerald-200 rounded text-xs whitespace-pre-line leading-relaxed text-black">
                  {modalDetalleCampana.mensaje}
                </div>
              </div>
            </div>

            <div className="border-t border-[#EEEEEE] bg-[#FAFAFA] px-6 py-3.5 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setModalDetalleCampana(null)}
                className="h-10 px-5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}