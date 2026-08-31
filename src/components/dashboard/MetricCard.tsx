interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  accent?: boolean;
}

export default function MetricCard({
  title,
  value,
  description,
  accent = false,
}: MetricCardProps) {
  return (
    <article
      className={`
        min-h-[170px]
        border
        p-6
        ${
          accent
            ? "border-[#D8A814] bg-[#D8A814] text-white"
            : "border-[#E2E2E2] bg-white text-black"
        }
      `}
    >
      <p
        className={`
          text-xs font-bold uppercase tracking-[0.16em]
          ${accent ? "text-white" : "text-[#777777]"}
        `}
      >
        {title}
      </p>

      <p className="mt-5 text-4xl font-bold">
        {value}
      </p>

      <p
        className={`
          mt-4 text-sm
          ${accent ? "text-white" : "text-[#888888]"}
        `}
      >
        {description}
      </p>
    </article>
  );
}