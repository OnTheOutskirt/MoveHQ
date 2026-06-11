import type { DocumentSendKind } from "@/lib/moves/document-template-render";
import {
  resolveSentContract,
  resolveSentQuote,
} from "@/lib/moves/move-document-send";
import type {
  MoveActivity,
  MoveActivityDocumentMeta,
  MoveRecord,
  MoveSentDocument,
} from "@/lib/moves/types";

export type MoveDocumentKind = DocumentSendKind;

export type MoveDocumentMilestoneKey =
  | "sent"
  | "viewed"
  | "booking_requested"
  | "signed"
  | "deposit_paid";

export type MoveDocumentMilestone = {
  key: MoveDocumentMilestoneKey;
  label: string;
  at: string | null;
  done: boolean;
};

export type MoveDocumentEngagement = {
  milestones: MoveDocumentMilestone[];
  /** Highest completed milestone for sorting and badges. */
  statusKey: MoveDocumentMilestoneKey;
  statusLabel: string;
  lastEventAt: string;
  needsAttention: boolean;
};

export type MoveDocumentListRow = {
  id: string;
  moveId: string;
  moveReference: string;
  customerName: string;
  assignedRep: string;
  preferredDate: string;
  kind: MoveDocumentKind;
  kindLabel: string;
  sentAt: string;
  portalUrl: string;
  explicitlySent: boolean;
  engagement: MoveDocumentEngagement;
};

export type MoveDocumentKindFilter = "all" | MoveDocumentKind;
export type MoveDocumentAttentionFilter = "all" | "needs_attention";

const KIND_LABELS: Record<MoveDocumentKind, string> = {
  quote: "Quote",
  contract: "Contract",
};

const STATUS_LABELS: Record<MoveDocumentMilestoneKey, string> = {
  sent: "Sent",
  viewed: "Viewed",
  booking_requested: "Booking requested",
  signed: "Signed",
  deposit_paid: "Deposit paid",
};

const STATUS_SHORT_LABELS: Record<MoveDocumentMilestoneKey, string> = {
  sent: "Sent",
  viewed: "Viewed",
  booking_requested: "Booking",
  signed: "Signed",
  deposit_paid: "Deposit",
};

export function documentMilestoneShortLabel(key: MoveDocumentMilestoneKey): string {
  return STATUS_SHORT_LABELS[key];
}

/** First incomplete milestone — what we're waiting on next. */
export function nextDocumentMilestone(
  milestones: MoveDocumentMilestone[],
): MoveDocumentMilestone | null {
  return milestones.find((milestone) => !milestone.done) ?? null;
}

function sentDocumentForKind(move: MoveRecord, kind: MoveDocumentKind): MoveSentDocument | null {
  return kind === "quote" ? resolveSentQuote(move) : resolveSentContract(move);
}

function documentActivities(
  move: MoveRecord,
  kind: MoveDocumentKind,
): MoveActivity[] {
  return move.activities.filter(
    (a) => a.document?.kind === kind || matchesLegacyDocumentSummary(a, kind),
  );
}

function matchesLegacyDocumentSummary(activity: MoveActivity, kind: MoveDocumentKind): boolean {
  if (activity.type !== "status_change" && activity.type !== "document") return false;
  const s = activity.summary.toLowerCase();
  if (kind === "quote") {
    return s.includes("quote sent") || s.includes("quote resent") || s.includes("book via quote");
  }
  return s.includes("contract sent") || s.includes("contract resent") || s.includes("signed");
}

function latestActivityAt(
  move: MoveRecord,
  kind: MoveDocumentKind,
  sent: MoveSentDocument,
): string {
  const fromActivities = documentActivities(move, kind)[0]?.at;
  const fromDoc = sent.lastViewedAt ?? sent.sentAt;
  return fromActivities && new Date(fromActivities) > new Date(fromDoc) ? fromActivities : fromDoc;
}

function activityEventAt(
  move: MoveRecord,
  kind: MoveDocumentKind,
  event: MoveActivityDocumentMeta["event"],
): string | null {
  const hit = move.activities.find(
    (a) =>
      a.document?.kind === kind &&
      a.document.event === event,
  );
  return hit?.at ?? null;
}

function pipelineFallbackAt(move: MoveRecord, kind: MoveDocumentKind, key: MoveDocumentMilestoneKey): string | null {
  if (kind === "quote") {
    if (key === "booking_requested" && ["needs_contract", "booked", "completed"].includes(move.pipelineStage)) {
      return move.updatedAt;
    }
    if (key === "viewed" && ["quote_sent", "needs_contract", "booked", "completed"].includes(move.pipelineStage)) {
      return move.updatedAt;
    }
  }
  if (kind === "contract") {
    if (key === "signed" && ["booked", "completed"].includes(move.pipelineStage)) {
      return move.updatedAt;
    }
    if (key === "deposit_paid" && ["booked", "completed"].includes(move.pipelineStage)) {
      return move.updatedAt;
    }
    if (key === "viewed" && ["booked", "completed"].includes(move.pipelineStage)) {
      return move.updatedAt;
    }
  }
  return null;
}

