import "server-only";

/** Envía una push de Expo a una lista de tokens (servicio público de Expo). */
export async function sendExpoPush(tokens: string[], title: string, body: string) {
  const valid = tokens.filter((t) => t && t.startsWith("ExponentPushToken"));
  if (valid.length === 0) return;
  const messages = valid.map((to) => ({ to, title, body, sound: "default" }));
  try {
    // Expo acepta hasta 100 mensajes por request.
    for (let i = 0; i < messages.length; i += 100) {
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(messages.slice(i, i + 100)),
      });
    }
  } catch (e) {
    console.error("[push] error enviando:", e);
  }
}
