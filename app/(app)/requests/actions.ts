"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getRequestComments, type RequestComment } from "@/lib/requests";

/** Carga el hilo de comentarios de una solicitud (para el detalle en cliente). */
export async function fetchRequestComments(requestId: string): Promise<RequestComment[]> {
  if (!requestId) return [];
  return getRequestComments(requestId);
}

export type RequestState = { error?: string; ok?: boolean } | null;

/** Crea una solicitud (inasistencia o salida) para un hijo del usuario. */
export async function createRequest(
  _prev: RequestState,
  formData: FormData,
): Promise<RequestState> {
  const type = String(formData.get("type") || "");
  const studentId = String(formData.get("studentId") || "");
  const date = String(formData.get("date") || "").trim();
  const reason = String(formData.get("reason") || "").trim();
  const pickupName = String(formData.get("pickupName") || "").trim();
  const relationship = String(formData.get("relationship") || "").trim();

  if (!["absence", "exit"].includes(type)) return { error: "Tipo de solicitud inválido." };
  if (!studentId) return { error: "Elige a tu hijo/a." };
  if (!date) return { error: "Elige la fecha." };
  if (type === "exit" && !pickupName) return { error: "Indica quién retira al alumno." };

  // Resumen legible para el listado y para Salidas.
  const summary =
    type === "absence"
      ? `Inasistencia${reason ? ` · ${reason}` : ""}`
      : `Retira ${pickupName}${relationship ? ` (${relationship})` : ""}${reason ? ` · ${reason}` : ""}`;

  const payload: Record<string, string> = { date, summary };
  if (reason) payload.reason = reason;
  if (type === "exit") {
    payload.pickup_name = pickupName;
    if (relationship) payload.relationship = relationship;
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_request", {
    p_type: type,
    p_student_id: studentId,
    p_payload: payload,
  });
  if (error) {
    console.error("[createRequest] error:", error.message);
    return { error: "No se pudo crear la solicitud." };
  }

  revalidatePath("/requests");
  revalidatePath("/pickups");
  revalidatePath("/home");
  return { ok: true };
}

/** El colegio marca una solicitud como recibida/gestionada (status='received'). */
export async function setRequestStatus(requestId: string, status: string) {
  if (!requestId) return;
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_request_status", {
    p_request: requestId,
    p_status: status,
  });
  if (error) console.error("[setRequestStatus] error:", error.message);
  revalidatePath("/requests");
  revalidatePath("/pickups");
}

/** Agrega un comentario al hilo de una solicitud (colegio o familia). */
export async function addRequestComment(requestId: string, body: string) {
  const text = body.trim();
  if (!requestId || !text) return;
  const supabase = await createClient();
  const { error } = await supabase.rpc("add_request_comment", {
    p_request: requestId,
    p_body: text,
  });
  if (error) console.error("[addRequestComment] error:", error.message);
  revalidatePath("/requests");
}
