import { redirect } from "next/navigation";
import { Icon } from "@/components/icons";
import { getIdentity } from "@/lib/identity";
import { getSalidas } from "@/lib/pickups";
import { getServerT } from "@/lib/i18n-server";
import { SalidasView } from "@/components/pickups/SalidasView";

export default async function SalidasPage() {
  const me = await getIdentity();
  // Solo docentes y dirección/gestión.
  if (!me || !(me.isAdmin || me.roleKey === "teacher")) redirect("/home");

  const [students, t] = await Promise.all([getSalidas(), getServerT()]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5">
        <h1 className="font-display text-2xl font-700 text-ink">{t("exits.title")}</h1>
        <p className="text-sm font-500 text-ink/55">{t("exits.subtitle")}</p>
      </div>

      {students.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-ink/15 bg-white px-6 py-16 text-center">
          <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-mist text-ink/40">
            <Icon name="DoorOpen" className="h-6 w-6" />
          </span>
          <p className="font-display text-base font-700 text-ink">{t("exits.emptyTitle")}</p>
          <p className="mt-1 text-sm font-500 text-ink/55">{t("exits.emptyText")}</p>
        </div>
      ) : (
        <SalidasView students={students} />
      )}
    </main>
  );
}
