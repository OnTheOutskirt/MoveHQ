import { moveTypeDisplayToCatalogId } from "@/lib/settings/field-catalog-defaults";
import type { MoveType } from "@/lib/moves/types";

export type HourlyTravelBilling = "clock_between_stops" | "flat_travel_fee_only";

export type MoveTypeRule = {
  moveTypeId: string;
  /** Hourly jobs: clock drive time between stops vs flat fee whenever the truck is rolling. */
  hourlyTravelBilling: HourlyTravelBilling;
  includesLiabilityCoverage: boolean;
  defaultPricingType: "hourly" | "flat_rate";
  opsNotes: string;
};

export type MoveTypeRulesSettings = {
  byTypeId: Record<string, MoveTypeRule>;
};

export const HOURLY_TRAVEL_BILLING_LABELS: Record<HourlyTravelBilling, string> = {
  clock_between_stops:
    "Clock hourly between locations (local-style — drive time on the clock)",
  flat_travel_fee_only:
    "Flat travel fee only while in the truck (long-distance style — not on the clock)",
};

const DEFAULT_RULES: Record<string, Omit<MoveTypeRule, "moveTypeId">> = {
  local: {
    hourlyTravelBilling: "clock_between_stops",
    includesLiabilityCoverage: true,
    defaultPricingType: "hourly",
    opsNotes: "Standard local residential — crew clocks between origin, stops, and destination.",
  },
  long_distance: {
    hourlyTravelBilling: "flat_travel_fee_only",
    includesLiabilityCoverage: true,
    defaultPricingType: "hourly",
    opsNotes:
      "Long haul — flat travel fee when the truck is on the road; labor hourly at load/unload.",
  },
  commercial: {
    hourlyTravelBilling: "clock_between_stops",
    includesLiabilityCoverage: true,
    defaultPricingType: "hourly",
    opsNotes: "Office / commercial — often multi-stop; confirm access and COI requirements.",
  },
  labor_only: {
    hourlyTravelBilling: "clock_between_stops",
    includesLiabilityCoverage: false,
    defaultPricingType: "hourly",
    opsNotes: "Labor-only — no valuation or liability coverage; customer handles transport.",
  },
};

export function defaultMoveTypeRules(): MoveTypeRulesSettings {
  const byTypeId: Record<string, MoveTypeRule> = {};
  for (const [moveTypeId, rule] of Object.entries(DEFAULT_RULES)) {
    byTypeId[moveTypeId] = { moveTypeId, ...rule };
  }
  return { byTypeId };
}

export function normalizeMoveTypeRules(
  raw: Partial<MoveTypeRulesSettings> | null | undefined,
): MoveTypeRulesSettings {
  const defaults = defaultMoveTypeRules();
  const merged: Record<string, MoveTypeRule> = { ...defaults.byTypeId };
  for (const [id, rule] of Object.entries(raw?.byTypeId ?? {})) {
    if (merged[id]) {
      merged[id] = { ...merged[id], ...rule, moveTypeId: id };
    } else {
      const { moveTypeId: _ignored, ...rest } = rule;
      merged[id] = { moveTypeId: id, ...DEFAULT_RULES.local, ...rest };
    }
  }
  return { byTypeId: merged };
}

export function resolveMoveTypeRule(
  moveType: MoveType | string,
  settings?: MoveTypeRulesSettings,
): MoveTypeRule {
  const catalogId = moveTypeDisplayToCatalogId(
    typeof moveType === "string" ? moveType : moveType,
  );
  const rules = settings ?? defaultMoveTypeRules();
  return (
    rules.byTypeId[catalogId] ??
    rules.byTypeId.local ??
    defaultMoveTypeRules().byTypeId.local
  );
}

export function patchMoveTypeRule(
  settings: MoveTypeRulesSettings,
  moveTypeId: string,
  patch: Partial<Omit<MoveTypeRule, "moveTypeId">>,
): MoveTypeRulesSettings {
  const existing = settings.byTypeId[moveTypeId] ?? {
    moveTypeId,
    ...DEFAULT_RULES.local,
  };
  return {
    byTypeId: {
      ...settings.byTypeId,
      [moveTypeId]: { ...existing, ...patch, moveTypeId },
    },
  };
}
