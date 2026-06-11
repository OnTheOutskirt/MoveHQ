"use client";

import { SetupAccordion } from "@/components/admin/setup/SetupAccordion";
import { PRIORITY_TIER_IDS, priorityTierStyle } from "@/lib/moves/move-priority-tier";
import type { PriorityTierId } from "@/lib/moves/types";
import {
  TIER_FOLLOW_UP_MODE_LABELS,
  type TierFollowUpMode,
} from "@/lib/settings/priority-tier-rules";
import { useSettingsSection } from "@/lib/settings/use-settings-editor";
import type { PipelineAutomationRule } from "@/lib/settings/pipeline-automation-rules";
import { ruleAppliesToQuadrant } from "@/lib/settings/pipeline-automation-rules";
import { cn } from "@/lib/utils";
import Link from "next/link";

const FOLLOW_UP_MODES: TierFollowUpMode[] = ["automated", "manual", "mixed"];

const MODE_HINT: Record<TierFollowUpMode, string> = {
  manual: "Rep-owned — customer-facing automations (calls, SMS, email) are off.",
  automated: "System-owned — matching rules run automatically.",
  mixed: "High-touch stages stay manual; nurture and reminders automate.",
};

type QuadrantAutomationsSectionProps = {
  rules: PipelineAutomationRule[];
};

export function QuadrantAutomationsSection({ rules }: QuadrantAutomationsSectionProps) {
  const { value: tierRules, update: updateTierRules } = useSettingsSection("priorityTierRules");

  function patchFollowUpMode(tier: PriorityTierId, mode: TierFollowUpMode) {
    updateTierRules({
      followUpMode: { ...tierRules.followUpMode, [tier]: mode },
    });
  }

  function ruleCountForQuadrant(tier: PriorityTierId): number {
    return rules.filter((r) => r.enabled && ruleAppliesToQuadrant(r, tier)).length;
  }

  return (
    <SetupAccordion
      title="Follow-ups by quadrant"
      description="Manual, mixed, or fully automated pipeline behavior per Q1–Q4."
    >
      <p className="mb-3 text-xs text-slate-600">
        Quadrant scoring lives under{" "}
        <Link href="/admin/setup?tab=leads" className="font-medium text-brand-600 hover:underline">
          Setup → Leads
        </Link>
        . Limit individual rules to specific quadrants in each rule&apos;s settings.
      </p>
      <ul className="space-y-2">
        {PRIORITY_TIER_IDS.map((tier) => {
          const display = tierRules.tierDisplay[tier];
          const style = priorityTierStyle(tier);
          const mode = tierRules.followUpMode[tier];
          const activeRules = ruleCountForQuadrant(tier);
          return (
            <li key={tier} className="rounded-lg border border-slate-200 bg-white px-3 py-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold",
                        style.badge,
                      )}
                    >
                      {tier}
                    </span>
                    <span className="text-sm font-medium text-slate-900">{display.tierLabel}</span>
                    <span className="text-xs text-slate-500">
                      {activeRules} rule{activeRules === 1 ? "" : "s"} apply
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{MODE_HINT[mode]}</p>
                </div>
                <select
                  value={mode}
                  onChange={(e) => patchFollowUpMode(tier, e.target.value as TierFollowUpMode)}
                  className="h-9 min-w-[14rem] rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-800"
                  aria-label={`Follow-up mode for ${tier}`}
                >
                  {FOLLOW_UP_MODES.map((m) => (
                    <option key={m} value={m}>
                      {TIER_FOLLOW_UP_MODE_LABELS[m]}
                    </option>
                  ))}
                </select>
              </div>
            </li>
          );
        })}
      </ul>
    </SetupAccordion>
  );
}
