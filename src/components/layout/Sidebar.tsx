"use client";

import Image from "next/image";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

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
  ReceiptText

} from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

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
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[250px] flex-col bg-[#050505] text-white">
      {/* Logo */}
      <div className="flex h-24 shrink-0 items-center justify-center border-b border-[#262626] px-4">
        <Image
          src="/logo.png"
          alt="Imagertis logo"
          width={220}
          height={90}
          priority
          className="h-auto w-[150px] object-contain"
        />
      </div>

      {/* Navegación */}
      <nav
        className="
          flex-1 overflow-y-auto px-5 py-8

          [&::-webkit-scrollbar]:hidden
          [-ms-overflow-style:none]
          [scrollbar-width:none]
        "
      >
        <p className="mb-4 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#777777]">
          Principal
        </p>

        {/* Inicio */}
        <button
          onClick={() => goTo("/inicio")}
          className={`
            flex h-12 w-full items-center
            gap-3 border-l-2 px-4
            text-left text-sm font-medium
            transition-colors
            ${
              pathname === "/inicio"
                ? "border-[#D8A814] bg-[#141414] text-[#D8A814]"
                : "border-transparent text-[#C5C5C5] hover:text-white"
            }
          `}
        >
          <House size={18} strokeWidth={1.8} />

          <span>Inicio</span>
        </button>

        {/* Clientes */}
        <div className="mt-2">
          <button
            onClick={() => setClientesOpen(!clientesOpen)}
            className={`
              flex h-12 w-full items-center
              gap-3 border-l-2 px-4
              text-left text-sm font-medium
              transition-colors
              ${
                pathname.startsWith("/clientes")
                  ? "border-[#D8A814] text-[#D8A814]"
                  : "border-transparent text-[#C5C5C5] hover:text-white"
              }
            `}
          >
            <Users size={18} strokeWidth={1.8} />

            <span className="flex-1">
              Clientes
            </span>

            <ChevronDown
              size={15}
              className={`
                transition-transform duration-200
                ${clientesOpen ? "rotate-180" : ""}
              `}
            />
          </button>

          {clientesOpen && (
            <div className="ml-[27px] border-l border-[#2B2B2B] pl-5">
              <button
                onClick={() => goTo("/clientes")}
                className={`
                  block w-full py-3 text-left text-sm
                  ${
                    pathname === "/clientes"
                      ? "font-semibold text-[#D8A814]"
                      : "text-[#8F8F8F] hover:text-white"
                  }
                `}
              >
                Todos los clientes
              </button>

              <button
                onClick={() => goTo("/clientes/nuevos")}
                className={`
                  block w-full py-3 text-left text-sm
                  ${
                    pathname === "/clientes/nuevos"
                      ? "font-semibold text-[#D8A814]"
                      : "text-[#8F8F8F] hover:text-white"
                  }
                `}
              >
                Nuevos
              </button>

              <button
                onClick={() => goTo("/clientes/frecuentes")}
                className={`
                  block w-full py-3 text-left text-sm
                  ${
                    pathname === "/clientes/frecuentes"
                      ? "font-semibold text-[#D8A814]"
                      : "text-[#8F8F8F] hover:text-white"
                  }
                `}
              >
                Frecuentes
              </button>

              <button
                onClick={() => goTo("/clientes/seguimientos")}
                className={`
                  block w-full py-3 text-left text-sm
                  ${
                    pathname === "/clientes/seguimientos"
                      ? "font-semibold text-[#D8A814]"
                      : "text-[#8F8F8F] hover:text-white"
                  }
                `}
              >
                Seguimientos
              </button>
            </div>
          )}
        </div>

        {/* Artículos */}
        <div className="mt-2">
          <button
            onClick={() => setArticulosOpen(!articulosOpen)}
            className={`
              flex h-12 w-full items-center
              gap-3 border-l-2 px-4
              text-left text-sm font-medium
              transition-colors
              ${
                pathname.startsWith("/articulos")
                  ? "border-[#D8A814] text-[#D8A814]"
                  : "border-transparent text-[#C5C5C5] hover:text-white"
              }
            `}
          >
            <Package size={18} strokeWidth={1.8} />

            <span className="flex-1">
              Artículos
            </span>

            <ChevronDown
              size={15}
              className={`
                transition-transform duration-200
                ${articulosOpen ? "rotate-180" : ""}
              `}
            />
          </button>

          {articulosOpen && (
            <div className="ml-[27px] border-l border-[#2B2B2B] pl-5">
              <button
                onClick={() => goTo("/articulos")}
                className={`
                  block w-full py-3 text-left text-sm
                  ${
                    pathname === "/articulos"
                      ? "font-semibold text-[#D8A814]"
                      : "text-[#8F8F8F] hover:text-white"
                  }
                `}
              >
                Todos los artículos
              </button>

              <button
                onClick={() => goTo("/articulos/familias")}
                className={`
                  block w-full py-3 text-left text-sm
                  ${
                    pathname === "/articulos/familias"
                      ? "font-semibold text-[#D8A814]"
                      : "text-[#8F8F8F] hover:text-white"
                  }
                `}
              >
                Familias
              </button>

              <button
                onClick={() => goTo("/articulos/subfamilias")}
                className={`
                  block w-full py-3 text-left text-sm
                  ${
                    pathname === "/articulos/subfamilias"
                      ? "font-semibold text-[#D8A814]"
                      : "text-[#8F8F8F] hover:text-white"
                  }
                `}
              >
                Subfamilias
              </button>

              <button
                onClick={() => goTo("/articulos/importar")}
                className={`
                  block w-full py-3 text-left text-sm
                  ${
                    pathname === "/articulos/importar"
                      ? "font-semibold text-[#D8A814]"
                      : "text-[#8F8F8F] hover:text-white"
                  }
                `}
              >
                Importar
              </button>

              <button
                onClick={() => goTo("/articulos/estadisticas")}
                className={`
                  block w-full py-3 text-left text-sm
                  ${
                    pathname === "/articulos/estadisticas"
                      ? "font-semibold text-[#D8A814]"
                      : "text-[#8F8F8F] hover:text-white"
                  }
                `}
              >
                Estadísticas
              </button>
            </div>
          )}
        </div>

        {/* Stock */}
        <div className="mt-2">
          <button
            onClick={() => setStockOpen(!stockOpen)}
            className={`
              flex h-12 w-full items-center
              gap-3 border-l-2 px-4
              text-left text-sm font-medium
              transition-colors
              ${
                pathname.startsWith("/stock")
                  ? "border-[#D8A814] text-[#D8A814]"
                  : "border-transparent text-[#C5C5C5] hover:text-white"
              }
            `}
          >
            <Boxes size={18} strokeWidth={1.8} />

            <span className="flex-1">
              Stock
            </span>

            <ChevronDown
              size={15}
              className={`
                transition-transform duration-200
                ${stockOpen ? "rotate-180" : ""}
              `}
            />
          </button>

          {stockOpen && (
            <div className="ml-[27px] border-l border-[#2B2B2B] pl-5">
              <button
                onClick={() => goTo("/stock")}
                className={`
                  block w-full py-3 text-left text-sm
                  ${
                    pathname === "/stock"
                      ? "font-semibold text-[#D8A814]"
                      : "text-[#8F8F8F] hover:text-white"
                  }
                `}
              >
                Existencias
              </button>

              <button
                onClick={() => goTo("/stock/movimientos")}
                className={`
                  block w-full py-3 text-left text-sm
                  ${
                    pathname === "/stock/movimientos"
                      ? "font-semibold text-[#D8A814]"
                      : "text-[#8F8F8F] hover:text-white"
                  }
                `}
              >
                Movimientos
              </button>

              <button
                onClick={() => goTo("/stock/ajustes")}
                className={`
                  block w-full py-3 text-left text-sm
                  ${
                    pathname === "/stock/ajustes"
                      ? "font-semibold text-[#D8A814]"
                      : "text-[#8F8F8F] hover:text-white"
                  }
                `}
              >
                Ajustes
              </button>

              <button
                onClick={() => goTo("/stock/alertas")}
                className={`
                  block w-full py-3 text-left text-sm
                  ${
                    pathname === "/stock/alertas"
                      ? "font-semibold text-[#D8A814]"
                      : "text-[#8F8F8F] hover:text-white"
                  }
                `}
              >
                Alertas
              </button>
            </div>
          )}
        </div>

        {/* Promociones */}
        <button
          onClick={() => goTo("/promociones")}
          className={`
            mt-2 flex h-12 w-full items-center
            gap-3 border-l-2 px-4 text-left
            text-sm font-medium transition-colors
            ${
              pathname.startsWith("/promociones")
                ? "border-[#D8A814] bg-[#141414] text-[#D8A814]"
                : "border-transparent text-[#C5C5C5] hover:text-white"
            }
          `}
        >
          <Tags size={18} strokeWidth={1.8} />

          <span>Promociones</span>
        </button>

        {/* Usuarios */}
        <button
          onClick={() => goTo("/usuarios")}
          className={`
            mt-2 flex h-12 w-full items-center
            gap-3 border-l-2 px-4 text-left
            text-sm font-medium transition-colors
            ${
              pathname.startsWith("/usuarios")
                ? "border-[#D8A814] bg-[#141414] text-[#D8A814]"
                : "border-transparent text-[#C5C5C5] hover:text-white"
            }
          `}
        >
          <UserRoundCog size={18} strokeWidth={1.8} />

          <span>Usuarios</span>
        </button>

        {/* Configuración */}
        <button
          onClick={() => goTo("/configuracion")}
          className={`
            mt-2 flex h-12 w-full items-center
            gap-3 border-l-2 px-4 text-left
            text-sm font-medium transition-colors
            ${
              pathname.startsWith("/configuracion")
                ? "border-[#D8A814] bg-[#141414] text-[#D8A814]"
                : "border-transparent text-[#C5C5C5] hover:text-white"
            }
          `}
        >
          <Settings size={18} strokeWidth={1.8} />

          <span>Configuración</span>
        </button>

        {/* Operaciones */}
        <div className="mt-8">
          <p className="mb-4 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#777777]">
            Operaciones
          </p>

          <button
            onClick={() => goTo("/ventas")}
            className={`
              flex h-12 w-full items-center
              gap-3 border-l-2 px-4 text-left
              text-sm font-medium transition-colors
              ${
                pathname.startsWith("/ventas")
                  ? "border-[#D8A814] bg-[#141414] text-[#D8A814]"
                  : "border-transparent text-[#C5C5C5] hover:text-white"
              }
            `}
          >
            <ShoppingCart size={18} strokeWidth={1.8} />

            <span>Ventas</span>
          </button>

          <button
        onClick={() => goTo("/tickets")}
        className={`
          flex h-12 w-full items-center
          gap-3 border-l-2 px-4 text-left
          text-sm font-medium transition-colors
          ${
            pathname.startsWith("/tickets")
              ? "border-[#D8A814] bg-[#141414] text-[#D8A814]"
              : "border-transparent text-[#C5C5C5] hover:text-white"
          }
        `}
      >
        <ReceiptText size={18} strokeWidth={1.8} />

        <span>Historial de tickets</span>
      </button>

          <button
            onClick={() => goTo("/reportes")}
            className={`
              flex h-12 w-full items-center
              gap-3 border-l-2 px-4 text-left
              text-sm font-medium transition-colors
              ${
                pathname.startsWith("/reportes")
                  ? "border-[#D8A814] bg-[#141414] text-[#D8A814]"
                  : "border-transparent text-[#C5C5C5] hover:text-white"
              }
            `}
          >
            <ChartNoAxesCombined size={18} strokeWidth={1.8} />

            <span>Reportes</span>
          </button>
        </div>
      </nav>

      {/* Usuario */}
      <div className="shrink-0 border-t border-[#262626] bg-[#050505] p-5">
        <button className="flex w-full items-center gap-3">
          <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-[#D8A814] font-bold text-white">
            A
          </div>

          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-semibold">
              Adán Morales
            </p>

            <p className="text-xs text-[#D8A814]">
              Supervisor
            </p>
          </div>
        </button>
      </div>
    </aside>
  );
}