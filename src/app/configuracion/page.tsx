"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { COLOR_PALETTES, useTheme } from "@/context/ThemeContext";
import { useSidebar } from "@/context/SidebarContext";
import { Check, Building2, Terminal as TerminalIcon, Plus, Loader2 } from "lucide-react";
import SuscripcionesView from "@/components/suscripciones/SuscripcionesView";
import { apiRequest } from "@/services/api";
import { getOrganizacionId, getUsuarioActual } from "@/services/auth";

export default function ConfiguracionPage() {
  const { collapsed } = useSidebar();
  const { activePalette, setPalette } = useTheme();
  const [activeTab, setActiveTab] = useState("General");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Datos reales de la Organización
  const [orgForm, setOrgForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
    rfc: "",
    razonSocial: "",
    codigoPostal: "",
    regimenFiscal: "601",
  });

  // Datos reales de Sucursales y Terminales
  const [branches, setBranches] = useState<any[]>([]);
  const [terminals, setTerminals] = useState<any[]>([]);

  // Preferencias
  const [preferencias, setPreferencias] = useState({
    ventasSinCliente: true,
    solicitarCliente: false,
    impuestosAuto: true,
    bloquearTerminalesInactivas: true,
  });

  const loadData = useCallback(async () => {
    const user = getUsuarioActual();
    const orgId = getOrganizacionId() || user?.organizacionId;

    if (!orgId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [orgRes, sucursalesRes, terminalesRes] = await Promise.allSettled([
        apiRequest<any>(`/organizaciones/${orgId}`),
        apiRequest<any[]>(`/sucursales?organizacionId=${orgId}`),
        apiRequest<any[]>(`/terminales`),
      ]);

      if (orgRes.status === "fulfilled" && orgRes.value) {
        const org = orgRes.value;
        setOrgForm({
          nombre: org.nombre || "",
          telefono: org.telefono || "",
          email: org.email || "",
          direccion: org.direccion || "",
          rfc: org.rfc || "",
          razonSocial: org.nombre || "",
          codigoPostal: "",
          regimenFiscal: "601",
        });
      }

      if (sucursalesRes.status === "fulfilled" && Array.isArray(sucursalesRes.value)) {
        setBranches(sucursalesRes.value);
      } else {
        setBranches([]);
      }

      if (terminalesRes.status === "fulfilled" && Array.isArray(terminalesRes.value)) {
        setTerminals(terminalesRes.value);
      } else {
        setTerminals([]);
      }
    } catch (err) {
      console.error("Error al cargar configuración:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = getUsuarioActual();
    const orgId = getOrganizacionId() || user?.organizacionId;
    if (!orgId) return;

    setSaving(true);
    try {
      await apiRequest(`/organizaciones/${orgId}`, {
        method: "PUT",
        body: JSON.stringify({
          nombre: orgForm.nombre,
          telefono: orgForm.telefono,
          email: orgForm.email,
          direccion: orgForm.direccion,
          rfc: orgForm.rfc,
        }),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error al actualizar organización:", err);
      alert("Error al guardar cambios de la organización.");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    "General",
    "Fiscal",
    "Sucursales",
    "Terminales",
    "Preferencias",
    "Suscripciones",
  ];

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Sidebar />

      <div className={`min-h-screen transition-all duration-300 ${collapsed ? "ml-[80px]" : "ml-[250px]"}`}>
        <Header />

        <div className="p-10">
          {/* Encabezado */}
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
              Administración
            </p>

            <h1 className="mt-2 text-3xl font-bold text-black">
              Configuración de la tienda
            </h1>

            <p className="mt-2 text-sm text-[#777777]">
              Administra la información general, fiscal, sucursales y terminales de tu organización.
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-8 flex border-b border-[#DCDCDC]">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  border-b-2 px-6 py-4
                  text-sm font-semibold
                  transition-colors
                  ${
                    activeTab === tab
                      ? "border-[#D8A814] text-[#D8A814]"
                      : "border-transparent text-[#777777] hover:text-black"
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* GENERAL */}
          {activeTab === "General" && (
            <form onSubmit={handleSaveGeneral} className="border border-[#E2E2E2] bg-white">
              <div className="border-b border-[#E5E5E5] px-8 py-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                    Información
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-black">
                    Datos generales
                  </h2>
                </div>

                {saveSuccess && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 border border-emerald-200">
                    ✓ Cambios guardados exitosamente
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-8 p-8 xl:grid-cols-[220px_1fr]">
                {/* Logo */}
                <div>
                  <p className="mb-3 text-sm font-bold text-black">
                    Logo de la tienda
                  </p>

                  <div className="flex h-40 w-40 items-center justify-center border border-[#D8A814] bg-[#FAFAFA]">
                    <span className="text-4xl font-bold text-[#D8A814]">
                      {orgForm.nombre ? orgForm.nombre.slice(0, 3).toUpperCase() : "POS"}
                    </span>
                  </div>
                </div>

                {/* Campos */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-bold text-black">
                      Nombre comercial
                    </label>

                    <input
                      value={orgForm.nombre}
                      onChange={(e) => setOrgForm({ ...orgForm, nombre: e.target.value })}
                      placeholder="Nombre de tu negocio o tienda"
                      className="h-12 w-full border border-[#D8A814] px-4 text-black outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-black">
                      Teléfono
                    </label>

                    <input
                      value={orgForm.telefono}
                      onChange={(e) => setOrgForm({ ...orgForm, telefono: e.target.value })}
                      placeholder="Teléfono de contacto"
                      className="h-12 w-full border border-[#D8A814] px-4 text-black outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-black">
                      Correo
                    </label>

                    <input
                      type="email"
                      value={orgForm.email}
                      onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })}
                      placeholder="correo@ejemplo.com"
                      className="h-12 w-full border border-[#D8A814] px-4 text-black outline-none focus:border-black"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-bold text-black">
                      Dirección principal
                    </label>

                    <input
                      value={orgForm.direccion}
                      onChange={(e) => setOrgForm({ ...orgForm, direccion: e.target.value })}
                      placeholder="Calle, número, colonia, ciudad"
                      className="h-12 w-full border border-[#D8A814] px-4 text-black outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t border-[#E5E5E5] px-8 py-5">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 h-12 bg-[#D8A814] px-7 font-bold text-white hover:bg-black transition-colors disabled:opacity-50"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  Guardar cambios
                </button>
              </div>
            </form>
          )}

          {/* FISCAL */}
          {activeTab === "Fiscal" && (
            <form onSubmit={handleSaveGeneral} className="border border-[#E2E2E2] bg-white">
              <div className="border-b border-[#E5E5E5] px-8 py-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                  Fiscal
                </p>

                <h2 className="mt-1 text-xl font-bold text-black">
                  Datos fiscales e impuestos
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-black">
                    Razón social
                  </label>

                  <input
                    value={orgForm.razonSocial || orgForm.nombre}
                    onChange={(e) => setOrgForm({ ...orgForm, razonSocial: e.target.value })}
                    placeholder="Razón social registrada"
                    className="h-12 w-full border border-[#D8A814] px-4 text-black outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-black">
                    RFC
                  </label>

                  <input
                    value={orgForm.rfc}
                    onChange={(e) => setOrgForm({ ...orgForm, rfc: e.target.value })}
                    placeholder="RFC de la empresa"
                    className="h-12 w-full border border-[#D8A814] px-4 uppercase text-black outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-[#E5E5E5] p-8">
                <p className="text-sm font-bold text-black">
                  Impuestos configurados
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="border border-[#E5E5E5] p-5">
                    <p className="text-xs uppercase text-[#888888]">
                      Impuesto principal
                    </p>

                    <p className="mt-2 text-xl font-bold text-black">
                      IVA
                    </p>
                  </div>

                  <div className="border border-[#E5E5E5] p-5">
                    <p className="text-xs uppercase text-[#888888]">
                      Porcentaje
                    </p>

                    <p className="mt-2 text-xl font-bold text-black">
                      16%
                    </p>
                  </div>

                  <div className="border border-[#D8A814] p-5">
                    <p className="text-xs uppercase text-[#888888]">
                      Estado
                    </p>

                    <p className="mt-2 font-bold text-[#D8A814]">
                      Activo
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t border-[#E5E5E5] px-8 py-5">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 h-12 bg-[#D8A814] px-7 font-bold text-white hover:bg-black transition-colors disabled:opacity-50"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  Guardar datos fiscales
                </button>
              </div>
            </form>
          )}

          {/* SUCURSALES */}
          {activeTab === "Sucursales" && (
            <section className="border border-[#E2E2E2] bg-white">
              <div className="flex items-center justify-between border-b border-[#E5E5E5] px-8 py-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                    Organización
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-black">
                    Sucursales
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-[1.5fr_1.5fr_.8fr_.8fr] bg-[#FAFAFA] px-6 py-4">
                <span className="text-xs font-bold uppercase text-[#777777]">
                  Sucursal
                </span>
                <span className="text-xs font-bold uppercase text-[#777777]">
                  Dirección
                </span>
                <span className="text-center text-xs font-bold uppercase text-[#777777]">
                  Terminales
                </span>
                <span className="text-right text-xs font-bold uppercase text-[#777777]">
                  Estado
                </span>
              </div>

              {branches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <Building2 size={38} className="text-[#CCCCCC]" />
                  <p className="mt-3 text-sm font-bold text-black">No hay sucursales registradas</p>
                  <p className="mt-1 text-xs text-[#777777]">Las sucursales asociadas a tu cuenta se sincronizarán aquí.</p>
                </div>
              ) : (
                branches.map((branch) => (
                  <div
                    key={branch.id}
                    className="grid grid-cols-[1.5fr_1.5fr_.8fr_.8fr] items-center border-t border-[#EEEEEE] px-6 py-5"
                  >
                    <p className="font-bold text-black">
                      {branch.nombre || branch.name}
                    </p>

                    <p className="text-sm text-[#555555]">
                      {branch.direccion || branch.address || "Principal"}
                    </p>

                    <p className="text-center font-bold text-black">
                      {branch.terminales?.length || 1}
                    </p>

                    <div className="text-right">
                      <span className="inline-block px-3 py-1 text-xs font-bold bg-[#D8A814] text-white">
                        Activa
                      </span>
                    </div>
                  </div>
                ))
              )}
            </section>
          )}

          {/* TERMINALES */}
          {activeTab === "Terminales" && (
            <section className="border border-[#E2E2E2] bg-white">
              <div className="flex items-center justify-between border-b border-[#E5E5E5] px-8 py-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                    Punto de venta
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-black">
                    Terminales de Cobro
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-[1.4fr_1.5fr_1fr_1fr] bg-[#FAFAFA] px-6 py-4">
                <span className="text-xs font-bold uppercase text-[#777777]">
                  Terminal
                </span>
                <span className="text-xs font-bold uppercase text-[#777777]">
                  Sucursal
                </span>
                <span className="text-xs font-bold uppercase text-[#777777]">
                  Código
                </span>
                <span className="text-right text-xs font-bold uppercase text-[#777777]">
                  Estado
                </span>
              </div>

              {terminals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <TerminalIcon size={38} className="text-[#CCCCCC]" />
                  <p className="mt-3 text-sm font-bold text-black">No hay terminales registradas</p>
                  <p className="mt-1 text-xs text-[#777777]">Las cajas de cobro POS asignadas aparecerán listadas aquí.</p>
                </div>
              ) : (
                terminals.map((terminal) => (
                  <div
                    key={terminal.id}
                    className="grid grid-cols-[1.4fr_1.5fr_1fr_1fr] items-center border-t border-[#EEEEEE] px-6 py-5"
                  >
                    <p className="font-bold text-black">
                      {terminal.nombre || terminal.name}
                    </p>

                    <p className="text-sm text-[#555555]">
                      {terminal.sucursal?.nombre || "Principal"}
                    </p>

                    <p className="text-sm font-semibold text-[#777777]">
                      {terminal.codigo || `TERM-${terminal.id.slice(0, 4)}`}
                    </p>

                    <div className="flex items-center justify-end gap-4">
                      <span
                        className={`text-xs font-bold ${
                          terminal.estado === "Abierta" || terminal.status
                            ? "text-[#D8A814]"
                            : "text-[#888888]"
                        }`}
                      >
                        {terminal.estado === "Abierta" || terminal.status ? "ABIERTA" : "CERRADA"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </section>
          )}

          {/* PREFERENCIAS */}
          {activeTab === "Preferencias" && (
            <div className="space-y-6">
              {/* Gama de Colores */}
              <section className="border border-[#E2E2E2] bg-white p-8">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                  Personalización Visual
                </p>
                <h2 className="mt-1 text-xl font-bold text-black">
                  Gama de Colores e Identidad del Sistema
                </h2>
                <p className="mt-1 text-sm text-[#777777]">
                  Selecciona la paleta de color principal que adaptará automáticamente el color del sistema entero (CRM + Punto de Venta).
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                  {COLOR_PALETTES.map((p) => {
                    const isSelected = activePalette.id === p.id;

                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPalette(p.id)}
                        className={`group relative flex flex-col items-center justify-between p-4 border text-center transition-all ${
                          isSelected
                            ? "border-2 border-black bg-white shadow-md ring-2 ring-black/10"
                            : "border-[#EEEEEE] bg-[#FAFAFA] hover:border-[#CCCCCC] hover:bg-white"
                        }`}
                      >
                        <div className="w-full rounded border border-[#E5E5E5] overflow-hidden mb-3">
                          <div
                            className="h-4 w-full flex items-center justify-end px-1"
                            style={{ backgroundColor: p.darkBg }}
                          >
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.hex }} />
                          </div>
                          <div className="h-7 w-full flex items-center justify-center p-1" style={{ backgroundColor: p.light }}>
                            <div
                              className="flex h-5 w-5 items-center justify-center rounded-full text-white font-bold text-[10px] shadow-sm"
                              style={{ backgroundColor: p.hex }}
                            >
                              {isSelected && <Check size={12} />}
                            </div>
                          </div>
                        </div>

                        <p className="text-xs font-bold text-black">{p.name}</p>
                        <span className="mt-1 text-[10px] font-mono text-[#777777] uppercase">{p.hex}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="border border-[#E2E2E2] bg-white">
                <div className="border-b border-[#E5E5E5] px-8 py-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                    Sistema
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-black">
                    Preferencias de Operación
                  </h2>
                </div>

                <div className="divide-y divide-[#EEEEEE]">
                  <div className="flex items-center justify-between px-8 py-6">
                    <div>
                      <p className="font-bold text-black">Permitir ventas a público en general sin registrar cliente</p>
                      <p className="mt-1 text-sm text-[#777777]">Permite cobrar directamente en el POS sin obligar a seleccionar un cliente.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreferencias({ ...preferencias, ventasSinCliente: !preferencias.ventasSinCliente })}
                      className={`relative h-7 w-12 transition-colors ${preferencias.ventasSinCliente ? "bg-[#D8A814]" : "bg-[#CCCCCC]"}`}
                    >
                      <span className={`absolute top-1 h-5 w-5 bg-white transition-all ${preferencias.ventasSinCliente ? "left-6" : "left-1"}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between px-8 py-6">
                    <div>
                      <p className="font-bold text-black">Aplicar desglose de impuestos automáticamente</p>
                      <p className="mt-1 text-sm text-[#777777]">Calcula IVA sobre el total de tickets y artículos en caja.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreferencias({ ...preferencias, impuestosAuto: !preferencias.impuestosAuto })}
                      className={`relative h-7 w-12 transition-colors ${preferencias.impuestosAuto ? "bg-[#D8A814]" : "bg-[#CCCCCC]"}`}
                    >
                      <span className={`absolute top-1 h-5 w-5 bg-white transition-all ${preferencias.impuestosAuto ? "left-6" : "left-1"}`} />
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* SUSCRIPCIONES */}
          {activeTab === "Suscripciones" && (
            <SuscripcionesView />
          )}
        </div>
      </div>
    </main>
  );
}