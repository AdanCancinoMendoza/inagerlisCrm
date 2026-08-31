const sellers = [
  {
    name: "Luis Martínez",
    sales: "$15,300",
    operations: 38,
  },
  {
    name: "Karen Castillo",
    sales: "$12,100",
    operations: 31,
  },
  {
    name: "José Ramírez",
    sales: "$9,800",
    operations: 25,
  },
];

export default function TopSellers() {
  return (
    <section className="border border-[#E2E2E2] bg-white p-7">
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
          Rendimiento
        </p>

        <h2 className="mt-1 text-xl font-bold text-black">
          Mejores vendedores
        </h2>
      </div>

      {sellers.map((seller, index) => (
        <div
          key={seller.name}
          className="flex items-center border-b border-[#EEEEEE] py-4 last:border-none"
        >
          <div
            className={`
              mr-4 flex h-9 w-9
              items-center justify-center
              text-sm font-bold
              ${
                index === 0
                  ? "bg-[#D8A814] text-white"
                  : "bg-[#F1F1F1] text-black"
              }
            `}
          >
            {index + 1}
          </div>

          <div className="flex-1">
            <p className="font-semibold text-black">
              {seller.name}
            </p>

            <p className="mt-1 text-xs text-[#888888]">
              {seller.operations} ventas
            </p>
          </div>

          <p className="font-bold text-black">
            {seller.sales}
          </p>
        </div>
      ))}
    </section>
  );
}