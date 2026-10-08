"use client";

import POSHeader from "@/components/pos/POSHeader";
import { useState } from "react";
import {
  Banknote,
  Barcode,
  CheckCircle2,
  Check,
  CreditCard,
  DollarSign,
  Flame,
  Globe,
  History,
  Info,
  PhoneCall,
  Printer,
  Receipt,
  Search,
  ShieldCheck,
  Smartphone,
  Tv,
  Wifi,
  X,
  Zap,
} from "lucide-react";

interface ServiceProvider {
  id: string;
  name: string;
  category: "Recargas" | "Internet & Cable" | "Luz & Agua" | "Gas & Otros";
  iconType: "phone" | "wifi" | "zap" | "flame" | "tv" | "globe";
  badgeColor: string;
  textColor: string;
  commission: number;
  referenceLabel: string;
  referencePlaceholder: string;
  referenceLength: string;
  presetAmounts?: number[];
}

const serviceProviders: ServiceProvider[] = [
  // Recargas Telefónicas
  {
    id: "telcel",
    name: "Telcel",
    category: "Recargas",
    iconType: "phone",
    badgeColor: "bg-[#002F6C]",
    textColor: "text-white",
    commission: 0,
    referenceLabel: "Número Telcel (10 dígitos)",
    referencePlaceholder: "Ej: 2221234567",
    referenceLength: "10 dígitos",
    presetAmounts: [20, 30, 50, 80, 100, 150, 200, 300, 500],
  },
  {
    id: "att",
    name: "AT&T",
    category: "Recargas",
    iconType: "phone",
    badgeColor: "bg-[#009FDF]",
    textColor: "text-white",
    commission: 0,
    referenceLabel: "Número AT&T (10 dígitos)",
    referencePlaceholder: "Ej: 2229876543",
    referenceLength: "10 dígitos",
    presetAmounts: [30, 50, 100, 150, 200, 300, 500],
  },
  {
    id: "movistar",
    name: "Movistar",
    category: "Recargas",
    iconType: "phone",
    badgeColor: "bg-[#00A9E0]",
    textColor: "text-white",
    commission: 0,
    referenceLabel: "Número Movistar (10 dígitos)",
    referencePlaceholder: "Ej: 2225551212",
    referenceLength: "10 dígitos",
    presetAmounts: [20, 30, 50, 100, 120, 150, 200],
  },
  {
    id: "bait",
    name: "Bait",
    category: "Recargas",
    iconType: "phone",
    badgeColor: "bg-[#FF0055]",
    textColor: "text-white",
    commission: 0,
    referenceLabel: "Número Bait (10 dígitos)",
    referencePlaceholder: "Ej: 2224443322",
    referenceLength: "10 dígitos",
    presetAmounts: [20, 50, 100, 200, 300],
  },
  {
    id: "virgin",
    name: "Virgin Mobile",
    category: "Recargas",
    iconType: "phone",
    badgeColor: "bg-[#E11B22]",
    textColor: "text-white",
    commission: 0,
    referenceLabel: "Número Virgin (10 dígitos)",
    referencePlaceholder: "Ej: 2223334455",
    referenceLength: "10 dígitos",
    presetAmounts: [30, 50, 100, 150, 200],
  },

  // Internet & Cable
  {
    id: "megacable",
    name: "Megacable",
    category: "Internet & Cable",
    iconType: "wifi",
    badgeColor: "bg-[#00529B]",
    textColor: "text-white",
    commission: 12,
    referenceLabel: "Número de Suscriptor / Contrato (10 dígitos)",
    referencePlaceholder: "Ej: 0481294812",
    referenceLength: "10 dígitos",
  },
  {
    id: "totalplay",
    name: "Totalplay",
    category: "Internet & Cable",
    iconType: "tv",
    badgeColor: "bg-[#E6007E]",
    textColor: "text-white",
    commission: 12,
    referenceLabel: "Número de Cuenta Totalplay",
    referencePlaceholder: "Ej: 0102938475",
    referenceLength: "10 dígitos",
  },
  {
    id: "izzi",
    name: "Izzi",
    category: "Internet & Cable",
    iconType: "wifi",
    badgeColor: "bg-[#EE2A24]",
    textColor: "text-white",
    commission: 12,
    referenceLabel: "Número de Cuenta Izzi (10 a 12 dígitos)",
    referencePlaceholder: "Ej: 9876543210",
    referenceLength: "10 - 12 dígitos",
  },
  {
    id: "telmex",
    name: "Telmex / Infinitum",
    category: "Internet & Cable",
    iconType: "globe",
    badgeColor: "bg-[#0066B2]",
    textColor: "text-white",
    commission: 12,
    referenceLabel: "Número de Teléfono Telmex de 10 dígitos",
    referencePlaceholder: "Ej: 2221234567",
    referenceLength: "10 dígitos",
  },
  {
    id: "sky",
    name: "Sky / VeTV",
    category: "Internet & Cable",
    iconType: "tv",
    badgeColor: "bg-[#00246B]",
    textColor: "text-white",
    commission: 12,
    referenceLabel: "Número de Cuenta o Tarjeta Inteligente",
    referencePlaceholder: "Ej: 40129384712",
    referenceLength: "12 dígitos",
  },

  // Luz & Agua
  {
    id: "cfe",
    name: "CFE Electricity",
    category: "Luz & Agua",
    iconType: "zap",
    badgeColor: "bg-[#008638]",
    textColor: "text-white",
    commission: 12,
    referenceLabel: "Número de Servicio RPU (30 dígitos o Código de Barras)",
    referencePlaceholder: "Escanea o ingresa RPU de 30 dígitos",
    referenceLength: "30 dígitos",
  },
  {
    id: "agua_puebla",
    name: "Agua de Puebla",
    category: "Luz & Agua",
    iconType: "globe",
    badgeColor: "bg-[#008BB0]",
    textColor: "text-white",
    commission: 12,
    referenceLabel: "Número de Identificador NIS (7-10 dígitos)",
    referencePlaceholder: "Ej: 1234567",
    referenceLength: "7-10 dígitos",
  },

  // Gas & TAG
  {
    id: "naturgy",
    name: "Naturgy Gas",
    category: "Gas & Otros",
    iconType: "flame",
    badgeColor: "bg-[#003B46]",
    textColor: "text-white",
    commission: 12,
    referenceLabel: "Número de Referencia Naturgy",
    referencePlaceholder: "Ej: 00987654321",
    referenceLength: "10 dígitos",
  },
  {
    id: "tag_pass",
    name: "TAG Pase Peaje",
    category: "Gas & Otros",
    iconType: "globe",
    badgeColor: "bg-[#FF5722]",
    textColor: "text-white",
    commission: 10,
    referenceLabel: "Número de Tag Pase",
    referencePlaceholder: "Ej: IMAG12345678",
    referenceLength: "12 caracteres",
    presetAmounts: [100, 200, 300, 500, 1000],
  },
];

