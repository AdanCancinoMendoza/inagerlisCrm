"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, LogIn, ArrowRight } from "lucide-react";
import { getUsuarioActual } from "@/services/auth";

const publicRoutes = [
  "/login",
  "/organizaciones/nueva",
  "/organizaciones/registro-completado",
];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    // Si la ruta es pública, no se requiere verificación
    if (isPublic) {
      setIsAuthenticated(true);
      return;
    }

    const usuario = getUsuarioActual();
    if (!usuario) {
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, isPublic]);

  // Contador de redirección si no está autenticado
  useEffect(() => {
    if (isAuthenticated === false && !isPublic) {
      const timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isAuthenticated, isPublic]);

  // Redirección al llegar a 0
  useEffect(() => {
    if (isAuthenticated === false && !isPublic && countdown === 0) {
      router.push("/login");
    }
  }, [isAuthenticated, isPublic, countdown, router]);

  // Si está autenticado o es ruta pública, renderizar la app normalmente
  if (isAuthenticated === true || isPublic) {
    return <>{children}</>;
  }

  // Si se está verificando inicialmente
  if (isAuthenticated === null) {
    return null;
  }

  // Modal de alerta con fondo blanco y estética premium
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-[460px] overflow-hidden border border-[#E2E2E2] bg-white p-8 text-center shadow-2xl">
        {/* Línea decorativa superior dorada */}
        <div className="absolute left-0 right-0 top-0 h-1.5 bg-[#D8A814]" />

        {/* Logo */}
        <div className="mb-4 flex justify-center">
          <div className="h-20 w-20">
            <Image
              src="/logo.png"
              alt="Imagertis Logo"
              width={100}
              height={100}
              priority
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        {/* Icono de Seguridad */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#D8A814]/30 bg-[#FAFAFA] text-[#D8A814] shadow-sm">
          <Lock size={24} />
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D8A814]">
          Acceso Restringido
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-black">
          No has iniciado sesión
        </h2>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[#666666]">
          Para acceder a esta sección del sistema o al Punto de Venta, es necesario que ingreses con tus credenciales o elijas tu perfil.
        </p>

        <div className="mt-8 flex flex-col gap-3.5">
          <button
            onClick={() => router.push("/login")}
            className="
              flex h-12 w-full items-center justify-center gap-2.5
              bg-[#050505] px-6 text-xs font-bold uppercase tracking-wider text-white
              transition-all hover:bg-[#D8A814] hover:text-black cursor-pointer shadow-sm
            "
          >
            <LogIn size={16} />
            <span>Ir a iniciar sesión</span>
            <ArrowRight size={15} />
          </button>

          <p className="text-xs font-medium text-[#888888]">
            Redirigiendo automáticamente al login en{" "}
            <span className="font-bold text-[#D8A814]">{countdown}s</span>...
          </p>
        </div>
      </div>
    </div>
  );
}
