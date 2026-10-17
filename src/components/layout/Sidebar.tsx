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
  Megaphone,
  Settings,
  ShoppingCart,
  ChartNoAxesCombined,
  ChevronDown,
  UserRoundCog,
  ReceiptText,
  WalletCards,
  CreditCard,
  LogOut,
  Download,
  BarChart3,
  Building2,
  CalendarDays,
  Truck,
  Sparkles,
  X,
} from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { collapsed, mobileOpen, closeMobileSidebar } = useSidebar();
  const { isInstallable, isInstalled, installPwa } = usePwa();

  const isExpanded = !collapsed || mobileOpen;

  const [clientesOpen, setClientesOpen] = useState(
    pathname.startsWith("/clientes")
  );

  const [articulosOpen, setArticulosOpen] = useState(
    pathname.startsWith("/articulos")
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
    return m !== undefined ? Boolean(m.ver) : true;
  };

  const goTo = (route: string) => {
    closeMobileSidebar();
    router.push(route);
  };

  const handleLogout = () => {
    closeMobileSidebar();
    if (typeof window !== "undefined") {
      localStorage.removeItem("crm_usuario_actual");
      window.location.href = "/login";
    }
  };

  return (
    <>
      {/* Backdrop overlay para pantallas móviles */}
      {mobileOpen && (
        <div
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-xs transition-opacity lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar-nav no-scrollbar fixed left-0 top-0 z-50 flex h-screen flex-col bg-[var(--dark-bg)] text-white transition-all duration-300 ease-in-out w-[270px] max-w-[85vw] ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "lg:w-[80px]" : "lg:w-[250px]"}`}
      >
        {/* Cabecera con Logo y Botón de Cerrar en Móviles */}
        <div className="flex h-16 sm:h-20 lg:h-24 shrink-0 items-center justify-between border-b border-[var(--dark-border)] px-4">
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <Image
                src="/logo.png"
                alt="Logo Inagerlis"
                width={130}
                height={52}
                priority
                className="h-auto w-[120px] lg:w-[130px] object-contain cursor-pointer"
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
          </div>

          {/* Botón cerrar para móviles */}
          <button
            onClick={closeMobileSidebar}
            className="flex h-8 w-8 items-center justify-center border border-[#333333] text-[#888888] hover:text-white lg:hidden cursor-pointer"
            title="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navegación */}
        <nav className="sidebar-nav no-scrollbar flex-1 overflow-y-auto px-3 py-3 sm:py-4">
          {isExpanded && (
            <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#777777]">
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
                ${isExpanded ? "gap-3 px-4 text-left" : "justify-center px-0"}
                text-sm font-medium
                ${
                  pathname === "/inicio"
                    ? "border-[var(--primary)] bg-[#141414] text-[var(--primary)]"
                    : "border-transparent text-[#C5C5C5] hover:text-white"
                }
              `}
            >
              <House size={18} strokeWidth={1.8} />
              {isExpanded && <span>Inicio</span>}
            </button>
          )}

          {/* Ventas */}
          {canVer("ventas") && (
            <button
              onClick={() => goTo("/ventas")}
              title="Ventas"
              className={`
                mt-2 flex h-12 w-full items-center
                border-l-2 transition-colors
                ${isExpanded ? "gap-3 px-4 text-left" : "justify-center px-0"}
                text-sm font-medium
                ${
                  pathname.startsWith("/ventas")
                    ? "border-[var(--primary)] bg-[#141414] text-[var(--primary)]"
                    : "border-transparent text-[#C5C5C5] hover:text-white"
                }
              `}
            >
              <ShoppingCart size={18} strokeWidth={1.8} />
              {isExpanded && <span>Ventas</span>}
            </button>
          )}

          {/* Clientes */}
          {canVer("clientes") && (
            <div className="mt-2">
              <button
                onClick={() =>
                  collapsed && !mobileOpen
                    ? goTo("/clientes")
                    : setClientesOpen(!clientesOpen)
                }
                title="Clientes"
                className={`
                  flex h-12 w-full items-center
                  border-l-2 transition-colors
                  ${isExpanded ? "gap-3 px-4 text-left" : "justify-center px-0"}
                  text-sm font-medium
                  ${
                    pathname.startsWith("/clientes")
                      ? "border-[var(--primary)] text-[var(--primary)]"
                      : "border-transparent text-[#C5C5C5] hover:text-white"
                  }
                `}
              >
                <Users size={18} strokeWidth={1.8} />
                {isExpanded && (
                  <>
                    <span className="flex-1">Clientes</span>
                    <ChevronDown
                      size={15}
                      className={`transition-transform duration-200 ${
                        clientesOpen ? "rotate-180" : ""
                      }`}
                    />
                  </>
                )}
              </button>

              {isExpanded && clientesOpen && (
                <div className="ml-[27px] border-l border-[#2B2B2B] pl-5">
                  <button
                    onClick={() => goTo("/clientes")}
                    className={`block w-full py-2.5 text-left text-sm ${
                      pathname === "/clientes"
                        ? "font-semibold text-[var(--primary)]"
                        : "text-[#8F8F8F] hover:text-white"
                    }`}
                  >
                    Todos los clientes
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Artículos */}
          {(canVer("articulos") || canVer("stock")) && (
            <div className="mt-2">
              <button
                onClick={() =>
                  collapsed && !mobileOpen
                    ? goTo("/articulos")
                    : setArticulosOpen(!articulosOpen)
                }
                title="Artículos"
                className={`
                  flex h-12 w-full items-center
                  border-l-2 transition-colors
                  ${isExpanded ? "gap-3 px-4 text-left" : "justify-center px-0"}
                  text-sm font-medium
                  ${
                    pathname.startsWith("/articulos") || pathname.startsWith("/stock")
                      ? "border-[var(--primary)] text-[var(--primary)]"
                      : "border-transparent text-[#C5C5C5] hover:text-white"
                  }
                `}
              >
                <Package size={18} strokeWidth={1.8} />
                {isExpanded && (
                  <>
                    <span className="flex-1">Artículos</span>
                    <ChevronDown
                      size={15}
                      className={`transition-transform duration-200 ${
                        articulosOpen ? "rotate-180" : ""
                      }`}
                    />
                  </>
                )}
              </button>

              {isExpanded && articulosOpen && (
                <div className="ml-[27px] border-l border-[#2B2B2B] pl-4 flex flex-col gap-1 my-1">
                  <button
                    onClick={() => goTo("/articulos")}
                    className={`block w-full py-2 text-left text-xs transition-colors ${
                      pathname === "/articulos"
                        ? "font-bold text-[var(--primary)]"
                        : "text-[#8F8F8F] hover:text-white"
                    }`}
                  >
                    Productos (Catálogo)
                  </button>

                  <button
                    onClick={() => goTo("/stock")}
                    className={`block w-full py-2 text-left text-xs transition-colors ${
                      pathname.startsWith("/stock")
                        ? "font-bold text-[var(--primary)]"
                        : "text-[#8F8F8F] hover:text-white"
                    }`}
                  >
                    Stock / Inventario
                  </button>

                  <button
                    onClick={() => goTo("/articulos/familias")}
                    className={`block w-full py-2 text-left text-xs transition-colors ${
                      pathname.startsWith("/articulos/familias")
                        ? "font-bold text-[var(--primary)]"
                        : "text-[#8F8F8F] hover:text-white"
                    }`}
                  >
                    Familias y Subfamilias
                  </button>

                  <button
                    onClick={() => goTo("/articulos/unidades")}
                    className={`block w-full py-2 text-left text-xs transition-colors ${
                      pathname.startsWith("/articulos/unidades")
                        ? "font-bold text-[var(--primary)]"
                        : "text-[#8F8F8F] hover:text-white"
                    }`}
                  >
                    Unidades de Medida
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Proveedores */}
          {canVer("proveedores") && (
            <button
              onClick={() => goTo("/proveedores")}
              title="Proveedores"
              className={`
                mt-2 flex h-12 w-full items-center
                border-l-2 transition-colors
                ${isExpanded ? "gap-3 px-4 text-left" : "justify-center px-0"}
                text-sm font-medium
                ${
                  pathname.startsWith("/proveedores")
                    ? "border-[var(--primary)] bg-[#141414] text-[var(--primary)]"
                    : "border-transparent text-[#C5C5C5] hover:text-white"
                }
              `}
            >
              <Truck size={18} strokeWidth={1.8} />
              {isExpanded && <span>Proveedores</span>}
            </button>
          )}

          {/* Campañas */}
          {(canVer("promociones") || canVer("campañas")) && (
            <button
              onClick={() => goTo("/promociones")}
              title="Campañas"
              className={`
                mt-2 flex h-12 w-full items-center
                border-l-2 transition-colors
                ${isExpanded ? "gap-3 px-4 text-left" : "justify-center px-0"}
                text-sm font-medium
                ${
                  pathname.startsWith("/promociones") || pathname.startsWith("/campañas")
                    ? "border-[var(--primary)] bg-[#141414] text-[var(--primary)]"
                    : "border-transparent text-[#C5C5C5] hover:text-white"
                }
              `}
            >
              <Megaphone size={18} strokeWidth={1.8} />
              {isExpanded && <span>Campañas</span>}
            </button>
          )}

          {/* Calendario */}
          {canVer("calendario") && (
            <button
              onClick={() => goTo("/calendario")}
              title="Calendario"
              className={`
                mt-2 flex h-12 w-full items-center
                border-l-2 transition-colors
                ${isExpanded ? "gap-3 px-4 text-left" : "justify-center px-0"}
                text-sm font-medium
                ${
                  pathname.startsWith("/calendario")
                    ? "border-[var(--primary)] bg-[#141414] text-[var(--primary)]"
                    : "border-transparent text-[#C5C5C5] hover:text-white"
                }
              `}
            >
              <CalendarDays size={18} strokeWidth={1.8} />
              {isExpanded && <span>Calendario</span>}
            </button>
          )}

          {/* Usuarios */}
          {canVer("usuarios") && (
            <button
              onClick={() => goTo("/usuarios")}
              title="Usuarios y Perfiles"
              className={`
                mt-2 flex h-12 w-full items-center
                border-l-2 transition-colors
                ${isExpanded ? "gap-3 px-4 text-left" : "justify-center px-0"}
                text-sm font-medium
                ${
                  pathname.startsWith("/usuarios")
                    ? "border-[var(--primary)] bg-[#141414] text-[var(--primary)]"
                    : "border-transparent text-[#C5C5C5] hover:text-white"
                }
              `}
            >
              <UserRoundCog size={18} strokeWidth={1.8} />
              {isExpanded && <span>Usuarios</span>}
            </button>
          )}

          {/* Mi Organización */}
          {canVer("configuracion") && (
            <button
              onClick={() => goTo("/organizacion")}
              title="Mi Organización"
              className={`
                mt-2 flex h-12 w-full items-center
                border-l-2 transition-colors
                ${isExpanded ? "gap-3 px-4 text-left" : "justify-center px-0"}
                text-sm font-medium
                ${
                  pathname.startsWith("/organizacion") || pathname.startsWith("/mi-organizacion")
                    ? "border-[var(--primary)] bg-[#141414] text-[var(--primary)]"
                    : "border-transparent text-[#C5C5C5] hover:text-white"
                }
              `}
            >
              <Building2 size={18} strokeWidth={1.8} />
              {isExpanded && <span>Mi Organización</span>}
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
                ${isExpanded ? "gap-3 px-4 text-left" : "justify-center px-0"}
                text-sm font-medium
                ${
                  pathname.startsWith("/configuracion")
                    ? "border-[var(--primary)] bg-[#141414] text-[var(--primary)]"
                    : "border-transparent text-[#C5C5C5] hover:text-white"
                }
              `}
            >
              <Settings size={18} strokeWidth={1.8} />
              {isExpanded && <span>Configuración</span>}
            </button>
          )}

          {/* Suscripciones */}
          {(usuario?.perfil?.esAdmin || usuario?.rol === "ADMIN") && (
            <button
              onClick={() => goTo("/suscripciones")}
              title="Suscripciones"
              className={`
                mt-2 flex h-12 w-full items-center
                border-l-2 transition-colors
                ${isExpanded ? "gap-3 px-4 text-left" : "justify-center px-0"}
                text-sm font-medium
                ${
                  pathname.startsWith("/suscripciones") || pathname.startsWith("/subscripciones")
                    ? "border-[var(--primary)] bg-[#141414] text-[var(--primary)]"
                    : "border-transparent text-[#C5C5C5] hover:text-white"
                }
              `}
            >
              <CreditCard size={18} strokeWidth={1.8} />
              {isExpanded && <span>Suscripciones</span>}
            </button>
          )}

          {/* Operaciones */}
          {(canVer("ventas") || canVer("caja") || canVer("tickets") || canVer("reportes")) && (
            <div className="mt-6">
              {isExpanded && (
                <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#777777]">
                  Operaciones
                </p>
              )}

              {canVer("ventas") && (
                <button
                  onClick={() => goTo("/analiticas")}
                  title="Analíticas"
                  className={`
                    flex h-12 w-full items-center
                    border-l-2 transition-colors
                    ${isExpanded ? "gap-3 px-4 text-left" : "justify-center px-0"}
                    text-sm font-medium
                    ${
                      pathname.startsWith("/analiticas")
                        ? "border-[var(--primary)] bg-[#141414] text-[var(--primary)]"
                        : "border-transparent text-[#C5C5C5] hover:text-white"
                    }
                  `}
                >
                  <BarChart3 size={18} strokeWidth={1.8} />
                  {isExpanded && <span>Analíticas</span>}
                </button>
              )}

              {/* Asistente IA (Gemini) */}
              {canVer("ventas") && (
                <button
                  onClick={() => goTo("/asistente-ia")}
                  title="Asistente IA"
                  className={`
                    mt-2 flex h-12 w-full items-center
                    border-l-2 transition-colors
                    ${isExpanded ? "gap-3 px-4 text-left" : "justify-center px-0"}
                    text-sm font-medium
                    ${
                      pathname.startsWith("/asistente-ia")
                        ? "border-[#D8A814] bg-[#141414] text-[#D8A814]"
                        : "border-transparent text-[#C5C5C5] hover:text-[#D8A814]"
                    }
                  `}
                >
                  <Sparkles size={18} strokeWidth={1.8} className="text-[#D8A814]" />
                  {isExpanded && (
                    <span className="flex items-center justify-between flex-1">
                      <span>Asistente IA</span>
                      <span className="text-[9px] font-mono font-bold bg-[#D8A814] text-[#050505] px-1 py-0.5">
                        GEMINI
                      </span>
                    </span>
                  )}
                </button>
              )}

              {canVer("caja") && (
                <button
                  onClick={() => goTo("/caja")}
                  title="Caja Registradora"
                  className={`
                    mt-2 flex h-12 w-full items-center
                    border-l-2 transition-colors
                    ${isExpanded ? "gap-3 px-4 text-left" : "justify-center px-0"}
                    text-sm font-medium
                    ${
                      pathname.startsWith("/caja")
                        ? "border-[var(--primary)] bg-[#141414] text-[var(--primary)]"
                        : "border-transparent text-[#C5C5C5] hover:text-white"
                    }
                  `}
                >
                  <WalletCards size={18} strokeWidth={1.8} />
                  {isExpanded && <span>Caja Registradora</span>}
                </button>
              )}

              {canVer("tickets") && (
                <button
                  onClick={() => goTo("/tickets")}
                  title="Historial de tickets"
                  className={`
                    mt-2 flex h-12 w-full items-center
                    border-l-2 transition-colors
                    ${isExpanded ? "gap-3 px-4 text-left" : "justify-center px-0"}
                    text-sm font-medium
                    ${
                      pathname.startsWith("/tickets")
                        ? "border-[var(--primary)] bg-[#141414] text-[var(--primary)]"
                        : "border-transparent text-[#C5C5C5] hover:text-white"
                    }
                  `}
                >
                  <ReceiptText size={18} strokeWidth={1.8} />
                  {isExpanded && <span>Historial de tickets</span>}
                </button>
              )}

              {canVer("reportes") && (
                <button
                  onClick={() => goTo("/reportes")}
                  title="Reportes"
                  className={`
                    mt-2 flex h-12 w-full items-center
                    border-l-2 transition-colors
                    ${isExpanded ? "gap-3 px-4 text-left" : "justify-center px-0"}
                    text-sm font-medium
                    ${
                      pathname.startsWith("/reportes")
                        ? "border-[var(--primary)] bg-[#141414] text-[var(--primary)]"
                        : "border-transparent text-[#C5C5C5] hover:text-white"
                    }
                  `}
                >
                  <ChartNoAxesCombined size={18} strokeWidth={1.8} />
                  {isExpanded && <span>Reportes</span>}
                </button>
              )}
            </div>
          )}

          {/* Botón Instalar PWA */}
          {isInstallable && !isInstalled && (
            <div className="mt-6 pt-4 border-t border-[#222222]">
              <button
                onClick={installPwa}
                title="Instalar Inagerlis en este equipo"
                className={`
                  flex h-11 w-full items-center
                  border border-[#D8A814]/40 bg-[#D8A814]/10 text-[#D8A814]
                  hover:bg-[#D8A814] hover:text-black transition-all
                  ${isExpanded ? "gap-3 px-3 text-left" : "justify-center px-0"}
                  text-xs font-bold cursor-pointer active:scale-95
                `}
              >
                <Download size={16} />
                {isExpanded && <span>Instalar Aplicación</span>}
              </button>
            </div>
          )}
        </nav>

        {/* Usuario Footer */}
        <div className="shrink-0 border-t border-[#262626] bg-[#050505] p-3.5 sm:p-4">
          <div
            className={`flex w-full items-center justify-between ${
              isExpanded ? "" : "flex-col gap-3"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 flex-none items-center justify-center rounded-full bg-[var(--primary)] font-bold text-white text-xs sm:text-sm">
                {(usuario?.nombre || "U").charAt(0).toUpperCase()}
              </div>

              {isExpanded && (
                <div className="min-w-0 text-left">
                  <p className="truncate text-xs sm:text-sm font-semibold text-white">
                    {usuario?.nombre || "Usuario"}
                  </p>
                  <p className="text-[10px] sm:text-xs text-[var(--primary)] font-medium truncate">
                    {getNombrePerfil(usuario)}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="flex h-9 w-9 shrink-0 items-center justify-center text-[#888888] hover:bg-red-500/20 hover:text-red-400 transition-colors rounded cursor-pointer"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}