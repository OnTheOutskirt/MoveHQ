import { MEETING_NOTES_DEFAULT_DONE_IDS } from "./meeting-notes";

const STORAGE_KEY = "movehq-planning-progress-v1";

export type ProgressMap = Record<string, boolean>;

/** IDs that count as done when not explicitly set in storage (e.g. already shipped). */
export const PLANNING_DEFAULT_DONE_IDS: readonly string[] = MEETING_NOTES_DEFAULT_DONE_IDS;

export function mergePlanningProgress(stored: ProgressMap): ProgressMap {
  const merged = { ...stored };
  for (const id of PLANNING_DEFAULT_DONE_IDS) {
    if (!(id in stored)) merged[id] = true;
  }
  return merged;
}

export function readProgress(): ProgressMap {
  if (typeof window === "undefined") return mergePlanningProgress({});
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return mergePlanningProgress({});
    return mergePlanningProgress(JSON.parse(raw) as ProgressMap);
  } catch {
    return mergePlanningProgress({});
  }
}

export function writeProgress(map: ProgressMap): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function setItemProgress(id: string, done: boolean): ProgressMap {
  const next = { ...readProgress(), [id]: done };
  writeProgress(next);
  return next;
}

export function countProgress(itemIds: string[], map: ProgressMap): { done: number; total: number } {
  const total = itemIds.length;
  const done = itemIds.filter((id) => map[id]).length;
  return { done, total };
}
