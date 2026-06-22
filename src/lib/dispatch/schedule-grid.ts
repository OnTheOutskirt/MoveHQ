import { DAY_SHARE_CAPACITY, fractionUnits } from "@/lib/day-share/units";
import type { DayShareFraction } from "@/lib/day-share/types";
import type { JobDayFraction } from "@/lib/moves/types";
import type { DispatchJob } from "./types";

/** Dispatch day timeline — 7:00 AM through 7:00 PM. */
export const DISPATCH_SCHEDULE_START_HOUR = 7;
export const DISPATCH_SCHEDULE_END_HOUR = 19;
export const DISPATCH_SCHEDULE_SLOT_MINUTES = 30;
export const DISPATCH_SCHEDULE_DRAG_SNAP_MINUTES = 15;

const GRID_START_MINUTES = DISPATCH_SCHEDULE_START_HOUR * 60;
const GRID_END_MINUTES = DISPATCH_SCHEDULE_END_HOUR * 60;
const GRID_SPAN_MINUTES = GRID_END_MINUTES - GRID_START_MINUTES;

/** Full-day crew block length (8:00 AM → 4:00 PM). */
export const DISPATCH_FULL_DAY_WORK_MINUTES = 8 * 60;

export type DispatchScheduleBlock = {
  startMinutes: number;
  durationMinutes: number;
  leftPercent: number;
  widthPercent: number;
};

export function dispatchScheduleHourLabels(): number[] {
  const hours: number[] = [];
  for (let h = DISPATCH_SCHEDULE_START_HOUR; h <= DISPATCH_SCHEDULE_END_HOUR; h += 1) {
    hours.push(h);
  }
  return hours;
}

export function dispatchScheduleSlotCount(): number {
  return GRID_SPAN_MINUTES / DISPATCH_SCHEDULE_SLOT_MINUTES;
}

export type DispatchScheduleTick = { percent: number; kind: "hour" | "half" };

/** Vertical grid lines — hour marks plus half-hour ticks between them. */
export function dispatchScheduleTicks(): DispatchScheduleTick[] {
  const slots = dispatchScheduleSlotCount();
  const ticks: DispatchScheduleTick[] = [];
  for (let i = 0; i <= slots; i += 1) {
    ticks.push({
      percent: (i / slots) * 100,
      kind: i % 2 === 0 ? "hour" : "half",
    });
  }
  return ticks;
}

export function minutesToSchedulePercent(minutesFromMidnight: number): number {
  return clamp(((minutesFromMidnight - GRID_START_MINUTES) / GRID_SPAN_MINUTES) * 100, 0, 100);
}

export function hourLabelPositionStyle(hour24: number): { left: string; transform?: string } {
  const percent = minutesToSchedulePercent(hour24 * 60);
  if (hour24 === DISPATCH_SCHEDULE_START_HOUR) {
    return { left: `${percent}%` };
  }
  if (hour24 === DISPATCH_SCHEDULE_END_HOUR) {
    return { left: `${percent}%`, transform: "translateX(-100%)" };
  }
  return { left: `${percent}%`, transform: "translateX(-50%)" };
}

