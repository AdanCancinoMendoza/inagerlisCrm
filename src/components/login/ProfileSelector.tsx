"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProfileCard from "./ProfileCard";

const profiles = [
  {
    id: 1,
    letter: "A",
    name: "Adán Morales",
    role: "Supervisor",
    background: "#D8A814",
    textColor: "#FFFFFF",
  },
  {
    id: 2,
    letter: "M",
    name: "María López",
    role: "Vendedora",
    background: "#FFFFFF",
    textColor: "#050505",
  },
  {
    id: 3,
    letter: "J",
    name: "José Ramírez",
    role: "Vendedor",
    background: "#292929",
    textColor: "#FFFFFF",
  },
  {
    id: 4,
    letter: "L",
    name: "Luis Martínez",
    role: "Administrador",
    background: "#D8A814",
    textColor: "#FFFFFF",
  },
  {
    id: 5,
    letter: "K",
    name: "Karen Castillo",
    role: "Vendedora",
    background: "#FFFFFF",
    textColor: "#050505",
  },
  {
    id: 6,
    letter: "R",
    name: "Ricardo Sánchez",
    role: "Supervisor",
    background: "#292929",
    textColor: "#FFFFFF",
  },
];

export default function ProfileSelector() {
  const router = useRouter();

  const [selectedProfile, setSelectedProfile] =
    useState<(typeof profiles)[number] | null>(null);

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleProfileClick = (profile: (typeof profiles)[number]) => {
    setSelectedProfile(profile);
    setPin("");
    setError("");
  };

  const handleCloseModal = () => {
    setSelectedProfile(null);
    setPin("");
    setError("");
  };

  const handlePinChange = (value: string) => {
    const onlyNumbers = value.replace(/\D/g, "").slice(0, 4);

    setPin(onlyNumbers);
    setError("");
  };

  const handleLogin = () => {
    if (pin.length !== 4) {
      setError("Ingresa los 4 dígitos.");
      return;
    }

    // PIN de prueba
    if (pin !== "1234") {
      setError("PIN incorrecto.");
      return;
    }

    router.push("/inicio");
  };

  return (
    <>
      <section className="flex min-h-screen w-full bg-[#050505] text-white lg:w-[52%]">
        <div className="mx-auto flex w-full max-w-[760px] flex-col justify-center px-10 py-16 lg:px-14 xl:px-20">
          <div className="mb-14">
            <h1 className="text-3xl font-bold text-[#D8A814] xl:text-4xl">
              SELECCIONA TU PERFIL
            </h1>

            <p className="mt-3 text-base text-[#B5B5B5] xl:text-lg">
              Elige un perfil para continuar
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-14 sm:grid-cols-3">
            {profiles.map((profile) => (
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

          <div className="mt-16 flex justify-center">
            <button
              className="
                flex w-full max-w-[380px]
                items-center justify-center
                gap-4
                border-y border-[#D8A814]
                py-5
                text-base font-medium text-white
                transition-colors
                hover:text-[#D8A814]
              "
            >
              <div
                className="
                  flex h-10 w-10
                  items-center justify-center
                  rounded-full
                  border border-[#D8A814]
                  text-xl text-[#D8A814]
                "
              >
                +
              </div>

              Usar otra cuenta
            </button>
          </div>
        </div>
      </section>

      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-[430px] border border-[#D8A814] bg-white">
            <div className="border-b border-[#E5E5E5] px-8 py-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
                    Acceso
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-black">
                    Ingresa tu PIN
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
              <div className="mb-8 flex items-center gap-4">
                <div
                  className="
                    flex h-16 w-16
                    items-center justify-center
                    rounded-full
                    text-2xl font-bold
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

                  <p className="mt-1 text-sm font-medium text-[#D8A814]">
                    {selectedProfile.role}
                  </p>
                </div>
              </div>

              <p className="mb-5 text-sm text-[#777777]">
                Ingresa tu contraseña de 4 dígitos.
              </p>

              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                autoFocus
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLogin();
                  }
                }}
                className="
                  h-16 w-full
                  border border-[#D8A814]
                  bg-white
                  px-5
                  text-center
                  text-3xl font-bold
                  tracking-[0.6em]
                  text-black
                  outline-none
                  focus:border-black
                "
              />

              {error && (
                <p className="mt-3 text-center text-sm font-medium text-red-600">
                  {error}
                </p>
              )}

              <div className="mt-8 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="
                    h-14
                    border border-black
                    bg-white
                    font-bold
                    text-black
                    transition-colors
                    hover:bg-black
                    hover:text-white
                  "
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleLogin}
                  className="
                    h-14
                    bg-[#D8A814]
                    font-bold
                    text-white
                    transition-colors
                    hover:bg-black
                  "
                >
                  Entrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}