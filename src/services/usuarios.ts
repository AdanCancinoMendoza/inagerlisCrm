import { apiRequest } from './api';
import { Perfil } from './perfiles';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono?: string | null;
  activo: boolean;
  sucursalId?: string | null;
  perfilId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  perfil?: {
    id: string;
    nombre: string;
    esAdmin: boolean;
    permisos?: any;
  } | null;
  sucursal?: {
    id: string;
    nombre: string;
  } | null;
}

export interface CreateUsuarioInput {
  organizacionId: string;
  nombre: string;
  email: string;
  password: string;
  pin?: string;
  telefono?: string;
  sucursalId?: string;
  perfilId: string;
  activo?: boolean;
}

export interface UpdateUsuarioInput {
  nombre?: string;
  email?: string;
  password?: string;
  pin?: string;
  telefono?: string;
  sucursalId?: string;
  perfilId?: string;
  activo?: boolean;
}

export async function getUsuarios(organizacionId: string, search?: string): Promise<Usuario[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiRequest<Usuario[]>(`/usuarios/organizacion/${organizacionId}${query}`);
}

export async function getUsuario(id: string): Promise<Usuario> {
  return apiRequest<Usuario>(`/usuarios/${id}`);
}

export async function createUsuario(data: CreateUsuarioInput): Promise<Usuario> {
  return apiRequest<Usuario>('/usuarios', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateUsuario(id: string, data: UpdateUsuarioInput): Promise<Usuario> {
  return apiRequest<Usuario>(`/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteUsuario(id: string): Promise<{ mensaje: string; softDeleted?: boolean }> {
  return apiRequest<{ mensaje: string; softDeleted?: boolean }>(`/usuarios/${id}`, {
    method: 'DELETE',
  });
}
