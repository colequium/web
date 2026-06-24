import { Icon } from "@/components/icons";
import { blockStudents } from "@/lib/identity";

// Mock para la demo. En producción: cada mes se genera un cargo por alumno
// (tabla `payment_charges`) y el tutor sube el comprobante (Storage) → el
// colegio lo valida (pendiente → en revisión → pagado).
const STUDENT = "Tomás Méndez · 6°B";
const CHARGES = [
  { id: "jun", month: "Junio 2026", amount: "$3,500", due: "Vence 10/06", status: "pending" },
  { id: "may", month: "Mayo 2026", amount: "$3,500", due: "Pagado el 08/05", status: "review" },
  { id: "abr", month: "Abril 2026", amount: "$3,500", due: "Pagado el 06/04", status: "paid" },
  { id: "mar", month: "Marzo 2026", amount: "$3,500", due: "Pagado el 05/03", status: "paid" },
] as const;

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pendiente", cls: "bg-cta/10 text-cta" },
  review: { label: "En revisión", cls: "bg-sky/10 text-sky" },
  paid: { label: "Pagado", cls: "bg-leaf/10 text-leaf" },
};

export default async function PagosPage() {
  await blockStudents();
  const next = CHARGES.find((c) => c.status === "pending");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5">
        <h1 className="font-display text-2xl font-700 text-ink">Pagos</h1>
        <p className="text-sm font-500 text-ink/55">
          Comprobantes de cuota mensual · {STUDENT}
        </p>
      </div>

      {/* Cuota del mes pendiente */}
      {next ? (
        <section className="mb-5 overflow-hidden rounded-[1.75rem] border border-ink/5 bg-gradient-to-br from-navy to-navy-deep p-6 text-white shadow-card">
          <p className="text-xs font-600 uppercase tracking-wide text-white/60">Cuota del mes</p>
          <div className="mt-1 flex items-end justify-between gap-3">
            <div>
              <p className="font-display text-2xl font-700">{next.month}</p>
              <p className="text-sm font-500 text-white/70">{next.due}</p>
            </div>
            <p className="font-display text-3xl font-700">{next.amount}</p>
          </div>
          <button
            type="button"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-cta py-3.5 text-sm font-700 text-white shadow-soft transition-colors hover:bg-cta-deep"
          >
            <Icon name="Upload" className="h-4 w-4" />
            Subir comprobante
          </button>
        </section>
      ) : null}

      {/* Historial */}
      <section className="overflow-hidden rounded-[1.75rem] border border-ink/5 bg-white shadow-card">
        <h2 className="border-b border-ink/5 px-5 py-3.5 font-display text-base font-700 text-ink">
          Historial
        </h2>
        <ul className="divide-y divide-ink/5">
          {CHARGES.map((c) => {
            const s = STATUS[c.status];
            return (
              <li key={c.id} className="flex items-center gap-3 px-5 py-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-mist text-ink/50">
                  <Icon name="CreditCard" className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-700 text-ink">{c.month}</p>
                  <p className="truncate text-xs font-600 text-ink/50">
                    {c.amount} · {c.due}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-700 ${s.cls}`}>
                  {s.label}
                </span>
                <button
                  type="button"
                  className="shrink-0 rounded-xl p-2 text-ink/40 transition-colors hover:bg-mist hover:text-ink"
                  aria-label={c.status === "pending" ? "Subir comprobante" : "Ver comprobante"}
                >
                  <Icon name={c.status === "pending" ? "Upload" : "ChevronRight"} className="h-5 w-5" />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="mt-4 flex items-center gap-1.5 px-1 text-xs font-600 text-ink/45">
        <Icon name="Users" className="h-3.5 w-3.5" />
        Cada mes generamos el comprobante de la cuota. Sube tu comprobante de pago y el colegio lo valida.
      </p>
    </main>
  );
}
