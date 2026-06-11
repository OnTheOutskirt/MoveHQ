import type { LiabilityCoverage } from "@/lib/moves/flat-rate-intake";
import { resolveHourlyQuote } from "@/lib/moves/hourly-quote-settings";
import {
  formatHourlyRate,
  type QuoteDiscountResult,
} from "@/lib/moves/quote-discount";
import type { MoveRecord } from "@/lib/moves/types";

export type ValuationOptionKey = Exclude<LiabilityCoverage, "unregulated"> | "none";

export const FULL_VALUE_MIN = 5_000;
export const FULL_VALUE_MAX = 100_000;
export const FULL_VALUE_PREMIUM_RATE = 0.015;

export const VALUATION_RELEASED = {
  key: "released" as const,
  title: "Released Value",
  subtitle: "$0.60 per pound per article",
  premium: 0,
  description:
    "Texas-required minimum liability. Included at no charge. Pays up to $0.60/lb per item — not full replacement value.",
};

export const VALUATION_UNREGULATED = {
  key: "unregulated" as const,
  title: "Unregulated move",
  subtitle: "No Texas household-goods valuation",
  description:
    "Texas household goods valuation does not apply. No liability coverage beyond any separate written agreement.",
};

export function fullValuePremium(declaredValue: number): number {
  return Math.round(declaredValue * FULL_VALUE_PREMIUM_RATE);
}

export function liabilityCoverageLabel(coverage: LiabilityCoverage | ""): string {
  if (coverage === "full") return "Full Value Protection";
  if (coverage === "released") return "Released Value ($0.60/lb)";
  if (coverage === "unregulated") return VALUATION_UNREGULATED.title;
  return "—";
}

/** Household-goods regulated vs exempt job types (demo heuristic until persisted on move). */
export function isRegulatedMove(move: MoveRecord): boolean {
  const exempt = new Set([
    "junk",
    "pack-only",
    "unpack-only",
    "load-unload-only",
    "in-home-rearrange",
    "in-facility",
    "office",
  ]);
  return !exempt.has(move.intake.jobType);
}

/** Effective selection for UI and documents — explicit intake choice or job-type default. */
export function resolveValuationSelection(
  move: MoveRecord,
): LiabilityCoverage | "" {
  const { liabilityCoverage } = move.intake;
  if (liabilityCoverage === "released" || liabilityCoverage === "full") {
    return liabilityCoverage;
  }
  if (liabilityCoverage === "unregulated") return "unregulated";
  return isRegulatedMove(move) ? "" : "unregulated";
}

/** Whether Texas valuation applies — respects explicit unregulated / released / full overrides. */
export function effectiveIsRegulatedMove(move: MoveRecord): boolean {
  const { liabilityCoverage } = move.intake;
  if (liabilityCoverage === "unregulated") return false;
  if (liabilityCoverage === "released" || liabilityCoverage === "full") return true;
  return isRegulatedMove(move);
}

export function declaredValueForMove(move: MoveRecord): number {
  if (move.intake.declaredValue != null && move.intake.declaredValue > 0) {
    return move.intake.declaredValue;
  }
  if (move.quoteAmount != null && move.quoteType === "flat") {
    return Math.min(FULL_VALUE_MAX, Math.max(FULL_VALUE_MIN, move.quoteAmount));
  }
  return 25_000;
}

export type DocumentValuationContext = {
  isRegulated: boolean;
  coverageKey: LiabilityCoverage | "";
  coverageLabel: string;
  declaredValue: number | null;
  premium: number;
};

/** Coverage shown on quotes/contracts — defaults to released when regulated and not yet chosen. */
export function resolveDocumentCoverageKey(
  move: MoveRecord,
): "released" | "full" | "" {
  const selection = resolveValuationSelection(move);
  if (selection === "released" || selection === "full") return selection;
  if (effectiveIsRegulatedMove(move)) return "released";
  return "";
}

