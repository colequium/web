import { RequestsView } from "@/components/requests/RequestsView";
import { getRequests, getMyChildren } from "@/lib/requests";
import { getServerT } from "@/lib/i18n-server";
import { blockStudents, getIdentity } from "@/lib/identity";

export default async function TramitesPage() {
  await blockStudents();
  const [items, me, children, t] = await Promise.all([
    getRequests(),
    getIdentity(),
    getMyChildren(),
    getServerT(),
  ]);
  // Solo las familias inician solicitudes; el equipo las gestiona.
  const canCreate = me?.roleKey === "guardian";
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5">
        <h1 className="font-display text-2xl font-700 text-ink">{t("nav.requests")}</h1>
        <p className="text-sm font-500 text-ink/55">
          {canCreate ? t("req.subtitle.guardian") : t("req.subtitle.staff")}
        </p>
      </div>
      <RequestsView items={items} canCreate={canCreate} children={children} />
    </main>
  );
}
