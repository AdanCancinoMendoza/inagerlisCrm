"use client";

export interface Customer {
  id: string | number;
  initial?: string;
  name: string;
  phone?: string;
  rfc?: string;
  location?: string;
  pending?: number;
  puntos?: number;
  saldo?: number;
}

interface CustomerTableProps {
  customers: Customer[];
  onSelectCustomer?: (customer: Customer) => void;
}

export default function CustomerTable({
  customers,
  onSelectCustomer,
}: CustomerTableProps) {
  if (customers.length === 0) {
    return (
      <div className="flex min-h-[220px] items-center justify-center border border-[#E5E5E5] bg-white p-8 text-[#888888]">
        No se encontraron clientes registrados.
      </div>
    );
  }

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

      {customers.map((customer) => {
        const initial = customer.initial || customer.name.charAt(0).toUpperCase();

        return (
          <button
            key={customer.id}
            onClick={() => onSelectCustomer?.(customer)}
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
                {initial}
              </div>

              <div>
                <p className="font-semibold text-black">{customer.name}</p>
                {customer.puntos !== undefined && (
                  <p className="text-xs text-[#D8A814]">{customer.puntos} pts</p>
                )}
              </div>
            </div>

            <p className="text-sm text-[#555555]">{customer.phone || "—"}</p>

            <p className="text-sm text-[#555555]">{customer.rfc || "—"}</p>

            <p className="text-sm text-[#555555]">{customer.location || "—"}</p>

            <div className="flex justify-center">
              {(customer.pending || 0) > 0 ? (
                <span className="flex h-8 min-w-8 items-center justify-center bg-[#D8A814] px-2 text-sm font-bold text-white">
                  {customer.pending}
                </span>
              ) : (
                <span className="text-[#AAAAAA]">—</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}