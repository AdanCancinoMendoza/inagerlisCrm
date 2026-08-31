import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

import MetricCard from "@/components/dashboard/MetricCard";
import TopProducts from "@/components/dashboard/TopProducts";
import FrequentCustomers from "@/components/dashboard/FrequentCustomers";
import TopSellers from "@/components/dashboard/TopSellers";
import PendingFollowUps from "@/components/dashboard/PendingFollowUps";

export default function InicioPage() {
  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Sidebar />

      <div className="ml-[250px] min-h-screen">
        <Header />

        <div className="p-10">
          {/* Título */}
          <div className="mb-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
              Dashboard
            </p>

            <h2 className="mt-2 text-2xl font-bold text-black">
              Resumen de hoy
            </h2>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Ventas del día"
              value="$18,450"
              description="+12.5% respecto a ayer"
              accent
            />

            <MetricCard
              title="Clientes nuevos"
              value="12"
              description="+4 clientes hoy"
            />

            <MetricCard
              title="Clientes frecuentes"
              value="48"
              description="Compraron nuevamente"
            />

            <MetricCard
              title="Ticket promedio"
              value="$576"
              description="+5.2% respecto a ayer"
            />
          </div>

          {/* Primera fila */}
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <TopProducts />

            <PendingFollowUps />
          </div>

          {/* Segunda fila */}
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <FrequentCustomers />

            <TopSellers />
          </div>
        </div>
      </div>
    </main>
  );
}