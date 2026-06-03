import {
  catalogFindLostReason,
  catalogLostReasons,
} from "@/lib/settings/field-catalog-runtime";

export type {
  LostQualification,
  LostReasonOption,
} from "./lost-reasons-constants";

export {
  LOST_QUALIFICATION_LABELS,
  LOST_QUALIFICATION_HINTS,
  UNQUALIFIED_LOST_REASONS,
  QUALIFIED_LOST_REASONS,
} from "./lost-reasons-constants";

import {
  LOST_QUALIFICATION_LABELS,
  QUALIFIED_LOST_REASONS,
  UNQUALIFIED_LOST_REASONS,
  type LostQualification,
  type LostReasonOption,
} from "./lost-reasons-constants";

export function lostReasonsForQualification(
  qualification: LostQualification,
): LostReasonOption[] {
  const fromCatalog = catalogLostReasons(qualification);
  if (fromCatalog.length > 0) return fromCatalog;
  return qualification === "unqualified"
    ? UNQUALIFIED_LOST_REASONS
    : QUALIFIED_LOST_REASONS;
}

export function findLostReasonOption(
  qualification: LostQualification,
  reasonId: string,
): LostReasonOption | undefined {
  return (
    catalogFindLostReason(qualification, reasonId) ??
    lostReasonsForQualification(qualification).find((r) => r.id === reasonId)
  );
}

export type MarkLostPayload = {
  qualification: LostQualification;
  reasonId: string;
  notes?: string;
};

export function buildLostReasonDisplay(payload: MarkLostPayload): string {
  const option = findLostReasonOption(payload.qualification, payload.reasonId);
  const qualLabel =
    payload.qualification === "unqualified" ? "Unqualified" : "Qualified";
  const reasonLabel = option?.label ?? payload.reasonId;
  const trimmedNotes = payload.notes?.trim();
  if (trimmedNotes) {
    return `${qualLabel} · ${reasonLabel} — ${trimmedNotes}`;
  }
  return `${qualLabel} · ${reasonLabel}`;
}

export function formatLostMoveSummary(move: {
  lostQualification: LostQualification | null;
  lostReason: string | null;
  lostReasonId: string | null;
  lostNotes: string | null;
}): string | null {
  if (move.lostReason) return move.lostReason;
  if (!move.lostQualification || !move.lostReasonId) return null;
  return buildLostReasonDisplay({
    qualification: move.lostQualification,
    reasonId: move.lostReasonId,
    notes: move.lostNotes ?? undefined,
  });
}

export function lostQualificationBadgeClass(qualification: LostQualification | null): string {
  if (qualification === "unqualified") return "bg-amber-50 text-amber-900";
  if (qualification === "qualified") return "bg-red-50 text-red-900";
  return "bg-red-50 text-red-800";
}
