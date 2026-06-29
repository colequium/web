"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { Avatar } from "@/components/Avatar";
import type { AccentColor } from "@/components/colors";

export interface DirPerson {
  name: string;
  subtitle: string;
  color: string;
  groups: string[];
}
export interface DirSection {
  key: string;
  title: string;
  icon: string;
  filterable: boolean; // Docentes / Familias → filtro por curso
  people: DirPerson[];
}

/** Directorio de la comunidad: secciones por rol, desplegables, con filtro por curso. */
export function ComunidadView({ sections }: { sections: DirSection[] }) {
  // La primera sección arranca abierta; el resto, plegadas.
  const [open, setOpen] = useState<Record<string, boolean>>(
    sections.length ? { [sections[0].key]: true } : {},
  );

  return (
    <div className="flex flex-col gap-3">
      {sections.map((s) => (
        <Section
          key={s.key}
          section={s}
          open={!!open[s.key]}
          onToggle={() => setOpen((o) => ({ ...o, [s.key]: !o[s.key] }))}
        />
      ))}
    </div>
  );
}

function Section({
  section,
  open,
  onToggle,
}: {
  section: DirSection;
  open: boolean;
  onToggle: () => void;
}) {
  const [course, setCourse] = useState<string>("todos");

  // Cursos disponibles para filtrar (solo en Docentes/Familias).
  const courses = section.filterable
    ? [...new Set(section.people.flatMap((p) => p.groups))].sort((a, b) =>
        a.localeCompare(b, "es"),
      )
    : [];

  const shown =
    section.filterable && course !== "todos"
      ? section.people.filter((p) => p.groups.includes(course))
      : section.people;

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-ink/8 bg-white shadow-card">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-mist/50"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand">
          <Icon name={section.icon} className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-base font-700 text-ink">{section.title}</span>
          <span className="block text-xs font-600 text-ink/45">
            {section.people.length} {section.people.length === 1 ? "persona" : "personas"}
          </span>
        </span>
        <Icon
          name="ChevronDown"
          className={`h-5 w-5 shrink-0 text-ink/40 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="border-t border-ink/5 px-4 pb-4 pt-3">
          {courses.length > 1 ? (
            <div className="mb-3 flex flex-wrap gap-1.5">
              <CourseChip label="Todos" active={course === "todos"} onClick={() => setCourse("todos")} />
              {courses.map((c) => (
                <CourseChip
                  key={c}
                  label={c}
                  active={course === c}
                  onClick={() => setCourse(c)}
                />
              ))}
            </div>
          ) : null}

          {shown.length === 0 ? (
            <p className="py-4 text-center text-sm font-500 text-ink/45">
              Nadie en este curso.
            </p>
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((p, i) => (
                <div
                  key={`${p.name}-${i}`}
                  className="flex items-center gap-3 rounded-[1.25rem] border border-ink/5 bg-cloud/40 p-2.5"
                >
                  <Avatar name={p.name} color={p.color as AccentColor} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-700 text-ink">{p.name}</p>
                    <p className="truncate text-xs font-600 text-ink/50">{p.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

function CourseChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-700 ring-1 transition-colors ${
        active ? "bg-ink text-white ring-ink" : "bg-white text-ink/55 ring-ink/10 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
