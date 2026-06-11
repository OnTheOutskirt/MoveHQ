"use client";

import { SetupAccordion } from "@/components/admin/setup/SetupAccordion";
import { Button } from "@/components/ui/Button";
import { equipmentDocumentBadge } from "@/lib/moves/equipment-supplies";
import { generateEquipmentCatalogId } from "@/lib/moves/equipment-catalog-storage";
import type { EquipmentCatalogCategory, EquipmentCatalogItem } from "@/lib/moves/equipment-catalog-types";
import { Plus, Trash2 } from "lucide-react";

const UNITS = ["ea", "bundle", "roll", "box", "kit", "hr"];

type EquipmentCatalogSectionProps = {
  title: string;
  description: string;
  category: EquipmentCatalogCategory;
  items: EquipmentCatalogItem[];
  allItems: EquipmentCatalogItem[];
  onChange: (next: EquipmentCatalogItem[]) => void;
  defaultOpen?: boolean;
};

export function EquipmentCatalogSection({
  title,
  description,
  category,
  items,
  allItems,
  onChange,
  defaultOpen,
}: EquipmentCatalogSectionProps) {
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
        unitPrice: 0,
        category,
        showOnQuote: category === "supply",
        showOnContract: false,
      },
    ]);
  }

  return (
    <SetupAccordion
      title={title}
      description={description}
      count={items.length}
      defaultOpen={defaultOpen}
    >
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">No items yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="w-24 px-3 py-2">Unit</th>
                <th className="w-28 px-3 py-2">Price</th>
                <th className="w-20 px-3 py-2">Quote</th>
                <th className="w-24 px-3 py-2">Contract</th>
                <th className="w-10 px-3 py-2" />
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
      <Button type="button" variant="secondary" size="sm" className="mt-3 gap-1" onClick={addItem}>
        <Plus className="h-3.5 w-3.5" />
        Add {category === "supply" ? "supply" : "item"}
      </Button>
    </SetupAccordion>
  );
}
