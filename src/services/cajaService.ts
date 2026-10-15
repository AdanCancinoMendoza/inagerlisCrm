import { apiRequest } from "./api";

export interface CorteCajaItem {
  id: string;
  organizacionId: string;
  sucursalId?: string | null;
  terminalId?: string | null;
  nombreTerminal?: string | null;
  usuarioId?: string | null;
  nombreUsuario?: string | null;
  tipo: string; // "PARCIAL" | "FINAL" | "X" | "Z"
  fondoInicial: number;
  ventasEfectivo: number;
  ventasTarjeta: number;
  ventasTransferencia: number;
  totalVentas: number;
  entradasEfectivo: number;
  retirosEfectivo: number;
  efectivoEsperado: number;
  efectivoContado: number;
  diferencia: number;
  totalTickets: number;
  notas?: string | null;
  fecha: string;
  hora?: string;
}

export interface TimelineHoraSlot {
  hora: number;
  label: string;
  ventas: number;
  tickets: number;
  acumulado: number;
  tieneCorte: boolean;
  cortes: {
    id: string;
    tipo: string;
    hora: string;
    terminal: string;
    usuario: string;
    totalVentas: number;
    efectivoEsperado: number;
    efectivoContado: number;
    diferencia: number;
  }[];
}

export interface ResumenDiaVentasYCortes {
  fecha: string;
  totalDia: number;
  ticketsDia: number;
  ticketPromedio: number;
  totalCortado: number;
  totalTurnoActivo: number;
  metodosPago: {
    efectivo: number;
    tarjeta: number;
    transferencia: number;
    otros: number;
  };
  timelineHoras: TimelineHoraSlot[];
  cortes: CorteCajaItem[];
}

/**
 * Obtiene cortes locales almacenados en el navegador
 */
