import type { MoveRecord } from "@/lib/moves/types";
import { getClaimVendor } from "./claims-vendors";
import type {
  ClaimCategory,
  ClaimChecklistId,
  ClaimChecklistItem,
  ClaimCommsEntry,
  ClaimStatus,
  MoveClaim,
  NewMoveClaim,
} from "./claims-types";

export type WorkflowStepState = "completed" | "current" | "upcoming" | "skipped";

export type WorkflowStepMeta = {
  id: ClaimChecklistId;
  label: string;
  shortLabel: string;
  description: string;
  ownerHint: string;
};

export const WORKFLOW_STEP_META: Record<ClaimChecklistId, WorkflowStepMeta> = {
  intake_review: {
    id: "intake_review",
    label: "Review intake & move photos",
    shortLabel: "Intake review",
    description: "Open the move file, review crew photos, sign-off notes, and customer report.",
    ownerHint: "Claims coordinator",
  },
  document_damage: {
    id: "document_damage",
    label: "Document the issue in the claim record",
    shortLabel: "Document issue",
    description: "Capture what happened, where, estimated cost, and supporting details.",
    ownerHint: "Claims coordinator",
  },
  send_acknowledgement: {
    id: "send_acknowledgement",
    label: "Send acknowledgement to the customer",
    shortLabel: "Customer ack",
    description: "Let the customer know you received the claim and what happens next.",
    ownerHint: "Claims coordinator",
  },
  select_vendor: {
    id: "select_vendor",
    label: "Select repair / resolution vendor",
    shortLabel: "Pick vendor",
    description: "Choose the right repair partner based on damage type and location.",
    ownerHint: "Claims coordinator",
  },
  send_to_vendor: {
    id: "send_to_vendor",
    label: "Send claim package to vendor",
    shortLabel: "Send to vendor",
    description: "Email photos, scope, and move details to the vendor for quote or walkthrough.",
    ownerHint: "Claims coordinator",
  },
  waiting_vendor: {
    id: "waiting_vendor",
    label: "Wait for vendor response",
    shortLabel: "Vendor response",
    description: "Track the vendor quote or walkthrough — follow up before the due date.",
    ownerHint: "Claims coordinator",
  },
  propose_resolution: {
    id: "propose_resolution",
    label: "Propose resolution to the customer",
    shortLabel: "Propose resolution",
    description: "Present repair plan, credit, or next steps and get customer agreement.",
    ownerHint: "Claims coordinator",
  },
  closeout: {
    id: "closeout",
    label: "Close out claim & record payout",
    shortLabel: "Close out",
    description: "Record final outcome — payout, credit, denial, or insurance — and archive.",
    ownerHint: "Claims coordinator + manager if needed",
  },
};

const DAMAGE_STEPS: ClaimChecklistId[] = [
  "intake_review",
  "document_damage",
  "send_acknowledgement",
  "select_vendor",
  "send_to_vendor",
  "waiting_vendor",
  "propose_resolution",
  "closeout",
];

const SIMPLE_STEPS: ClaimChecklistId[] = [
  "intake_review",
  "document_damage",
  "send_acknowledgement",
  "propose_resolution",
  "closeout",
];

export function checklistIdsForCategory(category: ClaimCategory): ClaimChecklistId[] {
  return category === "damage" ? DAMAGE_STEPS : SIMPLE_STEPS;
}

export function createDefaultChecklist(category: ClaimCategory = "damage"): ClaimChecklistItem[] {
  return checklistIdsForCategory(category).map((id) => ({
    id,
    label: WORKFLOW_STEP_META[id].label,
    done: false,
  }));
}

/** @deprecated Use WORKFLOW_STEP_META */
export const CLAIM_CHECKLIST_DEFS = Object.values(WORKFLOW_STEP_META).map((s) => ({
  id: s.id,
  label: s.label,
}));

export function checklistLabel(id: ClaimChecklistId): string {
  return WORKFLOW_STEP_META[id]?.label ?? id;
}

export function checklistShortLabel(id: ClaimChecklistId): string {
  return WORKFLOW_STEP_META[id]?.shortLabel ?? id;
}

export function documentStepLabel(category: ClaimCategory): string {
  switch (category) {
    case "lost_item":
      return "Document missing item details";
    case "other":
      return "Document issue details";
    default:
      return WORKFLOW_STEP_META.document_damage.label;
  }
}

export function checklistProgress(checklist: ClaimChecklistItem[]): {
  done: number;
  total: number;
  pct: number;
} {
  const total = checklist.length;
  const done = checklist.filter((c) => c.done).length;
  return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
}

export function isChecklistDone(checklist: ClaimChecklistItem[], id: ClaimChecklistId): boolean {
  return checklist.find((c) => c.id === id)?.done ?? false;
}

export function markChecklistDone(
  checklist: ClaimChecklistItem[],
  id: ClaimChecklistId,
): ClaimChecklistItem[] {
  const ts = new Date().toISOString();
  return checklist.map((item) =>
    item.id === id ? { ...item, done: true, doneAt: ts } : item,
  );
}

