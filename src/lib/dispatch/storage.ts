import { emptyCrewAssignment } from "./crew-slots";
import type { DispatchJobAssignment } from "./types";

const STORAGE_KEY = "jm-dispatch-assignments-v2";

export type DispatchAssignmentStore = Record<string, DispatchJobAssignment>;

function assignmentKey(dateKey: string, jobId: string): string {
  return `${dateKey}::${jobId}`;
}

type LegacyAssignment = DispatchJobAssignment & { crewIds?: string[] };

function normalizeAssignment(raw: Partial<LegacyAssignment>): DispatchJobAssignment {
  const base = emptyCrewAssignment();
  if (raw.skipperId !== undefined || raw.driverIds || raw.moverIds) {
    return {
      skipperId: raw.skipperId ?? null,
      driverIds: raw.driverIds ?? [],
      moverIds: raw.moverIds ?? [],
      truckIds: raw.truckIds ?? [],
      dispatchNotes: raw.dispatchNotes ?? "",
      jobNote: raw.jobNote ?? "",
      crewSizeOverride: raw.crewSizeOverride ?? null,
      trucksNeededOverride: raw.trucksNeededOverride ?? null,
    };
  }
  if (raw.crewIds?.length) {
    return {
      ...base,
      moverIds: [...raw.crewIds],
      truckIds: raw.truckIds ?? [],
      dispatchNotes: raw.dispatchNotes ?? "",
      jobNote: raw.jobNote ?? "",
      crewSizeOverride: raw.crewSizeOverride ?? null,
      trucksNeededOverride: raw.trucksNeededOverride ?? null,
    };
  }
  return {
    ...base,
    truckIds: raw.truckIds ?? [],
    dispatchNotes: raw.dispatchNotes ?? "",
    jobNote: raw.jobNote ?? "",
    crewSizeOverride: raw.crewSizeOverride ?? null,
    trucksNeededOverride: raw.trucksNeededOverride ?? null,
  };
}

export function readDispatchAssignments(): DispatchAssignmentStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, LegacyAssignment>;
    const store: DispatchAssignmentStore = {};
    for (const [key, value] of Object.entries(parsed)) {
      store[key] = normalizeAssignment(value);
    }
    return store;
  } catch {
    return {};
  }
}

export function writeDispatchAssignments(store: DispatchAssignmentStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getJobAssignment(
  store: DispatchAssignmentStore,
  dateKey: string,
  jobId: string,
): DispatchJobAssignment {
  const raw = store[assignmentKey(dateKey, jobId)];
  return normalizeAssignment(raw ?? {});
}

export function setJobAssignment(
  store: DispatchAssignmentStore,
  dateKey: string,
  jobId: string,
  patch: Partial<DispatchJobAssignment>,
): DispatchAssignmentStore {
  const key = assignmentKey(dateKey, jobId);
  const current = getJobAssignment(store, dateKey, jobId);
  return {
    ...store,
    [key]: { ...current, ...patch },
  };
}
