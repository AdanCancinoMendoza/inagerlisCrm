"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Building2,
  KeyRound,
  LockKeyhole,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSidebar } from "@/context/SidebarContext";

const users = [
  {
    id: 1,
    name: "Adán Morales",
    email: "adan@empresa.com",
    initial: "A",
    role: "Administrador",
    branch: "Sucursal Centro",
    status: true,
    lastAccess: "Hoy, 10:42 AM",
  },
  {
    id: 2,
    name: "María López",
    email: "maria@empresa.com",
    initial: "M",
    role: "Vendedora",
    branch: "Sucursal Centro",
    status: true,
    lastAccess: "Hoy, 09:18 AM",
  },
  {
    id: 3,
    name: "José Ramírez",
    email: "jose@empresa.com",
    initial: "J",
    role: "Cajero",
    branch: "Sucursal Cholula",
    status: true,
    lastAccess: "Ayer, 06:25 PM",
  },
  {
    id: 4,
    name: "Karen Castillo",
    email: "karen@empresa.com",
    initial: "K",
    role: "Supervisor",
    branch: "Sucursal Cholula",
    status: false,
    lastAccess: "25 Ago 2026",
  },
];

const roles = [
  {
    id: 1,
    name: "Administrador",
    users: 2,
    description: "Acceso completo al sistema.",
  },
  {
    id: 2,
    name: "Supervisor",
    users: 4,
    description: "Supervisión de ventas, usuarios y reportes.",
  },
  {
    id: 3,
    name: "Vendedor",
    users: 7,
    description: "Clientes, seguimientos, ventas y campañas.",
  },
  {
    id: 4,
    name: "Cajero",
    users: 5,
    description: "Acceso al punto de venta y operaciones de caja.",
  },
  {
    id: 5,
    name: "Almacén",
    users: 3,
    description: "Artículos, stock, movimientos y ajustes.",
  },
];

const permissionModules = [
  {
    module: "Inicio",
    read: true,
    create: false,
    update: false,
    delete: false,
  },
  {
    module: "Clientes",
    read: true,
    create: true,
    update: true,
    delete: false,
  },
  {
    module: "Artículos",
    read: true,
    create: true,
    update: true,
    delete: false,
  },
  {
    module: "Stock",
    read: true,
    create: true,
    update: true,
    delete: false,
  },
  {
    module: "Promociones",
    read: true,
    create: true,
    update: true,
    delete: false,
  },
  {
    module: "Ventas",
    read: true,
    create: true,
    update: false,
    delete: false,
  },
  {
    module: "Reportes",
    read: true,
    create: false,
    update: false,
    delete: false,
  },
  {
    module: "Configuración",
    read: false,
    create: false,
    update: false,
    delete: false,
  },
];

