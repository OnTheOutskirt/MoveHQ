import type { BookingReviewStatus, MoveConditionStatus, MoveRecord } from "./types";

export const conditionStatusConfig: Record<
  MoveConditionStatus,
  { label: string; badge: string; description: string }
> = {
  active: {
    label: "Active",
    badge: "bg-emerald-50 text-emerald-800",
    description: "Normal open move",
  },
  lost: {
    label: "Lost",
    badge: "bg-red-50 text-red-800",
    description: "Did not book",
  },
  cancelled: {
    label: "Cancelled",
    badge: "bg-orange-50 text-orange-900",
    description: "Was booked, then cancelled",
  },
  on_hold: {
    label: "On Hold",
    badge: "bg-amber-50 text-amber-900",
    description: "Paused but not lost",
  },
  needs_review: {
    label: "Needs Review",
    badge: "bg-violet-50 text-violet-900",
    description: "Requires internal approval or check",
  },
  closed: {
    label: "Closed",
    badge: "bg-slate-200 text-slate-700",
    description: "Completed and administratively closed",
  },
};

export const bookingReviewConfig: Record<
  BookingReviewStatus,
  { label: string; badge: string }
> = {
  not_required: { label: "Not required", badge: "bg-slate-100 text-slate-600" },
  pending_review: { label: "Pending review", badge: "bg-violet-100 text-violet-900" },
  approved: { label: "Approved", badge: "bg-emerald-100 text-emerald-800" },
  needs_client_call: { label: "Needs client call", badge: "bg-amber-100 text-amber-900" },
  needs_quote_adjustment: {
    label: "Needs quote adjustment",
    badge: "bg-amber-100 text-amber-900",
  },
  rejected: { label: "Rejected / problem", badge: "bg-red-100 text-red-800" },
};

export function conditionStatusLabel(status: MoveConditionStatus): string {
  return conditionStatusConfig[status].label;
}

export function bookingReviewLabel(status: BookingReviewStatus): string {
  return bookingReviewConfig[status].label;
}

export function isTerminalCondition(move: MoveRecord): boolean {
  return (
    move.conditionStatus === "lost" ||
    move.conditionStatus === "cancelled" ||
    move.conditionStatus === "closed"
  );
}

export function showOnPipelineBoard(move: MoveRecord): boolean {
  return (
    move.conditionStatus === "active" ||
    move.conditionStatus === "needs_review" ||
    move.conditionStatus === "on_hold"
  );
}
