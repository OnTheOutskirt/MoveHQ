import type { DispatchJob } from "./types";

/** One-line schedule summary for dispatch cards. */
export function formatDispatchScheduleLine(job: DispatchJob): string | null {
  const parts: string[] = [];
  if (job.departureWindow?.trim()) {
    parts.push(`Depart ${job.departureWindow.trim()}`);
  }
  if (job.arrivalWindow?.trim()) {
    parts.push(`Arrive ${job.arrivalWindow.trim()}`);
  }
  if (job.durationLabel?.trim()) {
    parts.push(job.durationLabel.trim());
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

/** Secondary card line — day label when meaningful, never the generic calendar placeholder. */
export function dispatchCardSubtitle(job: DispatchJob): string | null {
  const schedule = formatDispatchScheduleLine(job);
  if (schedule) return schedule;
  if (job.label && job.label !== "Booked job") return job.label;
  return null;
}

export function formatDispatchResourceCount(
  filled: number,
  required: number,
  planned: number,
  overridden: boolean,
): string {
  const base = `${filled}/${required}`;
  return overridden ? `${base} (planned ${planned})` : base;
}
