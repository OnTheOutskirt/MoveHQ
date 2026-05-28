import {
  formatJobDayLocationAddress,
  resolveJobDayLocations,
} from "./job-day-locations";
import type { JobDayService, MoveJobDay, MoveRecord } from "./types";

export const JOB_DAY_SERVICE_LABELS: Record<JobDayService, string> = {
  packing: "Packing",
  loading: "Loading",
  moving: "Moving",
  unloading: "Unloading",
  unpacking: "Unpacking",
  storage: "Storage",
  junk_removal: "Junk removal",
};

export function serviceLabel(service: JobDayService | string): string {
  return JOB_DAY_SERVICE_LABELS[service as JobDayService] ?? service;
}

export function jobDayLocationLines(
  move: MoveRecord,
  day: MoveJobDay,
): { origin: string; destination: string; stops?: string } {
  const locs = resolveJobDayLocations(day);
  const origin = locs.find((l) => l.role === "origin");
  const destination = locs.find((l) => l.role === "destination");
  const stops = locs.filter((l) => l.role === "stop");

  return {
    origin:
      (origin && formatJobDayLocationAddress(origin)) ||
      day.originNote?.trim() ||
      move.originAddress ||
      "Origin TBD",
    destination:
      (destination && formatJobDayLocationAddress(destination)) ||
      day.destinationNote?.trim() ||
      move.destinationAddress ||
      "Destination TBD",
    stops:
      stops.length > 0
        ? stops.map((s) => formatJobDayLocationAddress(s)).join(" · ")
        : day.stopsNote?.trim() || undefined,
  };
}

export function jobDayCrewLine(day: MoveJobDay): string | null {
  if (day.crewSummary) return day.crewSummary;
  if (day.crewSize != null) return `${day.crewSize} movers`;
  return null;
}

export function jobDayTruckLine(day: MoveJobDay): string | null {
  if (day.truckCount != null) {
    return `${day.truckCount} truck${day.truckCount === 1 ? "" : "s"}`;
  }
  return day.truckSummary?.trim() || null;
}
