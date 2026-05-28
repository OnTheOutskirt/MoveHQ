import type { DispatchJob } from "./types";

/** One-line schedule for dispatch cards: depart · arrive · duration */
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
  if (parts.length === 0) return null;
  return parts.join(" · ");
}

/** Crew/truck slot header: (filled/needed) with optional (planned N) when overridden in sidebar */
export function formatDispatchSlotCount(
  filled: number,
  needed: number,
  planned: number,
  overridden: boolean,
): string {
  const base = `(${filled}/${needed}`;
  if (overridden && needed !== planned) {
    return `${base}, planned ${planned})`;
  }
  return `${base})`;
}