export function buildDocumentValuationContext(move: MoveRecord): DocumentValuationContext {
  const isRegulated = effectiveIsRegulatedMove(move);
  const coverageKey = resolveDocumentCoverageKey(move);
  const declaredValue =
    coverageKey === "full" ? declaredValueForMove(move) : move.intake.declaredValue;
  const premium =
    move.intake.liabilityPremium ??
    (coverageKey === "full" && declaredValue ? fullValuePremium(declaredValue) : 0);

  return {
    isRegulated,
    coverageKey,
    coverageLabel: isRegulated ? liabilityCoverageLabel(coverageKey) : VALUATION_UNREGULATED.title,
    declaredValue: coverageKey === "full" ? declaredValue : null,
    premium,
  };
}

/** Flat quote total minus any valuation premium already baked into the stored quote. */
export function flatQuoteCoreAmount(
  quotedTotal: number,
  bakedPremium = 0,
): number {
  return Math.max(0, quotedTotal - bakedPremium);
}

export const PACKING_MATERIAL_RATES = [
  { label: "Small box", price: 4 },
  { label: "Medium box", price: 5 },
  { label: "Large box", price: 7 },
  { label: "Wardrobe box", price: 18 },
  { label: "TV box kit", price: 35 },
  { label: "Packing paper (bundle)", price: 22 },
  { label: "Dish pack kit", price: 12 },
  { label: "Shrink wrap (roll)", price: 28 },
  { label: "Mattress bag", price: 15 },
] as const;

export type HourlyPricingLine = {
  id: string;
  label: string;
  amount: string;
  /** Shown struck-through when a discount applies (e.g. original rate or total). */
  originalAmount?: string;
  note?: string;
  emphasis?: boolean;
};

export function buildFlatPricingLines(
  move: MoveRecord,
  valuation: DocumentValuationContext,
  discount?: QuoteDiscountResult | null,
): HourlyPricingLine[] {
  const quoted = discount?.discountedFlatTotal ?? move.quoteAmount ?? 0;
  const originalQuoted = discount?.originalFlatTotal ?? quoted;
  if (quoted <= 0) return [];

  const bakedPremium = move.intake.liabilityPremium ?? 0;
  const core = flatQuoteCoreAmount(quoted, bakedPremium);
  const premium = valuation.premium;
  const total = core + premium;
  const originalTotal = flatQuoteCoreAmount(originalQuoted, bakedPremium) + premium;

  const { intake } = move;
  const wardrobeUnits = intake.wardrobe.jonahCount + intake.wardrobe.clientOwnedCount;
  const packingIncluded =
    intake.packingService === "full" || intake.packingService === "partial";

  const lines: HourlyPricingLine[] = [
    {
      id: "labor",
      label: "Moving labor, truck & equipment",
      amount: "Included",
      note: "Professional crew, truck, blankets, floor protection, and standard equipment",
    },
    {
      id: "travel",
      label: "Travel & access",
      amount: "Included",
      note: "Crew travel and normal loading access for the agreed scope",
    },
  ];

  if (valuation.isRegulated && premium > 0) {
    lines.push({
      id: "liability",
      label: "Valuation coverage",
      amount: formatMoney(premium),
      note: `${valuation.coverageLabel} — included in your flat rate`,
    });
  } else if (valuation.isRegulated && valuation.coverageKey === "released") {
    lines.push({
      id: "liability",
      label: "Valuation coverage",
      amount: "Included",
      note: "Released Value ($0.60/lb) — Texas minimum liability",
    });
  }

  if (wardrobeUnits > 0) {
    lines.push({
      id: "wardrobe",
      label: "Wardrobe boxes",
      amount: "Included",
      note: `${wardrobeUnits} wardrobe box${wardrobeUnits === 1 ? "" : "es"} in scope`,
    });
  }

  if (packingIncluded) {
    lines.push({
      id: "materials",
      label: "Packing materials",
      amount: "Included",
      note:
        intake.packingService === "full"
          ? "Cartons and supplies for full pack — included in flat rate"
          : "Partial pack materials included for agreed rooms",
    });
  }

  if (discount?.hasDiscount) {
    lines.push({
      id: "discount",
      label: "Discount",
      amount: `−${formatMoney(discount.discountAmount)}`,
      note: discount.summary,
    });
  }

  lines.push({
    id: "total",
    label: "All-in flat rate",
    amount: formatMoney(total),
    originalAmount:
      discount?.hasDiscount && originalTotal > total
        ? formatMoney(originalTotal)
        : undefined,
    note: discount?.hasDiscount
      ? `Your discounted guaranteed price — was ${formatMoney(originalTotal)}`
      : "One guaranteed price for the agreed move scope — no surprise line items",
    emphasis: true,
  });

  return lines;
}

