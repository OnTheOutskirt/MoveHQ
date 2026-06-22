"use client";

import { usePlanningProgress } from "@/components/planning/PlanningProgressProvider";
import type { RoadmapSection } from "@/lib/planning/roadmap-data";
import type { PlanningGroup } from "@/lib/planning/types";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

/** Strip a trailing "(June)", "(V2)", etc. so the high-level list reads clean. */
function highLevelLabel(title: string): string {
  return title.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

type ChecklistItem = { id: string; label: string };

export function RoadmapChecklist({
  groups,
  sections,
  idPrefix,
}: {
  groups: PlanningGroup[];
  sections: RoadmapSection[];
  idPrefix: string;
}) {
  const { toggle, isDone } = usePlanningProgress();

  const groupById = new Map(groups.map((group) => [group.id, group]));

  const resolvedSections = sections.map((section) => {
    const items: ChecklistItem[] = section.groupIds
      .map((groupId) => groupById.get(groupId))
      .filter((group): group is PlanningGroup => Boolean(group))
      .map((group) => ({ id: `${idPrefix}-${group.id}`, label: highLevelLabel(group.title) }));
    return { title: section.title, items };
  });

  const allItems = resolvedSections.flatMap((section) => section.items);
  const totalDone = allItems.filter((item) => isDone(item.id)).length;

  return (
    <div className="space-y-5">
      <p className="text-sm font-medium text-slate-500">
        {totalDone} of {allItems.length} done
      </p>

      {resolvedSections.map((section) => {
        const sectionDone = section.items.filter((item) => isDone(item.id)).length;
        return (
          <div key={section.title} className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900">{section.title}</h3>
              <span className="shrink-0 text-xs font-medium tabular-nums text-slate-400">
                {sectionDone}/{section.items.length}
              </span>
            </div>
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
              {section.items.map((item) => {
                const doneItem = isDone(item.id);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggle(item.id)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50",
                        doneItem && "bg-emerald-50/40",
                      )}
                    >
                      {doneItem ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                      ) : (
                        <Circle className="h-5 w-5 shrink-0 text-slate-300" />
                      )}
                      <span
                        className={cn(
                          "text-sm font-medium text-slate-800",
                          doneItem && "text-slate-500 line-through",
                        )}
                      >
                        {item.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
