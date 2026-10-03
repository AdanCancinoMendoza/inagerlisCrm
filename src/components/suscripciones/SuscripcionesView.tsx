"use client";

import { useState } from "react";
import {
  CreditCard,
  Check,
  Zap,
  ShieldCheck,
  Sparkles,
  Plus,
  Trash2,
  Download,
  Calendar,
  Building2,
  Users,
  HardDrive,
  FileText,
  AlertCircle,
  X,
  CheckCircle2,
  ChevronRight,
  Lock,
} from "lucide-react";

interface PaymentMethod {
  id: string;
  brand: "visa" | "mastercard" | "amex";
  last4: string;
  expMonth: string;
  expYear: string;
  holderName: string;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  number: string;
  date: string;
  plan: string;
  amount: string;
  status: "Pagado" | "Pendiente" | "Cancelado";
  method: string;
}

const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "card-1",
    brand: "visa",
    last4: "4242",
    expMonth: "12",
    expYear: "28",
    holderName: "ADAN MORALES",
    isDefault: true,
  },
  {
    id: "card-2",
    brand: "mastercard",
    last4: "8819",
    expMonth: "08",
    expYear: "27",
    holderName: "ADAN MORALES",
    isDefault: false,
  },
];

const INVOICES_DATA: Invoice[] = [
  {
    id: "inv-001",
    number: "FACT-2026-009",
    date: "15 Oct 2026",
    plan: "Plan Pro Empresarial (Anual)",
    amount: "$9,588.00 MXN",
    status: "Pagado",
    method: "Visa •••• 4242",
  },
  {
    id: "inv-002",
    number: "FACT-2025-009",
    date: "15 Oct 2025",
    plan: "Plan Pro Empresarial (Anual)",
    amount: "$9,588.00 MXN",
    status: "Pagado",
    method: "Visa •••• 4242",
  },
  {
    id: "inv-003",
    number: "FACT-2024-009",
    date: "15 Oct 2024",
    plan: "Plan Básico Emprendedor (Mensual)",
    amount: "$499.00 MXN",
    status: "Pagado",
    method: "Mastercard •••• 8819",
  },
];

