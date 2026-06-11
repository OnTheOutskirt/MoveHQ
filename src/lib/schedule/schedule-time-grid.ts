import { addDays } from "@/lib/calendar/date-utils";
import type { WeekdayId } from "@/lib/operations/fleet-types";

/** Pixels per hour in the week time grid. */
export const SCHEDULE_HOUR_HEIGHT_PX = 48;

/** Grid line interval (minutes). */
export const SCHEDULE_SLOT_MINUTES = 30;

/** Initial vertical scroll position on load / week change. */
export const SCHEDULE_SCROLL_TO_HOUR = 6;

export const SCHEDULE_TOTAL_HOURS = 24;

export function scheduleGridHeightPx(): number {
  return SCHEDULE_TOTAL_HOURS * SCHEDULE_HOUR_HEIGHT_PX;
}

export function scheduleMinutesToPx(minutes: number): number {
  return (minutes / 60) * SCHEDULE_HOUR_HEIGHT_PX;
}

export function scheduleScrollTopPx(hour = SCHEDULE_SCROLL_TO_HOUR): number {
  return hour * SCHEDULE_HOUR_HEIGHT_PX;
}

export function scheduleSlotCount(): number {
  return (SCHEDULE_TOTAL_HOURS * 60) / SCHEDULE_SLOT_MINUTES;
}

/** Dates in [weekStart, weekStart + 6] that match location office open days. */
export function openDatesInWeek(weekStart: Date, openDays: WeekdayId[]): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i += 1) {
    const date = addDays(weekStart, i);
    if (openDays.includes(date.getDay() as WeekdayId)) {
      days.push(date);
    }
  }
  return days;
}

export function formatScheduleHourLabel(hour24: number): string {
  const period = hour24 >= 12 ? "PM" : "AM";
  const h12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${h12} ${period}`;
}
