"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/services/api";
import CountryModal, { getCountryByName } from "@/components/organizaciones/CountryModal";
import PreloadedProductsModal from "@/components/organizaciones/PreloadedProductsModal";
import { getCatalogoSemillaFrontend } from "@/data/catalogosSemilla";

import {
  AlertCircle,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Eye,
  Globe,
  Loader2,
  LogIn,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  Tag,
  UserRound,
  UserRoundCheck,
  Utensils,
  Wrench,
  Pill,
  Shirt,
  Smartphone,
} from "lucide-react";

type Step = 1 | 2 | 3 | 4 | 5;

const GIROS_LISTA = [
  {
    id: "ABARROTES",
    nombre: "Abarrotes y Tiendas",
    descripcion: "Minisúper, tienditas, abarroteras y tiendas de conveniencia",
    icon: ShoppingCart,
    catalogoDisponible: true,
    articulosCount: "25+ artículos",
  },
  {
    id: "FARMACIA",
    nombre: "Farmacia y Salud",
    descripcion: "Medicamentos de libre venta, cuidado personal y primeros auxilios",
    icon: Pill,
    catalogoDisponible: true,
    articulosCount: "15+ artículos",
  },
  {
    id: "RESTAURANTE",
    nombre: "Restaurante y Cafetería",
    descripcion: "Comida rápida, cafeterías, pizzerías y venta de platillos",
    icon: Utensils,
    catalogoDisponible: false,
    articulosCount: "Configuración personalizada",
  },
  {
    id: "FERRETERIA",
    nombre: "Ferretería y Materiales",
    descripcion: "Herramientas, tornillería, plomería y material eléctrico",
    icon: Wrench,
    catalogoDisponible: false,
    articulosCount: "Configuración personalizada",
  },
  {
    id: "ROPA",
    nombre: "Boutique, Ropa y Calzado",
    descripcion: "Prendas de vestir, zapatos y accesorios de moda",
    icon: Shirt,
    catalogoDisponible: false,
    articulosCount: "Configuración personalizada",
  },
  {
    id: "TECNOLOGIA",
    nombre: "Tecnología y Celulares",
    descripcion: "Accesorios para celular, periféricos y electrónica",
    icon: Smartphone,
    catalogoDisponible: false,
    articulosCount: "Configuración personalizada",
  },
  {
    id: "GENERAL",
    nombre: "Comercio General / Otro",
    descripcion: "Cualquier otro tipo de negocio de venta o servicios",
    icon: Store,
    catalogoDisponible: false,
    articulosCount: "Configuración personalizada",
  },
];

