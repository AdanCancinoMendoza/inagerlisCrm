"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { COLOR_PALETTES, useTheme } from "@/context/ThemeContext";
import { useSidebar } from "@/context/SidebarContext";
import { Check } from "lucide-react";
import SuscripcionesView from "@/components/suscripciones/SuscripcionesView";

const branches = [
  {
    id: 1,
    name: "Sucursal Centro",
    city: "Puebla",
    address: "Av. Reforma 120",
    terminals: 3,
    status: "Activa",
  },
  {
    id: 2,
    name: "Sucursal Cholula",
    city: "San Pedro Cholula",
    address: "5 Norte 340",
    terminals: 2,
    status: "Activa",
  },
  {
    id: 3,
    name: "Sucursal Tehuacán",
    city: "Tehuacán",
    address: "Av. Independencia 90",
    terminals: 1,
    status: "Inactiva",
  },
];

const terminals = [
  {
    id: 1,
    name: "Caja 01",
    branch: "Sucursal Centro",
    code: "TERM-001",
    status: true,
  },
  {
    id: 2,
    name: "Caja 02",
    branch: "Sucursal Centro",
    code: "TERM-002",
    status: true,
  },
  {
    id: 3,
    name: "Caja Principal",
    branch: "Sucursal Cholula",
    code: "TERM-003",
    status: false,
  },
  {
    id: 4,
    name: "Caja 01",
    branch: "Sucursal Tehuacán",
    code: "TERM-004",
    status: false,
  },
];

