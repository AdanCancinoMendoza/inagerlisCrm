"use client";

import { useState, useEffect } from "react";
import { Proveedor, getProveedor } from "@/services/proveedores";
import {
  X,
  Truck,
  Phone,
  MessageCircle,
  Mail,
  Building,
  CreditCard,
  MapPin,
  FileText,
  Package,
  Copy,
  Check,
  Edit3,
} from "lucide-react";

interface ProveedorDetailModalProps {
  proveedorId: string | null;
  onClose: () => void;
  onEdit: (proveedor: Proveedor) => void;
}

export default function ProveedorDetailModal({
  proveedorId,
  onClose,
  onEdit,
}: ProveedorDetailModalProps) {
  const [proveedor, setProveedor] = useState<Proveedor | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedClabe, setCopiedClabe] = useState(false);

  useEffect(() => {
    if (!proveedorId) {
      setProveedor(null);
      return;
    }

    setLoading(true);
    getProveedor(proveedorId)
      .then((data) => setProveedor(data))
      .catch((err) => console.error("Error al cargar detalle de proveedor:", err))
      .finally(() => setLoading(false));
  }, [proveedorId]);

  if (!proveedorId) return null;

  const copyToClipboard = (text?: string | null) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedClabe(true);
    setTimeout(() => setCopiedClabe(false), 2000);
  };

  const formatWhatsapp = (num?: string | null) => {
    if (!num) return "";
    const cleaned = num.replace(/\D/g, "");
    if (cleaned.length === 10) return `521${cleaned}`;
    return cleaned;
  };

  const waNum = formatWhatsapp(proveedor?.whatsapp || proveedor?.telefono);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="flex flex-col w-full max-w-3xl bg-white border border-[#222222] shadow-2xl max-h-[90vh]">
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-[#E5E5E5] bg-[#050505] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-[#D8A814] bg-black text-[#D8A814]">
              <Truck size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.18em]">
                Ficha del Proveedor
              </h2>
              <p className="text-[11px] text-[#AAAAAA]">
                Identificación comercial y condiciones de abastecimiento
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#888888] hover:text-white hover:bg-[#1A1A1A] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-xs uppercase tracking-widest text-[#777777]">
              Cargando información del proveedor...
            </div>
          ) : proveedor ? (
            <>
              {/* Tarjeta Principal */}
              <div className="border border-[#E5E5E5] bg-[#FAFAFA] p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="border border-[#D8A814] bg-[#FFFBEB] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#92400E]">
                        {proveedor.categoria || "GENERAL"}
                      </span>
                      {proveedor.activo ? (
                        <span className="border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-800">
                          Activo
                        </span>
                      ) : (
                        <span className="border border-[#D0D0D0] bg-[#F0F0F0] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#666666]">
                          Inactivo
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-black mt-2">
                      {proveedor.nombre}
                    </h3>

                    {proveedor.contacto && (
                      <p className="text-xs text-[#555555] mt-0.5">
                        Contacto: <span className="font-semibold text-black">{proveedor.contacto}</span>
                      </p>
                    )}

                    {proveedor.rfc && (
                      <p className="text-xs font-mono text-[#555555] mt-0.5">
                        RFC: <span className="font-bold text-black">{proveedor.rfc}</span>
                      </p>
                    )}
                  </div>

                  {/* Acciones Rápidas */}
                  <div className="flex flex-wrap sm:flex-col gap-2">
                    {waNum && (
                      <a
                        href={`https://wa.me/${waNum}?text=${encodeURIComponent(`Hola ${proveedor.contacto || proveedor.nombre}, le escribimos de Inagerlis CRM para consultar catálogo de productos y disponibilidad de surtido.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 border border-emerald-600 bg-emerald-600 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-emerald-700 transition-colors"
                      >
                        <MessageCircle size={14} />
                        WhatsApp
                      </a>
                    )}

                    {proveedor.telefono && (
                      <a
                        href={`tel:${proveedor.telefono}`}
                        className="inline-flex items-center justify-center gap-2 border border-black bg-black px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-[#D8A814] hover:border-[#D8A814] hover:text-black transition-colors"
                      >
                        <Phone size={14} />
                        Llamar
                      </a>
                    )}

                    <button
                      onClick={() => onEdit(proveedor)}
                      className="inline-flex items-center justify-center gap-2 border border-[#CCCCCC] bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-black hover:bg-[#F5F5F5] transition-colors cursor-pointer"
                    >
                      <Edit3 size={14} />
                      Editar
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid 2 Columnas: Ubicación y Condiciones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contacto & Ubicación */}
                <div className="border border-[#E5E5E5] bg-white p-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-black border-b border-[#E5E5E5] pb-2">
                    Contacto y Domicilio
                  </p>
                  <div className="space-y-2 text-xs text-[#444444]">
                    <div>
                      <span className="text-[#888888] block text-[10px] uppercase tracking-wider">Teléfono:</span>
                      <span className="font-semibold text-black">{proveedor.telefono || "No especificado"}</span>
                    </div>
                    <div>
                      <span className="text-[#888888] block text-[10px] uppercase tracking-wider">WhatsApp:</span>
                      <span className="font-semibold text-black">{proveedor.whatsapp || "No especificado"}</span>
                    </div>
                    <div>
                      <span className="text-[#888888] block text-[10px] uppercase tracking-wider">Correo:</span>
                      <span className="font-semibold text-black">{proveedor.email || "No especificado"}</span>
                    </div>
                    <div>
                      <span className="text-[#888888] block text-[10px] uppercase tracking-wider">Dirección:</span>
                      <span className="font-semibold text-black">
                        {[proveedor.direccion, proveedor.ciudad, proveedor.estado, proveedor.codigoPostal]
                          .filter(Boolean)
                          .join(", ") || "No especificada"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Condiciones Comerciales & Bancarias */}
                <div className="border border-[#E5E5E5] bg-white p-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-black border-b border-[#E5E5E5] pb-2">
                    Términos Comerciales y Pago
                  </p>
                  <div className="space-y-2 text-xs text-[#444444]">
                    <div className="flex justify-between">
                      <span className="text-[#888888]">Término de pago:</span>
                      <span className="font-bold text-black">
                        {(proveedor.diasCredito || 0) > 0 ? `${proveedor.diasCredito} días crédito` : "Contado"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#888888]">Límite de crédito:</span>
                      <span className="font-semibold text-black">
                        ${Number(proveedor.limiteCredito || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#888888]">Saldo pendiente:</span>
                      <span className={`font-bold ${Number(proveedor.saldoPendiente || 0) > 0 ? "text-red-600" : "text-black"}`}>
                        ${Number(proveedor.saldoPendiente || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-[#EEEEEE] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[#888888]">Banco:</span>
                        <span className="font-semibold text-black">{proveedor.banco || "No registrado"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#888888]">Cuenta:</span>
                        <span className="font-mono text-black">{proveedor.cuentaBancaria || "No registrada"}</span>
                      </div>
                      {proveedor.clabe && (
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[#888888]">CLABE:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-black">{proveedor.clabe}</span>
                            <button
                              onClick={() => copyToClipboard(proveedor.clabe)}
                              title="Copiar CLABE"
                              className="p-1 hover:bg-[#F0F0F0] border border-[#D5D5D5] transition-colors cursor-pointer"
                            >
                              {copiedClabe ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notas de Entrega */}
              {proveedor.notas && (
                <div className="border border-[#E5E5E5] bg-[#FFFBEB]/30 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#92400E] mb-1">
                    Notas Operativas y Horarios de Entrega
                  </p>
                  <p className="text-xs text-[#333333] leading-relaxed whitespace-pre-line">
                    {proveedor.notas}
                  </p>
                </div>
              )}

              {/* Artículos Surtidos */}
              <div className="border border-[#E5E5E5] bg-white">
                <div className="flex items-center justify-between border-b border-[#E5E5E5] bg-[#FAFAFA] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-[#D8A814]" />
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-black">
                      Artículos Surtidos ({proveedor.articulos?.length || 0})
                    </p>
                  </div>
                </div>

                {proveedor.articulos && proveedor.articulos.length > 0 ? (
                  <div className="divide-y divide-[#EEEEEE] max-h-56 overflow-y-auto">
                    {proveedor.articulos.map((art) => (
                      <div
                        key={art.id}
                        className="flex items-center justify-between px-4 py-2.5 text-xs hover:bg-[#F9FAFB]"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="font-bold text-black truncate">{art.nombre}</p>
                          <p className="text-[10px] font-mono text-[#777777] uppercase">
                            SKU: {art.codigo} • {art.unidad}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-black">
                            Venta: ${Number(art.precioVenta).toFixed(2)}
                          </p>
                          <p className="text-[10px] text-[#777777]">
                            Costo: ${Number(art.precioCompra).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-[#777777]">
                    No hay productos asociados directamente a este proveedor todavía.
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Pie */}
        <div className="flex items-center justify-end border-t border-[#E5E5E5] bg-[#FAFAFA] px-6 py-3">
          <button
            onClick={onClose}
            className="border border-[#D5D5D5] bg-white px-5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#333333] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
