"use client";

import { useActionState, useState } from "react";
import { Icon } from "@/components/icons";
import { inviteMember, type InviteState } from "@/app/(app)/settings/people/actions";
import { ScopePicker, scopeModeForRole } from "@/components/settings/ScopePicker";
import type { StructureLevel } from "@/lib/structure";

interface Option {
  value: string;
  label: string;
}

const FIELD =
  "rounded-xl bg-mist px-3 py-2.5 text-sm font-600 text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-brand/30";

export function InviteForm({
  roles,
  levels,
  students,
}: {
  roles: Option[];
  levels: StructureLevel[];
  students: Option[];
}) {
  const [role, setRole] = useState("");
  const [scope, setScope] = useState<string[]>([]);
  const [state, formAction, pending] = useActionState<InviteState, FormData>(inviteMember, null);

  const isGuardian = role === "guardian";
  const mode = scopeModeForRole(role);
  // scopes → [{type, id}] para la invitación (level para secciones, group para salones).
  const scopeType = mode === "sections" ? "level" : "group";
  const scopesJson = JSON.stringify(scope.map((id) => ({ type: scopeType, id })));

  function onRole(v: string) {
    setRole(v);
    setScope([]); // el alcance depende del rol
  }

  return (
    <form action={formAction} className="rounded-[1.5rem] border border-ink/8 bg-white p-5 shadow-card">
      <h2 className="mb-3 font-display text-base font-700 text-ink">Invitar a alguien</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <input name="email" type="email" required placeholder="Correo" className={FIELD} />
        <input name="fullName" placeholder="Nombre y apellido" className={FIELD} />
        <select name="roleKey" required value={role} onChange={(e) => onRole(e.target.value)} className={FIELD}>
          <option value="">Rol…</option>
          {roles.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        {!isGuardian && role ? (
          <input name="title" placeholder="Cargo a mostrar (ej. Coordinador de Inglés)" className={FIELD} />
        ) : null}
      </div>

      {/* Alcance según el rol */}
      {mode ? (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-700 text-ink/60">
            {mode === "sections" ? "Secciones a cargo" : "Salones (o una sección entera)"}
          </p>
          <ScopePicker levels={levels} mode={mode} value={scope} onChange={setScope} />
        </div>
      ) : null}

      {/* Familia: alumno + relación */}
      {isGuardian ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <select name="studentId" className={FIELD}>
            <option value="">Alumno/a vinculado…</option>
            {students.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <input name="relationship" placeholder="Relación (madre, padre, tutor…)" className={FIELD} />
        </div>
      ) : null}

      <input type="hidden" name="scopes" value={scopesJson} />

      {state?.error ? (
        <p role="alert" className="mt-3 text-sm font-700 text-rose">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <div className="mt-3 rounded-xl bg-leaf/10 px-4 py-2.5 text-sm font-600 text-ink/75">
          {state.emailed ? (
            <span className="font-700 text-leaf">✓ Invitación enviada por correo.</span>
          ) : (
            <>
              <span className="font-700 text-ink">Invitación creada.</span> No se envió el correo
              (revisa Resend). Enlace para compartir:
              <br />
              <a href={state.link} className="break-all text-xs text-brand underline">
                {state.link}
              </a>
            </>
          )}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-700 text-white transition-colors hover:bg-navy-deep disabled:opacity-60"
      >
        <Icon name="Send" className="h-4 w-4" />
        {pending ? "Enviando…" : "Enviar invitación"}
      </button>
    </form>
  );
}
