import type { ClosedDayEntry } from "./types";

/** US federal holidays commonly observed as company days off (2026). */
export const FEDERAL_HOLIDAYS_2026: Omit<ClosedDayEntry, "id">[] = [
  { date: "2026-01-01", label: "New Year's Day", source: "federal" },
  { date: "2026-01-19", label: "Martin Luther King Jr. Day", source: "federal" },
  { date: "2026-02-16", label: "Presidents' Day", source: "federal" },
  { date: "2026-05-25", label: "Memorial Day", source: "federal" },
  { date: "2026-06-19", label: "Juneteenth", source: "federal" },
  { date: "2026-07-04", label: "Independence Day", source: "federal" },
  { date: "2026-09-07", label: "Labor Day", source: "federal" },
  { date: "2026-10-12", label: "Columbus Day", source: "federal" },
  { date: "2026-11-11", label: "Veterans Day", source: "federal" },
  { date: "2026-11-26", label: "Thanksgiving", source: "federal" },
  { date: "2026-12-25", label: "Christmas", source: "federal" },
];

export function federalHolidays2026WithIds(): ClosedDayEntry[] {
  return FEDERAL_HOLIDAYS_2026.map((h) => ({
    ...h,
    id: `federal-${h.date}`,
  }));
}

/**
 * Re-insert default federal holidays that were removed from saved settings,
 * except dates the user explicitly deleted (`removedFederalDates`).
 */
export function mergeFederalHolidays(
  closedDays: ClosedDayEntry[],
  removedFederalDates: string[] = [],
): ClosedDayEntry[] {
  const defaults = federalHolidays2026WithIds();
  const existingDates = new Set(closedDays.map((d) => d.date));
  const removed = new Set(removedFederalDates);
  const missing = defaults.filter((h) => !existingDates.has(h.date) && !removed.has(h.date));
  if (missing.length === 0) return closedDays;
  return [...closedDays, ...missing].sort((a, b) => a.date.localeCompare(b.date));
}
