"use client";

import { Button } from "@/components/ui/Button";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import type { FieldCatalogEntry } from "@/lib/settings/field-catalog-types";
import {
  HOURLY_TRAVEL_BILLING_LABELS,
  patchMoveTypeRule,
  type HourlyTravelBilling,
  type MoveTypeRule,
  type MoveTypeRulesSettings,
} from "@/lib/settings/move-type-rules";
import { cn } from "@/lib/utils";

const COMPACT_INPUT =
  "w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

type MoveTypeEditorSidebarProps = {
  open: boolean;
  entry: FieldCatalogEntry | null;
  rule: MoveTypeRule | null;
  moveTypeRules: MoveTypeRulesSettings;
  onClose: () => void;
  onSaveLabel: (label: string) => void;
  onSaveRules: (rules: MoveTypeRulesSettings) => void;
};

export function MoveTypeEditorSidebar({
  open,
  entry,
  rule,
  moveTypeRules,
  onClose,
  onSaveLabel,
  onSaveRules,
}: MoveTypeEditorSidebarProps) {
  if (!entry || !rule) return null;

  const typeId = entry.id;

  function patchRule(patch: Partial<Omit<MoveTypeRule, "moveTypeId">>) {
    onSaveRules(patchMoveTypeRule(moveTypeRules, typeId, patch));
  }

  return (
    <DetailSidebar
      open={open}
      onClose={onClose}
      title="Edit move type"
      description={entry.builtIn ? "Built-in type — label and rules are editable." : "Custom move type"}
      widthClassName="max-w-lg"
      footer={
        <Button type="button" onClick={onClose}>
          Done
        </Button>
      }
    >
      <div className="space-y-4">
        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Display name
          </span>
          <input
            value={entry.label}
            onChange={(e) => onSaveLabel(e.target.value)}
            className={cn(COMPACT_INPUT, "mt-1 font-medium")}
          />
        </label>

        <label className="block text-sm text-slate-700">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Hourly travel billing
          </span>
          <select
            value={rule.hourlyTravelBilling}
            onChange={(e) =>
              patchRule({ hourlyTravelBilling: e.target.value as HourlyTravelBilling })
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            {(
              Object.entries(HOURLY_TRAVEL_BILLING_LABELS) as [HourlyTravelBilling, string][]
            ).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm text-slate-700">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Default pricing on new moves
          </span>
          <select
            value={rule.defaultPricingType}
            onChange={(e) =>
              patchRule({
                defaultPricingType: e.target.value as "hourly" | "flat_rate",
              })
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="hourly">Hourly</option>
            <option value="flat_rate">Flat rate</option>
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-800">
          <input
            type="checkbox"
            checked={rule.includesLiabilityCoverage}
            onChange={(e) => patchRule({ includesLiabilityCoverage: e.target.checked })}
            className="rounded border-slate-300"
          />
          Includes valuation / liability coverage on quotes &amp; contracts
        </label>

        <label className="block text-sm text-slate-700">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Ops notes (internal)
          </span>
          <textarea
            rows={3}
            value={rule.opsNotes}
            onChange={(e) => patchRule({ opsNotes: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
      </div>
    </DetailSidebar>
  );
}
