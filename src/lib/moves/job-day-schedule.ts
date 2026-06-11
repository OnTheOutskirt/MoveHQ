import type { JobDayPeriod, MoveJobDay } from "./types";

/** Whether the crew departs the shop for this job (vs. rolling from a prior job that day). */
export function isJobDayFirstStop(
  day: Pick<MoveJobDay, "isFirstJobOfDay" | "dayPeriod" | "arrivalWindow">,
): boolean {
  if (day.isFirstJobOfDay != null) return day.isFirstJobOfDay;
  if (day.dayPeriod === "afternoon") return false;
  if (day.dayPeriod === "morning") return true;

  const aw = (day.arrivalWindow ?? "").toLowerCase();
  if (aw.includes("11:00") && aw.includes("4:00")) return false;
  if (aw.includes("flexible")) return false;
  if (/1[1-4](:\d{2})?\s*(am|pm)?/.test(aw) && aw.includes("pm")) return false;

  return true;
}

/** Day-share period inferred from first-stop vs follow-on scheduling. */
export function jobDaySharePeriod(
  day: Pick<MoveJobDay, "isFirstJobOfDay" | "dayPeriod" | "arrivalWindow">,
): JobDayPeriod {
  return isJobDayFirstStop(day) ? "morning" : "afternoon";
}