export default function NuevaOrganizacionPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    pais: "México",
    estado: "",
    municipio: "",
    codigoPostal: "",
    direccion: "",

    giroComercial: "ABARROTES",
    precargarArticulos: true,

    sucursalNombre: "Sucursal Matriz",
    sucursalTelefono: "",
    sucursalDireccion: "",

    adminNombre: "",
    adminTelefono: "",
    adminCorreo: "",
    adminPassword: "",

    vendedorNombre: "",
    vendedorTelefono: "",
    vendedorCorreo: "",
    vendedorPassword: "",

    plan: "BASICO",
    fechaFin: "",
  });

  const updateField = (
    field: keyof typeof form,
    value: any
  ) => {
    setErrorMsg(null);
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const nextStep = () => {
    setErrorMsg(null);
    if (step === 1) {
      if (!form.nombre.trim()) {
        setErrorMsg("El nombre de la organización es obligatorio");
        return;
      }
    } else if (step === 3) {
      if (!form.sucursalNombre.trim()) {
        setErrorMsg("El nombre de la sucursal es obligatorio");
        return;
      }
    } else if (step === 4) {
      if (!form.adminNombre.trim() || !form.adminCorreo.trim() || !form.adminPassword.trim()) {
        setErrorMsg("Los datos del administrador (nombre, correo y contraseña) son obligatorios");
        return;
      }
    }

    if (step < 5) {
      setStep((step + 1) as Step);
    }
  };

  const previousStep = () => {
    setErrorMsg(null);
    if (step > 1) {
      setStep((step - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    if (!form.nombre.trim()) {
      setErrorMsg("El nombre de la organización es obligatorio.");
      setStep(1);
      return;
    }
    if (!form.sucursalNombre.trim()) {
      setErrorMsg("El nombre de la sucursal es obligatorio.");
      setStep(3);
      return;
    }
    if (!form.adminNombre.trim() || !form.adminCorreo.trim() || !form.adminPassword.trim()) {
      setErrorMsg("El nombre, correo y contraseña del administrador son obligatorios.");
      setStep(4);
      return;
    }

    setLoading(true);

    try {
      const payload: Record<string, any> = {
        nombre: form.nombre.trim(),
        correo: form.correo.trim() || undefined,
        telefono: form.telefono.trim() || undefined,
        pais: form.pais.trim() || undefined,
        estado: form.estado.trim() || undefined,
        municipio: form.municipio.trim() || undefined,
        codigoPostal: form.codigoPostal.trim() || undefined,
        direccion: form.direccion.trim() || undefined,

        giroComercial: form.giroComercial,
        precargarArticulos: form.precargarArticulos,

        sucursalNombre: form.sucursalNombre.trim(),
        sucursalTelefono: form.sucursalTelefono.trim() || undefined,
        sucursalDireccion: form.sucursalDireccion.trim() || undefined,

        adminNombre: form.adminNombre.trim(),
        adminTelefono: form.adminTelefono.trim() || undefined,
        adminCorreo: form.adminCorreo.trim(),
        adminPassword: form.adminPassword,

        plan: form.plan,
        fechaFin: form.fechaFin || undefined,
      };

      if (form.vendedorNombre.trim() && form.vendedorCorreo.trim() && form.vendedorPassword.trim()) {
        payload.vendedorNombre = form.vendedorNombre.trim();
        payload.vendedorTelefono = form.vendedorTelefono.trim() || undefined;
        payload.vendedorCorreo = form.vendedorCorreo.trim();
        payload.vendedorPassword = form.vendedorPassword;
      }

      const data = await apiRequest("/organizaciones", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (data.organizacion?.id) {
        localStorage.setItem("crm_organizacion_id", data.organizacion.id);
        localStorage.setItem("crm_organizacion_nombre", data.organizacion.nombre);
        const perfiles = [data.admin, data.vendedor].filter(Boolean);
        localStorage.setItem("crm_perfiles", JSON.stringify(perfiles));
      }

      sessionStorage.setItem(
        "organizacion-preregistro",
        JSON.stringify({
          ...form,
          id: data.organizacion?.id,
        })
      );

      router.push("/organizaciones/registro-completado");
    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error inesperado al registrar la organización");
    } finally {
      setLoading(false);
    }
  };

  const giroSeleccionadoObj = GIROS_LISTA.find((g) => g.id === form.giroComercial) || GIROS_LISTA[0];
  const catalogoPaisInfo = getCatalogoSemillaFrontend(form.pais, form.giroComercial);

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <header className="border-b border-[#E2E2E2] bg-white">
        <div className="mx-auto flex h-20 w-full max-w-[1280px] items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="Imagertis"
              width={130}
              height={62}
              priority
              className="h-[58px] w-[122px] object-contain"
            />

            <div className="hidden border-l border-[#E2E2E2] pl-4 sm:block">
              <p className="text-xs uppercase tracking-[0.16em] text-[#999999]">
                Registro de organización
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/login")}
            className="flex h-11 items-center gap-2 border border-black px-4 text-sm font-bold text-black transition-colors hover:bg-black hover:text-white cursor-pointer"
          >
            <LogIn size={17} />
            Ya tengo usuario, acceder
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1280px] p-6 lg:p-10">
        {/* Encabezado */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
            Plataforma
          </p>

          <h1 className="mt-2 text-3xl font-bold text-black">
            Nueva organización
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-[#777777]">
            Registra tu empresa, su giro comercial, la primera sucursal y los usuarios
            que tendrán acceso al sistema.
          </p>
        </div>

        {/* Barra de Progreso (5 Pasos) */}
        <div className="mb-8 border border-[#E2E2E2] bg-white">
          <div className="grid grid-cols-2 md:grid-cols-5">
            {[
              {
                number: 1,
                title: "Organización",
                icon: Building2,
              },
              {
                number: 2,
                title: "Giro & Catálogo",
                icon: Sparkles,
              },
              {
                number: 3,
                title: "Sucursal",
                icon: Store,
              },
              {
                number: 4,
                title: "Usuarios",
                icon: UserRound,
              },
              {
                number: 5,
                title: "Membresía",
                icon: CalendarDays,
              },
            ].map((item) => {
              const Icon = item.icon;
              const active = step === item.number;
              const completed = step > item.number;

              return (
                <div
                  key={item.number}
                  className={`
                    flex items-center gap-3
                    border-r border-[#EEEEEE]
                    p-4 lg:p-5
                    last:border-r-0
                    ${active ? "bg-[#FAFAFA]" : ""}
                  `}
                >
                  <div
                    className={`
                      flex h-9 w-9 shrink-0 items-center justify-center
                      ${
                        active || completed
                          ? "bg-[#D8A814] text-white"
                          : "bg-[#EFEFEF] text-[#888888]"
                      }
                    `}
                  >
                    <Icon size={17} />
                  </div>

                  <div>
                    <p
                      className={`
                        text-[10px] font-bold uppercase tracking-wider
                        ${active ? "text-[#D8A814]" : "text-[#999999]"}
                      `}
                    >
                      Paso {item.number}
                    </p>

                    <p className="mt-0.5 text-xs lg:text-sm font-bold text-black truncate">
                      {item.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contenido de Pasos */}
        <section className="border border-[#E2E2E2] bg-white">
          {/* PASO 1: Datos Generales */}
          {step === 1 && (
            <>
              <div className="border-b border-[#EEEEEE] px-7 py-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                  Paso 1 de 5
                </p>

                <h2 className="mt-1 text-xl font-bold text-black">
                  Información de la organización
                </h2>

                <p className="mt-1 text-sm text-[#888888]">
                  Estos datos identificarán a tu empresa dentro de la plataforma.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 p-7 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-[#777777]">
                    Nombre de la organización <span className="text-red-500">*</span>
                  </label>

                  <input
                    value={form.nombre}
                    onChange={(e) => updateField("nombre", e.target.value)}
                    placeholder="Abarrotes El Venado"
                    className="h-12 w-full border border-[#DDDDDD] px-4 text-black outline-none focus:border-[#D8A814]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-[#777777]">
                    Correo de contacto
                  </label>

                  <input
                    type="email"
                    value={form.correo}
                    onChange={(e) => updateField("correo", e.target.value)}
                    placeholder="contacto@empresa.com"
                    className="h-12 w-full border border-[#DDDDDD] px-4 text-black outline-none focus:border-[#D8A814]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-[#777777]">
                    Teléfono
                  </label>

                  <input
                    value={form.telefono}
                    onChange={(e) => updateField("telefono", e.target.value)}
                    placeholder="222 123 4567"
                    className="h-12 w-full border border-[#DDDDDD] px-4 text-black outline-none focus:border-[#D8A814]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-[#777777]">
                    País
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsCountryModalOpen(true)}
                    className="flex h-12 w-full items-center justify-between border border-[#DDDDDD] bg-white px-4 text-black outline-none transition-all hover:border-[#D8A814] focus:border-[#D8A814] cursor-pointer shadow-sm group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl leading-none select-none">
                        {getCountryByName(form.pais).flag}
                      </span>
                      <span className="text-sm font-semibold text-black">
                        {form.pais || "Seleccionar país"}
                      </span>
                      <span className="text-xs text-[#888888]">
                        ({getCountryByName(form.pais).phoneCode})
                      </span>
                    </div>

                    <span className="text-xs font-bold uppercase tracking-wider text-[#D8A814] group-hover:text-black transition-colors">
                      Cambiar ➔
                    </span>
                  </button>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-[#777777]">
                    Estado / Provincia
                  </label>

                  <input
                    value={form.estado}
                    onChange={(e) => updateField("estado", e.target.value)}
                    placeholder="Puebla"
                    className="h-12 w-full border border-[#DDDDDD] px-4 text-black outline-none focus:border-[#D8A814]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-[#777777]">
                    Municipio / Ciudad
                  </label>

                  <input
                    value={form.municipio}
                    onChange={(e) => updateField("municipio", e.target.value)}
                    placeholder="Puebla"
                    className="h-12 w-full border border-[#DDDDDD] px-4 text-black outline-none focus:border-[#D8A814]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-[#777777]">
                    Código postal
                  </label>

                  <input
                    value={form.codigoPostal}
                    onChange={(e) => updateField("codigoPostal", e.target.value)}
                    placeholder="72000"
                    className="h-12 w-full border border-[#DDDDDD] px-4 text-black outline-none focus:border-[#D8A814]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-[#777777]">
                    Dirección
                  </label>

                  <input
                    value={form.direccion}
                    onChange={(e) => updateField("direccion", e.target.value)}
                    placeholder="Av. Reforma 123"
                    className="h-12 w-full border border-[#DDDDDD] px-4 text-black outline-none focus:border-[#D8A814]"
                  />
                </div>
              </div>
            </>
          )}

          {/* PASO 2: ¿A qué se dedica tu negocio? + Solicitar Artículos Precargados */}
          {step === 2 && (
            <>
              <div className="border-b border-[#EEEEEE] px-7 py-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                  Paso 2 de 5 · Actividad Comercial
                </p>

                <h2 className="mt-1 text-xl font-bold text-black">
                  ¿A qué se dedica tu negocio?
                </h2>

                <p className="mt-1 text-sm text-[#888888]">
                  Selecciona el giro de tu empresa y personaliza si deseas precargar un catálogo inicial de productos para el Punto de Venta.
                </p>
              </div>

              <div className="p-7 space-y-8">
                {/* Cuadrícula de Giros Comerciales */}
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-[#777777]">
                    Giro o Sector del Negocio
                  </label>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {GIROS_LISTA.map((giro) => {
                      const Icon = giro.icon;
                      const isSelected = form.giroComercial === giro.id;

                      return (
                        <button
                          key={giro.id}
                          type="button"
                          onClick={() => {
                            updateField("giroComercial", giro.id);
                            if (giro.catalogoDisponible) {
                              updateField("precargarArticulos", true);
                            }
                          }}
                          className={`flex flex-col justify-between border p-4 text-left transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#D8A814] bg-[#D8A814]/10 shadow-sm ring-2 ring-[#D8A814]"
                              : "border-[#EEEEEE] bg-white hover:border-[#D8A814] hover:bg-[#FAFAFA]"
                          }`}
                        >
                          <div className="flex items-start gap-3.5">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                                isSelected
                                  ? "bg-[#D8A814] text-white"
                                  : "bg-[#FAFAFA] border border-[#E5E5E5] text-[#777777]"
                              }`}
                            >
                              <Icon size={20} />
                            </div>

                            <div>
                              <p className="text-sm font-bold text-black">{giro.nombre}</p>
                              <p className="mt-1 text-xs text-[#777777] leading-relaxed">
                                {giro.descripcion}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between pt-2 border-t border-[#F0F0F0]">
                            <span className="text-[10px] font-semibold text-[#888888]">
                              {giro.articulosCount}
                            </span>
                            {isSelected && (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D8A814] text-white text-xs">
                                <Check size={12} />
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Banner Destacado: Artículos Precargados para el POS */}
                <div className="border border-[#D8A814] bg-gradient-to-r from-[#FEF8E7] to-white p-6 shadow-sm">
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#D8A814] text-white shadow-sm">
                        <Sparkles size={24} />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-black">
                            Catálogo Precargado para Punto de Venta ({catalogoPaisInfo.bandera} {catalogoPaisInfo.pais})
                          </h3>
                          <span className="bg-[#D8A814] px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                            Recomendado · {catalogoPaisInfo.monedaCodigo}
                          </span>
                        </div>

                        <p className="mt-1 max-w-xl text-xs leading-relaxed text-[#666666]">
                          Inyecta automáticamente <strong className="text-black">{catalogoPaisInfo.productos.length} artículos reales</strong> de {catalogoPaisInfo.pais} con sus códigos de barras oficiales auténticos, categorías, precios sugeridos y stock inicial en tu primera sucursal.
                        </p>

                        <div className="mt-2.5 flex items-center gap-2 text-[11px] text-[#888888]">
                          <span>País sede: <strong className="text-black">{catalogoPaisInfo.bandera} {catalogoPaisInfo.pais}</strong></span>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => setIsCountryModalOpen(true)}
                            className="text-xs font-bold text-[#D8A814] hover:text-black underline cursor-pointer"
                          >
                            Cambiar país
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Botón para ver artículos */}
                      <button
                        type="button"
                        onClick={() => setIsProductsModalOpen(true)}
                        className="flex h-11 items-center gap-2 border border-black bg-white px-4 text-xs font-bold uppercase tracking-wider text-black hover:bg-black hover:text-white transition-all cursor-pointer shadow-sm"
                      >
                        <Eye size={15} />
                        <span>Ver catálogo {catalogoPaisInfo.bandera}</span>
                      </button>

                      {/* Switch Activar / Desactivar */}
                      <label className="flex items-center gap-3 cursor-pointer bg-white border border-[#DDDDDD] px-4 h-11 select-none shadow-sm hover:border-[#D8A814] transition-colors">
                        <input
                          type="checkbox"
                          checked={form.precargarArticulos}
                          onChange={(e) => updateField("precargarArticulos", e.target.checked)}
                          className="h-4 w-4 accent-[#D8A814] cursor-pointer"
                        />
                        <span className="text-xs font-bold text-black">
                          {form.precargarArticulos ? "✓ Incluir artículos" : "No precargar"}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* PASO 3: Primera Sucursal */}
          {step === 3 && (
            <>
              <div className="border-b border-[#EEEEEE] px-7 py-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                  Paso 3 de 5
                </p>

                <h2 className="mt-1 text-xl font-bold text-black">
                  Sucursal inicial
                </h2>

                <p className="mt-1 text-sm text-[#888888]">
                  Esta será la primera tienda o sucursal donde se activará tu inventario y Punto de Venta.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 p-7 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-[#777777]">
                    Nombre de la sucursal <span className="text-red-500">*</span>
                  </label>

                  <input
                    value={form.sucursalNombre}
                    onChange={(e) => updateField("sucursalNombre", e.target.value)}
                    placeholder="Sucursal Matriz / Sucursal Centro"
                    className="h-12 w-full border border-[#DDDDDD] px-4 text-black outline-none focus:border-[#D8A814]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-[#777777]">
                    Teléfono de la sucursal
                  </label>

                  <input
                    value={form.sucursalTelefono}
                    onChange={(e) => updateField("sucursalTelefono", e.target.value)}
                    placeholder="222 456 7890"
                    className="h-12 w-full border border-[#DDDDDD] px-4 text-black outline-none focus:border-[#D8A814]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-bold uppercase text-[#777777]">
                    Dirección de la sucursal
                  </label>

                  <div className="flex h-12 items-center border border-[#DDDDDD] px-4 focus-within:border-[#D8A814]">
                    <MapPin size={17} className="mr-3 text-[#999999]" />
                    <input
                      value={form.sucursalDireccion}
                      onChange={(e) => updateField("sucursalDireccion", e.target.value)}
                      placeholder="Av. Juárez 100, Centro"
                      className="h-full flex-1 bg-transparent text-black outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-[#EEEEEE] bg-[#FAFAFA] px-7 py-5 flex items-center gap-3">
                <CheckCircle2 size={18} className="text-[#D8A814] shrink-0" />
                <p className="text-xs text-[#777777]">
                  Se creará automáticamente la terminal <strong className="text-black">"Caja 01"</strong> lista para operar tus ventas.
                </p>
              </div>
            </>
          )}

          {/* PASO 4: Usuarios Iniciales */}
          {step === 4 && (
            <>
              <div className="border-b border-[#EEEEEE] px-7 py-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                  Paso 4 de 5
                </p>

                <h2 className="mt-1 text-xl font-bold text-black">
                  Administrador y vendedor inicial
                </h2>

                <p className="mt-1 text-sm text-[#888888]">
                  Ambos usuarios quedarán vinculados automáticamente a la organización y listos en la pantalla de perfiles.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* ADMIN */}
                <div className="border-[#EEEEEE] p-7 lg:border-r space-y-4">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center bg-[#050505] text-white">
                      <ShieldCheck size={21} />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase text-[#D8A814]">
                        Usuario principal
                      </p>

                      <h3 className="mt-0.5 text-lg font-bold text-black">
                        Administrador
                      </h3>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase text-[#777777]">
                      Nombre completo <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.adminNombre}
                      onChange={(e) => updateField("adminNombre", e.target.value)}
                      placeholder="Carlos Martínez"
                      className="h-11 w-full border border-[#DDDDDD] px-4 text-sm text-black outline-none focus:border-[#D8A814]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase text-[#777777]">
                      Teléfono
                    </label>
                    <input
                      value={form.adminTelefono}
                      onChange={(e) => updateField("adminTelefono", e.target.value)}
                      placeholder="222 123 4567"
                      className="h-11 w-full border border-[#DDDDDD] px-4 text-sm text-black outline-none focus:border-[#D8A814]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase text-[#777777]">
                      Correo electrónico <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.adminCorreo}
                      onChange={(e) => updateField("adminCorreo", e.target.value)}
                      placeholder="admin@empresa.com"
                      className="h-11 w-full border border-[#DDDDDD] px-4 text-sm text-black outline-none focus:border-[#D8A814]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase text-[#777777]">
                      Contraseña <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={form.adminPassword}
                      onChange={(e) => updateField("adminPassword", e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="h-11 w-full border border-[#DDDDDD] px-4 text-sm text-black outline-none focus:border-[#D8A814]"
                    />
                  </div>

                  <div className="mt-4 border-l-2 border-[#D8A814] pl-4">
                    <p className="text-xs font-semibold text-black">
                      Rol: ADMIN_ORGANIZACION
                    </p>
                    <p className="text-[11px] text-[#777777]">
                      Acceso total al CRM, reportes, usuarios y configuración.
                    </p>
                  </div>
                </div>

                {/* VENDEDOR */}
                <div className="p-7 space-y-4">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center bg-[#D8A814] text-white">
                      <UserRoundCheck size={21} />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase text-[#D8A814]">
                        Usuario operativo (Opcional)
                      </p>

                      <h3 className="mt-0.5 text-lg font-bold text-black">
                        Vendedor de Caja
                      </h3>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase text-[#777777]">
                      Nombre del vendedor
                    </label>
                    <input
                      value={form.vendedorNombre}
                      onChange={(e) => updateField("vendedorNombre", e.target.value)}
                      placeholder="María López"
                      className="h-11 w-full border border-[#DDDDDD] px-4 text-sm text-black outline-none focus:border-[#D8A814]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase text-[#777777]">
                      Teléfono
                    </label>
                    <input
                      value={form.vendedorTelefono}
                      onChange={(e) => updateField("vendedorTelefono", e.target.value)}
                      placeholder="222 987 6543"
                      className="h-11 w-full border border-[#DDDDDD] px-4 text-sm text-black outline-none focus:border-[#D8A814]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase text-[#777777]">
                      Correo del vendedor
                    </label>
                    <input
                      type="email"
                      value={form.vendedorCorreo}
                      onChange={(e) => updateField("vendedorCorreo", e.target.value)}
                      placeholder="ventas@empresa.com"
                      className="h-11 w-full border border-[#DDDDDD] px-4 text-sm text-black outline-none focus:border-[#D8A814]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase text-[#777777]">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      value={form.vendedorPassword}
                      onChange={(e) => updateField("vendedorPassword", e.target.value)}
                      placeholder="Contraseña o PIN de acceso"
                      className="h-11 w-full border border-[#DDDDDD] px-4 text-sm text-black outline-none focus:border-[#D8A814]"
                    />
                  </div>

                  <div className="mt-4 border-l-2 border-[#D8A814] pl-4">
                    <p className="text-xs font-semibold text-black">
                      Rol: VENDEDOR
                    </p>
                    <p className="text-[11px] text-[#777777]">
                      Ingreso directo al Punto de Venta (POS) y cobro de tickets.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* PASO 5: Membresía & Resumen */}
          {step === 5 && (
            <>
              <div className="border-b border-[#EEEEEE] px-7 py-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                  Paso 5 de 5 · Membresía
                </p>

                <h2 className="mt-1 text-xl font-bold text-black">
                  Acceso a la plataforma y confirmación
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-5 p-7 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-[#777777]">
                    Plan de acceso
                  </label>

                  <select
                    value={form.plan}
                    onChange={(e) => updateField("plan", e.target.value)}
                    className="h-12 w-full border border-[#DDDDDD] bg-white px-4 text-black outline-none focus:border-[#D8A814]"
                  >
                    <option value="BASICO">Plan Básico</option>
                    <option value="PROFESIONAL">Plan Profesional</option>
                    <option value="EMPRESA">Plan Empresa</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-[#777777]">
                    Fecha de vencimiento (Opcional)
                  </label>

                  <input
                    type="date"
                    value={form.fechaFin}
                    onChange={(e) => updateField("fechaFin", e.target.value)}
                    className="h-12 w-full border border-[#DDDDDD] px-4 text-black outline-none focus:border-[#D8A814]"
                  />
                </div>
              </div>

              {/* Resumen Completo */}
              <div className="border-t border-[#EEEEEE] bg-[#FAFAFA] p-7">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                  Resumen de lo que se creará
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="border border-[#EEEEEE] bg-white p-4">
                    <p className="text-[10px] font-bold uppercase text-[#999999]">Organización</p>
                    <p className="mt-1 text-sm font-bold text-black truncate">{form.nombre || "Sin definir"}</p>
                    <p className="text-xs text-[#777777]">{giroSeleccionadoObj.nombre}</p>
                  </div>

                  <div className="border border-[#EEEEEE] bg-white p-4">
                    <p className="text-[10px] font-bold uppercase text-[#999999]">Catálogo POS</p>
                    <p className="mt-1 text-sm font-bold text-black">
                      {form.precargarArticulos ? "Artículos Precargados" : "Catálogo Vacío"}
                    </p>
                    <p className="text-xs text-[#D8A814] font-semibold">
                      {form.precargarArticulos ? "25+ productos listos" : "Carga manual"}
                    </p>
                  </div>

                  <div className="border border-[#EEEEEE] bg-white p-4">
                    <p className="text-[10px] font-bold uppercase text-[#999999]">Sucursal & Caja</p>
                    <p className="mt-1 text-sm font-bold text-black truncate">{form.sucursalNombre}</p>
                    <p className="text-xs text-[#777777]">Terminal Caja 01</p>
                  </div>

                  <div className="border border-[#EEEEEE] bg-white p-4">
                    <p className="text-[10px] font-bold uppercase text-[#999999]">Administrador</p>
                    <p className="mt-1 text-sm font-bold text-black truncate">{form.adminNombre || "Sin definir"}</p>
                    <p className="text-xs text-[#777777] truncate">{form.adminCorreo}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Banner de Error */}
          {errorMsg && (
            <div className="mx-7 mt-6 flex items-start gap-3 border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Error al procesar el registro</p>
                <p className="mt-0.5 text-xs text-red-600">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Footer de Navegación */}
          <div className="flex items-center justify-between border-t border-[#EEEEEE] px-7 py-5">
            <button
              onClick={previousStep}
              disabled={step === 1 || loading}
              className="
                h-11 border border-black px-5
                text-sm font-bold text-black
                hover:bg-black hover:text-white
                disabled:cursor-not-allowed
                disabled:opacity-30 cursor-pointer
              "
            >
              Anterior
            </button>

            {step < 5 ? (
              <button
                onClick={nextStep}
                disabled={loading}
                className="flex h-11 items-center gap-2 bg-[#D8A814] px-6 text-sm font-bold text-white hover:bg-black disabled:opacity-50 cursor-pointer"
              >
                Continuar
                <ChevronRight size={17} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex h-11 items-center gap-2 bg-[#D8A814] px-7 text-sm font-bold text-white hover:bg-black disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Guardando organización y catálogo...
                  </>
                ) : (
                  "Crear organización y comenzar"
                )}
              </button>
            )}
          </div>
        </section>
      </div>

      {/* Modal de Banderas de Países */}
      <CountryModal
        isOpen={isCountryModalOpen}
        onClose={() => setIsCountryModalOpen(false)}
        selectedCountry={form.pais}
        onSelectCountry={(c) => updateField("pais", c.name)}
      />

      {/* Modal de Vista Previa de Artículos Precargados */}
      <PreloadedProductsModal
        isOpen={isProductsModalOpen}
        onClose={() => setIsProductsModalOpen(false)}
        pais={form.pais}
        giroNombre={giroSeleccionadoObj.nombre}
        giroId={form.giroComercial}
      />
    </main>
  );
}