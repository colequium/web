import { ModulePlaceholder } from "@/components/shell/ModulePlaceholder";

export default function TransportePage() {
  return (
    <ModulePlaceholder
      icon="Bus"
      title="Transporte"
      subtitle="Rutas, paradas y seguimiento del transporte escolar."
      features={[
        "Rutas y paradas con horarios estimados",
        "Posición del transporte en vivo (chofer con GPS)",
        "Aviso de subida y bajada del alumno",
        "Vista del chofer: lista de pasajeros del día",
        "Notificaciones de demoras o cambios de recorrido",
        "Contacto directo con el chofer",
      ]}
    />
  );
}