export default function SuscripcionesView() {
  const [activeTab, setActiveTab] = useState<
    "Mi Suscripción" | "Planes Disponibles" | "Métodos de Pago" | "Historial de Facturas"
  >("Mi Suscripción");

  const [billingCycle, setBillingCycle] = useState<"mensual" | "anual">("anual");
  const [activePlanId, setActivePlanId] = useState<string>("pro");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(INITIAL_PAYMENT_METHODS);

  // Modales
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [targetPlan, setTargetPlan] = useState<{ id: string; name: string; price: string } | null>(null);

  // Formulario nueva tarjeta
  const [newCard, setNewCard] = useState({
    holderName: "",
    cardNumber: "",
    expMonth: "12",
    expYear: "28",
    cvc: "",
  });

  // Notificación tipo toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSetDefaultCard = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((card) => ({
        ...card,
        isDefault: card.id === id,
      }))
    );
    showToast("Método de pago predeterminado actualizado.");
  };

  const handleDeleteCard = (id: string) => {
    const cardToDelete = paymentMethods.find((c) => c.id === id);
    if (cardToDelete?.isDefault && paymentMethods.length > 1) {
      showToast("No puedes eliminar la tarjeta predeterminada. Asigna otra primero.");
      return;
    }
    setPaymentMethods((prev) => prev.filter((card) => card.id !== id));
    showToast("Método de pago eliminado correctamente.");
  };

  const handleAddCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.cardNumber || !newCard.holderName) {
      alert("Por favor completa los datos requeridos de la tarjeta.");
      return;
    }

    const last4 = newCard.cardNumber.replace(/\s+/g, "").slice(-4) || "9999";
    const brand: "visa" | "mastercard" | "amex" = newCard.cardNumber.startsWith("3")
      ? "amex"
      : newCard.cardNumber.startsWith("5")
      ? "mastercard"
      : "visa";

    const createdCard: PaymentMethod = {
      id: `card-${Date.now()}`,
      brand,
      last4,
      expMonth: newCard.expMonth,
      expYear: newCard.expYear,
      holderName: newCard.holderName.toUpperCase(),
      isDefault: paymentMethods.length === 0,
    };

    setPaymentMethods((prev) => [...prev, createdCard]);
    setIsAddCardOpen(false);
    setNewCard({ holderName: "", cardNumber: "", expMonth: "12", expYear: "28", cvc: "" });
    showToast(`Tarjeta ${brand.toUpperCase()} •••• ${last4} agregada con éxito.`);
  };

  const handleConfirmPlanChange = () => {
    if (targetPlan) {
      setActivePlanId(targetPlan.id);
      setIsUpgradeModalOpen(false);
      showToast(`¡Felicidades! Tu suscripción ha sido actualizada a: ${targetPlan.name}.`);
    }
  };

  const openUpgradeModal = (planId: string, planName: string, priceStr: string) => {
    setTargetPlan({ id: planId, name: planName, price: priceStr });
    setIsUpgradeModalOpen(true);
  };

  // Definición de planes
  const plans = [
    {
      id: "basico",
      name: "Plan Emprendedor",
      tagline: "Ideal para pequeños negocios o tiendas de una sola sucursal.",
      priceMonthly: 499,
      priceYearly: 399,
      badge: null,
      color: "border-[#E5E5E5]",
      features: [
        "Hasta 3 Usuarios del sistema",
        "1 Sucursal activa",
        "Hasta 1,500 Tickets/mes",
        "Punto de venta (POS) web",
        "Gestión básica de clientes",
        "Reportes mensuales de venta",
        "Soporte estándar vía correo",
      ],
    },
    {
      id: "pro",
      name: "Plan Pro Empresarial",
      tagline: "Diseñado para empresas en crecimiento con múltiples terminales y equipo.",
      priceMonthly: 999,
      priceYearly: 799,
      badge: "MÁS POPULAR",
      color: "border-[#D8A814] ring-2 ring-[#D8A814]/30 bg-white",
      features: [
        "Hasta 15 Usuarios del sistema",
        "Hasta 5 Sucursales activas",
        "Hasta 5,000 Tickets/mes",
        "Punto de Venta (POS) Ilimitado",
        "Facturación Electrónica CFDI 4.0",
        "Gestión avanzada de inventario y stock",
        "Módulo de Promociones y Descuentos",
        "Reportes avanzados y analítica en tiempo real",
        "Soporte prioritario 24/7 vía Chat y Teléfono",
      ],
    },
    {
      id: "enterprise",
      name: "Plan Corporativo Enterprise",
      tagline: "Para grandes cadenas comerciales con requerimientos personalizados y alto volumen.",
      priceMonthly: 2499,
      priceYearly: 1999,
      badge: "MÁXIMA CAPACIDAD",
      color: "border-[#141414]",
      features: [
        "Usuarios ilimitados",
        "Sucursales y Terminales ilimitadas",
        "Tickets y Facturación sin límite",
        "Integración API & Webhooks personalizados",
        "Gerente de cuenta y asesor dedicado",
        "Respaldos automatizados en tiempo real",
        "Garantía de disponibilidad SLA 99.9%",
        "Capacitación personalizada para tu personal",
      ],
    },
  ];

  const currentPlanObj = plans.find((p) => p.id === activePlanId) || plans[1];

  return (
    <div className="w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 border border-[#D8A814] bg-[#141414] px-5 py-4 text-white shadow-2xl transition-all">
          <CheckCircle2 size={20} className="text-[#D8A814]" />
          <p className="text-sm font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Navegación por Pestañas Internas */}
      <div className="mb-8 flex overflow-x-auto border-b border-[#DCDCDC]">
        {[
          { id: "Mi Suscripción", label: "Mi Suscripción", icon: Sparkles },
          { id: "Planes Disponibles", label: "Planes Disponibles", icon: Zap },
          { id: "Métodos de Pago", label: "Métodos de Pago", icon: CreditCard },
          { id: "Historial de Facturas", label: "Historial de Facturas", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-2 border-b-2 px-6 py-4
                text-sm font-semibold transition-colors whitespace-nowrap
                ${
                  isActive
                    ? "border-[#D8A814] text-[#D8A814] bg-white"
                    : "border-transparent text-[#777777] hover:text-black hover:bg-white/50"
                }
              `}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MI SUSCRIPCIÓN ACTUAL */}
      {/* ========================================================================= */}
      {activeTab === "Mi Suscripción" && (
        <div className="space-y-8">
          {/* Tarjeta Destacada de Suscripción Actual */}
          <section className="relative overflow-hidden border border-[#D8A814] bg-gradient-to-br from-[#1A1A1A] via-[#141414] to-[#0A0A0A] p-8 text-white shadow-xl">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Sparkles size={240} className="text-[#D8A814]" />
            </div>

            <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#D8A814]/20 border border-[#D8A814]/40 px-3 py-1 text-xs font-bold text-[#D8A814] uppercase tracking-wider mb-4">
                  <ShieldCheck size={14} /> Plan Activo
                </div>

                <h2 className="text-3xl font-extrabold text-white">{currentPlanObj.name}</h2>
                <p className="mt-2 text-sm text-[#AAAAAA] max-w-xl">
                  {currentPlanObj.tagline}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-[#333333] pt-6 text-sm text-[#CCCCCC]">
                  <div>
                    <p className="text-xs uppercase text-[#888888]">Precio de renovación</p>
                    <p className="text-lg font-bold text-white mt-0.5">
                      ${activePlanId === "basico" ? "499" : activePlanId === "pro" ? "999" : "2,499"} MXN / mes
                    </p>
                  </div>

                  <div className="h-8 w-px bg-[#333333] hidden sm:block" />

                  <div>
                    <p className="text-xs uppercase text-[#888888]">Ciclo de facturación</p>
                    <p className="text-sm font-semibold text-white mt-0.5 flex items-center gap-1.5">
                      <Calendar size={14} className="text-[#D8A814]" /> Renovación Anual (15 Nov 2026)
                    </p>
                  </div>

                  <div className="h-8 w-px bg-[#333333] hidden sm:block" />

                  <div>
                    <p className="text-xs uppercase text-[#888888]">Método de pago asociado</p>
                    <p className="text-sm font-semibold text-white mt-0.5 flex items-center gap-1.5">
                      <CreditCard size={14} className="text-[#D8A814]" />
                      {paymentMethods.find((p) => p.isDefault)?.brand.toUpperCase() || "VISA"} ••••{" "}
                      {paymentMethods.find((p) => p.isDefault)?.last4 || "4242"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex flex-col gap-3 shrink-0 sm:flex-row lg:flex-col">
                <button
                  onClick={() => setActiveTab("Planes Disponibles")}
                  className="flex items-center justify-center gap-2 bg-[#D8A814] hover:bg-white hover:text-black text-black font-bold h-12 px-6 transition-all"
                >
                  <Zap size={18} />
                  Cambiar o Mejorar Plan
                </button>

                <button
                  onClick={() => setActiveTab("Historial de Facturas")}
                  className="flex items-center justify-center gap-2 border border-[#444444] hover:border-white text-white font-semibold h-12 px-6 transition-all bg-[#1E1E1E]"
                >
                  <Download size={16} />
                  Descargar Recibo Actual
                </button>
              </div>
            </div>
          </section>

          {/* Métricas de Uso del Plan / Cuotas */}
          <section className="border border-[#E2E2E2] bg-white p-8">
            <div className="mb-6 border-b border-[#E5E5E5] pb-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                Uso y Capacidad
              </p>
              <h3 className="mt-1 text-xl font-bold text-black">
                Consumo de recursos en este periodo
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              <div className="border border-[#EEEEEE] bg-[#FAFAFA] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-[#777777] flex items-center gap-1.5">
                    <Users size={15} className="text-[#D8A814]" /> Usuarios Activos
                  </span>
                  <span className="text-xs font-bold text-black">8 / 15</span>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <p className="text-2xl font-extrabold text-black">53%</p>
                  <p className="text-xs text-[#777777]">7 disponibles</p>
                </div>

                <div className="mt-3 h-2.5 w-full bg-[#E5E5E5] overflow-hidden">
                  <div className="h-full bg-[#D8A814] transition-all duration-500" style={{ width: "53%" }} />
                </div>
              </div>

              <div className="border border-[#EEEEEE] bg-[#FAFAFA] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-[#777777] flex items-center gap-1.5">
                    <Building2 size={15} className="text-[#D8A814]" /> Sucursales Activas
                  </span>
                  <span className="text-xs font-bold text-black">2 / 5</span>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <p className="text-2xl font-extrabold text-black">40%</p>
                  <p className="text-xs text-[#777777]">3 disponibles</p>
                </div>

                <div className="mt-3 h-2.5 w-full bg-[#E5E5E5] overflow-hidden">
                  <div className="h-full bg-black transition-all duration-500" style={{ width: "40%" }} />
                </div>
              </div>

              <div className="border border-[#EEEEEE] bg-[#FAFAFA] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-[#777777] flex items-center gap-1.5">
                    <FileText size={15} className="text-[#D8A814]" /> Tickets Emitidos
                  </span>
                  <span className="text-xs font-bold text-black">1,420 / 5,000</span>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <p className="text-2xl font-extrabold text-black">28.4%</p>
                  <p className="text-xs text-[#777777]">3,580 disponibles</p>
                </div>

                <div className="mt-3 h-2.5 w-full bg-[#E5E5E5] overflow-hidden">
                  <div className="h-full bg-[#D8A814] transition-all duration-500" style={{ width: "28.4%" }} />
                </div>
              </div>

              <div className="border border-[#EEEEEE] bg-[#FAFAFA] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-[#777777] flex items-center gap-1.5">
                    <HardDrive size={15} className="text-[#D8A814]" /> Almacenamiento Nube
                  </span>
                  <span className="text-xs font-bold text-black">4.5 GB / 15 GB</span>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <p className="text-2xl font-extrabold text-black">30%</p>
                  <p className="text-xs text-[#777777]">10.5 GB libres</p>
                </div>

                <div className="mt-3 h-2.5 w-full bg-[#E5E5E5] overflow-hidden">
                  <div className="h-full bg-emerald-600 transition-all duration-500" style={{ width: "30%" }} />
                </div>
              </div>
            </div>
          </section>

          {/* Beneficios Incluidos en tu Plan Actual */}
          <section className="border border-[#E2E2E2] bg-white p-8">
            <h4 className="text-lg font-bold text-black mb-4">Beneficios y módulos incluidos en tu plan</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentPlanObj.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border border-[#F0F0F0] bg-[#FAFAFA]">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D8A814] text-white">
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <span className="text-sm font-medium text-[#333333]">{feature}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PLANES DISPONIBLES */}
      {/* ========================================================================= */}
      {activeTab === "Planes Disponibles" && (
        <div className="space-y-8">
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
              Escala según tus necesidades
            </span>
            <h2 className="mt-1 text-3xl font-bold text-black">Elige el plan ideal para tu negocio</h2>
            <p className="mt-2 text-sm text-[#777777]">
              Cambia de plan en cualquier momento. Los cobros se ajustan prorrateadamente.
            </p>

            <div className="mt-6 inline-flex items-center gap-3 bg-[#EAEAEA] p-1.5 rounded-full border border-[#DDD]">
              <button
                onClick={() => setBillingCycle("mensual")}
                className={`px-5 py-2 text-sm font-bold rounded-full transition-all ${
                  billingCycle === "mensual" ? "bg-white text-black shadow-md" : "text-[#666666] hover:text-black"
                }`}
              >
                Pago Mensual
              </button>

              <button
                onClick={() => setBillingCycle("anual")}
                className={`flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-full transition-all ${
                  billingCycle === "anual" ? "bg-[#141414] text-white shadow-md" : "text-[#666666] hover:text-black"
                }`}
              >
                Pago Anual
                <span className="bg-[#D8A814] text-black text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full">
                  Ahorra 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = plan.id === activePlanId;
              const price = billingCycle === "anual" ? plan.priceYearly : plan.priceMonthly;

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col justify-between border bg-white p-8 transition-all hover:shadow-xl ${
                    plan.color
                  } ${isCurrent ? "scale-[1.02]" : ""}`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#D8A814] px-4 py-1 text-xs font-extrabold text-black uppercase tracking-wider shadow-sm">
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    <div className="mb-6 border-b border-[#EEEEEE] pb-6">
                      <h3 className="text-2xl font-bold text-black">{plan.name}</h3>
                      <p className="mt-2 text-xs text-[#777777] min-h-[36px]">{plan.tagline}</p>

                      <div className="mt-6 flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold text-black">${price.toLocaleString()}</span>
                        <span className="text-sm font-semibold text-[#777777]">MXN / mes</span>
                      </div>

                      {billingCycle === "anual" && (
                        <p className="mt-1 text-xs text-[#D8A814] font-semibold">
                          Facturado anualmente (${(price * 12).toLocaleString()} MXN / año)
                        </p>
                      )}
                    </div>

                    <div className="space-y-3 mb-8">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#999999]">Incluye:</p>
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-sm">
                          <Check size={16} className="text-[#D8A814] shrink-0 mt-0.5" strokeWidth={2.5} />
                          <span className="text-[#444444] font-medium">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    {isCurrent ? (
                      <button
                        disabled
                        className="w-full bg-[#F0F0F0] text-[#777777] font-bold h-12 cursor-default border border-[#DDD] flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={18} className="text-emerald-600" />
                        Plan Actual Activado
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          openUpgradeModal(
                            plan.id,
                            plan.name,
                            `$${price.toLocaleString()} MXN / mes`
                          )
                        }
                        className="w-full bg-[#141414] hover:bg-[#D8A814] hover:text-black text-white font-bold h-12 transition-all flex items-center justify-center gap-2"
                      >
                        Seleccionar {plan.name}
                        <ChevronRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border border-[#E5E5E5] bg-white p-8">
            <h4 className="text-base font-bold text-black mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-[#D8A814]" /> Preguntas frecuentes sobre cambios de plan
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[#666666]">
              <div>
                <p className="font-bold text-black mb-1">¿Cómo funciona el cobro proporcional?</p>
                <p>Al cambiarte de plan antes de que termine tu periodo actual, se calculará el tiempo restante y solo pagarás la diferencia ajustada a tu nuevo plan.</p>
              </div>
              <div>
                <p className="font-bold text-black mb-1">¿Puedo cancelar en cualquier momento?</p>
                <p>Sí, no hay plazos forzosos. Si cancelas, mantendrás acceso a las funciones de tu plan pagado hasta el final de la fecha de corte.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MÉTODOS DE PAGO */}
      {/* ========================================================================= */}
      {activeTab === "Métodos de Pago" && (
        <div className="space-y-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-bold text-black">Tarjetas y Métodos de Pago</h2>
              <p className="mt-1 text-sm text-[#777777]">
                Administra las tarjetas de crédito o débito asociadas a tu cuenta para cobros automáticos de suscripción.
              </p>
            </div>

            <button
              onClick={() => setIsAddCardOpen(true)}
              className="flex items-center justify-center gap-2 bg-[#D8A814] hover:bg-black hover:text-white text-black font-bold h-12 px-6 transition-all"
            >
              <Plus size={18} />
              Agregar nueva tarjeta
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`relative border p-6 bg-white transition-all ${
                  method.isDefault
                    ? "border-[#D8A814] ring-2 ring-[#D8A814]/20 shadow-md"
                    : "border-[#E2E2E2] hover:border-[#CCCCCC]"
                }`}
              >
                {method.isDefault && (
                  <div className="absolute top-4 right-4 bg-[#D8A814] text-black text-[10px] font-extrabold uppercase px-2.5 py-1 tracking-wider">
                    Predeterminada
                  </div>
                )}

                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-12 w-16 items-center justify-center border border-[#E0E0E0] bg-[#FAFAFA] text-lg font-extrabold text-black">
                    {method.brand === "visa" && <span className="text-blue-800 font-serif italic">VISA</span>}
                    {method.brand === "mastercard" && <span className="text-orange-600 font-sans">MC</span>}
                    {method.brand === "amex" && <span className="text-cyan-700 font-mono">AMEX</span>}
                  </div>

                  <div>
                    <p className="font-bold text-black">•••• •••• •••• {method.last4}</p>
                    <p className="text-xs text-[#777777]">Expira: {method.expMonth}/{method.expYear}</p>
                  </div>
                </div>

                <div className="border-t border-[#EEEEEE] pt-4 mb-4">
                  <p className="text-xs uppercase text-[#888888]">Titular de la tarjeta</p>
                  <p className="text-sm font-semibold text-black">{method.holderName}</p>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-[#EEEEEE] pt-4">
                  {!method.isDefault ? (
                    <button
                      onClick={() => handleSetDefaultCard(method.id)}
                      className="text-xs font-bold text-[#D8A814] hover:text-black hover:underline"
                    >
                      Establecer predeterminada
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <Check size={14} /> Usada para renovaciones
                    </span>
                  )}

                  <button
                    onClick={() => handleDeleteCard(method.id)}
                    className="text-[#999999] hover:text-red-600 transition-colors p-1"
                    title="Eliminar tarjeta"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 border border-[#E5E5E5] bg-[#FAFAFA] p-6 text-sm text-[#666666]">
            <Lock size={24} className="text-[#D8A814] shrink-0" />
            <div>
              <p className="font-bold text-black">Pagos procesados con seguridad cifrada de 256-bits</p>
              <p className="text-xs text-[#777777] mt-0.5">
                No almacenamos los números completos de tu tarjeta. Todos los cobros se gestionan de forma segura cumpliendo con estándares PCI-DSS.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: HISTORIAL DE FACTURAS */}
      {/* ========================================================================= */}
      {activeTab === "Historial de Facturas" && (
        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-bold text-black">Historial de Facturación y CFDI</h2>
              <p className="mt-1 text-sm text-[#777777]">
                Descarga los comprobantes fiscales y recibos de los pagos realizados de tu suscripción.
              </p>
            </div>

            <button
              onClick={() => showToast("Exportando historial completo en PDF...")}
              className="flex items-center justify-center gap-2 border border-black hover:bg-black hover:text-white text-black font-bold h-11 px-5 transition-all text-sm"
            >
              <Download size={16} />
              Exportar Historial
            </button>
          </div>

          <div className="border border-[#E2E2E2] bg-white overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-xs uppercase font-bold text-[#777777]">
                <tr>
                  <th className="px-6 py-4">Folio / Factura</th>
                  <th className="px-6 py-4">Fecha de Emisión</th>
                  <th className="px-6 py-4">Concepto / Plan</th>
                  <th className="px-6 py-4">Método</th>
                  <th className="px-6 py-4">Monto Total</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Comprobante</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#EEEEEE]">
                {INVOICES_DATA.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-6 py-4 font-bold text-black flex items-center gap-2">
                      <FileText size={16} className="text-[#D8A814]" />
                      {inv.number}
                    </td>
                    <td className="px-6 py-4 text-[#555555]">{inv.date}</td>
                    <td className="px-6 py-4 font-semibold text-black">{inv.plan}</td>
                    <td className="px-6 py-4 text-[#666666]">{inv.method}</td>
                    <td className="px-6 py-4 font-bold text-black">{inv.amount}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full">
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => showToast(`Descargando factura ${inv.number}.pdf...`)}
                        className="inline-flex items-center gap-1.5 border border-[#DDD] hover:border-black px-3 py-1.5 text-xs font-bold text-black bg-white hover:bg-black hover:text-white transition-all"
                      >
                        <Download size={14} /> PDF / XML
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AGREGAR NUEVA TARJETA */}
      {/* ========================================================================= */}
      {isAddCardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg border border-[#E5E5E5] bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-4 mb-6">
              <h3 className="text-xl font-bold text-black flex items-center gap-2">
                <CreditCard className="text-[#D8A814]" /> Agregar método de pago
              </h3>
              <button
                onClick={() => setIsAddCardOpen(false)}
                className="text-[#888888] hover:text-black transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCardSubmit} className="space-y-5">
              <div className="rounded-xl border border-[#D8A814] bg-gradient-to-br from-[#1C1C1C] to-[#0A0A0A] p-5 text-white shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#D8A814]">
                    Tarjeta Débito / Crédito
                  </span>
                  <span className="text-sm font-bold italic">
                    {newCard.cardNumber.startsWith("3") ? "AMEX" : newCard.cardNumber.startsWith("5") ? "MASTERCARD" : "VISA"}
                  </span>
                </div>

                <p className="font-mono text-lg tracking-widest my-2">
                  {newCard.cardNumber || "•••• •••• •••• ••••"}
                </p>

                <div className="flex items-center justify-between mt-4 text-xs">
                  <div>
                    <p className="uppercase text-[#888888] text-[9px]">Titular</p>
                    <p className="font-bold uppercase">{newCard.holderName || "NOMBRE DEL TITULAR"}</p>
                  </div>
                  <div>
                    <p className="uppercase text-[#888888] text-[9px]">Expira</p>
                    <p className="font-bold">{newCard.expMonth}/{newCard.expYear}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-black mb-1">
                  Nombre del titular
                </label>
                <input
                  type="text"
                  placeholder="Ej. ADAN MORALES"
                  value={newCard.holderName}
                  onChange={(e) => setNewCard({ ...newCard, holderName: e.target.value })}
                  required
                  className="h-11 w-full border border-[#DDD] px-4 text-sm outline-none focus:border-[#D8A814]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-black mb-1">
                  Número de tarjeta
                </label>
                <input
                  type="text"
                  maxLength={19}
                  placeholder="4532 0000 0000 0000"
                  value={newCard.cardNumber}
                  onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value })}
                  required
                  className="h-11 w-full border border-[#DDD] px-4 font-mono text-sm outline-none focus:border-[#D8A814]"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-black mb-1">Mes Exp.</label>
                  <select
                    value={newCard.expMonth}
                    onChange={(e) => setNewCard({ ...newCard, expMonth: e.target.value })}
                    className="h-11 w-full border border-[#DDD] bg-white px-3 text-sm outline-none"
                  >
                    {Array.from({ length: 12 }, (_, i) => {
                      const m = (i + 1).toString().padStart(2, "0");
                      return <option key={m} value={m}>{m}</option>;
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-black mb-1">Año Exp.</label>
                  <select
                    value={newCard.expYear}
                    onChange={(e) => setNewCard({ ...newCard, expYear: e.target.value })}
                    className="h-11 w-full border border-[#DDD] bg-white px-3 text-sm outline-none"
                  >
                    {["26", "27", "28", "29", "30", "31"].map((yr) => (
                      <option key={yr} value={yr}>20{yr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-black mb-1">CVC / CWW</label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="123"
                    value={newCard.cvc}
                    onChange={(e) => setNewCard({ ...newCard, cvc: e.target.value })}
                    required
                    className="h-11 w-full border border-[#DDD] px-3 font-mono text-sm outline-none focus:border-[#D8A814]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#EEEEEE] pt-5 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddCardOpen(false)}
                  className="h-11 px-5 border border-[#DDD] text-sm font-bold text-[#666666] hover:bg-[#F5F5F5]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-11 px-6 bg-[#D8A814] hover:bg-black hover:text-white font-bold text-black text-sm transition-all"
                >
                  Guardar tarjeta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIRMACIÓN DE CAMBIO DE PLAN */}
      {/* ========================================================================= */}
      {isUpgradeModalOpen && targetPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-[#E5E5E5] bg-white p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FAF6E8] text-[#D8A814]">
                <Zap size={28} />
              </div>
              <h3 className="text-2xl font-bold text-black">Confirmar cambio de plan</h3>
              <p className="text-sm text-[#777777] mt-1">
                Estás a punto de actualizar tu suscripción a:
              </p>
              <p className="text-lg font-extrabold text-[#D8A814] mt-2">{targetPlan.name}</p>
              <p className="text-sm font-bold text-black mt-1">{targetPlan.price}</p>
            </div>

            <div className="border border-[#EEEEEE] bg-[#FAFAFA] p-4 text-xs text-[#666666] space-y-2 mb-6">
              <div className="flex justify-between">
                <span>Método de cobro:</span>
                <span className="font-bold text-black">Visa •••• 4242</span>
              </div>
              <div className="flex justify-between">
                <span>Ajuste proporcional:</span>
                <span className="font-bold text-emerald-600">Aplicado de inmediato</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="flex-1 h-11 border border-[#DDD] text-sm font-bold text-[#666666] hover:bg-[#F5F5F5]"
              >
                Cancelar
              </button>

              <button
                onClick={handleConfirmPlanChange}
                className="flex-1 h-11 bg-[#D8A814] hover:bg-black hover:text-white font-bold text-black text-sm transition-all"
              >
                Confirmar actualización
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
