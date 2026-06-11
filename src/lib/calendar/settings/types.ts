import type { DayShareSettings } from "@/lib/day-share/types";
import type { CalendarColorPalette } from "./color-palette";

export type ClosedDaySource = "federal" | "custom";

export type ClosedDayEntry = {
  id: string;
  date: string;
  label: string;
  source: ClosedDaySource;
};

export type CalendarLocationSettings = {
  closedDays: ClosedDayEntry[];
  /** Federal holiday dates operated as booked (holiday remains in settings). */
  federalHolidayBookedDates: string[];
  colorPalette: CalendarColorPalette;
  dayShareSettings: DayShareSettings;
};

export type LocationCalendarSettingsOverride = {
  useCompanyDefault: boolean;
  settings?: CalendarLocationSettings;
};

export type CalendarSettings = {
  version: 3;
  companyDefaults: CalendarLocationSettings;
  locationOverrides: Record<string, LocationCalendarSettingsOverride>;
};

export type CalendarSettingsTab = "days-off" | "colors" | "metrics" | "day-share";
