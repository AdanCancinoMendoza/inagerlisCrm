export default function Header() {
  return (
    <header className="flex h-24 items-center justify-between border-b border-[#E5E5E5] bg-white px-10">
      <div>
        <h1 className="text-2xl font-bold text-black">
          Buenos días, Adán
        </h1>

        <p className="mt-1 text-sm text-[#777777]">
          Aquí tienes el resumen de tu negocio.
        </p>
      </div>

      <div className="text-right">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#999999]">
          Domingo
        </p>

        <p className="mt-1 font-bold text-black">
          30 Agosto 2026
        </p>
      </div>
    </header>
  );
}