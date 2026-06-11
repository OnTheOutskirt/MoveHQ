"use client";

import { DetailSection } from "@/components/moves/detail/DetailSection";
import { MoveDetailSectionAnchor } from "@/components/moves/detail/MoveDetailSectionAnchor";
import { MoveDetailTabSections } from "@/components/moves/detail/MoveDetailTabSections";
import { useMoveIntakeEdit } from "@/components/moves/detail/use-move-intake-edit";
import { useEquipmentCatalog } from "@/components/providers/EquipmentCatalogProvider";
import { Badge } from "@/components/ui/Badge";
import {
  EQUIPMENT_SECTION_IDS,
  EQUIPMENT_SUPPLIES_SECTIONS,
} from "@/lib/moves/move-detail-sections";
import {
  equipmentCatalogByCategory,
  equipmentDocumentBadge,
  equipmentLineLabel,
  equipmentLineUnit,
  getEquipmentCatalogItem,
  newEquipmentLineId,
  normalizeEquipmentSupplies,
  patchEquipmentSupplies,
  type EquipmentCatalogCategory,
  type EquipmentCatalogItem,
} from "@/lib/moves/equipment-supplies";
import type { IntakeEquipmentLine } from "@/lib/moves/flat-rate-intake";
import type { MoveRecord } from "@/lib/moves/types";
import { ThirdPartyServicesSection } from "@/components/moves/detail/ThirdPartyServicesSection";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";

type MoveDetailEquipmentSuppliesTabProps = {
  move: MoveRecord;
};

function documentBadgeVariant(
  item: EquipmentCatalogItem,
): "default" | "brand" | "warning" {
  if (item.showOnQuote && item.showOnContract) return "brand";
  if (item.showOnQuote || item.showOnContract) return "default";
  return "warning";
}

export function MoveDetailEquipmentSuppliesTab({ move }: MoveDetailEquipmentSuppliesTabProps) {
  const { intake, disabled, patchFn } = useMoveIntakeEdit(move.id);

  const supplies = useMemo(
    () => (intake ? normalizeEquipmentSupplies(intake) : []),
    [intake],
  );

  if (!intake) return null;

  function updateSupplies(next: IntakeEquipmentLine[]) {
    patchFn((prev) => ({
      ...prev,
      ...patchEquipmentSupplies(prev, next),
    }));
  }

  return (
    <MoveDetailTabSections
      sections={EQUIPMENT_SUPPLIES_SECTIONS}
      ariaLabel="Equipment and supplies sections"
    >
      <MoveDetailSectionAnchor id={EQUIPMENT_SECTION_IDS.supplies}>
        <EquipmentCategorySection
          title="Supplies"
          description="Boxes, paper, wardrobe cartons, and other packing materials billed to the customer when used."
          category="supply"
          lines={supplies}
          disabled={disabled}
          onUpdate={updateSupplies}
        />
      </MoveDetailSectionAnchor>

      <MoveDetailSectionAnchor id={EQUIPMENT_SECTION_IDS.equipment}>
        <EquipmentCategorySection
          title="Equipment"
          description="Blankets, floor protection, dollies, and other move-day gear — usually internal prep, not on customer documents."
          category="equipment"
          lines={supplies}
          disabled={disabled}
          onUpdate={updateSupplies}
        />
      </MoveDetailSectionAnchor>

      <ThirdPartyServicesSection move={move} />
    </MoveDetailTabSections>
  );
}

type EquipmentCategorySectionProps = {
  title: string;
  description: string;
  category: EquipmentCatalogCategory;
  lines: IntakeEquipmentLine[];
  disabled: boolean;
  onUpdate: (next: IntakeEquipmentLine[]) => void;
};

function EquipmentCategorySection({
  title,
  description,
  category,
  lines,
  disabled,
  onUpdate,
}: EquipmentCategorySectionProps) {
  const categoryLines = useMemo(
    () =>
      lines.filter((line) => {
        const item = getEquipmentCatalogItem(line.catalogId);
        return item?.category === category;
      }),
    [lines, category],
  );

  const usedCatalogIds = useMemo(
    () => new Set(lines.map((line) => line.catalogId)),
    [lines],
  );

  const { catalog } = useEquipmentCatalog();

  const addOptions = useMemo(
    () =>
      equipmentCatalogByCategory(category).filter((item) => !usedCatalogIds.has(item.id)),
    [category, usedCatalogIds, catalog],
  );

  function addItem(catalogId: string) {
    onUpdate([...lines, { id: newEquipmentLineId(), catalogId, quantity: 1 }]);
  }

  function updateLineQuantity(lineId: string, quantity: number) {
    onUpdate(
      lines.map((line) =>
        line.id === lineId ? { ...line, quantity: Math.max(0, quantity) } : line,
      ),
    );
  }

  function removeLine(lineId: string) {
    onUpdate(lines.filter((line) => line.id !== lineId));
  }

  const quoteCount = categoryLines.filter((line) => {
    const item = getEquipmentCatalogItem(line.catalogId);
    return item?.showOnQuote && line.quantity > 0;
  }).length;

  return (
    <DetailSection title={title} description={description}>
      {categoryLines.length === 0 ? (
        <p className="text-sm text-slate-500">Nothing added yet — tap an item below to add it.</p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
          {categoryLines.map((line) => {
            const item = getEquipmentCatalogItem(line.catalogId);
            if (!item) return null;
            return (
              <li
                key={line.id}
                className="flex flex-wrap items-center gap-3 px-3 py-3 sm:flex-nowrap"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-slate-900">
                      {equipmentLineLabel(line)}
                    </p>
                    <Badge variant={documentBadgeVariant(item)} className="text-[10px]">
                      {equipmentDocumentBadge(item)}
                    </Badge>
                  </div>
                  {item.unitPrice > 0 ? (
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      ${item.unitPrice} / {item.unit}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-[11px] text-slate-500">Included / no charge</p>
                  )}
                </div>
                <label className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase text-slate-500">Qty</span>
                  <input
                    type="number"
                    min={0}
                    value={line.quantity}
                    disabled={disabled}
                    onChange={(e) =>
                      updateLineQuantity(line.id, e.target.value ? Number(e.target.value) : 0)
                    }
                    className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-sm tabular-nums"
                  />
                  <span className="text-xs text-slate-500">{equipmentLineUnit(line)}</span>
                </label>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => removeLine(line.id)}
                  className={cn(
                    "inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600",
                    disabled && "pointer-events-none opacity-50",
                  )}
                  aria-label={`Remove ${equipmentLineLabel(line)}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {addOptions.length > 0 ? (
        <div className="mt-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Quick add
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {addOptions.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={disabled}
                onClick={() => addItem(item.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-900",
                  disabled && "pointer-events-none opacity-50",
                )}
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ) : categoryLines.length > 0 ? (
        <p className="mt-3 text-xs text-slate-500">All catalog items in this group are on the list.</p>
      ) : null}

      {quoteCount > 0 ? (
        <p className="mt-3 text-xs text-slate-500">
          {quoteCount} item type{quoteCount === 1 ? "" : "s"} from this section appear on customer
          quotes.
        </p>
      ) : null}
    </DetailSection>
  );
}
