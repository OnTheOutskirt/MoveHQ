import { EMPTY_SALES } from "../sales-metrics";
import { parseDateKey, toDateKey } from "../date-utils";
import type { CalendarDayData } from "../types";
import type { ClosedDayEntry } from "./types";

export function findClosedDay(
  date: Date | string,
  closedDays: ClosedDayEntry[],
): ClosedDayEntry | undefined {
  const key = typeof date === "string" ? date : toDateKey(date);
  return closedDays.find((e) => e.date === key);
}

export function isFederalHolidayBooked(
  dateKey: string,
  closedDays: ClosedDayEntry[],
  federalHolidayBookedDates: string[],
): boolean {
  const entry = findClosedDay(dateKey, closedDays);
  return entry?.source === "federal" && federalHolidayBookedDates.includes(dateKey);
}

export function buildClosedDay(
  date: Date,
  label: string,
  options?: { manuallyMarkedBooked?: boolean },
): CalendarDayData {
  return {
    date: toDateKey(date),
    moversBooked: 0,
    moversOnHold: 0,
    moversCapacity: 18,
    trucksBooked: 0,
    trucksOnHold: 0,
    trucksCapacity: 7,
    importantNotes: "",
    closedReason: label,
    skippersLeft: 0,
    driversLeft: 0,
    extraCabsLeft: 0,
    f150Count: 0,
    waitlistCount: 0,
    waitlist: [],
    holds: [],
    crewOff: [],
    ftas: [],
    isClosed: true,
    manuallyMarkedBooked: options?.manuallyMarkedBooked ?? false,
    sales: EMPTY_SALES,
    pipeline: [],
  };
}

export function applyClosedDays(
  day: CalendarDayData,
  closedDays: ClosedDayEntry[],
  federalHolidayBookedDates: string[] = [],
): CalendarDayData {
  const entry = findClosedDay(day.date, closedDays);
  if (!entry) {
    if (!day.isClosed) return day;
    return { ...day, isClosed: false, closedReason: undefined };
  }

  const federalBooked = isFederalHolidayBooked(day.date, closedDays, federalHolidayBookedDates);

  if (federalBooked) {
    return {
      ...day,
      manuallyMarkedBooked: true,
      isClosed: false,
      closedReason: undefined,
    };
  }

  return {
    ...buildClosedDay(parseDateKey(day.date), entry.label, {
      manuallyMarkedBooked: day.manuallyMarkedBooked,
    }),
    date: day.date,
  };
}

export function closedDayDisplayText(day: CalendarDayData): string {
  const reason = day.closedReason?.trim() || "holiday";
  return `Closed for ${reason}`;
}
