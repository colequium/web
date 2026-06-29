"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { Avatar } from "@/components/Avatar";
import { useLocale } from "@/components/locale-context";
import type { SalidaStudent } from "@/lib/pickups";

/** Normaliza para buscar sin acentos ni mayúsculas (María ≈ maria). */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * Salidas. Por defecto solo muestra los alumnos con un cambio para hoy
 * (inasistencia o autorización temporal). El buscador permite encontrar a
 * cualquier alumno y ver quién puede retirarlo (de siempre + solo hoy).
 */
export function SalidasView({ students }: { students: SalidaStudent[] }) {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const q = norm(query.trim());

  const changed = useMemo(
    () =>
      students.filter(
        (s) => s.absentToday || s.pickups.some((p) => p.kind === "temporary"),
      ),
    [students],
  );

  const results = useMemo(
    () => (q ? students.filter((s) => norm(s.name).includes(q)) : null),
    [students, q],
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="relative">
        <Icon
          name="Search"
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("exits.search")}
          className="w-full rounded-2xl border border-ink/10 bg-white py-3 pl-10 pr-4 text-sm font-600 text-ink outline-none placeholder:font-500 placeholder:text-ink/40 focus:ring-2 focus:ring-brand/30"
        />
      </div>

      {results !== null ? (
        results.length === 0 ? (
          <EmptyState icon="Search" title={t("exits.notFoundTitle")} text={t("exits.notFoundText")} />
        ) : (
          <Section title={`${t("exits.results")} (${results.length})`}>
            <div className="grid gap-3 sm:grid-cols-2">
              {results.map((s) => (
                <StudentCard key={s.name} s={s} />
              ))}
            </div>
          </Section>
        )
      ) : changed.length === 0 ? (
        <EmptyState icon="CircleCheck" title={t("exits.noChangesTitle")} text={t("exits.noChangesText")} />
      ) : (
        <Section title={`${t("exits.changesToday")} (${changed.length})`}>
          <div className="grid gap-3 sm:grid-cols-2">
            {changed.map((s) => (
              <StudentCard key={s.name} s={s} highlightTemporary />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-base font-700 text-ink">{title}</h2>
      {children}
    </section>
  );
}

function EmptyState({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-ink/15 bg-white px-6 py-14 text-center">
      <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-mist text-ink/40">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <p className="font-display text-base font-700 text-ink">{title}</p>
      <p className="mt-1 text-sm font-500 text-ink/55">{text}</p>
    </div>
  );
}

function StudentCard({
  s,
  highlightTemporary = false,
}: {
  s: SalidaStudent;
  highlightTemporary?: boolean;
}) {
  const { t } = useLocale();
  // En "cambios de hoy" mostramos primero la autorización temporal.
  const pickups = highlightTemporary
    ? [...s.pickups].sort((a, b) => (a.kind === "temporary" ? -1 : 0) - (b.kind === "temporary" ? -1 : 0))
    : s.pickups;

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-ink/5 bg-white shadow-card">
      {s.absentToday ? (
        <div className="flex items-center gap-1.5 bg-rose/10 px-4 py-2 text-xs font-700 text-rose">
          <Icon name="CalendarX" className="h-4 w-4" />
          {t("exits.absent")}
        </div>
      ) : null}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <Avatar name={s.name} color="sky" />
          <div className="min-w-0">
            <p className="truncate text-sm font-700 text-ink">{s.name}</p>
            <p className="truncate text-xs font-600 text-ink/50">{s.group}</p>
          </div>
        </div>

        <p className="mb-2 mt-4 text-[11px] font-700 uppercase tracking-wide text-ink/40">
          {t("exits.canPickup")}
        </p>
        {pickups.length === 0 ? (
          <p className="text-xs font-600 text-ink/40">{t("exits.noAuthorized")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {pickups.map((p, i) => (
              <li key={i} className="flex items-center gap-2.5">
                <Avatar name={p.name} color={p.kind === "temporary" ? "requests" : "sky"} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-700 text-ink">{p.name}</span>
                  <span className="block text-xs font-600 text-ink/50">{p.relationship}</span>
                </span>
                {p.kind === "temporary" ? (
                  <span className="shrink-0 rounded-full bg-cta/10 px-2.5 py-1 text-[11px] font-700 text-cta">
                    {t("exits.onlyToday")}
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-leaf/15 px-2.5 py-1 text-[11px] font-700 text-leaf">
                    {t("exits.always")}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
