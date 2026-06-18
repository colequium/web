"use client";

import { ConversationsView } from "@/components/conversaciones/ConversationsView";
import { useLocale } from "@/components/locale-context";

export default function ConversacionesPage() {
  const { t } = useLocale();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5">
        <h1 className="font-display text-2xl font-700 text-ink">{t("conv.title")}</h1>
        <p className="text-sm font-500 text-ink/55">{t("conv.subtitle")}</p>
      </div>

      <ConversationsView />
    </main>
  );
}
