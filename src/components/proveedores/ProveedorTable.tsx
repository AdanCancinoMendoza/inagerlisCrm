"use client";

import { Proveedor } from "@/services/proveedores";
import {
  Truck,
  Phone,
  MessageCircle,
  Mail,
  Edit3,
  Trash2,
  ChevronRight,
  Package,
  CreditCard,
  Building,
} from "lucide-react";

interface ProveedorTableProps {
  proveedores: Proveedor[];
  onSelectProveedor?: (proveedor: Proveedor) => void;
  onEditProveedor?: (proveedor: Proveedor) => void;
  onDeleteProveedor?: (proveedor: Proveedor) => void;
}

export default function ProveedorTable({
  proveedores,
  onSelectProveedor,
  onEditProveedor,
  onDeleteProveedor,
}: ProveedorTableProps) {
  if (proveedores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] border border-[#E5E5E5] bg-white p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center border border-[#D8A814]/30 bg-[#FFFBEB] text-[#D8A814] mb-4">
          <Truck size={28} />
        </div>
        <p className="font-bold text-black text-base uppercase tracking-[0.16em]">
          No hay proveedores registrados
        </p>
        <p className="mt-1.5 max-w-md text-xs text-[#777777] leading-relaxed">
          Haz clic en <span className="font-bold text-black">"+ Nuevo proveedor"</span> para registrar distribuidores, condiciones comerciales de crédito y enlazar catálogo de compras.
        </p>
      </div>
    );
  }

  const formatWhatsapp = (num?: string | null) => {
    if (!num) return "";
    const cleaned = num.replace(/\D/g, "");
    if (cleaned.length === 10) return `521${cleaned}`;
    return cleaned;
  };

  return (
    <div className="overflow-hidden border border-[#E5E5E5] bg-white shadow-xs">
      {/* Encabezado */}
      <div className="grid grid-cols-[2fr_1.3fr_1.1fr_1.1fr_90px_130px] items-center border-b border-[#E5E5E5] bg-[#FAFAFA] px-6 py-4 text-xs font-bold uppercase tracking-[0.16em] text-[#777777]">
        <div>Proveedor / Razón Social</div>
        <div>Contacto Directo</div>
        <div>Giro / Categoría</div>
        <div>Crédito y Saldo</div>
        <div className="text-center">Estado</div>
        <div className="text-right">Acciones</div>
      </div>

      {/* Filas */}
      <div className="divide-y divide-[#EEEEEE]">
        {proveedores.map((proveedor) => {
          const initial = proveedor.nombre?.charAt(0).toUpperCase() || "P";
          const waNum = formatWhatsapp(proveedor.whatsapp || proveedor.telefono);
          const hasCredit = (proveedor.diasCredito || 0) > 0;
          const saldo = Number(proveedor.saldoPendiente || 0);

          return (
            <div
              key={proveedor.id}
              onClick={() => onSelectProveedor?.(proveedor)}
              className="group grid w-full grid-cols-[2fr_1.3fr_1.1fr_1.1fr_90px_130px] items-center px-6 py-4 text-left transition-colors hover:bg-[#F9FAFB] cursor-pointer"
            >
              {/* Columna 1: Proveedor y RFC */}
              <div className="flex items-center gap-3.5 pr-2 min-w-0">
                <div className="flex h-10 w-10 flex-none items-center justify-center border border-black bg-black font-bold text-white text-sm group-hover:bg-[#D8A814] group-hover:border-[#D8A814] group-hover:text-black transition-colors">
                  {initial}
                </div>

                <div className="min-w-0">
                  <p className="font-bold text-black text-sm group-hover:text-[#D8A814] transition-colors truncate">
                    {proveedor.nombre}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {proveedor.contacto && (
                      <span className="text-xs text-[#666666] truncate">
                        {proveedor.contacto}
                      </span>
                    )}
                    {proveedor.rfc && (
                      <span className="text-[10px] font-mono uppercase bg-[#F2F2F2] px-1.5 py-0.5 text-[#555555] border border-[#E0E0E0]">
                        {proveedor.rfc}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Columna 2: Contacto Directo */}
              <div className="text-xs text-[#444444] space-y-1 pr-2">
                {proveedor.telefono && (
                  <div className="flex items-center gap-1.5">
                    <Phone size={12} className="text-[#888888] shrink-0" />
                    <a
                      href={`tel:${proveedor.telefono}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hover:text-black hover:underline"
                    >
                      {proveedor.telefono}
                    </a>
                  </div>
                )}

                {waNum && (
                  <div className="flex items-center gap-1.5">
                    <MessageCircle size={12} className="text-[#10B981] shrink-0" />
                    <a
                      href={`https://wa.me/${waNum}?text=${encodeURIComponent(`Hola ${proveedor.contacto || proveedor.nombre}, le contactamos de Inagerlis CRM para dar seguimiento a catálogo de productos y pedidos.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-emerald-700 hover:underline font-medium text-[11px]"
                    >
                      WhatsApp directo
                    </a>
                  </div>
                )}

                {proveedor.email && (
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail size={12} className="text-[#888888] shrink-0" />
                    <span className="truncate text-[#666666]">{proveedor.email}</span>
                  </div>
                )}

                {!proveedor.telefono && !waNum && !proveedor.email && (
                  <span className="text-[#999999] italic">Sin datos de contacto</span>
                )}
              </div>

              {/* Columna 3: Giro / Categoría */}
              <div>
                <span className="inline-block border border-[#E0E0E0] bg-[#F7F7F7] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#333333]">
                  {proveedor.categoria || "GENERAL"}
                </span>
                {proveedor.ciudad && (
                  <p className="text-[11px] text-[#777777] mt-1 truncate">
                    {proveedor.ciudad}{proveedor.estado ? `, ${proveedor.estado}` : ""}
                  </p>
                )}
              </div>

              {/* Columna 4: Crédito y Saldo */}
              <div className="text-xs space-y-0.5">
                <p className="font-semibold text-black">
                  {hasCredit ? `${proveedor.diasCredito} días de crédito` : "Contado"}
                </p>
                {saldo > 0 ? (
                  <p className="font-bold text-red-600">
                    Saldo: ${saldo.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </p>
                ) : (
                  <p className="text-[#777777] text-[11px]">Al corriente ($0.00)</p>
                )}
              </div>

              {/* Columna 5: Estado */}
              <div className="text-center">
                {proveedor.activo ? (
                  <span className="inline-block border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-800">
                    Activo
                  </span>
                ) : (
                  <span className="inline-block border border-[#D0D0D0] bg-[#F5F5F5] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#777777]">
                    Inactivo
                  </span>
                )}
              </div>

              {/* Columna 6: Acciones */}
              <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onSelectProveedor?.(proveedor)}
                  title="Ver detalle de proveedor"
                  className="p-1.5 text-[#555555] hover:bg-[#F0F0F0] hover:text-black border border-transparent hover:border-[#D5D5D5] transition-all cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>

                <button
                  onClick={() => onEditProveedor?.(proveedor)}
                  title="Editar proveedor"
                  className="p-1.5 text-[#555555] hover:bg-[#FFFBEB] hover:text-[#D8A814] border border-transparent hover:border-[#D8A814]/30 transition-all cursor-pointer"
                >
                  <Edit3 size={15} />
                </button>

                <button
                  onClick={() => onDeleteProveedor?.(proveedor)}
                  title="Eliminar proveedor"
                  className="p-1.5 text-[#555555] hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-200 transition-all cursor-pointer"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
