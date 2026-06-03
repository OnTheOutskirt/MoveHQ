import type { ChangeOrder, ChangeOrderKind, ChangeOrderStatus } from "./change-orders-types";

export const CHANGE_ORDER_KIND_LABELS: Record<ChangeOrderKind, string> = {
  charge_order: "Charge order (AI)",
  small_minor: "Small change order",
  small_inventory_labor: "Small CO — inventory / labor",
  full_requote: "Full requote",
};

export const CHANGE_ORDER_KIND_DESCRIPTIONS: Record<ChangeOrderKind, string> = {
  charge_order:
    "AI-assisted charge order for approved add-ons — line items and customer sign-off without a full requote.",
  small_minor:
    "Minor quote adjustments (access, small extras, timing) that do not change trucks or job days.",
  small_inventory_labor:
    "Small inventory or labor tweaks — same trucks and job days, updated flat-rate total only.",
  full_requote:
    "Regenerate the entire quote for packing, storage, large additions, or major scope changes.",
};

export const CHANGE_ORDER_STATUS_LABELS: Record<ChangeOrderStatus, string> = {
  draft: "Draft",
  pending_client: "Pending client",
  approved: "Approved",
  applied: "Applied to quote",
  void: "Void",
};

export function changeOrdersForMove(orders: ChangeOrder[], moveId: string): ChangeOrder[] {
  return orders
    .filter((o) => o.moveId === moveId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function defaultTitleForKind(kind: ChangeOrderKind): string {
  switch (kind) {
    case "charge_order":
      return "Charge order — add-on";
    case "small_minor":
      return "Small change — scope tweak";
    case "small_inventory_labor":
      return "Small change — inventory / labor";
    case "full_requote":
      return "Full requote — major scope";
  }
}

export function kindRequiresNewTruckOrDay(kind: ChangeOrderKind): boolean {
  return kind === "full_requote";
}
