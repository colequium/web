import { HomeView } from "@/components/home/HomeView";
import { getHomeCounts } from "@/lib/posts";
import { getCalendar } from "@/lib/calendar";
import { getUnreadMessageCount } from "@/lib/conversations";
import { getActiveChildGroup } from "@/lib/child-filter";

export default async function InicioPage() {
  const child = await getActiveChildGroup();
  // El Inicio solo muestra contadores + próximos eventos: no necesita traer el
  // feed ni las conversaciones enteras. Contadores baratos (1 RPC c/u) en vez de
  // getFeed(50)+getConversations. (getRequests se eliminó: no se renderizaba.)
  const [counts, eventsAll, unreadMessages] = await Promise.all([
    getHomeCounts(child),
    getCalendar(),
    getUnreadMessageCount(),
  ]);
  const events = child ? eventsAll.filter((e) => !e.groupId || e.groupId === child) : eventsAll;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <HomeView
        unreadPosts={counts.unreadPosts}
        events={events}
        unreadMessages={unreadMessages}
        pendingTasks={counts.pendingTasks}
      />
    </main>
  );
}
