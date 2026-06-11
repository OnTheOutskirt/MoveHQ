"use client";

import { SetupAccordion } from "@/components/admin/setup/SetupAccordion";
import { Button } from "@/components/ui/Button";
import type { DiscountReasonEntry, QuoteDiscountKind } from "@/lib/settings/field-catalog-types";
import { slugFromLabel } from "@/lib/settings/field-catalog-defaults";
import { useSettingsSection } from "@/lib/settings/use-settings-editor";
import { Plus, Trash2 } from "lucide-react";

const COMPACT_INPUT =
  "w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

export function DiscountReasonsSection() {
  const { value: fieldCatalog, update } = useSettingsSection("fieldCatalog");
  const reasons = fieldCatalog.discountReasons;

  function setReasons(entries: DiscountReasonEntry[]) {
    update({ discountReasons: entries });
  }

  function patchReason(id: string, patch: Partial<DiscountReasonEntry>) {
    setReasons(reasons.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function removeReason(id: string) {
    setReasons(reasons.filter((r) => r.id !== id || r.builtIn));
  }

  function addReason() {
    const label = "New discount";
    let id = slugFromLabel(label);
    let n = 2;
    while (reasons.some((r) => r.id === id)) {
      id = `${slugFromLabel(label)}_${n}`;
      n++;
    }
    const entry: DiscountReasonEntry = {
      id,
      label,
      description: "",
      kind: "percent",
      defaultValue: 5,
      builtIn: false,
    };
    setReasons([...reasons, entry]);
  }

  return (
    <SetupAccordion
      title="Discount reasons"
      description="Preset reasons for flat rate and hourly quotes — percent or dollar default each."
      count={reasons.length}
      defaultOpen
    >
      <div className="space-y-2">
        {reasons.map((reason) => (
          <div
            key={reason.id}
            className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_7rem_6rem_1fr_auto]"
          >
            <label className="min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Label
              </span>
              <input
                className={`${COMPACT_INPUT} mt-1`}
                value={reason.label}
                onChange={(e) => patchReason(reason.id, { label: e.target.value })}
              />
            </label>
            <label>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Type
              </span>
              <select
                className={`${COMPACT_INPUT} mt-1`}
                value={reason.kind}
                onChange={(e) =>
                  patchReason(reason.id, { kind: e.target.value as QuoteDiscountKind })
                }
              >
                <option value="percent">Percent</option>
                <option value="dollar">Dollar</option>
              </select>
            </label>
            <label>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Default
              </span>
              <div className="mt-1 flex items-center gap-1">
                {reason.kind === "dollar" ? (
                  <span className="text-sm text-slate-500">$</span>
                ) : null}
                <input
                  type="number"
                  min={0}
                  max={reason.kind === "percent" ? 100 : undefined}
                  step={reason.kind === "percent" ? 1 : 5}
                  className={COMPACT_INPUT}
                  value={reason.defaultValue}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (!Number.isFinite(n)) return;
                    patchReason(reason.id, { defaultValue: Math.max(0, n) });
                  }}
                />
                {reason.kind === "percent" ? (
                  <span className="text-sm text-slate-500">%</span>
                ) : null}
              </div>
            </label>
            <label className="min-w-0 sm:col-span-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Description
              </span>
              <input
                className={`${COMPACT_INPUT} mt-1`}
                value={reason.description ?? ""}
                placeholder="Optional note for reps"
                onChange={(e) => patchReason(reason.id, { description: e.target.value })}
              />
            </label>
            <div className="flex items-end justify-end">
              {!reason.builtIn ? (
                <button
                  type="button"
                  onClick={() => removeReason(reason.id)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  title="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : (
                <span className="px-2 py-2 text-[10px] font-medium uppercase text-slate-400">
                  Built-in
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      <Button type="button" variant="secondary" className="mt-3 gap-1.5" onClick={addReason}>
        <Plus className="h-4 w-4" />
        Add discount reason
      </Button>
      <p className="mt-3 text-xs text-slate-500">
        Hourly: percent discounts the labor rate only; dollar discounts apply to the estimated move
        total. Flat rate: both types apply to the full quoted amount.
      </p>
    </SetupAccordion>
  );
}
