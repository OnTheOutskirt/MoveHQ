import { addDays, parseDateKey, toDateKey } from "@/lib/calendar/date-utils";
import {
  DEFAULT_COMPANY_OPEN_DAYS,
  isCompanyOpenDayKey,
  startOfWeek,
} from "@/lib/settings/business-calendar";
import type { WeekStartsOn } from "@/lib/settings/types";
import type { TimeCategoryHours, TimeEntry, TipEntry } from "./types";

export function weekdayHeadersForWeek(weekStartsOn: WeekStartsOn): string[] {
  const startDay = weekStartsOn === "sunday" ? 0 : 1;
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return Array.from({ length: 7 }, (_, i) => labels[(startDay + i) % 7]!);
}

/** @deprecated Use weekdayHeadersForWeek(weekStartsOn) */
export const WEEKDAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function totalHoursFromCategories(categories: TimeCategoryHours): number {
  const total =
    categories.move + categories.drive + categories.extra + categories.office;
  return Math.round(total * 100) / 100;
}

/** @deprecated Use totalHoursFromCategories */
export const billableHoursFromCategories = totalHoursFromCategories;

export function normalizeCategories(raw: Partial<TimeCategoryHours> | undefined): TimeCategoryHours {
  const move = roundQuarter(raw?.move ?? 0);
  const drive = roundQuarter(raw?.drive ?? 0);
  const extra = roundQuarter(raw?.extra ?? 0);
  const office = roundQuarter(raw?.office ?? 0);
  const breakH = roundQuarter(raw?.break ?? 0);
  return { move, drive, extra, office, break: breakH };
}

export function normalizeTimeEntry(entry: TimeEntry): TimeEntry {
  const categories = normalizeCategories(entry.categories);
  return {
    ...entry,
    categories,
    hours: totalHoursFromCategories(categories),
  };
}

function roundQuarter(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100) / 100;
}

export function weekDayKeys(weekStart: Date): string[] {
  return Array.from({ length: 7 }, (_, i) => toDateKey(addDays(weekStart, i)));
}

export function entriesForWeek(entries: TimeEntry[], weekStart: Date): TimeEntry[] {
  const keys = new Set(weekDayKeys(weekStart));
  return entries.filter((e) => keys.has(e.date));
}

export function entriesForPersonDate(
  entries: TimeEntry[],
  personId: string,
  date: string,
): TimeEntry[] {
  return entries.filter((e) => e.personId === personId && e.date === date);
}

export function dailyHoursTotal(dayEntries: TimeEntry[]): number {
  return roundQuarter(dayEntries.reduce((sum, e) => sum + e.hours, 0));
}

export function weeklyHoursTotal(weekEntries: TimeEntry[]): number {
  return roundQuarter(weekEntries.reduce((sum, e) => sum + e.hours, 0));
}

export function uniquePeopleInEntries(
  entries: TimeEntry[],
): { personId: string; personName: string; workerType: TimeEntry["workerType"]; roleLabel: string }[] {
  const map = new Map<
    string,
    { personId: string; personName: string; workerType: TimeEntry["workerType"]; roleLabel: string }
  >();
  for (const e of entries) {
    if (!map.has(e.personId)) {
      map.set(e.personId, {
        personId: e.personId,
        personName: e.personName,
        workerType: e.workerType,
        roleLabel: e.roleLabel,
      });
    }
  }
  return [...map.values()].sort((a, b) => a.personName.localeCompare(b.personName));
}

export function buildCurrentPayPeriods(
  today = new Date(),
  weekStartsOn: WeekStartsOn = "sunday",
) {
  const weekStart = startOfWeek(today, weekStartsOn);
  const weekEnd = addDays(weekStart, 6);
  const prevStart = addDays(weekStart, -7);
  const prevEnd = addDays(weekStart, -1);

  return [
    {
      id: "pp-current",
      label: `Current week (${formatShortRange(weekStart, weekEnd)})`,
      start: toDateKey(weekStart),
      end: toDateKey(weekEnd),
    },
    {
      id: "pp-prev",
      label: `Previous week (${formatShortRange(prevStart, prevEnd)})`,
      start: toDateKey(prevStart),
      end: toDateKey(prevEnd),
    },
  ];
}

function formatShortRange(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`;
}

export function formatHoursShort(hours: number): string {
  if (hours <= 0) return "—";
  return hours.toFixed(hours % 1 === 0 ? 0 : 1);
}

export function isTodayKey(dateKey: string, today: Date = new Date()): boolean {
  return dateKey === toDateKey(today);
}

export function tipsForWeek(tips: TipEntry[], weekStart: Date) {
  const keys = new Set(weekDayKeys(weekStart));
  return tips.filter((t) => keys.has(t.date));
}

export function tipsForPersonDate(tips: TipEntry[], personId: string, date: string) {
  return tips.filter((t) => t.personId === personId && t.date === date);
}

export function dailyTipsTotal(dayTips: TipEntry[]): number {
  return roundQuarter(dayTips.reduce((sum, t) => sum + t.amount, 0));
}

export function weeklyTipsTotal(weekTips: TipEntry[]): number {
  return roundQuarter(weekTips.reduce((sum, t) => sum + t.amount, 0));
}

export function uniquePeopleInTips(
  tips: TipEntry[],
): { personId: string; personName: string }[] {
  const map = new Map<string, { personId: string; personName: string }>();
  for (const t of tips) {
    if (!map.has(t.personId)) {
      map.set(t.personId, { personId: t.personId, personName: t.personName });
    }
  }
  return [...map.values()].sort((a, b) => a.personName.localeCompare(b.personName));
}

export function formatTipAmount(amount: number): string {
  if (amount <= 0) return "—";
  return `$${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
}

export function sumCategories(entries: TimeEntry[]): TimeCategoryHours {
  return entries.reduce(
    (acc, e) => ({
      move: roundQuarter(acc.move + e.categories.move),
      drive: roundQuarter(acc.drive + e.categories.drive),
      extra: roundQuarter(acc.extra + e.categories.extra),
      office: roundQuarter(acc.office + e.categories.office),
      break: roundQuarter(acc.break + e.categories.break),
    }),
    { move: 0, drive: 0, extra: 0, office: 0, break: 0 },
  );
}
