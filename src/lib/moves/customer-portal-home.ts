import { formatMoveDate } from "./format";
import {
  inferSentContractFromPipeline,
  inferSentQuoteFromPipeline,
  resolveSentContract,
  resolveSentQuote,
} from "./move-document-send";
import { isMovePostComplete } from "./move-customer-portal";
import type { MoveRecord } from "./types";

export type CustomerPortalDocumentKind = "quote" | "contract";

export type CustomerPortalDocumentCard = {
  kind: CustomerPortalDocumentKind;
  title: string;
  description: string;
  statusLabel: string;
  available: boolean;
};

export type CustomerPortalChecklistItem = {
  id: string;
  label: string;
  detail?: string;
  done: boolean;
};

export type MoveDayCountdown = {
  daysUntil: number;
  headline: string;
  subline: string;
  moveDateLabel: string;
};

export function buildCustomerPortalHomePath(
  moveId: string,
  options?: { staffPreview?: boolean; previewFeedback?: boolean },
): string {
  const params = new URLSearchParams({ move: moveId });
  if (options?.staffPreview) params.set("staff", "1");
  if (options?.previewFeedback) params.set("preview", "feedback");
  return `/portal/move?${params.toString()}`;
}

export function isStaffPortalPreview(searchParams: {
  get: (key: string) => string | null;
}): boolean {
  return searchParams.get("staff") === "1";
}

export function customerHasSignedContract(move: MoveRecord): boolean {
  const contract = resolveSentContract(move) ?? inferSentContractFromPipeline(move);
  if (contract?.signedAt) return true;
  return move.pipelineStage === "booked" || move.pipelineStage === "completed";
}

export function customerPortalDocuments(move: MoveRecord): CustomerPortalDocumentCard[] {
  const quote = resolveSentQuote(move) ?? inferSentQuoteFromPipeline(move);
  const contract = resolveSentContract(move) ?? inferSentContractFromPipeline(move);
  const signed = customerHasSignedContract(move);
  const bookingRequested = Boolean(quote?.bookingRequestedAt);
  const cards: CustomerPortalDocumentCard[] = [];

  if (quote) {
    cards.push({
      kind: "quote",
      title: signed || move.pipelineStage === "needs_contract" ? "Your estimate" : "View your estimate",
      description: bookingRequested
        ? "You requested to book — our team is preparing your agreement."
        : "Review pricing, scope, and what is included in your move.",
      statusLabel: bookingRequested ? "Booking requested" : "Sent",
      available: true,
    });
  }

  if (contract || signed || move.pipelineStage === "needs_contract") {
    cards.push({
      kind: "contract",
      title: signed ? "Signed agreement" : "Review & sign agreement",
      description: signed
        ? "Your signed contract, deposit, and valuation choices."
        : "Choose coverage and complete your moving contract.",
      statusLabel: signed
        ? contract?.depositPaidAt
          ? "Signed · deposit paid"
          : "Signed"
        : "Awaiting signature",
      available: Boolean(contract) || signed || move.pipelineStage === "needs_contract",
    });
  }

  return cards.filter((c) => c.available);
}

export function customerPortalChecklist(move: MoveRecord): CustomerPortalChecklistItem[] {
  if (!customerHasSignedContract(move) || isMovePostComplete(move)) return [];

  const contract = resolveSentContract(move) ?? inferSentContractFromPipeline(move);
  const signed = Boolean(contract?.signedAt) || move.pipelineStage === "booked";
  const depositPaid = Boolean(contract?.depositPaidAt);

  return [
    {
      id: "contract",
      label: "Sign moving agreement",
      detail: "Review coverage and secure your crew.",
      done: signed,
    },
    {
      id: "deposit",
      label: "Pay booking deposit",
      detail: "Deposit holds your move date on the calendar.",
      done: depositPaid,
    },
    {
      id: "inventory",
      label: "Confirm inventory list",
      detail: "Request changes if anything is missing or incorrect.",
      done: false,
    },
    {
      id: "prep",
      label: "Prepare for move day",
      detail: "Parking, access notes, and personal items to set aside.",
      done: false,
    },
  ];
}

export function getMoveDayCountdown(move: MoveRecord): MoveDayCountdown | null {
  if (!customerHasSignedContract(move)) return null;

  const rawDate =
    move.jobDays.find((d) => d.date)?.date ?? move.intake.moveDate ?? move.preferredDate;
  if (!rawDate) return null;

  const moveDate = new Date(`${rawDate}T12:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  moveDate.setHours(0, 0, 0, 0);

  const daysUntil = Math.round(
    (moveDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  const moveDateLabel = formatMoveDate(rawDate);

  if (isMovePostComplete(move)) {
    return {
      daysUntil,
      headline: "Move complete",
      subline: `Completed ${moveDateLabel}`,
      moveDateLabel,
    };
  }

  if (daysUntil === 0) {
    return {
      daysUntil,
      headline: "Move day is today",
      subline: "Your crew will reach out with arrival details.",
      moveDateLabel,
    };
  }

  if (daysUntil === 1) {
    return {
      daysUntil,
      headline: "Move day is tomorrow",
      subline: moveDateLabel,
      moveDateLabel,
    };
  }

  if (daysUntil > 1) {
    return {
      daysUntil,
      headline: `${daysUntil} days until move day`,
      subline: moveDateLabel,
      moveDateLabel,
    };
  }

  return {
    daysUntil,
    headline: `${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? "" : "s"} since move day`,
    subline: moveDateLabel,
    moveDateLabel,
  };
}
