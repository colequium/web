import { createClient } from "@/lib/supabase/server";
import { rethrowNextControl } from "@/lib/supabase/safe";
import { ROLE_LABELS, type RoleKey } from "@/lib/domain";

export interface Person {
  membershipId: string | null;
  name: string;
  roleKey: RoleKey | null;
  roleLabel: string;
  /** Línea de contexto: "Mamá de Tomás" (familia) o "6°B" (alcance del staff). */
  context: string | null;
  /** Cursos asociados (para filtrar por salón): staff o familia. */
  groups: string[];
  /** Materia del docente, si tiene ("Música" → "Docente de Música"). */
  subject: string | null;
  /** ¿El usuario actual puede editar/quitar a esta persona? (admin o coordinador en alcance) */
  canManage: boolean;
}

interface PersonRow {
  membership_id: string | null;
  name: string;
  role_key: string | null;
  role_kind: string | null;
  context: string | null;
  groups: string[] | null;
  subject: string | null;
  can_manage: boolean | null;
}

/** Subtítulo a mostrar bajo el nombre: de quién es (familia) o cargo + alcance. */
export function personSubtitle(p: Person): string {
  // Docente con materia → "Docente de Música".
  const label =
    p.roleKey === "teacher" && p.subject ? `${p.roleLabel} de ${p.subject}` : p.roleLabel;
  if (p.roleKey === "guardian" && p.context) return p.context;
  if (p.context) return `${label} · ${p.context}`;
  return label;
}

/** Personas de la comunidad visibles para el usuario (según su rol). */
export async function getPeople(): Promise<Person[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }
  let data: unknown;
  try {
    const supabase = await createClient();
    const res = await supabase.rpc("community_people");
    if (res.error || !res.data) return [];
    data = res.data;
  } catch (e) {
    rethrowNextControl(e);
    console.error("[getPeople] error, devuelvo []:", e);
    return [];
  }

  return (data as PersonRow[]).map((r) => {
    const key = (r.role_key ?? null) as RoleKey | null;
    return {
      membershipId: r.membership_id,
      name: r.name,
      roleKey: key,
      roleLabel: key ? ROLE_LABELS[key] : "Miembro",
      context: r.context,
      groups: r.groups ?? [],
      subject: r.subject ?? null,
      canManage: !!r.can_manage,
    };
  });
}
