"use client";

import Link from "next/link";
import { Check, Clock, CalendarDays, MessageCircle, ExternalLink, User } from "lucide-react";

export interface FollowUpItem {
  id: string;
  title: string;
  description?: string | null;
  tipo?: "PEDIDO" | "RECORDATORIO" | "NOTA" | string;
  fecha: string; // YYYY-MM-DD
  hora?: string | null;
  monto?: number | string | null;
  clienteNombre?: string | null;
  telefono?: string | null;
  prioridad?: "BAJA" | "MEDIA" | "ALTA" | "URGENTE" | string;
  estado?: string;
  urgent?: boolean;
  proximidadLabel?: string;
  esHoy?: boolean;
  esAtrasado?: boolean;
}

interface PendingFollowUpsProps {
  followUps?: FollowUpItem[];
  onToggleCompletado?: (id: string) => void;
}

export default function PendingFollowUps({
  followUps = [],
  onToggleCompletado,
}: PendingFollowUpsProps) {
  return (
    <section className="border border-[#E2E2E2] bg-white p-7 shadow-xs">
      {/* Header Corporativo Inagerlis */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
            Recordatorios y Agenda
          </p>

          <h2 className="mt-1 text-xl font-bold text-black">
            Próximos en Agenda
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex h-8 min-w-8 items-center justify-center bg-[#050505] px-2.5 text-xs font-bold text-white">
            {followUps.length}
          </div>

          <Link
            href="/calendario"
            className="flex items-center gap-1.5 border border-[#CCCCCC] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:border-black hover:bg-[#FAFAFA]"
          >
            <CalendarDays size={13} className="text-[#D8A814]" />
            <span>Calendario</span>
          </Link>
        </div>
      </div>

      {/* Lista de Recordatorios Próximos */}
      {followUps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-[#EAEAEA] bg-[#FAFAFA] p-6">
          <div className="flex h-10 w-10 items-center justify-center border border-[#DDDDDD] bg-white text-[#888888]">
            <Check size={18} strokeWidth={2.2} />
          </div>
          <p className="mt-3 text-sm font-bold text-black uppercase tracking-wider">
            Sin recordatorios pendientes
          </p>
          <p className="mt-1 text-xs text-[#777777] max-w-sm">
            Todos tus pedidos y notas programadas están al corriente. Puedes agendar nuevos compromisos desde el calendario.
          </p>
          <Link
            href="/calendario"
            className="mt-4 inline-flex items-center gap-1.5 border border-black bg-black px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#D8A814] hover:bg-[#1A1A1A] transition-colors"
          >
            <span>+ Agendar en Calendario</span>
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-[#EEEEEE]">
          {followUps.map((item) => {
            const esPedido = item.tipo === "PEDIDO";
            const esUrgente = item.prioridad === "URGENTE" || item.urgent;
            const esAlta = item.prioridad === "ALTA";

            // WhatsApp link fallback si hay teléfono
            const telLimpio = item.telefono?.replace(/\D/g, "") || "";
            const tieneTelefono = telLimpio.length >= 10;
            const waHref = tieneTelefono
              ? `https://api.whatsapp.com/send?phone=${telLimpio.startsWith("52") ? telLimpio : `52${telLimpio}`}&text=${encodeURIComponent(
                  `Hola${item.clienteNombre ? ` ${item.clienteNombre}` : ""}, te escribimos de Inagerlis respecto a: ${item.title}.`
                )}`
              : null;

            return (
              <div
                key={item.id}
                className="flex items-start gap-3.5 py-4 first:pt-1 last:pb-1 group hover:bg-[#FDFDFD] transition-colors"
              >
                {/* Indicador de Prioridad Rectangular (Regla 2: Sin rounded-full) */}
                <div
                  className={`mt-1.5 h-3 w-1.5 flex-none ${
                    esUrgente
                      ? "bg-red-600"
                      : esAlta
                      ? "bg-[#D8A814]"
                      : "bg-[#222222]"
                  }`}
                  title={`Prioridad: ${item.prioridad || "MEDIA"}`}
                />

                {/* Contenido Principal */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Badge de Proximidad */}
                    <span
                      className={`px-1.5 py-0.5 border text-[9px] font-bold uppercase tracking-wider ${
                        item.esAtrasado
                          ? "border-red-300 bg-red-50 text-red-700"
                          : item.esHoy
                          ? "border-[#D8A814] bg-[#FFFBF0] text-[#937107]"
                          : "border-[#DDDDDD] bg-[#F7F7F7] text-black"
                      }`}
                    >
                      {item.proximidadLabel || (item.esHoy ? "Hoy" : item.fecha)}
                    </span>

                    {/* Badge de Tipo */}
                    <span
                      className={`px-1.5 py-0.5 border text-[9px] font-bold uppercase tracking-wider ${
                        esPedido
                          ? "border-black bg-black text-white"
                          : "border-[#D8A814] bg-white text-[#937107]"
                      }`}
                    >
                      {esPedido ? "Pedido" : "Recordatorio"}
                    </span>

                    {item.monto && (
                      <span className="font-mono text-xs font-bold text-black ml-auto">
                        ${Number(item.monto).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>

                  {/* Título */}
                  <p className="font-bold text-sm text-black leading-snug">
                    {item.title}
                  </p>

                  {/* Cliente o Descripción */}
                  {item.clienteNombre && (
                    <p className="text-xs text-[#555555] flex items-center gap-1">
                      <User size={11} className="text-[#888888]" />
                      <span>Cliente: <strong className="text-black">{item.clienteNombre}</strong></span>
                    </p>
                  )}

                  {item.description && (
                    <p className="text-xs text-[#777777] line-clamp-1">
                      {item.description}
                    </p>
                  )}

                  {/* Fecha y Hora Opcional */}
                  <div className="flex items-center gap-2 text-[11px] text-[#777777] pt-0.5">
                    <Clock size={11} className="text-[#888888]" />
                    <span className="font-mono">
                      {item.fecha} {item.hora ? `• ${item.hora}` : "• Todo el día"}
                    </span>
                  </div>
                </div>

                {/* Acciones Rápidas */}
                <div className="flex items-center gap-1.5 self-center shrink-0">
                  {/* WhatsApp directo si tiene teléfono */}
                  {waHref && (
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Abrir WhatsApp para este contacto"
                      className="flex h-7 w-7 items-center justify-center border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors"
                    >
                      <MessageCircle size={13} />
                    </a>
                  )}

                  {/* Marcar Completado Rápido */}
                  {onToggleCompletado && (
                    <button
                      type="button"
                      onClick={() => onToggleCompletado(item.id)}
                      title="Marcar como completado"
                      className="flex h-7 w-7 items-center justify-center border border-[#DDDDDD] bg-white text-[#666666] hover:border-black hover:bg-black hover:text-[#D8A814] transition-colors cursor-pointer"
                    >
                      <Check size={13} strokeWidth={2.2} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}