"use client";

import { usePlanningProgress } from "@/components/planning/PlanningProgressProvider";
import { usePlanningSchedule } from "@/components/planning/PlanningScheduleProvider";
import { countProgress } from "@/lib/planning/planning-progress";
import { cn } from "@/lib/utils";

export function TimelineTable() {
  const { progress } = usePlanningProgress();
  const { timelineRows, updateTimelineRow } = usePlanningSchedule();

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <p className="border-b border-slate-100 bg-slate-50/80 px-4 py-2 text-xs text-slate-500">
        Edit start and end dates — linked bars on the schedule chart update automatically.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 font-semibold text-slate-700">Phase</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Start</th>
              <th className="px-4 py-3 font-semibold text-slate-700">End</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Deliverables</th>
              <th className="w-28 px-4 py-3 font-semibold text-slate-700">Progress</th>
            </tr>
          </thead>
          <tbody>
            {timelineRows.map((row) => {
              const isNote = row.rowKind === "note";
              const { done, total } = countProgress(row.itemIds, progress);
              const pct = total ? Math.round((done / total) * 100) : null;
              const complete = total > 0 && done === total;

              return (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-slate-100 last:border-0",
                    isNote && "bg-amber-50/50",
                    complete && !isNote && "bg-emerald-50/40",
                  )}
                >
                  <td className="px-4 py-3 font-medium text-slate-900">{row.phase}</td>
                  <td className="px-4 py-3">
                    {isNote ? (
                      <span className="text-xs text-slate-500">{row.dates}</span>
                    ) : (
                      <input
                        type="date"
                        value={row.start}
                        onChange={(e) =>
                          updateTimelineRow(row.id, e.target.value, row.end)
                        }
                        className="rounded border border-slate-200 px-2 py-1 text-xs"
                      />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isNote ? (
                      <span className="text-xs text-slate-400">—</span>
                    ) : (
                      <input
                        type="date"
                        value={row.end}
                        onChange={(e) =>
                          updateTimelineRow(row.id, row.start, e.target.value)
                        }
                        className="rounded border border-slate-200 px-2 py-1 text-xs"
                      />
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{row.deliverables}</td>
                  <td className="px-4 py-3">
                    {isNote ? (
                      <span className="text-xs text-slate-400">—</span>
                    ) : total === 0 ? (
                      <span className="text-xs text-slate-400">—</span>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2 text-xs tabular-nums text-slate-600">
                          <span>
                            {done}/{total}
                          </span>
                          <span>{pct}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              complete ? "bg-emerald-500" : "bg-brand-500",
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
