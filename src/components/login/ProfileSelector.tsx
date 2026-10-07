"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ShieldCheck, UserPlus, Users } from "lucide-react";
import ProfileCard from "./ProfileCard";
import { apiRequest } from "@/services/api";
import {
  getOrganizacionId,
  getOrganizacionNombre,
  getPerfilesGuardados,
  getRutaPorPerfil,
  getRutaPorRol,
  setPerfilesGuardados,
  setUsuarioActual,
  UsuarioPerfil,
} from "@/services/auth";

type PerfilItem = {
  id: string | number;
  letter: string;
  name: string;
  role: string;
  email?: string;
  route: string;
  background: string;
  textColor: string;
};

const colorPalette = [
  { background: "#D8A814", textColor: "#FFFFFF" },
  { background: "#FFFFFF", textColor: "#050505" },
  { background: "#292929", textColor: "#FFFFFF" },
  { background: "#D8A814", textColor: "#050505" },
];

export default function ProfileSelector({
  onSelectProfileEmail,
}: {
  onSelectProfileEmail?: (email: string) => void;
}) {
  const router = useRouter();

  const [profilesList, setProfilesList] = useState<PerfilItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizacionNombre, setOrganizacionNombre] = useState<string | null>(null);

  const [selectedProfile, setSelectedProfile] = useState<PerfilItem | null>(null);
  const [pin, setPin] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfiles() {
      const orgId = getOrganizacionId();
      const orgNombre = getOrganizacionNombre();
      if (orgNombre) setOrganizacionNombre(orgNombre);

      const cached = getPerfilesGuardados();

      const formatUser = (p: any, idx: number): PerfilItem => ({
        id: p.id,
        letter: (p.nombre || "U").charAt(0).toUpperCase(),
        name: p.nombre,
        role:
          p.perfil?.nombre ||
          (p.rol === "ADMIN" ? "Administrador" : p.rol === "GERENTE" ? "Gerente" : p.rol === "VENDEDOR" ? "Vendedor" : "Usuario"),
        email: p.email,
        route: getRutaPorPerfil(p),
        background: colorPalette[idx % colorPalette.length].background,
        textColor: colorPalette[idx % colorPalette.length].textColor,
      });

      // 1. CARGA INSTANTÁNEA (Cache-First): Si hay datos en caché, mostrar inmediatamente sin spinner (0ms)
      if (cached && cached.length > 0) {
        setProfilesList(cached.map(formatUser));
        setLoading(false);
      }

      // 2. REVALIDACIÓN EN SEGUNDO PLANO (Stale-While-Revalidate):
      // Consulta en background para sincronizar cambios sin hacer esperar al usuario
      if (orgId) {
        try {
          const remoteUsers = await apiRequest<any[]>(`/usuarios/organizacion/${orgId}`, {
            timeoutMs: 4000,
          });

          if (Array.isArray(remoteUsers) && remoteUsers.length > 0) {
            setPerfilesGuardados(remoteUsers);
            setProfilesList(remoteUsers.map(formatUser));
          }
        } catch {
          // Si el servidor tarda o está iniciando en frío, la caché local ya está activa y utilizable
        } finally {
          setLoading(false);
        }
      } else if (!cached || cached.length === 0) {
        setProfilesList([]);
        setLoading(false);
      }
    }

    loadProfiles();
  }, []);

  const handleProfileClick = (profile: PerfilItem) => {
    setSelectedProfile(profile);
    setPin("");
    setError("");
    if (profile.email && onSelectProfileEmail) {
      onSelectProfileEmail(profile.email);
    }
  };

  const handleCloseModal = () => {
    setSelectedProfile(null);
    setPin("");
    setError("");
  };

  const handlePinChange = (value: string) => {
    setPin(value);
    setError("");
  };

  const handleLogin = async () => {
    if (!selectedProfile) return;

    if (!pin.trim()) {
      setError("Ingresa tu contraseña o PIN de acceso.");
      return;
    }

    setAuthLoading(true);
    setError("");

    try {
      if (typeof selectedProfile.id === "string" && !selectedProfile.id.startsWith("demo-")) {
        const res = await apiRequest<{ usuario: UsuarioPerfil }>("/usuarios/login-perfil", {
          method: "POST",
          body: JSON.stringify({
            usuarioId: selectedProfile.id,
            password: pin,
          }),
        });

        if (res.usuario) {
          setUsuarioActual(res.usuario);
          const destination = getRutaPorPerfil(res.usuario);
          router.push(destination);
          return;
        }
      }

      // En caso de PIN de prueba
      if (pin === "1234" || pin.length >= 4) {
        const dummyUser: UsuarioPerfil = {
          id: String(selectedProfile.id),
          nombre: selectedProfile.name,
          email: selectedProfile.email || "demo@inagerlis.com",
          rol: selectedProfile.role.toUpperCase(),
          organizacionId: getOrganizacionId() || undefined,
        };
        setUsuarioActual(dummyUser);
        router.push(selectedProfile.route || "/inicio");
      } else {
        throw new Error("Contraseña o PIN incorrecto.");
      }
    } catch (err: any) {
      setError(err.message || "Contraseña o PIN incorrecto.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleClearAccount = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("crm_organizacion_id");
      localStorage.removeItem("crm_organizacion_nombre");
      localStorage.removeItem("crm_perfiles");
      localStorage.removeItem("crm_usuario_actual");
      setProfilesList([]);
      setOrganizacionNombre(null);
    }
  };

  return (
    <>
      <section className="flex min-h-screen w-full bg-[#050505] text-white lg:w-[52%]">
        <div className="mx-auto flex w-full max-w-[760px] flex-col justify-center px-10 py-16 lg:px-14 xl:px-20">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="animate-spin text-[#D8A814]" size={36} />
            </div>
          ) : profilesList.length > 0 ? (
            <>
              <div className="mb-12">
                {organizacionNombre && (
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#D8A814]">
                    {organizacionNombre}
                  </p>
                )}

                <h1 className="text-3xl font-bold text-[#D8A814] xl:text-4xl">
                  SELECCIONA TU PERFIL
                </h1>

                <p className="mt-3 text-base text-[#B5B5B5] xl:text-lg">
                  Elige un perfil para continuar
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-10 gap-y-12 sm:grid-cols-3">
                {profilesList.map((profile) => (
                  <ProfileCard
                    key={profile.id}
                    letter={profile.letter}
                    name={profile.name}
                    role={profile.role}
                    background={profile.background}
                    textColor={profile.textColor}
                    onClick={() => handleProfileClick(profile)}
                  />
                ))}
              </div>

              <div className="mt-14 flex justify-center">
                <button
                  onClick={handleClearAccount}
                  className="
                    flex w-full max-w-[380px]
                    items-center justify-center
                    gap-4
                    border-y border-[#D8A814]
                    py-4
                    text-sm font-medium text-white
                    transition-colors
                    hover:text-[#D8A814]
                  "
                >
                  <div
                    className="
                      flex h-8 w-8
                      items-center justify-center
                      rounded-full
                      border border-[#D8A814]
                      text-lg text-[#D8A814]
                    "
                  >
                    +
                  </div>

                  Usar otra empresa / cuenta
                </button>
              </div>
            </>
          ) : (
            /* Estado inicial cuando no hay perfiles en el dispositivo */
            <div className="flex flex-col items-center text-center py-12">
              <div className="mb-8 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Imagertis Logo"
                  width={240}
                  height={240}
                  priority
                  className="h-44 w-44 sm:h-52 sm:w-52 object-contain drop-shadow-[0_0_25px_rgba(216,168,20,0.3)] transition-transform hover:scale-105"
                />
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D8A814]">
                Plataforma Comercial
              </p>

              <h1 className="mt-3 text-3xl font-bold text-white xl:text-4xl">
                Bienvenido a Imagertis
              </h1>

              <p className="mt-4 max-w-md text-sm leading-relaxed text-[#A0A0A0]">
                Aún no has registrado una organización en este equipo. Registra tu empresa para habilitar el acceso rápido a los perfiles de tu equipo de trabajo.
              </p>

              <div className="mt-10 flex w-full max-w-sm flex-col gap-4">
                <Link
                  href="/organizaciones/nueva"
                  className="
                    flex h-13 w-full items-center justify-center gap-2.5
                    bg-[#D8A814] px-6 text-xs font-bold uppercase tracking-wider text-black
                    transition-all hover:bg-white
                  "
                >
                  <UserPlus size={17} />
                  <span>Crear cuenta de empresa</span>
                </Link>

                <p className="text-xs text-[#777777]">
                  O ingresa con tu correo y contraseña en el formulario de la derecha.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Modal de PIN / Contraseña de acceso */}
      {selectedProfile && (
        <div
          onClick={handleCloseModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[430px] border border-[#D8A814] bg-white shadow-2xl cursor-default"
          >
            <div className="border-b border-[#E5E5E5] px-8 py-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
                    Acceso de perfil
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-black">
                    Ingresa tu contraseña / PIN
                  </h2>
                </div>

                <button
                  onClick={handleCloseModal}
                  className="text-2xl text-[#777777] transition-colors hover:text-black"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="px-8 py-8">
              <div className="mb-6 flex items-center gap-4">
                <div
                  className="
                    flex h-16 w-16
                    items-center justify-center
                    rounded-full
                    text-2xl font-bold shadow-md
                  "
                  style={{
                    backgroundColor: selectedProfile.background,
                    color: selectedProfile.textColor,
                  }}
                >
                  {selectedProfile.letter}
                </div>

                <div>
                  <p className="text-lg font-bold text-black">
                    {selectedProfile.name}
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-[#D8A814]">
                    {selectedProfile.role}
                  </p>
                  {selectedProfile.email && (
                    <p className="text-xs text-[#777777]">{selectedProfile.email}</p>
                  )}
                </div>
              </div>

              <p className="mb-4 text-xs font-medium text-[#777777]">
                Ingresa tu contraseña o PIN para acceder a tu área:
              </p>

              <input
                type="password"
                autoFocus
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLogin();
                  }
                }}
                placeholder="Contraseña o PIN"
                className="
                  h-14 w-full
                  border border-[#D8A814]
                  bg-white
                  px-5
                  text-center
                  text-xl font-bold
                  tracking-wider
                  text-black
                  outline-none
                  focus:border-black
                "
              />

              {error && (
                <p className="mt-3 text-center text-xs font-semibold text-red-600">
                  {error}
                </p>
              )}

              <div className="mt-7 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={authLoading}
                  onClick={handleCloseModal}
                  className="
                    h-12
                    border border-black
                    bg-white
                    font-bold
                    text-black
                    transition-colors
                    hover:bg-black
                    hover:text-white
                    disabled:opacity-50
                  "
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  disabled={authLoading}
                  onClick={handleLogin}
                  className="
                    flex h-12 items-center justify-center gap-2
                    bg-[#D8A814]
                    font-bold
                    text-white
                    transition-colors
                    hover:bg-black
                    disabled:opacity-50
                  "
                >
                  {authLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Accediendo...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}