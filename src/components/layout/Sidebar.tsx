"use client";

import Image from "next/image";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";

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
} from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { collapsed, toggleSidebar } = useSidebar();

  const [clientesOpen, setClientesOpen] = useState(
    pathname.startsWith("/clientes")
  );

  const [articulosOpen, setArticulosOpen] = useState(
    pathname.startsWith("/articulos")
  );

  const [stockOpen, setStockOpen] = useState(
    pathname.startsWith("/stock")
  );

  const goTo = (route: string) => {
    router.push(route);
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
            className="mx-auto flex h-10 w-10 items-center justify-center border border-[#D8A814] font-bold text-[#D8A814] cursor-pointer"
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
                ? "border-[#D8A814] bg-[#141414] text-[#D8A814]"
                : "border-transparent text-[#C5C5C5] hover:text-white"
            }
          `}
        >
          <House size={18} strokeWidth={1.8} />
          {!collapsed && <span>Inicio</span>}
        </button>

        {/* Clientes */}
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
                  ? "border-[#D8A814] text-[#D8A814]"
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
                  pathname === "/clientes" ? "font-semibold text-[#D8A814]" : "text-[#8F8F8F] hover:text-white"
                }`}
              >
                Todos los clientes
              </button>
            </div>
          )}
        </div>

        {/* Artículos */}
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
                pathname.startsWith("/articulos")
                  ? "border-[#D8A814] text-[#D8A814]"
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
            <div className="ml-[27px] border-l border-[#2B2B2B] pl-5">
              <button
                onClick={() => goTo("/articulos")}
                className={`block w-full py-2.5 text-left text-sm ${
                  pathname === "/articulos" ? "font-semibold text-[#D8A814]" : "text-[#8F8F8F] hover:text-white"
                }`}
              >
                Todos los artículos
              </button>
            </div>
          )}
        </div>

        {/* Stock */}
        <div className="mt-2">
          <button
            onClick={() => (collapsed ? goTo("/stock") : setStockOpen(!stockOpen))}
            title="Stock / Inventario"
            className={`
              flex h-12 w-full items-center
              border-l-2 transition-colors
              ${collapsed ? "justify-center px-0" : "gap-3 px-4 text-left"}
              text-sm font-medium
              ${
                pathname.startsWith("/stock")
                  ? "border-[#D8A814] text-[#D8A814]"
                  : "border-transparent text-[#C5C5C5] hover:text-white"
              }
            `}
          >
            <Boxes size={18} strokeWidth={1.8} />
            {!collapsed && (
              <>
                <span className="flex-1">Stock</span>
                <ChevronDown
                  size={15}
                  className={`transition-transform duration-200 ${stockOpen ? "rotate-180" : ""}`}
                />
              </>
            )}
          </button>

          {!collapsed && stockOpen && (
            <div className="ml-[27px] border-l border-[#2B2B2B] pl-5">
              <button
                onClick={() => goTo("/stock")}
                className={`block w-full py-2.5 text-left text-sm ${
                  pathname === "/stock" ? "font-semibold text-[#D8A814]" : "text-[#8F8F8F] hover:text-white"
                }`}
              >
                Existencias
              </button>
            </div>
          )}
        </div>

        {/* Promociones */}
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
                ? "border-[#D8A814] bg-[#141414] text-[#D8A814]"
                : "border-transparent text-[#C5C5C5] hover:text-white"
            }
          `}
        >
          <Tags size={18} strokeWidth={1.8} />
          {!collapsed && <span>Promociones</span>}
        </button>

        {/* Usuarios */}
        <button
          onClick={() => goTo("/usuarios")}
          title="Usuarios"
          className={`
            mt-2 flex h-12 w-full items-center
            border-l-2 transition-colors
            ${collapsed ? "justify-center px-0" : "gap-3 px-4 text-left"}
            text-sm font-medium
            ${
              pathname.startsWith("/usuarios")
                ? "border-[#D8A814] bg-[#141414] text-[#D8A814]"
                : "border-transparent text-[#C5C5C5] hover:text-white"
            }
          `}
        >
          <UserRoundCog size={18} strokeWidth={1.8} />
          {!collapsed && <span>Usuarios</span>}
        </button>

        {/* Configuración */}
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
                ? "border-[#D8A814] bg-[#141414] text-[#D8A814]"
                : "border-transparent text-[#C5C5C5] hover:text-white"
            }
          `}
        >
          <Settings size={18} strokeWidth={1.8} />
          {!collapsed && <span>Configuración</span>}
        </button>

        {/* Operaciones */}
        <div className="mt-6">
          {!collapsed && (
            <p className="mb-4 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#777777]">
              Operaciones
            </p>
          )}

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
                  ? "border-[#D8A814] bg-[#141414] text-[#D8A814]"
                  : "border-transparent text-[#C5C5C5] hover:text-white"
              }
            `}
          >
            <ShoppingCart size={18} strokeWidth={1.8} />
            {!collapsed && <span>Ventas</span>}
          </button>

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
                  ? "border-[#D8A814] bg-[#141414] text-[#D8A814]"
                  : "border-transparent text-[#C5C5C5] hover:text-white"
              }
            `}
          >
            <WalletCards size={18} strokeWidth={1.8} />
            {!collapsed && <span>Caja Registradora</span>}
          </button>

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
                  ? "border-[#D8A814] bg-[#141414] text-[#D8A814]"
                  : "border-transparent text-[#C5C5C5] hover:text-white"
              }
            `}
          >
            <ReceiptText size={18} strokeWidth={1.8} />
            {!collapsed && <span>Historial de tickets</span>}
          </button>

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
                  ? "border-[#D8A814] bg-[#141414] text-[#D8A814]"
                  : "border-transparent text-[#C5C5C5] hover:text-white"
              }
            `}
          >
            <ChartNoAxesCombined size={18} strokeWidth={1.8} />
            {!collapsed && <span>Reportes</span>}
          </button>
        </div>
      </nav>

      {/* Usuario Footer */}
      <div className="shrink-0 border-t border-[#262626] bg-[#050505] p-4">
        <div className={`flex w-full items-center ${collapsed ? "justify-center" : "gap-3"}`}>
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#D8A814] font-bold text-white">
            A
          </div>

          {!collapsed && (
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-semibold">Adán Morales</p>
              <p className="text-xs text-[#D8A814]">Supervisor</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}