export function parseMoneyString(value: string | undefined): number {
  if (!value) return 0;
  return Number(value.replace(/[^0-9.-]/g, "")) || 0;
}

export type PortalValuationSelection = {
  coverageKey: "released" | "full";
  declaredValue: number;
};

function valuationPremiumForSelection(
  isRegulated: boolean,
  selection: PortalValuationSelection,
): number {
  if (!isRegulated || selection.coverageKey !== "full") return 0;
  return fullValuePremium(selection.declaredValue);
}

function recalcDepositDisplayVars(
  vars: Record<string, string>,
  newQuoteBasis: number,
): Pick<Record<string, string>, "deposit_amount" | "balance_due"> {
  const priorBasis = parseMoneyString(vars.deposit_quote_basis) || parseMoneyString(vars.quote_amount);
  const priorDeposit = parseMoneyString(vars.deposit_amount);
  const isPercent = vars.deposit_is_percent === "yes";
  const percent = Number(vars.deposit_percent) || 0;

  const depositDue = isPercent
    ? Math.round((newQuoteBasis * percent) / 100)
    : priorBasis > 0 && priorDeposit > 0 && !isPercent
      ? priorDeposit
      : priorDeposit;

  return {
    deposit_amount: formatMoney(depositDue),
    balance_due: formatMoney(Math.max(0, newQuoteBasis - depositDue)),
  };
}

export function rebuildHourlyLinesForValuation(
  existingLines: HourlyPricingLine[],
  valuation: {
    isRegulated: boolean;
    coverageKey: string;
    coverageLabel: string;
    premium: number;
  },
): HourlyPricingLine[] {
  const lines = existingLines.filter((line) => line.id !== "liability");

  if (valuation.isRegulated && valuation.premium > 0) {
    lines.push({
      id: "liability",
      label: "Valuation coverage",
      amount: formatMoney(valuation.premium),
      note: valuation.coverageLabel,
    });
  } else if (valuation.isRegulated && valuation.coverageKey === "released") {
    lines.push({
      id: "liability",
      label: "Valuation coverage",
      amount: "Included",
      note: "Released Value ($0.60/lb)",
    });
  }

  return lines;
}

/** Rebuild flat-rate lines and quote when the customer changes valuation on the portal. */
export function applyValuationToFlatVars(
  vars: Record<string, string>,
  selection: PortalValuationSelection,
): Record<string, string> {
  const isRegulated = isRegulatedFromVars(vars);
  const premium = valuationPremiumForSelection(isRegulated, selection);
  const baseCore =
    parseMoneyString(vars.quote_base_core) ||
    flatQuoteCoreAmount(
      parseMoneyString(vars.quote_amount),
      parseMoneyString(vars.liability_premium),
    );
  const newTotal = baseCore + premium;
  const coverageLabel = liabilityCoverageLabel(selection.coverageKey);
  const existingLines = parseFlatLinesFromVars(vars);
  const flatLines = rebuildFlatLinesForValuation(
    existingLines,
    {
      isRegulated,
      coverageKey: selection.coverageKey,
      coverageLabel,
      premium,
    },
    newTotal,
  );

  return {
    ...vars,
    quote_amount: formatMoney(newTotal),
    quote_total: formatMoney(newTotal),
    quote_base_core: String(baseCore),
    liability_coverage_key: selection.coverageKey,
    liability_coverage_label: coverageLabel,
    declared_value:
      selection.coverageKey === "full" ? String(selection.declaredValue) : "",
    liability_premium: premium > 0 ? formatMoney(premium) : "",
    flat_lines_json: JSON.stringify(flatLines),
    ...recalcDepositDisplayVars(vars, newTotal),
  };
}

