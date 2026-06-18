import { ModulePlaceholder } from "@/components/shell/ModulePlaceholder";

export default function ComunidadPage() {
  return (
    <ModulePlaceholder
      icon="Users"
      title="Comunidad"
      subtitle="Personas del colegio: equipo, familias y alumnos, según tu rol."
      features={[
        "Directorio por rol (dirección, docentes, familias…)",
        "Grupos: 6°B, niveles, comisiones",
        "Ficha de cada persona y sus grupos",
        "Invitar y administrar miembros",
        "Vincular familias con alumnos (tutorías)",
        "Respeta la privacidad: cada quien ve lo que le corresponde",
      ]}
    />
  );
}
