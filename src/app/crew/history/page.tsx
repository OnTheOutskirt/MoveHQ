import { redirect } from "next/navigation";
import { crewScheduleTodayKey, weekStartKeyForDate } from "@/lib/crew-app/crew-history";

/** History lives on Schedule — keep old links working. */
export default function CrewHistoryPage() {
  const week = weekStartKeyForDate(crewScheduleTodayKey());
  redirect(`/crew/schedule/history?week=${week}`);
}
