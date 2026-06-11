import type { DayShareFraction, DaySharePeriod, DayShareSlot } from "./types";

const OPPOSITE: Record<DaySharePeriod, DaySharePeriod> = {
  morning: "afternoon",
  afternoon: "morning",
};

/**
 * What open slots are still needed given one booked partial-day job.
 * Matches Google Sheets patterns: brief→2 opposite briefs, medium→brief, short→short.
 */
export function complementarySlots(
  crewSize: number,
  bookedPeriod: DaySharePeriod,
  bookedFraction: Exclude<DayShareFraction, "long">,
): DayShareSlot[] {
  const opposite = OPPOSITE[bookedPeriod];
  switch (bookedFraction) {
    case "brief":
      return [{ count: 2, crewSize, period: opposite, duration: "brief" }];
    case "medium":
      return [{ count: 1, crewSize, period: opposite, duration: "brief" }];
    case "short":
      return [{ count: 1, crewSize, period: opposite, duration: "short" }];
    default:
      return [];
  }
}
