import type { CalendarMetricDisplayType } from "./types";

export const PRIMARY_METRIC_DISPLAY_TYPES: CalendarMetricDisplayType[] = [
  "booked_available",
  "remaining",
  "booked_only",
];

export const SECONDARY_METRIC_DISPLAY_TYPES: CalendarMetricDisplayType[] = [
  "remaining",
  "booked_only",
];

export function displayOptionsForSlot(primary: boolean): { id: CalendarMetricDisplayType; label: string }[] {
  const types = primary ? PRIMARY_METRIC_DISPLAY_TYPES : SECONDARY_METRIC_DISPLAY_TYPES;
  return types.map((id) => ({
    id,
    label:
      id === "booked_available"
        ? "Booked / Available"
        : id === "remaining"
          ? "Remaining"
          : "Booked only",
  }));
}

export function normalizeMetricDisplayType(
  displayType: CalendarMetricDisplayType | undefined,
  primary: boolean,
): CalendarMetricDisplayType {
  const allowed = primary ? PRIMARY_METRIC_DISPLAY_TYPES : SECONDARY_METRIC_DISPLAY_TYPES;
  if ((displayType as string | undefined) === "available_only") return "remaining";
  if (displayType && allowed.includes(displayType)) return displayType;
  return primary ? "booked_available" : "remaining";
}
