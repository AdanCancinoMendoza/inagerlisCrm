"use client";

import Link from "next/link";
import { Package } from "lucide-react";

interface TopProductsProps {
  products?: {
    name: string;
    sales: number;
  }[];
}

export default function TopProducts({ products = [] }: TopProductsProps) {
  return (
    <section className="border border-[#E2E2E2] bg-white p-7">
      <div className="mb-7 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
            Productos
          </p>

          <h2 className="mt-1 text-xl font-bold text-black">
            Más vendidos
          </h2>
        </div>

        <Link href="/articulos" className="text-sm font-semibold text-[#D8A814] hover:underline">
          Ver todos
        </Link>
      </div>

      <div>
        {products.length > 0 ? (
          products.map((product, index) => (
            <div
              key={`${product.name}-${index}`}
              className="
                flex items-center justify-between
                border-b border-[#EEEEEE]
                py-4
                last:border-none
              "
            >
              <div className="flex items-center gap-4">
                <span className="w-6 text-sm font-bold text-[#C0C0C0]">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <p className="font-medium text-black">
                  {product.name}
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-black">
                  {product.sales}
                </p>

                <p className="text-xs text-[#999999]">
                  unidades
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center text-sm text-[#888888] flex flex-col items-center">
            <Package size={28} className="text-[#CCC] mb-2" />
            <p>Aún no hay ventas registradas en el sistema.</p>
          </div>
        )}
      </div>
    </section>
  );
}