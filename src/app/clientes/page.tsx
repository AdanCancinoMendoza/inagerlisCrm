"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSidebar } from "@/context/SidebarContext";
import CustomerStats from "@/components/clientes/CustomerStats";
import CustomerTable from "@/components/clientes/CustomerTable";
import CustomerModal from "@/components/clientes/CustomerModal";
import CustomerDetailModal from "@/components/clientes/CustomerDetailModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import {
  Cliente,
  CreateClienteInput,
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
} from "@/services/clientes";
import { getOrganizacionId, getUsuarioActual } from "@/services/auth";
import { useSocket } from "@/hooks/useSocket";
import { Search, UserPlus, RefreshCw, Users, AlertTriangle } from "lucide-react";

export default function ClientesPage() {
  const { collapsed } = useSidebar();
  const [customers, setCustomers] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState<Cliente | null>(null);
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Todas las localidades");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Obtener orgId para socket room
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
      console.error("Error al cargar clientes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sincronización en tiempo real vía Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleClienteCreado = () => {
      loadData();
    };

    const handleClienteActualizado = (clienteActualizado: Cliente) => {
      setCustomers((prev) =>
        prev.map((c) => (c.id === clienteActualizado.id ? { ...c, ...clienteActualizado } : c))
      );
    };

    const handleClienteEliminado = ({ id }: { id: string }) => {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      if (selectedCustomerId === id) {
        setSelectedCustomerId(null);
      }
    };

    socket.on("cliente:creado", handleClienteCreado);
    socket.on("cliente:actualizado", handleClienteActualizado);
    socket.on("cliente:eliminado", handleClienteEliminado);

    return () => {
      socket.off("cliente:creado", handleClienteCreado);
      socket.off("cliente:actualizado", handleClienteActualizado);
      socket.off("cliente:eliminado", handleClienteEliminado);
    };
  }, [socket, selectedCustomerId, loadData]);

  // Localidades dinámicas
  const locations = [
    "Todas las localidades",
    ...Array.from(new Set(customers.map((c) => c.localidad).filter(Boolean) as string[])),
  ];

  const filteredCustomers = customers.filter((c) => {
    const term = search.toLowerCase();
    const matchesSearch =
      c.nombre.toLowerCase().includes(term) ||
      (c.telefono && c.telefono.includes(term)) ||
      (c.rfc && c.rfc.toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term));

    const matchesLocation =
      selectedLocation === "Todas las localidades" || c.localidad === selectedLocation;

    return matchesSearch && matchesLocation;
  });

  // Guardar (Crear o Editar)
  const handleSaveCustomer = async (data: Omit<CreateClienteInput, "organizacionId">) => {
    const currentOrgId = getOrganizacionId() || getUsuarioActual()?.organizacionId;
    if (!currentOrgId) return;

    try {
      if (clienteToEdit) {
        // Actualizar cliente existente
        const actualizado = await updateCliente(clienteToEdit.id, data);
        setCustomers((prev) =>
          prev.map((c) => (c.id === actualizado.id ? { ...c, ...actualizado } : c))
        );
      } else {
        // Crear nuevo cliente
        const nuevo = await createCliente({
          ...data,
          organizacionId: currentOrgId,
        });
        setCustomers((prev) => [nuevo, ...prev]);
      }
      setClienteToEdit(null);
      setShowCustomerModal(false);
    } catch (err) {
      console.error("Error al guardar cliente:", err);
      alert("Hubo un error al guardar el cliente.");
    }
  };

  // Abrir modal de edición
  const handleOpenEdit = (cliente: Cliente) => {
    setClienteToEdit(cliente);
    setShowCustomerModal(true);
  };

  // Confirmar y procesar eliminación
  const handleConfirmDelete = async () => {
    if (!clienteToDelete) return;
    setDeleting(true);

    try {
      await deleteCliente(clienteToDelete.id);
      setCustomers((prev) => prev.filter((c) => c.id !== clienteToDelete.id));
      if (selectedCustomerId === clienteToDelete.id) {
        setSelectedCustomerId(null);
      }
      setClienteToDelete(null);
    } catch (err) {
      console.error("Error al eliminar cliente:", err);
      alert("Ocurrió un error al intentar eliminar el cliente.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Sidebar />

      <div
        className={`min-h-screen transition-all duration-300 ${
          collapsed ? "ml-[80px]" : "ml-[250px]"
        }`}
      >
        <Header />

        <div className="p-8 lg:p-10">
          {/* Header de la sección */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
                CRM / Fidelización
              </p>

              <h1 className="mt-1 text-3xl font-bold text-black flex items-center gap-3">
                <Users size={30} className="text-[#D8A814]" />
                Clientes
              </h1>

              <p className="mt-1.5 text-sm text-[#777777]">
                Gestiona tus clientes con sincronización en tiempo real, descuentos preferenciales e historial de ventas.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                title="Recargar datos"
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#E5E5E5] bg-white text-[#555555] hover:border-black hover:text-black transition-colors"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </button>

              <button
                onClick={() => {
                  setClienteToEdit(null);
                  setShowCustomerModal(true);
                }}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#D8A814] px-5 font-bold text-white shadow-xs hover:bg-black transition-colors"
              >
                <UserPlus size={17} />
                Nuevo cliente
              </button>
            </div>
          </div>

          {/* Estadísticas de Clientes */}
          <div className="mb-8">
            <CustomerStats clientes={customers} />
          </div>

          {/* Barra de Filtros y Búsqueda */}
          <div className="my-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar cliente por nombre, teléfono, correo o RFC..."
                className="h-12 w-full rounded-lg border border-[#E0E0E0] bg-white pl-11 pr-5 text-sm text-black outline-none focus:border-[#D8A814] focus:ring-1 focus:ring-[#D8A814]"
              />
            </div>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="h-12 min-w-[200px] rounded-lg border border-[#E0E0E0] bg-white px-4 text-sm text-black outline-none focus:border-[#D8A814]"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Tabla de Clientes con Edición y Eliminación */}
          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-white">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D8A814] border-t-transparent" />
              <p className="mt-3 text-xs text-[#888888]">Cargando cartera de clientes...</p>
            </div>
          ) : (
            <CustomerTable
              customers={filteredCustomers}
              onSelectCustomer={(cust) => setSelectedCustomerId(cust.id)}
              onEditCustomer={handleOpenEdit}
              onDeleteCustomer={(cust) => setClienteToDelete(cust)}
            />
          )}
        </div>
      </div>

      {/* Modal para Crear / Editar cliente */}
      <CustomerModal
        open={showCustomerModal}
        clienteToEdit={clienteToEdit}
        onClose={() => {
          setShowCustomerModal(false);
          setClienteToEdit(null);
        }}
        onSave={handleSaveCustomer}
      />

      {/* Modal de Detalle con Historial de Ventas */}
      <CustomerDetailModal
        clienteId={selectedCustomerId}
        onClose={() => setSelectedCustomerId(null)}
        onEdit={(cliente) => {
          setSelectedCustomerId(null);
          handleOpenEdit(cliente);
        }}
        onDelete={(cliente) => {
          setClienteToDelete(cliente);
        }}
      />

      {/* Modal General de Confirmación de Eliminación Estilo Sistema */}
      <DeleteConfirmModal
        isOpen={Boolean(clienteToDelete)}
        onClose={() => setClienteToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Cliente"
        subtitle="Expediente de cliente y fidelización"
        itemName={clienteToDelete?.nombre}
        itemDetails={
          clienteToDelete
            ? [clienteToDelete.telefono, clienteToDelete.rfc, clienteToDelete.localidad]
                .filter(Boolean)
                .join(" • ")
            : undefined
        }
        warningMessage={
          clienteToDelete?.comprasCount
            ? `El cliente tiene ${clienteToDelete.comprasCount} ventas vinculadas. Las ventas permanecerán en el sistema registradas para fines de auditoría. ¿Deseas eliminar permanentemente a este cliente?`
            : "¿Estás completamente seguro de que deseas eliminar este cliente? Se borrará de forma permanente de la base de datos."
        }
        loading={deleting}
        confirmText="Eliminar Cliente"
      />
    </main>
  );
}