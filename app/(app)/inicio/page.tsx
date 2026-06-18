import { HomeView } from "@/components/inicio/HomeView";
import { getFeed } from "@/lib/posts";
import { getCalendar } from "@/lib/calendar";
import { getConversations } from "@/lib/conversations";

export default async function InicioPage() {
  const [posts, events, conversations] = await Promise.all([
    getFeed(),
    getCalendar(),
    getConversations(),
  ]);
  const unreadPosts = posts.filter((p) => p.unread).length;
  const unreadMessages = conversations.reduce((s, c) => s + c.unread, 0);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <HomeView
        unreadPosts={unreadPosts}
        events={events}
        unreadMessages={unreadMessages}
      />
    </main>
  );
}