export function nextWorkflowFocus(checklist: ClaimChecklistItem[]): ClaimChecklistId | null {
  const next = checklist.find((c) => !c.done);
  return next?.id ?? null;
}

export function currentStepLabel(claim: MoveClaim): string {
  const focus = nextWorkflowFocus(claim.checklist);
  if (!focus) {
    if (claim.status === "denied") return "Denied";
    if (claim.status === "completed") return "Closed";
    return "Complete";
  }
  return checklistShortLabel(focus);
}

export function getWorkflowStepState(
  claim: MoveClaim,
  stepId: ClaimChecklistId,
): WorkflowStepState {
  const allowed = new Set(checklistIdsForCategory(claim.category));
  if (!allowed.has(stepId)) return "skipped";

  const item = claim.checklist.find((c) => c.id === stepId);
  if (item?.done) return "completed";

  const focus = nextWorkflowFocus(claim.checklist);
  if (focus === stepId) return "current";
  return "upcoming";
}

export function isWaitingOnVendor(claim: MoveClaim): boolean {
  return Boolean(
    claim.vendorSentAt &&
      !claim.vendorResponseReceivedAt &&
      isChecklistDone(claim.checklist, "send_to_vendor") &&
      !isChecklistDone(claim.checklist, "waiting_vendor"),
  );
}

export function deriveClaimStatus(
  claim: Pick<
    MoveClaim,
    | "checklist"
    | "status"
    | "vendorSentAt"
    | "vendorResponseReceivedAt"
    | "resolutionType"
    | "category"
  >,
): ClaimStatus {
  if (isChecklistDone(claim.checklist, "closeout")) {
    return claim.resolutionType === "denied" ? "denied" : "completed";
  }
  if (isWaitingOnVendor(claim as MoveClaim)) return "pending";
  if (isChecklistDone(claim.checklist, "send_acknowledgement")) return "in_progress";
  return "new";
}

export function syncClaimWorkflow(claim: MoveClaim): Partial<MoveClaim> {
  const status = deriveClaimStatus(claim);
  const pendingReason =
    status === "pending" && isWaitingOnVendor(claim) ? ("vendor" as const) : undefined;
  const resolvedAt =
    status === "completed" || status === "denied"
      ? claim.resolvedAt ?? new Date().toISOString()
      : undefined;

  return {
    status,
    pendingReason,
    resolvedAt,
    updatedAt: new Date().toISOString(),
  };
}

/** Merge workflow field updates with derived status — keeps checklist/comms in the patch. */
function workflowPatch(claim: MoveClaim, updates: Partial<MoveClaim>): Partial<MoveClaim> {
  const merged = { ...claim, ...updates };
  return { ...updates, ...syncClaimWorkflow(merged) };
}

