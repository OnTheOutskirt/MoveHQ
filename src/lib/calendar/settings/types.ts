import type { CalendarColorPalette } from "./color-palette";

export type ClosedDaySource = "federal" | "custom";

export type ClosedDayEntry = {
  id: string;
  date: string;
  label: string;
  source: ClosedDaySource;
};

export type CalendarSettings = {
  version: 2;
  closedDays: ClosedDayEntry[];
  /** Federal holiday dates operated as booked (holiday remains in settings). */
  federalHolidayBookedDates: string[];
  colorPalette: CalendarColorPalette;
};

export type CalendarSettingsTab = "days-off" | "colors";
