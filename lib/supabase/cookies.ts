// Opciones de cookie para la sesión de Supabase.
//
// Sin `maxAge`, @supabase/ssr crea cookies "de sesión" (sin expiración), que el
// WebView de la app nativa (Capacitor) BORRA al cerrarse → el usuario tiene que
// volver a loguearse cada vez que reabre la app. Con un `maxAge` largo, las
// cookies se vuelven persistentes y la sesión sobrevive al reinicio de la app
// (y al cierre total del navegador). 400 días = máximo que aceptan los
// navegadores por la spec de cookies.
export const SESSION_COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 400,
};