export default function UsuariosPage() {
  const { collapsed } = useSidebar();
  const [activeTab, setActiveTab] = useState("Usuarios");
  const [selectedRole, setSelectedRole] = useState("Supervisor");

  const tabs = ["Usuarios", "Roles", "Permisos"];

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Sidebar />

      <div className={`min-h-screen transition-all duration-300 ${collapsed ? "ml-[80px]" : "ml-[250px]"}`}>
        <Header />

        <div className="p-10">
          {/* Encabezado */}
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
                Administración
              </p>

              <h1 className="mt-2 text-3xl font-bold text-black">
                Usuarios y permisos
              </h1>

              <p className="mt-2 text-sm text-[#777777]">
                Administra usuarios, roles y accesos dentro de tu organización.
              </p>
            </div>

            {activeTab === "Usuarios" && (
              <button className="flex h-12 items-center gap-2 bg-[#D8A814] px-6 font-bold text-white hover:bg-black">
                <Plus size={17} />
                Nuevo usuario
              </button>
            )}

            {activeTab === "Roles" && (
              <button className="flex h-12 items-center gap-2 bg-[#D8A814] px-6 font-bold text-white hover:bg-black">
                <Plus size={17} />
                Nuevo rol
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="mb-6 flex border-b border-[#DCDCDC]">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  border-b-2 px-6 py-4
                  text-sm font-semibold
                  transition-colors
                  ${
                    activeTab === tab
                      ? "border-[#D8A814] text-[#D8A814]"
                      : "border-transparent text-[#777777] hover:text-black"
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* USUARIOS */}
          {activeTab === "Usuarios" && (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="border border-[#D8A814] bg-[#D8A814] p-6 text-white">
                  <p className="text-xs font-bold uppercase tracking-wider">
                    Usuarios
                  </p>
                  <p className="mt-3 text-3xl font-bold">21</p>
                </div>

                <div className="border border-[#E2E2E2] bg-white p-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                    Activos
                  </p>
                  <p className="mt-3 text-3xl font-bold text-black">18</p>
                </div>

                <div className="border border-[#E2E2E2] bg-white p-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                    Roles
                  </p>
                  <p className="mt-3 text-3xl font-bold text-black">5</p>
                </div>

                <div className="border border-[#E2E2E2] bg-white p-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                    Sucursales
                  </p>
                  <p className="mt-3 text-3xl font-bold text-black">3</p>
                </div>
              </div>

              <div className="my-6 flex gap-3">
                <div className="flex h-12 flex-1 items-center border border-[#E0E0E0] bg-white px-4">
                  <Search size={18} className="mr-3 text-[#999999]" />

                  <input
                    placeholder="Buscar usuario, correo o rol..."
                    className="h-full w-full bg-transparent text-black outline-none"
                  />
                </div>

                <select className="h-12 min-w-[190px] border border-[#E0E0E0] bg-white px-4 text-black">
                  <option>Todos los roles</option>
                  <option>Administrador</option>
                  <option>Supervisor</option>
                  <option>Vendedor</option>
                  <option>Cajero</option>
                  <option>Almacén</option>
                </select>

                <select className="h-12 min-w-[200px] border border-[#E0E0E0] bg-white px-4 text-black">
                  <option>Todas las sucursales</option>
                  <option>Sucursal Centro</option>
                  <option>Sucursal Cholula</option>
                </select>
              </div>

              <section className="border border-[#E2E2E2] bg-white">
                <div className="grid grid-cols-[2fr_1.2fr_1.3fr_1fr_1.3fr_.4fr] bg-[#FAFAFA] px-6 py-4">
                  <p className="text-xs font-bold uppercase text-[#777777]">
                    Usuario
                  </p>

                  <p className="text-xs font-bold uppercase text-[#777777]">
                    Rol
                  </p>

                  <p className="text-xs font-bold uppercase text-[#777777]">
                    Sucursal
                  </p>

                  <p className="text-xs font-bold uppercase text-[#777777]">
                    Estado
                  </p>

                  <p className="text-xs font-bold uppercase text-[#777777]">
                    Último acceso
                  </p>

                  <span />
                </div>

                {users.map((user) => (
                  <div
                    key={user.id}
                    className="grid grid-cols-[2fr_1.2fr_1.3fr_1fr_1.3fr_.4fr] items-center border-t border-[#EEEEEE] px-6 py-5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#050505] font-bold text-white">
                        {user.initial}
                      </div>

                      <div>
                        <p className="font-bold text-black">
                          {user.name}
                        </p>

                        <p className="mt-1 text-xs text-[#999999]">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-[#D8A814]" />
                      <p className="text-sm font-semibold text-black">
                        {user.role}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-[#888888]" />

                      <p className="text-sm text-[#555555]">
                        {user.branch}
                      </p>
                    </div>

                    <div>
                      <span
                        className={`px-3 py-1 text-xs font-bold ${
                          user.status
                            ? "bg-[#D8A814] text-white"
                            : "bg-[#EEEEEE] text-[#777777]"
                        }`}
                      >
                        {user.status ? "ACTIVO" : "INACTIVO"}
                      </span>
                    </div>

                    <p className="text-sm text-[#666666]">
                      {user.lastAccess}
                    </p>

                    <button className="flex justify-end text-[#777777] hover:text-black">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                ))}
              </section>
            </>
          )}

          {/* ROLES */}
          {activeTab === "Roles" && (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => {
                    setSelectedRole(role.name);
                    setActiveTab("Permisos");
                  }}
                  className="border border-[#E2E2E2] bg-white p-7 text-left hover:border-[#D8A814]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center bg-[#050505] text-white">
                        <ShieldCheck size={21} />
                      </div>

                      <div>
                        <h2 className="text-xl font-bold text-black">
                          {role.name}
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-[#777777]">
                          {role.description}
                        </p>
                      </div>
                    </div>

                    <span className="text-xl text-[#D8A814]">
                      →
                    </span>
                  </div>

                  <div className="mt-7 flex items-center justify-between border-t border-[#EEEEEE] pt-5">
                    <div className="flex items-center gap-2">
                      <UsersRound size={17} className="text-[#888888]" />

                      <p className="text-sm text-[#777777]">
                        Usuarios asignados
                      </p>
                    </div>

                    <p className="text-xl font-bold text-[#D8A814]">
                      {role.users}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* PERMISOS */}
          {activeTab === "Permisos" && (
            <>
              <section className="border border-[#E2E2E2] bg-white">
                <div className="flex items-center justify-between border-b border-[#EEEEEE] px-7 py-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                      Rol seleccionado
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-black">
                      {selectedRole}
                    </h2>

                    <p className="mt-1 text-sm text-[#888888]">
                      Define qué acciones puede realizar este rol.
                    </p>
                  </div>

                  <select
                    value={selectedRole}
                    onChange={(event) =>
                      setSelectedRole(event.target.value)
                    }
                    className="h-11 min-w-[220px] border border-[#D8A814] bg-white px-4 text-sm font-semibold text-black outline-none"
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-[2fr_repeat(4,1fr)] bg-[#FAFAFA] px-6 py-4">
                  <p className="text-xs font-bold uppercase text-[#777777]">
                    Módulo
                  </p>

                  <p className="text-center text-xs font-bold uppercase text-[#777777]">
                    Ver
                  </p>

                  <p className="text-center text-xs font-bold uppercase text-[#777777]">
                    Crear
                  </p>

                  <p className="text-center text-xs font-bold uppercase text-[#777777]">
                    Editar
                  </p>

                  <p className="text-center text-xs font-bold uppercase text-[#777777]">
                    Eliminar
                  </p>
                </div>

                {permissionModules.map((permission) => (
                  <div
                    key={permission.module}
                    className="grid grid-cols-[2fr_repeat(4,1fr)] items-center border-t border-[#EEEEEE] px-6 py-5"
                  >
                    <div className="flex items-center gap-3">
                      <LockKeyhole
                        size={17}
                        className="text-[#D8A814]"
                      />

                      <p className="font-bold text-black">
                        {permission.module}
                      </p>
                    </div>

                    {[
                      permission.read,
                      permission.create,
                      permission.update,
                      permission.delete,
                    ].map((allowed, index) => (
                      <div
                        key={index}
                        className="flex justify-center"
                      >
                        <button
                          className={`
                            flex h-7 w-12 items-center
                            transition-colors
                            ${
                              allowed
                                ? "justify-end bg-[#D8A814]"
                                : "justify-start bg-[#CCCCCC]"
                            }
                          `}
                        >
                          <span className="mx-1 h-5 w-5 bg-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                ))}

                <div className="flex justify-end border-t border-[#EEEEEE] px-7 py-5">
                  <button className="h-12 bg-[#D8A814] px-7 font-bold text-white hover:bg-black">
                    Guardar permisos
                  </button>
                </div>
              </section>

              <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
                <div className="border border-[#E2E2E2] bg-white p-6">
                  <KeyRound size={22} className="text-[#D8A814]" />

                  <h3 className="mt-4 font-bold text-black">
                    Acceso al sistema
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#777777]">
                    Define si el rol puede iniciar sesión en CRM, POS o ambos.
                  </p>
                </div>

                <div className="border border-[#E2E2E2] bg-white p-6">
                  <UserRound size={22} className="text-[#D8A814]" />

                  <h3 className="mt-4 font-bold text-black">
                    Datos sensibles
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#777777]">
                    Limita precios de compra, márgenes, costos o información
                    fiscal.
                  </p>
                </div>

                <div className="border border-[#050505] bg-[#050505] p-6 text-white">
                  <BadgeCheck size={22} className="text-[#D8A814]" />

                  <h3 className="mt-4 font-bold">
                    Permisos especiales
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#999999]">
                    Autorizar descuentos, cancelaciones, devoluciones o ajustes
                    de stock.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}