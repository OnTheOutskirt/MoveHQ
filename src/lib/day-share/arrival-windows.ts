import { buildFollowOnArrivalWindow } from "@/lib/moves/job-day-arrival";
import type { DaySharePeriod } from "./types";

/** First job of the day — tight ~30 min morning window. */
export const FIRST_JOB_ARRIVAL_WINDOW = "7:45 – 8:15 AM";

/** Later-in-day / afternoon flexible window with crew heads-up (default times). */
export const FLEXIBLE_ARRIVAL_WINDOW = buildFollowOnArrivalWindow();

export function defaultArrivalWindowForPeriod(period: DaySharePeriod): string {
  return period === "morning" ? FIRST_JOB_ARRIVAL_WINDOW : FLEXIBLE_ARRIVAL_WINDOW;
}

export const ARRIVAL_WINDOW_PRESETS = [
  {
    id: "morning",
    label: "Morning (first job)",
    value: FIRST_JOB_ARRIVAL_WINDOW,
  },
  {
    id: "afternoon",
    label: "Afternoon (flexible)",
    value: FLEXIBLE_ARRIVAL_WINDOW,
  },
] as const;

export const ARRIVAL_WINDOW_PRESET_VALUES: string[] = ARRIVAL_WINDOW_PRESETS.map(
  (p) => p.value,
);

export function isArrivalWindowPreset(value: string | undefined): boolean {
  if (!value?.trim()) return false;
  return ARRIVAL_WINDOW_PRESET_VALUES.includes(value.trim());
}

export function resolveJobDayArrivalWindow(input: {
  arrivalWindow?: string;
  dayPeriod?: DaySharePeriod | null;
  isFirstJobOfDay?: boolean;
  followOnDefaults?: Parameters<typeof buildFollowOnArrivalWindow>[0];
}): string | undefined {
  if (input.arrivalWindow?.trim()) return input.arrivalWindow.trim();
  if (input.isFirstJobOfDay === false) {
    return buildFollowOnArrivalWindow(input.followOnDefaults);
  }
  if (input.isFirstJobOfDay === true) return FIRST_JOB_ARRIVAL_WINDOW;
  if (input.dayPeriod) return defaultArrivalWindowForPeriod(input.dayPeriod);
  return undefined;
}
