import type { DocumentSendKind } from "@/lib/moves/document-template-render";
import type { MoveRecord, MoveSentDocument } from "@/lib/moves/types";

export function moveHasCreatedQuote(move: MoveRecord): boolean {
  return (
    move.quoteAmount != null &&
    (move.quoteType === "flat" || move.quoteType === "hourly")
  );
}

export function buildMoveDocumentPortalUrl(
  moveId: string,
  kind: DocumentSendKind,
): string {
  const params = new URLSearchParams({ move: moveId, kind });
  return `/portal/view?${params.toString()}`;
}

export function pricingModelLabel(type: "flat" | "hourly"): string {
  return type === "flat" ? "flat rate" : "hourly";
}

const QUOTE_SENT_STAGES: MoveRecord["pipelineStage"][] = [
  "quote_sent",
  "needs_contract",
  "booked",
  "completed",
];

const CONTRACT_SENT_STAGES: MoveRecord["pipelineStage"][] = ["booked", "completed"];

export function inferSentQuoteFromPipeline(move: MoveRecord): MoveSentDocument | null {
  if (move.sentQuote) return move.sentQuote;
  if (!QUOTE_SENT_STAGES.includes(move.pipelineStage)) return null;
  return {
    sentAt: move.updatedAt,
    portalUrl: buildMoveDocumentPortalUrl(move.id, "quote"),
  };
}

export function inferSentContractFromPipeline(move: MoveRecord): MoveSentDocument | null {
  if (move.sentContract) return move.sentContract;
  if (!CONTRACT_SENT_STAGES.includes(move.pipelineStage)) return null;
  return {
    sentAt: move.updatedAt,
    portalUrl: buildMoveDocumentPortalUrl(move.id, "contract"),
  };
}

export function resolveSentQuote(move: MoveRecord): MoveSentDocument | null {
  return move.sentQuote ?? inferSentQuoteFromPipeline(move);
}

export function resolveSentContract(move: MoveRecord): MoveSentDocument | null {
  return move.sentContract ?? inferSentContractFromPipeline(move);
}
