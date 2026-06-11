import type { MoveRecord } from "./types";

/** Demo completed move for admin preview links. */
export const DEMO_CUSTOMER_PORTAL_MOVE_ID = "mv-complete";

export function isMovePostComplete(
  move: Pick<MoveRecord, "pipelineStage" | "status">,
): boolean {
  return move.pipelineStage === "completed" || move.status === "completed";
}

export function shouldShowCrewFeedbackPortal(
  move: Pick<MoveRecord, "pipelineStage" | "status">,
  options?: { previewFeedback?: boolean },
): boolean {
  return Boolean(options?.previewFeedback) || isMovePostComplete(move);
}

export function buildMoveCustomerPortalPath(
  moveId: string,
  options?: { previewFeedback?: boolean },
): string {
  const params = new URLSearchParams({ move: moveId });
  if (options?.previewFeedback) {
    params.set("preview", "feedback");
  }
  return `/portal/move?${params.toString()}`;
}

/** Single customer portal URL per move (quote, contract, post-move feedback). */
export function buildMoveCustomerPortalUrl(
  moveId: string,
  options?: { previewFeedback?: boolean },
): string {
  const path = buildMoveCustomerPortalPath(moveId, options);
  if (typeof window !== "undefined") {
    return `${window.location.origin}${path}`;
  }
  return path;
}