function milestoneAt(
  move: MoveRecord,
  kind: MoveDocumentKind,
  sent: MoveSentDocument,
  key: MoveDocumentMilestoneKey,
): string | null {
  switch (key) {
    case "sent":
      return sent.sentAt;
    case "viewed":
      return (
        sent.firstViewedAt ??
        activityEventAt(move, kind, "viewed") ??
        pipelineFallbackAt(move, kind, "viewed")
      );
    case "booking_requested":
      if (kind !== "quote") return null;
      return (
        sent.bookingRequestedAt ??
        activityEventAt(move, kind, "booking_requested") ??
        pipelineFallbackAt(move, kind, "booking_requested")
      );
    case "signed":
      if (kind !== "contract") return null;
      return (
        sent.signedAt ??
        activityEventAt(move, kind, "signed") ??
        pipelineFallbackAt(move, kind, "signed")
      );
    case "deposit_paid":
      if (kind !== "contract") return null;
      return (
        sent.depositPaidAt ??
        activityEventAt(move, kind, "deposit_paid") ??
        pipelineFallbackAt(move, kind, "deposit_paid")
      );
    default:
      return null;
  }
}

export function buildMoveDocumentEngagement(
  move: MoveRecord,
  kind: MoveDocumentKind,
): MoveDocumentEngagement | null {
  const sent = sentDocumentForKind(move, kind);
  if (!sent) return null;

  const quoteKeys: MoveDocumentMilestoneKey[] = ["sent", "viewed", "booking_requested"];
  const contractKeys: MoveDocumentMilestoneKey[] = ["sent", "viewed", "signed", "deposit_paid"];
  const keys = kind === "quote" ? quoteKeys : contractKeys;

  const milestones: MoveDocumentMilestone[] = keys.map((key) => {
    const at = milestoneAt(move, kind, sent, key);
    return {
      key,
      label: STATUS_LABELS[key],
      at,
      done: at != null,
    };
  });

  const doneMilestones = milestones.filter((m) => m.done);
  const statusKey = doneMilestones[doneMilestones.length - 1]?.key ?? "sent";
  const lastEventAt = latestActivityAt(move, kind, sent);

  const needsAttention = Boolean(
    kind === "quote"
      ? !milestones.find((m) => m.key === "booking_requested")?.done &&
          milestones.find((m) => m.key === "sent")?.done
      : !milestones.find((m) => m.key === "deposit_paid")?.done &&
          milestones.find((m) => m.key === "sent")?.done,
  );

  return {
    milestones,
    statusKey,
    statusLabel: STATUS_LABELS[statusKey],
    lastEventAt,
    needsAttention,
  };
}

export function listMoveDocuments(moves: MoveRecord[]): MoveDocumentListRow[] {
  const rows: MoveDocumentListRow[] = [];

  for (const move of moves) {
    for (const kind of ["quote", "contract"] as const) {
      const sent = sentDocumentForKind(move, kind);
      if (!sent) continue;

      const engagement = buildMoveDocumentEngagement(move, kind);
      if (!engagement) continue;

      const explicitField = kind === "quote" ? move.sentQuote : move.sentContract;

      rows.push({
        id: `${move.id}-${kind}`,
        moveId: move.id,
        moveReference: move.reference,
        customerName: move.customerName,
        assignedRep: move.assignedRep,
        preferredDate: move.preferredDate,
        kind,
        kindLabel: KIND_LABELS[kind],
        sentAt: sent.sentAt,
        portalUrl: sent.portalUrl,
        explicitlySent: explicitField != null,
        engagement,
      });
    }
  }

  return rows.sort(
    (a, b) => new Date(b.engagement.lastEventAt).getTime() - new Date(a.engagement.lastEventAt).getTime(),
  );
}

export function filterMoveDocuments(
  rows: MoveDocumentListRow[],
  options: {
    kind?: MoveDocumentKindFilter;
    attention?: MoveDocumentAttentionFilter;
    rep?: string;
    search?: string;
  },
): MoveDocumentListRow[] {
  let list = rows;

  if (options.kind && options.kind !== "all") {
    list = list.filter((r) => r.kind === options.kind);
  }

  if (options.attention === "needs_attention") {
    list = list.filter((r) => r.engagement.needsAttention);
  }

  if (options.rep && options.rep !== "all") {
    list = list.filter((r) => r.assignedRep === options.rep);
  }

  const q = options.search?.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (r) =>
        r.customerName.toLowerCase().includes(q) ||
        r.moveReference.toLowerCase().includes(q),
    );
  }

  return list;
}

export function countDocumentsByKind(rows: MoveDocumentListRow[]): Record<MoveDocumentKindFilter, number> {
  return {
    all: rows.length,
    quote: rows.filter((r) => r.kind === "quote").length,
    contract: rows.filter((r) => r.kind === "contract").length,
  };
}

export function countDocumentsNeedingAttention(rows: MoveDocumentListRow[]): number {
  return rows.filter((r) => r.engagement.needsAttention).length;
}

export function documentKindLabel(kind: MoveDocumentKind): string {
  return KIND_LABELS[kind];
}

export function formatDocumentSentAt(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}
