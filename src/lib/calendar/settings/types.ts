import type { DayShareSettings } from "@/lib/day-share/types";
import type { CalendarColorPalette } from "./color-palette";

export type ClosedDaySource = "federal" | "custom";

export type ClosedDayEntry = {
  id: string;
  date: string;
  label: string;
  source: ClosedDaySource;
  /** When false, the closure is saved but turned off (the day stays open). Defaults to on. */
  enabled?: boolean;
};

export type CalendarLocationSettings = {
  closedDays: ClosedDayEntry[];
  /** Federal holiday dates operated as booked (holiday remains in settings). */
  federalHolidayBookedDates: string[];
  /** Federal holiday dates the user deleted — kept out of the auto-merge so they stay deleted. */
  removedFederalDates: string[];
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
