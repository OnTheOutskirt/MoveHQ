import type { MoveRecord } from "@/lib/moves/types";
import {
  moveTypeCatalogIdToDisplay,
  moveTypeDisplayToCatalogId,
} from "@/lib/settings/field-catalog-defaults";
import type { FieldCatalogEntry, FieldCatalogSettings } from "@/lib/settings/field-catalog-types";
import {
  patchMoveTypeRule,
  resolveMoveTypeRule,
  type MoveTypeRule,
  type MoveTypeRulesSettings,
} from "@/lib/settings/move-type-rules";

export function moveMatchesCatalogType(move: MoveRecord, catalogId: string): boolean {
  return moveTypeDisplayToCatalogId(move.moveType) === catalogId;
}

/** Active moves/leads using this catalog move type (excludes lost/cancelled). */
export function countMovesUsingMoveType(moves: MoveRecord[], catalogId: string): number {
  return moves.filter(
    (m) =>
      moveMatchesCatalogType(m, catalogId) &&
      m.conditionStatus !== "lost" &&
      m.conditionStatus !== "cancelled",
  ).length;
}

export function movesUsingMoveType(moves: MoveRecord[], catalogId: string): MoveRecord[] {
  return moves.filter(
    (m) =>
      moveMatchesCatalogType(m, catalogId) &&
      m.conditionStatus !== "lost" &&
      m.conditionStatus !== "cancelled",
  );
}

export function applyMoveTypeRuleToMove(
  move: MoveRecord,
  targetTypeId: string,
  moveTypeRules: MoveTypeRulesSettings,
  catalog: FieldCatalogSettings,
): MoveRecord {
  const rule = resolveMoveTypeRule(targetTypeId, moveTypeRules);
  const label = moveTypeCatalogIdToDisplay(targetTypeId, catalog);
  const hasSentQuote = Boolean(move.sentQuote?.sentAt);

  let quoteType = move.quoteType;
  if (!hasSentQuote) {
    quoteType = rule.defaultPricingType === "flat_rate" ? "flat" : "hourly";
  }

  let liabilityCoverage = move.intake.liabilityCoverage;
  if (!rule.includesLiabilityCoverage) {
    liabilityCoverage = "unregulated";
  } else if (liabilityCoverage === "unregulated") {
    liabilityCoverage = "";
  }

  return {
    ...move,
    moveType: label as MoveRecord["moveType"],
    quoteType,
    intake: {
      ...move.intake,
      liabilityCoverage,
    },
    updatedAt: new Date().toISOString(),
  };
}

export function removeMoveTypeFromCatalog(
  catalog: FieldCatalogSettings,
  typeId: string,
): FieldCatalogSettings {
  return {
    ...catalog,
    moveTypes: catalog.moveTypes.filter((t) => t.id !== typeId || t.builtIn),
  };
}

export function removeMoveTypeFromRules(
  rules: MoveTypeRulesSettings,
  typeId: string,
): MoveTypeRulesSettings {
  const { [typeId]: _removed, ...rest } = rules.byTypeId;
  return { byTypeId: rest };
}

export function moveTypeRuleSummary(rule: MoveTypeRule): string {
  const pricing = rule.defaultPricingType === "flat_rate" ? "Flat rate" : "Hourly";
  const liability = rule.includesLiabilityCoverage ? "Liability on" : "No liability";
  return `${pricing} · ${liability}`;
}

export function duplicateMoveTypeRule(
  rules: MoveTypeRulesSettings,
  fromId: string,
  toId: string,
): MoveTypeRulesSettings {
  const source = rules.byTypeId[fromId] ?? resolveMoveTypeRule(fromId, rules);
  return patchMoveTypeRule(rules, toId, {
    hourlyTravelBilling: source.hourlyTravelBilling,
    includesLiabilityCoverage: source.includesLiabilityCoverage,
    defaultPricingType: source.defaultPricingType,
    opsNotes: source.opsNotes,
  });
}

export function catalogEntryLabel(entry: FieldCatalogEntry): string {
  return entry.label.trim() || entry.id;
}
