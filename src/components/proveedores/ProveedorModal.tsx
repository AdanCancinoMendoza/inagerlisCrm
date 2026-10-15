"use client";

import { useState, useEffect } from "react";
import { Proveedor, CreateProveedorInput, UpdateProveedorInput } from "@/services/proveedores";
import { X, Truck, Building, Phone, CreditCard, MapPin, FileText } from "lucide-react";

interface ProveedorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  proveedorToEdit?: Proveedor | null;
}

const CATEGORIAS_COMUNES = [
  "Alimentos y Bebidas",
  "Abarrotes y Granel",
  "Carnes y Embutidos",
  "Lácteos y Refrigerados",
  "Materia Prima",
  "Limpieza y Sanidad",
  "Empaques y Desechables",
  "Papelería y Oficina",
  "Servicios y Logística",
  "Ferretería y Mantenimiento",
  "General",
];

export default function ProveedorModal({
  isOpen,
  onClose,
  onSave,
  proveedorToEdit,
}: ProveedorModalProps) {
  const [activeTab, setActiveTab] = useState<"general" | "comercial" | "contacto">("general");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    contacto: "",
    rfc: "",
    telefono: "",
    whatsapp: "",
    email: "",
    direccion: "",
    ciudad: "",
    estado: "",
    codigoPostal: "",
    categoria: "Alimentos y Bebidas",
    diasCredito: 0,
    limiteCredito: 0,
    saldoPendiente: 0,
    banco: "",
    cuentaBancaria: "",
    clabe: "",
    notas: "",
    activo: true,
  });

  useEffect(() => {
    if (proveedorToEdit) {
      setFormData({
        nombre: proveedorToEdit.nombre || "",
        contacto: proveedorToEdit.contacto || "",
        rfc: proveedorToEdit.rfc || "",
        telefono: proveedorToEdit.telefono || "",
        whatsapp: proveedorToEdit.whatsapp || "",
        email: proveedorToEdit.email || "",
        direccion: proveedorToEdit.direccion || "",
        ciudad: proveedorToEdit.ciudad || "",
        estado: proveedorToEdit.estado || "",
        codigoPostal: proveedorToEdit.codigoPostal || "",
        categoria: proveedorToEdit.categoria || "General",
        diasCredito: proveedorToEdit.diasCredito || 0,
        limiteCredito: Number(proveedorToEdit.limiteCredito || 0),
        saldoPendiente: Number(proveedorToEdit.saldoPendiente || 0),
        banco: proveedorToEdit.banco || "",
        cuentaBancaria: proveedorToEdit.cuentaBancaria || "",
        clabe: proveedorToEdit.clabe || "",
        notas: proveedorToEdit.notas || "",
        activo: proveedorToEdit.activo ?? true,
      });
    } else {
      setFormData({
        nombre: "",
        contacto: "",
        rfc: "",
        telefono: "",
        whatsapp: "",
        email: "",
        direccion: "",
        ciudad: "",
        estado: "",
        codigoPostal: "",
        categoria: "Alimentos y Bebidas",
        diasCredito: 0,
        limiteCredito: 0,
        saldoPendiente: 0,
        banco: "",
        cuentaBancaria: "",
        clabe: "",
        notas: "",
        activo: true,
      });
    }
    setActiveTab("general");
    setError(null);
  }, [proveedorToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setError("La razón social o nombre comercial del proveedor es obligatoria");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave({
        ...formData,
        diasCredito: Number(formData.diasCredito) || 0,
        limiteCredito: Number(formData.limiteCredito) || 0,
        saldoPendiente: Number(formData.saldoPendiente) || 0,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al guardar proveedor");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="flex flex-col w-full max-w-2xl bg-white border border-[#222222] shadow-2xl max-h-[90vh]">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-[#E5E5E5] bg-[#050505] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center border border-[#D8A814] bg-black text-[#D8A814]">
              <Truck size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.18em]">
                {proveedorToEdit ? "Editar Proveedor" : "Nuevo Proveedor"}
              </h2>
              <p className="text-[11px] text-[#AAAAAA]">
                Catálogo de proveedores y condiciones de compra Inagerlis
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

        {/* Pestañas de Navegación */}
        <div className="flex border-b border-[#E5E5E5] bg-[#FAFAFA] px-6 text-xs font-bold uppercase tracking-[0.14em]">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === "general"
                ? "border-[#D8A814] text-black bg-white"
                : "border-transparent text-[#777777] hover:text-black"
            }`}
          >
            Datos Generales
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("contacto")}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === "contacto"
                ? "border-[#D8A814] text-black bg-white"
                : "border-transparent text-[#777777] hover:text-black"
            }`}
          >
            Contacto y Ubicación
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("comercial")}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === "comercial"
                ? "border-[#D8A814] text-black bg-white"
                : "border-transparent text-[#777777] hover:text-black"
            }`}
          >
            Crédito y Bancos
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="border border-red-300 bg-red-50 p-3 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          {/* TAB 1: GENERAL */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#333333] mb-1">
                  Razón Social / Nombre Comercial *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Distribuidora Central de Harinas S.A. de C.V."
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full border border-[#D5D5D5] bg-white px-3 py-2 text-sm text-black focus:border-[#D8A814] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#333333] mb-1">
                    Persona de Contacto / Asesor
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Lic. Fernando Martínez"
                    value={formData.contacto}
                    onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                    className="w-full border border-[#D5D5D5] bg-white px-3 py-2 text-sm text-black focus:border-[#D8A814] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#333333] mb-1">
                    RFC Fiscal
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. DCH980415XYZ"
                    value={formData.rfc}
                    onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
                    className="w-full border border-[#D5D5D5] bg-white px-3 py-2 text-sm font-mono uppercase text-black focus:border-[#D8A814] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#333333] mb-1">
                  Giro Comercial / Categoría
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="flex-1 border border-[#D5D5D5] bg-white px-3 py-2 text-sm text-black focus:border-[#D8A814] focus:outline-hidden"
                  >
                    {CATEGORIAS_COMUNES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#333333] mb-1">
                  Notas de Entrega / Horarios de Recepción
                </label>
                <textarea
                  rows={3}
                  placeholder="Ej. Entregas los días martes y jueves antes de las 11:00 am. Solicitar factura con 48 hrs de anticipación."
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  className="w-full border border-[#D5D5D5] bg-white px-3 py-2 text-sm text-black focus:border-[#D8A814] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="prov-activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="h-4 w-4 border-[#D5D5D5] text-[#D8A814] focus:ring-0 accent-black cursor-pointer"
                />
                <label htmlFor="prov-activo" className="text-xs font-bold uppercase tracking-[0.12em] text-[#222222] cursor-pointer">
                  Proveedor Activo en Catálogo
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: CONTACTO Y UBICACIÓN */}
          {activeTab === "contacto" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#333333] mb-1">
                    Teléfono Directo / Oficina
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej. 555-123-4567"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full border border-[#D5D5D5] bg-white px-3 py-2 text-sm text-black focus:border-[#D8A814] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#333333] mb-1">
                    WhatsApp para Pedidos
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej. 9611234567 (10 dígitos)"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full border border-[#D5D5D5] bg-white px-3 py-2 text-sm text-black focus:border-[#D8A814] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#333333] mb-1">
                  Correo Electrónico (Facturación / Pedidos)
                </label>
                <input
                  type="email"
                  placeholder="Ej. ventas@distribuidoraharinas.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-[#D5D5D5] bg-white px-3 py-2 text-sm text-black focus:border-[#D8A814] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#333333] mb-1">
                  Dirección / Domicilio
                </label>
                <input
                  type="text"
                  placeholder="Ej. Av. Central No. 450, Col. Industrial"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full border border-[#D5D5D5] bg-white px-3 py-2 text-sm text-black focus:border-[#D8A814] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#333333] mb-1">
                    Ciudad / Municipio
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Tuxtla Gutiérrez"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    className="w-full border border-[#D5D5D5] bg-white px-3 py-2 text-sm text-black focus:border-[#D8A814] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#333333] mb-1">
                    Estado
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Chiapas"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full border border-[#D5D5D5] bg-white px-3 py-2 text-sm text-black focus:border-[#D8A814] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#333333] mb-1">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 29000"
                    value={formData.codigoPostal}
                    onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
                    className="w-full border border-[#D5D5D5] bg-white px-3 py-2 text-sm text-black focus:border-[#D8A814] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CRÉDITO Y BANCOS */}
          {activeTab === "comercial" && (
            <div className="space-y-4">
              <div className="border border-[#E5E5E5] bg-[#FBFBFB] p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-black flex items-center gap-2">
                  <CreditCard size={15} className="text-[#D8A814]" />
                  Términos Comerciales de Crédito
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#444444] mb-1">
                      Días de Crédito
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="180"
                      placeholder="0 = Contado"
                      value={formData.diasCredito}
                      onChange={(e) => setFormData({ ...formData, diasCredito: parseInt(e.target.value) || 0 })}
                      className="w-full border border-[#D5D5D5] bg-white px-3 py-2 text-sm text-black focus:border-[#D8A814] focus:outline-hidden"
                    />
                    <span className="text-[10px] text-[#777777]">0 = Contado inmediato</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#444444] mb-1">
                      Límite de Crédito ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.limiteCredito}
                      onChange={(e) => setFormData({ ...formData, limiteCredito: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-[#D5D5D5] bg-white px-3 py-2 text-sm text-black focus:border-[#D8A814] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#444444] mb-1">
                      Saldo Actual Pendiente ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.saldoPendiente}
                      onChange={(e) => setFormData({ ...formData, saldoPendiente: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-[#D5D5D5] bg-white px-3 py-2 text-sm text-black focus:border-[#D8A814] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="border border-[#E5E5E5] bg-[#FBFBFB] p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-black flex items-center gap-2">
                  <Building size={15} className="text-[#D8A814]" />
                  Datos de Pago / Transferencia
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#444444] mb-1">
                      Banco
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. BBVA, Banorte, Santander"
                      value={formData.banco}
                      onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                      className="w-full border border-[#D5D5D5] bg-white px-3 py-2 text-sm text-black focus:border-[#D8A814] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#444444] mb-1">
                      Cuenta / Tarjeta
                    </label>
                    <input
                      type="text"
                      placeholder="Número de cuenta"
                      value={formData.cuentaBancaria}
                      onChange={(e) => setFormData({ ...formData, cuentaBancaria: e.target.value })}
                      className="w-full border border-[#D5D5D5] bg-white px-3 py-2 text-sm font-mono text-black focus:border-[#D8A814] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#444444] mb-1">
                      CLABE Interbancaria (18 d.)
                    </label>
                    <input
                      type="text"
                      maxLength={18}
                      placeholder="012345678901234567"
                      value={formData.clabe}
                      onChange={(e) => setFormData({ ...formData, clabe: e.target.value.replace(/\D/g, "") })}
                      className="w-full border border-[#D5D5D5] bg-white px-3 py-2 text-sm font-mono text-black focus:border-[#D8A814] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E5E5]">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="border border-[#D5D5D5] bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[#333333] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="border border-black bg-black px-6 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white hover:bg-[#D8A814] hover:border-[#D8A814] hover:text-black transition-colors cursor-pointer"
            >
              {saving ? "Guardando..." : proveedorToEdit ? "Actualizar Proveedor" : "Registrar Proveedor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
