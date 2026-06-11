import type { NewSkipperRating } from "@/lib/operations/crew-records-storage";
import type { SkipperRating } from "@/lib/operations/crew-records-types";
import { applyIssueDocumented } from "@/lib/operations/claims-workflow";
import type { MoveClaim, NewMoveClaim } from "@/lib/operations/claims-types";
import { createDefaultChecklist } from "@/lib/operations/claims-workflow";
import { SKIPPER_VIOLATION_LABELS, type SkipperViolationId } from "@/lib/operations/skipper-violations";
import type { JobFieldMediaEntry } from "./field-capture-types";
import { FIELD_CAPTURE_CATEGORY_LABELS } from "./field-capture-types";

export type FieldCaptureRouteInput = {
  media: JobFieldMediaEntry;
  jobId: string;
  customerName?: string;
};

export type FieldCaptureRouteActions = {
  addSkipperRating: (input: NewSkipperRating) => SkipperRating;
  updateSkipperRating: (
    id: string,
    patch: Partial<Omit<SkipperRating, "id" | "createdAt">>,
  ) => void;
  findSkipperRating: (
    skipperId: string,
    jobRef: string,
    date: string,
  ) => SkipperRating | undefined;
  addClaim: (input: NewMoveClaim) => MoveClaim;
  updateClaim: (id: string, patch: Partial<MoveClaim>) => void;
  findOpenClaimForMove: (moveId: string) => MoveClaim | undefined;
};

export type FieldCaptureRouteResult = {
  media: JobFieldMediaEntry;
  skipperRatingId?: string;
  claimId?: string;
};

function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildSkipperNote(media: JobFieldMediaEntry): string {
  const parts: string[] = [];
  if (media.violationId) {
    parts.push(SKIPPER_VIOLATION_LABELS[media.violationId]);
  } else {
    parts.push(FIELD_CAPTURE_CATEGORY_LABELS[media.category]);
  }
  if (media.truckLabel) parts.push(`Truck: ${media.truckLabel}`);
  if (media.note) parts.push(media.note);
  parts.push(`Photo ${media.id}`);
  return parts.join(" · ");
}

function routeTruckCondition(
  media: JobFieldMediaEntry,
  actions: FieldCaptureRouteActions,
): string | undefined {
  if (!media.assignedCrewId || !media.violationId) return undefined;

  const date = media.capturedAt.slice(0, 10);
  const existing = actions.findSkipperRating(media.assignedCrewId, media.moveRef, date);

  if (existing) {
    const violations = [...new Set([...existing.violations, media.violationId])];
    actions.updateSkipperRating(existing.id, {
      violations,
      fieldMediaId: media.id,
      photoDataUrl: media.imageDataUrl ?? existing.photoDataUrl,
      notes: existing.notes ? `${existing.notes}\n${buildSkipperNote(media)}` : buildSkipperNote(media),
      ratedBy: media.capturedByName,
    });
    return existing.id;
  }

  const rating = actions.addSkipperRating({
    skipperId: media.assignedCrewId,
    date,
    jobRef: media.moveRef,
    violations: [media.violationId],
    notes: buildSkipperNote(media),
    ratedBy: media.capturedByName,
    fieldMediaId: media.id,
    photoDataUrl: media.imageDataUrl,
  });
  return rating.id;
}

function routeClaimDamage(
  media: JobFieldMediaEntry,
  customerName: string | undefined,
  actions: FieldCaptureRouteActions,
): string | undefined {
  const moveId = media.moveId;
  if (!moveId) return undefined;

  const docNote = [
    media.note,
    `Field photo captured ${new Date(media.capturedAt).toLocaleString()} by ${media.capturedByName}.`,
  ]
    .filter(Boolean)
    .join(" ");

  const existing = actions.findOpenClaimForMove(moveId);
  if (existing) {
    const fieldMediaIds = [...new Set([...(existing.fieldMediaIds ?? []), media.id])];
    const patched = applyIssueDocumented(
      { ...existing, fieldMediaIds },
      existing.damageDocumentation
        ? `${existing.damageDocumentation}\n\n${docNote}`
        : docNote,
      existing.amountClaimed,
    );
    actions.updateClaim(existing.id, {
      ...patched,
      fieldMediaIds,
    });
    return existing.id;
  }

  const claim = actions.addClaim({
    moveId,
    customerName: customerName ?? "Customer",
    moveReference: media.moveRef,
    status: "new",
    category: "damage",
    title: media.note?.slice(0, 80) || "Field damage report",
    description: docNote,
    reportedDate: media.capturedAt.slice(0, 10),
    amountClaimed: 0,
    amountPaid: 0,
    reportedBy: media.capturedByName,
    checklist: createDefaultChecklist("damage"),
    commsLog: [],
    fieldMediaIds: [media.id],
    damageDocumentation: docNote,
  });
  const documented = applyIssueDocumented(claim, docNote, 0);
  actions.updateClaim(claim.id, documented);
  return claim.id;
}

function attachClaimPhoto(
  media: JobFieldMediaEntry,
  customerName: string | undefined,
  actions: FieldCaptureRouteActions,
): string | undefined {
  const moveId = media.moveId;
  if (!moveId) return undefined;

  const existing = actions.findOpenClaimForMove(moveId);
  if (existing) {
    const fieldMediaIds = [...new Set([...(existing.fieldMediaIds ?? []), media.id])];
    actions.updateClaim(existing.id, { fieldMediaIds });
    return existing.id;
  }

  const note = media.note ?? "Pre-existing condition documented on site.";
  const claim = actions.addClaim({
    moveId,
    customerName: customerName ?? "Customer",
    moveReference: media.moveRef,
    status: "new",
    category: "damage",
    title: "Pre-existing damage documented",
    description: note,
    reportedDate: media.capturedAt.slice(0, 10),
    amountClaimed: 0,
    amountPaid: 0,
    reportedBy: media.capturedByName,
    checklist: createDefaultChecklist("damage"),
    commsLog: [],
    fieldMediaIds: [media.id],
  });
  return claim.id;
}

/** Route a captured photo to skipper profile, claims, or job media only. */
export function routeFieldCapture(
  input: FieldCaptureRouteInput,
  actions: FieldCaptureRouteActions,
): FieldCaptureRouteResult {
  const { media, customerName } = input;
  let skipperRatingId: string | undefined;
  let claimId: string | undefined;

  if (media.category === "truck_condition") {
    skipperRatingId = routeTruckCondition(media, actions);
  } else if (media.category === "claim_damage") {
    claimId = routeClaimDamage(media, customerName, actions);
  } else if (media.category === "pre_existing_damage") {
    claimId = attachClaimPhoto(media, customerName, actions);
  }

  return {
    media: {
      ...media,
      syncStatus: "synced",
      skipperRatingId,
      claimId,
    },
    skipperRatingId,
    claimId,
  };
}

export function violationRequiresAssignee(violationId: SkipperViolationId | undefined): boolean {
  return Boolean(violationId);
}

export function categoryRequiresAssignee(category: JobFieldMediaEntry["category"]): boolean {
  return category === "truck_condition";
}

export function defaultViolationForCategory(
  category: JobFieldMediaEntry["category"],
): SkipperViolationId | undefined {
  if (category !== "truck_condition") return undefined;
  return "dirty_truck";
}
