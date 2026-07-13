"use client";

/** Árbol de casillas para elegir el alcance de una persona.
 *  - mode="sections": una casilla por sección (para Coordinación/Dirección) → devuelve level ids.
 *  - mode="groups": cada sección (casilla que marca todos sus salones) + los salones
 *    por grado (para Docentes) → devuelve group ids. */

type Group = { id: string; name: string };
type Grade = { id: string; name: string; groups: Group[] };
type Level = { id: string; name: string; grades: Grade[] };

export function ScopePicker({
  levels,
  mode,
  value,
  onChange,
}: {
  levels: Level[];
  mode: "sections" | "groups";
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const set = new Set(value);
  const emit = (n: Set<string>) => onChange([...n]);
  const toggle = (id: string) => {
    const n = new Set(set);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    emit(n);
  };
  const levelGroupIds = (lv: Level) => lv.grades.flatMap((g) => g.groups.map((gr) => gr.id));

  if (levels.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-ink/15 bg-mist/40 px-3 py-3 text-xs font-600 text-ink/55">
        No hay estructura todavía. Creá secciones y salones en Estructura primero.
      </p>
    );
  }

  if (mode === "sections") {
    return (
      <div className="flex flex-col gap-0.5 rounded-xl border border-ink/10 bg-white p-2">
        {levels.map((lv) => (
          <label
            key={lv.id}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-mist"
          >
            <input
              type="checkbox"
              checked={set.has(lv.id)}
              onChange={() => toggle(lv.id)}
              className="h-4 w-4 accent-brand"
            />
            <span className="text-sm font-700 text-ink">{lv.name}</span>
          </label>
        ))}
      </div>
    );
  }

  // mode === "groups"
  const toggleLevel = (lv: Level) => {
    const gids = levelGroupIds(lv);
    const allSel = gids.length > 0 && gids.every((id) => set.has(id));
    const n = new Set(set);
    if (allSel) gids.forEach((id) => n.delete(id));
    else gids.forEach((id) => n.add(id));
    emit(n);
  };

  return (
    <div className="flex max-h-72 flex-col gap-2 overflow-y-auto rounded-xl border border-ink/10 bg-white p-2">
      {levels.map((lv) => {
        const gids = levelGroupIds(lv);
        const allSel = gids.length > 0 && gids.every((id) => set.has(id));
        const someSel = gids.some((id) => set.has(id));
        return (
          <div key={lv.id}>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-mist">
              <input
                type="checkbox"
                checked={allSel}
                ref={(el) => {
                  if (el) el.indeterminate = someSel && !allSel;
                }}
                onChange={() => toggleLevel(lv)}
                className="h-4 w-4 accent-brand"
              />
              <span className="text-sm font-700 text-ink">{lv.name}</span>
            </label>
            <div className="ml-6 flex flex-col gap-0.5 pb-1">
              {lv.grades.map((g) => (
                <div key={g.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-2 py-0.5">
                  {g.groups.map((gr) => (
                    <label key={gr.id} className="inline-flex cursor-pointer items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={set.has(gr.id)}
                        onChange={() => toggle(gr.id)}
                        className="h-3.5 w-3.5 accent-brand"
                      />
                      <span className="text-xs font-600 text-ink/70">{gr.name}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Roles cuyo alcance son SECCIONES (Dirección/Coordinación); el resto de staff
 *  que baja a salón usa "groups". */
export const SECTION_SCOPE_ROLES = ["coordinator", "principal", "board", "manager"];
export function scopeModeForRole(role: string): "sections" | "groups" | null {
  if (SECTION_SCOPE_ROLES.includes(role)) return "sections";
  if (role === "teacher" || role === "department_head") return "groups";
  return null; // support_staff, driver, guardian → sin árbol
}
