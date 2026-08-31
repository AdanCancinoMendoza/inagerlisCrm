"use client";

interface CustomerModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CustomerModal({
  open,
  onClose,
}: CustomerModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-[600px] border border-[#D8A814] bg-white">
        <div className="flex items-start justify-between border-b border-[#E5E5E5] px-8 py-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8A814]">
              Clientes
            </p>

            <h2 className="mt-1 text-2xl font-bold text-black">
              Nuevo cliente
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-2xl text-[#777777] hover:text-black"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 px-8 py-8 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-black">
              Nombre *
            </label>

            <input
              placeholder="Nombre completo"
              className="h-12 w-full border border-[#D8A814] px-4 text-black outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-black">
              Teléfono *
            </label>

            <input
              placeholder="222 000 0000"
              className="h-12 w-full border border-[#D8A814] px-4 text-black outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-black">
              RFC
            </label>

            <input
              placeholder="Opcional"
              className="h-12 w-full border border-[#D8A814] px-4 uppercase text-black outline-none focus:border-black"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-black">
              Localidad
            </label>

            <input
              placeholder="Ej. Puebla, Puebla"
              className="h-12 w-full border border-[#D8A814] px-4 text-black outline-none focus:border-black"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-[#E5E5E5] px-8 py-5">
          <button
            onClick={onClose}
            className="h-12 border border-black px-7 font-bold text-black hover:bg-black hover:text-white"
          >
            Cancelar
          </button>

          <button className="h-12 bg-[#D8A814] px-7 font-bold text-white hover:bg-black">
            Guardar cliente
          </button>
        </div>
      </div>
    </div>
  );
}