"use client";

import { ReportMockFooter } from "@/components/reports/ReportMockFooter";
import { ReportPeriodPicker } from "@/components/reports/ReportPeriodPicker";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { formatReportMoney, formatReportPercent } from "@/lib/reports/format";
import {
  getCommissionRows,
  type CommissionRow,
  type ReportPeriodId,
} from "@/lib/reports/mock-reports";
import { useMemo, useState } from "react";

const STATUS_LABEL: Record<CommissionRow["status"], string> = {
  current: "Current period",
  pending_payout: "Pending payout",
  paid: "Paid",
};

export function CommissionReport() {
  const [period, setPeriod] = useState<ReportPeriodId>("30");
  const rows = useMemo(() => getCommissionRows(period), [period]);

  const totalDue = useMemo(() => rows.reduce((s, r) => s + r.commissionDue, 0), [rows]);

  const columns = useMemo<Column<CommissionRow>[]>(
    () => [
      {
        key: "name",
        header: "Salesperson",
        cell: (row) => <span className="font-medium text-slate-900">{row.name}</span>,
      },
      {
        key: "bookedRevenue",
        header: "Booked revenue",
        cell: (row) => (
          <span className="tabular-nums">{formatReportMoney(row.bookedRevenue)}</span>
        ),
      },
      {
        key: "rate",
        header: "Rate",
        cell: (row) => (
          <span className="tabular-nums">{formatReportPercent(row.commissionRatePct, 1)}</span>
        ),
      },
      {
        key: "due",
        header: "Commission due",
        cell: (row) => (
          <span className="tabular-nums font-semibold">{formatReportMoney(row.commissionDue)}</span>
        ),
      },
      {
        key: "paidYtd",
        header: "Paid YTD",
        cell: (row) => <span className="tabular-nums">{formatReportMoney(row.paidYtd)}</span>,
      },
      {
        key: "balance",
        header: "Balance",
        cell: (row) => (
          <span className="tabular-nums font-medium">{formatReportMoney(row.balance)}</span>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (row) => (
          <Badge variant={row.status === "pending_payout" ? "warning" : "default"}>
            {STATUS_LABEL[row.status]}
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
          Track booked revenue, commission rates, amounts due, and payout status per salesperson.
        </p>
        <ReportPeriodPicker value={period} onChange={setPeriod} />
      </div>

      <Card>
        <CardContent className="py-4 text-center">
          <p className="text-2xl font-semibold tabular-nums text-brand-700">
            {formatReportMoney(totalDue)}
          </p>
          <p className="text-xs text-slate-500">Total commission due this period</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commission by salesperson</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <DataTable columns={columns} data={rows} />
        </CardContent>
      </Card>

      <ReportMockFooter note="Mock report — commission rules and payout batches will come from payroll settings." />
    </div>
  );
}
