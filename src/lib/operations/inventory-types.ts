/** How ops adjusts stock — plain language in the UI maps to these types. */
export type InventoryAdjustmentKind = "receive" | "use" | "count";

export type InventoryItemState = {
  catalogId: string;
  quantityOnHand: number;
  /** Flag as low when on hand falls to this level or below. */
  reorderPoint: number;
  lastCountedAt?: string | null;
};

export type InventoryTransaction = {
  id: string;
  catalogId: string;
  kind: InventoryAdjustmentKind;
  /** Positive for receive; negative for use; count stores the new total in `quantityAfter`. */
  quantityDelta: number;
  quantityAfter: number;
  note?: string;
  at: string;
  by: string;
};

export type InventoryStore = {
  items: Record<string, InventoryItemState>;
  transactions: InventoryTransaction[];
};

export type InventoryStockLine = {
  catalogId: string;
  label: string;
  unit: string;
  billable: boolean;
  unitPrice: number;
  quantityOnHand: number;
  reorderPoint: number;
  isLow: boolean;
  lastCountedAt?: string | null;
};

export type InventoryFilter = "all" | "billable" | "non-billable";
