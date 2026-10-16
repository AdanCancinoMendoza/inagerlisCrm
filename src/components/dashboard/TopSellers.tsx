"use client";

import { Award } from "lucide-react";

interface TopSellersProps {
  sellers?: {
    name: string;
    sales: string;
    operations: number;
  }[];
}

export default function TopSellers({ sellers = [] }: TopSellersProps) {
  return (
    <section className="border border-[#E2E2E2] bg-white p-4 sm:p-6 lg:p-7">
      <div className="mb-5 sm:mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
          Rendimiento
        </p>

        <h2 className="mt-1 text-lg sm:text-xl font-bold text-black">
          Mejores vendedores
        </h2>
      </div>

      {sellers.length > 0 ? (
        sellers.map((seller, index) => (
          <div
            key={seller.name}
            className="flex items-center justify-between border-b border-[#EEEEEE] py-3 sm:py-4 last:border-none gap-3"
          >
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div
                className={`
                  flex h-8 w-8 sm:h-9 sm:w-9
                  items-center justify-center
                  text-xs sm:text-sm font-bold shrink-0
                  ${
                    index === 0
                      ? "bg-[#D8A814] text-white"
                      : "bg-[#F1F1F1] text-black"
                  }
                `}
              >
                {index + 1}
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-black text-sm truncate">
                  {seller.name}
                </p>

                <p className="text-[11px] sm:text-xs text-[#888888] truncate">
                  {seller.operations} operaciones realizadas
                </p>
              </div>
            </div>

            <p className="font-bold text-black text-sm shrink-0">
              {seller.sales}
            </p>
          </div>
        ))
      ) : (
        <div className="py-10 text-center text-sm text-[#888888] flex flex-col items-center">
          <Award size={28} className="text-[#CCC] mb-2" />
          <p>Sin ventas asignadas a colaboradores aún.</p>
        </div>
      )}
    </section>
  );
}