/** Rebuild hourly lines and ballpark when the customer changes valuation on the portal. */
export function applyValuationToHourlyVars(
  vars: Record<string, string>,
  selection: PortalValuationSelection,
): Record<string, string> {
  const isRegulated = isRegulatedFromVars(vars);
  const premium = valuationPremiumForSelection(isRegulated, selection);
  const coverageLabel = liabilityCoverageLabel(selection.coverageKey);
  const ballparkCore =
    parseMoneyString(vars.hourly_ballpark_core) ||
    Math.max(
      0,
      parseMoneyString(vars.hourly_ballpark_total) - parseMoneyString(vars.liability_premium),
    );
  const newBallpark = ballparkCore > 0 ? ballparkCore + premium : 0;
  const hourlyLines = rebuildHourlyLinesForValuation(parseHourlyLinesFromVars(vars), {
    isRegulated,
    coverageKey: selection.coverageKey,
    coverageLabel,
    premium,
  });

  const next: Record<string, string> = {
    ...vars,
    liability_coverage_key: selection.coverageKey,
    liability_coverage_label: coverageLabel,
    declared_value:
      selection.coverageKey === "full" ? String(selection.declaredValue) : "",
    liability_premium: premium > 0 ? formatMoney(premium) : "",
    hourly_lines_json: JSON.stringify(hourlyLines),
  };

  if (ballparkCore > 0) {
    next.hourly_ballpark_core = String(ballparkCore);
    next.hourly_ballpark_total = formatMoney(newBallpark);
    next.has_ballpark = "yes";
    next.quote_total = `${formatMoney(newBallpark)} ballpark`;
    Object.assign(next, recalcDepositDisplayVars(vars, newBallpark));
  }

  return next;
}

/** Apply portal valuation selection to flat or hourly document vars. */
export function applyValuationToPortalVars(
  vars: Record<string, string>,
  selection: PortalValuationSelection,
): Record<string, string> {
  const pricingKind = vars.pricing_type_key;
  if (pricingKind === "hourly") return applyValuationToHourlyVars(vars, selection);
  if (pricingKind === "flat") return applyValuationToFlatVars(vars, selection);
  return vars;
}

export function rebuildFlatLinesForValuation(
  existingLines: HourlyPricingLine[],
  valuation: {
    isRegulated: boolean;
    coverageKey: string;
    coverageLabel: string;
    premium: number;
  },
  newTotal: number,
): HourlyPricingLine[] {
  const lines = existingLines.filter(
    (line) => line.id !== "card" && line.id !== "liability" && line.id !== "total",
  );

  if (valuation.isRegulated && valuation.premium > 0) {
    lines.push({
      id: "liability",
      label: "Valuation coverage",
      amount: formatMoney(valuation.premium),
      note: `${valuation.coverageLabel} — included in your flat rate`,
    });
  } else if (valuation.isRegulated && valuation.coverageKey === "released") {
    lines.push({
      id: "liability",
      label: "Valuation coverage",
      amount: "Included",
      note: "Released Value ($0.60/lb) — Texas minimum liability",
    });
  }

  lines.push({
    id: "total",
    label: "All-in flat rate",
    amount: formatMoney(newTotal),
    note: "One guaranteed price for the agreed move scope — no surprise line items",
    emphasis: true,
  });

  return lines;
}

export function parseFlatLinesFromVars(vars: Record<string, string>): HourlyPricingLine[] {
  try {
    const raw = JSON.parse(vars.flat_lines_json || "[]") as unknown;
    if (!Array.isArray(raw)) return [];
    return (raw as HourlyPricingLine[]).filter((line) => line.id !== "card");
  } catch {
    return [];
  }
}

