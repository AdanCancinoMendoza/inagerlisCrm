"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSidebar } from "@/context/SidebarContext";

const campaigns = [
  {
    id: 1,
    name: "Promoción fin de semana",
    type: "Oferta",
    audience: "Clientes frecuentes",
    content: "Coca-Cola 600ml",
    customers: 248,
    sent: 248,
    delivered: 241,
    read: 188,
    status: "Activa",
  },
  {
    id: 2,
    name: "Clientes sin comprar",
    type: "Recuperación",
    audience: "Inactivos 30 días",
    content: "10% de descuento",
    customers: 84,
    sent: 84,
    delivered: 80,
    read: 61,
    status: "Finalizada",
  },
  {
    id: 3,
    name: "Recordatorio de servicio",
    type: "Recordatorio",
    audience: "Servicio próximo",
    content: "Mantenimiento preventivo",
    customers: 54,
    sent: 0,
    delivered: 0,
    read: 0,
    status: "Programada",
  },
];

export default function CampanasPage() {
  const { collapsed } = useSidebar();

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
                CRM
              </p>

              <h1 className="mt-2 text-3xl font-bold text-black">
                Promociones
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-[#777777]">
                Envía promociones, descuentos y recordatorios personalizados a
                tus clientes.
              </p>
            </div>

            <button className="h-12 bg-[#D8A814] px-6 font-bold text-white transition-colors hover:bg-black">
              + Nueva campaña
            </button>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="border border-[#D8A814] bg-[#D8A814] p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.15em]">
                Campañas
              </p>

              <p className="mt-4 text-4xl font-bold">
                12
              </p>

              <p className="mt-2 text-sm">
                Campañas creadas
              </p>
            </div>

            <div className="border border-[#E2E2E2] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#777777]">
                Activas
              </p>

              <p className="mt-4 text-4xl font-bold text-black">
                3
              </p>

              <p className="mt-2 text-sm text-[#888888]">
                Ejecutándose actualmente
              </p>
            </div>

            <div className="border border-[#E2E2E2] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#777777]">
                Mensajes enviados
              </p>

              <p className="mt-4 text-4xl font-bold text-black">
                1,248
              </p>

              <p className="mt-2 text-sm text-[#888888]">
                Este mes
              </p>
            </div>

            <div className="border border-[#E2E2E2] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#777777]">
                Tasa de lectura
              </p>

              <p className="mt-4 text-4xl font-bold text-black">
                68%
              </p>

              <p className="mt-2 text-sm text-[#888888]">
                Mensajes visualizados
              </p>
            </div>
          </div>

          {/* WhatsApp */}
          <section className="mt-6 border border-[#E2E2E2] bg-white">
            <div className="flex items-center justify-between px-7 py-6">
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#050505] text-xl font-bold text-white">
                  W
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-black">
                      WhatsApp
                    </h2>

                    <span className="flex items-center gap-2 text-xs font-bold text-[#15803D]">
                      <span className="h-2 w-2 rounded-full bg-[#15803D]" />
                      CONECTADO
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-[#777777]">
                    +52 222 000 0000
                  </p>
                </div>
              </div>

              <button className="h-11 border border-black px-5 text-sm font-bold text-black transition-colors hover:bg-black hover:text-white">
                Administrar conexión
              </button>
            </div>

            <div className="grid grid-cols-1 border-t border-[#EEEEEE] md:grid-cols-3">
              <div className="px-7 py-5">
                <p className="text-xs uppercase text-[#999999]">
                  Estado
                </p>

                <p className="mt-1 font-semibold text-black">
                  Disponible para campañas
                </p>
              </div>

              <div className="border-[#EEEEEE] px-7 py-5 md:border-l">
                <p className="text-xs uppercase text-[#999999]">
                  Última sincronización
                </p>

                <p className="mt-1 font-semibold text-black">
                  Hoy, 10:42 AM
                </p>
              </div>

              <div className="border-[#EEEEEE] px-7 py-5 md:border-l">
                <p className="text-xs uppercase text-[#999999]">
                  Mensajes disponibles
                </p>

                <p className="mt-1 font-semibold text-black">
                  Sin límite configurado
                </p>
              </div>
            </div>
          </section>

          {/* Acciones */}
          <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
            {/* Nueva campaña */}
            <section className="border border-[#E2E2E2] bg-white p-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                Crear
              </p>

              <h2 className="mt-2 text-xl font-bold text-black">
                Nueva campaña
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#777777]">
                Envía ofertas, promociones o recordatorios a un grupo de
                clientes.
              </p>

              <div className="mt-7 space-y-3">
                <button className="flex w-full items-center justify-between border border-[#E5E5E5] px-5 py-4 text-left hover:border-[#D8A814]">
                  <div>
                    <p className="font-semibold text-black">
                      Promocionar artículo
                    </p>

                    <p className="mt-1 text-xs text-[#888888]">
                      Selecciona un producto del POS
                    </p>
                  </div>

                  <span className="text-[#D8A814]">
                    →
                  </span>
                </button>

                <button className="flex w-full items-center justify-between border border-[#E5E5E5] px-5 py-4 text-left hover:border-[#D8A814]">
                  <div>
                    <p className="font-semibold text-black">
                      Promocionar servicio
                    </p>

                    <p className="mt-1 text-xs text-[#888888]">
                      Descuentos o campañas de servicios
                    </p>
                  </div>

                  <span className="text-[#D8A814]">
                    →
                  </span>
                </button>

                <button className="flex w-full items-center justify-between border border-[#E5E5E5] px-5 py-4 text-left hover:border-[#D8A814]">
                  <div>
                    <p className="font-semibold text-black">
                      Mensaje personalizado
                    </p>

                    <p className="mt-1 text-xs text-[#888888]">
                      Crea un mensaje desde cero
                    </p>
                  </div>

                  <span className="text-[#D8A814]">
                    →
                  </span>
                </button>
              </div>
            </section>

            {/* Audiencias */}
            <section className="border border-[#E2E2E2] bg-white p-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                Audiencias
              </p>

              <h2 className="mt-2 text-xl font-bold text-black">
                Segmentos sugeridos
              </h2>

              <div className="mt-6 space-y-5">
                <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-4">
                  <div>
                    <p className="font-semibold text-black">
                      Clientes frecuentes
                    </p>

                    <p className="mt-1 text-xs text-[#888888]">
                      Más de 5 compras
                    </p>
                  </div>

                  <span className="font-bold text-[#D8A814]">
                    74
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-4">
                  <div>
                    <p className="font-semibold text-black">
                      Clientes nuevos
                    </p>

                    <p className="mt-1 text-xs text-[#888888]">
                      Registrados últimos 30 días
                    </p>
                  </div>

                  <span className="font-bold text-[#D8A814]">
                    31
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-4">
                  <div>
                    <p className="font-semibold text-black">
                      Clientes inactivos
                    </p>

                    <p className="mt-1 text-xs text-[#888888]">
                      Sin comprar en 30 días
                    </p>
                  </div>

                  <span className="font-bold text-[#D8A814]">
                    84
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-black">
                      Cumpleaños del mes
                    </p>

                    <p className="mt-1 text-xs text-[#888888]">
                      Clientes con cumpleaños próximo
                    </p>
                  </div>

                  <span className="font-bold text-[#D8A814]">
                    18
                  </span>
                </div>
              </div>
            </section>

            {/* Automatizaciones */}
            <section className="border border-[#050505] bg-[#050505] p-7 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                Automatización
              </p>

              <h2 className="mt-2 text-xl font-bold">
                Campañas inteligentes
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#AAAAAA]">
                Configura mensajes automáticos según el comportamiento de tus
                clientes.
              </p>

              <div className="mt-7 space-y-5">
                <div className="border-b border-[#292929] pb-4">
                  <p className="font-semibold">
                    Recompra
                  </p>

                  <p className="mt-1 text-xs text-[#888888]">
                    Contactar después de cierto tiempo.
                  </p>
                </div>

                <div className="border-b border-[#292929] pb-4">
                  <p className="font-semibold">
                    Cliente inactivo
                  </p>

                  <p className="mt-1 text-xs text-[#888888]">
                    Enviar promoción después de 30 días.
                  </p>
                </div>

                <div>
                  <p className="font-semibold">
                    Cumpleaños
                  </p>

                  <p className="mt-1 text-xs text-[#888888]">
                    Enviar descuento automáticamente.
                  </p>
                </div>
              </div>

              <button className="mt-7 h-11 w-full bg-[#D8A814] font-bold text-white hover:bg-white hover:text-black">
                Configurar automatizaciones
              </button>
            </section>
          </div>

          {/* Campañas recientes */}
          <section className="mt-6 border border-[#E2E2E2] bg-white">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] px-7 py-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
                  Historial
                </p>

                <h2 className="mt-1 text-xl font-bold text-black">
                  Campañas recientes
                </h2>
              </div>

              <button className="text-sm font-bold text-[#D8A814] hover:text-black">
                Ver todas
              </button>
            </div>

            <div className="grid grid-cols-[2fr_1.2fr_1.2fr_.8fr_.8fr_.8fr_1fr] bg-[#FAFAFA] px-6 py-4">
              <span className="text-xs font-bold uppercase text-[#777777]">
                Campaña
              </span>

              <span className="text-xs font-bold uppercase text-[#777777]">
                Audiencia
              </span>

              <span className="text-xs font-bold uppercase text-[#777777]">
                Contenido
              </span>

              <span className="text-center text-xs font-bold uppercase text-[#777777]">
                Enviados
              </span>

              <span className="text-center text-xs font-bold uppercase text-[#777777]">
                Entregados
              </span>

              <span className="text-center text-xs font-bold uppercase text-[#777777]">
                Leídos
              </span>

              <span className="text-right text-xs font-bold uppercase text-[#777777]">
                Estado
              </span>
            </div>

            {campaigns.map((campaign) => (
              <button
                key={campaign.id}
                className="grid w-full grid-cols-[2fr_1.2fr_1.2fr_.8fr_.8fr_.8fr_1fr] items-center border-t border-[#EEEEEE] px-6 py-5 text-left hover:bg-[#FAFAFA]"
              >
                <div>
                  <p className="font-bold text-black">
                    {campaign.name}
                  </p>

                  <p className="mt-1 text-xs text-[#999999]">
                    {campaign.type}
                  </p>
                </div>

                <p className="text-sm text-[#555555]">
                  {campaign.audience}
                </p>

                <p className="truncate pr-4 text-sm text-[#555555]">
                  {campaign.content}
                </p>

                <p className="text-center font-semibold text-black">
                  {campaign.sent}
                </p>

                <p className="text-center font-semibold text-black">
                  {campaign.delivered}
                </p>

                <p className="text-center font-semibold text-black">
                  {campaign.read}
                </p>

                <div className="text-right">
                  <span
                    className={`
                      inline-block px-3 py-1 text-xs font-bold
                      ${
                        campaign.status === "Activa"
                          ? "bg-[#D8A814] text-white"
                          : campaign.status === "Programada"
                          ? "border border-[#D8A814] text-[#D8A814]"
                          : "bg-[#EEEEEE] text-[#555555]"
                      }
                    `}
                  >
                    {campaign.status}
                  </span>
                </div>
              </button>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}