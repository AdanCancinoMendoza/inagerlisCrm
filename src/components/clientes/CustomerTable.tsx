const customers = [
  {
    id: 1,
    initial: "A",
    name: "Ana López",
    phone: "222 145 8976",
    rfc: "LOPA920812A21",
    location: "Puebla",
    pending: 2,
  },
  {
    id: 2,
    initial: "C",
    name: "Carlos Martínez",
    phone: "221 356 7821",
    rfc: "",
    location: "Tehuacán",
    pending: 1,
  },
  {
    id: 3,
    initial: "M",
    name: "María Rodríguez",
    phone: "249 127 4432",
    rfc: "",
    location: "Tecamachalco",
    pending: 0,
  },
  {
    id: 4,
    initial: "J",
    name: "José Hernández",
    phone: "222 491 1200",
    rfc: "HEMJ8702118F4",
    location: "Puebla",
    pending: 3,
  },
];

export default function CustomerTable() {
  return (
    <div className="overflow-hidden border border-[#E5E5E5] bg-white">
      <div className="grid grid-cols-[2fr_1.2fr_1.3fr_1.2fr_.6fr] border-b border-[#E5E5E5] bg-[#FAFAFA] px-6 py-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
          Cliente
        </p>

        <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
          Teléfono
        </p>

        <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
          RFC
        </p>

        <p className="text-xs font-bold uppercase tracking-wider text-[#777777]">
          Localidad
        </p>

        <p className="text-center text-xs font-bold uppercase tracking-wider text-[#777777]">
          Pend.
        </p>
      </div>

      {customers.map((customer) => (
        <button
          key={customer.id}
          className="
            grid w-full
            grid-cols-[2fr_1.2fr_1.3fr_1.2fr_.6fr]
            items-center
            border-b border-[#EEEEEE]
            px-6 py-4
            text-left
            last:border-none
            hover:bg-[#FAFAFA]
          "
        >
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#050505] font-bold text-white">
              {customer.initial}
            </div>

            <p className="font-semibold text-black">
              {customer.name}
            </p>
          </div>

          <p className="text-sm text-[#555555]">
            {customer.phone}
          </p>

          <p className="text-sm text-[#555555]">
            {customer.rfc || "—"}
          </p>

          <p className="text-sm text-[#555555]">
            {customer.location}
          </p>

          <div className="flex justify-center">
            {customer.pending > 0 ? (
              <span className="flex h-8 min-w-8 items-center justify-center bg-[#D8A814] px-2 text-sm font-bold text-white">
                {customer.pending}
              </span>
            ) : (
              <span className="text-[#AAAAAA]">
                —
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}