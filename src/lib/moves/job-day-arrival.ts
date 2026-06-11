import {
  formatCrewDepartureLabel,
  parseCrewDepartureToTime24,
} from "@/lib/moves/crew-departure";
import { formatJobDayLocationAddress } from "@/lib/moves/job-day-locations";
import type { JobDayLocation, MoveRecord } from "@/lib/moves/types";
import type { DefaultsSettings } from "@/lib/settings/types";
import type { WorkspaceLocation } from "@/lib/workspace/types";

export const FALLBACK_DEPOT_DRIVE_MINUTES = 45;
export const FALLBACK_ARRIVAL_WINDOW_MINUTES = 30;
export const FALLBACK_FOLLOW_ON_ARRIVAL_START = "11:00";
export const FALLBACK_FOLLOW_ON_ARRIVAL_END = "16:00";

export type JobDayArrivalDefaults = Pick<
  DefaultsSettings,
  | "defaultCustomerArrivalWindowMinutes"
  | "defaultDepotToJobDriveMinutes"
  | "defaultFollowOnArrivalStartTime"
  | "defaultFollowOnArrivalEndTime"
>;

function normalizeScheduleTime24(
  raw: string | undefined,
  fallback: string,
): string {
  if (!raw?.trim()) return fallback;
  return parseCrewDepartureToTime24(raw);
}

export function defaultFollowOnArrivalStartTime24(
  defaults?: Pick<DefaultsSettings, "defaultFollowOnArrivalStartTime">,
): string {
  return normalizeScheduleTime24(
    defaults?.defaultFollowOnArrivalStartTime,
    FALLBACK_FOLLOW_ON_ARRIVAL_START,
  );
}

export function defaultFollowOnArrivalEndTime24(
  defaults?: Pick<DefaultsSettings, "defaultFollowOnArrivalEndTime">,
): string {
  return normalizeScheduleTime24(
    defaults?.defaultFollowOnArrivalEndTime,
    FALLBACK_FOLLOW_ON_ARRIVAL_END,
  );
}

/** Customer-facing flexible window for follow-on (non-first) job days. */
export function buildFollowOnArrivalWindow(
  defaults?: Pick<
    DefaultsSettings,
    "defaultFollowOnArrivalStartTime" | "defaultFollowOnArrivalEndTime"
  >,
): string {
  const start24 = defaultFollowOnArrivalStartTime24(defaults);
  const end24 = defaultFollowOnArrivalEndTime24(defaults);
  const startMinutes = departureLabelToMinutes(formatCrewDepartureLabel(start24));
  let endMinutes = departureLabelToMinutes(formatCrewDepartureLabel(end24));
  if (endMinutes <= startMinutes) {
    endMinutes = startMinutes + 3 * 60;
  }
  const durationMinutes = endMinutes - startMinutes;
  return `${formatArrivalWindowRange(startMinutes, durationMinutes)} (crew calls ≥30 min ahead)`;
}

export function departureLabelToMinutes(label: string): number {
  const time24 = parseCrewDepartureToTime24(label);
  const [hStr, mStr] = time24.split(":");
  const h = parseInt(hStr ?? "0", 10);
  const m = parseInt(mStr ?? "0", 10);
  return h * 60 + m;
}

