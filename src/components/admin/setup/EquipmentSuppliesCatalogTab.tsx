"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { equipmentDocumentBadge } from "@/lib/moves/equipment-supplies";
import { RateHistoryPanel } from "@/components/admin/setup/RateHistoryPanel";
import {
  generateEquipmentCatalogId,
} from "@/lib/moves/equipment-catalog-storage";
import { loadPricingRateSchedule } from "@/lib/pricing/rate-history-storage";
import type {
  EquipmentCatalogCategory,
  EquipmentCatalogItem,
} from "@/lib/moves/equipment-catalog-types";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";

type EquipmentSuppliesCatalogTabProps = {
  catalog: EquipmentCatalogItem[];
  onChange: (next: EquipmentCatalogItem[]) => void;
};

const UNITS = ["ea", "bundle", "roll", "box", "kit", "hr"];

function CatalogSection({
  title,
  description,
  category,
  items,
  onChange,
  allItems,
}: {
  title: string;
  description: string;
  category: EquipmentCatalogCategory;
  items: EquipmentCatalogItem[];
  onChange: (next: EquipmentCatalogItem[]) => void;
  allItems: EquipmentCatalogItem[];
}) {
  function patchItem(id: string, patch: Partial<EquipmentCatalogItem>) {
    onChange(allItems.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeItem(id: string) {
    onChange(allItems.filter((item) => item.id !== id));
  }

  function addItem() {
    const label = category === "supply" ? "New supply" : "New equipment";
    onChange([
      ...allItems,
      {
        id: generateEquipmentCatalogId(label),
        label,
        unit: "ea",
        unitPrice: category === "supply" ? 0 : 0,
        category,
        showOnQuote: category === "supply",
        showOnContract: false,
      },
    ]);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <Button type="button" variant="secondary" size="sm" className="gap-1" onClick={addItem}>
          <Plus className="h-3.5 w-3.5" />
          Add {category === "supply" ? "supply" : "item"}
        </Button>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">No items yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2 w-24">Unit</th>
                  <th className="px-3 py-2 w-28">Price</th>
                  <th className="px-3 py-2 w-20">Quote</th>
                  <th className="px-3 py-2 w-24">Contract</th>
                  <th className="px-3 py-2 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="bg-white">
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => patchItem(item.id, { label: e.target.value })}
                        className="w-full min-w-[8rem] rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      />
                      <p className="mt-0.5 text-[10px] text-slate-400">{equipmentDocumentBadge(item)}</p>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={item.unit}
                        onChange={(e) => patchItem(item.id, { unit: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      >
                        {UNITS.includes(item.unit) ? null : (
                          <option value={item.unit}>{item.unit}</option>
                        )}
                        {UNITS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">$</span>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={item.unitPrice}
                          onChange={(e) =>
                            patchItem(item.id, {
                              unitPrice: e.target.value === "" ? 0 : Number(e.target.value),
                            })
                          }
                          className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm tabular-nums"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={item.showOnQuote}
                        onChange={(e) => patchItem(item.id, { showOnQuote: e.target.checked })}
                        className="rounded border-slate-300"
                        aria-label={`${item.label} on quote`}
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={item.showOnContract}
                        onChange={(e) => patchItem(item.id, { showOnContract: e.target.checked })}
                        className="rounded border-slate-300"
                        aria-label={`${item.label} on contract`}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label={`Remove ${item.label}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function EquipmentSuppliesCatalogTab({ catalog, onChange }: EquipmentSuppliesCatalogTabProps) {
  const rateSchedule = useMemo(() => loadPricingRateSchedule(), []);
  const supplies = useMemo(
    () => catalog.filter((item) => item.category === "supply"),
    [catalog],
  );
  const equipment = useMemo(
    () => catalog.filter((item) => item.category === "equipment"),
    [catalog],
  );

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-slate-600">
        Company-wide catalog for the{" "}
        <span className="font-medium text-slate-800">Equipment &amp; supplies</span> tab on each move.
        Set unit prices for packing materials; equipment is usually $0 (internal prep). Control what
        appears on customer quotes and contracts.
      </p>

      <CatalogSection
        title="Supplies"
        description="Boxes, paper, wardrobe cartons, and other billable packing materials."
        category="supply"
        items={supplies}
        allItems={catalog}
        onChange={onChange}
      />

      <CatalogSection
        title="Equipment"
        description="Blankets, floor protection, dollies, and move-day gear — typically not charged."
        category="equipment"
        items={equipment}
        allItems={catalog}
        onChange={onChange}
      />

      <p className={cn("text-xs text-slate-500")}>
        Changes apply to new quick-add options on moves immediately after you save. Price changes
        are recorded in rate history; contracted moves keep their locked rates.
      </p>

      <RateHistoryPanel entries={rateSchedule.entries} className="mt-6" />
    </div>
  );
}
