import { expandPaletteToTheme } from "./color-derive";
import { defaultCalendarPalette } from "./color-palette";

/** Full calendar theme (derived from palette; used by calendar UI). */
export type CalendarColorTheme = {
  dayHealthyBg: string;
  dayHealthyBorder: string;
  dayWarningBg: string;
  dayWarningBorder: string;
  dayCriticalBg: string;
  dayCriticalBorder: string;
  dayClosedBg: string;
  dayClosedBorder: string;
  dayClosedText: string;
  dayPastBg: string;
  capacityOkText: string;
  capacityWarnText: string;
  capacityFullText: string;
  holdBg: string;
  holdText: string;
  holdBorder: string;
  holdHeaderBg: string;
  holdRowBg: string;
  holdBookedText: string;
  waitlistBg: string;
  waitlistText: string;
  waitlistBorder: string;
  waitlistHeaderBg: string;
  waitlistRowBg: string;
  ftaBg: string;
  ftaText: string;
  crewWarningBg: string;
  crewWarningText: string;
  notesIconBg: string;
  notesIconText: string;
  bookedMarkBg: string;
  bookedMarkText: string;
  resourceDepletedText: string;
  resourceMutedText: string;
  resourceNormalText: string;
  todayBadgeBg: string;
  todayBadgeText: string;
  todayRing: string;
  bookingRateText: string;
};

export function defaultCalendarColors(): CalendarColorTheme {
  return expandPaletteToTheme(defaultCalendarPalette());
}
