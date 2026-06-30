import { createBrowserClient } from "@supabase/ssr";
import { SESSION_COOKIE_OPTIONS } from "./cookies";

/** Cliente de Supabase para componentes/cliente (browser). Usa la clave pública. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookieOptions: SESSION_COOKIE_OPTIONS },
  );
}
