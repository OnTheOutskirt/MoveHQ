"use client";

import { CalendarMoveRowLink } from "@/components/calendar/CalendarMoveRowLink";
import { Badge } from "@/components/ui/Badge";
import { pipelineStageLabel } from "@/lib/calendar/day-jobs-mock";
import { calendarMoveDetailHref } from "@/lib/calendar/resolve-move-link";
import type { DayPipelineRow } from "@/lib/calendar/types";
import { cn } from "@/lib/utils";

function stageBadgeVariant(stage: DayPipelineRow["stage"]) {
  if (stage === "booked") return "success" as const;
  if (stage === "proposal_sent") return "brand" as const;
  if (stage === "contacted") return "warning" as const;
  return "default" as const;
}

type DayPipelineTableProps = {
  rows: DayPipelineRow[];
};

export function DayPipelineTable({ rows }: DayPipelineTableProps) {
  return (
    <section>
      <h3 className="text-xs font-medium uppercase tracking-wide text-slate-400">Moves</h3>
      {rows.length === 0 ? (
        <p className="mt-2 text-xs text-slate-400">None for this day.</p>
      ) : (
        <div className="mt-2 overflow-hidden rounded-md border border-slate-100 bg-slate-50/50">
          <table className="w-full table-fixed text-xs text-slate-600">
            <colgroup>
              <col className="w-[26%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[13%]" />
              <col className="w-[23%]" />
              <col className="w-[14%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                <th className="px-2 py-1.5 text-left font-medium">Person</th>
                <th className="px-1.5 py-1.5 text-right font-medium">Movers</th>
                <th className="px-1.5 py-1.5 text-right font-medium">Trucks</th>
                <th className="px-1.5 py-1.5 text-right font-medium">Est. Hrs</th>
                <th className="px-1.5 py-1.5 text-left font-medium">Stage</th>
                <th className="px-2 py-1.5 text-left font-medium">FTA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => {
                const linked = Boolean(calendarMoveDetailHref(row.personName, row.moveId));

                return (
                  <CalendarMoveRowLink
                    key={row.id}
                    label={row.personName}
                    moveId={row.moveId}
                    asRow
                    className={cn(!linked && "hover:bg-transparent cursor-default")}
                  >
                    <td
                      className={cn(
                        "truncate px-2 py-1.5 font-medium",
                        linked ? "text-brand-700" : "text-slate-700",
                      )}
                      title={row.personName}
                    >
                      {row.personName}
                    </td>
                    <td className="px-1.5 py-1.5 text-right tabular-nums">{row.movers}</td>
                    <td className="px-1.5 py-1.5 text-right tabular-nums">{row.trucks}</td>
                    <td className="px-1.5 py-1.5 text-right tabular-nums">{row.estHours}</td>
                    <td className="px-1.5 py-1.5">
                      <Badge
                        variant={stageBadgeVariant(row.stage)}
                        className="max-w-full truncate px-1.5 py-px text-[10px]"
                      >
                        {pipelineStageLabel[row.stage]}
                      </Badge>
                    </td>
                    <td className="truncate px-2 py-1.5 text-slate-400">{row.fta ?? "—"}</td>
                  </CalendarMoveRowLink>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
