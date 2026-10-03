/**
 * Servicio y utilidades de sesión y perfiles de usuario
 */

export type UsuarioPerfil = {
  id: string;
  nombre: string;
  email: string;
  telefono?: string | null;
  rol: "ADMIN" | "GERENTE" | "VENDEDOR" | string;
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
  // Redirige al login manteniendo el historial de perfiles de la organización
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
 * Retorna la ruta inicial según el rol del usuario
 */
export function getRutaPorRol(rol?: string): string {
  if (!rol) return "/inicio";
  const r = rol.toUpperCase();
  if (r.includes("VENDEDOR") || r.includes("POS") || r.includes("CAJA")) {
    return "/pos";
  }
  return "/inicio";
}
