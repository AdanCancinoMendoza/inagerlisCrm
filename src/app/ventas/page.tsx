"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  DollarSign,
  Package,
  Search,
  ShoppingCart,
  TrendingUp,
  WalletCards,
  X,
  Send,
  MessageCircle,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Sparkles,
  Smartphone,
  Share2,
  RefreshCw,
  Loader2,
  Check,
  Tag,
  ArrowRight,
  Filter,
  Users,
  Calendar,
  CreditCard,
  Banknote,
  Percent,
  QrCode,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

type VentaDetalle = {
  id: string;
  articuloId: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  articulo?: {
    id: string;
    nombre: string;
    codigo: string;
    unidad: string;
  };
};

type VentaItem = {
  id: string;
  folio: string;
  subtotal: number;
  descuento: number;
  impuesto: number;
  total: number;
  metodoPago: string;
  estado: string;
  createdAt: string;
  clienteId?: string | null;
  cliente?: {
    id: string;
    nombre: string;
    telefono?: string | null;
    email?: string | null;
    puntos?: number;
    descuento?: number;
  } | null;
  usuario?: {
    id: string;
    nombre: string;
  } | null;
  detalles: VentaDetalle[];
};

type CampanaItem = {
  id: string;
  nombre: string;
  canal: string;
  mensaje: string;
  estado: string;
  fechaEnvio?: string | null;
  totalDestinatarios?: number;
  enviados?: number;
  createdAt: string;
};

type DestinatarioResultado = {
  clienteId: string;
  nombre: string;
  telefono: string;
  telefonoFormato: string;
  mensajePersonalizado: string;
  whatsappUrl: string;
  estado: string;
};

/* =========================================================
   PLANTILLAS PREDETERMINADAS DE MENSAJES WHATSAPP
========================================================= */
const PLANTILLAS_CAMPANAS = [
  {
    id: "agradecimiento",
    nombre: "Agradecimiento & Fidelización",
    titulo: "Agradecimiento por compra",
    texto:
      "¡Hola {cliente}! 🌟 Muchas gracias por tu preferencia en {organizacion}. Te confirmamos que tienes {puntos} puntos acumulados. ¡Presenta este mensaje en tu próxima visita para recibir una sorpresa especial!",
  },
  {
    id: "promocion",
    nombre: "Promoción Especial / Descuento",
    titulo: "Promoción de temporada",
    texto:
      "¡Hola {cliente}! 🎉 En {organizacion} tenemos una sorpresa para ti: aprovecha hasta un {descuento} de descuento especial en tus artículos favoritos. Contáctanos a nuestro WhatsApp {telefono_org} o visítanos hoy mismo.",
  },
  {
    id: "flash",
    nombre: "Venta Flash Fin de Semana",
    titulo: "Ventas flash",
    texto:
      "¡Hola {cliente}! ⚡ Este fin de semana tenemos grandes promociones en {organizacion}. Responde a este mensaje o visítanos para apartar tus productos antes de que se agoten. ¡Te esperamos!",
  },
  {
    id: "puntos",
    nombre: "Recordatorio de Puntos de Lealtad",
    titulo: "Puntos disponibles",
    texto:
      "¡Hola {cliente}! 🎁 Tienes {puntos} puntos de recompensa listos para canjear en {organizacion}. ¡Ven hoy y utilízalos para obtener descuentos directos en tu compra!",
  },
];

