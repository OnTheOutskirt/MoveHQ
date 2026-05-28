"use client";

import { usePlanningProgress } from "@/components/planning/PlanningProgressProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { PlanningGroup } from "@/lib/planning/types";
import { countProgress } from "@/lib/planning/planning-progress";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

export function ChecklistGroup({ group }: { group: PlanningGroup }) {
  const { progress, toggle, isDone } = usePlanningProgress();
  const ids = group.items.map((i) => i.id);
  const { done, total } = countProgress(ids, progress);
  const complete = done === total && total > 0;

  return (
    <Card className={cn(complete && "border-emerald-200 bg-emerald-50/30")}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">{group.title}</CardTitle>
            {group.audienceDescription ?? group.description ? (
              <p className="mt-1 text-sm text-slate-600">
                {group.audienceDescription ?? group.description}
              </p>
            ) : null}
            {group.builderDescription ? (
              <p className="mt-1 text-xs text-slate-400">Build: {group.builderDescription}</p>
            ) : null}
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums",
              complete ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600",
            )}
          >
            {done}/{total}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1">
          {group.items.map((item) => {
            const doneItem = isDone(item.id);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className={cn(
                    "flex w-full gap-3 rounded-lg px-2 py-2 text-left transition-colors",
                    "hover:bg-slate-50",
                    doneItem && "opacity-80",
                  )}
                >
                  {doneItem ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "text-sm text-slate-800",
                        doneItem && "text-slate-500 line-through",
                      )}
                    >
                      {item.label}
                    </span>
                    {item.note ? (
                      <span className="mt-0.5 block text-xs text-slate-500">{item.note}</span>
                    ) : null}
                    {item.builderNote ? (
                      <span className="mt-0.5 block text-[11px] text-slate-400">
                        Build: {item.builderNote}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
