import "server-only";

// Traducción vía MyMemory (gratis, sin tarjeta ni API key).
//   GET https://api.mymemory.translated.net/get?q=TEXTO&langpair=es|en
// Límite anónimo ~1000 palabras/día; con un correo (MYMEMORY_EMAIL) sube a 50k.
// El origen del contenido es español (neutro). Cacheamos cada traducción (1 sola
// llamada por aviso+idioma), así que el consumo real es mínimo. Ver [[audience-engine]].

const ENDPOINT = "https://api.mymemory.translated.net/get";
const MAX_CHARS = 480; // el parámetro q del tier gratuito limita a ~500 bytes.

const LANG_PAIR: Record<string, string> = {
  "pt-BR": "pt-BR",
  pt: "pt",
  en: "en",
  "es-MX": "es", // mismo idioma; no debería pedirse traducción
};

export interface Translated {
  title: string;
  body: string;
}

/** Parte un texto en trozos de oraciones por debajo del límite de la API. */
function chunk(text: string): string[] {
  if (text.length <= MAX_CHARS) return [text];
  const parts: string[] = [];
  // Cortamos respetando el fin de oración / saltos de línea.
  const sentences = text.split(/(?<=[.!?])\s+|\n+/);
  let buf = "";
  for (const s of sentences) {
    if ((buf + " " + s).trim().length > MAX_CHARS) {
      if (buf) parts.push(buf.trim());
      // Una sola oración larguísima: cortar duro por longitud.
      if (s.length > MAX_CHARS) {
        for (let i = 0; i < s.length; i += MAX_CHARS) parts.push(s.slice(i, i + MAX_CHARS));
        buf = "";
      } else {
        buf = s;
      }
    } else {
      buf = (buf ? buf + " " : "") + s;
    }
  }
  if (buf.trim()) parts.push(buf.trim());
  return parts;
}

/** Traduce un texto del español al idioma destino. Devuelve null si falla. */
async function translateText(text: string, targetLang: string): Promise<string | null> {
  if (!text.trim()) return "";
  const target = LANG_PAIR[targetLang] ?? targetLang;
  if (target === "es") return text; // mismo idioma
  const email = process.env.MYMEMORY_EMAIL;

  const out: string[] = [];
  for (const piece of chunk(text)) {
    const url =
      `${ENDPOINT}?q=${encodeURIComponent(piece)}&langpair=${encodeURIComponent(`es|${target}`)}` +
      (email ? `&de=${encodeURIComponent(email)}` : "");
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error("[translate] MyMemory HTTP", res.status);
        return null;
      }
      const data = await res.json();
      const status = data?.responseStatus;
      const translated: string | undefined = data?.responseData?.translatedText;
      // status puede venir como número o string; 200 = ok.
      if (String(status) !== "200" || !translated) {
        console.error("[translate] MyMemory status", status, translated?.slice(0, 80));
        return null;
      }
      out.push(translated);
    } catch (e) {
      console.error("[translate] error:", e);
      return null;
    }
  }
  return out.join(" ");
}

/** Traduce título + cuerpo de un aviso al idioma destino. Devuelve null si falla. */
export async function translateNotice(
  title: string,
  body: string,
  targetLang: string,
): Promise<Translated | null> {
  const [tTitle, tBody] = await Promise.all([
    translateText(title, targetLang),
    translateText(body, targetLang),
  ]);
  if (tBody === null || tTitle === null) return null;
  return { title: tTitle, body: tBody };
}
