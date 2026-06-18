import { MuroView } from "@/components/muro/MuroView";
import { getFeed } from "@/lib/posts";

/** Muro: feed real filtrado por audiencia/rol del usuario logueado. */
export default async function MuroPage() {
  const posts = await getFeed();
  return <MuroView posts={posts} />;
}
