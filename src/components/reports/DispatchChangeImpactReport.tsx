"use client";

import { ReportMockFooter } from "@/components/reports/ReportMockFooter";
import { ReportPeriodPicker } from "@/components/reports/ReportPeriodPicker";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { formatReportMoney } from "@/lib/reports/format";
import {
  dispatchChangeTotals,
  getDispatchChangeRows,
  type DispatchChangeRow,
  type ReportPeriodId,
} from "@/lib/reports/mock-reports";
import { useMemo, useState } from "react";

export function DispatchChangeImpactReport() {
  const [period, setPeriod] = useState<ReportPeriodId>("30");
  const rows = useMemo(() => getDispatchChangeRows(period), [period]);
  const totals = useMemo(() => dispatchChangeTotals(rows), [rows]);

  const columns = useMemo<Column<DispatchChangeRow>[]>(
    () => [
      {
        key: "moveRef",
        header: "Job",
        cell: (row) => (
          <div>
            <p className="font-medium text-slate-900">{row.moveRef}</p>
            <p className="text-xs text-slate-500">{row.jobDate}</p>
          </div>
        ),
      },
      {
        key: "change",
        header: "Change",
        cell: (row) => <span className="text-slate-800">{row.changeSummary}</span>,
      },
      {
        key: "ai",
        header: "AI quote baseline",
        cell: (row) => <span className="text-sm text-slate-600">{row.aiQuoteBaseline}</span>,
      },
      {
        key: "dispatch",
        header: "Dispatch override",
        cell: (row) => <span className="text-sm font-medium text-slate-900">{row.dispatchOverride}</span>,
      },
      {
        key: "impact",
        header: "Impact",
        cell: (row) => {
          if (row.impactLabel === "neutral") {
            return <Badge variant="default">No change</Badge>;
          }
          const saves = row.impactLabel === "saves";
          return (
            <span className={`tabular-nums font-semibold ${saves ? "text-emerald-700" : "text-amber-700"}`}>
              {saves ? "Saves " : "Costs "}
              {formatReportMoney(Math.abs(row.impactUsd))}
            </span>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          When operations changes crew or trucks from the AI quote, track whether dispatch saves or costs money.
        </p>
        <ReportPeriodPicker value={period} onChange={setPeriod} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-semibold tabular-nums text-emerald-700">
              {formatReportMoney(totals.saves)}
            </p>
            <p className="text-xs text-slate-500">Estimated savings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-semibold tabular-nums text-amber-700">
              {formatReportMoney(totals.costs)}
            </p>
            <p className="text-xs text-slate-500">Estimated extra cost</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p
              className={`text-2xl font-semibold tabular-nums ${totals.net >= 0 ? "text-emerald-700" : "text-amber-700"}`}
            >
              {totals.net >= 0 ? "+" : "−"}
              {formatReportMoney(Math.abs(totals.net))}
            </p>
            <p className="text-xs text-slate-500">Net impact</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dispatch overrides vs AI quote</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <DataTable columns={columns} data={rows} />
        </CardContent>
      </Card>

      <ReportMockFooter />
    </div>
  );
}
