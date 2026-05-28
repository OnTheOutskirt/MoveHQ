import { defaultCalendarPalette, mergeCalendarPalette } from "./color-palette";
import { federalHolidays2026WithIds, mergeFederalHolidays } from "./federal-holidays-2026";
import type { CalendarSettings } from "./types";

const CALENDAR_SETTINGS_KEY = "jm-calendar-settings";

export function defaultCalendarSettings(): CalendarSettings {
  return {
    version: 2,
    closedDays: federalHolidays2026WithIds(),
    federalHolidayBookedDates: [],
    colorPalette: defaultCalendarPalette(),
  };
}

export function loadCalendarSettings(): CalendarSettings {
  if (typeof window === "undefined") return defaultCalendarSettings();
  try {
    const raw = localStorage.getItem(CALENDAR_SETTINGS_KEY);
    if (!raw) return defaultCalendarSettings();
    const parsed = JSON.parse(raw) as Partial<CalendarSettings> & {
      version?: number;
      colors?: unknown;
    };
    const defaults = defaultCalendarSettings();
    const closedDays = mergeFederalHolidays(
      parsed.closedDays?.length ? parsed.closedDays : defaults.closedDays,
    );
    const colorPalette =
      parsed.version === 2 && parsed.colorPalette
        ? mergeCalendarPalette(parsed.colorPalette)
        : defaults.colorPalette;

    return {
      version: 2,
      closedDays,
      federalHolidayBookedDates: parsed.federalHolidayBookedDates ?? [],
      colorPalette,
    };
  } catch {
    return defaultCalendarSettings();
  }
}

export function saveCalendarSettings(settings: CalendarSettings): void {
  localStorage.setItem(CALENDAR_SETTINGS_KEY, JSON.stringify(settings));
}

export function generateClosedDayId(): string {
  return `closed-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
