import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Caché de navegación del cliente (Router Cache): al volver a una sección
  // visitada hace poco se muestra al instante desde memoria y se revalida por
  // detrás, en vez de re-consultar el servidor en cada cambio de pestaña.
  // Las mutaciones (marcar leído, completar tarea, etc.) siguen invalidando la
  // caché al toque porque usan server actions con revalidatePath.
  experimental: {
    staleTimes: {
      dynamic: 30, // segundos que una página dinámica se sirve desde caché al revisitar
      static: 180,
    },
  },
};

export default nextConfig;
