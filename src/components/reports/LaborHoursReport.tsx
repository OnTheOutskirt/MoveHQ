"use client";

import { ReportMockFooter } from "@/components/reports/ReportMockFooter";
import { ReportPeriodPicker } from "@/components/reports/ReportPeriodPicker";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { formatReportHours } from "@/lib/reports/format";
import {
  getLaborHoursRows,
  type LaborHoursRow,
  type ReportPeriodId,
} from "@/lib/reports/mock-reports";
import { useMemo, useState } from "react";

const STATUS_LABEL: Record<LaborHoursRow["status"], string> = {
  scheduled: "Scheduled",
  in_progress: "In progress",
  completed: "Completed",
};

export function LaborHoursReport() {
  const [period, setPeriod] = useState<ReportPeriodId>("30");
  const rows = useMemo(() => getLaborHoursRows(period), [period]);

  const completed = rows.filter((r) => r.hoursActual != null);
  const totalVariance = completed.reduce((s, r) => s + (r.varianceHours ?? 0), 0);

  const columns = useMemo<Column<LaborHoursRow>[]>(
    () => [
      {
        key: "moveRef",
        header: "Job",
        cell: (row) => (
          <div>
            <p className="font-medium text-slate-900">{row.moveRef}</p>
            <p className="text-xs text-slate-500">{row.customer}</p>
          </div>
        ),
      },
      { key: "jobDate", header: "Date", cell: (row) => row.jobDate },
      { key: "movers", header: "Movers", cell: (row) => <span className="tabular-nums">{row.movers}</span> },
      {
        key: "estimated",
        header: "Est. hours",
        cell: (row) => <span className="tabular-nums">{formatReportHours(row.hoursEstimated)}</span>,
      },
      {
        key: "actual",
        header: "Actual hours",
        cell: (row) =>
          row.hoursActual != null ? (
            <span className="tabular-nums font-semibold">{formatReportHours(row.hoursActual)}</span>
          ) : (
            "—"
          ),
      },
      {
        key: "variance",
        header: "Variance",
        cell: (row) => {
          if (row.varianceHours == null) return "—";
          const v = row.varianceHours;
          return (
            <span
              className={
                v > 0 ? "tabular-nums font-medium text-amber-700" : v < 0 ? "tabular-nums text-emerald-700" : "tabular-nums"
              }
            >
              {v > 0 ? "+" : ""}
              {formatReportHours(v)}
            </span>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        cell: (row) => <Badge variant="default">{STATUS_LABEL[row.status]}</Badge>,
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Mover labor hours per job — estimated from the quote vs actual from the crew app.
        </p>
        <ReportPeriodPicker value={period} onChange={setPeriod} />
      </div>

      <Card>
        <CardContent className="py-4 text-center">
          <p
            className={`text-2xl font-semibold tabular-nums ${totalVariance > 0 ? "text-amber-700" : "text-emerald-700"}`}
          >
            {completed.length ? `${totalVariance > 0 ? "+" : ""}${formatReportHours(totalVariance)}` : "—"}
          </p>
          <p className="text-xs text-slate-500">Net hours vs estimate (completed jobs)</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Labor hours by job</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <DataTable columns={columns} data={rows} />
        </CardContent>
      </Card>

      <ReportMockFooter />
    </div>
  );
}
