"use client";

import Link from "next/link";
import { Users } from "lucide-react";

interface FrequentCustomersProps {
  customers?: {
    initial: string;
    name: string;
    purchases: number;
    spent: string;
  }[];
}

export default function FrequentCustomers({ customers = [] }: FrequentCustomersProps) {
  return (
    <section className="border border-[#E2E2E2] bg-white p-4 sm:p-6 lg:p-7">
      <div className="mb-5 sm:mb-7 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
            Clientes
          </p>

          <h2 className="mt-1 text-lg sm:text-xl font-bold text-black">
            Clientes frecuentes
          </h2>
        </div>

        <Link href="/clientes/frecuentes" className="text-xs sm:text-sm font-semibold text-[#D8A814] hover:underline">
          Ver todos
        </Link>
      </div>

      <div>
        {customers.length > 0 ? (
          customers.map((customer) => (
            <div
              key={customer.name}
              className="flex items-center justify-between border-b border-[#EEEEEE] py-3 sm:py-4 last:border-none gap-3"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center border border-black bg-[#050505] font-bold text-white text-xs sm:text-sm shrink-0">
                  {customer.initial}
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-black text-sm truncate">
                    {customer.name}
                  </p>

                  <p className="text-[11px] sm:text-xs text-[#888888] truncate">
                    {customer.purchases} compras registradas
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="font-bold text-black text-sm">
                  {customer.spent}
                </p>

                <p className="text-xs text-[#888888]">
                  acumulado
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center text-sm text-[#888888] flex flex-col items-center">
            <Users size={28} className="text-[#CCC] mb-2" />
            <p>Aún no hay compras recurrentes de clientes registradas.</p>
          </div>
        )}
      </div>
    </section>
  );
}