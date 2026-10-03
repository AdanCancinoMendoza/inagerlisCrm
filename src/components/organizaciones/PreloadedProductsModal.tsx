"use client";

import { useState, useMemo } from "react";
import {
  X,
  Sparkles,
  Search,
  CheckCircle2,
  Barcode,
  Layers,
  Globe2,
} from "lucide-react";
import {
  DemoProduct,
  getCatalogoSemillaFrontend,
  MAPA_CATALOGOS,
} from "@/data/catalogosSemilla";

export default function PreloadedProductsModal({
  isOpen,
  onClose,
  pais = "México",
  giroNombre = "Abarrotes y Tiendas",
  giroId = "ABARROTES",
}: {
  isOpen: boolean;
  onClose: () => void;
  pais?: string;
  giroNombre?: string;
  giroId?: string;
}) {
  const [selectedPais, setSelectedPais] = useState(pais);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFamily, setSelectedFamily] = useState<string>("all");

  // Mantener actualizado el país cuando cambie la prop
  useMemo(() => {
    setSelectedPais(pais);
  }, [pais]);

  const catalogoInfo = useMemo(() => {
    return getCatalogoSemillaFrontend(selectedPais, giroId);
  }, [selectedPais, giroId]);

  const allProducts = catalogoInfo.productos;

  const families = useMemo(() => {
    return ["all", ...Array.from(new Set(allProducts.map((p) => p.familia)))];
  }, [allProducts]);

  const filtered = useMemo(() => {
    return allProducts.filter((p) => {
      const matchesSearch =
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codigo.includes(searchTerm) ||
        p.familia.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFamily = selectedFamily === "all" || p.familia === selectedFamily;
      return matchesSearch && matchesFamily;
    });
  }, [allProducts, searchTerm, selectedFamily]);

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return `${catalogoInfo.monedaSimbolo} ${price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const availableCountries = Object.keys(MAPA_CATALOGOS);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col border border-[#DDDDDD] bg-white shadow-2xl cursor-default overflow-hidden"
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-[#EEEEEE] px-6 py-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center bg-[#D8A814] text-white">
              <Sparkles size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-black">
                  Catálogo Precargado · {catalogoInfo.bandera} {catalogoInfo.pais}
                </h3>
                <span className="bg-[#D8A814]/15 text-[#B88E0E] text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                  {catalogoInfo.monedaCodigo} · Códigos de Barra Reales
                </span>
              </div>
              <p className="text-xs text-[#777777]">
                {giroNombre} · Los artículos se añadirán automáticamente a tu inventario y punto de venta
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center border border-transparent text-[#777777] transition-colors hover:border-[#DDDDDD] hover:bg-[#FAFAFA] hover:text-black cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Barra de selector de países & buscador */}
        <div className="border-b border-[#EEEEEE] bg-[#FAFAFA] p-4 space-y-3">
          {/* Selector rápido de país */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#666666] shrink-0">
              <Globe2 size={14} className="text-[#D8A814]" />
              <span>Ver por país:</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {availableCountries.map((cName) => {
                const cInfo = MAPA_CATALOGOS[cName];
                const isSelected = catalogoInfo.pais === cName;
                return (
                  <button
                    key={cName}
                    type="button"
                    onClick={() => {
                      setSelectedPais(cName);
                      setSelectedFamily("all");
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#D8A814] text-black shadow-sm"
                        : "border border-[#DDDDDD] bg-white text-[#555555] hover:border-black hover:text-black"
                    }`}
                  >
                    <span>{cInfo.bandera}</span>
                    <span>{cName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Buscador */}
          <div className="relative flex items-center">
            <Search size={18} className="absolute left-3.5 text-[#999999]" />
            <input
              type="text"
              autoFocus
              placeholder={`Buscar en catálogo de ${catalogoInfo.pais} por nombre, código de barras o familia...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full border border-[#DDDDDD] bg-white pl-10 pr-4 text-sm text-black outline-none focus:border-[#D8A814] transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 text-xs font-semibold text-[#888888] hover:text-black"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Chips de Categorías */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {families.map((fam) => (
              <button
                key={fam}
                onClick={() => setSelectedFamily(fam)}
                className={`px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                  selectedFamily === fam
                    ? "bg-black text-white"
                    : "border border-[#DDDDDD] bg-white text-[#666666] hover:border-black hover:text-black"
                }`}
              >
                {fam === "all" ? `Todas las categorías (${allProducts.length})` : fam}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Artículos */}
        <div className="flex-1 overflow-y-auto p-5">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {filtered.map((prod) => (
                <div
                  key={prod.codigo}
                  className="flex flex-col justify-between border border-[#EEEEEE] bg-white p-3.5 hover:border-[#D8A814] hover:shadow-sm transition-all group"
                >
                  <div>
                    {/* Header Card: Familia y Código de Barras */}
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888] truncate max-w-[130px]">
                        {prod.familia}
                      </span>
                      <div className="flex items-center gap-1 bg-[#FAFAFA] border border-[#EEEEEE] px-1.5 py-0.5 text-[10px] font-mono text-[#555555]">
                        <Barcode size={12} className="text-[#888888]" />
                        <span>{prod.codigo}</span>
                      </div>
                    </div>

                    <p className="text-sm font-bold text-black group-hover:text-[#D8A814] transition-colors leading-snug">
                      {prod.nombre}
                    </p>
                    {prod.descripcion && (
                      <p className="text-[11px] text-[#777777] mt-1 line-clamp-2">
                        {prod.descripcion}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#F0F0F0] flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-[#888888] uppercase tracking-wider">
                        P. Venta ({catalogoInfo.monedaCodigo})
                      </p>
                      <p className="text-base font-extrabold text-black">
                        {formatPrice(prod.precioVenta)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[9px] font-bold text-[#888888] uppercase tracking-wider">
                        Stock Inicial
                      </p>
                      <p className="text-xs font-bold text-[#D8A814]">
                        {prod.stockInicial} {prod.unidad}s
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-base font-bold text-black">No se encontraron artículos</p>
              <p className="mt-1 text-xs text-[#777777]">
                Intenta con otro término de búsqueda o cambia de categoría.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#EEEEEE] bg-[#FAFAFA] px-6 py-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#555555]">
            <CheckCircle2 size={16} className="text-green-600" />
            <span>
              {filtered.length} artículos auténticos de <span className="font-bold text-black">{catalogoInfo.pais}</span> listos para escanear en caja
            </span>
          </div>

          <button
            onClick={onClose}
            className="h-9 bg-black px-5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#D8A814] hover:text-black transition-all cursor-pointer"
          >
            Entendido, cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
