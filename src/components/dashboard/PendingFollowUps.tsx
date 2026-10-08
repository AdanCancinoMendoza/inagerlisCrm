export interface FollowUpItem {
  id: number | string;
  title: string;
  description: string;
  time?: string;
  urgent?: boolean;
}

interface PendingFollowUpsProps {
  followUps?: FollowUpItem[];
}

export default function PendingFollowUps({ followUps = [] }: PendingFollowUpsProps) {
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

      {followUps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FAFAFA] text-[#999999]">
            ✓
          </div>
          <p className="mt-3 text-sm font-semibold text-black">
            Sin seguimientos pendientes
          </p>
          <p className="mt-1 text-xs text-[#888888]">
            Todas las tareas y recordatorios de clientes están al día.
          </p>
        </div>
      ) : (
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

              {item.time && (
                <p className="whitespace-nowrap text-xs font-semibold text-[#777777]">
                  {item.time}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}