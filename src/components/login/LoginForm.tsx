"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, UserPlus } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/inicio");
  };

  return (
    <section
      className="
        relative
        flex
        h-screen
        max-h-screen
        w-full
        self-start
        items-center
        justify-center
        overflow-y-auto
        bg-white
        lg:sticky
        lg:top-0
        lg:w-[48%]
      "
    >
      {/* Accent edge line */}
      <div className="absolute bottom-0 left-0 top-0 hidden w-[3px] bg-[#050505] lg:block" />

      <div className="w-full max-w-[440px] px-8 py-10">
        {/* Logo */}
        <div className="mb-4 flex justify-center">
          <div className="h-[140px] w-[140px]">
            <Image
              src="/logo.png"
              alt="Logo CRM"
              width={140}
              height={140}
              priority
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        {/* Encabezado */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
            Bienvenido de nuevo
          </h2>

          <p className="mt-1.5 text-sm text-[#666666]">
            Ingresa tus credenciales para acceder al sistema
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Correo */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#444444]">
              Correo electrónico
            </label>

            <div className="relative flex items-center">
              <Mail size={18} className="absolute left-4 text-[#999999]" />
              <input
                type="email"
                required
                placeholder="ejemplo@empresa.com"
                className="
                  h-[50px]
                  w-full
                  border border-[#DDDDDD]
                  bg-white
                  pl-11
                  pr-4
                  text-sm
                  text-black
                  outline-none
                  placeholder:text-[#AAAAAA]
                  transition-colors
                  focus:border-black
                "
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#444444]">
              Contraseña
            </label>

            <div className="relative flex items-center">
              <Lock size={18} className="absolute left-4 text-[#999999]" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                className="
                  h-[50px]
                  w-full
                  border border-[#DDDDDD]
                  bg-white
                  pl-11
                  pr-4
                  text-sm
                  text-black
                  outline-none
                  placeholder:text-[#AAAAAA]
                  transition-colors
                  focus:border-black
                "
              />
            </div>
          </div>

          {/* Opciones */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-black">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[#CCCCCC] accent-black"
              />
              Recordarme
            </label>

            <button
              type="button"
              className="text-xs font-semibold text-[#666666] transition-colors hover:text-black hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Botón Iniciar Sesión */}
          <button
            type="submit"
            className="
              flex
              h-[50px]
              w-full
              items-center
              justify-center
              gap-2
              bg-[#050505]
              text-xs
              font-bold
              uppercase
              tracking-wider
              text-white
              transition-colors
              hover:bg-[#262626]
            "
          >
            <span>Iniciar sesión</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Sección de Registro / Crear Cuenta */}
        <div className="mt-8 border-t border-[#EEEEEE] pt-6 text-center">
          <p className="text-xs text-[#777777]">
            ¿No posees una cuenta registrada?
          </p>

          <Link
            href="/organizaciones/nueva"
            className="
              mt-3
              inline-flex
              h-[48px]
              w-full
              items-center
              justify-center
              gap-2
              border-2
              border-[#050505]
              bg-white
              px-4
              text-xs
              font-bold
              uppercase
              tracking-wider
              text-[#050505]
              transition-all
              hover:bg-[#050505]
              hover:text-white
            "
          >
            <UserPlus size={16} />
            <span>Crear cuenta de empresa</span>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-6">
          <p className="text-center text-[11px] text-[#888888]">
            © 2026 CRM + POS. Sistema de Gestión Comercial.
          </p>
        </div>
      </div>
    </section>
  );
}