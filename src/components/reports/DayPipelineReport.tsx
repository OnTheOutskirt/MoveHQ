"use client";

import { useCalendarSettings } from "@/components/providers/CalendarSettingsProvider";
import { bookingRatePercent } from "@/lib/calendar/sales-metrics";
import type { DaySalesMetrics } from "@/lib/calendar/types";
import { formatDayLong, toDateKey } from "@/lib/calendar/date-utils";
import { buildSalesRepDayMetrics, type SalesRepDayMetrics } from "@/lib/reports/day-sales-by-rep";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import Link from "next/link";
import { useMemo } from "react";

type DayPipelineReportProps = {
  date: Date;
  sales: DaySalesMetrics;
};

type PipelineRow = {
  stage: string;
  count: number;
  detail: string;
};

function buildPipelineRows(sales: DaySalesMetrics): PipelineRow[] {
  const leads = sales.leadsLocal + sales.leadsLongDistance;
  return [
    {
      stage: "Leads",
      count: leads,
      detail: `${sales.leadsLocal} local · ${sales.leadsLongDistance} long distance`,
    },
    {
      stage: "Proposals sent",
      count: sales.proposalsSent,
      detail: "Quotes or proposals delivered",
    },
    {
      stage: "Booked jobs",
      count: sales.bookedJobs,
      detail: "Moves booked for this day",
    },
  ];
}

export function DayPipelineReport({ date, sales }: DayPipelineReportProps) {
  const { colors } = useCalendarSettings();
  const rate = bookingRatePercent(sales);
  const rows = buildPipelineRows(sales);
  const repRows = useMemo(
    () => buildSalesRepDayMetrics(sales, toDateKey(date)),
    [sales, date],
  );

  const columns: Column<PipelineRow>[] = [
    { key: "stage", header: "Stage", cell: (row) => <span className="font-medium">{row.stage}</span> },
    {
      key: "count",
      header: "Count",
      cell: (row) => <span className="tabular-nums font-semibold">{row.count}</span>,
    },
    { key: "detail", header: "Detail", cell: (row) => <span className="text-slate-600">{row.detail}</span> },
  ];

  const repColumns: Column<SalesRepDayMetrics>[] = [
    {
      key: "name",
      header: "Sales person",
      cell: (row) => <span className="font-medium text-slate-900">{row.name}</span>,
    },
    {
      key: "leads",
      header: "Leads",
      cell: (row) => (
        <span className="tabular-nums">
          {row.leadsLocal + row.leadsLongDistance}
          <span className="ml-1 text-slate-500">
            ({row.leadsLocal}L/{row.leadsLongDistance}LD)
          </span>
        </span>
      ),
    },
    {
      key: "proposals",
      header: "Proposals",
      cell: (row) => <span className="tabular-nums font-semibold">{row.proposalsSent}</span>,
    },
    {
      key: "booked",
      header: "Booked",
      cell: (row) => <span className="tabular-nums font-semibold">{row.bookedJobs}</span>,
    },
    {
      key: "rate",
      header: "Booking rate",
      cell: (row) => (
        <span className="tabular-nums font-semibold" style={{ color: colors.bookingRateText }}>
          {row.bookingRatePercent}%
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Sales pipeline for <span className="font-semibold text-slate-900">{formatDayLong(date)}</span>
        </p>
        <Link
          href="/calendar"
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          ← Back to calendar
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-semibold tabular-nums">{sales.leadsLocal + sales.leadsLongDistance}</p>
            <p className="text-xs text-slate-500">Leads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-semibold tabular-nums">{sales.proposalsSent}</p>
            <p className="text-xs text-slate-500">Proposals sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-semibold tabular-nums">{sales.bookedJobs}</p>
            <p className="text-xs text-slate-500">Booked jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p
              className="text-2xl font-semibold tabular-nums"
              style={{ color: colors.bookingRateText }}
            >
              {rate}%
            </p>
            <p className="text-xs text-slate-500">Booking rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pipeline breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <DataTable columns={columns} data={rows} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>By sales person</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <DataTable columns={repColumns} data={repRows} />
        </CardContent>
      </Card>

      <p className="text-xs text-slate-500">
        Mock report — metrics mirror the calendar day sidebar. Live reporting will use stored lead
        and move events from Supabase.
      </p>
    </div>
  );
}
