import { apiRequest } from "./api";

/* =======================================================================
   COLA Y AUTO-SINCRONIZACIÓN DE CALENDARIO Y RECORDATORIOS (OFFLINE-FIRST)
======================================================================= */

export interface OfflineCalendarioItem {
  id: string;
  accion: "CREATE" | "UPDATE" | "DELETE";
  organizacionId: string;
  eventoId?: string;
  payload?: any;
  timestamp: string;
  intentos: number;
  lastError?: string;
}

const CALENDARIO_QUEUE_PREFIX = "inagerlis_offline_calendario_queue";

export function getOfflineCalendarioQueue(orgId: string): OfflineCalendarioItem[] {
  if (typeof window === "undefined" || !orgId) return [];
  try {
    const raw = localStorage.getItem(`${CALENDARIO_QUEUE_PREFIX}_${orgId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Error al leer cola offline de calendario:", err);
    return [];
  }
}

export function saveOfflineCalendarioQueue(orgId: string, queue: OfflineCalendarioItem[]) {
  if (typeof window === "undefined" || !orgId) return;
  try {
    localStorage.setItem(`${CALENDARIO_QUEUE_PREFIX}_${orgId}`, JSON.stringify(queue));
    window.dispatchEvent(new Event("calendario_queue_updated"));
  } catch (err) {
    console.error("Error al guardar cola offline de calendario:", err);
  }
}

export function enqueueOfflineCalendario(
  orgId: string,
  accion: "CREATE" | "UPDATE" | "DELETE",
  payload?: any,
  eventoId?: string
) {
  if (!orgId) return;
  const queue = getOfflineCalendarioQueue(orgId);
  const queueItem: OfflineCalendarioItem = {
    id: `queue_cal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    accion,
    organizacionId: orgId,
    eventoId: eventoId || payload?.id,
    payload,
    timestamp: new Date().toISOString(),
    intentos: 0,
  };
  queue.push(queueItem);
  saveOfflineCalendarioQueue(orgId, queue);
}

let isSyncingCalendario = false;

export async function syncOfflineCalendario(
  orgId: string
): Promise<{ synced: number; remaining: number }> {
  if (isSyncingCalendario || typeof window === "undefined" || !navigator.onLine || !orgId) {
    return { synced: 0, remaining: getOfflineCalendarioQueue(orgId).length };
  }

  isSyncingCalendario = true;
  const queue = getOfflineCalendarioQueue(orgId);
  if (queue.length === 0) {
    isSyncingCalendario = false;
    return { synced: 0, remaining: 0 };
  }

  let syncedCount = 0;
  const remainingQueue: OfflineCalendarioItem[] = [];

  let cachedEvents: any[] = [];
  try {
    const raw = localStorage.getItem(`inagerlis_offline_calendario_${orgId}`);
    if (raw) cachedEvents = JSON.parse(raw);
  } catch {}

  for (const item of queue) {
    try {
      if (item.accion === "CREATE") {
        const res = await apiRequest<any>("/calendario", {
          method: "POST",
          body: JSON.stringify(item.payload),
        });

        const localId = item.eventoId || item.payload?.id;
        if (localId && res?.id) {
          cachedEvents = cachedEvents.map((ev) => (ev.id === localId ? { ...res } : ev));
        } else if (res?.id) {
          cachedEvents = [res, ...cachedEvents.filter((ev) => ev.id !== res.id)];
        }
        syncedCount++;
      } else if (item.accion === "UPDATE") {
        if (item.eventoId && !item.eventoId.startsWith("evt_local_")) {
          await apiRequest<any>(`/calendario/${item.eventoId}`, {
            method: "PUT",
            body: JSON.stringify(item.payload),
          });
          syncedCount++;
        }
      } else if (item.accion === "DELETE") {
        if (item.eventoId && !item.eventoId.startsWith("evt_local_")) {
          await apiRequest<any>(`/calendario/${item.eventoId}`, {
            method: "DELETE",
          });
          syncedCount++;
        }
      }
    } catch (err: any) {
      console.warn(`Error al sincronizar evento de calendario ${item.id}:`, err?.message);
      item.intentos = (item.intentos || 0) + 1;
      item.lastError = err?.message || "Error de red";
      remainingQueue.push(item);
    }
  }

  if (syncedCount > 0) {
    try {
      localStorage.setItem(`inagerlis_offline_calendario_${orgId}`, JSON.stringify(cachedEvents));
      window.dispatchEvent(new Event("calendario_data_synced"));
    } catch {}
  }

  saveOfflineCalendarioQueue(orgId, remainingQueue);
  isSyncingCalendario = false;

  return { synced: syncedCount, remaining: remainingQueue.length };
}
