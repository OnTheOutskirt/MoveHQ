import type { FollowUpSource, PipelineStageId, PriorityTierId } from "@/lib/moves/types";
import {
  defaultPriorityTierRules,
  normalizePriorityTierRules,
  type PriorityTierDisplay,
  type PriorityTierRulesSettings,
  type TierFollowUpMode,
} from "./priority-tier-rules";

let runtimeRules: PriorityTierRulesSettings = defaultPriorityTierRules();

export function syncPriorityTierRulesRuntime(rules: PriorityTierRulesSettings): void {
  runtimeRules = normalizePriorityTierRules(rules);
}

export function getPriorityTierRulesRuntime(): PriorityTierRulesSettings {
  return runtimeRules;
}

export function catalogHighValueThreshold(): number {
  return runtimeRules.highValueThreshold;
}

export function catalogPriorityTierDisplay(tier: PriorityTierId): PriorityTierDisplay {
  return runtimeRules.tierDisplay[tier];
}

export function catalogPriorityTierConfig(tier: PriorityTierId) {
  const display = catalogPriorityTierDisplay(tier);
  return {
    id: tier,
    tierLabel: display.tierLabel,
    shortCode: tier,
    meaning: "",
    badge: display.badgeClass,
  };
}

export function catalogPriorityTierLabel(tier: string): string {
  if (tier === "Q1" || tier === "Q2" || tier === "Q3" || tier === "Q4") {
    return catalogPriorityTierDisplay(tier).tierLabel;
  }
  return tier;
}

export function catalogPriorityTierBadge(tier: string): string {
  if (tier === "Q1" || tier === "Q2" || tier === "Q3" || tier === "Q4") {
    return catalogPriorityTierDisplay(tier).badgeClass;
  }
  return "bg-slate-100 text-slate-600";
}

export function catalogPriorityTierIds(): PriorityTierId[] {
  return ["Q1", "Q2", "Q3", "Q4"];
}

export function catalogFollowUpModeForTier(tier: PriorityTierId): TierFollowUpMode {
  return runtimeRules.followUpMode[tier];
}

/** Pipeline follow-up source for a move entering a stage. */
export function followUpSourceForMove(
  tier: PriorityTierId | null,
  stage: PipelineStageId,
): FollowUpSource {
  if (!tier) return "manual";
  const mode = catalogFollowUpModeForTier(tier);
  if (mode === "automated") return "automation";
  if (mode === "manual") return "manual";
  if (stage === "new_lead" || stage === "booked" || stage === "needs_contract") {
    return "manual";
  }
  return "automation";
}

export function tierPrefersAutomatedFollowUps(tier: PriorityTierId): boolean {
  const mode = catalogFollowUpModeForTier(tier);
  return mode === "automated";
}
