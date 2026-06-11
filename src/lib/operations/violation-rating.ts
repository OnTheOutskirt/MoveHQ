/** Violation-based job scores use a 0–10 scale (one decimal). */

export const VIOLATION_RATING_MAX = 10;
export const VIOLATION_RATING_MIN = 0;

/** Points deducted per checklist item marked on a review. */
export const VIOLATION_POINTS_PER_ITEM = 1;

/**
 * Clean job → 10.0. Each marked violation deducts 1 point, floored at 0.
 * Easy to explain in meetings: "you lost a point per item on the checklist."
 */
export function ratingFromViolationCount(count: number): number {
  if (count <= 0) return VIOLATION_RATING_MAX;
  const raw = VIOLATION_RATING_MAX - count * VIOLATION_POINTS_PER_ITEM;
  const clamped = Math.max(VIOLATION_RATING_MIN, raw);
  return Math.round(clamped * 10) / 10;
}

export function formatViolationRating(rating: number): string {
  return `${rating.toFixed(1)} / 10`;
}

export function isPerfectViolationRating(rating: number): boolean {
  return Math.round(rating * 10) / 10 >= VIOLATION_RATING_MAX;
}

export function violationRatingTextClass(rating: number): string {
  return isPerfectViolationRating(rating) ? "text-emerald-700" : "text-slate-900";
}

export function averageViolationRating(ratings: { rating: number }[]): number | null {
  if (ratings.length === 0) return null;
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}
