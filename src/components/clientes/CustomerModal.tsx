"use client";

import { useEffect, useState } from "react";
import { Cliente, CreateClienteInput } from "@/services/clientes";
import { Percent, Award, User, Phone, Mail, FileText, MapPin } from "lucide-react";

interface CustomerModalProps {
  open: boolean;
  onClose: () => void;
  clienteToEdit?: Cliente | null;
  onSave?: (customerData: Omit<CreateClienteInput, "organizacionId">) => Promise<void> | void;
}

export default function CustomerModal({
  open,
  onClose,
  clienteToEdit,
  onSave,
}: CustomerModalProps) {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [rfc, setRfc] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [descuento, setDescuento] = useState<number>(0);
  const [puntos, setPuntos] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (clienteToEdit) {
      setNombre(clienteToEdit.nombre || "");
      setTelefono(clienteToEdit.telefono || "");
      setEmail(clienteToEdit.email || "");
      setRfc(clienteToEdit.rfc || "");
      setLocalidad(clienteToEdit.localidad || "");
      setDescuento(Number(clienteToEdit.descuento) || 0);
      setPuntos(Number(clienteToEdit.puntos) || 0);
    } else {
      setNombre("");
      setTelefono("");
      setEmail("");
      setRfc("");
      setLocalidad("");
      setDescuento(0);
      setPuntos(0);
    }
  }, [clienteToEdit, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    setSubmitting(true);
    try {
      if (onSave) {
        await onSave({
          nombre: nombre.trim(),
          telefono: telefono.trim() || undefined,
          email: email.trim() || undefined,
          rfc: rfc.trim() || undefined,
          localidad: localidad.trim() || undefined,
          descuento: Number(descuento) || 0,
          puntos: Number(puntos) || 0,
        });
      }

      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const isEditing = Boolean(clienteToEdit);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs cursor-pointer overflow-y-auto"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-xl border border-[#D8A814] bg-white shadow-2xl overflow-hidden cursor-default my-auto"
      >
        {/* Cabecera */}
        <div className="flex items-start justify-between border-b border-[#E5E5E5] px-8 py-5 bg-[#FAFAFA]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
              CRM / Fidelización
            </p>
            <h2 className="mt-1 text-2xl font-bold text-black">
              {isEditing ? "Editar Cliente" : "Registrar Nuevo Cliente"}
            </h2>
            <p className="mt-0.5 text-xs text-[#666666]">
              {isEditing
                ? "Actualiza la información comercial y beneficios preferenciales del cliente."
                : "Podrás vincular a este cliente en el Punto de Venta para aplicar descuentos y acumular puntos."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-[#777777] hover:text-black transition-colors"
          >
            ×
          </button>
        </div>

        {/* Cuerpo del Formulario */}
        <div className="grid grid-cols-1 gap-5 px-8 py-6 md:grid-cols-2 max-h-[75vh] overflow-y-auto">
          {/* Nombre */}
          <div className="md:col-span-2">
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black">
              <User size={13} className="text-[#D8A814]" />
              Nombre Completo *
            </label>
            <input
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Juan Pérez García"
              className="h-11 w-full rounded-md border border-[#D8A814] px-3.5 text-sm text-black outline-none focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black">
              <Phone size={13} className="text-[#D8A814]" />
              Teléfono
            </label>
            <input
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej. 222 123 4567"
              className="h-11 w-full rounded-md border border-[#E5E5E5] px-3.5 text-sm text-black outline-none focus:border-[#D8A814]"
            />
          </div>

          {/* Correo Electrónico */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black">
              <Mail size={13} className="text-[#D8A814]" />
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@ejemplo.com"
              className="h-11 w-full rounded-md border border-[#E5E5E5] px-3.5 text-sm text-black outline-none focus:border-[#D8A814]"
            />
          </div>

          {/* RFC */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black">
              <FileText size={13} className="text-[#D8A814]" />
              RFC (Fiscal)
            </label>
            <input
              value={rfc}
              onChange={(e) => setRfc(e.target.value.toUpperCase())}
              placeholder="XAXX010101000"
              className="h-11 w-full rounded-md border border-[#E5E5E5] px-3.5 text-sm uppercase text-black outline-none focus:border-[#D8A814]"
            />
          </div>

          {/* Localidad / Ciudad */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black">
              <MapPin size={13} className="text-[#D8A814]" />
              Localidad / Ciudad
            </label>
            <input
              value={localidad}
              onChange={(e) => setLocalidad(e.target.value)}
              placeholder="Ej. Puebla, Tehuacán..."
              className="h-11 w-full rounded-md border border-[#E5E5E5] px-3.5 text-sm text-black outline-none focus:border-[#D8A814]"
            />
          </div>

          {/* Sección de Beneficios / Fidelización */}
          <div className="md:col-span-2 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-4 mt-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#92400E] mb-3 flex items-center gap-1.5">
              <Award size={14} />
              Beneficios Comerciales y Descuentos
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-xs font-bold text-black">
                  <Percent size={12} className="text-emerald-600" />
                  % Descuento Preferencial
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={descuento}
                    onChange={(e) => setDescuento(Number(e.target.value))}
                    placeholder="0"
                    className="h-10 w-full rounded-md border border-[#D1D5DB] bg-white pr-8 pl-3 text-sm font-bold text-black outline-none focus:border-black"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-gray-500">%</span>
                </div>
                <p className="mt-1 text-[11px] text-gray-500">
                  Se aplicará automáticamente al vincularlo a una venta en POS.
                </p>
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1 text-xs font-bold text-black">
                  <Award size={12} className="text-[#D8A814]" />
                  Puntos de Fidelidad
                </label>
                <input
                  type="number"
                  min="0"
                  value={puntos}
                  onChange={(e) => setPuntos(Number(e.target.value))}
                  placeholder="0"
                  className="h-10 w-full rounded-md border border-[#D1D5DB] bg-white px-3 text-sm font-bold text-black outline-none focus:border-black"
                />
                <p className="mt-1 text-[11px] text-gray-500">
                  Saldo actual de puntos acumulados.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 border-t border-[#E5E5E5] px-8 py-4 bg-[#FAFAFA]">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-md border border-[#CCCCCC] px-6 text-sm font-bold text-[#444444] hover:bg-[#F3F4F6] transition-colors"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="h-11 rounded-md bg-[#D8A814] px-7 text-sm font-bold text-white shadow-sm hover:bg-black transition-colors disabled:opacity-50"
          >
            {submitting ? "Guardando..." : isEditing ? "Actualizar Cliente" : "Guardar Cliente"}
          </button>
        </div>
      </form>
    </div>
  );
}