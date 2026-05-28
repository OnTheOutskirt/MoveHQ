/**
 * How a quote was built (web AI vs phone vs office) — separate from `leadChannel`
 * (how they found you: Google, referral, etc.) and legacy `source`.
 */
import type {
  BookingReviewStatus,
  IntakeProgress,
  LeadChannel,
  MoveRecord,
  MoveSource,
  QuoteChannel,
  WebsiteIntakeMeta,
} from "./types";
import { showOnPipelineBoard } from "./move-condition";
import { isMoveLost } from "./move-pipeline";

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

export function deriveIntakeProgress(input: {
  pipelineStage: MoveRecord["pipelineStage"];
  quoteAmount: number | null;
  bookingReviewStatus: BookingReviewStatus;
  quoteChannel: QuoteChannel;
}): IntakeProgress {
  if (
    input.pipelineStage === "booked" ||
    input.pipelineStage === "completed" ||
    input.bookingReviewStatus !== "not_required"
  ) {
    return "booked";
  }
  if (input.quoteAmount != null && ["quote_sent", "needs_contract"].includes(input.pipelineStage)) {
    return "quoted";
  }
  if (input.quoteChannel === "web_ai" && ["new_lead", "waiting"].includes(input.pipelineStage)) {
    return "started";
  }
  if (input.quoteAmount != null) return "quoted";
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
    | "intakeProgress"
    | "pipelineStage"
    | "quoteAmount"
    | "bookingReviewStatus"
    | "quoteChannel"
    | "source"
    | "leadChannel"
  >,
): IntakeProgress {
  if (move.intakeProgress) return move.intakeProgress;
  const quoteChannel = resolveQuoteChannel(move);
  return deriveIntakeProgress({
    pipelineStage: move.pipelineStage,
    quoteAmount: move.quoteAmount,
    bookingReviewStatus: move.bookingReviewStatus,
    quoteChannel,
  });
}

export function isWebAiQuote(move: Pick<MoveRecord, "quoteChannel" | "source" | "leadChannel">): boolean {
  return resolveQuoteChannel(move) === "web_ai";
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

/** Single pipeline chip for website quotes — null for phone, office, and unknown. */
export function resolveWebPipelineBadge(
  move: Pick<
    MoveRecord,
    | "quoteChannel"
    | "source"
    | "leadChannel"
    | "intakeProgress"
    | "pipelineStage"
    | "quoteAmount"
    | "bookingReviewStatus"
  >,
): WebPipelineBadge | null {
  if (!isWebAiQuote(move)) return null;
  const progress = resolveIntakeProgress(move);
  return webPipelineBadgeByProgress[progress];
}

export function applyAcquisitionFields<T extends MoveRecord>(move: T): T {
  const quoteChannel = resolveQuoteChannel(move);
  const intakeProgress = resolveIntakeProgress({ ...move, quoteChannel });
  return {
    ...move,
    quoteChannel,
    intakeProgress,
    websiteIntake: move.websiteIntake ?? null,
  };
}

export const WEBSITE_QUEUE_IDS = ["incomplete", "quoted", "booked_review"] as const;
export type WebsiteQueueId = (typeof WEBSITE_QUEUE_IDS)[number];

export const websiteQueueConfig: Record<
  WebsiteQueueId,
  { label: string; description: string }
> = {
  incomplete: {
    label: "Incomplete intakes",
    description: "Started the web quote but did not finish — contact info captured",
  },
  quoted: {
    label: "Quoted, not booked",
    description: "AI flat-rate quote issued — still needs booking or sales follow-up",
  },
  booked_review: {
    label: "Booked — needs review",
    description: "Auto-booked online — verify quote, upsell, and schedule kickoff call",
  },
};

export function needsWebsiteBookingReview(move: MoveRecord): boolean {
  if (!isWebAiQuote(move)) return false;
  return (
    move.bookingReviewStatus !== "not_required" && move.bookingReviewStatus !== "approved"
  );
}

export function matchesWebsiteQueue(move: MoveRecord, queue: WebsiteQueueId): boolean {
  if (!isWebAiQuote(move) || isMoveLost(move)) return false;

  const progress = resolveIntakeProgress(move);

  switch (queue) {
    case "incomplete":
      return progress === "started" && showOnPipelineBoard(move);
    case "quoted":
      return progress === "quoted" && showOnPipelineBoard(move);
    case "booked_review":
      return progress === "booked" && needsWebsiteBookingReview(move);
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
