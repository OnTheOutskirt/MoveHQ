import { ratingFromViolationCount } from "./violation-rating";

export const SKIPPER_VIOLATION_IDS = [
  "addendum_not_submitted",
  "billing_inaccurate",
  "claims_process",
  "callback",
  "clockshark_error",
  "dirty_truck",
  "trash_in_truck",
  "pads_not_full",
  "gas_receipts",
  "depot_return_no_notify",
  "late_to_crew_lead",
  "left_depot_without_supplies",
  "materials_not_put_away",
  "no_truck_picture",
  "truck_doors_open",
  "trucks_not_fueled",
  "other",
] as const;

export type SkipperViolationId = (typeof SKIPPER_VIOLATION_IDS)[number];

export const SKIPPER_CALLBACK_VIOLATION_ID = "callback" satisfies SkipperViolationId;

export const SKIPPER_VIOLATION_LABELS: Record<SkipperViolationId, string> = {
  addendum_not_submitted: "Addendum not submitted",
  billing_inaccurate: "Billing inaccurate / payment not turned in",
  claims_process: "Claims process",
  callback: "Callback",
  clockshark_error: "Clockshark error",
  dirty_truck: "Dirty truck",
  trash_in_truck: "Trash left in truck",
  pads_not_full: "Pads / blankets not full",
  gas_receipts: "Gas receipts",
  depot_return_no_notify: "Items brought back to depot without notifying",
  late_to_crew_lead: "Late to crew lead",
  left_depot_without_supplies: "Leaving depot without all supplies",
  materials_not_put_away: "Materials / equip / keys not put away",
  no_truck_picture: "No truck picture / Liveswitch",
  truck_doors_open: "Truck doors, windows, or storage left open",
  trucks_not_fueled: "Trucks not fueled",
  other: "Other",
};

export function computeSkipperRating(violations: SkipperViolationId[]): number {
  return ratingFromViolationCount(violations.length);
}

export function hasThreeViolationsFlag(violations: SkipperViolationId[]): boolean {
  return violations.length >= 3;
}

export function formatViolationList(
  violations: SkipperViolationId[],
  max = 2,
): string {
  if (violations.length === 0) return "None";
  const labels = violations.map((id) => SKIPPER_VIOLATION_LABELS[id]);
  if (labels.length <= max) return labels.join(", ");
  return `${labels.slice(0, max).join(", ")} +${labels.length - max} more`;
}

export function countSkipperViolations(
  reviews: { violations?: SkipperViolationId[] }[],
): Record<SkipperViolationId, number> {
  const counts = Object.fromEntries(
    SKIPPER_VIOLATION_IDS.map((id) => [id, 0]),
  ) as Record<SkipperViolationId, number>;
  for (const review of reviews) {
    for (const id of review.violations ?? []) {
      if (id in counts) counts[id as SkipperViolationId] += 1;
    }
  }
  return counts;
}

export function countSkipperCallbacks(
  reviews: { date: string; violations?: SkipperViolationId[] }[],
  withinDays?: number,
  today: Date = new Date(),
): number {
  return reviews.filter((review) => {
    if (!(review.violations ?? []).includes(SKIPPER_CALLBACK_VIOLATION_ID)) return false;
    if (withinDays == null) return true;
    const d = new Date(`${review.date}T12:00:00`);
    const start = new Date(today);
    start.setDate(start.getDate() - withinDays);
    start.setHours(0, 0, 0, 0);
    return d >= start;
  }).length;
}
