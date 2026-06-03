"use client";

import { ReportMockFooter } from "@/components/reports/ReportMockFooter";
import { ReportPeriodPicker } from "@/components/reports/ReportPeriodPicker";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { formatReportMinutes, formatReportPercent } from "@/lib/reports/format";
import {
  getSpeedToLeadRows,
  type ReportPeriodId,
  type SpeedToLeadRow,
} from "@/lib/reports/mock-reports";
import { useMemo, useState } from "react";

export function SpeedToLeadReport() {
  const [period, setPeriod] = useState<ReportPeriodId>("30");
  const rows = useMemo(() => getSpeedToLeadRows(period), [period]);

  const columns = useMemo<Column<SpeedToLeadRow>[]>(
    () => [
      {
        key: "channel",
        header: "Channel",
        cell: (row) => <span className="font-medium text-slate-900">{row.channel}</span>,
      },
      {
        key: "handledBy",
        header: "Handled by",
        cell: (row) => (
          <Badge variant={row.handledBy === "AI" ? "brand" : "default"}>{row.handledBy}</Badge>
        ),
      },
      { key: "leads", header: "Leads", cell: (row) => <span className="tabular-nums">{row.leads}</span> },
      {
        key: "response",
        header: "Avg first response",
        cell: (row) => (
          <span className="tabular-nums font-medium">{formatReportMinutes(row.avgFirstResponseMin)}</span>
        ),
      },
      {
        key: "contacted",
        header: "Contacted",
        cell: (row) => <span className="tabular-nums">{row.contacted}</span>,
      },
      {
        key: "booked",
        header: "Booked",
        cell: (row) => <span className="tabular-nums font-semibold">{row.booked}</span>,
      },
      {
        key: "conversion",
        header: "Lead → booked",
        cell: (row) => (
          <span className="tabular-nums font-semibold text-brand-700">
            {formatReportPercent(row.conversionPct)}
          </span>
        ),
      },
    ],
    [],
  );

  const aiRow = rows.find((r) => r.handledBy === "AI");
  const personRows = rows.filter((r) => r.handledBy === "Person");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Compare response time and conversion for AI-handled web quotes vs sales team follow-up.
        </p>
        <ReportPeriodPicker value={period} onChange={setPeriod} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-semibold tabular-nums">
              {aiRow ? formatReportMinutes(aiRow.avgFirstResponseMin) : "—"}
            </p>
            <p className="text-xs text-slate-500">AI avg first response</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-semibold tabular-nums">
              {personRows.length
                ? formatReportMinutes(
                    personRows.reduce((s, r) => s + r.avgFirstResponseMin, 0) / personRows.length,
                  )
                : "—"}
            </p>
            <p className="text-xs text-slate-500">Person avg first response</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-semibold tabular-nums text-brand-700">
              {aiRow ? formatReportPercent(aiRow.conversionPct) : "—"}
            </p>
            <p className="text-xs text-slate-500">AI lead → booked rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Speed to lead by channel</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <DataTable columns={columns} data={rows} />
        </CardContent>
      </Card>

      <ReportMockFooter />
    </div>
  );
}
