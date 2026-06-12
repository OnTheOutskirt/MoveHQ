/**
 * How a quote was built (web AI vs phone vs office) — separate from `leadChannel`
 * (how they found you: Google, referral, etc.) and legacy `source`.
 */
import type {
  BookingReviewStatus,
  IntakeProgress,
  LeadChannel,
  MoveRecord,
  MoveSentDocument,
  MoveSource,
  PipelineStageId,
  QuoteChannel,
  WebsiteIntakeMeta,
} from "./types";

export type QuoteChannelConfig = {
  id: QuoteChannel;
  label: string;
  shortLabel: string;
  badge: string;
  description: string;
};

export const quoteChannelConfig: Record<QuoteChannel, QuoteChannelConfig> = {
  web_ai: {
    id: "web_ai",
    label: "Website quote",
    shortLabel: "Web",
    badge: "bg-sky-100 text-sky-900 ring-1 ring-sky-200/80",
    description: "Flat-rate quote from the website AI tool",
  },
  phone: {
    id: "phone",
    label: "Phone quote",
    shortLabel: "Phone",
    badge: "bg-slate-100 text-slate-800 ring-1 ring-slate-200/80",
    description: "Quoted by phone with the sales team",
  },
  office: {
    id: "office",
    label: "Office quote",
    shortLabel: "Office",
    badge: "bg-violet-50 text-violet-900 ring-1 ring-violet-200/80",
    description: "Entered or quoted manually in MoveHQ",
  },
  unknown: {
    id: "unknown",
    label: "Quote channel unknown",
    shortLabel: "—",
    badge: "bg-slate-50 text-slate-500 ring-1 ring-slate-200/60",
    description: "Quote channel not set",
  },
};

export type IntakeProgressConfig = {
  id: IntakeProgress;
  label: string;
  badge: string;
};

export const intakeProgressConfig: Record<IntakeProgress, IntakeProgressConfig> = {
  started: {
    id: "started",
    label: "Intake started",
    badge: "bg-amber-50 text-amber-900 ring-1 ring-amber-200/80",
  },
  quoted: {
    id: "quoted",
    label: "Quoted online",
    badge: "bg-violet-50 text-violet-900 ring-1 ring-violet-200/80",
  },
  booked: {
    id: "booked",
    label: "Booked online",
    badge: "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/80",
  },
};

export function quoteChannelLabel(channel: QuoteChannel): string {
  return quoteChannelConfig[channel].label;
}

export function intakeProgressLabel(progress: IntakeProgress): string {
  return intakeProgressConfig[progress].label;
}

/** Infer quote channel from legacy `source` / `leadChannel` when not stored yet. */
export function deriveQuoteChannel(input: {
  source: MoveSource;
  leadChannel: LeadChannel;
}): QuoteChannel {
  if (input.source === "Phone" || input.leadChannel === "phone") return "phone";
  if (input.source === "Manual entry") return "office";
  if (input.source === "Website" || input.leadChannel === "website") return "web_ai";
  return "office";
}

function moveHasIssuedQuote(input: {
  pipelineStage: PipelineStageId;
  quoteAmount: number | null;
  websiteIntake?: WebsiteIntakeMeta | null;
  sentQuote?: MoveSentDocument | null;
}): boolean {
  return (
    input.quoteAmount != null ||
    input.sentQuote != null ||
    Boolean(input.websiteIntake?.quotedAt) ||
    ["quote_sent", "needs_contract"].includes(input.pipelineStage)
  );
}

/** Derive website intake progress from current move state (source of truth for queues). */
export function deriveIntakeProgress(input: {
  pipelineStage: PipelineStageId;
  quoteAmount: number | null;
  bookingReviewStatus: BookingReviewStatus;
  quoteChannel: QuoteChannel;
  websiteIntake?: WebsiteIntakeMeta | null;
  sentQuote?: MoveSentDocument | null;
}): IntakeProgress {
  if (
    input.pipelineStage === "booked" ||
    input.pipelineStage === "completed" ||
    (input.bookingReviewStatus !== "not_required" &&
      input.bookingReviewStatus !== "rejected")
  ) {
    return "booked";
  }

  if (moveHasIssuedQuote(input)) return "quoted";

  return "started";
}

export function resolveQuoteChannel(
  move: Pick<MoveRecord, "quoteChannel" | "source" | "leadChannel">,
): QuoteChannel {
  if (move.quoteChannel && move.quoteChannel !== "unknown") return move.quoteChannel;
  return deriveQuoteChannel(move);
}

export function resolveIntakeProgress(
  move: Pick<
    MoveRecord,
    | "pipelineStage"
    | "quoteAmount"
    | "bookingReviewStatus"
    | "quoteChannel"
    | "source"
    | "leadChannel"
    | "websiteIntake"
    | "sentQuote"
  >,
): IntakeProgress {
  const quoteChannel = resolveQuoteChannel(move);
  return deriveIntakeProgress({
    pipelineStage: move.pipelineStage,
    quoteAmount: move.quoteAmount,
    bookingReviewStatus: move.bookingReviewStatus,
    quoteChannel,
    websiteIntake: move.websiteIntake,
    sentQuote: move.sentQuote,
  });
}

