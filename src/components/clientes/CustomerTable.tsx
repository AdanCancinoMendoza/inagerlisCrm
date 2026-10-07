"use client";

import { Cliente } from "@/services/clientes";
import { Percent, Award, ShoppingBag, ChevronRight, Edit3, Trash2 } from "lucide-react";

interface CustomerTableProps {
  customers: Cliente[];
  onSelectCustomer?: (customer: Cliente) => void;
  onEditCustomer?: (customer: Cliente) => void;
  onDeleteCustomer?: (customer: Cliente) => void;
}

export default function CustomerTable({
  customers,
  onSelectCustomer,
  onEditCustomer,
  onDeleteCustomer,
}: CustomerTableProps) {
  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[260px] border border-[#E5E5E5] bg-white p-8 text-center rounded-xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFFBEB] text-[#D8A814] mb-3">
          <ShoppingBag size={26} />
        </div>
        <p className="font-bold text-black text-base">No hay clientes registrados todavía</p>
        <p className="mt-1 max-w-sm text-xs text-[#888888]">
          Haz clic en <span className="font-semibold text-black">"+ Nuevo cliente"</span> para registrar a tus clientes, asignar descuentos preferenciales y acumular puntos.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-[#E5E5E5] bg-white shadow-xs rounded-xl">
      {/* Encabezado de la tabla */}
      <div className="grid grid-cols-[2fr_1.2fr_1fr_1.2fr_1fr_180px] items-center border-b border-[#E5E5E5] bg-[#FAFAFA] px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#777777]">
        <div>Cliente y Beneficios</div>
        <div>Contacto</div>
        <div>RFC</div>
        <div>Historial de Ventas</div>
        <div className="text-right pr-4">Fidelidad</div>
        <div className="text-right">Acciones</div>
      </div>

      {/* Filas de clientes */}
      <div className="divide-y divide-[#EEEEEE]">
        {customers.map((customer) => {
          const initial = customer.nombre?.charAt(0).toUpperCase() || "C";
          const tieneDescuento = (customer.descuento || 0) > 0;
          const compras = customer.comprasCount || 0;
          const gastado = customer.totalGastado || 0;

          return (
            <div
              key={customer.id}
              onClick={() => onSelectCustomer?.(customer)}
              className="group grid w-full grid-cols-[2fr_1.2fr_1fr_1.2fr_1fr_180px] items-center px-6 py-4 text-left transition-colors hover:bg-[#F9FAFB] cursor-pointer"
            >
              {/* Columna 1: Cliente & Beneficios */}
              <div className="flex items-center gap-3.5 pr-2 min-w-0">
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-black font-bold text-white text-sm shadow-xs group-hover:bg-[#D8A814] transition-colors">
                  {initial}
                </div>

                <div className="min-w-0">
                  <p className="font-bold text-black text-sm group-hover:text-[#D8A814] transition-colors truncate">
                    {customer.nombre}
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    {tieneDescuento && (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        <Percent size={10} />
                        {customer.descuento}% desc.
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 rounded bg-[#FFFBEB] px-2 py-0.5 text-[10px] font-bold text-[#B45309] border border-[#FDE68A]">
                      <Award size={10} />
                      {customer.puntos || 0} pts
                    </span>
                  </div>
                </div>
              </div>

              {/* Columna 2: Contacto */}
              <div className="text-xs text-[#555555] pr-2">
                <p className="font-medium text-black">{customer.telefono || "Sin teléfono"}</p>
                <p className="mt-0.5 text-[#888888] truncate">{customer.localidad || "Sin localidad"}</p>
              </div>

              {/* Columna 3: RFC */}
              <div className="text-xs font-mono text-[#555555]">
                {customer.rfc ? (
                  <span className="rounded bg-[#F3F4F6] px-2 py-0.5 font-semibold text-black">
                    {customer.rfc}
                  </span>
                ) : (
                  <span className="text-[#AAAAAA]">—</span>
                )}
              </div>

              {/* Columna 4: Historial de Ventas */}
              <div className="text-xs pr-2">
                <div className="flex items-center gap-1.5 font-bold text-black">
                  <ShoppingBag size={13} className="text-[#D8A814]" />
                  <span>
                    {compras} {compras === 1 ? "venta" : "ventas"}
                  </span>
                </div>
                <p className="mt-0.5 text-[#777777]">
                  Total:{" "}
                  <span className="font-semibold text-black">
                    ${gastado.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </span>
                </p>
              </div>

              {/* Columna 5: Fidelidad */}
              <div className="text-right text-xs pr-4">
                <span className="font-bold text-[#D8A814] text-sm">
                  {customer.puntos || 0}
                </span>
                <span className="text-[11px] text-[#888888] block">puntos</span>
              </div>

              {/* Columna 6: Acciones (Editar, Eliminar) */}
              <div
                className="flex items-center justify-end gap-2 text-right"
                onClick={(e) => e.stopPropagation()}
              >
                {onEditCustomer && (
                  <button
                    type="button"
                    onClick={() => onEditCustomer(customer)}
                    title="Editar cliente"
                    className="inline-flex items-center gap-1 rounded-lg border border-[#D8A814] bg-white px-2.5 py-1.5 text-xs font-bold text-black hover:bg-[#D8A814] hover:text-white transition-colors shadow-2xs"
                  >
                    <Edit3 size={13} />
                    Editar
                  </button>
                )}

                {onDeleteCustomer && (
                  <button
                    type="button"
                    onClick={() => onDeleteCustomer(customer)}
                    title="Eliminar cliente"
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-600 hover:text-white transition-colors shadow-2xs"
                  >
                    <Trash2 size={13} />
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}