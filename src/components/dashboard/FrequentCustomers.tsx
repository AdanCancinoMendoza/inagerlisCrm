const customers = [
  {
    initial: "A",
    name: "Ana Martínez",
    purchases: 24,
    spent: "$12,450",
  },
  {
    initial: "C",
    name: "Carlos Ramírez",
    purchases: 19,
    spent: "$10,280",
  },
  {
    initial: "P",
    name: "Pedro Gómez",
    purchases: 16,
    spent: "$8,750",
  },
];

export default function FrequentCustomers() {
  return (
    <section className="border border-[#E2E2E2] bg-white p-7">
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
          Clientes
        </p>

        <h2 className="mt-1 text-xl font-bold text-black">
          Clientes frecuentes
        </h2>
      </div>

      <div>
        {customers.map((customer) => (
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

                <p className="mt-1 text-xs text-[#888888]">
                  {customer.purchases} compras
                </p>
              </div>
            </div>

            <p className="font-bold text-[#D8A814]">
              {customer.spent}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}