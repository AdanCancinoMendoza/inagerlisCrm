"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function ImportarArticulosPage() {
  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Sidebar />

      <div className="ml-[250px]">
        <Header />

        <div className="p-10">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
              Artículos
            </p>

            <h1 className="mt-2 text-3xl font-bold text-black">
              Importar artículos
            </h1>

            <p className="mt-2 text-sm text-[#777777]">
              Agrega varios artículos al catálogo utilizando un archivo.
            </p>
          </div>

          <div className="mb-8 grid grid-cols-4 border border-[#E2E2E2] bg-white">
            {["Archivo", "Columnas", "Validación", "Importar"].map(
              (step, index) => (
                <div
                  key={step}
                  className={`border-r border-[#EEEEEE] p-5 last:border-r-0 ${
                    index === 0 ? "border-b-2 border-b-[#D8A814]" : ""
                  }`}
                >
                  <p className="text-xs text-[#999999]">
                    PASO {index + 1}
                  </p>

                  <p
                    className={`mt-1 font-bold ${
                      index === 0 ? "text-[#D8A814]" : "text-black"
                    }`}
                  >
                    {step}
                  </p>
                </div>
              )
            )}
          </div>

          <section className="border border-[#E2E2E2] bg-white p-10">
            <div className="border-2 border-dashed border-[#D8A814] px-10 py-20 text-center">
              <p className="text-xl font-bold text-black">
                Selecciona un archivo
              </p>

              <p className="mt-2 text-sm text-[#777777]">
                Formatos admitidos: XLSX y CSV
              </p>

              <button className="mt-7 h-12 bg-[#D8A814] px-7 font-bold text-white hover:bg-black">
                Seleccionar archivo
              </button>
            </div>

            <div className="mt-8 border-t border-[#EEEEEE] pt-7">
              <h2 className="font-bold text-black">
                Columnas disponibles
              </h2>

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  "Código",
                  "Nombre",
                  "Familia",
                  "Subfamilia",
                  "Precio compra",
                  "Precio venta",
                  "Unidad",
                  "Código de barras",
                ].map((item) => (
                  <span
                    key={item}
                    className="border border-[#E2E2E2] px-3 py-2 text-xs font-semibold text-[#555555]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}