export function isWebAiQuote(move: Pick<MoveRecord, "quoteChannel" | "source" | "leadChannel">): boolean {
  return resolveQuoteChannel(move) === "web_ai";
}

/** Phone, office, and unknown quote channels — grouped for pipeline filters. */
export function isManualQuote(
  move: Pick<MoveRecord, "quoteChannel" | "source" | "leadChannel">,
): boolean {
  return !isWebAiQuote(move);
}

export type QuoteSourceFilter = "all" | "web" | "manual";
export type QuoteTypeFilter = "all" | "hourly" | "flat";

export function matchesQuoteSourceFilter(
  filter: QuoteSourceFilter,
  move: Pick<MoveRecord, "quoteChannel" | "source" | "leadChannel">,
): boolean {
  if (filter === "all") return true;
  if (filter === "web") return isWebAiQuote(move);
  return isManualQuote(move);
}

export function matchesQuoteTypeFilter(
  filter: QuoteTypeFilter,
  move: Pick<MoveRecord, "quoteType">,
): boolean {
  if (filter === "all") return true;
  return move.quoteType === filter;
}

export function quoteSourceGroupLabel(
  move: Pick<MoveRecord, "quoteChannel" | "source" | "leadChannel">,
): string {
  return isWebAiQuote(move) ? "Web quote" : "Manual quote";
}

export type WebPipelineBadgeState = "incomplete" | "quoted" | "booked";

export type WebPipelineBadge = {
  state: WebPipelineBadgeState;
  label: string;
  badge: string;
};

const webPipelineBadgeByProgress: Record<IntakeProgress, WebPipelineBadge> = {
  started: {
    state: "incomplete",
    label: "Web · incomplete",
    badge: "bg-amber-50 text-amber-900 ring-1 ring-amber-200/80",
  },
  quoted: {
    state: "quoted",
    label: "Web · quoted",
    badge: "bg-violet-50 text-violet-900 ring-1 ring-violet-200/80",
  },
  booked: {
    state: "booked",
    label: "Web · booked",
    badge: "bg-sky-100 text-sky-900 ring-1 ring-sky-200/80",
  },
};

const WEB_BOOKING_REVIEW_BADGE: WebPipelineBadge = {
  state: "booked",
  label: "Web · needs review",
  badge: "bg-sky-100 text-sky-900 ring-1 ring-sky-200/80",
};

export type WebsiteQueueMoveFields = Pick<
  MoveRecord,
  | "quoteChannel"
  | "source"
  | "leadChannel"
  | "conditionStatus"
  | "pipelineStage"
  | "quoteAmount"
  | "bookingReviewStatus"
  | "websiteIntake"
  | "sentQuote"
>;

/** Single pipeline chip for website quotes — hidden once the move leaves web queues. */
export function resolveWebPipelineBadge(
  move: WebsiteQueueMoveFields,
): WebPipelineBadge | null {
  if (!isWebAiQuote(move)) return null;
  if (matchesWebsiteQueue(move, "booked_review")) return WEB_BOOKING_REVIEW_BADGE;
  if (matchesWebsiteQueue(move, "quoted")) return webPipelineBadgeByProgress.quoted;
  if (matchesWebsiteQueue(move, "incomplete")) return webPipelineBadgeByProgress.started;
  return null;
}

export function applyAcquisitionFields<T extends MoveRecord>(move: T): T {
  const quoteChannel = resolveQuoteChannel(move);
  const intakeProgress = deriveIntakeProgress({
    pipelineStage: move.pipelineStage,
    quoteAmount: move.quoteAmount,
    bookingReviewStatus: move.bookingReviewStatus,
    quoteChannel,
    websiteIntake: move.websiteIntake,
    sentQuote: move.sentQuote,
  });
  return {
    ...move,
    quoteChannel,
    intakeProgress,
    websiteIntake: move.websiteIntake ?? null,
  };
}

export function approveWebsiteBookingReview(move: MoveRecord): MoveRecord {
  if (
    move.bookingReviewStatus === "not_required" ||
    move.bookingReviewStatus === "approved"
  ) {
    return move;
  }
  return applyAcquisitionFields({
    ...move,
    bookingReviewStatus: "approved",
    conditionStatus:
      move.conditionStatus === "needs_review" ? "active" : move.conditionStatus,
  });
}

export const WEBSITE_QUEUE_IDS = ["incomplete", "quoted", "booked_review"] as const;
export type WebsiteQueueId = (typeof WEBSITE_QUEUE_IDS)[number];

export const websiteQueueConfig: Record<
  WebsiteQueueId,
  { label: string; description: string; exitHint: string }
