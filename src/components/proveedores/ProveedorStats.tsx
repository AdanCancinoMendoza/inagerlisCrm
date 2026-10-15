"use client";

import { Proveedor } from "@/services/proveedores";

interface ProveedorStatsProps {
  proveedores?: Proveedor[];
}

export default function ProveedorStats({ proveedores = [] }: ProveedorStatsProps) {
  const total = proveedores.length;
  const activos = proveedores.filter((p) => p.activo).length;
  const conCredito = proveedores.filter((p) => (p.diasCredito || 0) > 0).length;
  const totalSaldo = proveedores.reduce((sum, p) => sum + Number(p.saldoPendiente || 0), 0);
  const categorias = Array.from(new Set(proveedores.map((p) => p.categoria).filter(Boolean)));

  const stats = [
    {
      label: "Total Proveedores",
      value: total.toString(),
      helper: "Empresas y distribuidores",
    },
    {
      label: "Proveedores Activos",
      value: activos.toString(),
      helper: "En catálogo de suministros",
    },
    {
      label: "Con Línea de Crédito",
      value: conCredito.toString(),
      helper: "Términos de pago aplazado",
    },
    {
      label: "Saldo por Pagar",
      value: `$${totalSaldo.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      helper: "Cuentas comerciales pendientes",
    },
  ];

  return (
    <div className="grid grid-cols-2 border border-[#E5E5E5] bg-white lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={`
            px-6 py-5
            ${index !== stats.length - 1 ? "lg:border-r lg:border-[#E5E5E5]" : ""}
          `}
        >
          <p className="text-2xl font-bold text-black tracking-tight">
            {stat.value}
          </p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-[#111827]">
            {stat.label}
          </p>
          <p className="mt-0.5 text-xs text-[#777777]">
            {stat.helper}
          </p>
        </div>
      ))}
    </div>
  );
}