export function generateCommsId(): string {
  return `comms-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function appendCommsLog(
  log: ClaimCommsEntry[],
  entry: Omit<ClaimCommsEntry, "id" | "at">,
): ClaimCommsEntry[] {
  return [
    {
      ...entry,
      id: generateCommsId(),
      at: new Date().toISOString(),
    },
    ...log,
  ];
}

export function applyIntakeReviewed(claim: MoveClaim, summary?: string): Partial<MoveClaim> {
  const checklist = markChecklistDone(claim.checklist, "intake_review");
  const commsLog = summary
    ? appendCommsLog(claim.commsLog, {
        channel: "email",
        direction: "outbound",
        summary,
        recipient: "internal",
      })
    : claim.commsLog;
  return workflowPatch(claim, { checklist, commsLog });
}

export function applyIssueDocumented(
  claim: MoveClaim,
  documentation: string,
  amountClaimed?: number,
): Partial<MoveClaim> {
  const checklist = markChecklistDone(claim.checklist, "document_damage");
  return workflowPatch(claim, {
    checklist,
    damageDocumentation: documentation.trim(),
    amountClaimed: amountClaimed ?? claim.amountClaimed,
    description: claim.description?.trim()
      ? claim.description
      : documentation.trim().slice(0, 500),
  });
}

export function applyAcknowledgementSent(
  claim: MoveClaim,
  channel: "email" | "sms",
  summary: string,
): Partial<MoveClaim> {
  let checklist = markChecklistDone(claim.checklist, "send_acknowledgement");
  if (!isChecklistDone(checklist, "intake_review")) {
    checklist = markChecklistDone(checklist, "intake_review");
  }
  const commsLog = appendCommsLog(claim.commsLog, {
    channel,
    direction: "outbound",
    summary,
    recipient: "customer",
  });
  return workflowPatch(claim, {
    checklist,
    commsLog,
    acknowledgementSentAt: new Date().toISOString(),
  });
}

export function applyVendorPackageSent(
  claim: MoveClaim,
  vendorId: string,
  summary: string,
): Partial<MoveClaim> {
  let checklist = claim.checklist;
  checklist = markChecklistDone(checklist, "select_vendor");
  checklist = markChecklistDone(checklist, "send_to_vendor");
  checklist = checklist.map((item) =>
    item.id === "waiting_vendor" ? { ...item, done: false, doneAt: undefined } : item,
  );
  const vendor = getClaimVendor(vendorId);
  const commsLog = appendCommsLog(claim.commsLog, {
    channel: "vendor",
    direction: "outbound",
    summary,
    recipient: vendor?.name ?? vendorId,
  });
  const due = new Date();
  due.setDate(due.getDate() + 5);
  return workflowPatch(claim, {
    vendorId,
    checklist,
    commsLog,
    vendorSentAt: new Date().toISOString(),
    vendorResponseDue: due.toISOString().slice(0, 10),
    pendingReason: "vendor",
  });
}

export function applyVendorResponseReceived(claim: MoveClaim, notes?: string): Partial<MoveClaim> {
  const checklist = markChecklistDone(claim.checklist, "waiting_vendor");
  const commsLog = notes
    ? appendCommsLog(claim.commsLog, {
        channel: "vendor",
        direction: "inbound",
        summary: notes,
        recipient: claimVendorName(claim.vendorId),
      })
    : claim.commsLog;
  return workflowPatch(claim, {
    checklist,
    commsLog,
    vendorResponseReceivedAt: new Date().toISOString(),
    pendingReason: undefined,
  });
}

export function applyResolutionProposed(
  claim: MoveClaim,
  proposal: string,
  channel: "email" | "sms",
): Partial<MoveClaim> {
  const checklist = markChecklistDone(claim.checklist, "propose_resolution");
  const commsLog = appendCommsLog(claim.commsLog, {
    channel,
    direction: "outbound",
    summary: proposal.trim().slice(0, 200) || "Resolution proposed to customer",
    recipient: "customer",
  });
  return workflowPatch(claim, {
    checklist,
    commsLog,
    resolutionProposal: proposal.trim(),
  });
}

export type CloseoutInput = {
  resolutionType: NonNullable<MoveClaim["resolutionType"]>;
  amountPaid: number;
  denialReason?: string;
  closeoutNotes?: string;
};

export function applyCloseout(claim: MoveClaim, input: CloseoutInput): Partial<MoveClaim> {
  const checklist = markChecklistDone(claim.checklist, "closeout");
  const notes = [claim.notes, input.closeoutNotes?.trim()].filter(Boolean).join("\n\n");
  return workflowPatch(claim, {
    checklist,
    resolutionType: input.resolutionType,
    amountPaid: input.amountPaid,
    denialReason: input.resolutionType === "denied" ? input.denialReason?.trim() : undefined,
    notes: notes || claim.notes,
    resolvedAt: new Date().toISOString(),
  });
}

function claimVendorName(vendorId: string | undefined): string {
  return getClaimVendor(vendorId)?.name ?? "Vendor";
}

function moveOrigin(move: MoveRecord): string {
  const loc = move.jobDays[0]?.locations?.[0];
  return loc?.label ?? move.originAddress ?? "Origin TBD";
}

function moveDestination(move: MoveRecord): string {
  const days = move.jobDays;
  const last = days[days.length - 1];
  const locs = last?.locations ?? [];
  const dest = locs[locs.length - 1];
  return dest?.label ?? move.destinationAddress ?? "Destination TBD";
}

export function buildClaimDraftFromMove(
  move: MoveRecord,
  category: NewMoveClaim["category"] = "damage",
): Omit<NewMoveClaim, "moveId" | "customerName" | "moveReference"> {
  const moveDate = move.jobDays[0]?.date ?? move.createdAt.slice(0, 10);
  const titleByCategory: Record<NewMoveClaim["category"], string> = {
    damage: `Damage reported — ${move.reference}`,
    lost_item: `Missing item — ${move.reference}`,
    other: `Customer issue — ${move.reference}`,
  };
  const description = [
    `Customer: ${move.customerName}`,
    `Move date: ${moveDate}`,
    `Route: ${moveOrigin(move)} → ${moveDestination(move)}`,
    move.assignedRep ? `Sales rep: ${move.assignedRep}` : null,
    move.quoteAmount != null ? `Quoted: $${move.quoteAmount.toLocaleString()}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    status: "new",
    category,
    title: titleByCategory[category],
    description,
    reportedDate: new Date().toISOString().slice(0, 10),
    amountClaimed: 0,
    amountPaid: 0,
    reportedBy: move.assignedRep ? `Move file · ${move.assignedRep}` : "Move file",
    checklist: createDefaultChecklist(category),
    commsLog: [],
  };
}

/** Rebuild checklist when category changes on a fresh claim. */
export function migrateChecklistForCategory(
  claim: MoveClaim,
  nextCategory: ClaimCategory,
): ClaimChecklistItem[] {
  const hasProgress = claim.checklist.some((c) => c.done);
  if (hasProgress) return claim.checklist;
  return createDefaultChecklist(nextCategory);
}
