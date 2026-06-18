import { LocaleProvider } from "@/components/locale-context";
import { RailSidebar } from "@/components/shell/RailSidebar";
import { AppTopbar } from "@/components/shell/AppTopbar";
import { MobileNav } from "@/components/shell/MobileNav";

/**
 * Shell interno (estilo intranet Alliance): rail slim de íconos a la izquierda,
 * topbar compartida (buscador + idioma + notif + perfil) y bottom-nav en móvil.
 * Las páginas NO renderizan su propia topbar; van directo con su contenido.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LocaleProvider initial="es-MX">
      <div className="flex min-h-dvh bg-[#f1f5fa]">
        <RailSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopbar />
          <div className="flex-1">{children}</div>
          <MobileNav />
        </div>
      </div>
    </LocaleProvider>
  );
}
