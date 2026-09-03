"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Building2,
  CalendarDays,
  ChevronRight,
  LogIn,
  MapPin,
  ShieldCheck,
  Store,
  UserRound,
  UserRoundCheck,
} from "lucide-react";

type Step = 1 | 2 | 3 | 4;

export default function NuevaOrganizacionPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);

  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    pais: "México",
    estado: "",
    municipio: "",
    codigoPostal: "",
    direccion: "",

    sucursalNombre: "",
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
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const nextStep = () => {
    if (step < 4) {
      setStep((step + 1) as Step);
    }
  };

  const previousStep = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    /*
      Después aquí conectaremos NestJS.

      POST /organizaciones

      Y cuando responda correctamente:
    */

    sessionStorage.setItem(
      "organizacion-preregistro",
      JSON.stringify(form)
    );

    router.push("/organizaciones/registro-completado");
  };

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
            className="flex h-11 items-center gap-2 border border-black px-4 text-sm font-bold text-black transition-colors hover:bg-black hover:text-white"
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
              Registra la empresa, su primera sucursal y los usuarios
              iniciales que tendrán acceso al sistema.
            </p>
          </div>

          {/* Progreso */}
          <div className="mb-8 border border-[#E2E2E2] bg-white">
            <div className="grid grid-cols-4">
              {[
                {
                  number: 1,
                  title: "Organización",
                  icon: Building2,
                },
                {
                  number: 2,
                  title: "Sucursal",
                  icon: Store,
                },
                {
                  number: 3,
                  title: "Usuarios",
                  icon: UserRound,
                },
                {
                  number: 4,
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
                      px-5 py-5
                      last:border-r-0
                      ${
                        active
                          ? "bg-[#FAFAFA]"
                          : ""
                      }
                    `}
                  >
                    <div
                      className={`
                        flex h-9 w-9 items-center justify-center
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
                          text-xs font-bold uppercase
                          ${
                            active
                              ? "text-[#D8A814]"
                              : "text-[#999999]"
                          }
                        `}
                      >
                        Paso {item.number}
                      </p>

                      <p className="mt-1 text-sm font-bold text-black">
                        {item.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contenido */}
          <section className="border border-[#E2E2E2] bg-white">
            {/* PASO 1 */}
            {step === 1 && (
              <>
                <div className="border-b border-[#EEEEEE] px-7 py-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                    Datos generales
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-black">
                    Información de la organización
                  </h2>

                  <p className="mt-1 text-sm text-[#888888]">
                    Estos datos identificarán a la empresa dentro de la
                    plataforma.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 p-7 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase text-[#777777]">
                      Nombre de la organización
                    </label>

                    <input
                      value={form.nombre}
                      onChange={(e) =>
                        updateField("nombre", e.target.value)
                      }
                      placeholder="Abarrotes El Venado"
                      className="h-12 w-full border border-[#DDDDDD] px-4 text-black outline-none focus:border-[#D8A814]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase text-[#777777]">
                      Correo
                    </label>

                    <input
                      type="email"
                      value={form.correo}
                      onChange={(e) =>
                        updateField("correo", e.target.value)
                      }
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
                      onChange={(e) =>
                        updateField("telefono", e.target.value)
                      }
                      placeholder="222 123 4567"
                      className="h-12 w-full border border-[#DDDDDD] px-4 text-black outline-none focus:border-[#D8A814]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase text-[#777777]">
                      País
                    </label>

                    <input
                      value={form.pais}
                      onChange={(e) =>
                        updateField("pais", e.target.value)
                      }
                      className="h-12 w-full border border-[#DDDDDD] px-4 text-black outline-none focus:border-[#D8A814]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase text-[#777777]">
                      Estado
                    </label>

                    <input
                      value={form.estado}
                      onChange={(e) =>
                        updateField("estado", e.target.value)
                      }
                      placeholder="Puebla"
                      className="h-12 w-full border border-[#DDDDDD] px-4 text-black outline-none focus:border-[#D8A814]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase text-[#777777]">
                      Municipio
                    </label>

                    <input
                      value={form.municipio}
                      onChange={(e) =>
                        updateField("municipio", e.target.value)
                      }
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
                      onChange={(e) =>
                        updateField("codigoPostal", e.target.value)
                      }
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
                      onChange={(e) =>
                        updateField("direccion", e.target.value)
                      }
                      placeholder="Av. Reforma 123"
                      className="h-12 w-full border border-[#DDDDDD] px-4 text-black outline-none focus:border-[#D8A814]"
                    />
                  </div>
                </div>
              </>
            )}

            {/* PASO 2 */}
            {step === 2 && (
              <>
                <div className="border-b border-[#EEEEEE] px-7 py-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                    Primera sucursal
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-black">
                    Sucursal inicial
                  </h2>

                  <p className="mt-1 text-sm text-[#888888]">
                    El administrador podrá crear más sucursales posteriormente.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 p-7 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase text-[#777777]">
                      Nombre de la sucursal
                    </label>

                    <input
                      value={form.sucursalNombre}
                      onChange={(e) =>
                        updateField(
                          "sucursalNombre",
                          e.target.value
                        )
                      }
                      placeholder="Sucursal Centro"
                      className="h-12 w-full border border-[#DDDDDD] px-4 text-black outline-none focus:border-[#D8A814]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase text-[#777777]">
                      Teléfono
                    </label>

                    <input
                      value={form.sucursalTelefono}
                      onChange={(e) =>
                        updateField(
                          "sucursalTelefono",
                          e.target.value
                        )
                      }
                      placeholder="222 456 7890"
                      className="h-12 w-full border border-[#DDDDDD] px-4 text-black outline-none focus:border-[#D8A814]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-bold uppercase text-[#777777]">
                      Dirección de la sucursal
                    </label>

                    <div className="flex h-12 items-center border border-[#DDDDDD] px-4 focus-within:border-[#D8A814]">
                      <MapPin
                        size={17}
                        className="mr-3 text-[#999999]"
                      />

                      <input
                        value={form.sucursalDireccion}
                        onChange={(e) =>
                          updateField(
                            "sucursalDireccion",
                            e.target.value
                          )
                        }
                        placeholder="Av. Juárez 100, Centro"
                        className="h-full flex-1 bg-transparent text-black outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#EEEEEE] bg-[#FAFAFA] px-7 py-5">
                  <p className="text-sm text-[#777777]">
                    Después podrás agregar terminales como Caja 01, Caja 02,
                    Caja 03, etc.
                  </p>
                </div>
              </>
            )}

            {/* PASO 3 */}
            {step === 3 && (
              <>
                <div className="border-b border-[#EEEEEE] px-7 py-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                    Usuarios iniciales
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-black">
                    Administrador y vendedor
                  </h2>

                  <p className="mt-1 text-sm text-[#888888]">
                    Ambos usuarios quedarán vinculados automáticamente a la
                    organización.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* ADMIN */}
                  <div className="border-[#EEEEEE] p-7 lg:border-r">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center bg-[#050505] text-white">
                        <ShieldCheck size={21} />
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase text-[#D8A814]">
                          Usuario principal
                        </p>

                        <h3 className="mt-1 text-lg font-bold text-black">
                          Administrador
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Input
                        label="Nombre"
                        value={form.adminNombre}
                        placeholder="Carlos Martínez"
                        onChange={(value) =>
                          updateField("adminNombre", value)
                        }
                      />

                      <Input
                        label="Teléfono"
                        value={form.adminTelefono}
                        placeholder="222 123 4567"
                        onChange={(value) =>
                          updateField("adminTelefono", value)
                        }
                      />

                      <Input
                        label="Correo"
                        type="email"
                        value={form.adminCorreo}
                        placeholder="admin@empresa.com"
                        onChange={(value) =>
                          updateField("adminCorreo", value)
                        }
                      />

                      <Input
                        label="Contraseña"
                        type="password"
                        value={form.adminPassword}
                        placeholder="Mínimo 8 caracteres"
                        onChange={(value) =>
                          updateField("adminPassword", value)
                        }
                      />
                    </div>

                    <div className="mt-5 border-l-2 border-[#D8A814] pl-4">
                      <p className="text-sm font-semibold text-black">
                        ADMIN_ORGANIZACION
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#777777]">
                        Podrá crear sucursales, terminales, usuarios y
                        administrar la organización.
                      </p>
                    </div>
                  </div>

                  {/* VENDEDOR */}
                  <div className="p-7">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center bg-[#D8A814] text-white">
                        <UserRoundCheck size={21} />
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase text-[#D8A814]">
                          Usuario operativo
                        </p>

                        <h3 className="mt-1 text-lg font-bold text-black">
                          Vendedor
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Input
                        label="Nombre"
                        value={form.vendedorNombre}
                        placeholder="María López"
                        onChange={(value) =>
                          updateField("vendedorNombre", value)
                        }
                      />

                      <Input
                        label="Teléfono"
                        value={form.vendedorTelefono}
                        placeholder="222 987 6543"
                        onChange={(value) =>
                          updateField("vendedorTelefono", value)
                        }
                      />

                      <Input
                        label="Correo"
                        type="email"
                        value={form.vendedorCorreo}
                        placeholder="ventas@empresa.com"
                        onChange={(value) =>
                          updateField("vendedorCorreo", value)
                        }
                      />

                      <Input
                        label="Contraseña"
                        type="password"
                        value={form.vendedorPassword}
                        placeholder="Mínimo 8 caracteres"
                        onChange={(value) =>
                          updateField("vendedorPassword", value)
                        }
                      />
                    </div>

                    <div className="mt-5 border-l-2 border-[#D8A814] pl-4">
                      <p className="text-sm font-semibold text-black">
                        VENDEDOR
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#777777]">
                        Tendrá acceso al perfil de ventas y posteriormente al
                        punto de venta.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* PASO 4 */}
            {step === 4 && (
              <>
                <div className="border-b border-[#EEEEEE] px-7 py-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                    Membresía
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-black">
                    Acceso a la plataforma
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-5 p-7 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase text-[#777777]">
                      Plan
                    </label>

                    <select
                      value={form.plan}
                      onChange={(e) =>
                        updateField("plan", e.target.value)
                      }
                      className="h-12 w-full border border-[#DDDDDD] bg-white px-4 text-black outline-none focus:border-[#D8A814]"
                    >
                      <option value="BASICO">
                        Básico
                      </option>

                      <option value="PROFESIONAL">
                        Profesional
                      </option>

                      <option value="EMPRESA">
                        Empresa
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase text-[#777777]">
                      Fecha de vencimiento
                    </label>

                    <input
                      type="date"
                      value={form.fechaFin}
                      onChange={(e) =>
                        updateField("fechaFin", e.target.value)
                      }
                      className="h-12 w-full border border-[#DDDDDD] px-4 text-black outline-none focus:border-[#D8A814]"
                    />
                  </div>
                </div>

                {/* Resumen */}
                <div className="border-t border-[#EEEEEE] bg-[#FAFAFA] p-7">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                    Resumen
                  </p>

                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
                    <SummaryCard
                      label="Organización"
                      value={form.nombre || "Sin definir"}
                    />

                    <SummaryCard
                      label="Sucursal"
                      value={
                        form.sucursalNombre ||
                        "Sin definir"
                      }
                    />

                    <SummaryCard
                      label="Administrador"
                      value={
                        form.adminNombre ||
                        "Sin definir"
                      }
                    />

                    <SummaryCard
                      label="Vendedor"
                      value={
                        form.vendedorNombre ||
                        "Sin definir"
                      }
                    />
                  </div>
                </div>
              </>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-[#EEEEEE] px-7 py-5">
              <button
                onClick={previousStep}
                disabled={step === 1}
                className="
                  h-11 border border-black px-5
                  text-sm font-bold text-black
                  hover:bg-black hover:text-white
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
              >
                Anterior
              </button>

              {step < 4 ? (
                <button
                  onClick={nextStep}
                  className="flex h-11 items-center gap-2 bg-[#D8A814] px-6 text-sm font-bold text-white hover:bg-black"
                >
                  Continuar
                  <ChevronRight size={17} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="h-11 bg-[#D8A814] px-7 text-sm font-bold text-white hover:bg-black"
                >
                  Crear organización
                </button>
              )}
            </div>
          </section>
      </div>
    </main>
  );
}

function Input({
  label,
  value,
  placeholder,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase text-[#777777]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full border border-[#DDDDDD] px-4 text-black outline-none focus:border-[#D8A814]"
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border border-[#E2E2E2] bg-white p-5">
      <p className="text-[11px] font-bold uppercase text-[#999999]">
        {label}
      </p>

      <p className="mt-2 truncate font-bold text-black">
        {value}
      </p>
    </div>
  );
}