"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { ScopePicker, scopeModeForRole } from "./ScopePicker";
import { updateMember } from "@/app/(app)/settings/people/actions";
import type { StructureLevel } from "@/lib/structure";

export interface Member {
  membership_id: string;
  name: string | null;
  email: string | null;
  role_key: string | null;
  title: string | null;
  level_ids: string[];
  group_ids: string[];
}

export function MembersList({
  members,
  levels,
  roleLabels,
}: {
  members: Member[];
  levels: StructureLevel[];
  roleLabels: Record<string, string>;
}) {
  const levelName = new Map(levels.map((l) => [l.id, l.name]));
  const groupName = new Map(
    levels.flatMap((l) =>
      l.grades.flatMap((g) => g.groups.map((gr) => [gr.id, `${l.name} - ${gr.name}`] as [string, string])),
    ),
  );

  return (
    <section>
      <h2 className="mb-3 font-display text-base font-700 text-ink">
        Miembros
        <span className="ml-2 rounded-full bg-mist px-2 py-0.5 text-xs font-700 text-ink/50">
          {members.length}
        </span>
      </h2>
      {members.length === 0 ? (
        <p className="rounded-[1.25rem] border border-dashed border-ink/15 bg-white px-5 py-8 text-center text-sm font-500 text-ink/50">
          Todavía no hay miembros activos.
        </p>
      ) : (
        <div className="overflow-hidden rounded-[1.25rem] border border-ink/5 bg-white shadow-card">
          {members.map((m, i) => (
            <MemberRow
              key={m.membership_id}
              m={m}
              levels={levels}
              roleLabels={roleLabels}
              levelName={levelName}
              groupName={groupName}
              first={i === 0}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function MemberRow({
  m,
  levels,
  roleLabels,
  levelName,
  groupName,
  first,
}: {
  m: Member;
  levels: StructureLevel[];
  roleLabels: Record<string, string>;
  levelName: Map<string, string>;
  groupName: Map<string, string>;
  first: boolean;
}) {
  const mode = scopeModeForRole(m.role_key ?? "");
  const [editing, setEditing] = useState(false);
  const [scope, setScope] = useState<string[]>(
    mode === "sections" ? m.level_ids ?? [] : mode === "groups" ? m.group_ids ?? [] : [],
  );
  const [title, setTitle] = useState(m.title ?? "");

  const roleLabel = roleLabels[m.role_key ?? ""] ?? m.role_key ?? "";
  const summary = (
    mode === "sections"
      ? (m.level_ids ?? []).map((id) => levelName.get(id))
      : (m.group_ids ?? []).map((id) => groupName.get(id))
  )
    .filter(Boolean)
    .join(" · ");

  const scopeType = mode === "sections" ? "level" : "group";
  const scopesJson = JSON.stringify(scope.map((id) => ({ type: scopeType, id })));

  return (
    <div className={`px-4 py-3 ${first ? "" : "border-t border-ink/5"}`}>
      <div className="flex items-center gap-3">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-700 text-ink">{m.name || m.email}</span>
          <span className="block truncate text-xs font-600 text-ink/50">
            {m.title || roleLabel}
            {summary ? ` · ${summary}` : ""}
          </span>
        </span>
        <button
          type="button"
          onClick={() => setEditing((e) => !e)}
          className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-700 text-ink/55 transition-colors hover:bg-mist hover:text-ink"
        >
          <Icon name="Pencil" className="h-3.5 w-3.5" />
          Editar
        </button>
      </div>

      {editing ? (
        <form action={updateMember} className="mt-3 flex flex-col gap-2 rounded-xl bg-mist/40 p-3">
          <input type="hidden" name="membershipId" value={m.membership_id} />
          <input type="hidden" name="scopes" value={scopesJson} />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-700 text-ink/60">Cargo a mostrar</label>
            <input
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Coordinador de Inglés"
              className="rounded-lg border border-ink/12 bg-white px-3 py-2 text-sm font-600 text-ink outline-none focus:border-brand/50"
            />
          </div>
          {mode ? (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-700 text-ink/60">
                {mode === "sections" ? "Secciones a cargo" : "Salones (o una sección entera)"}
              </label>
              <ScopePicker levels={levels} mode={mode} value={scope} onChange={setScope} />
            </div>
          ) : null}
          <div className="flex gap-2">
            <button
              type="submit"
              onClick={() => setEditing(false)}
              className="rounded-full bg-cta px-4 py-2 text-sm font-700 text-white transition-colors hover:bg-cta-deep"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-full px-4 py-2 text-sm font-700 text-ink/55 hover:text-ink"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
