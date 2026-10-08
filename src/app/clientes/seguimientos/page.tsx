"use client";

import { useState, useEffect, useMemo } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSidebar } from "@/context/SidebarContext";
import { CalendarCheck, Plus, Check, X, Search } from "lucide-react";

interface FollowUp {
  id: string;
  customer: string;
  phone: string;
  type: string;
  note: string;
  date: string;
  time: string;
  status: "Pendiente" | "Completado";
}

export default function SeguimientosPage() {
  const { collapsed } = useSidebar();
  const [items, setItems] = useState<FollowUp[]>([]);
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("Todos los tipos");
  const [modalNuevo, setModalNuevo] = useState(false);

  // Form states
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState("Llamada");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("crm_clientes_seguimientos");
      if (saved) {
        try {
          setItems(JSON.parse(saved));
        } catch {
          setItems([]);
        }
      }
    }
  }, []);

  const saveItems = (newItems: FollowUp[]) => {
    setItems(newItems);
    if (typeof window !== "undefined") {
      localStorage.setItem("crm_clientes_seguimientos", JSON.stringify(newItems));
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.trim() || !note.trim()) return;

    const now = new Date();
    const newItem: FollowUp = {
      id: Date.now().toString(),
      customer: customer.trim(),
      phone: phone.trim(),
      type,
      note: note.trim(),
      date: now.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }),
      time: now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
      status: "Pendiente",
    };

    saveItems([newItem, ...items]);
    setCustomer("");
    setPhone("");
    setNote("");
    setModalNuevo(false);
  };

  const handleToggleStatus = (id: string) => {
    const updated = items.map((it) => {
      if (it.id === id) {
        return {
          ...it,
          status: (it.status === "Pendiente" ? "Completado" : "Pendiente") as "Pendiente" | "Completado",
        };
      }
      return it;
    });
    saveItems(updated);
  };

  const filteredItems = useMemo(() => {
    const term = search.toLowerCase().trim();
    return items.filter((item) => {
      const matchText =
        item.customer.toLowerCase().includes(term) ||
        item.note.toLowerCase().includes(term) ||
        item.phone.includes(term);

      if (!matchText) return false;

      if (typeFilter !== "Todos los tipos" && item.type !== typeFilter) {
        return false;
      }

      if (activeFilter === "Completados") {
        return item.status === "Completado";
      } else if (activeFilter !== "Todos") {
        return item.status === "Pendiente";
      }

      return true;
    });
  }, [items, search, typeFilter, activeFilter]);

  const pendientesCount = items.filter((i) => i.status === "Pendiente").length;
  const completadosCount = items.filter((i) => i.status === "Completado").length;

  const filters = [
    "Todos",
    "Pendientes",
    "Completados",
  ];

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Sidebar />

      <div className={`min-h-screen transition-all duration-300 ${collapsed ? "ml-[80px]" : "ml-[250px]"}`}>
        <Header />

        <div className="p-10">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
                Clientes
              </p>

              <h1 className="mt-2 text-3xl font-bold text-black">
                Seguimientos
              </h1>

              <p className="mt-2 text-sm text-[#777777]">
                Gestiona encargos, notas, llamadas y actividades pendientes de tus clientes.
              </p>
            </div>

            <button
              onClick={() => setModalNuevo(true)}
              className="flex items-center gap-2 h-12 bg-[#D8A814] px-6 font-bold text-white hover:bg-black transition-colors"
            >
              <Plus size={18} />
              Nuevo seguimiento
            </button>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="border border-[#D8A814] bg-[#D8A814] p-5 text-white">
              <p className="text-xs font-bold uppercase tracking-wider">
                Total seguimientos
              </p>
              <p className="mt-2 text-3xl font-bold">{items.length}</p>
            </div>

            <div className="border border-[#E5E5E5] bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Pendientes
              </p>
              <p className="mt-2 text-3xl font-bold text-black">{pendientesCount}</p>
            </div>

            <div className="border border-[#E5E5E5] bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Completados
              </p>
              <p className="mt-2 text-3xl font-bold text-black">{completadosCount}</p>
            </div>
          </div>

          <div className="mb-6 flex border-b border-[#DDDDDD]">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`
                  border-b-2 px-6 py-4
                  text-sm font-semibold
                  transition-colors
                  ${
                    activeFilter === filter
                      ? "border-[#D8A814] text-[#D8A814]"
                      : "border-transparent text-[#777777] hover:text-black"
                  }
                `}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="mb-6 flex gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar cliente o seguimiento..."
                className="h-12 w-full border border-[#E0E0E0] bg-white pl-11 pr-5 text-black outline-none focus:border-[#D8A814]"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-12 min-w-[180px] border border-[#E0E0E0] bg-white px-4 text-black outline-none focus:border-[#D8A814]"
            >
              <option>Todos los tipos</option>
              <option>Llamada</option>
              <option>Encargo</option>
              <option>Nota</option>
              <option>Seguimiento</option>
            </select>
          </div>

          <div className="border border-[#E5E5E5] bg-white">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CalendarCheck size={44} className="text-[#CCCCCC]" />
                <p className="mt-4 text-base font-bold text-black">
                  No hay seguimientos registrados
                </p>
                <p className="mt-1 text-xs text-[#777777]">
                  Crea llamadas, notas o encargos para llevar control de la comunicación con tus clientes.
                </p>
                <button
                  onClick={() => setModalNuevo(true)}
                  className="mt-4 bg-[#D8A814] px-5 py-2.5 text-xs font-bold text-white hover:bg-black transition-colors"
                >
                  + Agregar primer seguimiento
                </button>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-5 border-b border-[#EEEEEE] p-6 last:border-none ${
                    item.status === "Completado" ? "opacity-60 bg-[#FAFAFA]" : ""
                  }`}
                >
                  <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-[#050505] font-bold text-white">
                    {(item.customer || "C").charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className={`font-bold text-black ${item.status === "Completado" ? "line-through text-[#777777]" : ""}`}>
                        {item.customer}
                      </p>

                      <span className="border border-[#D8A814] px-2 py-1 text-[11px] font-bold uppercase text-[#D8A814]">
                        {item.type}
                      </span>

                      {item.status === "Completado" && (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold uppercase">
                          Completado
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-[#999999]">
                      {item.phone || "Sin teléfono"}
                    </p>

                    <p className="mt-3 text-sm leading-6 text-[#555555]">
                      {item.note}
                    </p>
                  </div>

                  <div className="min-w-[130px] text-right">
                    <p className="text-sm font-bold text-black">
                      {item.date}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[#D8A814]">
                      {item.time}
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(item.id)}
                    className="h-10 border border-black px-4 text-xs font-bold text-black transition-colors hover:bg-black hover:text-white"
                  >
                    {item.status === "Completado" ? "Reactivar" : "Completar"}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL NUEVO SEGUIMIENTO */}
      {modalNuevo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white p-6 shadow-xl border border-[#E5E5E5]">
            <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-4">
              <h3 className="text-lg font-bold text-black">Nuevo seguimiento de cliente</h3>
              <button onClick={() => setModalNuevo(false)} className="text-[#999999] hover:text-black">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#777777] mb-1">
                  Cliente *
                </label>
                <input
                  required
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  placeholder="Nombre del cliente"
                  className="h-11 w-full border border-[#DCDCDC] px-3 text-sm text-black outline-none focus:border-[#D8A814]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#777777] mb-1">
                  Teléfono
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Teléfono o WhatsApp"
                  className="h-11 w-full border border-[#DCDCDC] px-3 text-sm text-black outline-none focus:border-[#D8A814]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#777777] mb-1">
                  Tipo de actividad
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="h-11 w-full border border-[#DCDCDC] px-3 text-sm text-black outline-none focus:border-[#D8A814]"
                >
                  <option>Llamada</option>
                  <option>Encargo</option>
                  <option>Nota</option>
                  <option>Seguimiento</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#777777] mb-1">
                  Nota / Detalle *
                </label>
                <textarea
                  required
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Escribe el contenido del seguimiento..."
                  className="w-full border border-[#DCDCDC] p-3 text-sm text-black outline-none focus:border-[#D8A814]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalNuevo(false)}
                  className="px-4 py-2 text-sm font-semibold text-[#777777] hover:text-black"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#D8A814] px-5 py-2 text-sm font-bold text-white hover:bg-black transition-colors"
                >
                  Guardar seguimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}