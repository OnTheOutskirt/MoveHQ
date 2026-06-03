export const CHANGE_ORDER_KINDS = [
  "charge_order",
  "small_minor",
  "small_inventory_labor",
  "full_requote",
] as const;

export type ChangeOrderKind = (typeof CHANGE_ORDER_KINDS)[number];

export const CHANGE_ORDER_STATUSES = [
  "draft",
  "pending_client",
  "approved",
  "applied",
  "void",
] as const;

export type ChangeOrderStatus = (typeof CHANGE_ORDER_STATUSES)[number];

export type ChangeOrder = {
  id: string;
  moveId: string;
  kind: ChangeOrderKind;
  title: string;
  summary: string;
  status: ChangeOrderStatus;
  /** Positive = increase, negative = credit */
  amountDelta: number | null;
  originalQuoteAmount: number | null;
  revisedQuoteAmount: number | null;
  /** True when scope needs a new truck or job day */
  requiresNewTruckOrDay: boolean;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  notes?: string;
};

export type NewChangeOrder = Omit<
  ChangeOrder,
  "id" | "createdAt" | "updatedAt" | "status"
> & {
  status?: ChangeOrderStatus;
};

export type ChangeOrdersStore = {
  orders: ChangeOrder[];
};
