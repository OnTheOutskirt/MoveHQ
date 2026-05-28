"use client";

import { getMovePlanSummary } from "@/lib/moves/move-workspace";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

type MovePlanSummaryPanelProps = {
  move: MoveRecord;
  onOpenPlan?: () => void;
  compact?: boolean;
};

function Field({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

export function MovePlanSummaryPanel({
  move,
  onOpenPlan,
  compact,
}: MovePlanSummaryPanelProps) {
  const plan = getMovePlanSummary(move);

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Move plan summary</h3>
          <p className="text-xs text-slate-500">Operational blueprint from intake</p>
        </div>
        {onOpenPlan ? (
          <button
            type="button"
            onClick={onOpenPlan}
            className="text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            Full plan →
          </button>
        ) : null}
      </div>
      <div className={cn("p-4", compact ? "space-y-3" : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3")}>
        <Field label="Scope" value={plan.scope} className="sm:col-span-2 lg:col-span-3" />
        <Field label="Complexity" value={plan.complexity} />
        <Field label="Crew recommendation" value={plan.crewRecommendation} />
        <Field label="Estimated duration" value={plan.estimatedDuration} />
        <div className="sm:col-span-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Special conditions
          </p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {plan.specialConditions.map((c) => (
              <li
                key={c}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
              >
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-end gap-2">
          <Sparkles className="h-4 w-4 text-brand-500" aria-hidden />
          <Field label="AI confidence" value={plan.aiConfidence} />
        </div>
      </div>
    </section>
  );
}
