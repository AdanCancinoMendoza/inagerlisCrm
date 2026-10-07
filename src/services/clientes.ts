import { apiRequest } from './api';

export interface VentaClienteDetalle {
  id: string;
  articuloId: string;
  codigo: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface VentaCliente {
  id: string;
  folio: string;
  fecha: string;
  subtotal: number;
  descuento: number;
  impuesto: number;
  total: number;
  metodoPago: string;
  estado: string;
  sucursal: string;
  terminal: string;
  vendedor: string;
  detallesCount: number;
  detalles: VentaClienteDetalle[];
}

export interface Cliente {
  id: string;
  organizacionId: string;
  nombre: string;
  telefono?: string | null;
  email?: string | null;
  rfc?: string | null;
  localidad?: string | null;
  puntos: number;
  saldo: number;
  descuento: number; // Porcentaje de descuento preferencial (ej. 5% o 10%)
  comprasCount?: number;
  totalGastado?: number;
  ticketPromedio?: number;
  ventas?: VentaCliente[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClienteInput {
  organizacionId: string;
  nombre: string;
  telefono?: string;
  email?: string;
  rfc?: string;
  localidad?: string;
  puntos?: number;
  saldo?: number;
  descuento?: number;
}

export interface UpdateClienteInput {
  nombre?: string;
  telefono?: string;
  email?: string;
  rfc?: string;
  localidad?: string;
  puntos?: number;
  saldo?: number;
  descuento?: number;
}

export async function getClientes(
  organizacionId: string,
  search?: string,
  localidad?: string
): Promise<Cliente[]> {
  const params = new URLSearchParams();
  params.set('organizacionId', organizacionId);
  if (search) params.set('search', search);
  if (localidad && localidad !== 'Todas las localidades') params.set('localidad', localidad);

  return apiRequest<Cliente[]>(`/clientes?${params.toString()}`);
}

export async function getCliente(id: string): Promise<Cliente> {
  return apiRequest<Cliente>(`/clientes/${id}`);
}

export async function createCliente(data: CreateClienteInput): Promise<Cliente> {
  return apiRequest<Cliente>('/clientes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCliente(id: string, data: UpdateClienteInput): Promise<Cliente> {
  return apiRequest<Cliente>(`/clientes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCliente(id: string): Promise<{ mensaje: string }> {
  return apiRequest<{ mensaje: string }>(`/clientes/${id}`, {
    method: 'DELETE',
  });
}
