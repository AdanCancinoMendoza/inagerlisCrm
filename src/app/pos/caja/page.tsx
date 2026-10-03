"use client";

import { useEffect, useState } from "react";
import POSHeader from "@/components/pos/POSHeader";
import { useSocket } from "@/hooks/useSocket";
import {
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  Lock,
  Minus,
  Plus,
  ShieldAlert,
  Unlock,
  WalletCards,
  Zap,
} from "lucide-react";

interface MovimientoPOS {
  id: string;
  hora: string;
  tipo: "APERTURA" | "VENTA_EFECTIVO" | "ENTRADA" | "RETIRO" | "CIERRE";
  concepto: string;
  monto: number;
}

export default function POSCajaPage() {
  const [cajaAbierta, setCajaAbierta] = useState(true);
  const [fondoInicial, setFondoInicial] = useState(1500);
  const [ventasEfectivo, setVentasEfectivo] = useState(4820);
  const [ventasTarjeta, setVentasTarjeta] = useState(3250);
  const [entradas, setEntradas] = useState(500);
  const [retiros, setRetiros] = useState(300);

  const [modalApertura, setModalApertura] = useState(false);
  const [modalMovimiento, setModalMovimiento] = useState<"ENTRADA" | "RETIRO" | null>(null);
  const [modalCierre, setModalCierre] = useState(false);

  const [montoMov, setMontoMov] = useState("");
  const [conceptoMov, setConceptoMov] = useState("");
  const [conteoFisico, setConteoFisico] = useState("");
  const [montoApertura, setMontoApertura] = useState("1500");
  const [notificacion, setNotificacion] = useState<string | null>(null);

  const [movimientos, setMovimientos] = useState<MovimientoPOS[]>([
    { id: "1", hora: "08:00 AM", tipo: "APERTURA", concepto: "Fondo inicial de turno", monto: 1500 },
    { id: "2", hora: "10:15 AM", tipo: "ENTRADA", concepto: "Cambio adicional", monto: 500 },
    { id: "3", hora: "11:30 AM", tipo: "RETIRO", concepto: "Retiro parcial de efectivo", monto: 300 },
  ]);

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on("venta:creada", (data: any) => {
      const monto = Number(data.total) || 0;
      const metodo = data.metodoPago || "Efectivo";

      if (metodo === "Efectivo") {
        setVentasEfectivo((prev) => prev + monto);
        setMovimientos((prev) => [
          {
            id: Date.now().toString(),
            hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            tipo: "VENTA_EFECTIVO",
            concepto: `Venta POS ${data.folio || ""}`,
            monto,
          },
          ...prev,
        ]);
      } else {
        setVentasTarjeta((prev) => prev + monto);
      }

      setNotificacion(`¡Venta cobrada por ${metodo}: $${monto.toFixed(2)}!`);
      setTimeout(() => setNotificacion(null), 4000);
    });

    return () => {
      socket.off("venta:creada");
    };
  }, [socket]);

  const efectivoEsperado = fondoInicial + ventasEfectivo + entradas - retiros;
  const money = (val: number) => `$${val.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

  const handleAbrirCaja = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(montoApertura) || 0;
    setFondoInicial(val);
    setVentasEfectivo(0);
    setVentasTarjeta(0);
    setEntradas(0);
    setRetiros(0);
    setCajaAbierta(true);
    setModalApertura(false);
  };

  const handleMovimiento = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(montoMov) || 0;
    if (val <= 0) return;

    if (modalMovimiento === "ENTRADA") setEntradas((p) => p + val);
    else setRetiros((p) => p + val);

    setMovimientos((prev) => [
      {
        id: Date.now().toString(),
        hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        tipo: modalMovimiento as "ENTRADA" | "RETIRO",
        concepto: conceptoMov || (modalMovimiento === "ENTRADA" ? "Entrada de caja" : "Retiro de caja"),
        monto: val,
      },
      ...prev,
    ]);

    setMontoMov("");
    setConceptoMov("");
    setModalMovimiento(null);
  };

  const handleCerrarCaja = (e: React.FormEvent) => {
    e.preventDefault();
    setCajaAbierta(false);
    setModalCierre(false);
  };

  return (
    <main className="min-h-screen bg-[#F4F4F4] text-black">
      <POSHeader activeTab="caja" />

      <div className="p-8 max-w-[1400px] mx-auto">
        {notificacion && (
          <div className="mb-6 flex items-center justify-between border-l-4 border-l-[#D8A814] bg-white p-4 shadow-md">
            <div className="flex items-center gap-3">
              <Zap size={20} className="text-[#D8A814] animate-pulse" />
              <p className="font-bold text-black">{notificacion}</p>
            </div>
            <span className="text-xs font-semibold uppercase text-[#D8A814]">En vivo</span>
          </div>
        )}

        {/* Top Header Controls */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border border-[#DDDDDD] bg-white p-6">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center font-bold text-white ${cajaAbierta ? "bg-[#D8A814]" : "bg-[#777777]"}`}>
              {cajaAbierta ? <Unlock size={22} /> : <Lock size={22} />}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#888888]">Turno Activo POS</p>
              <h1 className="text-xl font-bold">{cajaAbierta ? "Caja 02 · Abierta" : "Caja 02 · Cerrada"}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {cajaAbierta ? (
              <>
                <button
                  onClick={() => setModalMovimiento("ENTRADA")}
                  className="flex h-11 items-center gap-2 border border-black bg-white px-5 text-sm font-bold text-black hover:bg-black hover:text-white transition-colors"
                >
                  <Plus size={16} /> Entrada dinero
                </button>
                <button
                  onClick={() => setModalMovimiento("RETIRO")}
                  className="flex h-11 items-center gap-2 border border-black bg-white px-5 text-sm font-bold text-black hover:bg-black hover:text-white transition-colors"
                >
                  <Minus size={16} /> Retiro dinero
                </button>
                <button
                  onClick={() => setModalCierre(true)}
                  className="flex h-11 items-center gap-2 bg-[#D8A814] px-6 text-sm font-bold text-white hover:bg-black transition-colors"
                >
                  <Lock size={16} /> Cerrar Caja (Corte)
                </button>
              </>
            ) : (
              <button
                onClick={() => setModalApertura(true)}
                className="flex h-11 items-center gap-2 bg-[#D8A814] px-6 text-sm font-bold text-white hover:bg-black transition-colors"
              >
                <Unlock size={16} /> Abrir Turno de Caja
              </button>
            )}
          </div>
        </div>

        {/* Grid resumen de dinero */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="border border-[#DDDDDD] bg-white p-5">
            <p className="text-xs font-bold uppercase text-[#888888]">Fondo Inicial</p>
            <p className="mt-3 text-2xl font-bold">{money(fondoInicial)}</p>
            <p className="mt-1 text-xs text-[#999999]">Apertura de turno</p>
          </div>

          <div className="border border-[#DDDDDD] bg-white p-5">
            <p className="text-xs font-bold uppercase text-[#888888]">Ventas Efectivo</p>
            <p className="mt-3 text-2xl font-bold text-[#D8A814]">{money(ventasEfectivo)}</p>
            <p className="mt-1 text-xs text-[#999999]">Cobrado en terminal</p>
          </div>

          <div className="border border-[#DDDDDD] bg-white p-5">
            <p className="text-xs font-bold uppercase text-[#888888]">Entradas / Retiros</p>
            <p className="mt-3 text-2xl font-bold">{money(entradas - retiros)}</p>
            <p className="mt-1 text-xs text-[#999999]">Aportes y retiros parciales</p>
          </div>

          <div className="border border-[#D8A814] bg-[#050505] p-5 text-white">
            <p className="text-xs font-bold uppercase text-[#D8A814]">Efectivo Esperado</p>
            <p className="mt-3 text-3xl font-bold">{money(efectivoEsperado)}</p>
            <p className="mt-1 text-xs text-[#AAAAAA]">En cajón de dinero</p>
          </div>
        </div>

        {/* Tabla Movimientos POS */}
        <div className="mt-8 border border-[#DDDDDD] bg-white">
          <div className="border-b border-[#EEEEEE] px-6 py-4">
            <h2 className="font-bold text-lg">Historial de caja del turno</h2>
          </div>

          <div className="grid grid-cols-[1fr_1.2fr_2fr_1fr] bg-[#FAFAFA] px-6 py-3 text-xs font-bold uppercase text-[#777777]">
            <p>Hora</p>
            <p>Tipo</p>
            <p>Concepto</p>
            <p className="text-right">Monto</p>
          </div>

          {movimientos.map((m) => (
            <div key={m.id} className="grid grid-cols-[1fr_1.2fr_2fr_1fr] items-center border-t border-[#EEEEEE] px-6 py-4 text-sm">
              <p className="font-semibold">{m.hora}</p>
              <div>
                <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase ${
                  m.tipo === "APERTURA" ? "bg-[#050505] text-white" :
                  m.tipo === "VENTA_EFECTIVO" ? "bg-[#D8A814] text-white" :
                  m.tipo === "ENTRADA" ? "bg-emerald-700 text-white" : "bg-rose-700 text-white"
                }`}>
                  {m.tipo}
                </span>
              </div>
              <p className="font-medium">{m.concepto}</p>
              <p className="text-right font-bold">{money(m.monto)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modales */}
      {modalApertura && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <form onSubmit={handleAbrirCaja} className="w-full max-w-[440px] border border-[#D8A814] bg-white p-6">
            <h2 className="text-xl font-bold mb-4">Abrir Turno POS</h2>
            <label className="block text-sm font-bold mb-2">Fondo Inicial ($)</label>
            <input
              type="number"
              value={montoApertura}
              onChange={(e) => setMontoApertura(e.target.value)}
              className="h-12 w-full border border-[#D8A814] px-4 font-bold outline-none focus:border-black mb-6"
            />
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setModalApertura(false)} className="h-11 border border-black px-5 font-bold">Cancelar</button>
              <button type="submit" className="h-11 bg-[#D8A814] px-6 font-bold text-white">Abrir Caja</button>
            </div>
          </form>
        </div>
      )}

      {modalMovimiento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <form onSubmit={handleMovimiento} className="w-full max-w-[460px] border border-[#D8A814] bg-white p-6 space-y-4">
            <h2 className="text-xl font-bold">{modalMovimiento === "ENTRADA" ? "Entrada de Efectivo" : "Retiro de Efectivo"}</h2>
            <div>
              <label className="block text-sm font-bold mb-1">Monto ($)</label>
              <input
                required
                type="number"
                step="0.01"
                value={montoMov}
                onChange={(e) => setMontoMov(e.target.value)}
                className="h-12 w-full border border-[#D8A814] px-4 font-bold outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Concepto</label>
              <input
                required
                value={conceptoMov}
                onChange={(e) => setConceptoMov(e.target.value)}
                className="h-12 w-full border border-[#D8A814] px-4 outline-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModalMovimiento(null)} className="h-11 border border-black px-5 font-bold">Cancelar</button>
              <button type="submit" className="h-11 bg-[#D8A814] px-6 font-bold text-white">Guardar</button>
            </div>
          </form>
        </div>
      )}

      {modalCierre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <form onSubmit={handleCerrarCaja} className="w-full max-w-[480px] border border-[#D8A814] bg-white p-6 space-y-4">
            <h2 className="text-xl font-bold">Realizar Corte de Caja</h2>
            <div className="p-3 bg-[#FAFAFA] border text-sm space-y-1">
              <div className="flex justify-between"><span>Efectivo Esperado:</span><span className="font-bold">{money(efectivoEsperado)}</span></div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Conteo Físico en Cajón ($)</label>
              <input
                required
                type="number"
                value={conteoFisico}
                onChange={(e) => setConteoFisico(e.target.value)}
                className="h-12 w-full border border-[#D8A814] px-4 font-bold text-lg outline-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModalCierre(false)} className="h-11 border border-black px-5 font-bold">Cancelar</button>
              <button type="submit" className="h-11 bg-black px-6 font-bold text-white hover:bg-[#D8A814]">Cerrar Turno</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
