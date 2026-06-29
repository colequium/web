import { Icon } from "@/components/icons";
import { getPeople, personSubtitle } from "@/lib/people";
import { ROLE_COLOR } from "@/lib/posts";
import { blockStudents } from "@/lib/identity";
import type { RoleKey } from "@/lib/domain";
import { ComunidadView, type DirSection } from "@/components/community/ComunidadView";

/** Secciones del directorio, en orden de jerarquía. */
const GROUPS: { key: string; title: string; icon: string; roles: RoleKey[]; filterable?: boolean }[] = [
  { key: "direccion", title: "Dirección y coordinación", icon: "ShieldCheck", roles: ["board", "manager", "principal", "department_head", "coordinator"] },
  { key: "docentes", title: "Docentes", icon: "GraduationCap", roles: ["teacher"], filterable: true },
  { key: "servicios", title: "Administración y servicios", icon: "Settings", roles: ["support_staff", "service_inbox"] },
  { key: "familias", title: "Familias", icon: "Users", roles: ["guardian"], filterable: true },
  { key: "alumnos", title: "Alumnos", icon: "Smile", roles: ["student"], filterable: true },
  { key: "transporte", title: "Transporte", icon: "Bus", roles: ["driver"] },
];

export default async function ComunidadPage() {
  await blockStudents();
  const people = await getPeople();

  const sections: DirSection[] = GROUPS.map((g) => ({
    key: g.key,
    title: g.title,
    icon: g.icon,
    filterable: !!g.filterable,
    people: people
      .filter((p) => p.roleKey && g.roles.includes(p.roleKey))
      .map((p) => ({
        name: p.name,
        subtitle: personSubtitle(p),
        color: (p.roleKey ? ROLE_COLOR[p.roleKey] ?? "brand" : "brand") as string,
        groups: p.groups,
      })),
  })).filter((s) => s.people.length > 0);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5">
        <h1 className="font-display text-2xl font-700 text-ink">Comunidad</h1>
        <p className="text-sm font-500 text-ink/55">
          {people.length > 0
            ? `${people.length} personas en tu colegio, según lo que te corresponde ver.`
            : "Personas del colegio."}
        </p>
      </div>

      {sections.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-ink/15 bg-white px-6 py-16 text-center">
          <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-mist text-ink/40">
            <Icon name="Users" className="h-6 w-6" />
          </span>
          <p className="font-display text-base font-700 text-ink">Todavía no hay personas para mostrar</p>
          <p className="mt-1 text-sm font-500 text-ink/55">
            Cuando se sumen miembros a tu comunidad, los verás aquí.
          </p>
        </div>
      ) : (
        <ComunidadView sections={sections} />
      )}
    </main>
  );
}
