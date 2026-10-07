"use client";

import { Cliente } from "@/services/clientes";

interface CustomerStatsProps {
  clientes?: Cliente[];
}

export default function CustomerStats({ clientes = [] }: CustomerStatsProps) {
  const totalClientes = clientes.length;
  const clientesConDescuento = clientes.filter((c) => (c.descuento || 0) > 0).length;
  const clientesFrecuentes = clientes.filter((c) => (c.comprasCount || 0) > 0).length;
  const totalPuntos = clientes.reduce((acc, c) => acc + (c.puntos || 0), 0);

  const stats = [
    {
      label: "Total clientes",
      value: totalClientes.toString(),
      helper: "Registrados en la organización",
    },
    {
      label: "Con descuento",
      value: clientesConDescuento.toString(),
      helper: "Beneficio preferencial asignado",
    },
    {
      label: "Con historial de ventas",
      value: clientesFrecuentes.toString(),
      helper: "Clientes activos con compras",
    },
    {
      label: "Puntos fidelidad",
      value: totalPuntos.toLocaleString("es-MX"),
      helper: "Acumulados globalmente",
    },
  ];

  return (
    <div className="grid grid-cols-2 border border-[#E5E5E5] bg-white lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={`
            px-6 py-5
            ${
              index !== stats.length - 1
                ? "lg:border-r lg:border-[#E5E5E5]"
                : ""
            }
          `}
        >
          <p className="text-3xl font-bold text-black">
            {stat.value}
          </p>

          <p className="mt-1 text-sm font-semibold text-[#111827]">
            {stat.label}
          </p>
          <p className="mt-0.5 text-xs text-[#888888]">
            {stat.helper}
          </p>
        </div>
      ))}
    </div>
  );
}