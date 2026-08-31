const products = [
  {
    name: "Coca-Cola 600ml",
    sales: 42,
  },
  {
    name: "Sabritas Original",
    sales: 36,
  },
  {
    name: "Agua Ciel 1L",
    sales: 29,
  },
  {
    name: "Galletas Emperador",
    sales: 21,
  },
];

export default function TopProducts() {
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

        <button className="text-sm font-semibold text-[#D8A814]">
          Ver todos
        </button>
      </div>

      <div>
        {products.map((product, index) => (
          <div
            key={product.name}
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
                ventas
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}