export default function VentasPage() {
  const { collapsed } = useSidebar();
  const { activePalette } = useTheme();
  const primaryColor = activePalette?.hex || "var(--primary)";
  const { socket } = useSocket();

  // Pestaña activa: analiticas | historial | campanas
  const [activeTab, setActiveTab] = useState<"analiticas" | "historial" | "campanas">("analiticas");

  // Estado de Datos Reales de Ventas
  const [ventas, setVentas] = useState<VentaItem[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [campanas, setCampanas] = useState<CampanaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Resumen / KPIs
  const [kpis, setKpis] = useState({
    totalIngresos: 0,
    totalTickets: 0,
    ticketPromedio: 0,
    clientesAtendidos: 0,
  });

  const [ventasPorDia, setVentasPorDia] = useState<{ fecha: string; total: number; tickets: number }[]>([]);
  const [metodosPago, setMetodosPago] = useState<{ metodo: string; total: number }[]>([]);
  const [topArticulos, setTopArticulos] = useState<{ nombre: string; unidades: number; totalVendido: number }[]>([]);

  // Datos de Organización (WhatsApp)
  const [orgData, setOrgData] = useState<{
    id: string;
    nombre: string;
    telefono?: string;
    whatsapp?: string;
  } | null>(null);

  const [nuevoWhatsappOrg, setNuevoWhatsappOrg] = useState("");
  const [guardandoWhatsapp, setGuardandoWhatsapp] = useState(false);
  const [editandoWhatsapp, setEditandoWhatsapp] = useState(false);

  // Filtros de Historial
  const [filtroFolio, setFiltroFolio] = useState("");
  const [filtroMetodo, setFiltroMetodo] = useState("TODOS");

  // Modal Detalle de Venta
  const [selectedVenta, setSelectedVenta] = useState<VentaItem | null>(null);

  // Estado de Campaña WhatsApp
  const [nombreCampana, setNombreCampana] = useState("Promoción Especial para Clientes");
  const [mensajeCampana, setMensajeCampana] = useState(PLANTILLAS_CAMPANAS[0].texto);
  const [clientesSeleccionadosIds, setClientesSeleccionadosIds] = useState<string[]>([]);
  const [enviandoCampana, setEnviandoCampana] = useState(false);
  const [resultadoEnvio, setResultadoEnvio] = useState<{
    totalClientes: number;
    destinatarios: DestinatarioResultado[];
    campana?: any;
  } | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3500);
  };

  /* =========================================================
     CARGA DE DATOS DESDE LA API
  ========================================================= */
  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setRefreshing(true);

    const usuario = getUsuarioActual();
    const rawOrg = getOrganizacionId();
    const orgId =
      rawOrg && rawOrg !== "default" && rawOrg !== "null" && rawOrg !== "undefined"
        ? rawOrg
        : usuario?.organizacionId || usuario?.organizacion?.id || "default";

    try {
      // 1. Cargar Resumen de Ventas
      const resVentas = await apiRequest<any>(`/ventas/resumen/${orgId}`).catch(() => null);
      if (resVentas) {
        setKpis({
          totalIngresos: resVentas.totalIngresos || 0,
          totalTickets: resVentas.totalTickets || 0,
          ticketPromedio: resVentas.ticketPromedio || 0,
          clientesAtendidos: resVentas.clientesAtendidos || 0,
        });
        if (Array.isArray(resVentas.ventasPorDia)) setVentasPorDia(resVentas.ventasPorDia);
        if (Array.isArray(resVentas.metodosPago)) setMetodosPago(resVentas.metodosPago);
        if (Array.isArray(resVentas.topArticulos)) setTopArticulos(resVentas.topArticulos);
        if (Array.isArray(resVentas.ultimasVentas)) setVentas(resVentas.ultimasVentas);
      }

      // 2. Cargar Clientes
      const clientsData = await getClientes(orgId).catch(() => []);
      if (Array.isArray(clientsData)) {
        setClientes(clientsData);
        // Preseleccionar clientes con teléfono por defecto para la campaña
        const conTelefono = clientsData.filter((c) => Boolean(c.telefono)).map((c) => c.id);
        setClientesSeleccionadosIds(conTelefono);
      }

      // 3. Cargar Campañas
      const campanasData = await apiRequest<CampanaItem[]>(`/ventas/campanas/${orgId}`).catch(() => []);
      if (Array.isArray(campanasData)) {
        setCampanas(campanasData);
      }

      // 4. Cargar Info de la Organización para WhatsApp
      const orgInfo = await apiRequest<any>(`/organizaciones/${orgId}`).catch(() => null);
      if (orgInfo) {
        setOrgData({
          id: orgInfo.id,
          nombre: orgInfo.nombre,
          telefono: orgInfo.telefono,
          whatsapp: orgInfo.whatsapp || orgInfo.telefono,
        });
        setNuevoWhatsappOrg(orgInfo.whatsapp || orgInfo.telefono || "");
      }
    } catch (err) {
      console.error("Error al cargar datos de ventas:", err);
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Suscripción Socket.IO en tiempo real para nuevas ventas
  useEffect(() => {
    if (!socket) return;

    const handleNuevaVenta = () => {
      fetchData(false);
      showToast("🔔 Nueva venta procesada en el Punto de Venta");
    };

    socket.on("venta:creada", handleNuevaVenta);
    return () => {
      socket.off("venta:creada", handleNuevaVenta);
    };
  }, [socket]);

  /* =========================================================
     GUARDAR NÚMERO DE WHATSAPP DE LA ORGANIZACIÓN
  ========================================================= */
  const handleGuardarWhatsappOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgData?.id) return;

    setGuardandoWhatsapp(true);
    try {
      await apiRequest(`/organizaciones/${orgData.id}`, {
        method: "PUT",
        body: JSON.stringify({
          whatsapp: nuevoWhatsappOrg.trim(),
        }),
      });

      setOrgData((prev) => (prev ? { ...prev, whatsapp: nuevoWhatsappOrg.trim() } : null));
      setEditandoWhatsapp(false);
      showToast("Número de WhatsApp del negocio actualizado correctamente");
    } catch (err: any) {
      alert(err.message || "Error al actualizar WhatsApp de la organización");
    } finally {
      setGuardandoWhatsapp(false);
    }
  };

  /* =========================================================
     DISPARO AUTOMÁTICO DE CAMPAÑA WHATSAPP
  ========================================================= */
  const handleDispararCampana = async () => {
    if (clientesSeleccionadosIds.length === 0) {
      alert("Selecciona al menos un cliente con número de teléfono para enviar la campaña.");
      return;
    }

    if (!mensajeCampana.trim()) {
      alert("El mensaje de la campaña no puede estar vacío.");
      return;
    }

    setEnviandoCampana(true);
    const usuario = getUsuarioActual();
    const rawOrg = getOrganizacionId();
    const orgId =
      rawOrg && rawOrg !== "default" && rawOrg !== "null" && rawOrg !== "undefined"
        ? rawOrg
        : usuario?.organizacionId || usuario?.organizacion?.id || "default";

    try {
      const res = await apiRequest<any>("/ventas/campanas/enviar", {
        method: "POST",
        body: JSON.stringify({
          organizacionId: orgId,
          nombreCampana: nombreCampana.trim(),
          mensaje: mensajeCampana.trim(),
          clientesIds: clientesSeleccionadosIds,
        }),
      });

      if (res && res.exito) {
        setResultadoEnvio(res);
        showToast(`Campaña preparada para ${res.totalClientes} clientes`);
        await fetchData(false);
      }
    } catch (err: any) {
      alert(err.message || "Error al procesar el envío de la campaña.");
    } finally {
      setEnviandoCampana(false);
    }
  };

  // Enviar ticket individual por WhatsApp
  const handleEnviarTicketWhatsApp = (venta: VentaItem) => {
    if (!venta.cliente?.telefono) {
      alert("Esta venta no tiene un cliente vinculado con número de teléfono.");
      return;
    }

    const orgNombre = orgData?.nombre || "Nuestro Negocio";
    let rawPhone = venta.cliente.telefono.replace(/\D/g, "");
    if (rawPhone.length === 10) rawPhone = `52${rawPhone}`;

    const itemsTexto = venta.detalles
      .map((d) => `• ${d.cantidad}x ${d.articulo?.nombre || "Artículo"} ($${Number(d.subtotal).toFixed(2)})`)
      .join("\n");

    const mensaje = `Hola *${venta.cliente.nombre}*! 🧾 Gracias por tu compra en *${orgNombre}*.\n\n*Folio:* #${venta.folio}\n*Fecha:* ${new Date(venta.createdAt).toLocaleString("es-MX")}\n*Total:* $${Number(venta.total).toFixed(2)} MXN\n*Método de pago:* ${venta.metodoPago}\n\n*Resumen:* \n${itemsTexto}\n\n${venta.cliente.puntos ? `⭐ *Puntos acumulados:* ${venta.cliente.puntos} pts\n` : ""}¡Esperamos verte pronto de nuevo! 😊`;

    const url = `https://api.whatsapp.com/send?phone=${rawPhone}&text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  /* =========================================================
     FILTRADO DE HISTORIAL DE VENTAS
  ========================================================= */
  const ventasFiltradas = useMemo(() => {
    return ventas.filter((v) => {
      const matchFolio =
        v.folio.toLowerCase().includes(filtroFolio.toLowerCase()) ||
        (v.cliente?.nombre && v.cliente.nombre.toLowerCase().includes(filtroFolio.toLowerCase()));

      const matchMetodo = filtroMetodo === "TODOS" || v.metodoPago === filtroMetodo;

      return matchFolio && matchMetodo;
    });
  }, [ventas, filtroFolio, filtroMetodo]);

  // Vista previa personalizada con el primer cliente seleccionado
  const previewMensaje = useMemo(() => {
    const primerCliente = clientes.find((c) => clientesSeleccionadosIds.includes(c.id)) || clientes[0];
    const clienteNombre = primerCliente?.nombre || "Juan Pérez";
    const clientePuntos = primerCliente?.puntos || 25;
    const clienteDesc = primerCliente?.descuento ? `${primerCliente.descuento}%` : "10%";
    const orgNombre = orgData?.nombre || "Inagerlis Inc";
    const orgTel = orgData?.whatsapp || "249 153 7727";

    return mensajeCampana
      .replace(/{cliente}/g, clienteNombre)
      .replace(/{organizacion}/g, orgNombre)
      .replace(/{telefono_org}/g, orgTel)
      .replace(/{puntos}/g, String(clientePuntos))
      .replace(/{descuento}/g, clienteDesc);
  }, [mensajeCampana, clientes, clientesSeleccionadosIds, orgData]);

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Sidebar />

      <div
        className={`min-h-screen transition-all duration-300 ${
          collapsed ? "ml-0 md:ml-[80px]" : "ml-0 md:ml-[250px]"
        }`}
      >
        <Header />

        {/* Notificación Toast */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-[10000] flex items-center gap-3 bg-black px-5 py-3.5 text-white shadow-2xl animate-in slide-in-from-top-5 duration-200 border-l-4 border-black">
            <CheckCircle2 size={16} className="text-white flex-none" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        )}

        <div className="p-4 sm:p-6 lg:p-10 space-y-6">
          {/* Header de la Vista */}
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-[#E5E5E5] pb-6">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-[0.18em]"
                style={{ color: primaryColor }}
              >
                Ventas & Marketing
              </p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-black flex items-center gap-2">
                <span>Ventas y Campañas WhatsApp</span>
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#777777]">
                Monitorea tus ingresos en vivo y envía campañas automáticas personalizadas por WhatsApp a tus clientes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 h-10 border border-[#DDDDDD] bg-white px-4 text-xs font-bold uppercase tracking-wider text-black hover:border-black transition-colors cursor-pointer shadow-2xs"
              >
                <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
                <span>Actualizar</span>
              </button>
            </div>
          </div>

          {/* PESTAÑAS PRINCIPALES */}
          <div className="flex items-center gap-2 border-b border-[#E5E5E5] overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("analiticas")}
              className={`h-11 px-5 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
                activeTab === "analiticas"
                  ? "border-black text-black bg-white shadow-2xs font-extrabold"
                  : "border-transparent text-[#777777] hover:text-black hover:bg-gray-100"
              }`}
            >
              <BarChart3 size={15} />
              <span>Tablero & Analíticas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("historial")}
              className={`h-11 px-5 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
                activeTab === "historial"
                  ? "border-black text-black bg-white shadow-2xs font-extrabold"
                  : "border-transparent text-[#777777] hover:text-black hover:bg-gray-100"
              }`}
            >
              <Receipt size={15} />
              <span>Historial de Ventas ({ventas.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("campanas")}
              className={`h-11 px-5 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
                activeTab === "campanas"
                  ? "border-emerald-600 text-emerald-800 bg-emerald-50/50 shadow-2xs font-extrabold"
                  : "border-transparent text-[#777777] hover:text-black hover:bg-gray-100"
              }`}
            >
              <MessageCircle size={15} className="text-emerald-600" />
              <span>Campañas WhatsApp Automáticas</span>
              <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-emerald-600 text-white font-bold">
                {clientes.filter((c) => Boolean(c.telefono)).length} clientes
              </span>
            </button>
          </div>

          {/* ========================================================
              PESTAÑA 1: TABLERO & ANALÍTICAS EN VIVO
          ======================================================== */}
          {activeTab === "analiticas" && (
            <div className="space-y-6">
              {/* Tarjetas KPI Superiores */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border border-[#E5E5E5] bg-white p-5 shadow-2xs">
                  <div className="flex items-center justify-between text-[#888888] mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Ingresos Totales</span>
                    <DollarSign size={18} className="text-black" />
                  </div>
                  <p className="text-2xl font-black text-black font-mono">
                    ${kpis.totalIngresos.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                    <TrendingUp size={12} />
                    <span>Ventas reales consolidadas</span>
                  </p>
                </div>

                <div className="border border-[#E5E5E5] bg-white p-5 shadow-2xs">
                  <div className="flex items-center justify-between text-[#888888] mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Tickets Emitidos</span>
                    <ShoppingCart size={18} className="text-black" />
                  </div>
                  <p className="text-2xl font-black text-black font-mono">
                    {kpis.totalTickets.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-[#777777] font-semibold mt-1">
                    Órdenes completadas en POS
                  </p>
                </div>

                <div className="border border-[#E5E5E5] bg-white p-5 shadow-2xs">
                  <div className="flex items-center justify-between text-[#888888] mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Ticket Promedio</span>
                    <WalletCards size={18} className="text-black" />
                  </div>
                  <p className="text-2xl font-black text-black font-mono">
                    ${kpis.ticketPromedio.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-[11px] text-[#777777] font-semibold mt-1">
                    Gasto promedio por cliente
                  </p>
                </div>

                <div className="border border-[#E5E5E5] bg-white p-5 shadow-2xs">
                  <div className="flex items-center justify-between text-[#888888] mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Clientes Atendidos</span>
                    <Users size={18} className="text-black" />
                  </div>
                  <p className="text-2xl font-black text-black font-mono">
                    {kpis.clientesAtendidos.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                    {clientes.length} registrados en catálogo
                  </p>
                </div>
              </div>

              {/* Gráficos de Ventas */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gráfica 1: Ventas por Día */}
                <div className="lg:col-span-2 border border-[#E5E5E5] bg-white p-6 shadow-2xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-black">Ventas de los Últimos 7 Días</h3>
                      <p className="text-xs text-[#777777]">Comportamiento de facturación diaria</p>
                    </div>
                  </div>

                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ventasPorDia}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEEEEE" />
                        <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: "#666666" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#666666" }} allowDecimals={false} />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-black text-white p-3 text-xs shadow-xl border border-gray-800">
                                  <p className="font-bold">{data.fecha}</p>
                                  <p className="mt-1 text-gray-300">
                                    Total: <span className="font-bold text-white">${Number(data.total).toFixed(2)}</span>
                                  </p>
                                  <p className="text-gray-300">
                                    Tickets: <span className="font-bold text-white">{data.tickets}</span>
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="total" fill={primaryColor} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Gráfica 2: Métodos de Pago */}
                <div className="border border-[#E5E5E5] bg-white p-6 shadow-2xs flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-black mb-1">Métodos de Pago</h3>
                    <p className="text-xs text-[#777777] mb-4">Distribución de ingresos por canal de cobro</p>

                    <div className="space-y-3">
                      {metodosPago.length === 0 ? (
                        <div className="py-12 text-center text-xs text-[#888888] bg-[#FAFAFA] border border-dashed border-[#DDDDDD]">
                          Sin registros de cobro aún
                        </div>
                      ) : (
                        metodosPago.map((m) => {
                          const porcentaje =
                            kpis.totalIngresos > 0 ? Math.round((m.total / kpis.totalIngresos) * 100) : 0;
                          return (
                            <div key={m.metodo} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-black flex items-center gap-1.5">
                                  {m.metodo === "Efectivo" ? (
                                    <Banknote size={14} className="text-emerald-600" />
                                  ) : (
                                    <CreditCard size={14} className="text-blue-600" />
                                  )}
                                  {m.metodo}
                                </span>
                                <span className="font-mono text-[11px] font-bold text-black">
                                  ${m.total.toLocaleString("es-MX", { minimumFractionDigits: 2 })} ({porcentaje}%)
                                </span>
                              </div>
                              <div className="w-full bg-[#EEEEEE] h-2 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-black transition-all"
                                  style={{ width: `${Math.max(5, porcentaje)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#EEEEEE] bg-[#FAFAFA] p-3 text-center">
                    <p className="text-[11px] text-[#666666]">
                      Punto de Venta activo con sincronización de inventario en tiempo real.
                    </p>
                  </div>
                </div>
              </div>

              {/* Ranking de Artículos Más Vendidos */}
              <div className="border border-[#E5E5E5] bg-white p-6 shadow-2xs">
                <h3 className="text-base font-bold text-black mb-1">Top Artículos Más Vendidos</h3>
                <p className="text-xs text-[#777777] mb-4">Productos con mayor rotación e impacto en facturación</p>

                {topArticulos.length === 0 ? (
                  <div className="py-10 text-center text-xs text-[#888888] bg-[#FAFAFA] border border-dashed border-[#DDDDDD]">
                    <Package size={28} className="mx-auto text-gray-400 mb-2" />
                    <p className="font-bold text-black">Sin datos suficientes de artículos vendidos</p>
                    <p className="text-[11px] text-[#777777]">Registra ventas desde el Punto de Venta para generar este reporte.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {topArticulos.map((art, idx) => (
                      <div key={art.nombre} className="border border-[#EEEEEE] bg-[#FAFAFA] p-3 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="flex h-6 w-6 items-center justify-center bg-black text-white text-[11px] font-extrabold rounded">
                            #{idx + 1}
                          </span>
                          <span className="text-right font-mono text-xs font-black text-emerald-700">
                            ${art.totalVendido.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-black line-clamp-1" title={art.nombre}>
                            {art.nombre}
                          </p>
                          <p className="text-[11px] font-mono text-[#777777] mt-0.5">
                            {art.unidades.toLocaleString()} unidades vendidas
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              PESTAÑA 2: HISTORIAL DE VENTAS & TICKETS
          ======================================================== */}
          {activeTab === "historial" && (
            <div className="space-y-4">
              {/* Barra de Búsqueda y Filtro */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-4 border border-[#DDDDDD] shadow-2xs">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999]" />
                  <input
                    type="text"
                    placeholder="Buscar por folio de ticket o nombre de cliente..."
                    value={filtroFolio}
                    onChange={(e) => setFiltroFolio(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-[#EEEEEE] pl-10 pr-4 py-2.5 text-xs text-black outline-none focus:border-black focus:bg-white transition-colors"
                  />
                </div>

                <select
                  value={filtroMetodo}
                  onChange={(e) => setFiltroMetodo(e.target.value)}
                  className="h-10 border border-[#EEEEEE] bg-[#FAFAFA] px-3 text-xs font-bold text-black outline-none focus:border-black cursor-pointer"
                >
                  <option value="TODOS">Todos los Métodos de Pago</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Transferencia">Transferencia</option>
                </select>

                <div className="text-xs font-bold text-[#777777] hidden md:block whitespace-nowrap">
                  Mostrando: {ventasFiltradas.length} de {ventas.length}
                </div>
              </div>

              {/* Tabla de Ventas */}
              <div className="border border-[#DDDDDD] bg-white shadow-2xs overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E0E0E0] bg-[#FAFAFA]">
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[#777777]">Folio</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[#777777]">Fecha y Hora</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[#777777]">Cliente Vinculado</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[#777777] text-center">Artículos</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[#777777] text-center">Método</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[#777777] text-right">Total</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[#777777] text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEEEEE]">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center">
                          <Loader2 size={28} className="animate-spin text-black mx-auto mb-2" />
                          <p className="text-xs text-[#777777]">Cargando historial de ventas...</p>
                        </td>
                      </tr>
                    ) : ventasFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center">
                          <Receipt size={36} className="text-[#CCCCCC] mx-auto mb-2" />
                          <p className="text-sm font-bold text-black">No se encontraron ventas</p>
                          <p className="text-xs text-[#777777] mt-1">Realiza tu primera venta en la terminal de Punto de Venta.</p>
                        </td>
                      </tr>
                    ) : (
                      ventasFiltradas.map((v) => {
                        const totalArticulos = v.detalles.reduce((acc, d) => acc + d.cantidad, 0);
                        const fechaFormateada = new Date(v.createdAt).toLocaleString("es-MX", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        });

                        return (
                          <tr key={v.id} className="hover:bg-[#FAFAFA] transition-colors">
                            {/* Folio */}
                            <td className="py-3.5 px-4 font-mono font-black text-black">
                              #{v.folio}
                            </td>

                            {/* Fecha */}
                            <td className="py-3.5 px-4 text-[#666666] font-mono text-[11px]">
                              {fechaFormateada}
                            </td>

                            {/* Cliente */}
                            <td className="py-3.5 px-4">
                              {v.cliente ? (
                                <div className="space-y-0.5">
                                  <p className="font-bold text-black flex items-center gap-1.5">
                                    <User size={12} className="text-gray-500" />
                                    <span>{v.cliente.nombre}</span>
                                  </p>
                                  {v.cliente.telefono && (
                                    <p className="text-[10px] font-mono text-emerald-700 flex items-center gap-1">
                                      <Phone size={10} />
                                      <span>{v.cliente.telefono}</span>
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-500">
                                  Público General
                                </span>
                              )}
                            </td>

                            {/* Cantidad de Artículos */}
                            <td className="py-3.5 px-4 text-center font-mono font-bold text-black">
                              {totalArticulos} unid.
                            </td>

                            {/* Método de Pago */}
                            <td className="py-3.5 px-4 text-center">
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0F0F0] text-black">
                                {v.metodoPago}
                              </span>
                            </td>

                            {/* Total */}
                            <td className="py-3.5 px-4 text-right font-mono text-sm font-extrabold text-black">
                              ${Number(v.total).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>

                            {/* Acciones */}
                            <td className="py-3.5 px-4 text-right space-x-1.5">
                              {/* Botón WhatsApp si tiene teléfono */}
                              {v.cliente?.telefono && (
                                <button
                                  type="button"
                                  onClick={() => handleEnviarTicketWhatsApp(v)}
                                  title="Enviar ticket y agradecimiento por WhatsApp"
                                  className="inline-flex items-center gap-1 h-8 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 text-[11px] font-bold rounded transition-colors cursor-pointer"
                                >
                                  <MessageCircle size={13} />
                                  <span className="hidden sm:inline">WhatsApp</span>
                                </button>
                              )}

                              {/* Ver Detalle del Ticket */}
                              <button
                                type="button"
                                onClick={() => setSelectedVenta(v)}
                                className="inline-flex items-center gap-1 h-8 bg-black hover:bg-[var(--primary)] text-white px-3 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                              >
                                <span>Ver Ticket</span>
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
              PESTAÑA 3: CAMPAÑAS WHATSAPP AUTOMÁTICAS
          ======================================================== */}
          {activeTab === "campanas" && (
            <div className="space-y-6">
              {/* BANNER 1: NÚMERO DE WHATSAPP OFICIAL DE LA ORGANIZACIÓN */}
              <div className="border border-emerald-300 bg-emerald-50/60 p-5 shadow-2xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center bg-emerald-600 text-white rounded-xl shadow-xs">
                      <Smartphone size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-emerald-950">
                          Número de WhatsApp Oficial de la Organización
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-200 text-emerald-900 border border-emerald-300">
                          CONECTADO
                        </span>
                      </div>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        Este número identifica a tu negocio al enviar campañas y tickets automáticos a tus clientes.
                      </p>
                    </div>
                  </div>

                  {!editandoWhatsapp ? (
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-base font-extrabold text-emerald-950 bg-white px-3 py-1.5 border border-emerald-300 rounded shadow-2xs">
                        {orgData?.whatsapp || "No configurado"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditandoWhatsapp(true)}
                        className="h-9 bg-black hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider px-3.5 rounded transition-colors cursor-pointer"
                      >
                        Cambiar Número
                      </button>
                      <a
                        href="/promociones"
                        className="h-9 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider px-3.5 rounded transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <QrCode size={14} />
                        <span>Vincular Celular por QR</span>
                      </a>
                    </div>
                  ) : (
                    <form onSubmit={handleGuardarWhatsappOrg} className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Ej. +52 249 153 7727"
                        value={nuevoWhatsappOrg}
                        onChange={(e) => setNuevoWhatsappOrg(e.target.value)}
                        className="h-10 bg-white border border-emerald-500 px-3 text-xs font-mono font-bold text-black outline-none focus:ring-1 focus:ring-emerald-600 rounded"
                      />
                      <button
                        type="submit"
                        disabled={guardandoWhatsapp}
                        className="h-10 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 rounded cursor-pointer disabled:opacity-50"
                      >
                        {guardandoWhatsapp ? <Loader2 size={14} className="animate-spin" /> : "Guardar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditandoWhatsapp(false)}
                        className="h-10 bg-gray-200 text-black text-xs font-bold px-2.5 rounded cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* CUADRÍCULA: CREADOR DE CAMPAÑA + VISTA PREVIA INTERACTIVA */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LADO IZQUIERDO: FORMULARIO DE CAMPAÑA */}
                <div className="lg:col-span-7 border border-[#E5E5E5] bg-white p-6 shadow-2xs space-y-5">
                  <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-3">
                    <h3 className="text-base font-bold text-black flex items-center gap-2">
                      <Sparkles size={18} className="text-emerald-600" />
                      <span>Crear Nueva Campaña de Ventas</span>
                    </h3>
                    <span className="text-xs text-[#777777]">Envío masivo con variables dinámicas</span>
                  </div>

                  {/* Selector de Plantillas Rápidas */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555] mb-2">
                      Plantillas Rápidas de Campaña
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {PLANTILLAS_CAMPANAS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setNombreCampana(p.titulo);
                            setMensajeCampana(p.texto);
                          }}
                          className={`text-left p-2.5 border text-xs transition-all cursor-pointer rounded ${
                            mensajeCampana === p.texto
                              ? "border-emerald-600 bg-emerald-50/50 text-emerald-950 font-bold"
                              : "border-[#DDDDDD] bg-[#FAFAFA] hover:border-black text-black"
                          }`}
                        >
                          <p className="font-bold truncate">{p.nombre}</p>
                          <p className="text-[10px] text-[#777777] line-clamp-1 mt-0.5">{p.texto}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nombre de la Campaña */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555] mb-1">
                      Nombre de la Campaña *
                    </label>
                    <input
                      type="text"
                      required
                      value={nombreCampana}
                      onChange={(e) => setNombreCampana(e.target.value)}
                      placeholder="Ej. Promoción de Fin de Semana para Clientes Frecuentes..."
                      className="w-full border border-[#DDDDDD] bg-white px-3.5 py-2 text-xs font-semibold text-black outline-none focus:border-black"
                    />
                  </div>

                  {/* Mensaje con Chips de Variables */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555]">
                        Mensaje para WhatsApp *
                      </label>
                      <span className="text-[10px] text-[#888888]">Variables dinámicas disponibles:</span>
                    </div>

                    {/* Chips de Inserción Rápida */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {[
                        { tag: "{cliente}", desc: "Nombre cliente" },
                        { tag: "{organizacion}", desc: "Tu negocio" },
                        { tag: "{telefono_org}", desc: "WhatsApp negocio" },
                        { tag: "{puntos}", desc: "Puntos" },
                        { tag: "{descuento}", desc: "% Descuento" },
                      ].map((item) => (
                        <button
                          key={item.tag}
                          type="button"
                          onClick={() => setMensajeCampana((prev) => `${prev} ${item.tag}`)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded transition-colors cursor-pointer"
                        >
                          + {item.tag} ({item.desc})
                        </button>
                      ))}
                    </div>

                    <textarea
                      rows={5}
                      required
                      value={mensajeCampana}
                      onChange={(e) => setMensajeCampana(e.target.value)}
                      placeholder="Redacta el mensaje de la campaña..."
                      className="w-full border border-[#DDDDDD] bg-white p-3 text-xs text-black outline-none focus:border-black font-sans leading-relaxed"
                    />
                  </div>

                  {/* Selector de Clientes Destinatarios */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555555]">
                        Destinatarios Seleccionados ({clientesSeleccionadosIds.length} de {clientes.filter((c) => Boolean(c.telefono)).length} con WhatsApp)
                      </label>
                      <div className="space-x-2 text-[10px]">
                        <button
                          type="button"
                          onClick={() =>
                            setClientesSeleccionadosIds(
                              clientes.filter((c) => Boolean(c.telefono)).map((c) => c.id)
                            )
                          }
                          className="font-bold text-emerald-700 hover:underline cursor-pointer"
                        >
                          Seleccionar todos
                        </button>
                        <span>·</span>
                        <button
                          type="button"
                          onClick={() => setClientesSeleccionadosIds([])}
                          className="font-bold text-gray-500 hover:underline cursor-pointer"
                        >
                          Deseleccionar
                        </button>
                      </div>
                    </div>

                    <div className="border border-[#EEEEEE] max-h-48 overflow-y-auto divide-y divide-[#F5F5F5] bg-[#FAFAFA]">
                      {clientes.filter((c) => Boolean(c.telefono)).length === 0 ? (
                        <div className="p-4 text-center text-xs text-[#888888]">
                          No tienes clientes registrados con número telefónico. Da de alta clientes en el módulo de Clientes.
                        </div>
                      ) : (
                        clientes
                          .filter((c) => Boolean(c.telefono))
                          .map((cli) => {
                            const isChecked = clientesSeleccionadosIds.includes(cli.id);
                            return (
                              <label
                                key={cli.id}
                                className={`flex items-center justify-between p-2.5 text-xs cursor-pointer transition-colors ${
                                  isChecked ? "bg-white" : "hover:bg-gray-100 opacity-70"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setClientesSeleccionadosIds((prev) => [...prev, cli.id]);
                                      } else {
                                        setClientesSeleccionadosIds((prev) => prev.filter((id) => id !== cli.id));
                                      }
                                    }}
                                    className="h-4 w-4 rounded accent-emerald-600 cursor-pointer"
                                  />
                                  <div>
                                    <p className="font-bold text-black">{cli.nombre}</p>
                                    <p className="text-[10px] font-mono text-[#777777]">
                                      WhatsApp: {cli.telefono} · {cli.puntos || 0} pts
                                    </p>
                                  </div>
                                </div>
                                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  Listo para envío
                                </span>
                              </label>
                            );
                          })
                      )}
                    </div>
                  </div>

                  {/* Botón de Enviar Campaña */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleDispararCampana}
                      disabled={enviandoCampana || clientesSeleccionadosIds.length === 0}
                      className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {enviandoCampana ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                      <span>
                        Enviar Campaña WhatsApp a {clientesSeleccionadosIds.length} Clientes
                      </span>
                    </button>
                  </div>
                </div>

                {/* LADO DERECHO: VISTA PREVIA EN CHAT DE WHATSAPP */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="border border-[#DDDDDD] bg-[#EFEAE2] rounded-xl overflow-hidden shadow-md">
                    {/* Header Verde WhatsApp */}
                    <div className="bg-[#075E54] text-white p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                          {orgData?.nombre ? orgData.nombre.charAt(0).toUpperCase() : "I"}
                        </div>
                        <div>
                          <p className="font-bold text-xs leading-tight">
                            {orgData?.nombre || "Inagerlis Inc"}
                          </p>
                          <p className="text-[10px] text-emerald-200">
                            en línea · Cuenta Comercial Verificada
                          </p>
                        </div>
                      </div>
                      <Smartphone size={18} className="text-white/80" />
                    </div>

                    {/* Cuerpo de Chat con Burbuja */}
                    <div className="p-4 min-h-[300px] flex flex-col justify-end space-y-3">
                      <div className="self-center bg-[#FFEECD] text-[#554228] px-3 py-1 rounded-md text-[10px] text-center font-medium shadow-2xs">
                        🔒 Los mensajes están cifrados de extremo a extremo.
                      </div>

                      {/* Burbuja Verde Saliente */}
                      <div className="self-end max-w-[90%] bg-[#DCF8C6] text-black p-3.5 rounded-lg rounded-tr-none shadow-sm text-xs leading-relaxed font-sans space-y-1.5">
                        <p className="whitespace-pre-line">{previewMensaje}</p>
                        <div className="flex items-center justify-end gap-1 text-[9px] text-gray-500 font-mono">
                          <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          <span className="text-blue-500 font-bold">✓✓</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Panel de Resultado de Envío si se disparó */}
                  {resultadoEnvio && (
                    <div className="border border-emerald-300 bg-white p-4 shadow-sm space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-black flex items-center gap-1.5">
                          <CheckCircle2 size={15} className="text-emerald-600" />
                          <span>Campaña Preparada con Éxito ({resultadoEnvio.destinatarios.length} clientes)</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => setResultadoEnvio(null)}
                          className="text-gray-400 hover:text-black"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <p className="text-[11px] text-[#666666]">
                        Haz clic en cada cliente para abrir WhatsApp directamente con el mensaje personalizado listo para enviar:
                      </p>

                      <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 text-xs">
                        {resultadoEnvio.destinatarios.map((dest) => (
                          <div key={dest.clienteId} className="py-2 flex items-center justify-between gap-2">
                            <div>
                              <p className="font-bold text-black">{dest.nombre}</p>
                              <p className="text-[10px] font-mono text-[#888888]">{dest.telefono}</p>
                            </div>
                            <a
                              href={dest.whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-[11px] font-bold shadow-2xs transition-colors"
                            >
                              <MessageCircle size={12} />
                              <span>Abrir Chat</span>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Historial Resumido de Campañas Anteriores */}
                  <div className="border border-[#E5E5E5] bg-white p-4 shadow-2xs">
                    <h4 className="text-xs font-bold text-black mb-2 flex items-center justify-between">
                      <span>Campañas Registradas ({campanas.length})</span>
                      <span className="text-[10px] text-[#888888]">Bitácora</span>
                    </h4>

                    {campanas.length === 0 ? (
                      <p className="text-xs text-[#888888] italic py-2">Sin campañas previas registradas.</p>
                    ) : (
                      <div className="divide-y divide-[#F0F0F0] text-xs">
                        {campanas.slice(0, 5).map((c) => (
                          <div key={c.id} className="py-2 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-black">{c.nombre}</p>
                              <p className="text-[10px] text-[#777777]">
                                {new Date(c.createdAt).toLocaleDateString("es-MX")} · {c.totalDestinatarios || 0} destinatarios
                              </p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              {c.estado}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DETALLE DE TICKET DE VENTA */}
      {selectedVenta && (
        <div
          onClick={() => setSelectedVenta(null)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative my-auto flex w-full max-w-md flex-col border border-[#DDDDDD] bg-white shadow-2xl cursor-default overflow-hidden animate-in zoom-in-95 duration-150"
          >
            {/* Header del Ticket */}
            <div className="flex items-center justify-between border-b border-[#EEEEEE] px-6 py-4 bg-[#FAFAFA]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center bg-black text-white">
                  <Receipt size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-black font-mono">
                    Ticket #{selectedVenta.folio}
                  </h3>
                  <p className="text-xs text-[#777777]">
                    {new Date(selectedVenta.createdAt).toLocaleString("es-MX")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVenta(null)}
                className="flex h-8 w-8 items-center justify-center text-[#777777] hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cuerpo del Ticket */}
            <div className="p-6 space-y-4 text-xs font-mono">
              <div className="border-b border-dashed border-gray-300 pb-3 space-y-1">
                <p className="font-bold text-black text-center text-sm">
                  {orgData?.nombre || "Inagerlis Inc"}
                </p>
                <p className="text-[11px] text-gray-500 text-center">
                  Cliente: {selectedVenta.cliente?.nombre || "Público General"}
                </p>
                {selectedVenta.cliente?.telefono && (
                  <p className="text-[11px] text-emerald-700 text-center">
                    Tel: {selectedVenta.cliente.telefono}
                  </p>
                )}
                <p className="text-[11px] text-gray-500 text-center">
                  Método de pago: {selectedVenta.metodoPago}
                </p>
              </div>

              {/* Lista de Artículos */}
              <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto">
                {selectedVenta.detalles.map((item) => (
                  <div key={item.id} className="py-2 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-black">{item.articulo?.nombre || "Artículo"}</p>
                      <p className="text-[10px] text-gray-500">
                        {item.cantidad} x ${Number(item.precioUnitario).toFixed(2)}
                      </p>
                    </div>
                    <span className="font-bold text-black">
                      ${Number(item.subtotal).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="border-t border-dashed border-gray-300 pt-3 space-y-1 text-right">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>${Number(selectedVenta.subtotal).toFixed(2)}</span>
                </div>
                {Number(selectedVenta.descuento) > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Descuento aplicado:</span>
                    <span>-${Number(selectedVenta.descuento).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-black pt-1 border-t border-gray-200">
                  <span>TOTAL:</span>
                  <span>${Number(selectedVenta.total).toFixed(2)} MXN</span>
                </div>
              </div>
            </div>

            {/* Footer con Acciones */}
            <div className="border-t border-[#EEEEEE] bg-[#FAFAFA] px-6 py-4 flex items-center justify-between">
              {selectedVenta.cliente?.telefono ? (
                <button
                  type="button"
                  onClick={() => handleEnviarTicketWhatsApp(selectedVenta)}
                  className="inline-flex items-center gap-1.5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 rounded shadow-xs transition-colors cursor-pointer"
                >
                  <MessageCircle size={15} />
                  <span>Compartir por WhatsApp</span>
                </button>
              ) : (
                <span className="text-[11px] text-gray-400">Sin teléfono vinculado</span>
              )}

              <button
                type="button"
                onClick={() => setSelectedVenta(null)}
                className="h-10 bg-black text-white text-xs font-bold uppercase tracking-wider px-4 hover:bg-[var(--primary)] transition-colors cursor-pointer"
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