export function buildHourlyPricingLines(
  move: MoveRecord,
  valuation: DocumentValuationContext,
  hourlyNotToExceed?: number,
  discount?: QuoteDiscountResult | null,
): HourlyPricingLine[] {
  const { intake } = move;
  const hourly = resolveHourlyQuote(intake, move);
  const laborRate = discount?.discountedLaborRate ?? move.quoteAmount;
  const originalLaborRate = discount?.originalLaborRate ?? move.quoteAmount;
  const hourlyRate = laborRate != null ? formatHourlyRate(laborRate) : "—";
  const originalHourlyRate =
    discount?.hasDiscount &&
    originalLaborRate != null &&
    laborRate != null &&
    originalLaborRate > laborRate
      ? `${formatHourlyRate(originalLaborRate)}/hr`
      : undefined;

  const lines: HourlyPricingLine[] = [
    {
      id: "labor",
      label: "Labor rate",
      amount: `${hourlyRate}/hr`,
      originalAmount: originalHourlyRate,
      note:
        discount?.hasDiscount && discount.kind === "percent"
          ? `Discounted labor rate · ${hourly.minimumHours}-hour minimum on local moves`
          : `Billed by the hour · ${hourly.minimumHours}-hour minimum on local moves`,
      emphasis: true,
    },
    {
      id: "travel",
      label: "Travel fee (flat)",
      amount: formatMoney(hourly.travelFee),
      note: "Covers crew travel to and from your addresses",
    },
  ];

  const packing =
    intake.packingService === "full" || intake.packingService === "partial";
  if (packing) {
    lines.push({
      id: "materials",
      label: "Packing materials",
      amount: "As used",
      note: "Charged only for cartons and supplies we use on move day — see rates below",
    });
  }

  if (intake.hasJunk) {
    lines.push({
      id: "dump",
      label: "Dump / disposal fee",
      amount: formatMoney(hourly.dumpFee),
      note: "If haul-away is required",
    });
  }

  if (intake.hasSpecialtyItems) {
    lines.push({
      id: "crating",
      label: "Crating / specialty handling",
      amount: `From ${formatMoney(hourly.cratingFrom)}`,
      note: "Quoted per item when applicable",
    });
  }

  if (valuation.isRegulated && valuation.premium > 0) {
    lines.push({
      id: "liability",
      label: "Valuation coverage",
      amount: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(valuation.premium),
      note: valuation.coverageLabel,
    });
  } else if (valuation.isRegulated && valuation.coverageKey === "released") {
    lines.push({
      id: "liability",
      label: "Valuation coverage",
      amount: "Included",
      note: "Released Value ($0.60/lb)",
    });
  }

  if (discount?.hasDiscount && discount.kind === "dollar") {
    lines.push({
      id: "discount",
      label: "Discount",
      amount: `−${formatMoney(discount.discountAmount)}`,
      note: `${discount.summary} — applied to estimated move total`,
    });
  }

  if (hourlyNotToExceed != null && hourlyNotToExceed > 0) {
    lines.push({
      id: "nte",
      label: "Not-to-exceed ceiling",
      amount: formatMoney(hourlyNotToExceed),
      note: "Your invoice will not exceed this amount without written approval",
    });
  }

  return lines;
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function parseHourlyLinesFromVars(vars: Record<string, string>): HourlyPricingLine[] {
  try {
    const raw = JSON.parse(vars.hourly_lines_json || "[]") as unknown;
    return Array.isArray(raw) ? (raw as HourlyPricingLine[]) : [];
  } catch {
    return [];
  }
}

export function isRegulatedFromVars(
  vars: Record<string, string>,
  forceUnregulated?: boolean,
): boolean {
  if (forceUnregulated) return false;
  return vars.is_regulated_move !== "no";
}

const SAMPLE_HOURLY_LINES: HourlyPricingLine[] = [
  {
    id: "labor",
    label: "Labor rate",
    amount: "$185/hr",
    note: "Billed by the hour · 3-hour minimum on local moves",
    emphasis: true,
  },
  { id: "travel", label: "Travel fee (flat)", amount: "$150", note: "Crew travel to and from your addresses" },
  {
    id: "materials",
    label: "Packing materials",
    amount: "As used",
    note: "Charged only for cartons and supplies we use on move day",
  },
  { id: "dump", label: "Dump / disposal fee", amount: "$85", note: "If haul-away is required" },
  {
    id: "liability",
    label: "Valuation coverage",
    amount: "Included",
    note: "Released Value ($0.60/lb)",
  },
];

export function hourlyBallparkFromRate(rate: number, hours = 8): { total: string; note: string } {
  const labor = rate * hours;
  const total = labor + 150;
  return {
    total: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(total),
    note: `Based on ~${hours} hours on site plus travel — final invoice depends on actual time`,
  };
}

export function sampleValuationVars(
  base: Record<string, string>,
  options?: {
    pricing?: "flat" | "hourly";
    forceUnregulated?: boolean;
    showBallpark?: boolean;
  },
): Record<string, string> {
  const pricing = options?.pricing ?? "flat";
  const regulated = !options?.forceUnregulated;
  const showBallpark = options?.showBallpark ?? true;

  if (pricing === "hourly") {
    const ballpark = hourlyBallparkFromRate(185, 8);
    return {
      ...base,
      pricing_type: "Hourly",
      pricing_type_key: "hourly",
      quote_total: showBallpark ? `${ballpark.total} ballpark` : "Hourly pricing",
      quote_amount: "$185",
      is_regulated_move: regulated ? "yes" : "no",
      liability_coverage_key: "released",
      liability_coverage_label: "Released Value ($0.60/lb)",
      declared_value: "",
      liability_premium: "",
      packing_on_quote: "yes",
      has_ballpark: showBallpark ? "yes" : "no",
      hourly_ballpark_core: showBallpark ? String(185 * 8 + 150) : "",
      hourly_ballpark_total: showBallpark ? ballpark.total : "",
      hourly_ballpark_note: showBallpark ? ballpark.note : "",
      hourly_lines_json: JSON.stringify(
        regulated
          ? [
              ...SAMPLE_HOURLY_LINES,
              {
                id: "nte",
                label: "Not-to-exceed ceiling",
                amount: "$25,000",
                note: "Your invoice will not exceed this amount without written approval",
              },
            ]
          : SAMPLE_HOURLY_LINES.filter((l) => l.id !== "liability"),
      ),
      hourly_nte_amount: "$25,000",
    };
  }

  const sampleFlatLines = [
    {
      id: "labor",
      label: "Moving labor, truck & equipment",
      amount: "Included",
      note: "Professional crew, truck, blankets, and equipment",
    },
    {
      id: "liability",
      label: "Valuation coverage",
      amount: "$728",
      note: "Full Value Protection — included in your flat rate",
    },
    {
      id: "total",
      label: "All-in flat rate",
      amount: base.quote_amount || "$4,850",
      note: "One guaranteed price for the agreed move scope",
      emphasis: true,
    },
  ];

  return {
    ...base,
    is_regulated_move: regulated ? "yes" : "no",
    liability_coverage_key: "full",
    liability_coverage_label: "Full Value Protection",
    declared_value: "48500",
    liability_premium: "$728",
    quote_base_core: String(parseMoneyString(base.quote_amount || "$4,850") - 728),
    packing_on_quote: base.packing_on_quote ?? "no",
    has_ballpark: "no",
    hourly_ballpark_total: "",
    hourly_ballpark_note: "",
    hourly_lines_json: "[]",
    flat_lines_json: JSON.stringify(sampleFlatLines),
    inventory_basis_label: "Cubic feet",
    inventory_volume_display: "1,240 cu ft",
    hourly_nte_amount: "",
  };
}
