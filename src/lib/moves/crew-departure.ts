import type { DefaultsSettings } from "@/lib/settings/types";

/** 24-hour HH:mm used in admin defaults and time inputs. */
export const FALLBACK_CREW_DEPARTURE_TIME = "07:15";

export function defaultCrewDepartureTime24(
  defaults?: Pick<DefaultsSettings, "defaultCrewDepartureTime">,
): string {
  const raw = defaults?.defaultCrewDepartureTime?.trim();
  if (raw && /^(\d{1,2}):(\d{2})$/.test(raw)) return raw;
  return FALLBACK_CREW_DEPARTURE_TIME;
}

/** Display label for crew shop departure (e.g. "7:15 AM"). */
export function formatCrewDepartureLabel(time24: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time24.trim());
  if (!match) return formatCrewDepartureLabel(FALLBACK_CREW_DEPARTURE_TIME);
  let hour = parseInt(match[1]!, 10);
  const minute = match[2]!;
  if (hour < 0 || hour > 23) return formatCrewDepartureLabel(FALLBACK_CREW_DEPARTURE_TIME);
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${period}`;
}

/** Parse display label or HH:mm to 24-hour for `<input type="time">`. */
export function parseCrewDepartureToTime24(value: string | undefined): string {
  const trimmed = value?.trim() ?? "";
  if (/^(\d{1,2}):(\d{2})$/.test(trimmed)) {
    const [h, m] = trimmed.split(":");
    return `${h!.padStart(2, "0")}:${m}`;
  }
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(trimmed);
  if (!match) return FALLBACK_CREW_DEPARTURE_TIME;
  let hour = parseInt(match[1]!, 10);
  const minute = match[2]!;
  const isPm = match[3]!.toUpperCase() === "PM";
  if (hour === 12) hour = isPm ? 12 : 0;
  else if (isPm) hour += 12;
  return `${String(hour).padStart(2, "0")}:${minute}`;
}

export function defaultCrewDepartureLabel(
  defaults?: Pick<DefaultsSettings, "defaultCrewDepartureTime">,
): string {
  return formatCrewDepartureLabel(defaultCrewDepartureTime24(defaults));
}
