import {
  checklistIdsForCategory,
  createDefaultChecklist,
  deriveClaimStatus,
  syncClaimWorkflow,
} from "./claims-workflow";
import {
  CLAIM_CATEGORIES,
  type ClaimCategory,
  type MoveClaim,
} from "./claims-types";

const LEGACY_CATEGORY_MAP: Record<string, ClaimCategory> = {
  billing: "other",
  service: "other",
  liability: "other",
};

function normalizeCategory(category: string): ClaimCategory {
  if ((CLAIM_CATEGORIES as readonly string[]).includes(category)) {
    return category as ClaimCategory;
  }
  return LEGACY_CATEGORY_MAP[category] ?? "other";
}

function normalizeChecklist(claim: MoveClaim, category: ClaimCategory): MoveClaim["checklist"] {
  const expected = checklistIdsForCategory(category);
  const existing = claim.checklist ?? [];

  const merged = createDefaultChecklist(category).map((item) => {
    const prev = existing.find((c) => c.id === item.id);
    return prev
      ? { ...item, done: Boolean(prev.done), doneAt: prev.doneAt }
      : item;
  });

  const idsMatch =
    merged.length === expected.length &&
    merged.every((item, i) => item.id === expected[i]);

  if (!idsMatch) return merged;

  if (existing.length === 0) return createDefaultChecklist(category);
  return merged.map((item) => ({
    ...item,
    done: Boolean(existing.find((c) => c.id === item.id)?.done),
    doneAt: existing.find((c) => c.id === item.id)?.doneAt,
  }));
}

/** Backfill fields when loading older localStorage rows. */
export function normalizeClaim(claim: MoveClaim): MoveClaim {
  const category = normalizeCategory(claim.category);
  const checklist = normalizeChecklist(claim, category);

  const base: MoveClaim = {
    ...claim,
    category,
    fieldMediaIds: claim.fieldMediaIds ?? [],
    amountClaimed: Number(claim.amountClaimed) || 0,
    amountPaid: Number(claim.amountPaid) || 0,
    checklist,
    commsLog: claim.commsLog ?? [],
    damageDocumentation: claim.damageDocumentation,
    resolutionProposal: claim.resolutionProposal,
    resolutionType: claim.resolutionType,
    denialReason: claim.denialReason,
  };

  const synced = syncClaimWorkflow(base);
  return {
    ...base,
    ...synced,
    status: deriveClaimStatus({ ...base, ...synced }),
  };
}
