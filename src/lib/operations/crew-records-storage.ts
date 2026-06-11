import { defaultCrewRecordsStore } from "./crew-records-defaults";
import { normalizeCrewIssues } from "./crew-records-normalize";
import type {
  CrewIssue,
  CrewRecordsStore,
  DriverReview,
  SkipperRating,
} from "./crew-records-types";
import { computeDriverRating } from "./driver-violations";
import { computeSkipperRating } from "./skipper-violations";

function normalizeSkipperRating(raw: SkipperRating): SkipperRating {
  const violations = raw.violations ?? [];
  return {
    ...raw,
    violations,
    rating: computeSkipperRating(violations),
  };
}

function normalizeDriverReview(raw: DriverReview): DriverReview {
  const violations = raw.violations ?? [];
  return {
    ...raw,
    violations,
    rating: computeDriverRating(violations),
  };
}

const STORAGE_KEY = "jm-crew-records-v1";

export function loadCrewRecordsStore(): CrewRecordsStore {
  if (typeof window === "undefined") return defaultCrewRecordsStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultCrewRecordsStore();
    const parsed = JSON.parse(raw) as Partial<CrewRecordsStore>;
    const defaults = defaultCrewRecordsStore();
    return {
      issues: parsed.issues?.length
        ? normalizeCrewIssues(parsed.issues as CrewIssue[])
        : defaults.issues,
      skipperRatings: parsed.skipperRatings?.length
        ? parsed.skipperRatings.map(normalizeSkipperRating)
        : defaults.skipperRatings,
      driverReviews:
        parsed.driverReviews != null
          ? parsed.driverReviews.map(normalizeDriverReview)
          : defaults.driverReviews,
    };
  } catch {
    return defaultCrewRecordsStore();
  }
}

export function saveCrewRecordsStore(store: CrewRecordsStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function generateCrewRecordId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}`;
}

export type NewCrewIssue = Omit<CrewIssue, "id" | "createdAt">;
export type NewSkipperRating = Omit<SkipperRating, "id" | "createdAt" | "rating"> & {
  rating?: number;
};
export type NewDriverReview = Omit<DriverReview, "id" | "createdAt" | "rating">;
