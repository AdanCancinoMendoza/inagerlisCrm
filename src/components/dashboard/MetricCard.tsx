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
        border
        p-4 sm:p-6
        ${
          accent
            ? "border-[#D8A814] bg-[#D8A814] text-white"
            : "border-[#E2E2E2] bg-white text-black"
        }
      `}
    >
      <p
        className={`
          text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] truncate
          ${accent ? "text-white" : "text-[#777777]"}
        `}
      >
        {title}
      </p>

      <p className="mt-3 sm:mt-5 text-2xl sm:text-3xl lg:text-4xl font-bold font-mono tracking-tight break-all">
        {value}
      </p>

      <p
        className={`
          mt-2 sm:mt-4 text-xs sm:text-sm
          ${accent ? "text-white" : "text-[#888888]"}
        `}
      >
        {description}
      </p>
    </article>
  );
}