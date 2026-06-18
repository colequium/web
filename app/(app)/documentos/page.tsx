import { ModulePlaceholder } from "@/components/shell/ModulePlaceholder";

export default function DocumentosPage() {
  return (
    <ModulePlaceholder
      icon="FolderClosed"
      title="Documentos"
      subtitle="Circulares, reglamentos y archivos del colegio, ordenados por carpeta."
      features={[
        "Carpetas por nivel, grado y área",
        "Subir y compartir archivos (PDF, imágenes)",
        "Permisos de acceso según rol",
        "Buscador y archivos recientes",
        "Versionado de documentos",
        "Marcar como leído / pendiente",
      ]}
    />
  );
}
