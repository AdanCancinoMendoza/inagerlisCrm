import { apiRequest } from "./api";
import { getOrganizacionId } from "./auth";

export interface ChatMessage {
  rol: "user" | "model" | "system";
  contenido: string;
}

export interface EstadoIa {
  disponible: boolean;
  usandoClavePropia: boolean;
  limiteConsultas: number;
  consultasUsadas: number;
  estadoOrganizacion: string;
}

export interface RespuestaIa {
  respuesta: string;
  contextoResumido?: {
    articulos: number;
    ventasHoy: {
      conteo: number;
      totalMxn: number;
    };
    alertasStock: number;
  };
}

/**
 * Consulta la organización actual para extraer su configuración y Gemini API Key
 */
export async function obtenerConfigOrganizacion(orgId: string): Promise<{
  geminiApiKey: string | null;
  estadoOrganizacion: string;
  nombre: string;
}> {
  try {
    const org = await apiRequest<any>(`/organizaciones/${orgId}`);
    const tema = (org?.configuracionTema as Record<string, any>) || {};
    return {
      geminiApiKey: tema.geminiApiKey || null,
      estadoOrganizacion: tema.estadoOrganizacion || "Activa",
      nombre: org?.nombre || "Comercio Inagerlis",
    };
  } catch {
    return {
      geminiApiKey: null,
      estadoOrganizacion: "Activa",
      nombre: "Comercio Inagerlis",
    };
  }
}

/**
 * Consulta al Asistente IA de Gemini con contexto de la empresa
 */
export async function enviarMensajeIa(
  mensaje: string,
  historial: ChatMessage[] = []
): Promise<RespuestaIa> {
  const organizacionId = getOrganizacionId();
  if (!organizacionId) {
    throw new Error("No hay organización activa seleccionada.");
  }

  // 1. Intentar a través del backend NestJS
  try {
    const res = await apiRequest<RespuestaIa>("/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organizacionId,
        mensaje,
        historial,
      }),
    });
    if (res && res.respuesta) {
      return res;
    }
  } catch {
    // Si el backend no tiene la ruta /ai/chat aún, recurrir al cliente Gemini directo
  }

  // 2. Ejecución directa con Gemini usando la API Key configurada desde el Admin Panel
  const config = await obtenerConfigOrganizacion(organizacionId);
  if (!config.geminiApiKey) {
    throw new Error(
      "Esta organización aún no tiene una API Key de Gemini configurada. Asígnala desde el Panel Administrativo (http://localhost:3005) para habilitar el asistente."
    );
  }

  // Recopilar contexto básico local
  const systemInstruction = `Eres "Inagerlis AI", consultor de negocios y asistente inteligente de Inagerlis CRM & POS.
Empresa: "${config.nombre}".
Analiza la situación del negocio, responde con precisión ejecutiva y tono profesional corporativo usando formato Markdown.
Responde de manera concisa y accionable a la consulta del usuario.`;

  const contents = [
    ...historial.slice(-4).map((h) => ({
      role: h.rol === "user" ? "user" : "model",
      parts: [{ text: h.contenido }],
    })),
    {
      role: "user",
      parts: [
        {
          text: `[INSTRUCCIÓN DEL ASISTENTE]:\n${systemInstruction}\n\n[CONSULTA DEL USUARIO]:\n${mensaje}`,
        },
      ],
    },
  ];

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1000,
        },
      }),
    }
  );

  if (!geminiRes.ok) {
    const errData = await geminiRes.text();
    throw new Error(`Error en API de Gemini: Clave inválida o límite excedido (${geminiRes.status}).`);
  }

  const geminiData = await geminiRes.json();
  const respuesta =
    geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "No se obtuvo respuesta del modelo de IA.";

  return { respuesta };
}

/**
 * Solicita una auditoría preconfigurada de IA con un solo clic
 */
export async function solicitarDiagnosticoIa(
  tipo: "rendimiento" | "inventario" | "demanda" | "general" = "general"
): Promise<RespuestaIa> {
  const prompts = {
    rendimiento:
      "Realiza una auditoría exhaustiva del rendimiento comercial de hoy, analizando volumen de ventas, ticket promedio y recomendaciones para aumentar el margen de utilidad.",
    inventario:
      "Analiza el inventario, productos de bajo stock y riesgo de desabasto, sugiriendo estrategias de reposición inmediatas.",
    demanda:
      "Genera un pronóstico de demanda de mercado para los próximos días, indicando qué categorías promover y qué artículos estacionales preparar.",
    general:
      "Genera un Resumen Ejecutivo Integral de la empresa: diagnóstico de ventas, salud del inventario, cortes de caja y 3 acciones prioritarias para el administrador.",
  };

  return enviarMensajeIa(prompts[tipo] || prompts.general);
}

/**
 * Obtiene el estado de la integración de Gemini para la organización
 */
export async function obtenerEstadoIa(): Promise<EstadoIa> {
  const organizacionId = getOrganizacionId();
  if (!organizacionId) {
    return {
      disponible: false,
      usandoClavePropia: false,
      limiteConsultas: 500,
      consultasUsadas: 0,
      estadoOrganizacion: "Desconocido",
    };
  }

  // 1. Intentar endpoint dedicado
  try {
    const res = await apiRequest<EstadoIa>(`/ai/estado/${organizacionId}`);
    if (res && res.disponible !== undefined) {
      return res;
    }
  } catch {}

  // 2. Fallback consultando la organización directamente de la base de datos
  const config = await obtenerConfigOrganizacion(organizacionId);
  const tieneClave = Boolean(config.geminiApiKey && config.geminiApiKey.length > 10);

  return {
    disponible: tieneClave,
    usandoClavePropia: tieneClave,
    limiteConsultas: 500,
    consultasUsadas: 0,
    estadoOrganizacion: config.estadoOrganizacion,
  };
}
