"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import {
  FEATURES,
  AUDIENCE_LABELS,
  AUDIENCE_ICON,
  type FeatureAudience,
} from "@/lib/features";

type Filter = FeatureAudience | "todas";

const CHIPS: { value: Filter; label: string; icon?: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "colegio", label: AUDIENCE_LABELS.colegio, icon: AUDIENCE_ICON.colegio },
  { value: "docentes", label: AUDIENCE_LABELS.docentes, icon: AUDIENCE_ICON.docentes },
  { value: "familias", label: AUDIENCE_LABELS.familias, icon: AUDIENCE_ICON.familias },
];

export function FeaturesExplorer() {
  const [filter, setFilter] = useState<Filter>("todas");
  const shown = FEATURES.filter((f) => filter === "todas" || f.audiences.includes(filter));

  return (
    <div>
      {/* Filtros por audiencia */}
      <div className="flex flex-wrap justify-center gap-2">
        {CHIPS.map((c) => {
          const active = filter === c.value;
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => setFilter(c.value)}
              aria-pressed={active}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-700 transition-colors ${
                active
                  ? "bg-ink text-white shadow-soft"
                  : "border border-ink/12 bg-white text-ink/65 hover:border-brand/40 hover:text-ink"
              }`}
            >
              {c.icon ? <Icon name={c.icon} className="h-4 w-4" /> : null}
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Grilla de módulos */}
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((f) => (
          <div
            key={f.key}
            className="flex h-full flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-card transition-all hover:border-brand/30 hover:shadow-pop"
          >
            <div className="p-3">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-mist ring-1 ring-ink/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={f.img}
                  alt={`Pantalla de ${f.title}`}
                  className="h-full w-full object-cover object-top"
                />
              </div>
            </div>
            <div className="flex flex-1 flex-col px-6 pb-6 pt-1">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                  <Icon name={f.icon} className="h-4 w-4" />
                </span>
                <h3 className="text-lg font-700 text-ink">{f.title}</h3>
              </div>
              <p className="mt-2 flex-1 text-sm font-400 leading-relaxed text-ink/60">{f.text}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {f.audiences.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1 rounded-full bg-mist px-2.5 py-1 text-[11px] font-700 text-ink/55"
                  >
                    <Icon name={AUDIENCE_ICON[a]} className="h-3 w-3" />
                    {AUDIENCE_LABELS[a].replace("Para ", "")}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
