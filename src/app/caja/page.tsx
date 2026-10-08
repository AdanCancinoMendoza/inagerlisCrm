"use client";

import { useEffect, useState } from "react";
import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock,
  CreditCard,
  DollarSign,
  History,
  Lock,
  Minus,
  Plus,
  ReceiptText,
  ShieldAlert,
  Unlock,
  User,
  WalletCards,
  X,
  Zap,
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSocket } from "@/hooks/useSocket";
import { useSidebar } from "@/context/SidebarContext";

import { apiRequest } from "@/services/api";
import { getOrganizacionId, getUsuarioActual } from "@/services/auth";

interface MovimientoCaja {
  id: string;
  fecha: string;
  hora: string;
  tipo: "APERTURA" | "VENTA_EFECTIVO" | "ENTRADA" | "RETIRO" | "CIERRE";
  concepto: string;
  monto: number;
  usuario: string;
}

export default function CajaPage() {
  const { collapsed } = useSidebar();
  const usuarioActual = typeof window !== "undefined" ? getUsuarioActual() : null;
  const orgId = typeof window !== "undefined" ? (getOrganizacionId() || usuarioActual?.organizacionId) : null;

  const [cajaAbierta, setCajaAbierta] = useState(false);
  const [fondoInicial, setFondoInicial] = useState(0);
  const [ventasEfectivo, setVentasEfectivo] = useState(0);
  const [ventasTarjeta, setVentasTarjeta] = useState(0);
  const [entradasEfectivo, setEntradasEfectivo] = useState(0);
  const [retirosEfectivo, setRetirosEfectivo] = useState(0);

  // Modales
  const [modalApertura, setModalApertura] = useState(false);
  const [modalMovimiento, setModalMovimiento] = useState<"ENTRADA" | "RETIRO" | null>(null);
  const [modalCierre, setModalCierre] = useState(false);

  // Form states
  const [montoMovimiento, setMontoMovimiento] = useState("");
  const [conceptoMovimiento, setConceptoMovimiento] = useState("");
  const [conteoEfectivoFisico, setConteoEfectivoFisico] = useState("");
  const [montoApertura, setMontoApertura] = useState("0");
  const [notificacion, setNotificacion] = useState<string | null>(null);

  const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([]);

  useEffect(() => {
    if (!orgId) return;

    // Cargar ventas reales acumuladas hoy
    apiRequest<any>(`/ventas/resumen/${orgId}`)
      .then((res) => {
        if (res) {
          const metodos = Array.isArray(res.metodosPago) ? res.metodosPago : [];
          const ef = metodos.find((m: any) => m.metodo?.toLowerCase().includes("efectivo"))?.monto || 0;
          const tj = metodos.find((m: any) => m.metodo?.toLowerCase().includes("tarjeta"))?.monto || 0;
          setVentasEfectivo(ef);
          setVentasTarjeta(tj);
        }
      })
      .catch(() => {});
  }, [orgId]);

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on("venta:creada", (data: any) => {
      const totalVenta = Number(data.total) || 0;
      const metodo = data.metodoPago || "Efectivo";

      if (metodo === "Efectivo") {
        setVentasEfectivo((prev) => prev + totalVenta);
        setMovimientos((prev) => [
          {
            id: Date.now().toString(),
            fecha: "Hoy",
            hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            tipo: "VENTA_EFECTIVO",
            concepto: `Venta folio ${data.folio || "POS"}`,
            monto: totalVenta,
            usuario: data.usuario?.nombre || "Cajero POS",
          },
          ...prev,
        ]);
      } else {
        setVentasTarjeta((prev) => prev + totalVenta);
      }

      setNotificacion(`¡Venta recibida por ${metodo}: $${totalVenta.toFixed(2)}!`);
      setTimeout(() => setNotificacion(null), 4000);
    });

    return () => {
      socket.off("venta:creada");
    };
  }, [socket]);

  const totalEsperadoEfectivo = fondoInicial + ventasEfectivo + entradasEfectivo - retirosEfectivo;
  const totalGeneralVentas = ventasEfectivo + ventasTarjeta;

  const money = (val: number) => `$${val.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

  const handleAbrirCaja = (e: React.FormEvent) => {
    e.preventDefault();
    const monto = Number(montoApertura) || 0;
    setFondoInicial(monto);
    setVentasEfectivo(0);
    setVentasTarjeta(0);
    setEntradasEfectivo(0);
    setRetirosEfectivo(0);
    setCajaAbierta(true);
    setModalApertura(false);

    setMovimientos([
      {
        id: Date.now().toString(),
        fecha: "Hoy",
        hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        tipo: "APERTURA",
        concepto: "Apertura de turno de caja",
        monto,
        usuario: usuarioActual?.nombre || "Cajero en turno",
      },
    ]);
  };

  const handleRegistrarMovimiento = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(montoMovimiento) || 0;
    if (val <= 0) return;

    if (modalMovimiento === "ENTRADA") {
      setEntradasEfectivo((prev) => prev + val);
    } else {
      setRetirosEfectivo((prev) => prev + val);
    }

    setMovimientos((prev) => [
      {
        id: Date.now().toString(),
        fecha: "Hoy",
        hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        tipo: modalMovimiento as "ENTRADA" | "RETIRO",
        concepto: conceptoMovimiento || (modalMovimiento === "ENTRADA" ? "Entrada de dinero" : "Retiro de dinero"),
        monto: val,
        usuario: usuarioActual?.nombre || "Cajero en turno",
      },
      ...prev,
    ]);

    setMontoMovimiento("");
    setConceptoMovimiento("");
    setModalMovimiento(null);
  };

  const handleCerrarCaja = (e: React.FormEvent) => {
    e.preventDefault();
    const contado = Number(conteoEfectivoFisico) || 0;
    setCajaAbierta(false);
    setModalCierre(false);

    setMovimientos((prev) => [
      {
        id: Date.now().toString(),
        fecha: "Hoy",
        hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        tipo: "CIERRE",
        concepto: `Cierre de caja - Contado: ${money(contado)} (Dif: ${money(contado - totalEsperadoEfectivo)})`,
        monto: contado,
        usuario: usuarioActual?.nombre || "Cajero en turno",
      },
      ...prev,
    ]);
  };

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Sidebar />

      <div className={`min-h-screen transition-all duration-300 ${collapsed ? "ml-[80px]" : "ml-[250px]"}`}>
        <Header />

        <div className="p-10">
          {notificacion && (
            <div className="mb-6 flex items-center justify-between border-l-4 border-l-[#D8A814] bg-white p-4 shadow-md">
              <div className="flex items-center gap-3">
                <Zap size={20} className="text-[#D8A814] animate-pulse" />
                <p className="font-bold text-black">{notificacion}</p>
              </div>
              <span className="text-xs font-semibold uppercase text-[#D8A814]">En vivo</span>
            </div>
          )}

          {/* Encabezado */}
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
                Control de Efectivo
              </p>

              <h1 className="mt-2 text-3xl font-bold text-black">
                Caja Registradora
              </h1>

              <p className="mt-2 text-sm text-[#777777]">
                Administra aperturas, ventas en efectivo, entradas, retiros y cortes de caja.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {cajaAbierta ? (
                <>
                  <button
                    onClick={() => setModalMovimiento("ENTRADA")}
                    className="flex h-12 items-center gap-2 border border-black px-5 font-bold text-black hover:bg-black hover:text-white transition-colors"
                  >
                    <Plus size={18} />
                    Entrada de dinero
                  </button>

                  <button
                    onClick={() => setModalMovimiento("RETIRO")}
                    className="flex h-12 items-center gap-2 border border-black px-5 font-bold text-black hover:bg-black hover:text-white transition-colors"
                  >
                    <Minus size={18} />
                    Retiro de dinero
                  </button>

                  <button
                    onClick={() => setModalCierre(true)}
                    className="flex h-12 items-center gap-2 bg-[#D8A814] px-6 font-bold text-white hover:bg-black transition-colors"
                  >
                    <Lock size={18} />
                    Corte / Cerrar caja
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setModalApertura(true)}
                  className="flex h-12 items-center gap-2 bg-[#D8A814] px-7 font-bold text-white hover:bg-black transition-colors"
                >
                  <Unlock size={18} />
                  Abrir caja
                </button>
              )}
            </div>
          </div>

          {/* Estado banner */}
          <div
            className={`mb-8 flex items-center justify-between border-l-4 p-6 ${
              cajaAbierta
                ? "border-l-[#D8A814] bg-white"
                : "border-l-[#777777] bg-[#FAFAFA]"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center font-bold text-white ${
                  cajaAbierta ? "bg-[#D8A814]" : "bg-[#777777]"
                }`}
              >
                {cajaAbierta ? <Unlock size={22} /> : <Lock size={22} />}
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#888888]">
                  Estado del turno
                </p>

                <h2 className="text-xl font-bold text-black">
                  {cajaAbierta ? "Caja Abierta · Caja 01" : "Caja Cerrada"}
                </h2>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs uppercase text-[#888888]">Responsable</p>
              <p className="font-bold text-black">{usuarioActual?.nombre || "Cajero en turno"}</p>
            </div>
          </div>

          {/* KPIs de Dinero en Caja */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            {/* Fondo inicial */}
            <div className="border border-[#E2E2E2] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Fondo inicial
              </p>
              <p className="mt-4 text-2xl font-bold text-black">
                {money(fondoInicial)}
              </p>
              <p className="mt-2 text-xs text-[#888888]">Apertura de turno</p>
            </div>

            {/* Ventas en efectivo */}
            <div className="border border-[#E2E2E2] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Ventas Efectivo
              </p>
              <p className="mt-4 text-2xl font-bold text-[#D8A814]">
                {money(ventasEfectivo)}
              </p>
              <p className="mt-2 text-xs text-[#888888]">Acumulado en caja</p>
            </div>

            {/* Entradas extra */}
            <div className="border border-[#E2E2E2] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Entradas de dinero
              </p>
              <p className="mt-4 text-2xl font-bold text-black">
                + {money(entradasEfectivo)}
              </p>
              <p className="mt-2 text-xs text-[#888888]">Aportes / Cambio</p>
            </div>

            {/* Retiros */}
            <div className="border border-[#E2E2E2] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Retiros / Pagos
              </p>
              <p className="mt-4 text-2xl font-bold text-black">
                - {money(retirosEfectivo)}
              </p>
              <p className="mt-2 text-xs text-[#888888]">Gastos / Retiros</p>
            </div>

            {/* Total Calculado en Caja */}
            <div className="border border-[#D8A814] bg-[#D8A814] p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-wider">
                Efectivo esperado
              </p>
              <p className="mt-4 text-3xl font-bold">
                {money(totalEsperadoEfectivo)}
              </p>
              <p className="mt-2 text-xs">Total que debe haber en cajón</p>
            </div>
          </div>

          {/* Tabla de Movimientos */}
          <section className="mt-8 border border-[#E2E2E2] bg-white">
            <div className="flex items-center justify-between border-b border-[#EEEEEE] px-7 py-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                  Auditoría
                </p>

                <h2 className="mt-1 text-xl font-bold text-black">
                  Movimientos de caja del turno
                </h2>
              </div>

              <span className="text-sm font-semibold text-[#888888]">
                {movimientos.length} registros
              </span>
            </div>

            <div className="grid grid-cols-[.9fr_1fr_1.2fr_2fr_1.2fr_1.2fr] bg-[#FAFAFA] px-7 py-4">
              <p className="text-xs font-bold uppercase text-[#777777]">Hora</p>
              <p className="text-xs font-bold uppercase text-[#777777]">Tipo</p>
              <p className="text-xs font-bold uppercase text-[#777777]">Cajero</p>
              <p className="text-xs font-bold uppercase text-[#777777]">Concepto</p>
              <p className="text-right text-xs font-bold uppercase text-[#777777]">Monto</p>
              <p className="text-right text-xs font-bold uppercase text-[#777777]">Acción</p>
            </div>

            <div className="max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#D8A814] [&::-webkit-scrollbar-track]:bg-[#F2F2F2]">
              {movimientos.map((m) => (
                <div
                  key={m.id}
                  className="grid grid-cols-[.9fr_1fr_1.2fr_2fr_1.2fr_1.2fr] items-center border-t border-[#EEEEEE] px-7 py-4 text-sm"
                >
                  <p className="font-semibold text-black">{m.hora}</p>

                  <div>
                    <span
                      className={`inline-block px-2.5 py-1 text-[11px] font-bold uppercase ${
                        m.tipo === "APERTURA"
                          ? "bg-[#050505] text-white"
                          : m.tipo === "VENTA_EFECTIVO"
                          ? "bg-[#D8A814] text-white"
                          : m.tipo === "ENTRADA"
                          ? "bg-emerald-700 text-white"
                          : m.tipo === "RETIRO"
                          ? "bg-rose-700 text-white"
                          : "border border-black text-black"
                      }`}
                    >
                      {m.tipo}
                    </span>
                  </div>

                  <p className="text-[#555555]">{m.usuario}</p>
                  <p className="font-medium text-black">{m.concepto}</p>
                  <p className="text-right font-bold text-black">{money(m.monto)}</p>
                  <p className="text-right text-xs text-[#888888]">Registrado</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* MODAL APERTURA DE CAJA */}
      {modalApertura && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <form
            onSubmit={handleAbrirCaja}
            className="w-full max-w-[480px] border border-[#D8A814] bg-white p-7"
          >
            <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-4">
              <h2 className="text-2xl font-bold text-black">Abrir Caja</h2>
              <button
                type="button"
                onClick={() => setModalApertura(false)}
                className="text-2xl text-[#777777] hover:text-black"
              >
                ×
              </button>
            </div>

            <div className="my-6">
              <label className="mb-2 block text-sm font-bold text-black">
                Fondo Inicial en Efectivo *
              </label>
              <input
                required
                type="number"
                value={montoApertura}
                onChange={(e) => setMontoApertura(e.target.value)}
                placeholder="1500"
                className="h-12 w-full border border-[#D8A814] px-4 text-lg font-bold text-black outline-none focus:border-black"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#EEEEEE]">
              <button
                type="button"
                onClick={() => setModalApertura(false)}
                className="h-12 border border-black px-6 font-bold text-black hover:bg-black hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="h-12 bg-[#D8A814] px-6 font-bold text-white hover:bg-black"
              >
                Confirmar Apertura
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL ENTRADA / RETIRO DE DINERO */}
      {modalMovimiento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <form
            onSubmit={handleRegistrarMovimiento}
            className="w-full max-w-[500px] border border-[#D8A814] bg-white p-7"
          >
            <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-4">
              <h2 className="text-2xl font-bold text-black">
                {modalMovimiento === "ENTRADA" ? "Entrada de Dinero" : "Retiro de Dinero"}
              </h2>
              <button
                type="button"
                onClick={() => setModalMovimiento(null)}
                className="text-2xl text-[#777777] hover:text-black"
              >
                ×
              </button>
            </div>

            <div className="my-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-black">Monto *</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={montoMovimiento}
                  onChange={(e) => setMontoMovimiento(e.target.value)}
                  placeholder="0.00"
                  className="h-12 w-full border border-[#D8A814] px-4 text-lg font-bold text-black outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-black">Concepto / Motivo *</label>
                <input
                  required
                  value={conceptoMovimiento}
                  onChange={(e) => setConceptoMovimiento(e.target.value)}
                  placeholder={
                    modalMovimiento === "ENTRADA"
                      ? "Ej. Cambio adicional de billetes"
                      : "Ej. Pago parcial a proveedor"
                  }
                  className="h-12 w-full border border-[#D8A814] px-4 text-black outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#EEEEEE]">
              <button
                type="button"
                onClick={() => setModalMovimiento(null)}
                className="h-12 border border-black px-6 font-bold text-black hover:bg-black hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="h-12 bg-[#D8A814] px-6 font-bold text-white hover:bg-black"
              >
                Guardar Movimiento
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL CORTE / CIERRE DE CAJA */}
      {modalCierre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <form
            onSubmit={handleCerrarCaja}
            className="w-full max-w-[540px] border border-[#D8A814] bg-white p-7"
          >
            <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-4">
              <h2 className="text-2xl font-bold text-black">Corte de Caja (Cierre de Turno)</h2>
              <button
                type="button"
                onClick={() => setModalCierre(false)}
                className="text-2xl text-[#777777] hover:text-black"
              >
                ×
              </button>
            </div>

            <div className="my-6 space-y-4">
              <div className="border border-[#EEEEEE] bg-[#FAFAFA] p-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#777777]">Fondo Inicial:</span>
                  <span className="font-bold">{money(fondoInicial)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777777]">Ventas Efectivo:</span>
                  <span className="font-bold">{money(ventasEfectivo)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777777]">Entradas - Retiros:</span>
                  <span className="font-bold">{money(entradasEfectivo - retirosEfectivo)}</span>
                </div>
                <div className="flex justify-between border-t border-[#DDD] pt-2 font-bold text-black text-base">
                  <span>Efectivo Esperado:</span>
                  <span className="text-[#D8A814]">{money(totalEsperadoEfectivo)}</span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  Conteo Físico de Efectivo en Cajón *
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={conteoEfectivoFisico}
                  onChange={(e) => setConteoEfectivoFisico(e.target.value)}
                  placeholder="Ej. 6520.00"
                  className="h-12 w-full border border-[#D8A814] px-4 text-xl font-bold text-black outline-none focus:border-black"
                />
              </div>

              {conteoEfectivoFisico && (
                <div className="p-3 bg-[#F4F4F4] border-l-4 border-l-black text-sm">
                  <span className="font-bold">Diferencia: </span>
                  <span className="font-bold text-[#D8A814]">
                    {money(Number(conteoEfectivoFisico) - totalEsperadoEfectivo)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#EEEEEE]">
              <button
                type="button"
                onClick={() => setModalCierre(false)}
                className="h-12 border border-black px-6 font-bold text-black hover:bg-black hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="h-12 bg-black px-6 font-bold text-white hover:bg-[#D8A814]"
              >
                Confirmar y Cerrar Turno
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