> = {
  incomplete: {
    label: "Incomplete intakes",
    description: "Customer started online but did not finish — still on New Lead with no quote.",
    exitHint:
      "Clears when you advance the move, issue a quote, mark lost, or mark handled on the move detail.",
  },
  quoted: {
    label: "Quoted, not booked",
    description: "AI flat-rate quote is out — follow up until they book or you mark lost.",
    exitHint:
      "Clears when booked, marked lost, or when you mark handled on the move detail.",
  },
  booked_review: {
    label: "Booked — needs review",
    description: "Customer booked online — verify quote, upsell, and schedule kickoff call.",
    exitHint: "Clears when you mark the web booking reviewed on the move detail.",
  },
};

export function isWebsiteQueueDismissed(
  move: Pick<MoveRecord, "websiteIntake">,
  queue: WebsiteQueueId,
): boolean {
  return move.websiteIntake?.dismissedQueues?.includes(queue) ?? false;
}

export function resolveActiveWebsiteQueue(move: WebsiteQueueMoveFields): WebsiteQueueId | null {
  if (matchesWebsiteQueue(move, "booked_review")) return "booked_review";
  if (matchesWebsiteQueue(move, "quoted")) return "quoted";
  if (matchesWebsiteQueue(move, "incomplete")) return "incomplete";
  return null;
}

/** Hide redundant condition pill when the web queue badge already covers booked review. */
export function shouldShowOverviewConditionPill(
  move: Pick<MoveRecord, "conditionStatus"> & WebsiteQueueMoveFields,
): boolean {
  if (move.conditionStatus !== "needs_review") return true;
  return !needsWebsiteBookingReview(move);
}

/** Hide booking-review pill when web pipeline badge or review panel covers it. */
export function shouldShowOverviewBookingReviewPill(move: WebsiteQueueMoveFields): boolean {
  if (move.bookingReviewStatus === "not_required") return false;
  if (needsWebsiteBookingReview(move)) return false;
  if (resolveWebPipelineBadge(move)) return false;
  return true;
}

export function dismissWebsiteQueueMove(move: MoveRecord, queue: WebsiteQueueId): MoveRecord {
  if (queue === "booked_review") {
    return approveWebsiteBookingReview(move);
  }
  if (isWebsiteQueueDismissed(move, queue)) return move;

  const meta = move.websiteIntake ?? {};
  return applyAcquisitionFields({
    ...move,
    websiteIntake: {
      ...meta,
      dismissedQueues: [...(meta.dismissedQueues ?? []), queue],
    },
  });
}

export function isEligibleForWebsiteQueues(move: WebsiteQueueMoveFields): boolean {
  if (!isWebAiQuote(move)) return false;
  if (move.conditionStatus === "lost") return false;
  return (
    move.conditionStatus === "active" ||
    move.conditionStatus === "needs_review" ||
    move.conditionStatus === "on_hold"
  );
}

/** Abandoned web session — still New Lead, no quote issued yet. */
export function matchesIncompleteWebQueue(move: WebsiteQueueMoveFields): boolean {
  if (!isEligibleForWebsiteQueues(move)) return false;
  if (move.pipelineStage !== "new_lead") return false;
  return !moveHasIssuedQuote(move);
}

/** Web quote issued but not booked yet (includes Needs Contract). */
export function matchesQuotedWebQueue(move: WebsiteQueueMoveFields): boolean {
  if (!isEligibleForWebsiteQueues(move)) return false;
  if (["booked", "completed"].includes(move.pipelineStage)) return false;
  if (needsWebsiteBookingReview(move)) return false;
  return moveHasIssuedQuote(move);
}

export function needsWebsiteBookingReview(move: WebsiteQueueMoveFields): boolean {
  if (!isWebAiQuote(move)) return false;
  if (move.conditionStatus === "lost") return false;
  return (
    move.bookingReviewStatus !== "not_required" && move.bookingReviewStatus !== "approved"
  );
}

export function matchesWebsiteQueue(
  move: WebsiteQueueMoveFields,
  queue: WebsiteQueueId,
): boolean {
  if (isWebsiteQueueDismissed(move, queue)) return false;

  switch (queue) {
    case "incomplete":
      return matchesIncompleteWebQueue(move);
    case "quoted":
      return matchesQuotedWebQueue(move);
    case "booked_review":
      return needsWebsiteBookingReview(move);
    default:
      return false;
  }
}

export function websiteQueueMoves(moves: MoveRecord[], queue: WebsiteQueueId): MoveRecord[] {
  return moves.filter((m) => matchesWebsiteQueue(m, queue));
}

export function websiteQueueSummary(moves: MoveRecord[]): Record<WebsiteQueueId, number> {
  return {
    incomplete: websiteQueueMoves(moves, "incomplete").length,
    quoted: websiteQueueMoves(moves, "quoted").length,
    booked_review: websiteQueueMoves(moves, "booked_review").length,
  };
}

export function websiteQueueTotal(moves: MoveRecord[]): number {
  const s = websiteQueueSummary(moves);
  return s.incomplete + s.quoted + s.booked_review;
}
