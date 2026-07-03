import { LocaleProvider } from "@/components/locale-context";
import { IdentityProvider } from "@/components/identity-context";
import { NativePush } from "@/components/NativePush";
import { RailSidebar } from "@/components/shell/RailSidebar";
import { AppTopbar } from "@/components/shell/AppTopbar";
import { cookies } from "next/headers";
import { MobileNav } from "@/components/shell/MobileNav";
import { ChildFilterBar } from "@/components/shell/ChildFilterBar";
import { AllClearCelebration } from "@/components/shell/AllClearCelebration";
import { getIdentity } from "@/lib/identity";
import { getChildFilter } from "@/lib/child-filter";
import { getUnreadMessageCount } from "@/lib/conversations";
import { getHomeCounts } from "@/lib/posts";
import { LOCALES, LOCALE_COOKIE, type Locale } from "@/lib/i18n";

/**
 * Shell interno (estilo intranet Alliance): rail slim de íconos a la izquierda,
 * topbar compartida (buscador + idioma + notif + perfil) y bottom-nav en móvil.
 * Resuelve la identidad real del usuario logueado y la provee al árbol.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [identity, childFilter, cookieStore, unreadMessages, counts] = await Promise.all([
    getIdentity(),
    getChildFilter(),
    cookies(),
    getUnreadMessageCount(),
    getHomeCounts(null), // SIN filtro por hijo: "al día como padre" (todos los hijos)
  ]);
  // "Todo al día": avisos + tareas + mensajes en cero, sobre TODA la familia (no el
  // hijo filtrado). Alimenta la celebración global; así seleccionar un hijo no la
  // dispara y solo salta cuando el padre queda realmente al día en todo.
  const allClear =
    counts.unreadPosts === 0 && counts.pendingTasks === 0 && unreadMessages === 0;
  const codes = LOCALES.map((l) => l.code) as string[];
  // Prioridad: cookie (elección rápida que persiste) → perfil → default.
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const initialLocale: Locale = codes.includes(cookieLocale ?? "")
    ? (cookieLocale as Locale)
    : identity?.uiLocale && codes.includes(identity.uiLocale)
      ? (identity.uiLocale as Locale)
      : "es-MX";

  return (
    <LocaleProvider initial={initialLocale}>
      <IdentityProvider value={identity}>
        <NativePush />
        <AllClearCelebration allClear={allClear} />
        <div className="flex min-h-dvh bg-[#f1f5fa]">
          <RailSidebar unreadMessages={unreadMessages} />
          <div className="flex min-w-0 flex-1 flex-col">
            <AppTopbar />
            <ChildFilterBar courses={childFilter.courses} active={childFilter.active} />
            <div className="flex-1">{children}</div>
            <MobileNav unreadMessages={unreadMessages} />
          </div>
        </div>
      </IdentityProvider>
    </LocaleProvider>
  );
}