export function minutesToArrivalLabel(totalMinutes: number): string {
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const h24 = Math.floor(normalized / 60);
  const m = normalized % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

/** e.g. 8:00 – 8:30 AM when both times share AM/PM. */
export function formatArrivalWindowRange(
  startMinutes: number,
  windowMinutes: number,
): string {
  const endMinutes = startMinutes + windowMinutes;
  const startLabel = minutesToArrivalLabel(startMinutes);
  const endLabel = minutesToArrivalLabel(endMinutes);
  const startParts = startLabel.split(" ");
  const endParts = endLabel.split(" ");
  const startPeriod = startParts[1] ?? "AM";
  const endPeriod = endParts[1] ?? "AM";
  const startTime = startParts[0] ?? startLabel;
  const endTime = endParts[0] ?? endLabel;
  if (startPeriod === endPeriod) {
    return `${startTime} – ${endTime} ${startPeriod}`;
  }
  return `${startLabel} – ${endLabel}`;
}

export function computeMorningArrivalWindow(
  departureWindow: string,
  driveMinutes: number,
  windowMinutes: number,
): string {
  const departMinutes = departureLabelToMinutes(departureWindow);
  return formatArrivalWindowRange(departMinutes + driveMinutes, windowMinutes);
}

function zipFromText(text: string): string | null {
  const match = /\b(\d{5})(?:-\d{4})?\b/.exec(text);
  return match?.[1] ?? null;
}

function depotAddressLine(depot?: Pick<
  WorkspaceLocation,
  "addressLine1" | "city" | "state" | "zip"
>): string {
  if (!depot) return "";
  return [depot.addressLine1, depot.city, depot.state, depot.zip]
    .filter((part) => part?.trim())
    .join(", ");
}

export function jobDayOriginAddress(locations: JobDayLocation[]): string {
  const origin = locations.find((loc) => loc.role === "origin");
  if (!origin) return "";
  return formatJobDayLocationAddress(origin);
}

/**
 * Estimate depot → first origin drive time in minutes.
 * Replace with Google Maps Distance Matrix when the integration is available.
 */
export function estimateDepotToOriginDriveMinutes(input: {
  move: MoveRecord;
  locations: JobDayLocation[];
  depot?: Pick<WorkspaceLocation, "addressLine1" | "city" | "state" | "zip">;
  fallbackMinutes?: number;
}): number {
  const fallback = input.fallbackMinutes ?? FALLBACK_DEPOT_DRIVE_MINUTES;
  const origin = jobDayOriginAddress(input.locations);
  if (!origin.trim()) return fallback;

  const depot = depotAddressLine(input.depot);
  if (!depot.trim()) return fallback;

  // TODO: Google Maps Distance Matrix — depot → origin
  const originZip = zipFromText(origin);
  const depotZip = zipFromText(depot);
  if (originZip && depotZip && originZip === depotZip) {
    return Math.max(15, Math.round(fallback * 0.65));
  }
  if (input.move.moveType === "Long distance") {
    return Math.max(fallback, 75);
  }
  return fallback;
}

export function resolveArrivalWindowMinutes(
  defaults?: JobDayArrivalDefaults,
): number {
  const raw = defaults?.defaultCustomerArrivalWindowMinutes;
  if (raw === 30 || raw === 45 || raw === 60) return raw;
  return FALLBACK_ARRIVAL_WINDOW_MINUTES;
}

export function resolveDepotDriveMinutes(
  defaults?: JobDayArrivalDefaults,
): number {
  const raw = defaults?.defaultDepotToJobDriveMinutes;
  if (typeof raw === "number" && raw >= 10 && raw <= 180) return raw;
  return FALLBACK_DEPOT_DRIVE_MINUTES;
}

export function computeJobDayArrivalWindow(input: {
  isFirstJobOfDay: boolean;
  departureWindow: string;
  locations: JobDayLocation[];
  move: MoveRecord;
  depot?: Pick<WorkspaceLocation, "addressLine1" | "city" | "state" | "zip">;
  defaults?: JobDayArrivalDefaults;
}): string {
  if (!input.isFirstJobOfDay) {
    return buildFollowOnArrivalWindow(input.defaults);
  }

  const driveMinutes = estimateDepotToOriginDriveMinutes({
    move: input.move,
    locations: input.locations,
    depot: input.depot,
    fallbackMinutes: resolveDepotDriveMinutes(input.defaults),
  });
  const windowMinutes = resolveArrivalWindowMinutes(input.defaults);

  return computeMorningArrivalWindow(
    input.departureWindow,
    driveMinutes,
    windowMinutes,
  );
}

export function arrivalWindowsEquivalent(a: string, b: string): boolean {
  return a.trim().replace(/\s+/g, " ") === b.trim().replace(/\s+/g, " ");
}