export function formatDispatchHourLabel(hour24: number): string {
  const period = hour24 >= 12 ? "PM" : "AM";
  const h12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  if (hour24 === DISPATCH_SCHEDULE_START_HOUR || hour24 === DISPATCH_SCHEDULE_END_HOUR) {
    return `${h12} ${period}`;
  }
  return `${h12}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function parseClockToken(raw: string, fallbackPeriod?: "AM" | "PM"): number | null {
  const m = raw.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!m) return null;
  let hour = Number(m[1]);
  const minute = m[2] ? Number(m[2]) : 0;
  const period = (m[3]?.toUpperCase() as "AM" | "PM" | undefined) ?? fallbackPeriod;
  if (period === "PM" && hour < 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return hour * 60 + minute;
}

/** First time in an arrival window string, e.g. "7:45 – 8:15 AM" → 7:45. */
export function parseArrivalWindowStart(arrivalWindow: string | undefined): number | null {
  if (!arrivalWindow?.trim()) return null;
  const normalized = arrivalWindow.replace(/\s+/g, " ").trim();
  const parts = normalized.split(/[–—-]/).map((p) => p.trim());
  if (parts.length === 0) return null;

  const trailingPeriod = normalized.match(/\b(AM|PM)\b/gi);
  const fallback = trailingPeriod?.[0]?.toUpperCase() as "AM" | "PM" | undefined;

  const first = parseClockToken(parts[0]!, fallback);
  if (first != null) return first;

  return parseClockToken(normalized, fallback);
}

export function workMinutesForFraction(fraction: JobDayFraction | DayShareFraction): number {
  return Math.round((fractionUnits(fraction) / DAY_SHARE_CAPACITY) * DISPATCH_FULL_DAY_WORK_MINUTES);
}

export type ResolveScheduleBlockOptions = {
  scheduleStartOverrideMinutes?: number | null;
  /** When paired onto a morning job, start immediately after the prior block. */
  chainedAfterMinutes?: number | null;
};

export function resolveDefaultScheduleStartMinutes(job: DispatchJob): number {
  const fraction = job.dayFraction ?? (job.isFtaJob ? job.ftaBooking?.duration : "long") ?? "long";
  let startMinutes =
    parseArrivalWindowStart(job.arrivalWindow) ??
    (job.ftaBooking?.period === "afternoon" ? 11 * 60 : 8 * 60);

  if (fraction === "long" && startMinutes >= 7 * 60 + 30 && startMinutes < 8 * 60 + 30) {
    startMinutes = 8 * 60;
  }
  return startMinutes;
}

export function snapScheduleMinutes(minutes: number, durationMinutes = 0): number {
  const relative = minutes - GRID_START_MINUTES;
  const snapped =
    Math.round(relative / DISPATCH_SCHEDULE_DRAG_SNAP_MINUTES) *
      DISPATCH_SCHEDULE_DRAG_SNAP_MINUTES +
    GRID_START_MINUTES;
  const maxStart = GRID_END_MINUTES - Math.max(durationMinutes, DISPATCH_SCHEDULE_DRAG_SNAP_MINUTES);
  return clamp(snapped, GRID_START_MINUTES, maxStart);
}

export function percentToSnappedScheduleMinutes(
  percent: number,
  durationMinutes: number,
): number {
  const raw = GRID_START_MINUTES + (percent / 100) * GRID_SPAN_MINUTES;
  return snapScheduleMinutes(raw, durationMinutes);
}

export function resolveDispatchScheduleBlock(
  job: DispatchJob,
  options?: ResolveScheduleBlockOptions,
): DispatchScheduleBlock {
  const fraction = job.dayFraction ?? (job.isFtaJob ? job.ftaBooking?.duration : "long") ?? "long";
  const durationMinutes = workMinutesForFraction(fraction);

  let startMinutes: number;
  if (options?.chainedAfterMinutes != null) {
    startMinutes = options.chainedAfterMinutes;
  } else if (options?.scheduleStartOverrideMinutes != null) {
    startMinutes = snapScheduleMinutes(options.scheduleStartOverrideMinutes, durationMinutes);
  } else {
    startMinutes = resolveDefaultScheduleStartMinutes(job);
  }

  const leftPercent = minutesToSchedulePercent(startMinutes);
  const widthPercent = clamp((durationMinutes / GRID_SPAN_MINUTES) * 100, 2, 100 - leftPercent);

  return {
    startMinutes,
    durationMinutes,
    leftPercent,
    widthPercent,
  };
}

export function formatScheduleTime(minutes: number): string {
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return m === 0 ? `${h12} ${period}` : `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatDispatchBlockTimeRange(block: DispatchScheduleBlock): string {
  const end = block.startMinutes + block.durationMinutes;
  const fmt = (mins: number) => {
    const h24 = Math.floor(mins / 60);
    const m = mins % 60;
    const period = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return m === 0 ? `${h12} ${period}` : `${h12}:${String(m).padStart(2, "0")} ${period}`;
  };
  return `${fmt(block.startMinutes)} – ${fmt(end)}`;
}
