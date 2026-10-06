/**
 * Servicio y utilidades de sesión y perfiles de usuario
 */

import { PermisosEstructura } from './perfiles';

export type UsuarioPerfil = {
  id: string;
  nombre: string;
  email: string;
  telefono?: string | null;
  rol?: string; // Mantener como fallback
  perfilId?: string | null;
  perfil?: {
    id: string;
    nombre: string;
    descripcion?: string | null;
    esAdmin: boolean;
    permisos: PermisosEstructura;
  } | null;
  organizacionId?: string;
  sucursalId?: string | null;
  organizacion?: {
    id: string;
    nombre: string;
    logo?: string | null;
  };
  sucursal?: {
    id: string;
    nombre: string;
  } | null;
};

export function getUsuarioActual(): UsuarioPerfil | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("crm_usuario_actual");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setUsuarioActual(usuario: UsuarioPerfil): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("crm_usuario_actual", JSON.stringify(usuario));
  if (usuario.organizacionId) {
    localStorage.setItem("crm_organizacion_id", usuario.organizacionId);
  }
  if (usuario.organizacion?.nombre) {
    localStorage.setItem("crm_organizacion_nombre", usuario.organizacion.nombre);
  }
}

export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("crm_usuario_actual");
  window.location.href = "/login";
}

export function getOrganizacionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("crm_organizacion_id");
}

export function getOrganizacionNombre(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("crm_organizacion_nombre");
}

export function getPerfilesGuardados(): UsuarioPerfil[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem("crm_perfiles");
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function setPerfilesGuardados(perfiles: UsuarioPerfil[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("crm_perfiles", JSON.stringify(perfiles));
}

/**
 * Valida si el usuario actual tiene permiso para un módulo determinado
 */
export function hasModuloPermiso(
  modulo: string,
  accion: 'ver' | 'crear' | 'editar' | 'eliminar' | 'abrir' | 'cerrar' | 'cancelar' | 'reimprimir' = 'ver'
): boolean {
  const usuario = getUsuarioActual();
  if (!usuario) return false;

  // Si es admin o no tiene perfil configurado aún (modo administrador inicial)
  if (usuario.perfil?.esAdmin || usuario.rol === "ADMIN") return true;
  if (!usuario.perfil || !usuario.perfil.permisos?.modulos) return true;

  const modKey = modulo.toLowerCase();
  const modPermisos = (usuario.perfil.permisos.modulos as any)?.[modKey];
  if (!modPermisos) return false;

  return Boolean(modPermisos[accion] ?? modPermisos.ver);
}

/**
 * Valida si el usuario actual tiene un permiso específico del Punto de Venta (POS)
 */
export function hasPosPermiso(permiso: keyof PermisosEstructura['pos']): boolean {
  const usuario = getUsuarioActual();
  if (!usuario) return false;

  if (usuario.perfil?.esAdmin || usuario.rol === "ADMIN") return true;
  if (!usuario.perfil || !usuario.perfil.permisos?.pos) return true;

  return Boolean(usuario.perfil.permisos.pos[permiso]);
}

/**
 * Obtiene el nombre del perfil del usuario formateado
 */
export function getNombrePerfil(usuario?: UsuarioPerfil | null): string {
  const u = usuario || getUsuarioActual();
  if (!u) return "Usuario";
  if (u.perfil?.nombre) return u.perfil.nombre;
  if (u.rol === "ADMIN") return "Administrador";
  if (u.rol === "GERENTE") return "Gerente";
  if (u.rol === "VENDEDOR") return "Vendedor";
  return "Operador";
}

/**
 * Retorna la ruta inicial según el perfil del usuario
 */
export function getRutaPorPerfil(usuario?: UsuarioPerfil | null): string {
  const u = usuario || getUsuarioActual();
  if (!u) return "/inicio";

  // Si solo tiene acceso al POS y no al inicio, enviarlo directo a /pos
  const modulos = u.perfil?.permisos?.modulos;
  const tienePos = u.perfil?.permisos?.pos?.acceso;

  if (tienePos && modulos && !modulos.inicio?.ver) {
    return "/pos";
  }

  // Compatibilidad con getRutaPorRol
  const nombre = getNombrePerfil(u).toLowerCase();
  if (nombre.includes("cajero") || nombre.includes("pos")) {
    return "/pos";
  }

  return "/inicio";
}

export function getRutaPorRol(rol?: string): string {
  if (!rol) return "/inicio";
  const r = rol.toUpperCase();
  if (r.includes("VENDEDOR") || r.includes("POS") || r.includes("CAJA")) {
    return "/pos";
  }
  return "/inicio";
}
