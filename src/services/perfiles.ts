import { apiRequest } from './api';

export interface ModuloPermisos {
  ver: boolean;
  crear?: boolean;
  editar?: boolean;
  eliminar?: boolean;
  abrir?: boolean;
  cerrar?: boolean;
  cancelar?: boolean;
  reimprimir?: boolean;
}

export interface PermisosEstructura {
  modulos: {
    inicio: { ver: boolean };
    clientes: { ver: boolean; crear: boolean; editar: boolean; eliminar: boolean };
    articulos: { ver: boolean; crear: boolean; editar: boolean; eliminar: boolean };
    stock: { ver: boolean; crear: boolean; editar: boolean; eliminar: boolean };
    promociones: { ver: boolean; crear: boolean; editar: boolean; eliminar: boolean };
    ventas: { ver: boolean; crear: boolean; editar: boolean; eliminar: boolean };
    caja: { ver: boolean; abrir: boolean; cerrar: boolean };
    tickets: { ver: boolean; cancelar: boolean; reimprimir: boolean };
    reportes: { ver: boolean };
    usuarios: { ver: boolean; crear: boolean; editar: boolean; eliminar: boolean };
    configuracion: { ver: boolean };
  };
  pos: {
    acceso: boolean;            // Puede entrar al Punto de Venta
    aplicarDescuentos: boolean; // Permitir descuentos en ticket
    cancelarVenta: boolean;    // Cancelar venta en curso
    cambiarPrecios: boolean;   // Modificar precios al cobrar
    abrirCajon: boolean;       // Abrir cajón de dinero sin venta
    verCostos: boolean;        // Ver costos de compra y margen
    devoluciones: boolean;      // Procesar devoluciones
  };
}

export interface Perfil {
  id: string;
  organizacionId: string;
  nombre: string;
  descripcion?: string | null;
  esAdmin: boolean;
  activo: boolean;
  permisos: PermisosEstructura;
  usuariosCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePerfilInput {
  organizacionId: string;
  nombre: string;
  descripcion?: string;
  esAdmin?: boolean;
  activo?: boolean;
  permisos: PermisosEstructura;
}

export interface UpdatePerfilInput {
  nombre?: string;
  descripcion?: string;
  esAdmin?: boolean;
  activo?: boolean;
  permisos?: PermisosEstructura;
}

export const PLANTILLA_PERMISOS_DEFAULT: PermisosEstructura = {
  modulos: {
    inicio: { ver: true },
    clientes: { ver: true, crear: false, editar: false, eliminar: false },
    articulos: { ver: true, crear: false, editar: false, eliminar: false },
    stock: { ver: false, crear: false, editar: false, eliminar: false },
    promociones: { ver: false, crear: false, editar: false, eliminar: false },
    ventas: { ver: true, crear: true, editar: false, eliminar: false },
    caja: { ver: true, abrir: false, cerrar: false },
    tickets: { ver: true, cancelar: false, reimprimir: true },
    reportes: { ver: false },
    usuarios: { ver: false, crear: false, editar: false, eliminar: false },
    configuracion: { ver: false },
  },
  pos: {
    acceso: true,
    aplicarDescuentos: false,
    cancelarVenta: false,
    cambiarPrecios: false,
    abrirCajon: false,
    verCostos: false,
    devoluciones: false,
  },
};

export async function getPerfiles(organizacionId: string): Promise<Perfil[]> {
  return apiRequest<Perfil[]>(`/perfiles/organizacion/${organizacionId}`);
}

export async function getPerfil(id: string): Promise<Perfil> {
  return apiRequest<Perfil>(`/perfiles/${id}`);
}

export async function createPerfil(data: CreatePerfilInput): Promise<Perfil> {
  return apiRequest<Perfil>('/perfiles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePerfil(id: string, data: UpdatePerfilInput): Promise<Perfil> {
  return apiRequest<Perfil>(`/perfiles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deletePerfil(id: string): Promise<{ mensaje: string }> {
  return apiRequest<{ mensaje: string }>(`/perfiles/${id}`, {
    method: 'DELETE',
  });
}
