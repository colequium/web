import { createClient } from "@/lib/supabase/server";
import { rethrowNextControl } from "@/lib/supabase/safe";
import type { CalEvent } from "@/lib/domain";

interface CalRow {
  id: string;
  calendar_key: string;
  day: number;
  all_day: boolean;
  start_time: string | null;
  end_time: string | null;
  title: string;
  audience_label: string | null;
  kind: string;
}

/** Eventos + tareas del calendario visibles para el usuario (filtrados por rol). */
export async function getCalendar(): Promise<CalEvent[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }
  let data: unknown;
  try {
    const supabase = await createClient();
    const res = await supabase.rpc("calendar_feed");
    if (res.error || !res.data) return [];
    data = res.data;
  } catch (e) {
    rethrowNextControl(e);
    console.error("[getCalendar] error, devuelvo []:", e);
    return [];
  }

  return (data as CalRow[]).map((r) => ({
    id: r.id,
    calendarId: r.calendar_key,
    day: r.day,
    allDay: r.all_day,
    time: r.start_time ?? undefined,
    endTime: r.end_time ?? undefined,
    title: r.title,
    audienceLabel: r.audience_label ?? "",
    kind: r.kind === "task" ? "task" : "event",
  }));
}
