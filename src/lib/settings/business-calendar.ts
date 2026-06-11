import {
  addDays,
  parseDateKey,
  startOfDay,
  toDateKey,
} from "@/lib/calendar/date-utils";
import {
  WEEKDAY_IDS,
  WEEKDAY_LABELS,
  type WeekdayId,
} from "@/lib/operations/fleet-types";
import type { CompanySettings, WeekStartsOn } from "@/lib/settings/types";

export type { WeekStartsOn };

/** Mon–Sat — matches legacy move calendar default. */
export const DEFAULT_COMPANY_OPEN_DAYS: WeekdayId[] = [1, 2, 3, 4, 5, 6];

export const WEEK_STARTS_ON_OPTIONS: { id: WeekStartsOn; label: string }[] = [
  { id: "sunday", label: "Sunday" },
  { id: "monday", label: "Monday" },
];

export const IANA_TIMEZONE_OPTIONS = [
  { value: "America/New_York", label: "Eastern — New York" },
  { value: "America/Chicago", label: "Central — Chicago" },
  { value: "America/Denver", label: "Mountain — Denver" },
  { value: "America/Phoenix", label: "Arizona — Phoenix" },
  { value: "America/Los_Angeles", label: "Pacific — Los Angeles" },
  { value: "America/Anchorage", label: "Alaska — Anchorage" },
  { value: "Pacific/Honolulu", label: "Hawaii — Honolulu" },
  { value: "America/Toronto", label: "Eastern — Toronto" },
  { value: "America/Vancouver", label: "Pacific — Vancouver" },
  { value: "Europe/London", label: "GMT — London" },
  { value: "Europe/Paris", label: "Central European — Paris" },
  { value: "Asia/Tokyo", label: "Japan — Tokyo" },
  { value: "Australia/Sydney", label: "Australia — Sydney" },
] as const;

export function normalizeOpenDays(days: number[] | undefined): WeekdayId[] {
  const picked = (days ?? DEFAULT_COMPANY_OPEN_DAYS).filter((d): d is WeekdayId =>
    WEEKDAY_IDS.includes(d as WeekdayId),
  );
  const unique = [...new Set(picked)].sort((a, b) => a - b);
  return unique.length > 0 ? unique : [...DEFAULT_COMPANY_OPEN_DAYS];
}

export function normalizeWeekStartsOn(value: string | undefined): WeekStartsOn {
  return value === "sunday" ? "sunday" : "monday";
}

export function timezoneLabel(timeZone: string): string {
  return IANA_TIMEZONE_OPTIONS.find((tz) => tz.value === timeZone)?.label ?? timeZone;
}

export function getDateKeyInTimeZone(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

export function getTodayInTimeZone(timeZone: string): Date {
  return parseDateKey(getDateKeyInTimeZone(new Date(), timeZone));
}

export function formatInCompanyTimeZone(
  date: Date,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone }).format(date);
}

export function startOfWeek(date: Date, weekStartsOn: WeekStartsOn): Date {
  const startDay = weekStartsOn === "sunday" ? 0 : 1;
  const offset = (date.getDay() - startDay + 7) % 7;
  return addDays(startOfDay(date), -offset);
}

export function orderedOpenWeekdays(
  openDays: WeekdayId[],
  weekStartsOn: WeekStartsOn,
): WeekdayId[] {
  const startDay = weekStartsOn === "sunday" ? 0 : 1;
  const ordered: WeekdayId[] = [];
  for (let i = 0; i < 7; i++) {
    const id = ((startDay + i) % 7) as WeekdayId;
    if (openDays.includes(id)) ordered.push(id);
  }
  return ordered;
}

export function weekdayHeaderLabels(weekStartsOn: WeekStartsOn): string[] {
  const startDay = weekStartsOn === "sunday" ? 0 : 1;
  return Array.from({ length: 7 }, (_, i) => WEEKDAY_LABELS[((startDay + i) % 7) as WeekdayId]);
}

export function openDayColumnIndex(
  date: Date,
  openDays: WeekdayId[],
  weekStartsOn: WeekStartsOn,
): number {
  const weekday = date.getDay() as WeekdayId;
  return orderedOpenWeekdays(openDays, weekStartsOn).indexOf(weekday);
}

export function isCompanyOpenDay(date: Date, openDays: WeekdayId[]): boolean {
  return openDays.includes(date.getDay() as WeekdayId);
}

export function isCompanyOpenDayKey(dateKey: string, openDays: WeekdayId[]): boolean {
  return isCompanyOpenDay(parseDateKey(dateKey), openDays);
}

/**
 * Month grid for the move calendar — only includes company open days as columns.
 */
export function getMonthGridCells(
  anchor: Date,
  openDays: WeekdayId[],
  weekStartsOn: WeekStartsOn,
): (Date | null)[] {
  const columns = orderedOpenWeekdays(openDays, weekStartsOn);
  if (columns.length === 0) return [];

  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    if (!isCompanyOpenDay(date, openDays)) continue;

    if (cells.length === 0) {
      const leading = openDayColumnIndex(date, openDays, weekStartsOn);
      for (let i = 0; i < leading; i++) cells.push(null);
    }
    cells.push(date);
  }

  while (cells.length % columns.length !== 0) {
    cells.push(null);
  }

  return cells;
}

export function calendarFromCompany(company: Pick<CompanySettings, "weekStartsOn" | "openDays" | "timezone">) {
  const weekStartsOn = normalizeWeekStartsOn(company.weekStartsOn);
  const openDays = normalizeOpenDays(company.openDays);
  const timezone = company.timezone || "America/Denver";
  return {
    weekStartsOn,
    openDays,
    timezone,
    today: getTodayInTimeZone(timezone),
    columnWeekdays: orderedOpenWeekdays(openDays, weekStartsOn),
    weekHeaders: weekdayHeaderLabels(weekStartsOn),
    weekRangeLabel: weekStartsOn === "sunday" ? "Sun – Sat" : "Mon – Sun",
    startOfWeek: (date: Date) => startOfWeek(date, weekStartsOn),
    isOpenDay: (date: Date) => isCompanyOpenDay(date, openDays),
    isOpenDayKey: (dateKey: string) => isCompanyOpenDayKey(dateKey, openDays),
    getMonthGridCells: (anchor: Date) => getMonthGridCells(anchor, openDays, weekStartsOn),
  };
}
