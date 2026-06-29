import { createClient } from "@/lib/supabase/server";
import { rethrowNextControl } from "@/lib/supabase/safe";

export interface DocItem {
  id: string;
  title: string;
  dateLabel: string;
  url: string | null;
}
export interface DocFolder {
  name: string;
  docs: DocItem[];
}

function dateLabel(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Carpetas + documentos del colegio, con URL firmada para descargar. */
export async function getDocuments(): Promise<DocFolder[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }
  try {
    const supabase = await createClient();

    const [{ data: folders }, { data: docs }] = await Promise.all([
      supabase.from("document_folders").select("id, name").order("name"),
      supabase
        .from("documents")
        .select("id, title, file_url, created_at, folder_id")
        .order("created_at", { ascending: false }),
    ]);
    if (!folders || !docs) return [];

    // Servimos el archivo a través de una ruta propia (/documents/file/[id]) en
    // lugar de exponer la URL firmada de Supabase: así, al abrir un documento, la
    // dirección dice Colequium y no el dominio de almacenamiento.
    return folders
      .map((f) => ({
        name: f.name as string,
        docs: docs
          .filter((d) => d.folder_id === f.id)
          .map((d) => ({
            id: d.id as string,
            title: (d.title as string) ?? "Documento",
            dateLabel: dateLabel(d.created_at as string),
            url: d.file_url ? `/documents/file/${d.id as string}` : null,
          })),
      }))
      .filter((f) => f.docs.length > 0);
  } catch (e) {
    rethrowNextControl(e);
    console.error("[getDocuments] error, devuelvo []:", e);
    return [];
  }
}
