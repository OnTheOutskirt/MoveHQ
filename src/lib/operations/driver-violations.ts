export const DRIVER_VIOLATION_IDS = [
  "braking",
  "cornering",
  "critical_distance",
  "lane_departure",
  "no_spotter",
  "phone",
  "rolling_stop",
  "speeding",
  "other",
] as const;

export type DriverViolationId = (typeof DRIVER_VIOLATION_IDS)[number];

export const DRIVER_VIOLATION_LABELS: Record<DriverViolationId, string> = {
  braking: "Braking",
  cornering: "Cornering",
  critical_distance: "Critical distance",
  lane_departure: "Lane departure",
  no_spotter: "No spotter",
  phone: "Phone",
  rolling_stop: "Rolling stop",
  speeding: "Speeding",
  other: "Other",
};

import { ratingFromViolationCount } from "./violation-rating";

export function computeDriverRating(violations: DriverViolationId[]): number {
  return ratingFromViolationCount(violations.length);
}

export function hasThreeDriverViolationsFlag(violations: DriverViolationId[]): boolean {
  return violations.length >= 3;
}

export function formatDriverViolationList(violations: DriverViolationId[], max = 2): string {
  if (violations.length === 0) return "None";
  const labels = violations.map((id) => DRIVER_VIOLATION_LABELS[id]);
  if (labels.length <= max) return labels.join(", ");
  return `${labels.slice(0, max).join(", ")} +${labels.length - max} more`;
}

export function countDriverViolations(
  reviews: { violations?: DriverViolationId[] }[],
): Record<DriverViolationId, number> {
  const counts = Object.fromEntries(
    DRIVER_VIOLATION_IDS.map((id) => [id, 0]),
  ) as Record<DriverViolationId, number>;
  for (const review of reviews) {
    for (const id of review.violations ?? []) {
      counts[id] += 1;
    }
  }
  return counts;
}
