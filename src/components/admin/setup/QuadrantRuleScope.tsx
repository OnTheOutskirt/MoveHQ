"use client";

import { priorityTierStyle } from "@/lib/moves/move-priority-tier";
import type { PriorityTierId } from "@/lib/moves/types";
import {
  AUTOMATION_QUADRANT_IDS,
  toggleRuleQuadrant,
  type PipelineAutomationRule,
} from "@/lib/settings/pipeline-automation-rules";
import { cn } from "@/lib/utils";

type QuadrantRuleScopeProps = {
  rule: PipelineAutomationRule;
  onChange: (quadrants: PriorityTierId[]) => void;
};

export function QuadrantRuleScope({ rule, onChange }: QuadrantRuleScopeProps) {
  const scoped = rule.quadrants ?? [];
  const allQuadrants = scoped.length === 0;

  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Quadrants
      </p>
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => onChange([])}
          className={cn(
            "rounded-md border px-2 py-0.5 text-xs font-medium",
            allQuadrants
              ? "border-brand-200 bg-brand-50 text-brand-800"
              : "border-slate-200 bg-white text-slate-500",
          )}
        >
          All
        </button>
        {AUTOMATION_QUADRANT_IDS.map((tier) => {
          const active = allQuadrants || scoped.includes(tier);
          const style = priorityTierStyle(tier);
          return (
            <button
              key={tier}
              type="button"
              onClick={() => onChange(toggleRuleQuadrant(rule, tier))}
              className={cn(
                "rounded-md border px-2 py-0.5 text-[10px] font-bold transition-colors",
                active
                  ? cn(style.badge, "border-transparent")
                  : "border-slate-200 bg-white text-slate-400",
              )}
            >
              {tier}
            </button>
          );
        })}
      </div>
      {!allQuadrants ? (
        <p className="text-[10px] text-slate-500">Only runs for selected quadrants.</p>
      ) : null}
    </div>
  );
}
