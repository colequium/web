"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type ResetState = { sent: boolean };

export async function requestReset(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const email = String(formData.get("email") || "").trim();

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (await headers()).get("origin") ||
    "http://localhost:3100";

  const supabase = await createClient();
  // No revelamos si el correo existe o no: siempre confirmamos.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/recuperar/nueva`,
  });

  return { sent: true };
}
