import { lazyNamedWorkspace } from "@/lib/navigation/lazy-route";

const MoveCalendar = lazyNamedWorkspace(
  () => import("@/components/calendar/MoveCalendar"),
  (module) => module.MoveCalendar,
  "Loading calendar…",
);

export default function CalendarPage() {
  return <MoveCalendar />;
}
