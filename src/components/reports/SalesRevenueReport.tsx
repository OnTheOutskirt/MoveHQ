"use client";

import { ReportMockFooter } from "@/components/reports/ReportMockFooter";
import { ReportPeriodPicker } from "@/components/reports/ReportPeriodPicker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { formatReportMoney } from "@/lib/reports/format";
import {
  getSalesRevenueRows,
  salesRevenueTotals,
  type ReportPeriodId,
  type SalesRevenueRow,
} from "@/lib/reports/mock-reports";
import { useMemo, useState } from "react";

export function SalesRevenueReport() {
  const [period, setPeriod] = useState<ReportPeriodId>("30");
  const rows = useMemo(() => getSalesRevenueRows(period), [period]);
  const totals = useMemo(() => salesRevenueTotals(rows), [rows]);

  const columns = useMemo<Column<SalesRevenueRow>[]>(
    () => [
      {
        key: "name",
        header: "Salesperson",
        cell: (row) => <span className="font-medium text-slate-900">{row.name}</span>,
      },
      { key: "leads", header: "Leads", cell: (row) => <span className="tabular-nums">{row.leads}</span> },
      {
        key: "proposals",
        header: "Proposals",
        cell: (row) => <span className="tabular-nums">{row.proposals}</span>,
      },
      {
        key: "bookedJobs",
        header: "Booked jobs",
        cell: (row) => <span className="tabular-nums font-semibold">{row.bookedJobs}</span>,
      },
      {
        key: "bookedRevenue",
        header: "Booked revenue",
        cell: (row) => (
          <span className="tabular-nums font-semibold">{formatReportMoney(row.bookedRevenue)}</span>
        ),
      },
      {
        key: "avgJobValue",
        header: "Avg job value",
        cell: (row) => <span className="tabular-nums">{formatReportMoney(row.avgJobValue)}</span>,
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Booked revenue overall and broken down by salesperson (includes web AI bookings without a rep).
        </p>
        <ReportPeriodPicker value={period} onChange={setPeriod} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-semibold tabular-nums">{totals.bookedJobs}</p>
            <p className="text-xs text-slate-500">Jobs booked</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-semibold tabular-nums text-brand-700">
              {formatReportMoney(totals.bookedRevenue)}
            </p>
            <p className="text-xs text-slate-500">Total booked revenue</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue by salesperson</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <DataTable columns={columns} data={rows} />
        </CardContent>
      </Card>

      <ReportMockFooter />
    </div>
  );
}
