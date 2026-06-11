import { getMoveEstimatedValue } from "@/lib/moves/move-priority-tier";
import {
  computeQuoteDiscount,
  effectiveFlatQuoteTotal,
  estimateHourlyMoveTotal,
  resolveBallparkHours,
} from "@/lib/moves/quote-discount";
import {
  buildDocumentValuationContext,
  flatQuoteCoreAmount,
} from "@/lib/settings/document-valuation";
import type { DiscountReasonEntry } from "@/lib/settings/field-catalog-types";
import type { DefaultsSettings } from "@/lib/settings/types";
import type { MoveRecord } from "./types";

export type MoveDepositSummary = {
  quoteTotal: number;
  depositDue: number;
  depositReceived: number;
  balanceDue: number;
  depositLabel: string;
};

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function effectiveQuoteTotalForDeposit(
  move: MoveRecord,
  discountReasons: DiscountReasonEntry[],
): number {
  const valuation = buildDocumentValuationContext(move);

  if (move.quoteType === "flat" && move.quoteAmount != null) {
    const quoted = effectiveFlatQuoteTotal(move, discountReasons);
    const core = flatQuoteCoreAmount(quoted, move.intake.liabilityPremium ?? 0);
    return core + valuation.premium;
  }
  if (move.quoteType === "hourly" && move.quoteAmount != null) {
    const discount = computeQuoteDiscount(move, discountReasons);
    if (discount?.kind === "dollar" && discount.discountedBallparkTotal != null) {
      return discount.discountedBallparkTotal + valuation.premium;
    }
    const hours = resolveBallparkHours(move);
    if (hours != null) {
      const rate = discount?.discountedLaborRate ?? move.quoteAmount;
      return estimateHourlyMoveTotal(move, hours, rate) + valuation.premium;
    }
    return move.quoteAmount;
  }
  return move.quoteAmount ?? getMoveEstimatedValue(move) ?? 0;
}

export function computeMoveDeposit(
  move: MoveRecord,
  defaults: DefaultsSettings,
  discountReasons: DiscountReasonEntry[] = [],
): MoveDepositSummary {
  const quoteTotal = effectiveQuoteTotalForDeposit(move, discountReasons);

  const depositDue =
    defaults.depositMode === "percent"
      ? Math.round((quoteTotal * defaults.depositValue) / 100)
      : defaults.depositValue;

  let depositReceived = 0;
  if (move.pipelineStage === "booked" || move.pipelineStage === "completed") {
    depositReceived =
      move.pipelineStage === "completed" ? depositDue : Math.round(depositDue * 0.5);
  }

  const balanceDue = Math.max(0, quoteTotal - depositReceived);

  const depositLabel =
    defaults.depositMode === "percent"
      ? `${defaults.depositValue}% (${formatMoney(depositDue)})`
      : formatMoney(depositDue);

  return {
    quoteTotal,
    depositDue,
    depositReceived,
    balanceDue,
    depositLabel,
  };
}
