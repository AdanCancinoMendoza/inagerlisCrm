"use client";

import { useState, useMemo } from "react";
import { X, Search, Barcode, Scale, Tag, Package, Globe } from "lucide-react";
import { getCatalogoSemillaFrontend } from "@/data/catalogosSemilla";

interface PreloadedProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pais?: string;
  giroNombre?: string;
  giroId?: string;
}

export default function PreloadedProductsModal({
  isOpen,
  onClose,
  pais = "México",
  giroNombre = "Abarrotes y Tiendas",
  giroId = "ABARROTES",
}: PreloadedProductsModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFamily, setSelectedFamily] = useState<string>("all");

  const catalogoInfo = useMemo(() => {
    return getCatalogoSemillaFrontend(pais, giroId);
  }, [pais, giroId]);

  const allProducts = catalogoInfo.productos;

  // Familias únicas
  const families = useMemo(() => {
    return ["all", ...Array.from(new Set(allProducts.map((p) => p.familia)))];
  }, [allProducts]);

  // Filtrado de productos por término de búsqueda y familia principal
  const filtered = useMemo(() => {
    return allProducts.filter((p) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        p.nombre.toLowerCase().includes(term) ||
        p.codigo.toLowerCase().includes(term) ||
        p.familia.toLowerCase().includes(term) ||
        (p.subfamilia && p.subfamilia.toLowerCase().includes(term));

      const matchesFamily = selectedFamily === "all" || p.familia === selectedFamily;

      return matchesSearch && matchesFamily;
    });
  }, [allProducts, searchTerm, selectedFamily]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px] animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[88vh] w-full max-w-4xl flex-col border border-[#E0E0E0] bg-white shadow-xl cursor-default overflow-hidden"
      >
        {/* Encabezado sobrio y humano */}
        <div className="flex items-center justify-between border-b border-[#EEEEEE] px-6 py-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-[#F3F3F3] border border-[#E0E0E0] text-lg">
              {catalogoInfo.bandera || <Globe size={16} className="text-[#555555]" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A1A1A]">
                Catálogo de artículos sugeridos · {catalogoInfo.bandera} {catalogoInfo.pais}
              </h3>
              <p className="text-xs text-[#777777]">
                {giroNombre} · Base de artículos con códigos reales listos para dar de alta
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center text-[#888888] hover:text-black hover:bg-[#F5F5F5] transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Barra de Búsqueda y Filtro de Categorías */}
        <div className="border-b border-[#EEEEEE] bg-[#FAFAFA] p-4 space-y-3">
          {/* Campo de búsqueda */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999]" />
            <input
              type="text"
              autoFocus
              placeholder={`Buscar producto por nombre, código de barras o categoría...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full border border-[#DCDCDC] bg-white pl-10 pr-10 text-xs text-black outline-none transition-colors focus:border-black placeholder:text-[#999999]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center text-[#888888] hover:text-black cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filtro de Categorías / Familias */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {families.map((fam) => {
              const count =
                fam === "all"
                  ? allProducts.length
                  : allProducts.filter((p) => p.familia === fam).length;
              const isSelected = selectedFamily === fam;

              return (
                <button
                  key={fam}
                  type="button"
                  onClick={() => setSelectedFamily(fam)}
                  className={`px-3 py-1 text-xs font-medium transition-colors cursor-pointer rounded-none ${
                    isSelected
                      ? "bg-[#1A1A1A] text-white"
                      : "bg-white border border-[#E0E0E0] text-[#555555] hover:border-[#999999] hover:text-black"
                  }`}
                >
                  {fam === "all" ? "Todas las categorías" : fam}{" "}
                  <span className={`text-[10px] ml-1 ${isSelected ? "text-[#CCCCCC]" : "text-[#888888]"}`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabla / Lista limpia de Artículos */}
        <div className="flex-1 overflow-y-auto max-h-[50vh] p-4">
          {filtered.length > 0 ? (
            <div className="divide-y divide-[#EEEEEE] border border-[#EEEEEE] bg-white">
              {filtered.map((prod) => {
                const isPLU = prod.tipoCodigo === "PLU";
                const isEAN = prod.tipoCodigo === "EAN";

                return (
                  <div
                    key={prod.codigo}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 hover:bg-[#FAFAFA] transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[11px] font-semibold text-[#666666]">
                          {prod.familia}
                        </span>
                        {prod.subfamilia && (
                          <>
                            <span className="text-[#CCCCCC] text-[10px]">/</span>
                            <span className="text-[11px] text-[#888888]">
                              {prod.subfamilia}
                            </span>
                          </>
                        )}
                        <span className="text-[#CCCCCC] text-[10px]">·</span>
                        <span className="text-[11px] text-[#777777]">
                          Unidad: <strong className="font-medium text-[#444444]">{prod.unidad || "Pieza"}</strong>
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-[#1A1A1A]">
                        {prod.nombre}
                      </p>

                      {prod.descripcion && (
                        <p className="text-xs text-[#777777] mt-0.5">
                          {prod.descripcion}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                      {isEAN && (
                        <div
                          title="Código de barras EAN-13"
                          className="flex items-center gap-1.5 bg-[#F7F7F7] border border-[#E5E5E5] px-2.5 py-1 text-xs font-mono text-[#333333]"
                        >
                          <Barcode size={13} className="text-[#777777]" />
                          <span>{prod.codigo}</span>
                        </div>
                      )}

                      {isPLU && (
                        <div
                          title="Código PLU oficial para báscula / granel"
                          className="flex items-center gap-1.5 bg-[#F7F7F7] border border-[#E5E5E5] px-2.5 py-1 text-xs font-mono text-[#333333]"
                        >
                          <Scale size={13} className="text-[#777777]" />
                          <span>PLU {prod.codigo}</span>
                        </div>
                      )}

                      {!isEAN && !isPLU && (
                        <div
                          title="Código interno de producto a granel / pieza"
                          className="flex items-center gap-1.5 bg-[#F7F7F7] border border-[#E5E5E5] px-2.5 py-1 text-xs font-mono text-[#333333]"
                        >
                          <Tag size={13} className="text-[#777777]" />
                          <span>{prod.codigo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <Package size={28} className="text-[#CCCCCC] mb-2" />
              <p className="text-sm font-semibold text-[#444444]">
                No se encontraron artículos
              </p>
              <p className="mt-1 text-xs text-[#888888]">
                Prueba con otro término de búsqueda o selecciona otra categoría.
              </p>
            </div>
          )}
        </div>

        {/* Pie del modal */}
        <div className="flex items-center justify-between border-t border-[#EEEEEE] bg-[#FAFAFA] px-6 py-3.5">
          <p className="text-xs text-[#666666]">
            Mostrando <strong className="text-black">{filtered.length}</strong> de {allProducts.length} artículos disponibles
          </p>

          <button
            type="button"
            onClick={onClose}
            className="h-9 bg-[#1A1A1A] px-5 text-xs font-semibold text-white hover:bg-black transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