export function getOfflineCortes(orgId: string): CorteCajaItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`inagerlis_offline_cortes_${orgId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Guarda un corte en la caché local offline
 */
export function saveOfflineCorte(orgId: string, corte: CorteCajaItem) {
  if (typeof window === "undefined") return;
  try {
    const existing = getOfflineCortes(orgId);
    const filtered = existing.filter((c) => c.id !== corte.id);
    const updated = [corte, ...filtered];
    localStorage.setItem(`inagerlis_offline_cortes_${orgId}`, JSON.stringify(updated));
  } catch (err) {
    console.warn("Error guardando corte en local cache:", err);
  }
}

/**
 * Obtiene la lista de cortes de caja para la organización
 */
export async function getCortesOrganizacion(orgId: string): Promise<CorteCajaItem[]> {
  const localCortes = getOfflineCortes(orgId);

  try {
    const backendCortes = await apiRequest<any[]>(`/caja/cortes/${orgId}`);
    if (Array.isArray(backendCortes)) {
      const parsedBackend: CorteCajaItem[] = backendCortes.map((c) => ({
        id: c.id,
        organizacionId: c.organizacionId,
        sucursalId: c.sucursalId,
        terminalId: c.terminalId,
        nombreTerminal: c.nombreTerminal || "Caja Principal",
        usuarioId: c.usuarioId,
        nombreUsuario: c.nombreUsuario || "Cajero",
        tipo: c.tipo || "PARCIAL",
        fondoInicial: Number(c.fondoInicial || 0),
        ventasEfectivo: Number(c.ventasEfectivo || 0),
        ventasTarjeta: Number(c.ventasTarjeta || 0),
        ventasTransferencia: Number(c.ventasTransferencia || 0),
        totalVentas: Number(c.totalVentas || 0),
        entradasEfectivo: Number(c.entradasEfectivo || 0),
        retirosEfectivo: Number(c.retirosEfectivo || 0),
        efectivoEsperado: Number(c.efectivoEsperado || 0),
        efectivoContado: Number(c.efectivoContado || 0),
        diferencia: Number(c.diferencia || 0),
        totalTickets: Number(c.totalTickets || 0),
        notas: c.notas,
        fecha: c.fecha,
        hora: new Date(c.fecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }));

      // Fusionar evitando duplicados
      const idsBackend = new Set(parsedBackend.map((c) => c.id));
      const unmergedLocales = localCortes.filter((c) => !idsBackend.has(c.id));
      const combined = [...unmergedLocales, ...parsedBackend];

      if (typeof window !== "undefined") {
        localStorage.setItem(`inagerlis_offline_cortes_${orgId}`, JSON.stringify(combined));
      }

      return combined;
    }
  } catch (err) {
    console.warn("Backend no disponible al consultar cortes, usando offline:", err);
  }

  return localCortes;
}

/**
 * Registra un corte de caja (en backend y caché local con soporte offline)
 */
export async function registrarCorteCaja(
  orgId: string,
  corteData: {
    terminalId?: string;
    nombreTerminal?: string;
    usuarioId?: string;
    nombreUsuario?: string;
    tipo?: string;
    fondoInicial?: number;
    ventasEfectivo?: number;
    ventasTarjeta?: number;
    ventasTransferencia?: number;
    totalVentas?: number;
    entradasEfectivo?: number;
    retirosEfectivo?: number;
    efectivoEsperado?: number;
    efectivoContado?: number;
    diferencia?: number;
    totalTickets?: number;
    notas?: string;
  }
): Promise<CorteCajaItem> {
  const now = new Date();
  const provisionalId = `CORTE-${Date.now()}`;

  const nuevoCorte: CorteCajaItem = {
    id: provisionalId,
    organizacionId: orgId,
    terminalId: corteData.terminalId || null,
    nombreTerminal: corteData.nombreTerminal || "Caja Principal",
    usuarioId: corteData.usuarioId || null,
    nombreUsuario: corteData.nombreUsuario || "Cajero",
    tipo: corteData.tipo || "PARCIAL",
    fondoInicial: Number(corteData.fondoInicial || 0),
    ventasEfectivo: Number(corteData.ventasEfectivo || 0),
    ventasTarjeta: Number(corteData.ventasTarjeta || 0),
    ventasTransferencia: Number(corteData.ventasTransferencia || 0),
    totalVentas: Number(corteData.totalVentas || 0),
    entradasEfectivo: Number(corteData.entradasEfectivo || 0),
    retirosEfectivo: Number(corteData.retirosEfectivo || 0),
    efectivoEsperado: Number(corteData.efectivoEsperado || 0),
    efectivoContado: Number(corteData.efectivoContado || 0),
    diferencia: Number(corteData.diferencia || 0),
    totalTickets: Number(corteData.totalTickets || 0),
    notas: corteData.notas || null,
    fecha: now.toISOString(),
    hora: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };

  // Guardar offline primero
  saveOfflineCorte(orgId, nuevoCorte);

  // Intentar persistir en backend
  try {
    const res = await apiRequest<any>(`/caja/corte`, {
      method: "POST",
      body: JSON.stringify({
        ...nuevoCorte,
        organizacionId: orgId,
      }),
    });
    if (res && res.id) {
      nuevoCorte.id = res.id;
      saveOfflineCorte(orgId, nuevoCorte);
    }
  } catch (err) {
    console.warn("Backend no disponible al registrar corte, guardado en cola local:", err);
  }

  return nuevoCorte;
}

/**
 * Calcula o consulta el resumen integral de ventas del día por horas y cortes
 */
export async function getResumenVentasYCortesDia(
  orgId: string,
  ventasDeHoyRaw: any[] = []
): Promise<ResumenDiaVentasYCortes> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // 1. Intentar consultar endpoint dedicado del backend
  try {
    const backendResumen = await apiRequest<any>(`/caja/resumen-dia/${orgId}`);
    if (backendResumen && Array.isArray(backendResumen.timelineHoras)) {
      // Complementar con ventas locales offline si las hay
      let offlineSales: any[] = [];
      if (typeof window !== "undefined") {
        try {
          const offRaw = localStorage.getItem("inagerlis_offline_sales");
          if (offRaw) offlineSales = JSON.parse(offRaw);
        } catch {}
      }

      if (offlineSales.length === 0) {
        return {
          ...backendResumen,
          totalTurnoActivo: Math.max(0, backendResumen.totalDia - backendResumen.totalCortado),
        };
      }
    }
  } catch (err) {
    console.warn("Endpoint /caja/resumen-dia no disponible, calculando cliente-side:", err);
  }

  // 2. Cálculo en cliente (100% Offline-First)
  // Fusionar ventas pasadas como argumento con ventas offline
  let todasVentas: any[] = [...ventasDeHoyRaw];
  if (typeof window !== "undefined") {
    try {
      const offRaw = localStorage.getItem("inagerlis_offline_sales");
      if (offRaw) {
        const offList = JSON.parse(offRaw);
        if (Array.isArray(offList)) {
          todasVentas = [...todasVentas, ...offList];
        }
      }
    } catch {}
  }

  // Filtrar solo las de hoy
  const ventasHoy = todasVentas.filter((v) => {
    if (!v.createdAt) return false;
    const f = new Date(v.createdAt);
    return f >= startOfDay && f <= endOfDay;
  });

  // Obtener cortes de hoy
  const todosCortes = await getCortesOrganizacion(orgId);
  const cortesHoy = todosCortes.filter((c) => {
    const f = new Date(c.fecha);
    return f >= startOfDay && f <= endOfDay;
  });

  // Agrupar ventas por hora
  const ventasPorHoraMap: Record<number, { total: number; tickets: number }> = {};
  for (let h = 0; h < 24; h++) {
    ventasPorHoraMap[h] = { total: 0, tickets: 0 };
  }

  let totalDia = 0;
  let totalEfectivo = 0;
  let totalTarjeta = 0;
  let totalTransferencia = 0;

  ventasHoy.forEach((v) => {
    const h = new Date(v.createdAt).getHours();
    const monto = Number(v.total || 0);
    ventasPorHoraMap[h].total += monto;
    ventasPorHoraMap[h].tickets += 1;
    totalDia += monto;

    const met = (v.metodoPago || "").toLowerCase();
    if (met.includes("efectivo")) totalEfectivo += monto;
    else if (met.includes("tarjeta")) totalTarjeta += monto;
    else if (met.includes("transferencia")) totalTransferencia += monto;
  });

  const currentHour = now.getHours();
  const minHour = 7;
  const maxHour = Math.max(21, currentHour);

  const timelineHoras: TimelineHoraSlot[] = [];
  let acumulado = 0;

  for (let h = minHour; h <= maxHour; h++) {
    const slot = ventasPorHoraMap[h] || { total: 0, tickets: 0 };
    acumulado += slot.total;

    const cortesEnHora = cortesHoy.filter((c) => {
      const cHour = new Date(c.fecha).getHours();
      return cHour === h;
    });

    timelineHoras.push({
      hora: h,
      label: `${h.toString().padStart(2, "0")}:00`,
      ventas: slot.total,
      tickets: slot.tickets,
      acumulado,
      tieneCorte: cortesEnHora.length > 0,
      cortes: cortesEnHora.map((c) => ({
        id: c.id,
        tipo: c.tipo,
        hora: c.hora || new Date(c.fecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        terminal: c.nombreTerminal || "Caja",
        usuario: c.nombreUsuario || "Cajero",
        totalVentas: Number(c.totalVentas),
        efectivoEsperado: Number(c.efectivoEsperado),
        efectivoContado: Number(c.efectivoContado),
        diferencia: Number(c.diferencia),
      })),
    });
  }

  const totalCortado = cortesHoy.reduce((acc, c) => acc + Number(c.totalVentas || 0), 0);

  return {
    fecha: startOfDay.toISOString().split("T")[0],
    totalDia,
    ticketsDia: ventasHoy.length,
    ticketPromedio: ventasHoy.length > 0 ? totalDia / ventasHoy.length : 0,
    totalCortado,
    totalTurnoActivo: Math.max(0, totalDia - totalCortado),
    metodosPago: {
      efectivo: totalEfectivo,
      tarjeta: totalTarjeta,
      transferencia: totalTransferencia,
      otros: totalDia - (totalEfectivo + totalTarjeta + totalTransferencia),
    },
    timelineHoras,
    cortes: cortesHoy,
  };
}
