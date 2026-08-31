const stats = [
  {
    label: "Total clientes",
    value: "248",
  },
  {
    label: "Nuevos",
    value: "18",
  },
  {
    label: "Frecuentes",
    value: "74",
  },
  {
    label: "Pendientes",
    value: "12",
  },
];

export default function CustomerStats() {
  return (
    <div className="grid grid-cols-2 border border-[#E5E5E5] bg-white lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={`
            px-6 py-5
            ${
              index !== stats.length - 1
                ? "lg:border-r lg:border-[#E5E5E5]"
                : ""
            }
          `}
        >
          <p className="text-3xl font-bold text-black">
            {stat.value}
          </p>

          <p className="mt-1 text-sm text-[#777777]">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}