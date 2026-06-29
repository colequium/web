import { getFeed } from "@/lib/posts";
import { getActiveChildGroup } from "@/lib/child-filter";
import { getServerT } from "@/lib/i18n-server";
import { TasksView } from "@/components/tasks/TasksView";

/** Tareas asignadas al usuario (novedades tipo tarea: firmar / entregar / completar). */
export default async function TasksPage() {
  const child = await getActiveChildGroup();
  const [posts, t] = await Promise.all([getFeed(200, 0, child), getServerT()]);
  const tasks = posts.filter((p) => p.kind === "task");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5">
        <h1 className="font-display text-2xl font-700 text-ink">{t("nav.tasks")}</h1>
        <p className="text-sm font-500 text-ink/55">{t("tasks.subtitle")}</p>
      </div>
      <TasksView tasks={tasks} />
    </main>
  );
}
