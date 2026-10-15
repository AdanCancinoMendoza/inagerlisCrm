"use client";

import { useState, useId } from "react";
import Link from "next/link";
import {
  Lock,
  Unlock,
  TrendingUp,
  Receipt,
  Wallet,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  BarChart3,
  LineChart as LineChartIcon,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { ResumenDiaVentasYCortes } from "@/services/cajaService";

interface VentasCortesDiaChartProps {
  resumen: ResumenDiaVentasYCortes | null;
  loading?: boolean;
  onOpenCorteModal?: () => void;
}

type ChartView = "barras" | "acumulado" | "cortes";

export default function VentasCortesDiaChart({
  resumen,
  loading = false,
  onOpenCorteModal,
}: VentasCortesDiaChartProps) {
  const [view, setView] = useState<ChartView>("barras");
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  const [selectedCorte, setSelectedCorte] = useState<any | null>(null);
  const chartId = useId();

  const money = (val: number) =>
    `$${val.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const timeline = resumen?.timelineHoras || [];
  const cortes = resumen?.cortes || [];

  // Cálculos para la gráfica SVG
  const maxVentasHora = Math.max(
    100,
    ...timeline.map((t) => t.ventas)
  );

  const maxAcumulado = Math.max(
    100,
    ...timeline.map((t) => t.acumulado)
  );

  // Dimensiones del canvas SVG
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingLeft = 60;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartInnerWidth = svgWidth - paddingLeft - paddingRight;
  const chartInnerHeight = svgHeight - paddingTop - paddingBottom;

  const barWidth = timeline.length > 0
    ? Math.max(12, Math.min(32, (chartInnerWidth / timeline.length) * 0.6))
    : 20;

  // Puntos para la línea acumulada
  const pointsAcumulado = timeline.map((item, idx) => {
    const x = paddingLeft + (idx / Math.max(1, timeline.length - 1)) * chartInnerWidth;
    const y = paddingTop + chartInnerHeight - (item.acumulado / maxAcumulado) * chartInnerHeight;
    return { x, y, item };
  });

  const pathD = pointsAcumulado.length > 0
    ? `M ${pointsAcumulado[0].x} ${pointsAcumulado[0].y} ` +
      pointsAcumulado.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ")
    : "";

  const areaD = pointsAcumulado.length > 0
    ? `${pathD} L ${pointsAcumulado[pointsAcumulado.length - 1].x} ${paddingTop + chartInnerHeight} L ${pointsAcumulado[0].x} ${paddingTop + chartInnerHeight} Z`
    : "";

  return (
    <section className="border border-[#E2E2E2] bg-white p-6 md:p-8">
      {/* 1. Header con Títulos y Controles */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#F0F0F0] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-[#D8A814] shrink-0" />
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
              Control en Tiempo Real · Hoy
            </p>
          </div>

          <h2 className="mt-1 text-2xl font-bold text-black">
            Ventas del Día y Cortes de Caja
          </h2>
          <p className="mt-1 text-xs text-[#777777]">
            Monitoreo horario de transacciones con registro de cortes de turno y arqueos de caja realizados.
          </p>
        </div>

        {/* Pestañas de Vista y Enlace a Caja */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex border border-[#E0E0E0] bg-[#FAFAFA] p-0.5">
            <button
              type="button"
              onClick={() => setView("barras")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                view === "barras"
                  ? "bg-black text-[#D8A814]"
                  : "text-[#666666] hover:text-black"
              }`}
            >
              <BarChart3 size={13} />
              <span>Por Horas</span>
            </button>

            <button
              type="button"
              onClick={() => setView("acumulado")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                view === "acumulado"
                  ? "bg-black text-[#D8A814]"
                  : "text-[#666666] hover:text-black"
              }`}
            >
              <LineChartIcon size={13} />
              <span>Acumulado</span>
            </button>

            <button
              type="button"
              onClick={() => setView("cortes")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                view === "cortes"
                  ? "bg-black text-[#D8A814]"
                  : "text-[#666666] hover:text-black"
              }`}
            >
              <Lock size={13} />
              <span>Cortes ({cortes.length})</span>
            </button>
          </div>

          <Link
            href="/caja"
            className="inline-flex items-center gap-1.5 border border-[#CCCCCC] bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-black hover:border-black hover:bg-[#FAFAFA] transition-colors cursor-pointer"
          >
            <span>Ir a Caja</span>
            <ArrowRight size={13} className="text-[#D8A814]" />
          </Link>
        </div>
      </div>

      {/* 2. Resumen Ejecutivo de Métricas Clave */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Ventas Hoy */}
        <div className="border border-[#E5E5E5] bg-[#FAFAFA] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
            Ventas Totales Hoy
          </p>
          <p className="mt-1.5 text-xl font-bold text-black font-mono">
            {money(resumen?.totalDia || 0)}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#666666]">
            <Receipt size={12} className="text-[#D8A814]" />
            <span>{resumen?.ticketsDia || 0} tickets emitidos</span>
          </div>
        </div>

        {/* Total Cortado en Turnos */}
        <div className="border border-[#E5E5E5] bg-[#FAFAFA] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
            Total Cortado en Turnos
          </p>
          <p className="mt-1.5 text-xl font-bold text-black font-mono">
            {money(resumen?.totalCortado || 0)}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#666666]">
            <Lock size={12} className="text-black" />
            <span>{cortes.length} {cortes.length === 1 ? "corte realizado" : "cortes realizados"}</span>
          </div>
        </div>

        {/* Ventas Turno Activo (Pendiente de corte) */}
        <div className="border border-[#E5E5E5] bg-[#FAFAFA] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
            Turno Activo (En Caja)
          </p>
          <p className="mt-1.5 text-xl font-bold text-[#D8A814] font-mono">
            {money(resumen?.totalTurnoActivo || 0)}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#666666]">
            <Unlock size={12} className="text-[#D8A814]" />
            <span>Pendiente de corte</span>
          </div>
        </div>

        {/* Métodos de Pago */}
        <div className="border border-[#E5E5E5] bg-[#FAFAFA] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
            Desglose de Cobros
          </p>
          <div className="mt-1.5 space-y-0.5 text-[11px] font-mono text-black">
            <div className="flex justify-between">
              <span className="text-[#777777]">Efectivo:</span>
              <span className="font-bold">{money(resumen?.metodosPago.efectivo || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#777777]">Tarjeta:</span>
              <span className="font-bold">{money(resumen?.metodosPago.tarjeta || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Área Visual de la Gráfica */}
      {(view === "barras" || view === "acumulado") && (
        <div className="mt-6 border border-[#E5E5E5] bg-white p-4">
          <div className="flex items-center justify-between mb-3 text-xs text-[#777777]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 bg-black" />
                <span className="font-bold text-black text-[11px] uppercase tracking-wider">
                  {view === "barras" ? "Ventas por Hora ($ MXN)" : "Ventas Acumuladas"}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 bg-[#D8A814]" />
                <span className="font-bold text-black text-[11px] uppercase tracking-wider">
                  Hito de Corte de Caja (🔒)
                </span>
              </span>
            </div>

            <span className="text-[10px] font-mono text-[#999999]">
              {timeline.length > 0 ? `${timeline[0].label} - ${timeline[timeline.length - 1].label}` : "Sin actividad"}
            </span>
          </div>

          {/* Renderizado de la Gráfica SVG Responsive */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto min-w-[650px] select-none"
            >
              <defs>
                <linearGradient id={`${chartId}-area-grad`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D8A814" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#D8A814" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Líneas Guía Horizontales */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                const y = paddingTop + chartInnerHeight * (1 - pct);
                const currentMax = view === "barras" ? maxVentasHora : maxAcumulado;
                const valueLabel = pct * currentMax;

                return (
                  <g key={pct}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={svgWidth - paddingRight}
                      y2={y}
                      stroke="#F0F0F0"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                    />
                    <text
                      x={paddingLeft - 8}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9"
                      fill="#999999"
                      fontFamily="monospace"
                    >
                      ${valueLabel >= 1000 ? `${(valueLabel / 1000).toFixed(1)}k` : valueLabel.toFixed(0)}
                    </text>
                  </g>
                );
              })}

              {/* VISTA 1: BARRAS POR HORA */}
              {view === "barras" &&
                timeline.map((slot, idx) => {
                  const xCenter = paddingLeft + (idx / Math.max(1, timeline.length - 1)) * chartInnerWidth;
                  const x = xCenter - barWidth / 2;
                  const barHeight = maxVentasHora > 0
                    ? (slot.ventas / maxVentasHora) * chartInnerHeight
                    : 0;
                  const y = paddingTop + chartInnerHeight - barHeight;
                  const isHovered = hoveredHour === slot.hora;

                  return (
                    <g
                      key={slot.hora}
                      onMouseEnter={() => setHoveredHour(slot.hora)}
                      onMouseLeave={() => setHoveredHour(null)}
                      className="cursor-pointer"
                    >
                      {/* Barra de fondo interactiva transparente para fácil hover */}
                      <rect
                        x={xCenter - (chartInnerWidth / timeline.length) / 2}
                        y={paddingTop}
                        width={chartInnerWidth / timeline.length}
                        height={chartInnerHeight}
                        fill={isHovered ? "rgba(0,0,0,0.03)" : "transparent"}
                      />

                      {/* Barra de Ventas */}
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={Math.max(2, barHeight)}
                        fill={isHovered ? "#000000" : slot.ventas > 0 ? "#1A1A1A" : "#EEEEEE"}
                        className="transition-colors duration-150"
                      />

                      {/* Acento dorado superior si tiene ventas */}
                      {slot.ventas > 0 && (
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={2.5}
                          fill="#D8A814"
                        />
                      )}

                      {/* Etiqueta de Hora en el eje X */}
                      <text
                        x={xCenter}
                        y={paddingTop + chartInnerHeight + 18}
                        textAnchor="middle"
                        fontSize="9"
                        fill={isHovered ? "#000000" : "#888888"}
                        fontWeight={isHovered ? "bold" : "normal"}
                        fontFamily="monospace"
                      >
                        {slot.label}
                      </text>

                      {/* Marcador de Hito: Corte de Caja en esta hora */}
                      {slot.tieneCorte && (
                        <g>
                          {/* Línea vertical de corte */}
                          <line
                            x1={xCenter}
                            y1={paddingTop - 10}
                            x2={xCenter}
                            y2={paddingTop + chartInnerHeight}
                            stroke="#D8A814"
                            strokeWidth={1.5}
                            strokeDasharray="2 2"
                          />

                          {/* Pin rectangular de corte */}
                          <rect
                            x={xCenter - 14}
                            y={paddingTop - 20}
                            width={28}
                            height={16}
                            fill="#000000"
                            stroke="#D8A814"
                            strokeWidth={1}
                          />
                          <text
                            x={xCenter}
                            y={paddingTop - 9}
                            textAnchor="middle"
                            fontSize="8"
                            fill="#D8A814"
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            🔒 {slot.cortes.length}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

              {/* VISTA 2: LÍNEA ACUMULADA */}
              {view === "acumulado" && (
                <g>
                  {/* Relleno degradado bajo la curva */}
                  {areaD && (
                    <path
                      d={areaD}
                      fill={`url(#${chartId}-area-grad)`}
                    />
                  )}

                  {/* Línea de tendencia */}
                  {pathD && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#D8A814"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                    />
                  )}

                  {/* Nodos de cada hora */}
                  {pointsAcumulado.map(({ x, y, item }) => {
                    const isHovered = hoveredHour === item.hora;

                    return (
                      <g
                        key={item.hora}
                        onMouseEnter={() => setHoveredHour(item.hora)}
                        onMouseLeave={() => setHoveredHour(null)}
                        className="cursor-pointer"
                      >
                        {/* Marcador de Hito de Corte */}
                        {item.tieneCorte && (
                          <line
                            x1={x}
                            y1={paddingTop - 10}
                            x2={x}
                            y2={paddingTop + chartInnerHeight}
                            stroke="#000000"
                            strokeWidth={1.5}
                            strokeDasharray="2 2"
                          />
                        )}

                        <circle
                          cx={x}
                          cy={y}
                          r={isHovered ? 5 : item.tieneCorte ? 4 : 2.5}
                          fill={item.tieneCorte ? "#D8A814" : "#000000"}
                          stroke="#FFFFFF"
                          strokeWidth={1.5}
                        />

                        {/* Etiqueta eje X */}
                        <text
                          x={x}
                          y={paddingTop + chartInnerHeight + 18}
                          textAnchor="middle"
                          fontSize="9"
                          fill={isHovered ? "#000000" : "#888888"}
                          fontWeight={isHovered ? "bold" : "normal"}
                          fontFamily="monospace"
                        >
                          {item.label}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}
            </svg>
          </div>

          {/* Tooltip Dinámico / Detalle al Pasar el Cursor */}
          {hoveredHour !== null && (() => {
            const slot = timeline.find((t) => t.hora === hoveredHour);
            if (!slot) return null;

            return (
              <div className="mt-3 p-3 border border-black bg-white flex flex-wrap items-center justify-between gap-4 animate-in fade-in duration-150">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center bg-black text-[#D8A814] font-bold font-mono text-xs">
                    {slot.label}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-black font-mono">
                      Ventas: {money(slot.ventas)}
                    </p>
                    <p className="text-[11px] text-[#666666]">
                      {slot.tickets} {slot.tickets === 1 ? "ticket emitido" : "tickets emitidos"} • Acumulado: {money(slot.acumulado)}
                    </p>
                  </div>
                </div>

                {slot.tieneCorte ? (
                  <div className="flex items-center gap-2 border border-[#D8A814] bg-[#FFFBF0] px-3 py-1.5 text-xs text-black">
                    <Lock size={13} className="text-[#D8A814]" />
                    <span className="font-bold">
                      {slot.cortes.length} corte(s) de caja en esta hora:
                    </span>
                    <span className="font-mono text-[#D8A814]">
                      {money(slot.cortes.reduce((acc, c) => acc + c.totalVentas, 0))}
                    </span>
                  </div>
                ) : (
                  <span className="text-[11px] text-[#888888]">
                    Sin corte de caja registrado en esta hora
                  </span>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* 4. Lista Detallada de Cortes de Caja de Hoy */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#D8A814]" />
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-black">
              Registro de Cortes de Caja de Hoy ({cortes.length})
            </h3>
          </div>

          <Link
            href="/caja"
            className="text-xs font-bold uppercase tracking-wider text-[#D8A814] hover:underline"
          >
            Abrir Módulo de Caja →
          </Link>
        </div>

        {cortes.length === 0 ? (
          <div className="border border-[#E5E5E5] bg-[#FAFAFA] p-6 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center border border-[#DDDDDD] bg-white text-[#777777] mb-2">
              <Unlock size={18} />
            </div>
            <p className="text-sm font-bold text-black">
              Turno en curso activo
            </p>
            <p className="text-xs text-[#777777] mt-1 max-w-md mx-auto">
              Aún no se han realizado cortes de caja el día de hoy. El saldo acumulado en caja de {money(resumen?.totalTurnoActivo || 0)} está disponible para corte o arqueo de turno.
            </p>
            <div className="mt-4 flex justify-center">
              <Link
                href="/caja"
                className="inline-flex items-center gap-2 border border-black bg-black px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition-colors"
              >
                <Lock size={13} className="text-[#D8A814]" />
                <span>Realizar Corte de Turno en Caja</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="border border-[#E5E5E5] divide-y divide-[#EEEEEE] overflow-x-auto">
            {cortes.map((corte, index) => {
              const diff = Number(corte.diferencia || 0);
              const esExacto = Math.abs(diff) < 0.01;
              const esSobrante = diff > 0.01;

              return (
                <div
                  key={corte.id || index}
                  className="p-4 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAFAFA] transition-colors"
                >
                  {/* Info del Corte */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center border border-black bg-black text-[#D8A814] shrink-0 mt-0.5">
                      <Lock size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-black">
                          Corte #{cortes.length - index} · {corte.tipo}
                        </span>
                        <span className="border border-[#DDDDDD] bg-white px-2 py-0.5 text-[10px] font-mono font-bold text-black">
                          {corte.hora}
                        </span>
                      </div>
                      <p className="text-xs text-[#666666] mt-0.5">
                        Terminal: <strong className="text-black">{corte.nombreTerminal || "Caja Principal"}</strong> • Cajero: <strong className="text-black">{corte.nombreUsuario || "Cajero en Turno"}</strong>
                      </p>
                      {corte.notas && (
                        <p className="text-[11px] text-[#777777] italic mt-1">
                          Nota: {corte.notas}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Cifras de Venta y Cuadre */}
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
                        Ventas Reportadas
                      </p>
                      <p className="text-sm font-bold text-black font-mono">
                        {money(Number(corte.totalVentas || 0))}
                      </p>
                      <span className="text-[10px] text-[#888888]">
                        Ef: {money(Number(corte.ventasEfectivo || 0))}
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
                        Efectivo Físico
                      </p>
                      <p className="text-sm font-bold text-black font-mono">
                        {money(Number(corte.efectivoContado || 0))}
                      </p>
                      <span className="text-[10px] text-[#888888]">
                        Esp: {money(Number(corte.efectivoEsperado || 0))}
                      </span>
                    </div>

                    {/* Estado del Cuadre (Borde Rectangular Inagerlis) */}
                    <div className="min-w-[120px] text-right">
                      {esExacto ? (
                        <span className="inline-flex items-center gap-1 border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                          <CheckCircle2 size={12} className="text-emerald-600" />
                          Cuadre Exacto
                        </span>
                      ) : esSobrante ? (
                        <span className="inline-flex items-center gap-1 border border-blue-300 bg-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-800">
                          Sobrante +{money(diff)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 border border-red-300 bg-red-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-red-800">
                          <AlertTriangle size={12} className="text-red-600" />
                          Faltante {money(diff)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
