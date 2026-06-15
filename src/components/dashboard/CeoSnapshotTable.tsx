"use client";

import { Badge } from "@/components/ui/Badge";
import {
  CEO_STATUS_BADGE,
  CEO_STATUS_LABELS,
  formatCeoMetricValue,
  type CeoMetricRow,
  type CeoSnapshotData,
} from "@/lib/dashboard/ceo-snapshot";
import { shiftMonthKey } from "@/lib/dashboard/month-buckets";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Fragment } from "react";

type CeoSnapshotTableProps = {
  data: CeoSnapshotData;
  monthKey: string;
  onMonthChange: (monthKey: string) => void;
};

export function CeoSnapshotTable({ data, monthKey, onMonthChange }: CeoSnapshotTableProps) {
  const { columns, sections, rows } = data;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">CEO Snapshot</h3>
          <p className="text-sm text-slate-600">
            Monthly scorecard by week — actuals vs targets with owner and source.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onMonthChange(shiftMonthKey(monthKey, -1))}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="min-w-[10rem] rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-sm font-medium text-slate-900">
            {columns.monthLabel}
          </div>
          <button
            type="button"
            onClick={() => onMonthChange(shiftMonthKey(monthKey, 1))}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[72rem] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="sticky left-0 z-20 min-w-[16rem] border-r border-slate-200 bg-slate-50 px-3 py-2.5">
                Metric
              </th>
              {columns.weeks.map((week) => (
                <th key={week.id} className="min-w-[7rem] px-2 py-2.5 text-center">
                  <div>{week.label}</div>
                  <div className="mt-0.5 text-[10px] font-normal normal-case text-slate-400">
                    {week.rangeLabel}
                  </div>
                </th>
              ))}
              <th className="min-w-[5rem] px-2 py-2.5 text-center">Metric Type</th>
              <th className="min-w-[6rem] px-2 py-2.5 text-right">Monthly Actual</th>
              <th className="min-w-[6rem] px-2 py-2.5 text-right">Monthly Target</th>
              <th className="min-w-[6rem] px-2 py-2.5 text-center">Status</th>
              <th className="min-w-[5rem] px-2 py-2.5">Owner</th>
              <th className="min-w-[12rem] px-2 py-2.5">Source</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => {
              const sectionRows = rows.filter((row) => row.sectionId === section.id);
              return (
                <Fragment key={section.id}>
                  <tr className="bg-slate-100/80">
                    <td
                      colSpan={5 + columns.weeks.length}
                      className="sticky left-0 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-700"
                    >
                      {section.label}
                    </td>
                  </tr>
                  {sectionRows.map((row) => (
                    <MetricRow key={row.id} row={row} weekCount={columns.weeks.length} />
                  ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricRow({ row, weekCount }: { row: CeoMetricRow; weekCount: number }) {
  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
      <td className="sticky left-0 z-10 border-r border-slate-100 bg-white px-3 py-2 font-medium text-slate-900">
        {row.label}
      </td>
      {row.weeks.slice(0, weekCount).map((value, index) => (
        <td key={`${row.id}-w${index}`} className="px-2 py-2 text-center tabular-nums text-slate-700">
          {formatCeoMetricValue(value, row.format)}
        </td>
      ))}
      <td className="px-2 py-2 text-center text-xs uppercase text-slate-500">
        {row.aggregateType === "total" ? "Total" : "Avg"}
      </td>
      <td className="px-2 py-2 text-right tabular-nums font-medium text-slate-900">
        {formatCeoMetricValue(row.monthlyActual, row.format)}
      </td>
      <td className="px-2 py-2 text-right tabular-nums text-slate-600">
        {formatCeoMetricValue(row.monthlyTarget, row.format)}
      </td>
      <td className="px-2 py-2 text-center">
        <Badge className={cn("text-[10px]", CEO_STATUS_BADGE[row.status])}>
          {CEO_STATUS_LABELS[row.status]}
        </Badge>
      </td>
      <td className="px-2 py-2 text-slate-700">{row.owner || "—"}</td>
      <td className="px-2 py-2 text-xs text-slate-500">{row.source || "—"}</td>
    </tr>
  );
}
