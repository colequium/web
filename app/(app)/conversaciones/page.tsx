import { ConversationsView } from "@/components/conversaciones/ConversationsView";
import { getConversations } from "@/lib/conversations";
import { getRecipients } from "./actions";
import { blockStudents } from "@/lib/identity";

export default async function ConversacionesPage() {
  await blockStudents();
  const [conversations, recipients] = await Promise.all([
    getConversations(),
    getRecipients(),
  ]);
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <ConversationsView conversations={conversations} recipients={recipients} />
    </main>
  );
}
