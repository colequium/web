import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/icons";
import { getIdentity } from "@/lib/identity";
import { logout } from "@/app/(auth)/login/actions";

export default async function PerfilPage() {
  const me = await getIdentity();

  const name = me?.name ?? "Invitado";
  const role = me?.roleLabel || "—";
  const school = me?.schoolName ?? "—";
  const email = me?.email ?? "—";

  const rows = [
    { icon: "ShieldCheck", label: "Rol", value: role },
    { icon: "GraduationCap", label: "Colegio", value: school },
    { icon: "Mail", label: "Correo", value: email },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5">
        <h1 className="font-display text-2xl font-700 text-ink">Mi perfil</h1>
        <p className="text-sm font-500 text-ink/55">
          Tus datos en {school}.
        </p>
      </div>

      <section className="overflow-hidden rounded-[1.75rem] border border-ink/8 bg-white shadow-card">
        {/* Encabezado */}
        <div className="relative bg-gradient-to-br from-navy to-navy-deep px-6 py-7 sm:px-8">
          <div className="absolute inset-0 opacity-[0.10] [background:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:20px_20px]" />
          <div className="relative flex items-center gap-4">
            <Avatar name={name} color="brand" size="lg" ring />
            <div className="min-w-0">
              <p className="truncate font-display text-xl font-700 text-white">{name}</p>
              <p className="text-sm font-600 text-white/70">{role}</p>
            </div>
          </div>
        </div>

        {/* Datos */}
        <dl className="divide-y divide-ink/8">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-3 px-6 py-4 sm:px-8">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f1f5fa] text-ink/55">
                <Icon name={r.icon} className="h-4 w-4" />
              </span>
              <dt className="w-24 shrink-0 text-sm font-500 text-ink/50">{r.label}</dt>
              <dd className="min-w-0 flex-1 truncate text-sm font-700 text-ink">{r.value}</dd>
            </div>
          ))}
        </dl>

        {/* Acciones */}
        <div className="flex items-center justify-between gap-3 border-t border-ink/8 bg-[#f8fafc] px-6 py-4 sm:px-8">
          <p className="text-xs font-500 text-ink/45">
            La edición de perfil y preferencias llega pronto.
          </p>
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-rose/30 px-4 py-2 text-sm font-700 text-rose transition-colors hover:bg-rose/10"
            >
              <Icon name="LogOut" className="h-4 w-4" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
