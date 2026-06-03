"use client";

import { ReportMockFooter } from "@/components/reports/ReportMockFooter";
import { ReportPeriodPicker } from "@/components/reports/ReportPeriodPicker";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { formatReportMoney, formatReportPercent } from "@/lib/reports/format";
import {
  aiQuoteAccuracySummary,
  getAiQuoteAccuracyRows,
  type AiQuoteAccuracyRow,
  type ReportPeriodId,
} from "@/lib/reports/mock-reports";
import { useMemo, useState } from "react";

const OUTCOME_LABEL: Record<AiQuoteAccuracyRow["outcome"], string> = {
  booked: "Booked",
  quoted: "Quoted — open",
  abandoned: "Abandoned",
};

export function AiQuotesAccuracyReport() {
  const [period, setPeriod] = useState<ReportPeriodId>("30");
  const rows = useMemo(() => getAiQuoteAccuracyRows(period), [period]);
  const summary = useMemo(() => aiQuoteAccuracySummary(rows), [rows]);

  const columns = useMemo<Column<AiQuoteAccuracyRow>[]>(
    () => [
      {
        key: "move",
        header: "Quote / move",
        cell: (row) => (
          <div>
            <p className="font-medium text-slate-900">{row.moveRef}</p>
            <p className="text-xs text-slate-500">{row.customer}</p>
          </div>
        ),
      },
      { key: "quotedAt", header: "Quoted", cell: (row) => row.quotedAt },
      {
        key: "aiQuote",
        header: "AI quote",
        cell: (row) => (
          <span className="tabular-nums font-medium">{formatReportMoney(row.aiQuoteUsd)}</span>
        ),
      },
      {
        key: "final",
        header: "Final booked",
        cell: (row) =>
          row.finalBookedUsd != null ? (
            <span className="tabular-nums font-semibold">{formatReportMoney(row.finalBookedUsd)}</span>
          ) : (
            "—"
          ),
      },
      {
        key: "variance",
        header: "Price variance",
        cell: (row) =>
          row.variancePct != null ? (
            <span
              className={`tabular-nums ${Math.abs(row.variancePct) > 5 ? "font-medium text-amber-700" : "text-slate-700"}`}
            >
              {row.variancePct > 0 ? "+" : ""}
              {formatReportPercent(row.variancePct, 1)}
            </span>
          ) : (
            "—"
          ),
      },
      {
        key: "inventory",
        header: "Inventory match",
        cell: (row) => (
          <span className="tabular-nums">{formatReportPercent(row.inventoryMatchPct, 0)}</span>
        ),
      },
      {
        key: "labor",
        header: "Labor match",
        cell: (row) => (
          <span className="tabular-nums">
            {row.laborMatchPct > 0 ? formatReportPercent(row.laborMatchPct, 0) : "—"}
          </span>
        ),
      },
      {
        key: "outcome",
        header: "Outcome",
        cell: (row) => (
          <Badge
            variant={
              row.outcome === "booked" ? "success" : row.outcome === "abandoned" ? "default" : "warning"
            }
          >
            {OUTCOME_LABEL[row.outcome]}
          </Badge>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          AI flat-rate quote accuracy — price variance vs final booking and how well inventory and labor matched the job.
        </p>
        <ReportPeriodPicker value={period} onChange={setPeriod} />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-semibold tabular-nums">{summary.quoted}</p>
            <p className="text-xs text-slate-500">AI quotes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-semibold tabular-nums text-brand-700">{summary.booked}</p>
            <p className="text-xs text-slate-500">Booked</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-semibold tabular-nums">
              {summary.avgVariancePct != null
                ? formatReportPercent(summary.avgVariancePct, 1)
                : "—"}
            </p>
            <p className="text-xs text-slate-500">Avg price variance (booked)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-semibold tabular-nums">
              {formatReportPercent(summary.avgInventoryMatchPct, 0)}
            </p>
            <p className="text-xs text-slate-500">Avg inventory match</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI quote accuracy</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <DataTable columns={columns} data={rows} />
        </CardContent>
      </Card>

      <ReportMockFooter />
    </div>
  );
}
