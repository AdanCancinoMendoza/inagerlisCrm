"use client";

import { useEffect, useState } from "react";
import { Cliente, VentaCliente, getCliente } from "@/services/clientes";
import {
  X,
  ShoppingBag,
  Award,
  Percent,
  Calendar,
  CreditCard,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  ChevronUp,
  Receipt,
  ExternalLink,
  Package,
  Edit3,
  Trash2,
} from "lucide-react";
import Link from "next/link";

interface CustomerDetailModalProps {
  clienteId: string | null;
  onClose: () => void;
  onEdit?: (cliente: Cliente) => void;
  onDelete?: (cliente: Cliente) => void;
}

export default function CustomerDetailModal({
  clienteId,
  onClose,
  onEdit,
  onDelete,
}: CustomerDetailModalProps) {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);

  useEffect(() => {
    if (!clienteId) {
      setCliente(null);
      return;
    }

    const loadDetalle = async () => {
      setLoading(true);
      try {
        const data = await getCliente(clienteId);
        setCliente(data);
      } catch (err) {
        console.error("Error al cargar detalle del cliente:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDetalle();
  }, [clienteId]);

  if (!clienteId) return null;

  const toggleExpandSale = (saleId: string) => {
    setExpandedSaleId((prev) => (prev === saleId ? null : saleId));
  };

  const initial = cliente?.nombre?.charAt(0).toUpperCase() || "C";
  const ventas = cliente?.ventas || [];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs cursor-pointer overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-[#D8A814] bg-white shadow-2xl overflow-hidden cursor-default my-auto"
      >
        {/* HEADER DEL MODAL */}
        <div className="flex items-center justify-between border-b border-[#E5E5E5] bg-[#FAFAFA] px-7 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black font-bold text-white text-xl shadow-xs">
              {initial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-black">
                  {cliente?.nombre || "Cargando cliente..."}
                </h2>
                {(cliente?.descuento || 0) > 0 && (
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                    <Percent size={11} />
                    {cliente?.descuento}% Descuento
                  </span>
                )}
              </div>
              <p className="text-xs text-[#666666]">
                {cliente?.email || "Sin correo"} • {cliente?.localidad || "Sin localidad"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && cliente && (
              <button
                type="button"
                onClick={() => onEdit(cliente)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8A814] bg-white px-3 py-1.5 text-xs font-bold text-black hover:bg-[#D8A814] hover:text-white transition-colors"
              >
                <Edit3 size={14} />
                Editar
              </button>
            )}

            {onDelete && cliente && (
              <button
                type="button"
                onClick={() => onDelete(cliente)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-600 hover:text-white transition-colors"
              >
                <Trash2 size={14} />
                Eliminar
              </button>
            )}

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-[#777777] hover:bg-[#E5E5E5] hover:text-black transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL CON SCROLL */}
        <div className="flex-1 overflow-y-auto p-7 space-y-6">
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D8A814] border-t-transparent" />
              <p className="text-sm text-[#777777]">Cargando expediente del cliente...</p>
            </div>
          ) : (
            <>
              {/* TARJETAS DE MÉTRICAS RÁPIDAS */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] p-4 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">
                    Ventas Vinculadas
                  </p>
                  <p className="mt-1 text-2xl font-bold text-black">
                    {cliente?.comprasCount || ventas.length || 0}
                  </p>
                </div>

                <div className="rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] p-4 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">
                    Total Facturado
                  </p>
                  <p className="mt-1 text-2xl font-bold text-black">
                    ${(cliente?.totalGastado || 0).toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>

                <div className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-4 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#B45309]">
                    Puntos Fidelidad
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[#B45309] flex items-center justify-center gap-1">
                    <Award size={20} />
                    {cliente?.puntos || 0}
                  </p>
                </div>

                <div className="rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] p-4 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#065F46]">
                    Descuento POS
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[#065F46] flex items-center justify-center gap-0.5">
                    <Percent size={18} />
                    {cliente?.descuento || 0}%
                  </p>
                </div>
              </div>

              {/* DATOS DE CONTACTO Y FISCALES */}
              <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-black mb-3 border-b border-[#F0F0F0] pb-2">
                  Información de Contacto y Facturación
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="font-semibold text-[#888888] flex items-center gap-1.5 mb-1">
                      <Phone size={13} className="text-[#D8A814]" /> Teléfono:
                    </span>
                    <span className="font-bold text-black">{cliente?.telefono || "—"}</span>
                  </div>

                  <div>
                    <span className="font-semibold text-[#888888] flex items-center gap-1.5 mb-1">
                      <Mail size={13} className="text-[#D8A814]" /> Correo Electrónico:
                    </span>
                    <span className="font-bold text-black">{cliente?.email || "—"}</span>
                  </div>

                  <div>
                    <span className="font-semibold text-[#888888] flex items-center gap-1.5 mb-1">
                      <MapPin size={13} className="text-[#D8A814]" /> Localidad:
                    </span>
                    <span className="font-bold text-black">{cliente?.localidad || "—"}</span>
                  </div>

                  <div>
                    <span className="font-semibold text-[#888888] flex items-center gap-1.5 mb-1">
                      RFC Fiscal:
                    </span>
                    <span className="font-bold text-black font-mono">{cliente?.rfc || "—"}</span>
                  </div>

                  <div>
                    <span className="font-semibold text-[#888888] flex items-center gap-1.5 mb-1">
                      Ticket Promedio:
                    </span>
                    <span className="font-bold text-black">
                      ${(cliente?.ticketPromedio || 0).toLocaleString("es-MX", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  <div>
                    <span className="font-semibold text-[#888888] flex items-center gap-1.5 mb-1">
                      Saldo a favor:
                    </span>
                    <span className="font-bold text-black">
                      ${(cliente?.saldo || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* HISTORIAL DE VENTAS VINCULADAS */}
              <div className="rounded-xl border border-[#E5E5E5] bg-white overflow-hidden shadow-xs">
                <div className="flex items-center justify-between border-b border-[#E5E5E5] bg-[#FAFAFA] px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Receipt size={17} className="text-[#D8A814]" />
                    <h3 className="text-sm font-bold text-black">
                      Historial de Ventas Vinculadas ({ventas.length})
                    </h3>
                  </div>

                  <Link
                    href="/pos"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D8A814] hover:text-black transition-colors"
                  >
                    Abrir Punto de Venta (POS)
                    <ExternalLink size={13} />
                  </Link>
                </div>

                {ventas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-10 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFFBEB] text-[#D8A814] mb-3">
                      <ShoppingBag size={26} />
                    </div>
                    <p className="font-bold text-black">Sin ventas vinculadas todavía</p>
                    <p className="mt-1 max-w-md text-xs text-[#777777]">
                      Este cliente aún no tiene tickets registrados. Al realizar un cobro en el{" "}
                      <span className="font-semibold text-black">Punto de Venta</span>, vincúlalo para otorgarle sus beneficios y registrar el historial aquí.
                    </p>
                    <Link
                      href="/pos"
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-bold text-white hover:bg-[#D8A814] transition-colors"
                    >
                      <ShoppingBag size={14} />
                      Crear Venta en POS
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-[#EEEEEE]">
                    {ventas.map((venta: VentaCliente) => {
                      const isExpanded = expandedSaleId === venta.id;
                      const fechaFormateada = new Date(venta.fecha).toLocaleString("es-MX", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      });

                      return (
                        <div key={venta.id} className="transition-colors hover:bg-[#FDFDFD]">
                          {/* Fila principal del ticket */}
                          <div
                            onClick={() => toggleExpandSale(venta.id)}
                            className="flex cursor-pointer items-center justify-between px-6 py-4"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F3F4F6] font-mono text-xs font-bold text-black">
                                <Receipt size={16} />
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm font-bold text-black">
                                    {venta.folio}
                                  </span>
                                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                                    {venta.estado}
                                  </span>
                                  {venta.descuento > 0 && (
                                    <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                                      Desc. -${venta.descuento.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                                <p className="mt-0.5 text-xs text-[#777777] flex items-center gap-2">
                                  <span>{fechaFormateada}</span>
                                  <span>•</span>
                                  <span>{venta.sucursal}</span>
                                  <span>•</span>
                                  <span>Pago: {venta.metodoPago}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <p className="text-sm font-bold text-black">
                                  ${venta.total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                                </p>
                                <p className="text-[11px] text-[#888888]">
                                  {venta.detalles?.length || 0} productos
                                </p>
                              </div>

                              <div className="text-[#9CA3AF]">
                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                              </div>
                            </div>
                          </div>

                          {/* Desglose desplegable de productos del ticket */}
                          {isExpanded && (
                            <div className="border-t border-[#F0F0F0] bg-[#FAFAFA] px-6 py-4">
                              <p className="text-[11px] font-bold uppercase tracking-wider text-[#777777] mb-2 flex items-center gap-1.5">
                                <Package size={13} />
                                Artículos Comprados en esta Venta
                              </p>

                              <div className="space-y-1.5">
                                {venta.detalles?.map((det) => (
                                  <div
                                    key={det.id}
                                    className="flex items-center justify-between rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-xs"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="rounded bg-[#F3F4F6] px-1.5 py-0.5 font-mono text-[10px] text-gray-600">
                                        {det.codigo || "—"}
                                      </span>
                                      <span className="font-semibold text-black">
                                        {det.nombre}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-6 text-right">
                                      <span className="text-gray-500">
                                        {det.cantidad} x ${det.precioUnitario.toFixed(2)}
                                      </span>
                                      <span className="font-bold text-black min-w-[70px]">
                                        ${det.subtotal.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Resumen numérico del ticket */}
                              <div className="mt-3 flex justify-end gap-6 border-t border-[#E5E5E5] pt-2 text-xs text-gray-600">
                                <div>
                                  Subtotal: <span className="font-semibold text-black">${venta.subtotal.toFixed(2)}</span>
                                </div>
                                {venta.descuento > 0 && (
                                  <div>
                                    Descuento: <span className="font-semibold text-emerald-600">-${venta.descuento.toFixed(2)}</span>
                                  </div>
                                )}
                                <div>
                                  IVA: <span className="font-semibold text-black">${venta.impuesto.toFixed(2)}</span>
                                </div>
                                <div>
                                  Total: <span className="font-bold text-black">${venta.total.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* PIE DEL MODAL */}
        <div className="flex flex-wrap gap-3 justify-between items-center border-t border-[#E5E5E5] bg-[#FAFAFA] px-7 py-4">
          <p className="text-xs text-[#888888]">
            ID Cliente: <span className="font-mono">{cliente?.id}</span>
          </p>

          <div className="flex items-center gap-2">
            {onEdit && cliente && (
              <button
                type="button"
                onClick={() => onEdit(cliente)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8A814] bg-white px-4 py-2 text-xs font-bold text-black hover:bg-[#D8A814] hover:text-white transition-colors"
              >
                <Edit3 size={14} />
                Editar Información
              </button>
            )}

            {onDelete && cliente && (
              <button
                type="button"
                onClick={() => onDelete(cliente)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-600 hover:text-white transition-colors"
              >
                <Trash2 size={14} />
                Eliminar Cliente
              </button>
            )}

            <button
              onClick={onClose}
              className="rounded-lg bg-black px-6 py-2 text-xs font-bold text-white hover:bg-[#D8A814] transition-colors"
            >
              Cerrar Expediente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
