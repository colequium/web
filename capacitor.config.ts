import type { CapacitorConfig } from "@capacitor/cli";

// La app nativa es un "shell": carga la web en vivo (server.url) y suma la capa
// nativa de push. No reescribimos la UI; todo corre desde Vercel (colequium.com).
const config: CapacitorConfig = {
  appId: "com.colequium.app",
  appName: "Colequium",
  // Stub: con server.url el contenido local no se usa en runtime, pero Capacitor
  // exige un webDir para el sync.
  webDir: "mobile/www",
  server: {
    url: "https://colequium.com",
    androidScheme: "https",
    // Mantiene TODO el dominio dentro del WebView. Sin esto, una redirección
    // interna (p. ej. login → muro) se abre en Safari y el WebView queda en blanco.
    allowNavigation: ["colequium.com", "*.colequium.com"],
  },
};

export default config;
