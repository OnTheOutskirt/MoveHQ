import { buildDefaultInventoryStore } from "./inventory-defaults";
import type { InventoryItemState, InventoryStore, InventoryTransaction } from "./inventory-types";

export const INVENTORY_STORAGE_KEY = "jm-ops-inventory-v1";

/** @deprecated Same-tab listeners caused save/reload loops — use `storage` for cross-tab sync. */
export const INVENTORY_UPDATED_EVENT = "jm-ops-inventory-updated";

function normalizeItem(raw: unknown): InventoryItemState | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Partial<InventoryItemState>;
  if (!o.catalogId) return null;
  return {
    catalogId: o.catalogId,
    quantityOnHand:
      typeof o.quantityOnHand === "number" && o.quantityOnHand >= 0 ? o.quantityOnHand : 0,
    reorderPoint:
      typeof o.reorderPoint === "number" && o.reorderPoint >= 0 ? o.reorderPoint : 0,
    lastCountedAt: typeof o.lastCountedAt === "string" ? o.lastCountedAt : null,
  };
}

function normalizeTransaction(raw: unknown): InventoryTransaction | null {
  if (!raw || typeof raw !== "object") return null;
  const t = raw as Partial<InventoryTransaction>;
  if (!t.id || !t.catalogId || !t.kind || !t.at) return null;
  if (t.kind !== "receive" && t.kind !== "use" && t.kind !== "count") return null;
  return {
    id: t.id,
    catalogId: t.catalogId,
    kind: t.kind,
    quantityDelta: typeof t.quantityDelta === "number" ? t.quantityDelta : 0,
    quantityAfter: typeof t.quantityAfter === "number" ? t.quantityAfter : 0,
    note: typeof t.note === "string" ? t.note : undefined,
    at: t.at,
    by: typeof t.by === "string" ? t.by : "Operations",
  };
}

export function normalizeInventoryStore(raw: unknown): InventoryStore {
  const base = buildDefaultInventoryStore();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Partial<InventoryStore>;
  const items: Record<string, InventoryItemState> = { ...base.items };
  if (o.items && typeof o.items === "object") {
    for (const [id, value] of Object.entries(o.items)) {
      const item = normalizeItem(value);
      if (item) items[id] = item;
    }
  }
  const transactions = Array.isArray(o.transactions)
    ? o.transactions.map(normalizeTransaction).filter((x): x is InventoryTransaction => x != null)
    : base.transactions;
  return { items, transactions };
}

export function loadInventoryStore(): InventoryStore {
  if (typeof window === "undefined") return buildDefaultInventoryStore();
  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (!raw) return buildDefaultInventoryStore();
    return normalizeInventoryStore(JSON.parse(raw));
  } catch {
    return buildDefaultInventoryStore();
  }
}

/** Persist inventory — does not broadcast (avoids provider save/reload loops). */
export function persistInventoryStore(store: InventoryStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(store));
}

/** @deprecated Use `persistInventoryStore` — custom events are not used for same-tab sync. */
export function saveInventoryStore(store: InventoryStore): void {
  persistInventoryStore(store);
}

export function inventorySnapshot(store: InventoryStore): string {
  return JSON.stringify(store);
}
