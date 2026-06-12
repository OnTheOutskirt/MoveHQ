import {
  legacyCategoryToVendorTypeId,
  opsPrepCategoryForVendorType,
} from "./ops-prep-manual";
import type { OpsPrepCategory } from "./ops-prep-tasks";

const STORAGE_KEY = "jm-ops-prep-custom-v1";

export type ManualOpsPrepTask = {
  id: string;
  /** When omitted, prep is not tied to a move. */
  moveId?: string;
  customerName: string;
  jobDayId?: string;
  jobDayLabel?: string;
  dueDate: string;
  /** Derived from vendor type for icons — kept for legacy rows. */
  category: OpsPrepCategory;
  /** Setup → Pipelines & fields vendor type id. */
  vendorTypeId: string;
  title: string;
  detail: string;
  vendor?: string;
  vendorId?: string;
  createdAt: string;
};

const listeners = new Set<() => void>();

export function subscribeManualOpsPrepTasks(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((fn) => fn());
}

export function generateManualOpsPrepId(): string {
  return `op-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function readManualOpsPrepTasks(): ManualOpsPrepTask[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ManualOpsPrepTask[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeManualOpsPrepTask);
  } catch {
    return [];
  }
}

function normalizeManualOpsPrepTask(task: ManualOpsPrepTask): ManualOpsPrepTask {
  const vendorTypeId = task.vendorTypeId ?? legacyCategoryToVendorTypeId(task.category);
  return {
    ...task,
    vendorTypeId,
    category: task.category ?? opsPrepCategoryForVendorType(vendorTypeId),
  };
}

function writeManualOpsPrepTasks(tasks: ManualOpsPrepTask[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  notify();
}

export type NewManualOpsPrepTask = Omit<ManualOpsPrepTask, "id" | "createdAt">;

export function addManualOpsPrepTask(input: NewManualOpsPrepTask): ManualOpsPrepTask {
  const vendorTypeId = input.vendorTypeId;
  const task: ManualOpsPrepTask = normalizeManualOpsPrepTask({
    ...input,
    vendorTypeId,
    category: input.category ?? opsPrepCategoryForVendorType(vendorTypeId),
    id: generateManualOpsPrepId(),
    createdAt: new Date().toISOString(),
  });
  writeManualOpsPrepTasks([task, ...readManualOpsPrepTasks()]);
  return task;
}

export function removeManualOpsPrepTask(id: string): void {
  writeManualOpsPrepTasks(readManualOpsPrepTasks().filter((task) => task.id !== id));
}

export function manualOpsPrepTaskIdFromOpsId(opsTaskId: string): string | null {
  return opsTaskId.startsWith("manual:") ? opsTaskId.slice("manual:".length) : null;
}
