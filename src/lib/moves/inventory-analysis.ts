import type { FlatRateIntake } from "@/lib/moves/flat-rate-intake";
import type { MoveRecord } from "@/lib/moves/types";
import type { DefaultsSettings } from "@/lib/settings/types";
import {
  estimateCubicFeetFromIntake,
  inventoryVolumeForMove,
  type InventoryVolumeEstimate,
} from "./inventory-basis";

export type InventoryComplexity = "light" | "moderate" | "heavy" | "specialty";

export type InventoryRiskFlag = {
  id: string;
  label: string;
  severity: "info" | "warning" | "critical";
  detail: string;
};

export type MoveInventoryAnalysis = {
  volume: InventoryVolumeEstimate;
  complexity: InventoryComplexity;
  complexityScore: number;
  roomCount: number;
  itemLineCount: number;
  estimatedBoxes: number | null;
  packingService: string;
  flags: InventoryRiskFlag[];
  insights: string[];
  /** Suggested packing materials from scope signals */
  supplyHints: { label: string; estimate: string }[];
};

function countItemLines(intake: FlatRateIntake): number {
  return intake.rooms.reduce((sum, room) => {
    const lines = room.items
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    return sum + Math.max(1, lines.length);
  }, 0);
}

function deriveComplexity(
  intake: FlatRateIntake,
  cubicFeet: number,
): { complexity: InventoryComplexity; score: number } {
  let score = 0;
  score += intake.rooms.length * 8;
  score += countItemLines(intake) * 2;
  if (intake.packingService === "full") score += 25;
  if (intake.packingService === "partial") score += 12;
  if (intake.hasSpecialtyItems) score += 20;
  if (intake.hasHighValueItems) score += 15;
  if (intake.appliances.length > 2) score += 10;
  if (cubicFeet > 1200) score += 15;
  else if (cubicFeet > 700) score += 8;

  if (intake.hasSpecialtyItems || cubicFeet > 1400) {
    return { complexity: "specialty", score };
  }
  if (score >= 70) return { complexity: "heavy", score };
  if (score >= 35) return { complexity: "moderate", score };
  return { complexity: "light", score };
}

function buildFlags(intake: FlatRateIntake): InventoryRiskFlag[] {
  const flags: InventoryRiskFlag[] = [];

  if (intake.rooms.length === 0) {
    flags.push({
      id: "no-rooms",
      label: "No room inventory",
      severity: "warning",
      detail: "Add room-by-room items for accurate flat-rate and crew planning.",
    });
  }

  const sparseRooms = intake.rooms.filter((r) => !r.items.trim());
  if (sparseRooms.length > 0) {
    flags.push({
      id: "sparse-rooms",
      label: `${sparseRooms.length} room${sparseRooms.length === 1 ? "" : "s"} without items`,
      severity: "info",
      detail: "Fill in furniture lists — AI quotes weight empty rooms as average density.",
    });
  }

  if (intake.hasSpecialtyItems) {
    flags.push({
      id: "specialty",
      label: "Specialty items noted",
      severity: "warning",
      detail: intake.specialtyNotes?.trim() || "Confirm crating, piano, or fine art handling.",
    });
  }

  if (intake.hasHighValueItems) {
    flags.push({
      id: "high-value",
      label: "High-value items",
      severity: "warning",
      detail: "Review declared value and liability coverage before booking.",
    });
  }

  if (intake.appliances.length > 0 && intake.applianceDisconnectHandling === "referral") {
    flags.push({
      id: "appliance-referral",
      label: "Appliance disconnect referral",
      severity: "info",
      detail: `${intake.appliances.length} appliance(s) need third-party coordination.`,
    });
  }

  if (intake.hasJunk) {
    flags.push({
      id: "haul-off",
      label: "Haul-off / junk",
      severity: "info",
      detail: intake.junkItems?.trim() || "Confirm junk volume and disposal path.",
    });
  }

  if (intake.hasTimingComplexity) {
    flags.push({
      id: "timing",
      label: "Timing constraints",
      severity: "warning",
      detail: intake.timingNotes?.trim() || "Elevator, COI, or access windows may affect crew size.",
    });
  }

  return flags;
}

