import type { FtaDuration, FtaPeriod, FtaSlot } from "@/lib/calendar/types";
import type { DispatchJob } from "./types";
import { formatFtaSlot } from "@/lib/calendar/fta";
import { defaultDayShareSettings } from "@/lib/day-share/settings-defaults";
import { DAY_SHARE_COMBINATION_HINT, fractionUnits } from "@/lib/day-share/units";
import type { DayShareFraction } from "@/lib/day-share/types";

/** Day fraction for partial-day bookings. */
export const FTA_DAY_FRACTIONS = ["brief", "short", "medium", "long"] as const;
export type FtaDayFraction = (typeof FTA_DAY_FRACTIONS)[number];

export type DispatchFtaBooking = {
  crewSize: number;
  period: FtaPeriod;
  /** Morning jobs use a set start (e.g. 8:00 AM). Afternoon = flexible start. */
  morningStartTime: string | null;
  duration: FtaDayFraction;
};

const settings = defaultDayShareSettings();

export const FTA_FRACTION_LABELS: Record<FtaDayFraction, string> = settings.fractionLabels;

export const FTA_COMBINATION_RULES = DAY_SHARE_COMBINATION_HINT;

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
    crewSize: booking.crewSize,
    period: booking.period,
    duration: legacyDuration,
  });
}

/** Parse calendar pill like (1)2As into a booking when possible. */
export function parseFtaLabel(label: string | null | undefined): DispatchFtaBooking | null {
  if (!label) return null;
  const m = label.match(/^\(\d+\)(\d+)([MA])([bsm])$/i);
  if (!m) return null;
  const crewSize = Number(m[2]);
  const period = m[3]!.toUpperCase() === "M" ? "morning" : "afternoon";
  const durChar = m[4]!.toLowerCase();
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

/** Partial-day afternoon (PM) jobs — styled distinctly on the dispatch schedule. */
export function isAfternoonDispatchJob(job: Pick<DispatchJob, "ftaBooking">): boolean {
  return job.ftaBooking?.period === "afternoon";
}

export { fractionUnits } from "@/lib/day-share/units";
export type { DayShareFraction };
