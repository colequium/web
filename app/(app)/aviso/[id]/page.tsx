import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostById } from "@/lib/posts";
import { PostCard } from "@/components/feed/PostCard";
import { Icon } from "@/components/icons";

/** Detalle de una novedad (invitación / tarea / comunicado) con sus acciones. */
export default async function AvisoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/calendar"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-700 text-ink/55 transition-colors hover:text-ink"
      >
        <Icon name="ChevronLeft" className="h-4 w-4" />
        Volver
      </Link>
      <PostCard post={post} index={0} />
    </main>
  );
}
