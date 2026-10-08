"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSidebar } from "@/context/SidebarContext";
import { CheckSquare, Plus, Check, Trash2, X } from "lucide-react";

interface PendingItem {
  id: string;
  customer: string;
  phone: string;
  note: string;
  date: string;
  time: string;
}

export default function PendientesPage() {
  const { collapsed } = useSidebar();
  const [items, setItems] = useState<PendingItem[]>([]);
  const [activeTab, setActiveTab] = useState("Todos");
  const [modalNuevo, setModalNuevo] = useState(false);

  // Form states
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  // Persistir en localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("crm_clientes_pendientes");
      if (saved) {
        try {
          setItems(JSON.parse(saved));
        } catch {
          setItems([]);
        }
      }
    }
  }, []);

  const saveItems = (newItems: PendingItem[]) => {
    setItems(newItems);
    if (typeof window !== "undefined") {
      localStorage.setItem("crm_clientes_pendientes", JSON.stringify(newItems));
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.trim() || !note.trim()) return;

    const now = new Date();
    const newItem: PendingItem = {
      id: Date.now().toString(),
      customer: customer.trim(),
      phone: phone.trim(),
      note: note.trim(),
      date: now.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }),
      time: now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
    };

    saveItems([newItem, ...items]);
    setCustomer("");
    setPhone("");
    setNote("");
    setModalNuevo(false);
  };

  const handleComplete = (id: string) => {
    saveItems(items.filter((item) => item.id !== id));
  };

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
                Pendientes
              </h1>

              <p className="mt-2 text-sm text-[#777777]">
                Indicaciones, encargos y tareas de seguimiento de tus clientes.
              </p>
            </div>

            <button
              onClick={() => setModalNuevo(true)}
              className="flex items-center gap-2 h-12 bg-[#D8A814] px-6 font-bold text-white hover:bg-black transition-colors"
            >
              <Plus size={18} />
              Nuevo pendiente
            </button>
          </div>

          <div className="mb-6 flex border-b border-[#DDDDDD]">
            {["Todos", "Hoy", "Próximos", "Vencidos"].map((option) => (
              <button
                key={option}
                onClick={() => setActiveTab(option)}
                className={`
                  border-b-2 px-6 py-4 text-sm font-semibold transition-colors
                  ${
                    activeTab === option
                      ? "border-[#D8A814] text-[#D8A814]"
                      : "border-transparent text-[#777777] hover:text-black"
                  }
                `}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="border border-[#E5E5E5] bg-white">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckSquare size={44} className="text-[#CCCCCC]" />
                <p className="mt-4 text-base font-bold text-black">
                  No hay pendientes registrados
                </p>
                <p className="mt-1 text-xs text-[#777777]">
                  No tienes encargos ni tareas pendientes por resolver.
                </p>
                <button
                  onClick={() => setModalNuevo(true)}
                  className="mt-4 bg-[#D8A814] px-5 py-2.5 text-xs font-bold text-white hover:bg-black transition-colors"
                >
                  + Agregar primer pendiente
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-5 border-b border-[#EEEEEE] p-6 last:border-none"
                >
                  <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-[#050505] font-bold text-white">
                    {(item.customer || "C").charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-black">
                        {item.customer}
                      </p>

                      {item.phone && (
                        <span className="text-xs text-[#999999]">
                          {item.phone}
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm text-[#555555]">
                      {item.note}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-black">
                      {item.date}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[#D8A814]">
                      {item.time}
                    </p>
                  </div>

                  <button
                    onClick={() => handleComplete(item.id)}
                    className="flex items-center gap-1 border border-black px-4 py-2 text-xs font-bold text-black hover:bg-black hover:text-white transition-colors"
                  >
                    <Check size={14} />
                    Completar
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL CREAR PENDIENTE */}
      {modalNuevo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white p-6 shadow-xl border border-[#E5E5E5]">
            <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-4">
              <h3 className="text-lg font-bold text-black">Nuevo pendiente de cliente</h3>
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
                  Nota / Encargo *
                </label>
                <textarea
                  required
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Descripción de la tarea o recordatorio..."
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
                  Guardar pendiente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}