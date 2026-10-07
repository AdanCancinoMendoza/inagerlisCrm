"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { getNombrePerfil } from "@/services/auth";
import { usePwa } from "@/context/PwaContext";

import {
  House,
  Users,
  Package,
  Boxes,
  Tags,
  Settings,
  ShoppingCart,
  ChartNoAxesCombined,
  ChevronDown,
  UserRoundCog,
  ReceiptText,
  WalletCards,
  PanelLeftClose,
  PanelLeftOpen,
  CreditCard,
  LogOut,
  Download,
} from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { collapsed, toggleSidebar } = useSidebar();
  const { isInstallable, isInstalled, installPwa } = usePwa();

  const [clientesOpen, setClientesOpen] = useState(
    pathname.startsWith("/clientes")
  );

  const [articulosOpen, setArticulosOpen] = useState(
    pathname.startsWith("/articulos")
  );

  const [stockOpen, setStockOpen] = useState(
    pathname.startsWith("/stock")
  );

  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const current = localStorage.getItem("crm_usuario_actual");
      if (current) {
        try {
          setUsuario(JSON.parse(current));
        } catch {}
      }
    }
  }, []);

  const canVer = (mod: string) => {
    if (!usuario) return true;
    if (usuario.perfil?.esAdmin || usuario.rol === "ADMIN") return true;
    if (!usuario.perfil?.permisos?.modulos) return true;
    const m = (usuario.perfil.permisos.modulos as any)[mod];
    return m ? Boolean(m.ver) : false;
  };

  const goTo = (route: string) => {
    router.push(route);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("crm_usuario_actual");
      window.location.href = "/login";
    }
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col bg-[var(--dark-bg)] text-white transition-all duration-300 ${
        collapsed ? "w-[80px]" : "w-[250px]"
      }`}
    >
      {/* Logo y Botón Colapsar */}
      <div className="flex h-24 shrink-0 items-center justify-between border-b border-[var(--dark-border)] px-4">
        {!collapsed ? (
          <Image
            src="/logo.png"
            alt="Logo"
            width={150}
            height={60}
            priority
            className="h-auto w-[130px] object-contain cursor-pointer"
            onClick={() => goTo("/inicio")}
          />
        ) : (
          <div
            onClick={() => goTo("/inicio")}
            className="mx-auto flex h-10 w-10 items-center justify-center border border-[var(--primary)] font-bold text-[var(--primary)] cursor-pointer"
          >
            C
          </div>
        )}

        <button
          onClick={toggleSidebar}
          title={collapsed ? "Desplegar menú" : "Ocultar menú"}
          className="text-[#777777] hover:text-white transition-colors"
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Navegación */}
      <nav
        className="
          flex-1 overflow-y-auto px-3 py-6

          [&::-webkit-scrollbar]:hidden
          [-ms-overflow-style:none]
          [scrollbar-width:none]
        "
      >
        {!collapsed && (
          <p className="mb-4 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#777777]">
            Principal
          </p>
        )}

        {/* Inicio */}
        {canVer("inicio") && (
          <button
            onClick={() => goTo("/inicio")}
            title="Inicio"
            className={`
              flex h-12 w-full items-center
              border-l-2 transition-colors
              ${collapsed ? "justify-center px-0" : "gap-3 px-4 text-left"}
              text-sm font-medium
              ${
                pathname === "/inicio"
                  ? "border-[var(--primary)] bg-[#141414] text-[var(--primary)]"
                  : "border-transparent text-[#C5C5C5] hover:text-white"
              }
            `}
          >
            <House size={18} strokeWidth={1.8} />
            {!collapsed && <span>Inicio</span>}
          </button>
        )}

        {/* Clientes */}
        {canVer("clientes") && (
          <div className="mt-2">
            <button
              onClick={() => (collapsed ? goTo("/clientes") : setClientesOpen(!clientesOpen))}
              title="Clientes"
              className={`
                flex h-12 w-full items-center
                border-l-2 transition-colors
                ${collapsed ? "justify-center px-0" : "gap-3 px-4 text-left"}
                text-sm font-medium
                ${
                  pathname.startsWith("/clientes")
                    ? "border-[var(--primary)] text-[var(--primary)]"
                    : "border-transparent text-[#C5C5C5] hover:text-white"
                }
              `}
            >
              <Users size={18} strokeWidth={1.8} />
              {!collapsed && (
                <>
                  <span className="flex-1">Clientes</span>
                  <ChevronDown
                    size={15}
                    className={`transition-transform duration-200 ${clientesOpen ? "rotate-180" : ""}`}
                  />
                </>
              )}
            </button>

            {!collapsed && clientesOpen && (
              <div className="ml-[27px] border-l border-[#2B2B2B] pl-5">
                <button
                  onClick={() => goTo("/clientes")}
                  className={`block w-full py-2.5 text-left text-sm ${
                    pathname === "/clientes" ? "font-semibold text-[var(--primary)]" : "text-[#8F8F8F] hover:text-white"
                  }`}
                >
                  Todos los clientes
                </button>
              </div>
            )}
          </div>
        )}

        {/* Artículos (con submódulos de Productos, Stock, Familias y Unidades) */}
        {(canVer("articulos") || canVer("stock")) && (
          <div className="mt-2">
            <button
              onClick={() => (collapsed ? goTo("/articulos") : setArticulosOpen(!articulosOpen))}
              title="Artículos"
              className={`
                flex h-12 w-full items-center
                border-l-2 transition-colors
                ${collapsed ? "justify-center px-0" : "gap-3 px-4 text-left"}
                text-sm font-medium
                ${
                  pathname.startsWith("/articulos") || pathname.startsWith("/stock")
                    ? "border-[var(--primary)] text-[var(--primary)]"
                    : "border-transparent text-[#C5C5C5] hover:text-white"
                }
              `}
            >
              <Package size={18} strokeWidth={1.8} />
              {!collapsed && (
                <>
                  <span className="flex-1">Artículos</span>
                  <ChevronDown
                    size={15}
                    className={`transition-transform duration-200 ${articulosOpen ? "rotate-180" : ""}`}
                  />
                </>
              )}
            </button>

            {!collapsed && articulosOpen && (
              <div className="ml-[27px] border-l border-[#2B2B2B] pl-4 flex flex-col gap-1 my-1">
                <button
                  onClick={() => goTo("/articulos")}
                  className={`block w-full py-2 text-left text-xs transition-colors ${
                    pathname === "/articulos" ? "font-bold text-[var(--primary)]" : "text-[#8F8F8F] hover:text-white"
                  }`}
                >
                  Productos (Catálogo)
                </button>

                <button
                  onClick={() => goTo("/stock")}
                  className={`block w-full py-2 text-left text-xs transition-colors ${
                    pathname.startsWith("/stock") ? "font-bold text-[var(--primary)]" : "text-[#8F8F8F] hover:text-white"
                  }`}
                >
                  Stock / Inventario
                </button>

                <button
                  onClick={() => goTo("/articulos/familias")}
                  className={`block w-full py-2 text-left text-xs transition-colors ${
                    pathname.startsWith("/articulos/familias") ? "font-bold text-[var(--primary)]" : "text-[#8F8F8F] hover:text-white"
                  }`}
                >
                  Familias y Subfamilias
                </button>

                <button
                  onClick={() => goTo("/articulos/unidades")}
                  className={`block w-full py-2 text-left text-xs transition-colors ${
                    pathname.startsWith("/articulos/unidades") ? "font-bold text-[var(--primary)]" : "text-[#8F8F8F] hover:text-white"
                  }`}
                >
                  Unidades de Medida
                </button>
              </div>
            )}
          </div>
        )}

        {/* Promociones */}
        {canVer("promociones") && (
          <button
            onClick={() => goTo("/promociones")}
            title="Promociones"
            className={`
              mt-2 flex h-12 w-full items-center
              border-l-2 transition-colors
              ${collapsed ? "justify-center px-0" : "gap-3 px-4 text-left"}
              text-sm font-medium
              ${
                pathname.startsWith("/promociones")
                  ? "border-[var(--primary)] bg-[#141414] text-[var(--primary)]"
                  : "border-transparent text-[#C5C5C5] hover:text-white"
              }
            `}
          >
            <Tags size={18} strokeWidth={1.8} />
            {!collapsed && <span>Promociones</span>}
          </button>
        )}

        {/* Usuarios y Perfiles */}
        {canVer("usuarios") && (
          <button
            onClick={() => goTo("/usuarios")}
            title="Usuarios y Perfiles"
            className={`
              mt-2 flex h-12 w-full items-center
              border-l-2 transition-colors
              ${collapsed ? "justify-center px-0" : "gap-3 px-4 text-left"}
              text-sm font-medium
              ${
                pathname.startsWith("/usuarios")
                  ? "border-[var(--primary)] bg-[#141414] text-[var(--primary)]"
                  : "border-transparent text-[#C5C5C5] hover:text-white"
              }
            `}
          >
            <UserRoundCog size={18} strokeWidth={1.8} />
            {!collapsed && <span>Usuarios</span>}
          </button>
        )}

        {/* Configuración */}
        {canVer("configuracion") && (
          <button
            onClick={() => goTo("/configuracion")}
            title="Configuración"
            className={`
              mt-2 flex h-12 w-full items-center
              border-l-2 transition-colors
              ${collapsed ? "justify-center px-0" : "gap-3 px-4 text-left"}
              text-sm font-medium
              ${
                pathname.startsWith("/configuracion")
                  ? "border-[var(--primary)] bg-[#141414] text-[var(--primary)]"
                  : "border-transparent text-[#C5C5C5] hover:text-white"
              }
            `}
          >
            <Settings size={18} strokeWidth={1.8} />
            {!collapsed && <span>Configuración</span>}
          </button>
        )}

        {/* Suscripciones (para administradores de la organización) */}
        {(usuario?.perfil?.esAdmin || usuario?.rol === "ADMIN") && (
          <button
            onClick={() => goTo("/suscripciones")}
            title="Suscripciones"
            className={`
              mt-2 flex h-12 w-full items-center
              border-l-2 transition-colors
              ${collapsed ? "justify-center px-0" : "gap-3 px-4 text-left"}
              text-sm font-medium
              ${
                pathname.startsWith("/suscripciones") || pathname.startsWith("/subscripciones")
                  ? "border-[var(--primary)] bg-[#141414] text-[var(--primary)]"
                  : "border-transparent text-[#C5C5C5] hover:text-white"
              }
            `}
          >
            <CreditCard size={18} strokeWidth={1.8} />
            {!collapsed && <span>Suscripciones</span>}
          </button>
        )}

        {/* Operaciones */}
        {(canVer("ventas") || canVer("caja") || canVer("tickets") || canVer("reportes")) && (
          <div className="mt-6">
            {!collapsed && (
              <p className="mb-4 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#777777]">
                Operaciones
              </p>
            )}

            {canVer("ventas") && (
              <button
                onClick={() => goTo("/ventas")}
                title="Ventas"
                className={`
                  flex h-12 w-full items-center
                  border-l-2 transition-colors
                  ${collapsed ? "justify-center px-0" : "gap-3 px-4 text-left"}
                  text-sm font-medium
                  ${
                    pathname.startsWith("/ventas")
                      ? "border-[var(--primary)] bg-[#141414] text-[var(--primary)]"
                      : "border-transparent text-[#C5C5C5] hover:text-white"
                  }
                `}
              >
                <ShoppingCart size={18} strokeWidth={1.8} />
                {!collapsed && <span>Ventas</span>}
              </button>
            )}

            {canVer("caja") && (
              <button
                onClick={() => goTo("/caja")}
                title="Caja Registradora"
                className={`
                  mt-2 flex h-12 w-full items-center
                  border-l-2 transition-colors
                  ${collapsed ? "justify-center px-0" : "gap-3 px-4 text-left"}
                  text-sm font-medium
                  ${
                    pathname.startsWith("/caja")
                      ? "border-[var(--primary)] bg-[#141414] text-[var(--primary)]"
                      : "border-transparent text-[#C5C5C5] hover:text-white"
                  }
                `}
              >
                <WalletCards size={18} strokeWidth={1.8} />
                {!collapsed && <span>Caja Registradora</span>}
              </button>
            )}

            {canVer("tickets") && (
              <button
                onClick={() => goTo("/tickets")}
                title="Historial de tickets"
                className={`
                  mt-2 flex h-12 w-full items-center
                  border-l-2 transition-colors
                  ${collapsed ? "justify-center px-0" : "gap-3 px-4 text-left"}
                  text-sm font-medium
                  ${
                    pathname.startsWith("/tickets")
                      ? "border-[var(--primary)] bg-[#141414] text-[var(--primary)]"
                      : "border-transparent text-[#C5C5C5] hover:text-white"
                  }
                `}
              >
                <ReceiptText size={18} strokeWidth={1.8} />
                {!collapsed && <span>Historial de tickets</span>}
              </button>
            )}

            {canVer("reportes") && (
              <button
                onClick={() => goTo("/reportes")}
                title="Reportes"
                className={`
                  mt-2 flex h-12 w-full items-center
                  border-l-2 transition-colors
                  ${collapsed ? "justify-center px-0" : "gap-3 px-4 text-left"}
                  text-sm font-medium
                  ${
                    pathname.startsWith("/reportes")
                      ? "border-[var(--primary)] bg-[#141414] text-[var(--primary)]"
                      : "border-transparent text-[#C5C5C5] hover:text-white"
                  }
                `}
              >
                <ChartNoAxesCombined size={18} strokeWidth={1.8} />
                {!collapsed && <span>Reportes</span>}
              </button>
            )}
          </div>
        )}

        {/* Botón Descargar / Instalar PWA */}
        {isInstallable && !isInstalled && (
          <div className="mt-6 pt-4 border-t border-[#222222]">
            <button
              onClick={installPwa}
              title="Instalar Inagerlis en este equipo"
              className={`
                flex h-11 w-full items-center
                border border-[#D8A814]/40 bg-[#D8A814]/10 text-[#D8A814]
                hover:bg-[#D8A814] hover:text-black transition-all
                ${collapsed ? "justify-center px-0" : "gap-3 px-3 text-left"}
                text-xs font-bold cursor-pointer active:scale-95
              `}
            >
              <Download size={16} />
              {!collapsed && <span>Instalar Aplicación</span>}
            </button>
          </div>
        )}
      </nav>

      {/* Usuario Footer */}
      <div className="shrink-0 border-t border-[#262626] bg-[#050505] p-4">
        <div className={`flex w-full items-center justify-between ${collapsed ? "flex-col gap-3" : ""}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[var(--primary)] font-bold text-white">
              {(usuario?.nombre || "U").charAt(0).toUpperCase()}
            </div>

            {!collapsed && (
              <div className="min-w-0 text-left">
                <p className="truncate text-sm font-semibold text-white">{usuario?.nombre || "Usuario"}</p>
                <p className="text-xs text-[var(--primary)] font-medium">{getNombrePerfil(usuario)}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="flex h-9 w-9 items-center justify-center text-[#888888] hover:bg-red-500/20 hover:text-red-400 transition-colors rounded cursor-pointer"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}