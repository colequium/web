"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendInvite } from "@/lib/invites";

export type ProfileState = { ok?: boolean; error?: string } | null;

export type DeleteState = { error?: string } | null;

/** Palabras de confirmación aceptadas (una por idioma). */
const DELETE_WORDS = ["ELIMINAR", "EXCLUIR", "DELETE"];

/**
 * Borra la cuenta del usuario actual (requisito de App Store / Play: el usuario
 * debe poder eliminar su cuenta desde la app, sin soporte). Borrar el usuario de
 * auth cascadea todo lo personal; el contenido institucional queda anonimizado
 * (author → NULL). Acción irreversible: la UI pide triple confirmación.
 */
export async function deleteMyAccount(
  _prev: DeleteState,
  formData: FormData,
): Promise<DeleteState> {
  const confirm = String(formData.get("confirm") || "").trim().toUpperCase();
  if (!DELETE_WORDS.includes(confirm)) {
    return { error: "Escribe la palabra de confirmación para continuar." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No pudimos identificar tu cuenta." };

  const admin = createAdminClient();
  if (!admin) return { error: "No se pudo procesar la eliminación. Intenta más tarde." };

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("[deleteMyAccount] error:", error.message);
    return { error: "No se pudo eliminar la cuenta. Intenta de nuevo." };
  }

  await supabase.auth.signOut();
  redirect("/login");
}

/** Edita el nombre completo del usuario. */
export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const fullName = String(formData.get("fullName") || "").trim();
  if (fullName.length < 2) return { error: "Ingresa tu nombre." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No pudimos identificar tu cuenta." };
  const { error } = await supabase.from("users").update({ full_name: fullName }).eq("id", user.id);
  if (error) return { error: "No se pudo guardar." };
  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return { ok: true };
}

export type CoTutorState =
  | { ok?: boolean; emailed?: boolean; link?: string; count?: number; error?: string }
  | null;

/**
 * Un tutor invita a otra persona como tutor/a de uno o varios de SUS hijos.
 * La persona invitada hereda los permisos del que invita sobre cada hijo
 * (la validación de "solo mis hijos" la hace el RPC invite_cotutor).
 */
export async function inviteCoTutor(
  _prev: CoTutorState,
  formData: FormData,
): Promise<CoTutorState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const fullName = String(formData.get("fullName") || "").trim();
  const relationship = String(formData.get("relationship") || "").trim();
  const studentIds = formData.getAll("studentIds").map(String).filter(Boolean);

  if (!email) return { error: "Ingresa el correo de la persona." };
  if (studentIds.length === 0) return { error: "Elige al menos un hijo/a." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No pudimos identificar tu cuenta." };

  const { data: count, error } = await supabase.rpc("invite_cotutor", {
    p_email: email,
    p_full_name: fullName || null,
    p_student_ids: studentIds,
    p_relationship: relationship || null,
  });
  if (error) return { error: "No se pudo crear la invitación." };
  if (!count || (count as number) === 0) {
    return { error: "Ya existe una invitación pendiente para ese correo." };
  }

  // Nombre del colegio para el correo.
  const { data: m } = await supabase
    .from("memberships")
    .select("communities(name)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();
  const comm = m?.communities as { name: string } | { name: string }[] | null;
  const communityName =
    (Array.isArray(comm) ? comm[0]?.name : comm?.name) ?? "tu colegio";

  const res = await sendInvite({ email, fullName, communityName });
  revalidatePath("/profile");
  if (!res.ok) return { error: res.error ?? "No se pudo enviar la invitación." };
  return { ok: true, emailed: res.emailed, link: res.link, count: count as number };
}

/** Enciende/apaga el push de una categoría para el usuario actual. */
export async function setNotificationPush(category: string, enabled: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { data } = await supabase
    .from("users")
    .select("notification_prefs")
    .eq("id", user.id)
    .maybeSingle();
  const prefs = (data?.notification_prefs as { push?: Record<string, boolean> } | null) ?? {};
  const push = { ...(prefs.push ?? {}), [category]: enabled };
  await supabase
    .from("users")
    .update({ notification_prefs: { ...prefs, push } })
    .eq("id", user.id);
  revalidatePath("/profile");
}

/** Guarda el idioma preferido del usuario. */
export async function setUiLocale(formData: FormData) {
  const locale = String(formData.get("locale") || "");
  if (!locale) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("users").update({ ui_locale: locale }).eq("id", user.id);
  revalidatePath("/", "layout");
}
