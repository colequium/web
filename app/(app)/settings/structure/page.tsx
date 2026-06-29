import { getStructure } from "@/lib/structure";
import { SCHOOL_PRESETS } from "@/lib/school-presets";
import { StructureManager } from "@/components/settings/StructureManager";

export default async function EstructuraPage() {
  const structure = await getStructure();
  return <StructureManager structure={structure} presets={SCHOOL_PRESETS} />;
}
