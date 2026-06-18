"use client";

import { RequestsView } from "@/components/tramites/RequestsView";
import { useLocale } from "@/components/locale-context";

export default function TramitesPage() {
  const { t } = useLocale();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5">
        <h1 className="font-display text-2xl font-700 text-ink">{t("req.title")}</h1>
        <p className="text-sm font-500 text-ink/55">{t("req.subtitle")}</p>
      </div>

      <RequestsView />
    </main>
  );
}
