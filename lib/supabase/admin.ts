import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase con la SERVICE ROLE key. Bypassa RLS — usar SOLO para
 * operaciones de auth admin (crear usuario, generateLink). NUNCA en el cliente.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
