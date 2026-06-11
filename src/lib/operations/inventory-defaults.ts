import { DEFAULT_EQUIPMENT_SUPPLY_CATALOG } from "@/lib/moves/equipment-catalog-defaults";
import type { EquipmentCatalogItem } from "@/lib/moves/equipment-catalog-types";
import type { InventoryItemState, InventoryStore, InventoryTransaction } from "./inventory-types";

/** Starting on-hand quantities — demo until warehouse sync is wired. */
const DEFAULT_ON_HAND: Record<string, { qty: number; reorder: number }> = {
  small_box: { qty: 240, reorder: 80 },
  medium_box: { qty: 180, reorder: 60 },
  large_box: { qty: 95, reorder: 40 },
  packing_paper: { qty: 28, reorder: 10 },
  wardrobe_box: { qty: 42, reorder: 15 },
  tv_box: { qty: 18, reorder: 8 },
  dish_pack: { qty: 24, reorder: 10 },
  shrink_wrap: { qty: 14, reorder: 6 },
  mattress_bag: { qty: 30, reorder: 12 },
  storage_blanket: { qty: 86, reorder: 30 },
  floor_runner: { qty: 22, reorder: 8 },
  safe_dolly: { qty: 3, reorder: 1 },
};

function defaultItemState(item: EquipmentCatalogItem): InventoryItemState {
  const seed = DEFAULT_ON_HAND[item.id];
  return {
    catalogId: item.id,
    quantityOnHand: seed?.qty ?? (item.category === "supply" ? 50 : 12),
    reorderPoint: seed?.reorder ?? (item.category === "supply" ? 20 : 8),
    lastCountedAt: null,
  };
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function seedTransactions(): InventoryTransaction[] {
  const by = "Lisa Parker";
  const rows: Omit<InventoryTransaction, "id">[] = [
    { catalogId: "small_box", kind: "receive", quantityDelta: 120, quantityAfter: 240, note: "Uline delivery", at: daysAgo(2), by },
    { catalogId: "medium_box", kind: "use", quantityDelta: -24, quantityAfter: 180, note: "Weekend jobs", at: daysAgo(3), by },
    { catalogId: "packing_paper", kind: "use", quantityDelta: -6, quantityAfter: 28, at: daysAgo(4), by },
    { catalogId: "storage_blanket", kind: "use", quantityDelta: -12, quantityAfter: 86, note: "Laundry cycle", at: daysAgo(5), by },
    { catalogId: "shrink_wrap", kind: "receive", quantityDelta: 8, quantityAfter: 14, at: daysAgo(7), by },
    { catalogId: "wardrobe_box", kind: "use", quantityDelta: -8, quantityAfter: 42, at: daysAgo(9), by },
    { catalogId: "large_box", kind: "count", quantityDelta: 0, quantityAfter: 95, note: "Monthly count", at: daysAgo(12), by },
    { catalogId: "tv_box", kind: "use", quantityDelta: -4, quantityAfter: 18, at: daysAgo(14), by },
    { catalogId: "floor_runner", kind: "receive", quantityDelta: 4, quantityAfter: 22, at: daysAgo(18), by },
    { catalogId: "dish_pack", kind: "use", quantityDelta: -6, quantityAfter: 24, at: daysAgo(21), by },
    { catalogId: "mattress_bag", kind: "receive", quantityDelta: 15, quantityAfter: 30, at: daysAgo(25), by },
  ];
  return rows.map((row, i) => ({ ...row, id: `inv-tx-seed-${i}` }));
}

export function buildDefaultInventoryStore(
  catalog: EquipmentCatalogItem[] = DEFAULT_EQUIPMENT_SUPPLY_CATALOG,
): InventoryStore {
  const items: Record<string, InventoryItemState> = {};
  for (const item of catalog) {
    items[item.id] = defaultItemState(item);
  }
  return { items, transactions: seedTransactions() };
}
