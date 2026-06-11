import type { DispatchJob } from "./types";

/** Pull a city label from a street/city/state address string. */
export function cityFromLocationSummary(summary: string | undefined): string | null {
  if (!summary?.trim()) return null;
  const parts = summary
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) return null;
  if (parts.length === 1) return parts[0]!;

  const last = parts[parts.length - 1]!;
  if (/^[A-Z]{2}(\s+\d{5}(-\d{4})?)?$/i.test(last)) {
    return parts[parts.length - 2] ?? null;
  }
  if (/^[A-Z]{2}\s+\d{5}/i.test(last)) {
    return parts[parts.length - 2] ?? null;
  }

  return parts[parts.length - 2] ?? parts[parts.length - 1]!;
}

export function dispatchJobRouteCities(job: DispatchJob): {
  originCity: string | null;
  destinationCity: string | null;
} {
  return {
    originCity: cityFromLocationSummary(job.originSummary),
    destinationCity: cityFromLocationSummary(job.destinationSummary),
  };
}

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
