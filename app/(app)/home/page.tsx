import { HomeView } from "@/components/home/HomeView";
import { getFeed } from "@/lib/posts";
import { getCalendar } from "@/lib/calendar";
import { getConversations } from "@/lib/conversations";
import { getRequests } from "@/lib/requests";

export default async function InicioPage() {
  const [posts, events, conversations, requests] = await Promise.all([
    getFeed(50),
    getCalendar(),
    getConversations(),
    getRequests(),
  ]);
  const unreadPosts = posts.filter((p) => p.unread).length;
  const unreadMessages = conversations.reduce((s, c) => s + c.unread, 0);
  const pendingRequests = requests.filter((r) => r.status === "submitted").length;
  // Tareas pendientes = novedades tipo tarea que todavía no marqué como hechas.
  const pendingTasks = posts.filter((p) => p.kind === "task" && !p.taskDone).length;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <HomeView
        unreadPosts={unreadPosts}
        events={events}
        unreadMessages={unreadMessages}
        pendingRequests={pendingRequests}
        pendingTasks={pendingTasks}
      />
    </main>
  );
}
