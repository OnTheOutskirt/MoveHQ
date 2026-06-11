import {
  DEFAULT_PRIMARY_GOOGLE_REVIEW_URL,
  DEFAULT_PRIMARY_LOCATION_ID,
  LEGACY_LOCATION_IDS,
} from "./constants";
import { defaultWorkspaceConfig } from "./defaults";
import { mergeLocationWithDefaults } from "./location-profile";
import { normalizeWorkspaceCalendarConfig } from "@/lib/calendar/metrics/normalize";
import type { WorkspaceConfig, WorkspaceLocation } from "./types";

const STORAGE_KEY = "jm-workspace-v1";

function normalizeLocation(raw: unknown, companyId: string): WorkspaceLocation | null {
  if (!raw || typeof raw !== "object") return null;
  const l = raw as Partial<WorkspaceLocation>;
  if (!l.id || typeof l.id !== "string") return null;
  return mergeLocationWithDefaults(l, companyId);
}

function stripLegacyBranches(locations: WorkspaceLocation[]): WorkspaceLocation[] {
  return locations.filter((l) => l.id !== "loc-woodlands");
}

/** Persisted configs may have an empty review URL that overwrote seeded defaults. */
function backfillPrimaryGoogleReviewUrl(
  locations: WorkspaceLocation[],
): WorkspaceLocation[] {
  const seed =
    defaultWorkspaceConfig().locations.find((l) => l.isPrimary)?.googleReviewUrl?.trim() ||
    DEFAULT_PRIMARY_GOOGLE_REVIEW_URL;
  if (!seed) return locations;

  return locations.map((location) => {
    if (location.googleReviewUrl?.trim()) return location;
    if (!location.isPrimary) return location;
    return { ...location, googleReviewUrl: seed };
  });
}

export function loadWorkspaceConfig(): WorkspaceConfig {
  const defaults = defaultWorkspaceConfig();
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<WorkspaceConfig>;
    const company = {
      ...defaults.company,
      ...(parsed.company ?? {}),
      id: parsed.company?.id ?? defaults.company.id,
      name: parsed.company?.name?.trim() || defaults.company.name,
      legalName: parsed.company?.legalName?.trim() || defaults.company.legalName,
      website: parsed.company?.website?.trim() || defaults.company.website,
    };
    const companyId = company.id;
    let locations = Array.isArray(parsed.locations)
      ? parsed.locations
          .map((l) => normalizeLocation(l, companyId))
          .filter((l): l is WorkspaceLocation => l != null)
      : [];

    locations = stripLegacyBranches(locations);
    locations = backfillPrimaryGoogleReviewUrl(locations);

    if (locations.length === 0) return defaults;

    const calendar = normalizeWorkspaceCalendarConfig(parsed.calendar);

    const hasPrimary = locations.some((l) => l.isPrimary);
    if (!hasPrimary) {
      locations = locations.map((l, i) => ({ ...l, isPrimary: i === 0 }));
    }

    if (locations.length === 1) {
      const only = locations[0];
      const merged = mergeLocationWithDefaults(
        {
          ...defaults.locations[0],
          ...only,
          id: DEFAULT_PRIMARY_LOCATION_ID,
          googleReviewUrl:
            only.googleReviewUrl?.trim() || defaults.locations[0].googleReviewUrl,
        },
        companyId,
      );
      return {
        company,
        locations: [{ ...merged, isPrimary: true }],
        calendar,
      };
    }

    return {
      company,
      locations,
      calendar,
    };
  } catch {
    return defaults;
  }
}

export function saveWorkspaceConfig(config: WorkspaceConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function workspaceSnapshot(config: WorkspaceConfig): string {
  return JSON.stringify(config);
}

/** Remap deprecated branch ids on moves and related records. */
export function normalizeLocationId(locationId: string | undefined): string {
  if (!locationId || LEGACY_LOCATION_IDS.includes(locationId as (typeof LEGACY_LOCATION_IDS)[number])) {
    return defaultWorkspaceConfig().locations[0].id;
  }
  if (locationId === "loc-woodlands") {
    return defaultWorkspaceConfig().locations[0].id;
  }
  return locationId;
}
