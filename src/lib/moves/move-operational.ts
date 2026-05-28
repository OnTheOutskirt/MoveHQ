import { formatMoveDate, formatQuote } from "./format";
import { packingDensityLabel, packingServiceLabel } from "./intake-display";
import type { MoveJobDay, MoveRecord } from "./types";

export type MoveOperationalSummary = {
  dateRangeLabel: string;
  estimatedRevenue: string;
  estimatedHours: string;
  jobDayCount: number;
  crewNeeded: string;
  coordinator: string;
  outstandingBalance: string;
  lastActivityLabel: string;
  pricingTypeLabel: "Hourly" | "Flat rate" | "Not set";
  inventorySummary: string;
  aiQuoteRecommendation: string;
  quoteConfidence: "High" | "Medium" | "Low" | null;
  costDrivers: string[];
};

function formatDateRange(move: MoveRecord): string {
  if (move.jobDays.length === 0) {
    return formatMoveDate(move.intake.moveDate || move.preferredDate);
  }
  const dates = [...move.jobDays].map((d) => d.date).sort();
  const first = dates[0];
  const last = dates[dates.length - 1];
  if (first === last) return formatMoveDate(first);
  return `${formatMoveDate(first)} – ${formatMoveDate(last)}`;
}

function estimateHours(move: MoveRecord): string {
  if (move.jobDays.length > 0) {
    const total = move.jobDays.reduce((s, d) => s + (d.hoursEstimated ?? 0), 0);
    if (total > 0) return `${total} hrs`;
  }
  const boxes = move.intake.estimatedBoxCount ?? 0;
  if (boxes > 150) return "18–22 hrs";
  if (boxes > 80) return "12–16 hrs";
  if (boxes > 40) return "8–12 hrs";
  return "6–10 hrs";
}

function crewNeeded(move: MoveRecord): string {
  const sizes = move.jobDays
    .map((d) => d.crewSize)
    .filter((n): n is number => n != null);
  if (sizes.length > 0) {
    const max = Math.max(...sizes);
    return `${max} movers`;
  }
  if (move.moveType === "Commercial") return "6 movers";
  if ((move.bedrooms ?? 0) >= 4) return "4 movers";
  return "3–4 movers";
}

function buildInventorySummary(move: MoveRecord): string {
  const { intake } = move;
  const parts: string[] = [];
  parts.push(intake.homeSizeLabel);
  parts.push(packingDensityLabel(intake.packingDensity));
  if (intake.rooms.length > 0) {
    parts.push(`${intake.rooms.length} rooms inventoried`);
  }
  if (intake.appliances.length > 0) {
    parts.push(
      `${intake.appliances.reduce((s, a) => s + a.quantity, 0)} appliances`,
    );
  }
  if (intake.hasSpecialtyItems) parts.push("specialty items flagged");
  if (intake.packingService === "full" || intake.packingService === "partial") {
    parts.push(packingServiceLabel(intake.packingService).toLowerCase());
  }
  const access = [
    intake.origin.access.entrySteps === "Yes" ? "stairs at origin" : null,
    intake.destination.access.entrySteps === "Yes" ? "stairs at destination" : null,
    intake.origin.access.elevator ? `elevator (${intake.origin.access.elevator})` : null,
  ].filter(Boolean);
  if (access.length) parts.push(access.join(", "));

  return parts.join(" · ") + ".";
}

function buildCostDrivers(move: MoveRecord): string[] {
  const { intake } = move;
  const drivers: string[] = [];
  if (intake.origin.access.entrySteps === "Yes" || intake.destination.access.entrySteps === "Yes") {
    drivers.push("Stairs");
  }
  const longWalk = (v: string) => v.includes("100") || v.includes("200") || v.includes("300");
  if (longWalk(intake.origin.access.walk ?? "") || longWalk(intake.destination.access.walk ?? "")) {
    drivers.push("Long carry");
  }
  if (intake.packingService === "full" || intake.packingService === "partial") {
    drivers.push("Packing");
  }
  if (intake.hasSpecialtyItems) drivers.push("Specialty items");
  if (intake.packingDensity === "heavy") drivers.push("High inventory density");
  if (intake.origin.access.coi?.includes("Yes") || intake.destination.access.coi?.includes("Yes")) {
    drivers.push("COI required");
  }
  if (intake.hasTimingComplexity) drivers.push("Timing constraints");
  return drivers;
}

function aiRecommendation(move: MoveRecord): { text: string; confidence: MoveOperationalSummary["quoteConfidence"] } {
  const crew = crewNeeded(move).replace(" movers", "");
  const trucks =
    move.jobDays.some((d) => d.truckSummary?.includes("2")) || move.moveType === "Commercial"
      ? "2 trucks"
      : "1 truck";
  const hours = estimateHours(move);
  const confidence: MoveOperationalSummary["quoteConfidence"] =
    move.intake.estimatedBoxCount && move.intake.rooms.length >= 3 ? "High" : "Medium";
  return {
    text: `${crew} movers · ${trucks} · ${hours}`,
    confidence,
  };
}

export function getMoveOperationalSummary(move: MoveRecord): MoveOperationalSummary {
  const sortedActivities = [...move.activities].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );
  const last = sortedActivities[0];
  const ai = aiRecommendation(move);

  let outstanding = "—";
  if (move.status === "booked" && move.quoteAmount) {
    outstanding = "$1,200"; // demo deposit balance
  } else if (move.quoteAmount && move.status === "quote_sent") {
    outstanding = "Deposit pending";
  }

  return {
    dateRangeLabel: formatDateRange(move),
    estimatedRevenue: formatQuote(move.quoteAmount, move.quoteType),
    estimatedHours: estimateHours(move),
    jobDayCount: move.jobDays.length,
    crewNeeded: crewNeeded(move),
    coordinator: move.assignedRep,
    outstandingBalance: outstanding,
    lastActivityLabel: last
      ? `${last.summary} · ${formatMoveDate(last.at.slice(0, 10))}`
      : "No activity yet",
    pricingTypeLabel:
      move.quoteType === "hourly"
        ? "Hourly"
        : move.quoteType === "flat"
          ? "Flat rate"
          : "Not set",
    inventorySummary: buildInventorySummary(move),
    aiQuoteRecommendation: ai.text,
    quoteConfidence: move.quoteAmount ? ai.confidence : null,
    costDrivers: buildCostDrivers(move),
  };
}
