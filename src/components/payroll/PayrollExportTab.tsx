"use client";

import { DataTable, type Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  buildRipplingPayrollRows,
  entriesInPeriod,
  payPeriodsForToday,
  ripplingPayrollCsvContent,
} from "@/lib/payroll/mock-time-entries";
import { assessPayPeriodReadiness } from "@/lib/payroll/payroll-readiness";
import {
  RIPPLING_PAYROLL_COLUMNS,
  type RipplingPayrollRow,
} from "@/lib/payroll/rippling-columns";
import { ripplingRowDisplayValue } from "@/lib/payroll/rippling-export";
import type { PayPeriod, TimeEntry, TipEntry } from "@/lib/payroll/types";
import { AlertTriangle, Download } from "lucide-react";
import { useMemo, useState } from "react";

type PayrollExportTabProps = {
  allEntries: TimeEntry[];
  allTips: TipEntry[];
};

export function PayrollExportTab({ allEntries, allTips }: PayrollExportTabProps) {
  const payPeriods = useMemo(() => payPeriodsForToday(), []);
  const [periodId, setPeriodId] = useState(payPeriods[0]!.id);

  const period = payPeriods.find((p) => p.id === periodId) ?? payPeriods[0]!;
  const periodEntries = useMemo(
    () => entriesInPeriod(allEntries, period),
    [allEntries, period],
  );
  const periodTips = useMemo(
    () => allTips.filter((t) => t.date >= period.start && t.date <= period.end),
    [allTips, period],
  );
  const approvedEntries = useMemo(
    () => periodEntries.filter((e) => e.status === "approved"),
    [periodEntries],
  );
  const approvedTips = useMemo(
    () => periodTips.filter((t) => t.status === "approved"),
    [periodTips],
  );

  const readiness = useMemo(
    () => assessPayPeriodReadiness(allEntries, allTips, period),
    [allEntries, allTips, period],
  );

  const rows = useMemo(
    () =>
      buildRipplingPayrollRows(
        approvedEntries,
        approvedTips.map((t) => ({ personName: t.personName, amount: t.amount })),
      ),
    [approvedEntries, approvedTips],
  );

  const columns = useMemo<Column<RipplingPayrollRow>[]>(
    () =>
      RIPPLING_PAYROLL_COLUMNS.map((col) => ({
        key: col.key,
        header: col.uiHeader,
        cell: (r) => {
          const value = ripplingRowDisplayValue(r, col.key);
          const isHours = col.key === "basePayHours" || col.key === "overtimeHours";
          const isTips = col.key === "payableCashTips";
          return isHours && value !== "—" ? (
            <span className="font-medium tabular-nums">{value}</span>
          ) : isTips && value !== "—" ? (
            <span className="font-medium tabular-nums text-violet-800">{value}</span>
          ) : (
            value
          );
        },
      })),
    [],
  );

  function downloadCsv() {
    if (!readiness.ready) return;
    const csv = ripplingPayrollCsvContent(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rippling-payroll-${period.start}-${period.end}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {!readiness.ready ? (
        <Card className="border-amber-200 bg-amber-50/60">
          <CardContent className="flex gap-3 py-4 text-sm text-amber-950">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold">Export blocked — approvals incomplete</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-amber-900/90">
                {readiness.blockers.map((blocker) => (
                  <li key={blocker.message}>{blocker.message}</li>
                ))}
              </ul>
              <p className="mt-2 text-amber-800/90">
                Approve all pending time on the Time entries tab and tips on the Tips tab for{" "}
                {period.label.toLowerCase()}.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="py-3 text-sm text-emerald-900">
            All time entries and crew tips are approved for this pay period — ready to export.
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="text-xs font-medium text-slate-500">Pay period</span>
          <select
            value={periodId}
            onChange={(e) => setPeriodId(e.target.value)}
            className="mt-1 block h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm"
          >
            {payPeriods.map((p: PayPeriod) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <Button
          type="button"
          size="sm"
          onClick={downloadCsv}
          disabled={!readiness.ready || rows.length === 0}
        >
          <Download className="h-4 w-4" />
          Export CSV for Rippling
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <DataTable
          columns={columns}
          data={rows}
          emptyMessage="No approved hours in this period yet."
          getRowKey={(r) => String(r.employeeName)}
        />
      </div>

      <p className="text-xs text-slate-500">
        {approvedEntries.length} approved time entries · {approvedTips.length} approved tips ·{" "}
        {rows.length} employees · CSV uses Rippling headers exactly (
        {RIPPLING_PAYROLL_COLUMNS.length} columns)
      </p>
    </div>
  );
}
