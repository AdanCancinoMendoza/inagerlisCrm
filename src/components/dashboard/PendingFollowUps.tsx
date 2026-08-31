const followUps = [
  {
    id: 1,
    title: "Llamar a Carlos Hernández",
    description: "Seguimiento después de su compra",
    time: "10:30 AM",
    urgent: true,
  },
  {
    id: 2,
    title: "Cotización Empresa Nova",
    description: "Confirmar propuesta enviada",
    time: "12:00 PM",
    urgent: false,
  },
  {
    id: 3,
    title: "Contactar a María López",
    description: "Cliente sin compras desde hace 30 días",
    time: "03:30 PM",
    urgent: false,
  },
  {
    id: 4,
    title: "Seguimiento pedido especial",
    description: "Confirmar disponibilidad de producto",
    time: "05:00 PM",
    urgent: false,
  },
];

export default function PendingFollowUps() {
  return (
    <section className="border border-[#E2E2E2] bg-white p-7">
      <div className="mb-7 flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8A814]">
            Pendientes
          </p>

          <h2 className="mt-1 text-xl font-bold text-black">
            Recordatorios y seguimientos
          </h2>
        </div>

        <div className="flex h-9 min-w-9 items-center justify-center bg-[#050505] px-3 text-sm font-bold text-white">
          {followUps.length}
        </div>
      </div>

      <div>
        {followUps.map((item) => (
          <div
            key={item.id}
            className="
              flex items-start gap-4
              border-b border-[#EEEEEE]
              py-4
              last:border-none
            "
          >
            <div
              className={`
                mt-2 h-2.5 w-2.5 flex-none rounded-full
                ${
                  item.urgent
                    ? "bg-[#D8A814]"
                    : "bg-[#222222]"
                }
              `}
            />

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-black">
                {item.title}
              </p>

              <p className="mt-1 text-sm text-[#888888]">
                {item.description}
              </p>
            </div>

            <p className="whitespace-nowrap text-xs font-semibold text-[#777777]">
              {item.time}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}