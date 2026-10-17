/**
 * Configuración centralizada de API para el backend de Imagertis / Inagerlis
 * Optimizado con deduplicación de peticiones en vuelo y caché en memoria de corto plazo
 * para reducir drásticamente el consumo de peticiones y ancho de banda en Render.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://bkina.onrender.com";

export const API_PREFIX = "/inagerlis";

/**
 * Retorna la URL completa formateada con el prefijo /inagerlis
 * @example apiUrl('/organizaciones') -> 'https://bkina.onrender.com/inagerlis/organizaciones'
 */
export function apiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${API_PREFIX}${cleanEndpoint}`;
}

export interface ApiRequestOptions extends RequestInit {
  timeoutMs?: number;
  skipCache?: boolean;
}

// Mapa de peticiones en vuelo para deduplicar llamadas simultáneas
const inflightRequests = new Map<string, Promise<any>>();

// Caché en memoria para endpoints de catálogo estático (TTL 20 segundos)
interface CacheEntry {
  data: any;
  expiresAt: number;
}
const memoryCache = new Map<string, CacheEntry>();

const CACHEABLE_PATTERNS = [
  "/articulos/familias",
  "/articulos/unidades",
  "/organizaciones/",
  "/perfiles",
];

export function clearApiCache(pattern?: string) {
  if (!pattern) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.includes(pattern)) {
      memoryCache.delete(key);
    }
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const url = apiUrl(endpoint);
  const method = (options.method || "GET").toUpperCase();

  // Invalidar caché automáticamente ante mutaciones
  if (method === "POST" || method === "PUT" || method === "DELETE" || method === "PATCH") {
    if (endpoint.includes("/articulos/familias")) clearApiCache("/articulos/familias");
    if (endpoint.includes("/articulos/unidades")) clearApiCache("/articulos/unidades");
    if (endpoint.includes("/organizaciones")) clearApiCache("/organizaciones");
  }

  // Verificar caché de lectura
  const isCacheable =
    method === "GET" &&
    !options.skipCache &&
    CACHEABLE_PATTERNS.some((pattern) => endpoint.includes(pattern));

  if (isCacheable) {
    const cached = memoryCache.get(url);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as T;
    }
  }

  // Deduplicación de peticiones GET idénticas concurrentes en vuelo
  if (method === "GET" && inflightRequests.has(url)) {
    return inflightRequests.get(url) as Promise<T>;
  }

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  const { timeoutMs, signal, skipCache, ...fetchOptions } = options;

  let controller: AbortController | undefined;
  let timeoutId: NodeJS.Timeout | undefined;

  if (timeoutMs && !signal) {
    controller = new AbortController();
    timeoutId = setTimeout(() => {
      controller?.abort(new Error(`Timeout de petición (${timeoutMs}ms) en ${endpoint}`));
    }, timeoutMs);
  }

  const requestPromise = (async () => {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: signal || controller?.signal,
        headers: {
          ...defaultHeaders,
          ...fetchOptions.headers,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || `Error HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      // Guardar en caché si es un endpoint cacheable
      if (isCacheable) {
        memoryCache.set(url, {
          data,
          expiresAt: Date.now() + 20000, // 20 segundos
        });
      }

      return data as T;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      inflightRequests.delete(url);
    }
  })();

  if (method === "GET") {
    inflightRequests.set(url, requestPromise);
  }

  return requestPromise;
}
