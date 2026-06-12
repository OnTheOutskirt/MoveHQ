import { getMoveEstimatedValue } from "@/lib/moves/move-priority-tier";
import { sumCrewHotelClientCharges } from "@/lib/moves/job-day-crew-hotel";
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
    return core + valuation.premium + sumCrewHotelClientCharges(move);
  }
  if (move.quoteType === "hourly" && move.quoteAmount != null) {
    const discount = computeQuoteDiscount(move, discountReasons);
    if (discount?.kind === "dollar" && discount.discountedBallparkTotal != null) {
      return discount.discountedBallparkTotal + valuation.premium + sumCrewHotelClientCharges(move);
    }
    const hours = resolveBallparkHours(move);
    if (hours != null) {
      const rate = discount?.discountedLaborRate ?? move.quoteAmount;
      return estimateHourlyMoveTotal(move, hours, rate) + valuation.premium + sumCrewHotelClientCharges(move);
    }
    return move.quoteAmount + sumCrewHotelClientCharges(move);
  }
  const base = move.quoteAmount ?? getMoveEstimatedValue(move) ?? 0;
  return base + sumCrewHotelClientCharges(move);
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
  if (move.sentContract?.depositAmount != null && move.sentContract.depositAmount > 0) {
    depositReceived = move.sentContract.depositAmount;
  } else if (move.pipelineStage === "booked" || move.pipelineStage === "completed") {
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
