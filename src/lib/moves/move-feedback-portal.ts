import { googleReviewUrlForLocation } from "@/lib/workspace/location-profile";
import type { WorkspaceLocation } from "@/lib/workspace/types";
import { buildMoveCustomerPortalPath, buildMoveCustomerPortalUrl } from "./move-customer-portal";
import type { JobDayStatus, MoveCrewFeedback, MoveRecord } from "./types";

export const DEFAULT_GOOGLE_REVIEW_MIN_STARS = 5;

export type GoogleReviewMinStars = 3 | 4 | 5;

export function normalizeGoogleReviewMinStars(value: unknown): GoogleReviewMinStars {
  if (value === 3 || value === 4 || value === 5) return value;
  return DEFAULT_GOOGLE_REVIEW_MIN_STARS;
}

/** Post-move feedback lives on the move customer portal (same link as quote/contract). */
export function buildMoveFeedbackPortalPath(moveId: string): string {
  return buildMoveCustomerPortalPath(moveId);
}

/** Customer-facing portal URL used in post-move automations (absolute when in browser). */
export function buildMoveFeedbackPortalUrl(moveId: string): string {
  return buildMoveCustomerPortalUrl(moveId);
}

export function shouldOfferGoogleReview(
  rating: number,
  minStars: GoogleReviewMinStars,
  googleReviewUrl: string,
): boolean {
  return rating >= minStars && Boolean(googleReviewUrl.trim());
}

export function googleReviewUrlForMove(
  move: Pick<MoveRecord, "locationId">,
  locations: WorkspaceLocation[],
): string {
  return googleReviewUrlForLocation(locations, move.locationId);
}

export function normalizeMoveCrewFeedback(
  feedback: MoveCrewFeedback | null | undefined,
): MoveCrewFeedback | null {
  if (!feedback || typeof feedback !== "object") return null;
  const rating = Math.min(5, Math.max(1, Math.round(Number(feedback.rating))));
  if (!Number.isFinite(rating) || typeof feedback.submittedAt !== "string") return null;
  return {
    rating,
    comment: typeof feedback.comment === "string" ? feedback.comment : "",
    submittedAt: feedback.submittedAt,
    googleReviewOffered: Boolean(feedback.googleReviewOffered),
  };
}

/** Post-move portal feedback — show on completed ops job rows (past, today, etc.). */
export function crewFeedbackForOpsJobRow(
  move: Pick<MoveRecord, "crewFeedback"> | undefined,
  row: { status: JobDayStatus },
): MoveCrewFeedback | null {
  const feedback = normalizeMoveCrewFeedback(move?.crewFeedback);
  if (!feedback || row.status !== "completed") return null;
  return feedback;
}

export function crewFeedbackSummary(feedback: MoveCrewFeedback): string {
  const stars = `${feedback.rating}/5`;
  const comment = feedback.comment.trim();
  if (!comment) return `Customer rated crew ${stars}`;
  const preview = comment.length > 80 ? `${comment.slice(0, 77)}…` : comment;
  return `Customer rated crew ${stars} — “${preview}”`;
}
