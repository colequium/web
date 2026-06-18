/**
 * Re-lanza los errores de CONTROL DE FLUJO de Next.js para que un try/catch
 * defensivo no los trague. Next usa errores con `digest` para señalizar:
 *  - render dinámico (cookies/headers) → DYNAMIC_SERVER_USAGE
 *  - redirect() → NEXT_REDIRECT
 *  - notFound() → NEXT_NOT_FOUND
 * Tragarlos rompe el renderizado (caso real: 500 en todo el sitio).
 */
export function rethrowNextControl(e: unknown): void {
  if (
    e &&
    typeof e === "object" &&
    "digest" in e &&
    typeof (e as { digest?: unknown }).digest === "string"
  ) {
    throw e;
  }
}
