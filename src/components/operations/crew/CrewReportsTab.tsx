"use client";

import { useCrewRecords } from "@/components/providers/CrewRecordsProvider";
import { useFleet } from "@/components/providers/FleetProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { buildCrewPerformanceSummaries, type CrewMemberPerformanceSummary } from "@/lib/operations/crew-records";
import { formatViolationRating, violationRatingTextClass } from "@/lib/operations/violation-rating";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

const PERIODS = [
  { id: "30", label: "Last 30 days" },
  { id: "90", label: "Last 90 days" },
  { id: "all", label: "All time" },
] as const;

type PeriodId = (typeof PERIODS)[number]["id"];

export function CrewReportsTab() {
  const { crew } = useFleet();
  const { issues, skipperRatings, driverReviews } = useCrewRecords();
  const [period, setPeriod] = useState<PeriodId>("30");

  const summaries = useMemo(
    () => buildCrewPerformanceSummaries(crew, { issues, skipperRatings, driverReviews }),
    [crew, issues, skipperRatings, driverReviews],
  );

  const columns = useMemo<Column<CrewMemberPerformanceSummary>[]>(
    () => [
      {
        key: "name",
        header: "Crew",
        cell: (row) => (
          <div>
            <p className="font-medium text-slate-900">{row.name}</p>
            {row.isSkipper ? (
              <Badge variant="brand" className="mt-0.5">
                Skipper
              </Badge>
            ) : null}
          </div>
        ),
      },
      {
        key: "rating",
        header: "Avg score",
        cell: (row) =>
          row.isSkipper ? (
            row.avgRating != null ? (
              <span className={cn("tabular-nums font-medium", violationRatingTextClass(row.avgRating))}>
                {formatViolationRating(row.avgRating)}
              </span>
            ) : (
              "—"
            )
          ) : (
            <span className="text-slate-400">N/A</span>
          ),
      },
      {
        key: "open",
        header: "Open issues",
        cell: (row) => (
          <span className={row.openIssues > 0 ? "font-medium text-amber-700" : "text-slate-600"}>
            {row.openIssues}
          </span>
        ),
      },
      {
        key: "attendance",
        header: "Attendance (30d)",
        cell: (row) => row.attendance30d,
      },
      {
        key: "seatBelt",
        header: "Seat belt (30d)",
        cell: (row) => row.seatBelt30d,
      },
      {
        key: "complaints",
        header: "Customer (30d)",
        cell: (row) => row.customerComplaints30d,
      },
      {
        key: "complaintsOpen",
        header: "Open customer",
        cell: (row) => (
          <span
            className={
              row.openCustomerComplaints > 0 ? "font-medium text-red-700" : "text-slate-600"
            }
          >
            {row.openCustomerComplaints}
          </span>
        ),
      },
      {
        key: "callbacks",
        header: "Callbacks (30d)",
        cell: (row) => row.callbacks30d,
      },
      {
        key: "total",
        header: "Total (30d)",
        cell: (row) => row.totalIssues30d,
      },
    ],
    [],
  );

  const teamTotals = useMemo(() => {
    return summaries.reduce(
      (acc, row) => ({
        openIssues: acc.openIssues + row.openIssues,
        attendance: acc.attendance + row.attendance30d,
        customerOpen: acc.customerOpen + row.openCustomerComplaints,
        callbacks: acc.callbacks + row.callbacks30d,
      }),
      { openIssues: 0, attendance: 0, customerOpen: 0, callbacks: 0 },
    );
  }, [summaries]);

  function exportCsv() {
    const headers = [
      "Crew",
      "Skipper",
      "Avg score (/10)",
      "Open issues",
      "Attendance (30d)",
      "Seat belt (30d)",
      "Customer (30d)",
      "Open customer",
      "Callbacks (30d)",
      "Total issues (30d)",
    ];
    const rows = summaries.map((r) =>
      [
        r.name,
        r.isSkipper ? "Yes" : "No",
        r.isSkipper && r.avgRating != null ? r.avgRating.toFixed(1) : r.isSkipper ? "" : "",
        r.openIssues,
        r.attendance30d,
        r.seatBelt30d,
        r.customerComplaints30d,
        r.openCustomerComplaints,
        r.callbacks30d,
        r.totalIssues30d,
      ].join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `crew-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-2xl text-sm text-slate-600">
          V1 crew reporting rolls up issues and skipper ratings per person. Use for weekly ops
          review, coaching, and payroll follow-up.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodId)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-800"
            aria-label="Report period"
          >
            {PERIODS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <Button type="button" variant="secondary" size="sm" onClick={exportCsv}>
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ReportStat label="Open issues (team)" value={teamTotals.openIssues} />
        <ReportStat label="Attendance (30d)" value={teamTotals.attendance} />
        <ReportStat
          label="Open customer issues"
          value={teamTotals.customerOpen}
          warn={teamTotals.customerOpen > 0}
        />
        <ReportStat label="Callbacks (30d)" value={teamTotals.callbacks} />
      </div>

      {period !== "30" ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          Per-person columns currently reflect the last 30 days. Longer period rollups will expand
          in a future release.
        </p>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white">
        <DataTable
          columns={columns}
          data={summaries}
          emptyMessage="No active crew to report on."
          getRowKey={(row) => row.crewId}
        />
      </div>
    </div>
  );
}

function ReportStat({
  label,
  value,
  warn,
}: {
  label: string;
  value: number;
  warn?: boolean;
}) {
  return (
    <div
      className={
        warn
          ? "rounded-xl border border-red-200 bg-red-50/50 px-4 py-3"
          : "rounded-xl border border-slate-200 bg-white px-4 py-3"
      }
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}
