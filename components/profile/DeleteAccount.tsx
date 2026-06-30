"use client";

import { useActionState, useState } from "react";
import { Icon } from "@/components/icons";
import { useLocale } from "@/components/locale-context";
import { deleteMyAccount, type DeleteState } from "@/app/(app)/profile/actions";

export function DeleteAccount() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [word, setWord] = useState("");
  const [state, formAction, pending] = useActionState<DeleteState, FormData>(
    deleteMyAccount,
    null,
  );

  const target = t("account.delete.word");
  const matches = word.trim().toUpperCase() === target.toUpperCase();

  return (
    <section className="rounded-[1.5rem] border border-rose/30 bg-white p-5 shadow-card">
      <h2 className="mb-1 font-display text-base font-700 text-rose">
        {t("account.delete.title")}
      </h2>
      <p className="mb-4 text-xs font-500 text-ink/55">{t("account.delete.warn")}</p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-rose/40 px-4 py-2.5 text-sm font-700 text-rose transition-colors hover:bg-rose/10"
        >
          {t("account.delete.cta")}
        </button>
      ) : (
        <form action={formAction} className="flex flex-col gap-3">
          <div>
            <label htmlFor="confirm" className="mb-1.5 block text-sm font-700 text-ink">
              {t("account.delete.confirmLabel")}{" "}
              <span className="font-800 text-rose">{target}</span>
            </label>
            <input
              id="confirm"
              name="confirm"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              autoComplete="off"
              autoCapitalize="characters"
              placeholder={target}
              className="w-full rounded-xl bg-mist px-4 py-2.5 text-sm font-700 tracking-wide text-ink outline-none placeholder:text-ink/30 focus:ring-2 focus:ring-rose/30"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setWord("");
              }}
              className="rounded-full border border-ink/15 px-4 py-2.5 text-sm font-700 text-ink/60 transition-colors hover:bg-ink/5"
            >
              {t("account.delete.cancel")}
            </button>
            <button
              type="submit"
              disabled={!matches || pending}
              className="inline-flex items-center gap-2 rounded-full bg-rose px-4 py-2.5 text-sm font-700 text-white transition-colors hover:brightness-95 disabled:opacity-40"
            >
              <Icon name="Trash2" className="h-4 w-4" />
              {pending ? t("account.delete.deleting") : t("account.delete.confirmCta")}
            </button>
          </div>
          {state?.error ? (
            <p className="text-xs font-700 text-rose">{state.error}</p>
          ) : null}
        </form>
      )}
    </section>
  );
}
