import { RequestsView } from "@/components/requests/RequestsView";
import { getRequests, getMyChildren } from "@/lib/requests";
import { blockStudents, getIdentity } from "@/lib/identity";

export default async function TramitesPage() {
  await blockStudents();
  const [items, me, children] = await Promise.all([
    getRequests(),
    getIdentity(),
    getMyChildren(),
  ]);
  // Solo las familias inician solicitudes; el equipo las gestiona.
  const canCreate = me?.roleKey === "guardian";
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5">
        <h1 className="font-display text-2xl font-700 text-ink">Solicitudes</h1>
        <p className="text-sm font-500 text-ink/55">
          {canCreate
            ? "Avisa una inasistencia o autoriza una salida."
            : "Inasistencias y autorizaciones de la comunidad para gestionar."}
        </p>
      </div>
      <RequestsView items={items} canCreate={canCreate} children={children} />
    </main>
  );
}
