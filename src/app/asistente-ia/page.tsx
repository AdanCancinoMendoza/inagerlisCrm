"use client";

import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Send,
  Loader2,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  FileText,
  Key,
  ShieldCheck,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  Bot,
  User,
  Zap,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSidebar } from "@/context/SidebarContext";
import {
  enviarMensajeIa,
  solicitarDiagnosticoIa,
  obtenerEstadoIa,
  ChatMessage,
  EstadoIa,
} from "@/services/ai";

interface MensajeVisual {
  id: string;
  rol: "user" | "model";
  contenido: string;
  fecha: string;
}

export default function AsistenteIaPage() {
  const { collapsed } = useSidebar();
  const [mensajes, setMensajes] = useState<MensajeVisual[]>([
    {
      id: "bienvenida",
      rol: "model",
      contenido:
        "**Bienvenido a Inagerlis AI Asistente.**\n\nEstoy conectado en tiempo real a las ventas, catálogo y cortes de caja de tu organización mediante la **API de Google Gemini**.\n\nPuedes preguntarme sobre el rendimiento de hoy, solicitar auditorías de inventario o pedir proyecciones para tu negocio.",
      fecha: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const [estadoIa, setEstadoIa] = useState<EstadoIa | null>(null);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cargarEstado();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensajes, cargando]);

  const cargarEstado = async () => {
    try {
      const estado = await obtenerEstadoIa();
      setEstadoIa(estado);
    } catch {
      // Estado por defecto
    }
  };

  const handleEnviar = async (mensajeTexto?: string) => {
    const texto = (mensajeTexto || input).trim();
    if (!texto || cargando) return;

    const nuevoMensaje: MensajeVisual = {
      id: Date.now().toString(),
      rol: "user",
      contenido: texto,
      fecha: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMensajes((prev) => [...prev, nuevoMensaje]);
    if (!mensajeTexto) setInput("");
    setCargando(true);

    try {
      // Formatear historial previo para la API
      const historial: ChatMessage[] = mensajes.slice(-6).map((m) => ({
        rol: m.rol,
        contenido: m.contenido,
      }));

      const res = await enviarMensajeIa(texto, historial);

      const respuestaBot: MensajeVisual = {
        id: (Date.now() + 1).toString(),
        rol: "model",
        contenido: res.respuesta,
        fecha: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMensajes((prev) => [...prev, respuestaBot]);
      cargarEstado();
    } catch (err: any) {
      const errorBot: MensajeVisual = {
        id: (Date.now() + 1).toString(),
        rol: "model",
        contenido: `⚠️ **Aviso del Asistente:** ${
          err.message || "No fue posible procesar la consulta con Gemini. Verifica que la API Key esté activa en el Panel Administrativo."
        }`,
        fecha: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMensajes((prev) => [...prev, errorBot]);
    } finally {
      setCargando(false);
    }
  };

  const handleDiagnosticoRapido = async (
    tipo: "rendimiento" | "inventario" | "demanda" | "general"
  ) => {
    if (cargando) return;

    const titulos = {
      rendimiento: "Generar Auditoría de Rendimiento y Ventas de Hoy",
      inventario: "Analizar Riesgos de Inventario y Productos con Bajo Stock",
      demanda: "Pronóstico Predictivo de Demanda Comercial",
      general: "Diagnóstico Ejecutivo Integral de la Empresa",
    };

    const nuevoMensaje: MensajeVisual = {
      id: Date.now().toString(),
      rol: "user",
      contenido: `🔍 Solicitud de Diagnóstico: **${titulos[tipo]}**`,
      fecha: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMensajes((prev) => [...prev, nuevoMensaje]);
    setCargando(true);

    try {
      const res = await solicitarDiagnosticoIa(tipo);

      const respuestaBot: MensajeVisual = {
        id: (Date.now() + 1).toString(),
        rol: "model",
        contenido: res.respuesta,
        fecha: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMensajes((prev) => [...prev, respuestaBot]);
      cargarEstado();
    } catch (err: any) {
      const errorBot: MensajeVisual = {
        id: (Date.now() + 1).toString(),
        rol: "model",
        contenido: `⚠️ **Aviso de Diagnóstico:** ${
          err.message || "No se pudo generar el diagnóstico con Gemini."
        }`,
        fecha: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMensajes((prev) => [...prev, errorBot]);
    } finally {
      setCargando(false);
    }
  };

  const copiarTexto = (id: string, texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(null), 2000);
  };

  const limpiarConversacion = () => {
    setMensajes([
      {
        id: "inicio-limpio",
        rol: "model",
        contenido:
          "Conversación reiniciada. ¿En qué aspecto operativo o analítico de tu negocio te puedo asistir hoy?",
        fecha: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="flex h-screen bg-[#F7F7F7] text-[#050505]">
      <Sidebar />

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <Header />

        <main className="flex-1 flex flex-col overflow-hidden p-4 md:p-6">
          {/* Barra Superior de Estado y Título */}
          <div className="bg-white border border-[#E5E7EB] p-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-none">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#050505] text-[#D8A814]">
                <Sparkles size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8A814]">
                    MOTOR DE INTELIGENCIA COMERCIAL
                  </span>
                  <span className="text-[10px] font-mono border border-[#E5E7EB] px-2 py-0.5 bg-[#FAFAFA] text-[#050505]">
                    GOOGLE GEMINI 1.5
                  </span>
                </div>
                <h1 className="text-xl md:text-2xl font-black uppercase tracking-[0.06em] text-[#050505]">
                  ASISTENTE IA &amp; ANÁLISIS DE SISTEMA
                </h1>
              </div>
            </div>

            {/* Badges de Cuota y Estado */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="border border-[#E5E7EB] bg-[#FAFAFA] px-3 py-1.5 text-xs font-mono">
                <span className="text-[#6B7280]">ESTADO IA: </span>
                <strong
                  className={
                    estadoIa?.disponible ? "text-emerald-700" : "text-amber-700"
                  }
                >
                  {estadoIa?.disponible ? "ACTIVA & CONECTADA" : "VERIFICANDO CLAVE"}
                </strong>
              </div>

              <div className="border border-[#E5E7EB] bg-[#FAFAFA] px-3 py-1.5 text-xs font-mono">
                <span className="text-[#6B7280]">CONSULTAS: </span>
                <strong className="text-[#050505]">
                  {estadoIa?.consultasUsadas || 0} / {estadoIa?.limiteConsultas || 500}
                </strong>
              </div>

              <button
                onClick={limpiarConversacion}
                title="Limpiar chat"
                className="border border-[#E5E7EB] hover:bg-[#F3F4F6] text-[#050505] p-2 transition-colors cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Grid Principal: Botones Rápidos (Izquierda) + Chat (Derecha) */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 min-h-0 overflow-hidden">
            {/* Panel Lateral de Auditorías y Diagnósticos Rápidos */}
            <div className="bg-white border border-[#E5E7EB] p-4 flex flex-col justify-between overflow-y-auto">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#050505] pb-2 border-b border-[#E5E7EB] mb-3">
                  Diagnósticos en 1 Clic
                </p>

                <div className="space-y-2.5">
                  <button
                    disabled={cargando}
                    onClick={() => handleDiagnosticoRapido("rendimiento")}
                    className="w-full text-left border border-[#E5E7EB] hover:border-[#D8A814] p-3 transition-colors bg-[#FAFAFA] hover:bg-white cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2 text-[#050505] font-bold text-xs uppercase tracking-[0.1em]">
                      <TrendingUp size={15} className="text-[#D8A814]" />
                      Auditoría de Ventas
                    </div>
                    <p className="text-[11px] text-[#6B7280] mt-1">
                      Analiza ticket promedio, ritmo de facturación y metas de hoy.
                    </p>
                  </button>

                  <button
                    disabled={cargando}
                    onClick={() => handleDiagnosticoRapido("inventario")}
                    className="w-full text-left border border-[#E5E7EB] hover:border-[#D8A814] p-3 transition-colors bg-[#FAFAFA] hover:bg-white cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2 text-[#050505] font-bold text-xs uppercase tracking-[0.1em]">
                      <AlertTriangle size={15} className="text-[#D8A814]" />
                      Riesgo de Quiebre de Stock
                    </div>
                    <p className="text-[11px] text-[#6B7280] mt-1">
                      Identifica artículos agotándose y sugiere reposición antes del fin de semana.
                    </p>
                  </button>

                  <button
                    disabled={cargando}
                    onClick={() => handleDiagnosticoRapido("demanda")}
                    className="w-full text-left border border-[#E5E7EB] hover:border-[#D8A814] p-3 transition-colors bg-[#FAFAFA] hover:bg-white cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2 text-[#050505] font-bold text-xs uppercase tracking-[0.1em]">
                      <BarChart3 size={15} className="text-[#D8A814]" />
                      Pronóstico de Demanda
                    </div>
                    <p className="text-[11px] text-[#6B7280] mt-1">
                      Tendencias predictivas para preparar inventario por categoría.
                    </p>
                  </button>

                  <button
                    disabled={cargando}
                    onClick={() => handleDiagnosticoRapido("general")}
                    className="w-full text-left border border-[#E5E7EB] hover:border-[#D8A814] p-3 transition-colors bg-[#FAFAFA] hover:bg-white cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2 text-[#050505] font-bold text-xs uppercase tracking-[0.1em]">
                      <FileText size={15} className="text-[#D8A814]" />
                      Resumen Ejecutivo Integral
                    </div>
                    <p className="text-[11px] text-[#6B7280] mt-1">
                      Diagnóstico general completo de la empresa y 3 acciones clave.
                    </p>
                  </button>
                </div>

                {/* Preguntas de Ejemplo */}
                <div className="mt-6 pt-4 border-t border-[#E5E7EB]">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6B7280] mb-2">
                    Preguntas Frecuentes
                  </p>
                  <div className="space-y-1.5 text-xs text-[#050505]">
                    <button
                      onClick={() =>
                        handleEnviar("¿Cuáles son los 3 artículos que más dinero han generado hoy?")
                      }
                      className="text-left w-full hover:text-[#D8A814] transition-colors py-1 cursor-pointer"
                    >
                      → ¿Cuáles son los productos más vendidos?
                    </button>
                    <button
                      onClick={() =>
                        handleEnviar("¿Cómo estuvo el último corte de caja y hubo diferencias?")
                      }
                      className="text-left w-full hover:text-[#D8A814] transition-colors py-1 cursor-pointer"
                    >
                      → ¿Cómo estuvo el último corte de caja?
                    </button>
                    <button
                      onClick={() =>
                        handleEnviar(
                          "Dame una recomendación para aumentar las ventas de artículos de lento movimiento."
                        )
                      }
                      className="text-left w-full hover:text-[#D8A814] transition-colors py-1 cursor-pointer"
                    >
                      → ¿Cómo mover artículos lentos?
                    </button>
                  </div>
                </div>
              </div>

              {/* Nota sobre la API Key de Gemini */}
              <div className="pt-4 mt-4 border-t border-[#E5E7EB] text-[11px] text-[#6B7280]">
                <div className="flex items-center gap-1.5 font-bold text-[#050505] uppercase tracking-wider mb-1">
                  <Key size={13} className="text-[#D8A814]" />
                  API KEY ASIGNADA
                </div>
                <span>
                  {estadoIa?.usandoClavePropia
                    ? "Tu organización tiene una API Key dedicada de Gemini asignada."
                    : "Usando motor inteligente predeterminado del sistema."}
                </span>
              </div>
            </div>

            {/* Ventana de Chat Conversacional */}
            <div className="bg-white border border-[#E5E7EB] flex flex-col justify-between overflow-hidden">
              {/* Mensajes Scrollables */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4"
              >
                {mensajes.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-3 max-w-3xl ${
                      m.rol === "user" ? "ml-auto justify-end" : "mr-auto"
                    }`}
                  >
                    {m.rol === "model" && (
                      <div className="w-8 h-8 bg-[#050505] text-[#D8A814] flex items-center justify-center shrink-0 mt-0.5">
                        <Bot size={16} />
                      </div>
                    )}

                    <div
                      className={`border p-4 text-sm leading-relaxed ${
                        m.rol === "user"
                          ? "bg-[#050505] text-white border-[#050505]"
                          : "bg-[#FAFAFA] text-[#050505] border-[#E5E7EB]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1 text-[10px] font-mono text-[#9CA3AF]">
                        <span className="uppercase font-bold tracking-wider">
                          {m.rol === "user" ? "TÚ / ADMINISTRADOR" : "INAGERLIS AI (GEMINI)"}
                        </span>
                        <div className="flex items-center gap-2">
                          <span>{m.fecha}</span>
                          {m.rol === "model" && (
                            <button
                              onClick={() => copiarTexto(m.id, m.contenido)}
                              title="Copiar respuesta"
                              className="hover:text-white transition-colors cursor-pointer"
                            >
                              {copiadoId === m.id ? (
                                <Check size={12} className="text-[#D8A814]" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="whitespace-pre-wrap font-sans">
                        {m.contenido}
                      </div>
                    </div>

                    {m.rol === "user" && (
                      <div className="w-8 h-8 bg-[#D8A814] text-[#050505] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                        <User size={16} />
                      </div>
                    )}
                  </div>
                ))}

                {cargando && (
                  <div className="flex gap-3 mr-auto items-center text-xs font-mono text-[#6B7280] p-4 bg-[#FAFAFA] border border-[#E5E7EB]">
                    <Loader2 size={16} className="animate-spin text-[#D8A814]" />
                    <span>Analizando métricas del sistema y generando respuesta con Gemini...</span>
                  </div>
                )}
              </div>

              {/* Input de Mensaje */}
              <div className="p-3 md:p-4 border-t border-[#E5E7EB] bg-white">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleEnviar();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Haz una consulta a Gemini sobre ventas, artículos, cortes o clientes..."
                    disabled={cargando}
                    className="flex-1 border border-[#E5E7EB] focus:border-[#050505] px-4 py-3 text-sm text-[#050505] outline-none transition-colors disabled:opacity-50"
                  />

                  <button
                    type="submit"
                    disabled={!input.trim() || cargando}
                    className="bg-[#050505] hover:bg-[#1F2937] text-[#D8A814] border border-[#050505] px-6 py-3 font-bold text-xs uppercase tracking-[0.14em] flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {cargando ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <span>CONSULTAR</span>
                        <Send size={15} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