function buildInsights(intake: FlatRateIntake, volume: InventoryVolumeEstimate): string[] {
  const insights: string[] = [];
  const cf = volume.cubicFeet;

  if (intake.packingService === "full") {
    insights.push("Full pack — plan extra labor and billable box/paper usage.");
  } else if (intake.packingService === "partial") {
    insights.push(
      `Partial pack${intake.partialPackRooms.length ? ` (${intake.partialPackRooms.join(", ")})` : ""} — confirm which rooms crew packs.`,
    );
  } else if (intake.packingService === "self-move") {
    insights.push("Customer-packed — verify box count and fragile-item liability.");
  }

  if (intake.estimatedBoxCount != null && intake.estimatedBoxCount > 40) {
    insights.push(`~${intake.estimatedBoxCount} boxes — consider extra wardrobe and dish packs.`);
  }

  if (cf > 1000) {
    insights.push(`Large household (~${cf} cu ft) — likely multi-truck or two-day job.`);
  } else if (cf < 200) {
    insights.push("Compact load — good candidate for smaller crew and flat minimum.");
  }

  const wardrobeTotal = intake.wardrobe.jonahCount + intake.wardrobe.clientOwnedCount;
  if (wardrobeTotal > 0) {
    insights.push(`${wardrobeTotal} wardrobe box${wardrobeTotal === 1 ? "" : "es"} on intake.`);
  }

  if (intake.extras.tvBoxCount > 0) {
    insights.push(`${intake.extras.tvBoxCount} TV box${intake.extras.tvBoxCount === 1 ? "" : "es"} requested.`);
  }

  return insights.slice(0, 5);
}

function buildSupplyHints(intake: FlatRateIntake): MoveInventoryAnalysis["supplyHints"] {
  const hints: MoveInventoryAnalysis["supplyHints"] = [];
  const boxes = intake.estimatedBoxCount ?? Math.round(estimateCubicFeetFromIntake(intake) / 3);

  if (boxes > 0) {
    hints.push({ label: "Medium boxes", estimate: `~${Math.round(boxes * 0.55)}` });
    hints.push({ label: "Dish packs", estimate: `~${Math.max(2, Math.round(boxes * 0.08))}` });
    hints.push({ label: "Wardrobe boxes", estimate: `~${intake.wardrobe.jonahCount || Math.max(1, Math.round(boxes * 0.05))}` });
    hints.push({ label: "Paper / wrap rolls", estimate: `~${Math.max(2, Math.round(boxes / 15))}` });
  }

  if (intake.packingService === "full") {
    hints.push({ label: "Packing labor hours", estimate: "Add 4–8 hrs vs partial" });
  }

  return hints;
}

export function analyzeMoveInventory(
  move: MoveRecord,
  defaults: DefaultsSettings,
): MoveInventoryAnalysis {
  const { intake } = move;
  const volume = inventoryVolumeForMove(move, defaults);
  const { complexity, score } = deriveComplexity(intake, volume.cubicFeet);

  return {
    volume,
    complexity,
    complexityScore: score,
    roomCount: intake.rooms.length,
    itemLineCount: countItemLines(intake),
    estimatedBoxes: intake.estimatedBoxCount,
    packingService: intake.packingService,
    flags: buildFlags(intake),
    insights: buildInsights(intake, volume),
    supplyHints: buildSupplyHints(intake),
  };
}

export const COMPLEXITY_LABELS: Record<InventoryComplexity, string> = {
  light: "Light",
  moderate: "Moderate",
  heavy: "Heavy",
  specialty: "Specialty",
};

export const COMPLEXITY_BADGE: Record<InventoryComplexity, string> = {
  light: "bg-emerald-100 text-emerald-900",
  moderate: "bg-sky-100 text-sky-900",
  heavy: "bg-amber-100 text-amber-900",
  specialty: "bg-violet-100 text-violet-900",
};
