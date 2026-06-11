import { resolveHourlyQuote } from "@/lib/moves/hourly-quote-settings";
import { formatMoney } from "@/lib/settings/document-valuation";
import type { DiscountReasonEntry } from "@/lib/settings/field-catalog-types";
import type { MoveRecord } from "./types";

export type QuoteDiscountKind = "percent" | "dollar";

export type MoveQuoteDiscount = {
  reasonId: string;
  kind: QuoteDiscountKind;
  value: number;
};

export type QuoteDiscountResult = {
  hasDiscount: boolean;
  reasonLabel: string;
  kind: QuoteDiscountKind;
  value: number;
  discountAmount: number;
  summary: string;
  originalLaborRate: number | null;
  discountedLaborRate: number | null;
  originalFlatTotal: number | null;
  discountedFlatTotal: number | null;
  originalBallparkTotal: number | null;
  discountedBallparkTotal: number | null;
};

export function findDiscountReason(
  reasons: DiscountReasonEntry[],
  reasonId: string,
): DiscountReasonEntry | undefined {
  return reasons.find((r) => r.id === reasonId);
}

export function discountReasonLabel(
  reasons: DiscountReasonEntry[],
  reasonId: string,
): string {
  return findDiscountReason(reasons, reasonId)?.label ?? reasonId;
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function clampDollar(value: number, max: number): number {
  return Math.min(Math.max(0, value), max);
}

/** Estimated move total for hourly quotes (labor + travel + dump; excludes materials/crating). */
export function estimateHourlyMoveTotal(
  move: MoveRecord,
  hours: number,
  laborRate?: number,
): number {
  const hourly = resolveHourlyQuote(move.intake, move);
  const rate = laborRate ?? move.quoteAmount ?? 0;
  let total = rate * hours + hourly.travelFee;
  if (move.intake.hasJunk) total += hourly.dumpFee;
  return Math.round(total);
}

export function resolveBallparkHours(move: MoveRecord): number | null {
  const estimated = move.jobDays.reduce((sum, d) => sum + (d.hoursEstimated ?? 0), 0);
  if (estimated > 0) return estimated;
  const hourly = resolveHourlyQuote(move.intake, move);
  return hourly.minimumHours > 0 ? hourly.minimumHours : null;
}

export function computeQuoteDiscount(
  move: MoveRecord,
  reasons: DiscountReasonEntry[],
): QuoteDiscountResult | null {
  const discount = move.quoteDiscount;
  if (
    !discount ||
    discount.value <= 0 ||
    move.quoteAmount == null ||
    move.quoteType == null
  ) {
    return null;
  }

  const reasonLabel = discountReasonLabel(reasons, discount.reasonId);
  const kind = discount.kind;
  const value = kind === "percent" ? clampPercent(discount.value) : discount.value;

  if (move.quoteType === "flat") {
    const original = move.quoteAmount;
    const discountAmount =
      kind === "percent"
        ? Math.round((original * value) / 100)
        : clampDollar(value, original);
    const discounted = Math.max(0, original - discountAmount);
    const summary = formatDiscountSummary(kind, value, reasonLabel, discountAmount);

    return {
      hasDiscount: discountAmount > 0,
      reasonLabel,
      kind,
      value,
      discountAmount,
      summary,
      originalLaborRate: null,
      discountedLaborRate: null,
      originalFlatTotal: original,
      discountedFlatTotal: discounted,
      originalBallparkTotal: null,
      discountedBallparkTotal: null,
    };
  }

  const originalRate = move.quoteAmount;
  const hours = resolveBallparkHours(move);

  if (kind === "percent") {
    const discountedRate = Math.round(originalRate * (1 - value / 100));
    const discountAmount =
      hours != null ? Math.round((originalRate - discountedRate) * hours) : 0;
    const summary = formatDiscountSummary(kind, value, reasonLabel, discountAmount || null);

    let originalBallpark: number | null = null;
    let discountedBallpark: number | null = null;
    if (hours != null) {
      originalBallpark = estimateHourlyMoveTotal(move, hours, originalRate);
      discountedBallpark = estimateHourlyMoveTotal(move, hours, discountedRate);
    }

    return {
      hasDiscount: discountedRate < originalRate,
      reasonLabel,
      kind,
      value,
      discountAmount: discountAmount || Math.round(originalRate - discountedRate),
      summary,
      originalLaborRate: originalRate,
      discountedLaborRate: discountedRate,
      originalFlatTotal: null,
      discountedFlatTotal: null,
      originalBallparkTotal: originalBallpark,
      discountedBallparkTotal: discountedBallpark,
    };
  }

  const originalBallpark =
    hours != null ? estimateHourlyMoveTotal(move, hours, originalRate) : null;
  const discountAmount =
    originalBallpark != null ? clampDollar(value, originalBallpark) : clampDollar(value, value);
  const discountedBallpark =
    originalBallpark != null ? Math.max(0, originalBallpark - discountAmount) : null;
  const summary = formatDiscountSummary(kind, value, reasonLabel, discountAmount);

  return {
    hasDiscount: discountAmount > 0,
    reasonLabel,
    kind,
    value,
    discountAmount,
    summary,
    originalLaborRate: originalRate,
    discountedLaborRate: originalRate,
    originalFlatTotal: null,
    discountedFlatTotal: null,
    originalBallparkTotal: originalBallpark,
    discountedBallparkTotal: discountedBallpark,
  };
}

function formatDiscountSummary(
  kind: QuoteDiscountKind,
  value: number,
  reasonLabel: string,
  discountAmount: number | null,
): string {
  const valuePart = kind === "percent" ? `${value}%` : formatMoney(value);
  const amountPart =
    discountAmount != null && discountAmount > 0 ? ` (−${formatMoney(discountAmount)})` : "";
  return `${valuePart} — ${reasonLabel}${amountPart}`;
}

/** Effective flat quote total after discount (for deposit / display). */
export function effectiveFlatQuoteTotal(
  move: MoveRecord,
  reasons: DiscountReasonEntry[],
): number {
  if (move.quoteType !== "flat" || move.quoteAmount == null) return move.quoteAmount ?? 0;
  const result = computeQuoteDiscount(move, reasons);
  return result?.discountedFlatTotal ?? move.quoteAmount;
}

/** Display labor rate for hourly quotes (discounted when percent discount applies). */
export function effectiveHourlyLaborRate(
  move: MoveRecord,
  reasons: DiscountReasonEntry[],
): number {
  if (move.quoteType !== "hourly" || move.quoteAmount == null) return move.quoteAmount ?? 0;
  const result = computeQuoteDiscount(move, reasons);
  return result?.discountedLaborRate ?? move.quoteAmount;
}

export function formatHourlyRate(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
