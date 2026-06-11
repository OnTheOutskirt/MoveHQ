import {
  estimateCubicFeetFromIntake,
  estimateWeightFromCubicFeet,
  resolveFlatRateInventoryBasis,
} from "@/lib/moves/inventory-basis";
import { getMoveOperationalSummary } from "@/lib/moves/move-operational";
import { resolveCurrentHourlyCrewRate } from "@/lib/pricing/rate-resolution";
import type { MoveRecord } from "@/lib/moves/types";
import { defaultSettings } from "@/lib/settings/defaults";

export const FLAT_AI_QUOTE_STEPS = [
  "Reviewing inventory & access",
  "Sizing crew and truck",
  "Calculating labor & travel",
  "Applying packing & specialty fees",
  "Finalizing flat rate total",
] as const;

export const HOURLY_AI_QUOTE_STEPS = [
  "Reviewing move scope",
  "Estimating on-site hours",
  "Setting crew hourly rate",
  "Adding travel & materials fees",
  "Building hourly quote package",
] as const;

export type AiQuoteType = "flat" | "hourly";

export function aiQuoteSteps(type: AiQuoteType): readonly string[] {
  return type === "flat" ? FLAT_AI_QUOTE_STEPS : HOURLY_AI_QUOTE_STEPS;
}

function parseHoursMidpoint(hoursLabel: string): number {
  const match = hoursLabel.match(/(\d+)\s*[–-]\s*(\d+)/);
  if (match) {
    return (Number(match[1]) + Number(match[2])) / 2;
  }
  const single = hoursLabel.match(/(\d+)/);
  return single ? Number(single[1]) : 8;
}

/** Demo AI flat-rate engine — uses intake, access, inventory basis, and scope signals. */
export function computeFlatRateQuoteAmount(
  move: MoveRecord,
  defaults = defaultSettings.defaults,
): number {
  const { intake } = move;
  const basis = resolveFlatRateInventoryBasis(defaults, intake);
  const cubicFeet = estimateCubicFeetFromIntake(intake);
  const weightLbs = estimateWeightFromCubicFeet(cubicFeet);

  let base = 1_650;

  if (basis === "weight") {
    base += Math.round(weightLbs * 0.42);
  } else {
    base += Math.round(cubicFeet * 2.85);
  }

  const boxes = intake.estimatedBoxCount ?? 0;
  base += boxes * 7;

  if (intake.homeSizeLabel.includes("4") || intake.homeSizeLabel.includes("5")) base += 450;
  else if (intake.homeSizeLabel.includes("3")) base += 250;
  else if (intake.homeSizeLabel.includes("2")) base += 100;

  if (intake.packingService === "full") base += 850;
  else if (intake.packingService === "partial") base += 420;

  if (intake.hasSpecialtyItems) base += 380;
  if (intake.packingDensity === "heavy") base += 220;
  if (intake.hasJunk) base += 120;
  if (intake.hasTimingComplexity) base += 180;

  if (intake.origin.access.entrySteps === "Yes") base += 140;
  if (intake.destination.access.entrySteps === "Yes") base += 140;

  const longWalk = (v: string) => v.includes("100") || v.includes("200") || v.includes("300");
  if (longWalk(intake.origin.access.walk ?? "") || longWalk(intake.destination.access.walk ?? "")) {
    base += 160;
  }

  if (move.jobDays.length > 1) base += move.jobDays.length * 180;

  const withLiability = base + (intake.liabilityPremium ?? 0);
  return Math.max(950, Math.round(withLiability / 50) * 50);
}

/** Demo AI hourly rate — crew size and move complexity. */
export function computeHourlyRateQuoteAmount(move: MoveRecord): number {
  const sizes = move.jobDays.map((d) => d.crewSize).filter((n): n is number => n != null);
  const crew = sizes.length ? Math.max(...sizes) : parseInt(getMoveOperationalSummary(move).crewNeeded, 10) || 3;

  const base = resolveCurrentHourlyCrewRate();
  let rate = base;
  if (crew >= 5) rate = base + 60;
  else if (crew >= 4) rate = base + 30;
  else if (crew === 2) rate = Math.max(145, base - 20);

  if (move.intake.hasSpecialtyItems) rate += 15;
  if (move.intake.packingService === "full") rate += 10;

  return rate;
}

export function computeAiQuoteAmount(move: MoveRecord, type: AiQuoteType): number {
  return type === "flat" ? computeFlatRateQuoteAmount(move) : computeHourlyRateQuoteAmount(move);
}

export function aiQuoteSummary(
  move: MoveRecord,
  type: AiQuoteType,
  amount: number,
  defaults = defaultSettings.defaults,
): string {
  const ops = getMoveOperationalSummary(move);
  if (type === "flat") {
    const basis = resolveFlatRateInventoryBasis(defaults, move.intake);
    const basisLabel = basis === "weight" ? "weight" : "cu ft";
    return `AI flat rate ${formatCurrency(amount)} · priced on ${basisLabel} · ${ops.aiQuoteRecommendation}`;
  }
  const hours = parseHoursMidpoint(ops.estimatedHours);
  const ballpark = amount * hours + 150;
  return `${formatCurrency(amount)}/hr · ~${Math.round(hours)} hr est. · ballpark ${formatCurrency(ballpark)}`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function runAiQuoteGeneration(
  type: AiQuoteType,
  onProgress: (stepIndex: number, label: string, percent: number) => void,
): Promise<void> {
  const steps = aiQuoteSteps(type);
  for (let i = 0; i < steps.length; i++) {
    onProgress(i, steps[i]!, Math.round(((i + 1) / steps.length) * 100));
    await new Promise((resolve) => setTimeout(resolve, 520));
  }
}
