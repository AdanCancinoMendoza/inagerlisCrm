"use client";

import { useEffect, useState, useCallback } from "react";
import POSHeader from "@/components/pos/POSHeader";
import CustomerModal from "@/components/clientes/CustomerModal";
import { Cliente, CreateClienteInput, getClientes, createCliente } from "@/services/clientes";
import { getOrganizacionId, getUsuarioActual } from "@/services/auth";
import { useSocket } from "@/hooks/useSocket";
import { Plus, Search, UserCheck, Percent, Award, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function POSClientesPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalNuevo, setModalNuevo] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);

  const usuario = typeof window !== "undefined" ? getUsuarioActual() : null;
  const orgId = typeof window !== "undefined" ? (getOrganizacionId() || usuario?.organizacionId) : null;
  const room = orgId ? `org_${orgId}` : undefined;
  const { socket } = useSocket(room);

  const loadData = useCallback(async () => {
    const currentOrgId = getOrganizacionId() || getUsuarioActual()?.organizacionId;
    if (!currentOrgId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getClientes(currentOrgId);
      setCustomers(data);
    } catch (err) {
      console.error("Error al cargar clientes POS:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sincronización en tiempo real vía Socket.io
  useEffect(() => {
    if (!socket) return;

    const handleActualizar = () => {
      loadData();
    };

    socket.on("cliente:creado", handleActualizar);
    socket.on("cliente:actualizado", handleActualizar);
    socket.on("cliente:eliminado", handleActualizar);

    return () => {
      socket.off("cliente:creado", handleActualizar);
      socket.off("cliente:actualizado", handleActualizar);
      socket.off("cliente:eliminado", handleActualizar);
    };
  }, [socket, loadData]);

  const filtered = customers.filter(
    (c) =>
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (c.telefono && c.telefono.includes(search)) ||
      (c.rfc && c.rfc.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCrearNuevo = async (data: Omit<CreateClienteInput, "organizacionId">) => {
    const usuario = getUsuarioActual();
    const orgId = getOrganizacionId() || usuario?.organizacionId;
    if (!orgId) return;

    try {
      const nuevo = await createCliente({
        ...data,
        organizacionId: orgId,
      });
      setCustomers((prev) => [nuevo, ...prev]);
    } catch (err) {
      console.error("Error al registrar cliente:", err);
      alert("Hubo un error al registrar el cliente.");
    }
  };

  const handleAsignarAVenta = (c: Cliente) => {
    setClienteSeleccionado(c);
    // Redireccionar al POS de Venta con cliente seleccionado
    setTimeout(() => {
      router.push("/pos");
    }, 400);
  };

  return (
    <main className="min-h-screen bg-[#F4F4F4] text-black">
      <POSHeader activeTab="clientes" />

      <div className="p-8 max-w-[1400px] mx-auto">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Selección de Cliente POS</h1>
            <p className="text-sm text-[#777777]">
              Asigna un cliente a la venta actual para otorgar descuentos y acumular puntos de fidelidad.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              title="Recargar clientes"
              className="flex h-11 w-11 items-center justify-center rounded border border-[#CCCCCC] bg-white text-[#555555] hover:border-black transition-colors"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>

            <button
              onClick={() => setModalNuevo(true)}
              className="flex h-11 items-center gap-2 bg-[#D8A814] px-6 text-sm font-bold text-white hover:bg-black transition-colors shadow-xs"
            >
              <Plus size={18} /> Registrar Cliente Rápido
            </button>
          </div>
        </div>

        {/* Buscador */}
        <div className="mb-6 flex h-14 items-center border-2 border-[#D8A814] bg-white px-5 shadow-xs">
          <Search size={22} className="mr-4 text-[#D8A814]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente por nombre, teléfono o RFC para asignar a la venta..."
            className="h-full w-full bg-transparent text-base outline-none"
          />
        </div>

        {/* Grid de tarjetas de cliente estilo POS */}
        {loading ? (
          <div className="flex min-h-[250px] items-center justify-center rounded-xl border border-[#E5E5E5] bg-white">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D8A814] border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-[#E5E5E5] bg-white p-12 text-center text-[#777777]">
            No se encontraron clientes registrados con "{search}".
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((c) => {
              const isSelected = clienteSeleccionado?.id === c.id;

              return (
                <div
                  key={c.id}
                  className={`flex flex-col justify-between border bg-white p-5 transition-all ${
                    isSelected ? "border-2 border-[#D8A814] bg-[#FFFBEB]" : "border-[#DDDDDD] hover:border-black"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#050505] font-bold text-white text-lg">
                      {c.nombre.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-black truncate">{c.nombre}</p>
                      <p className="text-xs text-[#777777]">{c.telefono || "Sin teléfono"}</p>
                      <p className="text-xs text-[#888888]">{c.localidad || "Sin localidad"}</p>
                    </div>
                  </div>

                  {/* Beneficios Comerciales */}
                  <div className="my-4 flex items-center justify-between border-t border-[#F0F0F0] pt-3 text-xs">
                    <div>
                      <p className="text-[#888888] flex items-center gap-1">
                        <Award size={12} className="text-[#D8A814]" /> Fidelidad
                      </p>
                      <p className="font-bold text-[#D8A814] text-sm">{c.puntos || 0} pts</p>
                    </div>

                    <div className="text-right">
                      <p className="text-[#888888] flex items-center justify-end gap-1">
                        <Percent size={12} className="text-emerald-600" /> Descuento
                      </p>
                      <p className="font-bold text-emerald-700 text-sm">{c.descuento || 0}%</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAsignarAVenta(c)}
                    className={`flex h-10 w-full items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-colors ${
                      isSelected
                        ? "bg-[#D8A814] text-white"
                        : "border border-black bg-white text-black hover:bg-black hover:text-white"
                    }`}
                  >
                    <UserCheck size={16} />
                    {isSelected ? "Cliente Asignado" : "Asignar a Venta"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CustomerModal
        open={modalNuevo}
        onClose={() => setModalNuevo(false)}
        onSave={handleCrearNuevo}
      />
    </main>
  );
}
