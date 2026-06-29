import "server-only";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, LOCALES, translator, type Locale } from "@/lib/i18n";

/** Traductor para Server Components: resuelve el idioma desde la cookie. */
export async function getServerT() {
  const c = await cookies();
  const code = c.get(LOCALE_COOKIE)?.value;
  const locale = (LOCALES.find((l) => l.code === code)?.code ?? "es-MX") as Locale;
  return translator(locale);
}