interface ServiceTransaction {
  id: string;
  folio: string;
  serviceName: string;
  reference: string;
  amount: number;
  commission: number;
  total: number;
  time: string;
  status: "Exitosa" | "Pendiente";
}

export default function ServiciosPOSPage() {
  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(
    serviceProviders.find((p) => p.id === "megacable") || serviceProviders[0]
  );

  // Form State
  const [reference, setReference] = useState("");
  const [confirmReference, setConfirmReference] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<number | "custom">(
    selectedProvider?.presetAmounts?.[2] || 100
  );
  const [customAmount, setCustomAmount] = useState<string>("100");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal State
  const [isProcessingModal, setIsProcessingModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // History State
  const [history, setHistory] = useState<ServiceTransaction[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("crm_pos_servicios_historial");
        if (saved) return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const money = (val: number) =>
    `$${val.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const categories = ["Todos", "Recargas", "Internet & Cable", "Luz & Agua", "Gas & Otros"];

  const filteredProviders = serviceProviders.filter((p) => {
    const matchesCategory = activeCategory === "Todos" || p.category === activeCategory;
    const matchesQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const getEffectiveAmount = (): number => {
    if (selectedAmount === "custom") {
      return parseFloat(customAmount) || 0;
    }
    return selectedAmount;
  };

  const currentCommission = selectedProvider?.commission || 0;
  const currentAmount = getEffectiveAmount();
  const currentTotal = currentAmount + currentCommission;

  const handleSelectProvider = (p: ServiceProvider) => {
    setSelectedProvider(p);
    setReference("");
    setConfirmReference("");
    setErrorMsg(null);
    if (p.presetAmounts && p.presetAmounts.length > 0) {
      setSelectedAmount(p.presetAmounts[2] || p.presetAmounts[0]);
    } else {
      setSelectedAmount("custom");
      setCustomAmount("100");
    }
  };

  const handleProcessPayment = () => {
    if (!reference.trim()) {
      setErrorMsg("Ingresa el número de contrato, teléfono o referencia.");
      return;
    }

    if (confirmReference && reference.trim() !== confirmReference.trim()) {
      setErrorMsg("Las referencias ingresadas no coinciden.");
      return;
    }

    if (currentAmount <= 0) {
      setErrorMsg("El monto a pagar debe ser mayor a $0.00.");
      return;
    }

    setErrorMsg(null);
    setIsProcessingModal(true);
  };

  const handleConfirmSubmit = () => {
    setPaymentSuccess(true);
    setTimeout(() => {
      if (selectedProvider) {
        const newTx: ServiceTransaction = {
          id: Date.now().toString(),
          folio: `SERV-${Math.floor(10000 + Math.random() * 90000)}`,
          serviceName: selectedProvider.name,
          reference: reference,
          amount: currentAmount,
          commission: currentCommission,
          total: currentTotal,
          time: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
          status: "Exitosa",
        };
        setHistory((prev) => {
          const updated = [newTx, ...prev];
          if (typeof window !== "undefined") {
            localStorage.setItem("crm_pos_servicios_historial", JSON.stringify(updated));
          }
          return updated;
        });
      }
      setPaymentSuccess(false);
      setIsProcessingModal(false);
      setReference("");
      setConfirmReference("");
    }, 1200);
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case "phone":
        return <Smartphone size={18} />;
      case "wifi":
        return <Wifi size={18} />;
      case "zap":
        return <Zap size={18} />;
      case "flame":
        return <Flame size={18} />;
      case "tv":
        return <Tv size={18} />;
      default:
        return <Globe size={18} />;
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F7F7] text-black">
      {/* HEADER POS */}
      <POSHeader activeTab="servicios" />

      {/* CONTENIDO PRINCIPAL */}
      <div className="grid h-[calc(100vh-136px)] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] overflow-hidden">
        {/* COLUMNA IZQUIERDA: SERVICIOS Y RECARGAS */}
        <section className="flex flex-col min-w-0 border-r border-[#E2E2E2] bg-[#F9FAFB] p-6 overflow-hidden">
          {/* Búsqueda */}
          <div className="flex-none">
            <div className="flex h-12 flex-1 items-center rounded-xl border border-[#E5E7EB] bg-white px-4 shadow-sm focus-within:border-black">
              <Search size={18} className="mr-3 text-[#9CA3AF]" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar servicio (Megacable, Telcel, CFE, Totalplay, Izzi...)"
                className="h-full w-full bg-transparent text-sm text-black outline-none placeholder:text-[#9CA3AF]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-[#9CA3AF] hover:text-black">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Categorías */}
          <div className="mt-4 flex-none flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-[#D1D5DB]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`
                  h-9 whitespace-nowrap rounded-lg px-4 text-xs font-bold transition-all
                  ${
                    activeCategory === cat
                      ? "bg-black text-white shadow-sm"
                      : "border border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#9CA3AF] hover:text-black"
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid de Proveedores */}
          <div className="mt-4 flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#D1D5DB]">
            <p className="mb-3 text-xs font-bold text-[#6B7280]">
              Catálogo de Convenios ({filteredProviders.length})
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProviders.map((provider) => {
                const isSelected = selectedProvider?.id === provider.id;

                return (
                  <button
                    key={provider.id}
                    onClick={() => handleSelectProvider(provider)}
                    className={`
                      group flex flex-col justify-between rounded-xl border p-4 text-left transition-all shadow-xs
                      ${
                        isSelected
                          ? "border-2 border-[var(--primary)] bg-white ring-2 ring-[var(--primary)]/10 shadow-md"
                          : "border-[#E5E7EB] bg-white hover:border-[#9CA3AF] hover:shadow-sm"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${provider.badgeColor} ${provider.textColor} shadow-xs`}
                      >
                        {renderIcon(provider.iconType)}
                      </div>

                      {provider.commission > 0 ? (
                        <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-bold text-[#D97706]">
                          +${provider.commission} com.
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[10px] font-bold text-[#059669]">
                          Sin com.
                        </span>
                      )}
                    </div>

                    <div className="mt-3">
                      <h3 className="text-sm font-bold text-[#111827]">{provider.name}</h3>
                      <p className="mt-0.5 text-[11px] text-[#6B7280]">{provider.category}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* TABLA DE ÚLTIMOS PAGOS DE SERVICIOS PROCESADOS */}
            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History size={16} className="text-[#6B7280]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                    Últimas Transacciones de Servicios
                  </h3>
                </div>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-[10px] uppercase text-[#6B7280]">
                    <tr>
                      <th className="px-4 py-3">Folio</th>
                      <th className="px-4 py-3">Servicio</th>
                      <th className="px-4 py-3">Referencia</th>
                      <th className="px-4 py-3 text-right">Monto</th>
                      <th className="px-4 py-3 text-right">Total</th>
                      <th className="px-4 py-3 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {history.map((tx) => (
                      <tr key={tx.id} className="hover:bg-[#FAFAFA]">
                        <td className="px-4 py-3 font-mono font-semibold text-[#111827]">{tx.folio}</td>
                        <td className="px-4 py-3 font-bold text-black">{tx.serviceName}</td>
                        <td className="px-4 py-3 font-mono text-[#6B7280]">{tx.reference}</td>
                        <td className="px-4 py-3 text-right font-medium text-[#4B5563]">{money(tx.amount)}</td>
                        <td className="px-4 py-3 text-right font-bold text-[var(--primary)]">{money(tx.total)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[10px] font-bold text-[#059669]">
                            <CheckCircle2 size={11} /> {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* COLUMNA DERECHA: FORMULARIO DE COBRO DEL SERVICIO SELECCIONADO */}
        <aside className="flex min-w-0 h-full overflow-hidden flex-col bg-white border-l border-[#E5E7EB]">
          {selectedProvider ? (
            <div className="flex h-full flex-col justify-between">
              {/* Encabezado del Servicio */}
              <div className="border-b border-[#EEEEEE] p-6">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${selectedProvider.badgeColor} ${selectedProvider.textColor} shadow-md`}>
                    {renderIcon(selectedProvider.iconType)}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      {selectedProvider.category}
                    </span>
                    <h2 className="text-xl font-bold text-[#111827]">{selectedProvider.name}</h2>
                  </div>
                </div>
              </div>

              {/* Formulario de Datos */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#D1D5DB]">
                {errorMsg && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
                    {errorMsg}
                  </div>
                )}

                {/* Referencia / Contrato / Teléfono */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-[#374151]">
                    {selectedProvider.referenceLabel}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder={selectedProvider.referencePlaceholder}
                      className="h-12 w-full rounded-xl border border-[#D1D5DB] px-4 font-mono text-sm text-black outline-none focus:border-black focus:ring-1 focus:ring-black"
                    />
                    <button
                      type="button"
                      title="Escanear recibo o código de barras"
                      className="absolute right-3 text-[#6B7280] hover:text-black"
                    >
                      <Barcode size={20} />
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-[#6B7280]">
                    Longitud requerida: {selectedProvider.referenceLength}
                  </p>
                </div>

                {/* Selección de Monto / Paquetes */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-[#374151]">
                    Monto o Paquete a Pagar
                  </label>

                  {selectedProvider.presetAmounts ? (
                    <div className="grid grid-cols-3 gap-2">
                      {selectedProvider.presetAmounts.map((amt) => {
                        const active = selectedAmount === amt;
                        return (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setSelectedAmount(amt)}
                            className={`h-10 rounded-lg border text-xs font-bold transition-all ${
                              active
                                ? "border-2 border-black bg-black text-white shadow-xs"
                                : "border-[#E5E7EB] bg-[#FAFAFA] text-[#374151] hover:border-[#9CA3AF]"
                            }`}
                          >
                            ${amt} MXN
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setSelectedAmount("custom")}
                        className={`h-10 rounded-lg border text-xs font-bold transition-all ${
                          selectedAmount === "custom"
                            ? "border-2 border-black bg-black text-white shadow-xs"
                            : "border-[#E5E7EB] bg-[#FAFAFA] text-[#374151] hover:border-[#9CA3AF]"
                        }`}
                      >
                        Otro
                      </button>
                    </div>
                  ) : null}

                  {(!selectedProvider.presetAmounts || selectedAmount === "custom") && (
                    <div className="mt-3 relative flex items-center">
                      <span className="absolute left-4 font-bold text-[#6B7280]">$</span>
                      <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="0.00"
                        className="h-12 w-full rounded-xl border border-[#D1D5DB] pl-8 pr-4 font-bold text-base text-black outline-none focus:border-black focus:ring-1 focus:ring-black"
                      />
                    </div>
                  )}
                </div>

                {/* Desglose Informativo */}
                <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-[#6B7280]">
                    <span>Monto del Servicio</span>
                    <span className="font-bold text-[#111827]">{money(currentAmount)}</span>
                  </div>

                  <div className="flex justify-between text-[#6B7280]">
                    <span>Comisión del Sistema</span>
                    <span className="font-bold text-[#D97706]">{money(currentCommission)}</span>
                  </div>

                  <div className="border-t border-[#E5E7EB] pt-2 flex justify-between font-bold text-sm text-[#111827]">
                    <span>Total a Cobrar</span>
                    <span className="text-base text-[var(--primary)]">{money(currentTotal)}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-xl bg-[#EFF6FF] p-3 text-xs text-[#1D4ED8]">
                  <Info size={16} className="mt-0.5 flex-none text-[#2563EB]" />
                  <p className="leading-snug">
                    El pago o recarga se acredita de manera instantánea en la plataforma del proveedor.
                  </p>
                </div>
              </div>

              {/* Botón de Procesar Cobro */}
              <div className="border-t border-[#E5E7EB] p-6 bg-white">
                <button
                  onClick={handleProcessPayment}
                  className="
                    flex h-13 w-full items-center justify-center gap-2 rounded-xl
                    bg-[var(--primary)] text-sm font-bold text-white
                    shadow-md transition-all hover:bg-[var(--primary-hover)]
                  "
                >
                  <Receipt size={18} />
                  <span>Cobrar Servicio ({money(currentTotal)})</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center text-[#6B7280]">
              <Zap size={36} className="mb-3 text-[#9CA3AF]" />
              <p className="font-bold text-black">Selecciona un servicio</p>
              <p className="mt-1 text-xs">Elige un proveedor del catálogo para procesar la recarga o pago.</p>
            </div>
          )}
        </aside>
      </div>

      {/* MODAL DE CONFIRMACIÓN DE PAGO DE SERVICIO */}
      {isProcessingModal && selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-4">
              <h3 className="text-lg font-bold text-black">Confirmación de Pago</h3>
              <button onClick={() => setIsProcessingModal(false)} className="text-[#999999] hover:text-black">
                <X size={20} />
              </button>
            </div>

            {paymentSuccess ? (
              <div className="my-8 flex flex-col items-center text-center">
                <CheckCircle2 size={56} className="text-emerald-500 animate-bounce" />
                <h4 className="mt-4 text-xl font-bold text-black">¡Transacción Exitosa!</h4>
                <p className="mt-1 text-xs text-[#6B7280]">
                  Comprobante emitido correctamente para {selectedProvider.name}
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <div className="rounded-xl bg-[#F9FAFB] p-4 text-center border border-[#E5E7EB]">
                  <p className="text-xs font-bold uppercase text-[#6B7280]">{selectedProvider.name}</p>
                  <p className="mt-1 text-2xl font-mono font-bold text-black">{reference}</p>
                  <p className="mt-2 text-2xl font-bold text-[var(--primary)]">{money(currentTotal)}</p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[#6B7280]">
                    <span>Monto Servicio:</span>
                    <span className="font-bold text-black">{money(currentAmount)}</span>
                  </div>
                  <div className="flex justify-between text-[#6B7280]">
                    <span>Comisión:</span>
                    <span className="font-bold text-black">{money(currentCommission)}</span>
                  </div>
                </div>

                <button
                  onClick={handleConfirmSubmit}
                  className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-[var(--primary)] text-sm font-bold text-white shadow-md hover:bg-[var(--primary-hover)] transition-all"
                >
                  Procesar Transacción
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
