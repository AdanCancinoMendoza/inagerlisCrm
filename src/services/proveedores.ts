import { apiRequest } from "./api";

export interface ArticuloProveedor {
  id: string;
  codigo: string;
  nombre: string;
  precioCompra: number;
  precioVenta: number;
  unidad: string;
  activo: boolean;
}

export interface Proveedor {
  id: string;
  organizacionId: string;
  nombre: string;
  contacto?: string | null;
  rfc?: string | null;
  telefono?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  estado?: string | null;
  codigoPostal?: string | null;
  categoria?: string | null;
  diasCredito?: number;
  limiteCredito?: number;
  saldoPendiente?: number;
  banco?: string | null;
  cuentaBancaria?: string | null;
  clabe?: string | null;
  notas?: string | null;
  activo: boolean;
  articulosCount?: number;
  articulos?: ArticuloProveedor[];
  createdAt: string;
  updatedAt: string;
}

export interface ProveedorEstadisticas {
  total: number;
  activos: number;
  conCredito: number;
  totalSaldoPendiente: number;
  categoriasCount: number;
  categorias: string[];
}

export interface CreateProveedorInput {
  organizacionId: string;
  nombre: string;
  contacto?: string;
  rfc?: string;
  telefono?: string;
  whatsapp?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  codigoPostal?: string;
  categoria?: string;
  diasCredito?: number;
  limiteCredito?: number;
  saldoPendiente?: number;
  banco?: string;
  cuentaBancaria?: string;
  clabe?: string;
  notas?: string;
  activo?: boolean;
}

export interface UpdateProveedorInput extends Partial<CreateProveedorInput> {}

const OFFLINE_PROVEEDORES_KEY = "inagerlis_offline_proveedores";
const OFFLINE_PROVEEDORES_QUEUE_KEY = "inagerlis_offline_proveedores_queue";

