import { defaultChangeOrdersStore } from "./change-orders-defaults";
import type { ChangeOrder, ChangeOrdersStore, NewChangeOrder } from "./change-orders-types";

const STORAGE_KEY = "jm-change-orders-v1";

export function loadChangeOrdersStore(): ChangeOrdersStore {
  if (typeof window === "undefined") return defaultChangeOrdersStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultChangeOrdersStore();
    const parsed = JSON.parse(raw) as ChangeOrdersStore;
    if (!Array.isArray(parsed.orders)) return defaultChangeOrdersStore();
    return parsed;
  } catch {
    return defaultChangeOrdersStore();
  }
}

export function saveChangeOrdersStore(store: ChangeOrdersStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function generateChangeOrderId(): string {
  return `co-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createChangeOrderFromInput(input: NewChangeOrder): ChangeOrder {
  const now = new Date().toISOString();
  return {
    ...input,
    id: generateChangeOrderId(),
    status: input.status ?? "draft",
    createdAt: now,
    updatedAt: now,
  };
}
