import { defaultCrewRecordsStore } from "./crew-records-defaults";
import type { CrewIssue, CrewRecordsStore, SkipperRating } from "./crew-records-types";

const STORAGE_KEY = "jm-crew-records-v1";

export function loadCrewRecordsStore(): CrewRecordsStore {
  if (typeof window === "undefined") return defaultCrewRecordsStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultCrewRecordsStore();
    const parsed = JSON.parse(raw) as Partial<CrewRecordsStore>;
    const defaults = defaultCrewRecordsStore();
    return {
      issues: parsed.issues?.length ? parsed.issues : defaults.issues,
      skipperRatings: parsed.skipperRatings?.length
        ? parsed.skipperRatings
        : defaults.skipperRatings,
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
export type NewSkipperRating = Omit<SkipperRating, "id" | "createdAt">;