// Helper de caché offline
export function getOfflineProveedores(): Proveedor[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(OFFLINE_PROVEEDORES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOfflineProveedores(proveedores: Proveedor[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(OFFLINE_PROVEEDORES_KEY, JSON.stringify(proveedores));
  } catch {}
}

export async function getProveedores(
  organizacionId: string,
  search?: string,
  categoria?: string,
  activo?: boolean,
): Promise<Proveedor[]> {
  try {
    const params = new URLSearchParams({ organizacionId });
    if (search) params.append("search", search);
    if (categoria && categoria !== "Todas") params.append("categoria", categoria);
    if (activo !== undefined) params.append("activo", String(activo));

    const data = await apiRequest<Proveedor[]>(`/proveedores?${params.toString()}`);
    saveOfflineProveedores(data);
    return data;
  } catch (err) {
    console.warn("No se pudo conectar al servidor, usando catálogo offline de proveedores:", err);
    let cached = getOfflineProveedores();
    if (organizacionId) {
      cached = cached.filter((p) => p.organizacionId === organizacionId);
    }
    if (activo !== undefined) {
      cached = cached.filter((p) => p.activo === activo);
    }
    if (categoria && categoria !== "Todas") {
      cached = cached.filter((p) => p.categoria?.toLowerCase() === categoria.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      cached = cached.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          (p.contacto && p.contacto.toLowerCase().includes(q)) ||
          (p.rfc && p.rfc.toLowerCase().includes(q)) ||
          (p.telefono && p.telefono.includes(q)),
      );
    }
    return cached;
  }
}

export async function getProveedorEstadisticas(
  organizacionId: string,
): Promise<ProveedorEstadisticas> {
  try {
    return await apiRequest<ProveedorEstadisticas>(`/proveedores/estadisticas/${organizacionId}`);
  } catch (err) {
    const cached = getOfflineProveedores().filter((p) => p.organizacionId === organizacionId);
    const categorias = Array.from(new Set(cached.map((p) => p.categoria).filter(Boolean))) as string[];
    return {
      total: cached.length,
      activos: cached.filter((p) => p.activo).length,
      conCredito: cached.filter((p) => (p.diasCredito || 0) > 0).length,
      totalSaldoPendiente: cached.reduce((sum, p) => sum + Number(p.saldoPendiente || 0), 0),
      categoriasCount: categorias.length,
      categorias,
    };
  }
}

export async function getProveedor(id: string): Promise<Proveedor> {
  try {
    return await apiRequest<Proveedor>(`/proveedores/${id}`);
  } catch (err) {
    const cached = getOfflineProveedores();
    const found = cached.find((p) => p.id === id);
    if (found) return found;
    throw err;
  }
}

export async function createProveedor(data: CreateProveedorInput): Promise<Proveedor> {
  try {
    const result = await apiRequest<Proveedor>("/proveedores", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const cached = getOfflineProveedores();
    saveOfflineProveedores([result, ...cached]);
    return result;
  } catch (err) {
    // Si estamos offline, generar registro local provisional
    const provisional: Proveedor = {
      id: `OFF-PROV-${Date.now()}`,
      organizacionId: data.organizacionId,
      nombre: data.nombre,
      contacto: data.contacto || null,
      rfc: data.rfc || null,
      telefono: data.telefono || null,
      whatsapp: data.whatsapp || null,
      email: data.email || null,
      direccion: data.direccion || null,
      ciudad: data.ciudad || null,
      estado: data.estado || null,
      codigoPostal: data.codigoPostal || null,
      categoria: data.categoria || "General",
      diasCredito: data.diasCredito || 0,
      limiteCredito: data.limiteCredito || 0,
      saldoPendiente: data.saldoPendiente || 0,
      banco: data.banco || null,
      cuentaBancaria: data.cuentaBancaria || null,
      clabe: data.clabe || null,
      notas: data.notas || null,
      activo: data.activo ?? true,
      articulosCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const cached = getOfflineProveedores();
    saveOfflineProveedores([provisional, ...cached]);

    // Encolar para sincronización
    try {
      const rawQueue = localStorage.getItem(OFFLINE_PROVEEDORES_QUEUE_KEY);
      const queue = rawQueue ? JSON.parse(rawQueue) : [];
      queue.push({ action: "CREATE", data });
      localStorage.setItem(OFFLINE_PROVEEDORES_QUEUE_KEY, JSON.stringify(queue));
    } catch {}

    return provisional;
  }
}

export async function updateProveedor(
  id: string,
  data: UpdateProveedorInput,
): Promise<Proveedor> {
  try {
    const result = await apiRequest<Proveedor>(`/proveedores/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    const cached = getOfflineProveedores();
    saveOfflineProveedores(cached.map((p) => (p.id === id ? { ...p, ...result } : p)));
    return result;
  } catch (err) {
    const cached = getOfflineProveedores();
    const updated = cached.map((p) => (p.id === id ? ({ ...p, ...data, updatedAt: new Date().toISOString() } as Proveedor) : p));
    saveOfflineProveedores(updated);

    try {
      const rawQueue = localStorage.getItem(OFFLINE_PROVEEDORES_QUEUE_KEY);
      const queue = rawQueue ? JSON.parse(rawQueue) : [];
      queue.push({ action: "UPDATE", id, data });
      localStorage.setItem(OFFLINE_PROVEEDORES_QUEUE_KEY, JSON.stringify(queue));
    } catch {}

    const found = updated.find((p) => p.id === id);
    if (found) return found;
    throw err;
  }
}

export async function deleteProveedor(id: string): Promise<void> {
  try {
    await apiRequest(`/proveedores/${id}`, {
      method: "DELETE",
    });

    const cached = getOfflineProveedores();
    saveOfflineProveedores(cached.filter((p) => p.id !== id));
  } catch (err) {
    const cached = getOfflineProveedores();
    saveOfflineProveedores(cached.filter((p) => p.id !== id));

    try {
      const rawQueue = localStorage.getItem(OFFLINE_PROVEEDORES_QUEUE_KEY);
      const queue = rawQueue ? JSON.parse(rawQueue) : [];
      queue.push({ action: "DELETE", id });
      localStorage.setItem(OFFLINE_PROVEEDORES_QUEUE_KEY, JSON.stringify(queue));
    } catch {}
  }
}
