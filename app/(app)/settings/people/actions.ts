"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendInvite } from "@/lib/invites";

type Supa = Awaited<ReturnType<typeof createClient>>;

export type InviteState =
  | { ok?: boolean; emailed?: boolean; link?: string; error?: string }
  | null;

function pickOne<T>(rel: T | T[] | null | undefined): T | undefined {
  return Array.isArray(rel) ? rel[0] : (rel ?? undefined);
}

async function adminCtx(supabase: Supa) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("memberships")
    .select("id, community_id, communities(name)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return {
    membershipId: data.id as string,
    communityId: data.community_id as string,
    communityName:
      (pickOne(data.communities as { name: string } | { name: string }[])?.name) ?? "tu colegio",
  };
}

type Scope = { type: "level" | "group"; id: string };

function parseScopes(raw: string): Scope[] {
  try {
    const p = JSON.parse(raw || "[]");
    if (!Array.isArray(p)) return [];
    return p.filter(
      (s): s is Scope =>
        s && (s.type === "level" || s.type === "group") && typeof s.id === "string" && s.id.length > 0,
    );
  } catch {
    return [];
  }
}

export async function inviteMember(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const fullName = String(formData.get("fullName") || "").trim();
  const roleKey = String(formData.get("roleKey") || "").trim();
  const title = String(formData.get("title") || "").trim() || null;
  const studentId = String(formData.get("studentId") || "") || null;
  const relationship = String(formData.get("relationship") || "").trim() || null;
  const scopes = parseScopes(String(formData.get("scopes") || "[]"));
  if (!email || !roleKey) return { error: "Completa el correo y el rol." };

  const supabase = await createClient();
  const ctx = await adminCtx(supabase);
  if (!ctx) return { error: "No pudimos identificar tu colegio." };

  const { error } = await supabase.from("invitations").insert({
    community_id: ctx.communityId,
    email,
    full_name: fullName || null,
    role_key: roleKey,
    scopes: scopes.length ? scopes : null,
    title,
    student_id: roleKey === "guardian" ? studentId : null,
    relationship: roleKey === "guardian" ? relationship : null,
    invited_by: ctx.membershipId,
  });
  if (error) return { error: "No se pudo crear la invitación (¿permisos?)." };

  const res = await sendInvite({ email, fullName, communityName: ctx.communityName });
  revalidatePath("/settings/people");
  if (!res.ok) return { error: res.error ?? "No se pudo enviar la invitación." };
  return { ok: true, emailed: res.emailed, link: res.link };
}

/** Edita el cargo + alcances de un miembro que ya aceptó (vía RPC con chequeo admin). */
export async function updateMember(formData: FormData) {
  const membershipId = String(formData.get("membershipId") || "");
  const title = String(formData.get("title") || "").trim() || null;
  const scopes = parseScopes(String(formData.get("scopes") || "[]"));
  if (!membershipId) return;
  const supabase = await createClient();
  await supabase.rpc("set_member_scope", {
    p_membership: membershipId,
    p_title: title,
    p_level_ids: scopes.filter((s) => s.type === "level").map((s) => s.id),
    p_group_ids: scopes.filter((s) => s.type === "group").map((s) => s.id),
  });
  revalidatePath("/settings/people");
}

export async function revokeInvitation(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("invitations").update({ status: "revoked" }).eq("id", id);
  revalidatePath("/settings/people");
}

export async function resendInvitation(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = await createClient();
  const ctx = await adminCtx(supabase);
  const { data: inv } = await supabase
    .from("invitations")
    .select("email, full_name")
    .eq("id", id)
    .maybeSingle();
  if (inv && ctx) {
    await sendInvite({
      email: inv.email as string,
      fullName: (inv.full_name as string) ?? "",
      communityName: ctx.communityName,
    });
  }
  revalidatePath("/settings/people");
}
