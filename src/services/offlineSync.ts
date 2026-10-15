import { apiRequest } from "./api";

export interface OfflineSale {
  id: string; // Folio provisional
  timestamp: string;
  payload: any;
  intentos: number;
  lastError?: string;
}

const QUEUE_KEY = "inagerlis_offline_sales_queue";
const PRODUCTS_KEY = "inagerlis_offline_products";
const CLIENTS_KEY = "inagerlis_offline_clients";

/**
 * Obtiene la lista actual de ventas guardadas localmente pendientes de subida.
 */
export function getOfflineSalesQueue(): OfflineSale[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Error al leer cola offline:", err);
    return [];
  }
}

/**
 * Guarda la cola de ventas y notifica a la aplicación para actualizar indicadores.
 */
export function saveOfflineSalesQueue(queue: OfflineSale[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new Event("offline_queue_updated"));
  } catch (err) {
    console.error("Error al guardar cola offline:", err);
  }
}

/**
 * Encola una venta realizada sin conexión y genera una respuesta válida para emitir ticket de inmediato.
 */
export function enqueueOfflineSale(payload: any): any {
  const queue = getOfflineSalesQueue();
  const provisionalFolio = `OFF-${Date.now().toString().slice(-6)}-${Math.floor(
    100 + Math.random() * 900
  )}`;

  const offlineSale: OfflineSale = {
    id: provisionalFolio,
    timestamp: new Date().toISOString(),
    payload: {
      ...payload,
      provisionalFolio,
      esOffline: true,
    },
    intentos: 0,
  };

  queue.push(offlineSale);
  saveOfflineSalesQueue(queue);

  return {
    id: provisionalFolio,
    folio: provisionalFolio,
    createdAt: offlineSale.timestamp,
    total: payload.total,
    subtotal: payload.subtotal,
    impuesto: payload.impuesto,
    descuento: payload.descuento || 0,
    metodoPago: payload.metodoPago,
    detalles: payload.detalles,
    esOffline: true,
    pendienteSincronizar: true,
  };
}

let isSyncing = false;

/**
 * Intenta sincronizar todas las ventas pendientes contra el servidor.
 */
export async function syncOfflineSales(
  onProgress?: (synced: number, total: number) => void
): Promise<{ synced: number; remaining: number }> {
  if (isSyncing || typeof window === "undefined" || !navigator.onLine) {
    return { synced: 0, remaining: getOfflineSalesQueue().length };
  }

  isSyncing = true;
  const queue = getOfflineSalesQueue();
  if (queue.length === 0) {
    isSyncing = false;
    return { synced: 0, remaining: 0 };
  }

  let syncedCount = 0;
  const remainingQueue: OfflineSale[] = [];

  for (const item of queue) {
    try {
      await apiRequest<any>("/ventas", {
        method: "POST",
        body: JSON.stringify(item.payload),
      });

      syncedCount++;
      if (onProgress) {
        onProgress(syncedCount, queue.length);
      }
    } catch (err: any) {
      console.warn(`No se pudo sincronizar venta ${item.id}:`, err?.message);
      item.intentos = (item.intentos || 0) + 1;
      item.lastError = err?.message || "Error de red";
      remainingQueue.push(item);
    }
  }

  saveOfflineSalesQueue(remainingQueue);
  isSyncing = false;

  return { synced: syncedCount, remaining: remainingQueue.length };
}

/**
 * Guarda en caché local el catálogo de artículos para consulta sin conexión.
 */
export function cacheProductsLocally(orgId: string, products: any[]) {
  if (typeof window === "undefined" || !orgId) return;
  try {
    localStorage.setItem(`${PRODUCTS_KEY}_${orgId}`, JSON.stringify(products));
    localStorage.setItem(
      `${PRODUCTS_KEY}_${orgId}_updated`,
      new Date().toISOString()
    );
  } catch (err) {
    console.error("Error al cachear productos localmente:", err);
  }
}

/**
 * Obtiene el catálogo de artículos desde la memoria local.
 */
export function getCachedProductsLocally(orgId: string): any[] | null {
  if (typeof window === "undefined" || !orgId) return null;
  try {
    const raw = localStorage.getItem(`${PRODUCTS_KEY}_${orgId}`);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("Error al obtener productos locales:", err);
    return null;
  }
}

export * from "./calendarioSync";