export default function ConfiguracionPage() {
  const { collapsed } = useSidebar();
  const { activePalette, setPalette } = useTheme();
  const [activeTab, setActiveTab] = useState("General");

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
              Administra la información general, fiscal, sucursales y terminales
              de tu organización.
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
            <section className="border border-[#E2E2E2] bg-white">
              <div className="border-b border-[#E5E5E5] px-8 py-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                  Información
                </p>

                <h2 className="mt-1 text-xl font-bold text-black">
                  Datos generales
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-8 p-8 xl:grid-cols-[220px_1fr]">
                {/* Logo */}
                <div>
                  <p className="mb-3 text-sm font-bold text-black">
                    Logo de la tienda
                  </p>

                  <div className="flex h-40 w-40 items-center justify-center border border-[#D8A814] bg-[#FAFAFA]">
                    <span className="text-4xl font-bold text-[#D8A814]">
                      LOGO
                    </span>
                  </div>

                  <button className="mt-4 h-11 w-40 border border-black text-sm font-bold text-black hover:bg-black hover:text-white">
                    Cambiar logo
                  </button>
                </div>

                {/* Campos */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-bold text-black">
                      Nombre comercial
                    </label>

                    <input
                      defaultValue="Mi Tienda"
                      className="h-12 w-full border border-[#D8A814] px-4 text-black outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-black">
                      Teléfono
                    </label>

                    <input
                      defaultValue="222 000 0000"
                      className="h-12 w-full border border-[#D8A814] px-4 text-black outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-black">
                      Correo
                    </label>

                    <input
                      defaultValue="contacto@mitienda.com"
                      className="h-12 w-full border border-[#D8A814] px-4 text-black outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-black">
                      País
                    </label>

                    <select className="h-12 w-full border border-[#D8A814] bg-white px-4 text-black outline-none">
                      <option>México</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-black">
                      Estado
                    </label>

                    <input
                      defaultValue="Puebla"
                      className="h-12 w-full border border-[#D8A814] px-4 text-black outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-black">
                      Municipio / Localidad
                    </label>

                    <input
                      defaultValue="Puebla"
                      className="h-12 w-full border border-[#D8A814] px-4 text-black outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-black">
                      Código postal
                    </label>

                    <input
                      defaultValue="72000"
                      className="h-12 w-full border border-[#D8A814] px-4 text-black outline-none focus:border-black"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-bold text-black">
                      Dirección
                    </label>

                    <input
                      defaultValue="Av. Reforma 120, Centro"
                      className="h-12 w-full border border-[#D8A814] px-4 text-black outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t border-[#E5E5E5] px-8 py-5">
                <button className="h-12 bg-[#D8A814] px-7 font-bold text-white hover:bg-black">
                  Guardar cambios
                </button>
              </div>
            </section>
          )}

          {/* FISCAL */}
          {activeTab === "Fiscal" && (
            <section className="border border-[#E2E2E2] bg-white">
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
                    defaultValue="Mi Tienda Comercial S.A. de C.V."
                    className="h-12 w-full border border-[#D8A814] px-4 text-black outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-black">
                    RFC
                  </label>

                  <input
                    defaultValue="MTC260101AB1"
                    className="h-12 w-full border border-[#D8A814] px-4 uppercase text-black outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-black">
                    Régimen fiscal
                  </label>

                  <select className="h-12 w-full border border-[#D8A814] bg-white px-4 text-black outline-none">
                    <option>601 - General de Ley Personas Morales</option>
                    <option>612 - Personas Físicas con Actividades Empresariales</option>
                    <option>626 - Régimen Simplificado de Confianza</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-black">
                    Código postal fiscal
                  </label>

                  <input
                    defaultValue="72000"
                    className="h-12 w-full border border-[#D8A814] px-4 text-black outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-[#E5E5E5] p-8">
                <p className="text-sm font-bold text-black">
                  Impuestos
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

                <button className="mt-5 h-11 border border-black px-5 text-sm font-bold text-black hover:bg-black hover:text-white">
                  + Agregar impuesto
                </button>
              </div>
            </section>
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

                <button className="h-11 bg-[#D8A814] px-5 font-bold text-white hover:bg-black">
                  + Nueva sucursal
                </button>
              </div>

              <div className="grid grid-cols-[1.5fr_1fr_1.5fr_.8fr_.8fr] bg-[#FAFAFA] px-6 py-4">
                <span className="text-xs font-bold uppercase text-[#777777]">
                  Sucursal
                </span>
                <span className="text-xs font-bold uppercase text-[#777777]">
                  Ciudad
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

              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className="grid grid-cols-[1.5fr_1fr_1.5fr_.8fr_.8fr] items-center border-t border-[#EEEEEE] px-6 py-5"
                >
                  <p className="font-bold text-black">
                    {branch.name}
                  </p>

                  <p className="text-sm text-[#555555]">
                    {branch.city}
                  </p>

                  <p className="text-sm text-[#555555]">
                    {branch.address}
                  </p>

                  <p className="text-center font-bold text-black">
                    {branch.terminals}
                  </p>

                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-bold ${
                        branch.status === "Activa"
                          ? "bg-[#D8A814] text-white"
                          : "bg-[#EEEEEE] text-[#666666]"
                      }`}
                    >
                      {branch.status}
                    </span>
                  </div>
                </div>
              ))}
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
                    Terminales
                  </h2>
                </div>

                <button className="h-11 bg-[#D8A814] px-5 font-bold text-white hover:bg-black">
                  + Nueva terminal
                </button>
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

              {terminals.map((terminal) => (
                <div
                  key={terminal.id}
                  className="grid grid-cols-[1.4fr_1.5fr_1fr_1fr] items-center border-t border-[#EEEEEE] px-6 py-5"
                >
                  <p className="font-bold text-black">
                    {terminal.name}
                  </p>

                  <p className="text-sm text-[#555555]">
                    {terminal.branch}
                  </p>

                  <p className="text-sm font-semibold text-[#777777]">
                    {terminal.code}
                  </p>

                  <div className="flex items-center justify-end gap-4">
                    <span
                      className={`text-xs font-bold ${
                        terminal.status
                          ? "text-[#D8A814]"
                          : "text-[#888888]"
                      }`}
                    >
                      {terminal.status ? "ACTIVA" : "INACTIVA"}
                    </span>

                    <button
                      className={`
                        relative h-7 w-12
                        transition-colors
                        ${
                          terminal.status
                            ? "bg-[#D8A814]"
                            : "bg-[#CCCCCC]"
                        }
                      `}
                    >
                      <span
                        className={`
                          absolute top-1 h-5 w-5 bg-white
                          transition-all
                          ${
                            terminal.status
                              ? "left-6"
                              : "left-1"
                          }
                        `}
                      />
                    </button>
                  </div>
                </div>
              ))}
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
                        {/* Theme preview swatch */}
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
                    Preferencias generales
                  </h2>
                </div>

                <div className="divide-y divide-[#EEEEEE]">
                  {[
                    {
                      title: "Permitir ventas sin cliente",
                      description:
                        "Permite realizar una venta sin asociarla a un cliente.",
                    },
                    {
                      title: "Solicitar cliente en cada venta",
                      description:
                        "Solicita seleccionar o registrar un cliente antes de continuar.",
                    },
                    {
                      title: "Aplicar impuestos automáticamente",
                      description:
                        "Usa los impuestos configurados en los artículos y servicios.",
                    },
                    {
                      title: "Permitir terminales inactivas",
                      description:
                        "Impide el acceso al POS desde terminales desactivadas.",
                    },
                  ].map((item, index) => (
                    <div
                      key={item.title}
                      className="flex items-center justify-between px-8 py-6"
                    >
                      <div>
                        <p className="font-bold text-black">
                          {item.title}
                        </p>

                        <p className="mt-1 text-sm text-[#777777]">
                          {item.description}
                        </p>
                      </div>

                      <button
                        className={`
                          relative h-7 w-12
                          ${index !== 3 ? "bg-[#D8A814]" : "bg-[#CCCCCC]"}
                        `}
                      >
                        <span
                          className={`
                            absolute top-1 h-5 w-5 bg-white
                            ${
                              index !== 3
                                ? "left-6"
                                : "left-1"
                            }
                          `}
                        />
                      </button>
                    </div>
                  ))}
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