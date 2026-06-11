import { calendarFromCompany } from "@/lib/settings/business-calendar";
import {
  normalizeOpenDays,
  normalizeWeekStartsOn,
} from "@/lib/settings/business-calendar";
import type { WeekdayId } from "@/lib/operations/fleet-types";
import type { WorkspaceLocation } from "./types";

/** Office scheduling days (Mon–Fri for Jonah). */
export const DEFAULT_OFFICE_OPEN_DAYS: WeekdayId[] = [1, 2, 3, 4, 5];

/** Crew / move calendar days (often includes Saturday). */
export const DEFAULT_CREW_WORKING_DAYS: WeekdayId[] = [1, 2, 3, 4, 5, 6];

export function defaultLocationBusinessFields(): Pick<
  WorkspaceLocation,
  | "website"
  | "googleReviewUrl"
  | "officeHoursStart"
  | "officeHoursEnd"
  | "officeOpenDays"
  | "crewWorkingDays"
  | "weekStartsOn"
> {
  return {
    website: "",
    googleReviewUrl: "",
    officeHoursStart: "08:00",
    officeHoursEnd: "17:00",
    officeOpenDays: [...DEFAULT_OFFICE_OPEN_DAYS],
    crewWorkingDays: [...DEFAULT_CREW_WORKING_DAYS],
    weekStartsOn: "monday",
  };
}

export function mergeLocationWithDefaults(
  raw: Partial<WorkspaceLocation>,
  companyId: string,
): WorkspaceLocation {
  const defaults = defaultLocationBusinessFields();
  return {
    id: raw.id ?? "loc-unknown",
    companyId,
    name: raw.name?.trim() || "Location",
    shortName: raw.shortName?.trim() || "",
    status:
      raw.status === "active" || raw.status === "planned" || raw.status === "inactive"
        ? raw.status
        : "active",
    isPrimary: Boolean(raw.isPrimary),
    addressLine1: raw.addressLine1 ?? "",
    city: raw.city ?? "",
    state: raw.state ?? "",
    zip: raw.zip ?? "",
    timezone: raw.timezone ?? "America/Chicago",
    phone: raw.phone ?? "",
    email: raw.email ?? "",
    website: raw.website ?? defaults.website,
    googleReviewUrl: raw.googleReviewUrl?.trim() ?? defaults.googleReviewUrl,
    quoteReferencePrefix: raw.quoteReferencePrefix ?? "JM",
    serviceAreaNotes: raw.serviceAreaNotes ?? "",
    officeHoursStart: raw.officeHoursStart ?? defaults.officeHoursStart,
    officeHoursEnd: raw.officeHoursEnd ?? defaults.officeHoursEnd,
    officeOpenDays: normalizeOpenDays(
      raw.officeOpenDays?.length ? raw.officeOpenDays : DEFAULT_OFFICE_OPEN_DAYS,
    ),
    crewWorkingDays: normalizeOpenDays(
      raw.crewWorkingDays?.length ? raw.crewWorkingDays : DEFAULT_CREW_WORKING_DAYS,
    ),
    weekStartsOn: normalizeWeekStartsOn(raw.weekStartsOn),
  };
}

/** Move calendar uses crew working days; office hours are for customer-facing scheduling. */
export function calendarFromLocation(location: WorkspaceLocation) {
  return calendarFromCompany({
    weekStartsOn: location.weekStartsOn,
    openDays: location.crewWorkingDays,
    timezone: location.timezone,
  });
}

export function officeOpenDaysFromLegacyOpenDays(days: WeekdayId[] | undefined): WeekdayId[] {
  return normalizeOpenDays(days ?? DEFAULT_OFFICE_OPEN_DAYS);
}

/** Resolve the Google review link for a branch (falls back to primary location). */
export function googleReviewUrlForLocation(
  locations: WorkspaceLocation[],
  locationId?: string,
): string {
  if (!locations.length) return "";
  const normalizedId = locationId?.trim();
  const match =
    (normalizedId ? locations.find((l) => l.id === normalizedId) : null) ??
    locations.find((l) => l.isPrimary) ??
    locations[0];
  return match?.googleReviewUrl?.trim() ?? "";
}
