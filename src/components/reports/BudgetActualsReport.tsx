"use client";

import { ReportMockFooter } from "@/components/reports/ReportMockFooter";
import { ReportPeriodPicker } from "@/components/reports/ReportPeriodPicker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { formatReportMoney, formatReportPercent } from "@/lib/reports/format";
import {
  getBudgetActualsRows,
  type BudgetActualsRow,
  type ReportPeriodId,
} from "@/lib/reports/mock-reports";
import { useMemo, useState } from "react";

function varianceCell(estimated: number, actual: number | null, format: (n: number) => string) {
  if (actual == null) return "—";
  const delta = actual - estimated;
  const cls =
    delta > 0 ? "text-amber-700 font-medium" : delta < 0 ? "text-emerald-700 font-medium" : "text-slate-600";
  return (
    <span className={`tabular-nums ${cls}`}>
      {format(actual)}
      <span className="ml-1 text-xs font-normal text-slate-500">
        ({delta > 0 ? "+" : ""}
        {format(delta)})
      </span>
    </span>
  );
}

export function BudgetActualsReport() {
  const [period, setPeriod] = useState<ReportPeriodId>("30");
  const rows = useMemo(() => getBudgetActualsRows(period), [period]);

  const columns = useMemo<Column<BudgetActualsRow>[]>(
    () => [
      {
        key: "move",
        header: "Move",
        cell: (row) => (
          <div>
            <p className="font-medium text-slate-900">{row.moveRef}</p>
            <p className="text-xs text-slate-500">{row.customer}</p>
          </div>
        ),
      },
      { key: "jobDate", header: "Date", cell: (row) => row.jobDate },
      {
        key: "miles",
        header: "Miles",
        cell: (row) => varianceCell(row.milesEstimated, row.milesActual, (n) => `${n} mi`),
      },
      {
        key: "labor",
        header: "Labor $",
        cell: (row) => varianceCell(row.laborEstimated, row.laborActual, formatReportMoney),
      },
      {
        key: "materials",
        header: "Materials $",
        cell: (row) => varianceCell(row.materialsEstimated, row.materialsActual, formatReportMoney),
      },
      {
        key: "flatRate",
        header: "Flat rate",
        cell: (row) => (
          <span className="tabular-nums font-semibold">{formatReportMoney(row.flatRate)}</span>
        ),
      },
      {
        key: "marginEst",
        header: "Est. margin",
        cell: (row) => (
          <span className="tabular-nums">{formatReportPercent(row.marginEstimatedPct, 1)}</span>
        ),
      },
      {
        key: "marginAct",
        header: "Actual margin",
        cell: (row) =>
          row.marginActualPct != null ? (
            <span
              className={`tabular-nums font-semibold ${
                row.marginActualPct < row.marginEstimatedPct - 2
                  ? "text-amber-700"
                  : "text-emerald-700"
              }`}
            >
              {formatReportPercent(row.marginActualPct, 1)}
            </span>
          ) : (
            "—"
          ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Budget vs actuals for miles, labor, materials, flat-rate revenue, and estimated vs actual margin.
        </p>
        <ReportPeriodPicker value={period} onChange={setPeriod} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Budget vs actuals by move</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <DataTable columns={columns} data={rows} />
        </CardContent>
      </Card>

      <ReportMockFooter note="Mock report — ties to move profitability estimates and crew app actuals when live." />
    </div>
  );
}
