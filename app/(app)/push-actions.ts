"use server";

import { createClient } from "@/lib/supabase/server";

const PLATFORMS = ["android", "ios", "web"];

/**
 * Registra (o reasigna) el token de push del dispositivo al usuario actual.
 * El token es único: si el mismo equipo entra con otra cuenta, queda con la nueva.
 * Usa la tabla device_tokens (RLS device_tokens_self permite gestionar el propio).
 */
export async function registerDevice(
  token: string,
  platform: string,
): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const t = (token ?? "").trim();
  if (!user || !t) return { ok: false };

  const p = PLATFORMS.includes(platform) ? platform : null;
  const { error } = await supabase
    .from("device_tokens")
    .upsert({ user_id: user.id, token: t, platform: p }, { onConflict: "token" });
  return { ok: !error };
}

/** Borra el token (p. ej. al cerrar sesión en ese dispositivo). */
export async function unregisterDevice(token: string): Promise<void> {
  const t = (token ?? "").trim();
  if (!t) return;
  const supabase = await createClient();
  await supabase.from("device_tokens").delete().eq("token", t);
}
