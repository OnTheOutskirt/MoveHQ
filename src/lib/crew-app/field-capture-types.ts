import type { SkipperViolationId } from "@/lib/operations/skipper-violations";

export const FIELD_CAPTURE_CATEGORIES = [
  "claim_damage",
  "pre_existing_damage",
  "truck_condition",
  "inventory",
  "general",
] as const;

export type FieldCaptureCategory = (typeof FIELD_CAPTURE_CATEGORIES)[number];

export const FIELD_CAPTURE_CATEGORY_LABELS: Record<FieldCaptureCategory, string> = {
  claim_damage: "Claim / new damage",
  pre_existing_damage: "Pre-existing damage",
  truck_condition: "Truck condition",
  inventory: "Inventory / scope",
  general: "General documentation",
};

/** Truck-return / depot inspection items — map to skipper violations on assignee profile. */
export const TRUCK_CONDITION_VIOLATION_IDS = [
  "dirty_truck",
  "trash_in_truck",
  "pads_not_full",
  "trucks_not_fueled",
  "materials_not_put_away",
  "truck_doors_open",
  "no_truck_picture",
  "left_depot_without_supplies",
] as const satisfies readonly SkipperViolationId[];

export type TruckConditionViolationId = (typeof TRUCK_CONDITION_VIOLATION_IDS)[number];

export type FieldMediaSyncStatus = "pending" | "synced" | "failed";

export type JobFieldMediaEntry = {
  id: string;
  category: FieldCaptureCategory;
  capturedAt: string;
  capturedByCrewId: string;
  capturedByName: string;
  moveRef: string;
  /** Optional link to move record for claims routing */
  moveId?: string;
  assignedCrewId?: string;
  assignedCrewName?: string;
  violationId?: SkipperViolationId;
  truckLabel?: string;
  note?: string;
  /** Base64 data URL — demo / offline queue */
  imageDataUrl?: string;
  syncStatus: FieldMediaSyncStatus;
  skipperRatingId?: string;
  claimId?: string;
  /** @deprecated Legacy label from older captures */
  label?: string;
};

export type LegacyJobMediaEntry = {
  id: string;
  label: string;
  capturedAt: string;
};

export function isLegacyMediaEntry(
  entry: JobFieldMediaEntry | LegacyJobMediaEntry,
): entry is LegacyJobMediaEntry {
  return !("category" in entry);
}

export function normalizeJobMediaEntry(
  entry: JobFieldMediaEntry | LegacyJobMediaEntry,
  fallback: { moveRef: string; capturedByCrewId: string; capturedByName: string },
): JobFieldMediaEntry {
  if (!isLegacyMediaEntry(entry)) return entry;
  return {
    id: entry.id,
    category: "general",
    capturedAt: entry.capturedAt,
    capturedByCrewId: fallback.capturedByCrewId,
    capturedByName: fallback.capturedByName,
    moveRef: fallback.moveRef,
    label: entry.label,
    syncStatus: "synced",
  };
}

export function generateFieldMediaId(): string {
  return `fm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
