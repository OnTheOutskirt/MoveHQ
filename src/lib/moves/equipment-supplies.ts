import { getEquipmentCatalog, getEquipmentCatalogById } from "./equipment-catalog-runtime";
import type { EquipmentCatalogCategory, EquipmentCatalogItem } from "./equipment-catalog-types";
import { DEFAULT_EQUIPMENT_SUPPLY_CATALOG } from "./equipment-catalog-defaults";
import { resolveSupplyUnitPriceForMove } from "@/lib/pricing/rate-resolution";
import type { MoveRecord } from "./types";
import type { FlatRateIntake, IntakeEquipmentLine, IntakeMoveExtras, IntakeWardrobe } from "./flat-rate-intake";

export type { EquipmentCatalogCategory, EquipmentCatalogItem } from "./equipment-catalog-types";
export { DEFAULT_EQUIPMENT_SUPPLY_CATALOG } from "./equipment-catalog-defaults";

/** @deprecated Use getEquipmentCatalog() — kept for imports that expect a static list at module load. */
export const EQUIPMENT_SUPPLY_CATALOG = DEFAULT_EQUIPMENT_SUPPLY_CATALOG;

export function getEquipmentCatalogItem(catalogId: string): EquipmentCatalogItem | undefined {
  return getEquipmentCatalogById().get(catalogId);
}

export function newEquipmentLineId(): string {
  return `eq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function equipmentLineLabel(line: IntakeEquipmentLine): string {
  return getEquipmentCatalogItem(line.catalogId)?.label ?? line.catalogId;
}

export function equipmentLineUnit(line: IntakeEquipmentLine): string {
  return getEquipmentCatalogItem(line.catalogId)?.unit ?? "ea";
}

export function equipmentDocumentBadge(item: EquipmentCatalogItem): string {
  if (item.showOnQuote && item.showOnContract) return "Quote & contract";
  if (item.showOnQuote) return "On quote";
  if (item.showOnContract) return "On contract";
  return "Internal";
}

function qtyForCatalog(supplies: IntakeEquipmentLine[], catalogId: string): number {
  return supplies
    .filter((line) => line.catalogId === catalogId)
    .reduce((sum, line) => sum + Math.max(0, line.quantity), 0);
}

/** Back-fill equipment lines from legacy wardrobe / extras fields. */
export function migrateLegacyEquipment(intake: FlatRateIntake): IntakeEquipmentLine[] {
  if (intake.equipmentSupplies?.length) return intake.equipmentSupplies;

  const lines: IntakeEquipmentLine[] = [];

  if (intake.wardrobe.jonahCount > 0) {
    lines.push({
      id: newEquipmentLineId(),
      catalogId: "wardrobe_box",
      quantity: intake.wardrobe.jonahCount,
    });
  }
  if (intake.extras.tvBoxCount > 0) {
    lines.push({
      id: newEquipmentLineId(),
      catalogId: "tv_box",
      quantity: intake.extras.tvBoxCount,
    });
  }
  if (intake.extras.safeDolly) {
    lines.push({
      id: newEquipmentLineId(),
      catalogId: "safe_dolly",
      quantity: 1,
    });
  }

  for (const extra of intake.extras.other) {
    if (extra.quantity <= 0) continue;
    const match = getEquipmentCatalog().find(
      (item) => item.label.toLowerCase() === extra.label.toLowerCase(),
    );
    lines.push({
      id: newEquipmentLineId(),
      catalogId: match?.id ?? "storage_blanket",
      quantity: extra.quantity,
    });
  }

  return lines;
}

export function normalizeEquipmentSupplies(intake: FlatRateIntake): IntakeEquipmentLine[] {
  return migrateLegacyEquipment(intake).filter((line) => line.quantity > 0);
}

/** Keep legacy fields in sync for older readers (ops prep, documents during transition). */
export function syncLegacyEquipmentFields(
  supplies: IntakeEquipmentLine[],
): { wardrobe: IntakeWardrobe; extras: IntakeMoveExtras } {
  const wardrobeCount = qtyForCatalog(supplies, "wardrobe_box");
  const tvCount = qtyForCatalog(supplies, "tv_box");
  const safeDolly = qtyForCatalog(supplies, "safe_dolly") > 0;

  return {
    wardrobe: {
      jonahCount: wardrobeCount,
      jonahType: "rental",
      clientOwnedCount: 0,
    },
    extras: {
      tvBoxCount: tvCount,
      safeDolly,
      other: [],
    },
  };
}

export function patchEquipmentSupplies(
  intake: FlatRateIntake,
  supplies: IntakeEquipmentLine[],
): Partial<FlatRateIntake> {
  const legacy = syncLegacyEquipmentFields(supplies);
  return {
    equipmentSupplies: supplies.filter((line) => line.quantity > 0),
    wardrobe: legacy.wardrobe,
    extras: legacy.extras,
  };
}

function unitPriceForLine(
  catalogId: string,
  move?: MoveRecord | null,
): number {
  if (move) {
    const locked = resolveSupplyUnitPriceForMove(move, catalogId);
    if (locked != null) return locked;
  }
  return getEquipmentCatalogItem(catalogId)?.unitPrice ?? 0;
}

export function equipmentLinesForDocuments(
  supplies: IntakeEquipmentLine[],
  mode: "quote" | "contract",
  move?: MoveRecord | null,
): { label: string; quantity: number; unit: string; unitPrice: number }[] {
  return supplies
    .map((line) => {
      const item = getEquipmentCatalogItem(line.catalogId);
      if (!item || line.quantity <= 0) return null;
      const visible = mode === "quote" ? item.showOnQuote : item.showOnContract;
      if (!visible) return null;
      return {
        label: item.label,
        quantity: line.quantity,
        unit: item.unit,
        unitPrice: unitPriceForLine(line.catalogId, move),
      };
    })
    .filter((row): row is NonNullable<typeof row> => row != null);
}

export function equipmentSuppliesDocumentNotes(
  intake: FlatRateIntake,
  move?: MoveRecord | null,
): string[] {
  const supplies = normalizeEquipmentSupplies(intake);
  return equipmentLinesForDocuments(supplies, "quote", move).map(
    (row) => `${row.quantity} × ${row.label}`,
  );
}

export function equipmentMaterialsCost(
  supplies: IntakeEquipmentLine[],
  move?: MoveRecord | null,
): number {
  return supplies.reduce((sum, line) => {
    const item = getEquipmentCatalogItem(line.catalogId);
    if (!item || line.quantity <= 0) return sum;
    return sum + unitPriceForLine(line.catalogId, move) * line.quantity;
  }, 0);
}

export function equipmentCatalogByCategory(category: EquipmentCatalogCategory): EquipmentCatalogItem[] {
  return getEquipmentCatalog().filter((item) => item.category === category);
}
