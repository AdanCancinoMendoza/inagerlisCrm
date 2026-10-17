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

  return apiRequest<RespuestaIa>("/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      organizacionId,
      mensaje,
      historial,
    }),
  });
}

/**
 * Solicita una auditoría preconfigurada de IA con un solo clic
 */
export async function solicitarDiagnosticoIa(
  tipo: "rendimiento" | "inventario" | "demanda" | "general" = "general"
): Promise<RespuestaIa> {
  const organizacionId = getOrganizacionId();
  if (!organizacionId) {
    throw new Error("No hay organización activa seleccionada.");
  }

  return apiRequest<RespuestaIa>("/ai/diagnostico", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      organizacionId,
      tipo,
    }),
  });
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

  return apiRequest<EstadoIa>(`/ai/estado/${organizacionId}`);
}
