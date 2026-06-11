import type { EquipmentCatalogItem } from "@/lib/moves/equipment-catalog-types";
import type {
  InventoryAdjustmentKind,
  InventoryFilter,
  InventoryItemState,
  InventoryStockLine,
  InventoryStore,
  InventoryTransaction,
} from "./inventory-types";

export function isBillableCatalogItem(item: EquipmentCatalogItem): boolean {
  return item.category === "supply";
}

export function inventoryTypeLabel(billable: boolean): string {
  return billable ? "Billable" : "Non-billable";
}

export function isLowStock(item: Pick<InventoryItemState, "quantityOnHand" | "reorderPoint">): boolean {
  return item.quantityOnHand <= item.reorderPoint;
}

export function formatInventoryQuantity(quantity: number, unit: string): string {
  const formatted = new Intl.NumberFormat("en-US").format(quantity);
  const unitLabel = quantity === 1 ? unit.replace(/s$/, "") || unit : unit;
  return `${formatted} ${unitLabel}`;
}

export function mergeStockLines(
  catalog: EquipmentCatalogItem[],
  store: InventoryStore,
): InventoryStockLine[] {
  return catalog.map((item) => {
    const state = store.items[item.id];
    const quantityOnHand = state?.quantityOnHand ?? 0;
    const reorderPoint = state?.reorderPoint ?? 0;
    const billable = isBillableCatalogItem(item);
    return {
      catalogId: item.id,
      label: item.label,
      unit: item.unit,
      billable,
      unitPrice: item.unitPrice,
      quantityOnHand,
      reorderPoint,
      isLow: isLowStock({ quantityOnHand, reorderPoint }),
      lastCountedAt: state?.lastCountedAt,
    };
  });
}

export function filterStockLines(
  lines: InventoryStockLine[],
  filter: InventoryFilter,
): InventoryStockLine[] {
  if (filter === "billable") return lines.filter((l) => l.billable);
  if (filter === "non-billable") return lines.filter((l) => !l.billable);
  return lines;
}

export function searchStockLines(
  lines: InventoryStockLine[],
  query: string,
): InventoryStockLine[] {
  const q = query.trim().toLowerCase();
  if (!q) return lines;
  return lines.filter(
    (l) =>
      l.label.toLowerCase().includes(q) ||
      l.catalogId.toLowerCase().includes(q) ||
      inventoryTypeLabel(l.billable).toLowerCase().includes(q),
  );
}

export function countLowStock(lines: InventoryStockLine[]): number {
  return lines.filter((l) => l.isLow).length;
}

export function billableValueOnHand(lines: InventoryStockLine[]): number {
  return lines
    .filter((l) => l.billable)
    .reduce((sum, l) => sum + l.quantityOnHand * l.unitPrice, 0);
}

export function newTransactionId(): string {
  return `inv-tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function applyInventoryAdjustment(
  store: InventoryStore,
  input: {
    catalogId: string;
    kind: InventoryAdjustmentKind;
    amount: number;
    note?: string;
    by: string;
  },
): InventoryStore {
  const current = store.items[input.catalogId] ?? {
    catalogId: input.catalogId,
    quantityOnHand: 0,
    reorderPoint: 0,
    lastCountedAt: null,
  };

  let quantityAfter = current.quantityOnHand;
  let quantityDelta = 0;

  if (input.kind === "receive") {
    quantityDelta = Math.max(0, Math.round(input.amount));
    quantityAfter = current.quantityOnHand + quantityDelta;
  } else if (input.kind === "use") {
    quantityDelta = -Math.max(0, Math.round(input.amount));
    quantityAfter = Math.max(0, current.quantityOnHand + quantityDelta);
  } else {
    quantityAfter = Math.max(0, Math.round(input.amount));
    quantityDelta = quantityAfter - current.quantityOnHand;
  }

  const transaction: InventoryTransaction = {
    id: newTransactionId(),
    catalogId: input.catalogId,
    kind: input.kind,
    quantityDelta,
    quantityAfter,
    note: input.note?.trim() || undefined,
    at: new Date().toISOString(),
    by: input.by,
  };

  return {
    items: {
      ...store.items,
      [input.catalogId]: {
        ...current,
        quantityOnHand: quantityAfter,
        lastCountedAt: input.kind === "count" ? transaction.at : current.lastCountedAt,
      },
    },
    transactions: [transaction, ...store.transactions].slice(0, 500),
  };
}

export type InventoryUsageRow = {
  catalogId: string;
  label: string;
  billable: boolean;
  unit: string;
  received: number;
  used: number;
  netChange: number;
  onHand: number;
  unitPrice: number;
};

export function usageRowsForPeriod(
  lines: InventoryStockLine[],
  transactions: InventoryTransaction[],
  periodDays: number,
): InventoryUsageRow[] {
  const cutoff = Date.now() - periodDays * 24 * 60 * 60 * 1000;
  const recent = transactions.filter((t) => new Date(t.at).getTime() >= cutoff);
  const byCatalog = new Map<string, { received: number; used: number; net: number }>();

  for (const tx of recent) {
    const entry = byCatalog.get(tx.catalogId) ?? { received: 0, used: 0, net: 0 };
    if (tx.kind === "receive") entry.received += tx.quantityDelta;
    if (tx.kind === "use") entry.used += Math.abs(tx.quantityDelta);
    entry.net += tx.quantityDelta;
    byCatalog.set(tx.catalogId, entry);
  }

  return lines
    .map((line) => {
      const usage = byCatalog.get(line.catalogId) ?? { received: 0, used: 0, net: 0 };
      return {
        catalogId: line.catalogId,
        label: line.label,
        billable: line.billable,
        unit: line.unit,
        received: usage.received,
        used: usage.used,
        netChange: usage.net,
        onHand: line.quantityOnHand,
        unitPrice: line.unitPrice,
      };
    })
    .filter((row) => row.received > 0 || row.used > 0 || row.netChange !== 0)
    .sort((a, b) => b.used - a.used || b.received - a.received);
}

export function adjustmentKindLabel(kind: InventoryAdjustmentKind): string {
  if (kind === "receive") return "Received";
  if (kind === "use") return "Used";
  return "Count";
}

export function formatTransactionSummary(
  tx: InventoryTransaction,
  label: string,
  unit: string,
): string {
  if (tx.kind === "count") {
    return `Set count to ${formatInventoryQuantity(tx.quantityAfter, unit)}`;
  }
  const qty = Math.abs(tx.quantityDelta);
  const verb = tx.kind === "receive" ? "Received" : "Used";
  return `${verb} ${formatInventoryQuantity(qty, unit)}`;
}
