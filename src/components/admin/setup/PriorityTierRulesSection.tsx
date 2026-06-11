"use client";

import { SetupAccordion } from "@/components/admin/setup/SetupAccordion";
import { SettingsField, SettingsInput } from "@/components/settings/SettingsField";
import { PRIORITY_TIER_IDS, priorityTierStyle } from "@/lib/moves/move-priority-tier";
import type { PriorityTierId } from "@/lib/moves/types";
import { formatHighValueThreshold, TIER_BADGE_PRESETS } from "@/lib/settings/priority-tier-rules";
import { useSettingsSection } from "@/lib/settings/use-settings-editor";
import { cn } from "@/lib/utils";
import { Flame, Snowflake } from "lucide-react";

export function PriorityTierRulesSection() {
  const { value: rules, update: updateRules } = useSettingsSection("priorityTierRules");
  const { value: fieldCatalog, update: updateFieldCatalog } = useSettingsSection("fieldCatalog");

  const thresholdLabel = formatHighValueThreshold(rules.highValueThreshold);

  function patchLeadSourceHot(id: string, isHot: boolean) {
    updateFieldCatalog({
      leadSources: fieldCatalog.leadSources.map((source) =>
        source.id === id ? { ...source, isHot } : source,
      ),
    });
  }

  function patchTierDisplay(
    tier: PriorityTierId,
    patch: Partial<(typeof rules.tierDisplay)[PriorityTierId]>,
  ) {
    updateRules({
      tierDisplay: {
        ...rules.tierDisplay,
        [tier]: { ...rules.tierDisplay[tier], ...patch },
      },
    });
  }

  return (
    <SetupAccordion
      title="Lead quadrants (Q1–Q4)"
      description="How moves are scored from lead source + estimated value, and which follow-ups are automated."
      count={4}
    >
      <div className="space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900">Move value threshold</h3>
          <p className="mt-1 text-xs text-slate-600">
            Uses the flat-rate quote total when quoted, or the hourly estimate from intake when
            not yet quoted.
          </p>
          <div className="mt-3 max-w-xs">
            <SettingsField label="High-value cutoff">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">$</span>
                <SettingsInput
                  type="number"
                  min={500}
                  step={100}
                  value={rules.highValueThreshold}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    if (Number.isFinite(next) && next > 0) {
                      updateRules({ highValueThreshold: next });
                    }
                  }}
                />
              </div>
            </SettingsField>
            <p className="mt-1.5 text-[11px] text-slate-500">
              At or above {thresholdLabel} → Q1 or Q2. Below → Q3 or Q4.
            </p>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-slate-900">Quadrant matrix</h3>
          <p className="mt-1 text-xs text-slate-600">
            Each move lands in one cell from lead source heat and estimated move value.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[20rem] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-semibold text-slate-500" />
                  <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-semibold text-slate-700">
                    High value ({thresholdLabel}+)
                  </th>
                  <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-semibold text-slate-700">
                    Lower value (under {thresholdLabel})
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th className="border border-slate-200 bg-slate-50 px-3 py-3 text-left align-top">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                      <Flame className="h-3.5 w-3.5" aria-hidden />
                      Hot source
                    </span>
                  </th>
                  <QuadrantCell tier="Q1" thresholdLabel={thresholdLabel} />
                  <QuadrantCell tier="Q3" thresholdLabel={thresholdLabel} />
                </tr>
                <tr>
                  <th className="border border-slate-200 bg-slate-50 px-3 py-3 text-left align-top">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-800">
                      <Snowflake className="h-3.5 w-3.5" aria-hidden />
                      Cold source
                    </span>
                  </th>
                  <QuadrantCell tier="Q2" thresholdLabel={thresholdLabel} />
                  <QuadrantCell tier="Q4" thresholdLabel={thresholdLabel} />
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-slate-900">Hot lead sources</h3>
          <p className="mt-1 text-xs text-slate-600">
            Sources marked hot count toward Q1/Q3. All others are cold (Q2/Q4).
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {fieldCatalog.leadSources.map((source) => (
              <li
                key={source.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2"
              >
                <span className="min-w-0 truncate text-sm text-slate-800">{source.label}</span>
                <label className="flex shrink-0 items-center gap-1.5 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={source.isHot ?? false}
                    onChange={(e) => patchLeadSourceHot(source.id, e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  Hot
                </label>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-slate-900">Quadrant labels</h3>
          <p className="mt-1 text-xs text-slate-600">
            Display names and badge colors on pipeline cards, filters, and reports. Follow-up and
            automation behavior per quadrant is under{" "}
            <a href="/admin/setup?tab=automations" className="font-medium text-brand-600 hover:underline">
              Setup → Automations
            </a>
            .
          </p>
          <ul className="mt-3 space-y-2">
            {PRIORITY_TIER_IDS.map((tier) => {
              const display = rules.tierDisplay[tier];
              return (
                <li
                  key={tier}
                  className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5"
                >
                  <span
                    className={cn(
                      "inline-flex shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold",
                      display.badgeClass,
                    )}
                  >
                    {tier}
                  </span>
                  <input
                    value={display.tierLabel}
                    onChange={(e) => patchTierDisplay(tier, { tierLabel: e.target.value })}
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-900"
                    aria-label={`Display name for ${tier}`}
                  />
                  <select
                    value={display.badgeClass}
                    onChange={(e) => patchTierDisplay(tier, { badgeClass: e.target.value })}
                    className="h-8 min-w-[7rem] rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-800"
                    aria-label={`Badge color for ${tier}`}
                  >
                    {TIER_BADGE_PRESETS.map((preset) => (
                      <option key={preset.badgeClass} value={preset.badgeClass}>
                        {preset.label}
                      </option>
                    ))}
                    {!TIER_BADGE_PRESETS.some((p) => p.badgeClass === display.badgeClass) ? (
                      <option value={display.badgeClass}>Custom</option>
                    ) : null}
                  </select>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </SetupAccordion>
  );
}

const QUADRANT_MEANING: Record<PriorityTierId, (threshold: string) => string> = {
  Q1: (t) => `Hot source + high value (${t}+)`,
  Q2: (t) => `Cold source + high value (${t}+)`,
  Q3: (t) => `Hot source + lower value (under ${t})`,
  Q4: (t) => `Cold source + lower value (under ${t})`,
};

function QuadrantCell({
  tier,
  thresholdLabel,
}: {
  tier: PriorityTierId;
  thresholdLabel: string;
}) {
  const style = priorityTierStyle(tier);
  return (
    <td className="border border-slate-200 px-3 py-3 align-top">
      <span className={cn("inline-flex rounded px-2 py-0.5 text-xs font-bold", style.badge)}>
        {tier}
      </span>
      <p className="mt-1 text-sm font-medium text-slate-900">{style.tierLabel}</p>
      <p className="mt-0.5 text-[11px] text-slate-500">
        {QUADRANT_MEANING[tier](thresholdLabel)}
      </p>
    </td>
  );
}
