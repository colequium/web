import { CalendarView } from "@/components/calendario/CalendarView";
import { getCalendar } from "@/lib/calendar";

export default async function CalendarioPage() {
  const events = await getCalendar();
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <CalendarView events={events} />
    </main>
  );
}
