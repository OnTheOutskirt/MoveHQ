import type { CrewAppJob } from "./types";
import { materialDayKey } from "./shop-materials";

export type TodayPendingLoadItem = {
  key: string;
  label: string;
  qtyLabel: string;
  detail?: string;
};

export type LoadChecklistItem = TodayPendingLoadItem & {
  checked: boolean;
};

const STORAGE_KEY = "jm-crew-load-checklist-v1";

type LoadChecklistStore = {
  /** Legacy day keys — ignored; job-level is source of truth */
  day?: Record<string, string[]>;
  job: Record<string, string[]>;
};

function emptyStore(): LoadChecklistStore {
  return { job: {} };
}

function readStore(): LoadChecklistStore {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as LoadChecklistStore;
    return { job: parsed.job ?? {} };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: LoadChecklistStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function jobScopeKey(crewId: string, jobId: string): string {
  return `${crewId}|job|${jobId}`;
}

export function readJobLoadChecked(crewId: string, jobId: string): Set<string> {
  const store = readStore();
  return new Set(store.job[jobScopeKey(crewId, jobId)] ?? []);
}

/** Pending aggregate lines for Today — qty reflects only unchecked job materials. */
export function buildTodayPendingLoadItems(
  jobs: CrewAppJob[],
  crewId: string,
): TodayPendingLoadItem[] {
  const byLabel = new Map<
    string,
    { label: string; unit: string; remainingQty: number; parts: string[] }
  >();

  for (const job of jobs) {
    const checked = readJobLoadChecked(crewId, job.id);
    for (const mat of job.shopMaterials) {
      if (checked.has(mat.id)) continue;
      const key = materialDayKey(mat.label);
      const existing = byLabel.get(key);
      if (existing) {
        existing.remainingQty += mat.qty;
        existing.parts.push(`${job.moveRef}: ${mat.qty}`);
      } else {
        byLabel.set(key, {
          label: mat.label,
          unit: mat.unit ?? "ea",
          remainingQty: mat.qty,
          parts: [`${job.moveRef}: ${mat.qty}`],
        });
      }
    }
  }

  return [...byLabel.entries()]
    .sort(([, a], [, b]) => a.label.localeCompare(b.label))
    .map(([key, value]) => ({
      key,
      label: value.label,
      qtyLabel: `${value.remainingQty} ${value.unit}`,
      detail: value.parts.length > 1 ? value.parts.join(" · ") : undefined,
    }));
}

export function countTodayLoadMaterialTypes(jobs: CrewAppJob[]): number {
  const keys = new Set<string>();
  for (const job of jobs) {
    for (const mat of job.shopMaterials) {
      keys.add(materialDayKey(mat.label));
    }
  }
  return keys.size;
}

export function isJobLoadComplete(job: CrewAppJob, crewId: string): boolean {
  if (job.shopMaterials.length === 0) return true;
  const checked = readJobLoadChecked(crewId, job.id);
  return job.shopMaterials.every((m) => checked.has(m.id));
}

export function isTodayLoadComplete(jobs: CrewAppJob[], crewId: string): boolean {
  if (jobs.every((j) => j.shopMaterials.length === 0)) return true;
  return buildTodayPendingLoadItems(jobs, crewId).length === 0;
}

/** Check material on Today — marks that item loaded on every job that needs it. */
export function checkDayLoadMaterial(
  crewId: string,
  materialKey: string,
  jobs: CrewAppJob[],
): void {
  const store = readStore();
  for (const job of jobs) {
    for (const mat of job.shopMaterials) {
      if (materialDayKey(mat.label) !== materialKey) continue;
      const scope = jobScopeKey(crewId, job.id);
      const current = new Set(store.job[scope] ?? []);
      current.add(mat.id);
      store.job[scope] = [...current];
    }
  }
  writeStore(store);
}

export function checkJobLoadItem(crewId: string, jobId: string, materialId: string): void {
  const store = readStore();
  const scope = jobScopeKey(crewId, jobId);
  const current = new Set(store.job[scope] ?? []);
  current.add(materialId);
  store.job[scope] = [...current];
  writeStore(store);
}

/** Uncheck material on Today — clears that item on every job that needs it. */
export function uncheckDayLoadMaterial(
  crewId: string,
  materialKey: string,
  jobs: CrewAppJob[],
): void {
  const store = readStore();
  for (const job of jobs) {
    for (const mat of job.shopMaterials) {
      if (materialDayKey(mat.label) !== materialKey) continue;
      const scope = jobScopeKey(crewId, job.id);
      const current = new Set(store.job[scope] ?? []);
      current.delete(mat.id);
      if (current.size === 0) {
        delete store.job[scope];
      } else {
        store.job[scope] = [...current];
      }
    }
  }
  writeStore(store);
}

export function uncheckJobLoadItem(crewId: string, jobId: string, materialId: string): void {
  const store = readStore();
  const scope = jobScopeKey(crewId, jobId);
  const current = new Set(store.job[scope] ?? []);
  current.delete(materialId);
  if (current.size === 0) {
    delete store.job[scope];
  } else {
    store.job[scope] = [...current];
  }
  writeStore(store);
}

export function resetJobLoadChecklist(crewId: string, jobId: string): void {
  const store = readStore();
  delete store.job[jobScopeKey(crewId, jobId)];
  writeStore(store);
}

export function resetDayLoadForJobs(crewId: string, jobs: CrewAppJob[]): void {
  const store = readStore();
  for (const job of jobs) {
    delete store.job[jobScopeKey(crewId, job.id)];
  }
  writeStore(store);
}

export function buildJobPendingLoadItems(
  job: CrewAppJob,
  crewId: string,
): TodayPendingLoadItem[] {
  const checked = readJobLoadChecked(crewId, job.id);
  return job.shopMaterials
    .filter((m) => !checked.has(m.id))
    .map((m) => ({
      key: m.id,
      label: m.label,
      qtyLabel: `${m.qty} ${m.unit ?? "ea"}`,
    }));
}

export function buildTodayAllLoadItems(
  jobs: CrewAppJob[],
  crewId: string,
): LoadChecklistItem[] {
  const byLabel = new Map<
    string,
    { label: string; unit: string; totalQty: number; parts: string[]; checked: boolean }
  >();

  for (const job of jobs) {
    const checked = readJobLoadChecked(crewId, job.id);
    for (const mat of job.shopMaterials) {
      const key = materialDayKey(mat.label);
      const isChecked = checked.has(mat.id);
      const existing = byLabel.get(key);
      if (existing) {
        existing.totalQty += mat.qty;
        existing.parts.push(`${job.moveRef}: ${mat.qty}`);
        if (!isChecked) existing.checked = false;
      } else {
        byLabel.set(key, {
          label: mat.label,
          unit: mat.unit ?? "ea",
          totalQty: mat.qty,
          parts: [`${job.moveRef}: ${mat.qty}`],
          checked: isChecked,
        });
      }
    }
  }

  return [...byLabel.entries()]
    .sort(([, a], [, b]) => a.label.localeCompare(b.label))
    .map(([key, value]) => ({
      key,
      label: value.label,
      qtyLabel: `${value.totalQty} ${value.unit}`,
      detail: value.parts.length > 1 ? value.parts.join(" · ") : undefined,
      checked: value.checked,
    }));
}

export function buildJobAllLoadItems(job: CrewAppJob, crewId: string): LoadChecklistItem[] {
  const checked = readJobLoadChecked(crewId, job.id);
  return job.shopMaterials.map((m) => ({
    key: m.id,
    label: m.label,
    qtyLabel: `${m.qty} ${m.unit ?? "ea"}`,
    checked: checked.has(m.id),
  }));
}
