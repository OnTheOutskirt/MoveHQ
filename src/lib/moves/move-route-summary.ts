import { formatJobDayLocationAddress } from "@/lib/moves/job-day-locations";
import type { MoveJobDay, MoveRecord } from "@/lib/moves/types";
import { getSortedJobDays } from "@/lib/moves/job-day-form";

export type JobDayRouteSegment = {
  dayId: string;
  dayLabel: string;
  date: string;
  from: string;
  to: string;
  stops: string[];
  sameAsPrevious: boolean;
};

function locLabel(
  locations: NonNullable<MoveJobDay["locations"]>,
  role: "origin" | "destination",
): string {
  const loc = locations.find((l) => l.role === role);
  if (!loc) return "—";
  return formatJobDayLocationAddress(loc) || "—";
}

function stopLabels(locations: NonNullable<MoveJobDay["locations"]>): string[] {
  return locations
    .filter((l) => l.role === "stop")
    .map((l) => {
      const addr = formatJobDayLocationAddress(l);
      return l.label ? `${l.label}: ${addr}` : addr;
    })
    .filter(Boolean);
}

export function buildJobDayRouteSegments(move: MoveRecord): JobDayRouteSegment[] {
  const days = getSortedJobDays(move);
  let prevSignature = "";

  return days.map((day) => {
    const locations = day.locations ?? [];
    const from = locLabel(locations, "origin");
    const to = locLabel(locations, "destination");
    const stops = stopLabels(locations);
    const signature = `${from}|${stops.join(";")}|${to}`;
    const sameAsPrevious = prevSignature.length > 0 && signature === prevSignature;
    prevSignature = signature;

    return {
      dayId: day.id,
      dayLabel: day.label,
      date: day.date,
      from,
      to,
      stops,
      sameAsPrevious,
    };
  });
}
