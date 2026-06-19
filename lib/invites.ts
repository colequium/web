import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export interface SendInviteResult {
  ok: boolean;
  link?: string; // link de aceptación (fallback "copiar" si no hubo correo)
  emailed: boolean;
  error?: string;
}

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3100";
}

/** Genera el link de aceptación y, si hay Resend configurado, envía el correo. */
export async function sendInvite(opts: {
  email: string;
  fullName?: string;
  communityName: string;
}): Promise<SendInviteResult> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, emailed: false, error: "Falta configurar el servidor." };

  const redirectTo = `${siteUrl()}/auth/confirmar`;

  // generateLink crea el usuario (si no existe) y devuelve el hashed_token.
  let res = await admin.auth.admin.generateLink({
    type: "invite",
    email: opts.email,
    options: { redirectTo, data: { full_name: opts.fullName } },
  });
  // Si el email ya tenía cuenta, usar magiclink (igual reclama invitaciones).
  if (res.error && /registered|already/i.test(res.error.message)) {
    res = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: opts.email,
      options: { redirectTo },
    });
  }
  if (res.error || !res.data?.properties?.hashed_token) {
    return { ok: false, emailed: false, error: res.error?.message ?? "No se pudo generar la invitación." };
  }

  const tokenHash = res.data.properties.hashed_token;
  const type = res.data.properties.verification_type || "invite";
  const link = `${siteUrl()}/auth/confirmar?token_hash=${tokenHash}&type=${type}`;

  const emailed = await sendEmail(opts.email, opts.communityName, link);
  return { ok: true, link, emailed };
}

async function sendEmail(to: string, communityName: string, link: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.INVITE_FROM_EMAIL;
  if (!key || !from) return false;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to,
        subject: `Te invitaron a ${communityName} en Colequium`,
        html: emailHtml(communityName, link),
      }),
    });
    if (!r.ok) console.error("[invites] Resend respondió", r.status, await r.text());
    return r.ok;
  } catch (e) {
    console.error("[invites] error enviando correo:", e);
    return false;
  }
}

function emailHtml(communityName: string, link: string) {
  return `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1f2a44">
    <h1 style="font-size:20px;margin:0 0 8px">Te damos la bienvenida a ${communityName}</h1>
    <p style="font-size:15px;line-height:1.5;color:#4a5568">
      Tu colegio usa <b>Colequium</b> para comunicarse. Para activar tu cuenta y crear tu
      contraseña, hacé clic en el botón:
    </p>
    <p style="margin:24px 0">
      <a href="${link}" style="background:#1f2a44;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px;display:inline-block">
        Activar mi cuenta
      </a>
    </p>
    <p style="font-size:13px;color:#94a3b8">
      Si el botón no funciona, copiá y pegá este enlace:<br>
      <a href="${link}" style="color:#688db9">${link}</a>
    </p>
  </div>`;
}
