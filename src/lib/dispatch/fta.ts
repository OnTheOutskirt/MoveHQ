import type { FtaDuration, FtaPeriod, FtaSlot } from "@/lib/calendar/types";
import { formatFtaSlot } from "@/lib/calendar/fta";

/** Day fraction for FTA bookings. */
export const FTA_DAY_FRACTIONS = ["brief", "short", "medium", "long"] as const;
export type FtaDayFraction = (typeof FTA_DAY_FRACTIONS)[number];

export type DispatchFtaBooking = {
  crewSize: number;
  period: FtaPeriod;
  /** Morning jobs use a set start (e.g. 8:00 AM). Afternoon = flexible start. */
  morningStartTime: string | null;
  duration: FtaDayFraction;
};

export const FTA_FRACTION_LABELS: Record<FtaDayFraction, string> = {
  brief: "Brief (⅓ day)",
  short: "Short (½ day)",
  medium: "Medium (⅔ day)",
  long: "Long (full day)",
};

export const FTA_COMBINATION_RULES =
  "One long · or brief + medium · or 2 shorts · or 3 briefs — fills a crew-day";

/** Map legacy calendar duration to dispatch fractions (medium → ⅔ day; add long separately). */
export function calendarDurationToFraction(
  duration: FtaDuration,
): Exclude<FtaDayFraction, "long"> {
  return duration;
}

export function ftaBookingFromCalendarSlot(slot: FtaSlot): DispatchFtaBooking {
  return {
    crewSize: slot.crewSize,
    period: slot.period,
    morningStartTime: slot.period === "morning" ? "8:00 AM" : null,
    duration: calendarDurationToFraction(slot.duration),
  };
}

export function formatFtaBooking(booking: DispatchFtaBooking): string {
  const start =
    booking.period === "morning"
      ? `Morning · start ${booking.morningStartTime ?? "8:00 AM"}`
      : "Afternoon · flexible start";
  return `${booking.crewSize}-person · ${start} · ${FTA_FRACTION_LABELS[booking.duration]}`;
}

export function ftaBookingCode(booking: DispatchFtaBooking): string {
  const legacyDuration =
    booking.duration === "long" ? "medium" : (booking.duration as FtaDuration);
  return formatFtaSlot({
    count: 1,
    crewSize: booking.crewSize as 2 | 3,
    period: booking.period,
    duration: legacyDuration,
  });
}

/** Parse calendar pill like (1)2As into a booking when possible. */
export function parseFtaLabel(label: string | null | undefined): DispatchFtaBooking | null {
  if (!label) return null;
  const m = label.match(/^\(\d+\)(\d)([MA])([bsm])$/i);
  if (!m) return null;
  const crewSize = Number(m[1]) as 2 | 3;
  const period = m[2]!.toUpperCase() === "M" ? "morning" : "afternoon";
  const durChar = m[3]!.toLowerCase();
  const durationMap: Record<string, FtaDayFraction> = {
    b: "brief",
    s: "short",
    m: "medium",
  };
  const duration = durationMap[durChar];
  if (!duration) return null;
  return {
    crewSize,
    period,
    morningStartTime: period === "morning" ? "8:00 AM" : null,
    duration,
  };
}

export function fractionUnits(duration: FtaDayFraction): number {
  switch (duration) {
    case "brief":
      return 1;
    case "short":
      return 2;
    case "medium":
      return 2;
    case "long":
      return 3;
  }
}
