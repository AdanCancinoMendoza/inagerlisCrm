"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Loader2, Lock, Mail, UserPlus } from "lucide-react";
import { apiRequest } from "@/services/api";
import { getRutaPorRol, getUsuarioActual, setUsuarioActual, UsuarioPerfil } from "@/services/auth";

export default function LoginForm({
  initialEmail = "",
}: {
  initialEmail?: string;
}) {
  const router = useRouter();

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [recordarme, setRecordarme] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Ingresa tu correo y contraseña.");
      return;
    }

    setLoading(true);

    try {
      const res = await apiRequest<{ usuario: UsuarioPerfil }>("/usuarios/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (res.usuario) {
        setUsuarioActual(res.usuario);
        const destination = getRutaPorRol(res.usuario.rol);
        router.push(destination);
      } else {
        throw new Error("Respuesta inválida del servidor");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Credenciales incorrectas o usuario no encontrado.");
    } finally {
      setLoading(false);
    }
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

        {/* Banner de error */}
        {errorMsg && (
          <div className="mb-5 flex items-start gap-2.5 border border-red-200 bg-red-50 p-3.5 text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
            <p className="text-xs font-semibold">{errorMsg}</p>
          </div>
        )}

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
                value={email}
                onChange={(e) => {
                  setErrorMsg(null);
                  setEmail(e.target.value);
                }}
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
                value={password}
                onChange={(e) => {
                  setErrorMsg(null);
                  setPassword(e.target.value);
                }}
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
                checked={recordarme}
                onChange={(e) => setRecordarme(e.target.checked)}
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
            disabled={loading}
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
              disabled:opacity-60
            "
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Validando...</span>
              </>
            ) : (
              <>
                <span>Iniciar sesión</span>
                <ArrowRight size={16} />
              </>
            )}
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