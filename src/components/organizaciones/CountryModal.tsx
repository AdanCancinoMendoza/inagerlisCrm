"use client";

import { useState, useMemo } from "react";
import { Search, X, Check, Globe } from "lucide-react";

export type Country = {
  name: string;
  code: string;
  flag: string;
  region: "latam" | "north_america" | "europe" | "other";
  phoneCode: string;
};

export const COUNTRIES_LIST: Country[] = [
  // LATAM
  { name: "México", code: "MX", flag: "🇲🇽", region: "latam", phoneCode: "+52" },
  { name: "Colombia", code: "CO", flag: "🇨🇴", region: "latam", phoneCode: "+57" },
  { name: "Argentina", code: "AR", flag: "🇦🇷", region: "latam", phoneCode: "+54" },
  { name: "Chile", code: "CL", flag: "🇨🇱", region: "latam", phoneCode: "+56" },
  { name: "Perú", code: "PE", flag: "🇵🇪", region: "latam", phoneCode: "+51" },
  { name: "Guatemala", code: "GT", flag: "🇬🇹", region: "latam", phoneCode: "+502" },
  { name: "Ecuador", code: "EC", flag: "🇪🇨", region: "latam", phoneCode: "+593" },
  { name: "Costa Rica", code: "CR", flag: "🇨🇷", region: "latam", phoneCode: "+506" },
  { name: "Panamá", code: "PA", flag: "🇵🇦", region: "latam", phoneCode: "+507" },
  { name: "República Dominicana", code: "DO", flag: "🇩🇴", region: "latam", phoneCode: "+1" },
  { name: "El Salvador", code: "SV", flag: "🇸🇻", region: "latam", phoneCode: "+503" },
  { name: "Honduras", code: "HN", flag: "🇭🇳", region: "latam", phoneCode: "+504" },
  { name: "Bolivia", code: "BO", flag: "🇧🇴", region: "latam", phoneCode: "+591" },
  { name: "Paraguay", code: "PY", flag: "🇵🇾", region: "latam", phoneCode: "+595" },
  { name: "Uruguay", code: "UY", flag: "🇺🇾", region: "latam", phoneCode: "+598" },
  { name: "Nicaragua", code: "NI", flag: "🇳🇮", region: "latam", phoneCode: "+505" },
  { name: "Puerto Rico", code: "PR", flag: "🇵🇷", region: "latam", phoneCode: "+1" },
  { name: "Brasil", code: "BR", flag: "🇧🇷", region: "latam", phoneCode: "+55" },

  // NORTEAMÉRICA
  { name: "Estados Unidos", code: "US", flag: "🇺🇸", region: "north_america", phoneCode: "+1" },
  { name: "Canadá", code: "CA", flag: "🇨🇦", region: "north_america", phoneCode: "+1" },

  // EUROPA
  { name: "España", code: "ES", flag: "🇪🇸", region: "europe", phoneCode: "+34" },
  { name: "Alemania", code: "DE", flag: "🇩🇪", region: "europe", phoneCode: "+49" },
  { name: "Francia", code: "FR", flag: "🇫🇷", region: "europe", phoneCode: "+33" },
  { name: "Italia", code: "IT", flag: "🇮🇹", region: "europe", phoneCode: "+39" },
  { name: "Reino Unido", code: "GB", flag: "🇬🇧", region: "europe", phoneCode: "+44" },
  { name: "Portugal", code: "PT", flag: "🇵🇹", region: "europe", phoneCode: "+351" },
];

export function getCountryByName(name: string): Country {
  const found = COUNTRIES_LIST.find(
    (c) => c.name.toLowerCase() === name.trim().toLowerCase()
  );
  return found || COUNTRIES_LIST[0]; // Retorna México por defecto
}

export default function CountryModal({
  isOpen,
  onClose,
  selectedCountry,
  onSelectCountry,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedCountry: string;
  onSelectCountry: (country: Country) => void;
  giroComercial?: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "latam" | "north_america" | "europe">("all");

  const filteredCountries = useMemo(() => {
    return COUNTRIES_LIST.filter((country) => {
      const matchesSearch =
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.phoneCode.includes(searchTerm);

      if (activeTab === "all") return matchesSearch;
      return matchesSearch && country.region === activeTab;
    });
  }, [searchTerm, activeTab]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[85vh] w-full max-w-2xl flex-col border border-[#DDDDDD] bg-white shadow-2xl cursor-default"
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-[#EEEEEE] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-[#D8A814] text-white">
              <Globe size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-black">Selecciona tu País</h3>
              <p className="text-xs text-[#777777]">Elige el país sede de tu organización</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center border border-transparent text-[#777777] transition-colors hover:border-[#DDDDDD] hover:bg-[#FAFAFA] hover:text-black cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Buscador y Filtros */}
        <div className="border-b border-[#EEEEEE] bg-[#FAFAFA] p-5 space-y-3">
          <div className="relative flex items-center">
            <Search size={18} className="absolute left-3.5 text-[#999999]" />
            <input
              type="text"
              autoFocus
              placeholder="Buscar país por nombre o código (ej. México, España, +52)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 w-full border border-[#DDDDDD] bg-white pl-10 pr-4 text-sm text-black outline-none focus:border-[#D8A814] transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 text-xs font-semibold text-[#888888] hover:text-black cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Filtros de Región */}
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { id: "all", label: "Todos los países" },
              { id: "latam", label: "América Latina" },
              { id: "north_america", label: "Norteamérica" },
              { id: "europe", label: "Europa" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-black text-white"
                    : "border border-[#DDDDDD] bg-white text-[#666666] hover:border-black hover:text-black"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Países */}
        <div className="flex-1 overflow-y-auto p-5">
          {filteredCountries.length > 0 ? (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
              {filteredCountries.map((country) => {
                const isSelected =
                  country.name.toLowerCase() === selectedCountry.trim().toLowerCase();

                return (
                  <button
                    key={country.code}
                    onClick={() => {
                      onSelectCountry(country);
                      onClose();
                    }}
                    className={`flex items-center justify-between border p-3 text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#D8A814] bg-[#D8A814]/10 shadow-sm ring-1 ring-[#D8A814]"
                        : "border-[#EEEEEE] bg-white hover:border-[#D8A814] hover:bg-[#FAFAFA]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center bg-[#F3F3F3] border border-[#E0E0E0] text-base">
                        {country.flag}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-black leading-tight">
                          {country.name}
                        </p>
                        <p className="text-[11px] font-semibold text-[#888888]">
                          {country.phoneCode}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="flex h-6 w-6 items-center justify-center bg-[#D8A814] text-white">
                        <Check size={14} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-base font-bold text-black">No se encontraron países</p>
              <p className="mt-1 text-xs text-[#777777]">
                Verifica el nombre o código telefónico ingresado.
              </p>
            </div>
          )}
        </div>

        {/* Pie del modal */}
        <div className="flex items-center justify-between border-t border-[#EEEEEE] bg-[#FAFAFA] px-6 py-4">
          <p className="text-xs text-[#777777]">
            {filteredCountries.length} países disponibles
          </p>

          <button
            onClick={onClose}
            className="h-10 bg-black px-6 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#D8A814] hover:text-black transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
