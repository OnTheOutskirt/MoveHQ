import type { JobDayStatus, MoveJobDay } from "./types";

export const jobDayStatusConfig: Record<
  JobDayStatus,
  { label: string; badge: string }
> = {
  proposed: { label: "Proposed", badge: "bg-violet-50 text-violet-800" },
  scheduled: { label: "Scheduled", badge: "bg-blue-50 text-blue-800" },
  in_progress: { label: "In progress", badge: "bg-amber-50 text-amber-900" },
  completed: { label: "Completed", badge: "bg-emerald-50 text-emerald-800" },
  cancelled: { label: "Cancelled", badge: "bg-slate-100 text-slate-600" },
};

export function jobDayStatusLabel(status: JobDayStatus): string {
  return jobDayStatusConfig[status].label;
}

export function isProposedJobDay(day: MoveJobDay): boolean {
  return day.status === "proposed";
}
