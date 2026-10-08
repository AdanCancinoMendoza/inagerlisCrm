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
    <section className="border border-[#E2E2E2] bg-white p-7">
      <div className="mb-7 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
            Clientes
          </p>

          <h2 className="mt-1 text-xl font-bold text-black">
            Clientes frecuentes
          </h2>
        </div>

        <Link href="/clientes/frecuentes" className="text-sm font-semibold text-[#D8A814] hover:underline">
          Ver todos
        </Link>
      </div>

      <div>
        {customers.length > 0 ? (
          customers.map((customer) => (
            <div
              key={customer.name}
              className="flex items-center justify-between border-b border-[#EEEEEE] py-4 last:border-none"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#050505] font-bold text-white">
                  {customer.initial}
                </div>

                <div>
                  <p className="font-semibold text-black">
                    {customer.name}
                  </p>

                  <p className="text-xs text-[#888888]">
                    {customer.purchases} compras registradas
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-black">
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