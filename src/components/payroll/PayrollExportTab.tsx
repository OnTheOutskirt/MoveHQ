"use client";

import { DataTable, type Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  buildRipplingPayrollRows,
  entriesInPeriod,
  ripplingPayrollCsvContent,
  PAY_PERIODS,
} from "@/lib/payroll/mock-time-entries";
import {
  RIPPLING_PAYROLL_COLUMNS,
  type RipplingPayrollRow,
} from "@/lib/payroll/rippling-columns";
import { ripplingRowDisplayValue } from "@/lib/payroll/rippling-export";
import type { PayPeriod, TimeEntry } from "@/lib/payroll/types";
import { Download } from "lucide-react";
import { useMemo, useState } from "react";

type PayrollExportTabProps = {
  entries: TimeEntry[];
};

export function PayrollExportTab({ entries }: PayrollExportTabProps) {
  const [periodId, setPeriodId] = useState(PAY_PERIODS[0]!.id);

  const period = PAY_PERIODS.find((p) => p.id === periodId) ?? PAY_PERIODS[0]!;
  const periodEntries = useMemo(
    () => entriesInPeriod(entries, period),
    [entries, period],
  );
  const rows = useMemo(() => buildRipplingPayrollRows(periodEntries), [periodEntries]);

  const columns = useMemo<Column<RipplingPayrollRow>[]>(
    () =>
      RIPPLING_PAYROLL_COLUMNS.map((col) => ({
        key: col.key,
        header: col.uiHeader,
        cell: (r) => {
          const value = ripplingRowDisplayValue(r, col.key);
          const isHours = col.key === "basePayHours" || col.key === "overtimeHours";
          return isHours && value !== "—" ? (
            <span className="font-medium tabular-nums">{value}</span>
          ) : (
            value
          );
        },
      })),
    [],
  );

  function downloadCsv() {
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
      <Card className="border-violet-200 bg-violet-50/40">
        <CardContent className="py-4 text-sm text-violet-950/90">
          <p>
            <strong>Rippling API (V2):</strong> this tab will push approved hours automatically.
            For now, download a CSV with Rippling&apos;s column names and upload manually. Base and
            OT hours roll up from approved time; tips, mileage, per diem, and bonuses are left blank
            until those flows exist.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="text-xs font-medium text-slate-500">Pay period</span>
          <select
            value={periodId}
            onChange={(e) => setPeriodId(e.target.value)}
            className="mt-1 block h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm"
          >
            {PAY_PERIODS.map((p: PayPeriod) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <Button type="button" size="sm" onClick={downloadCsv} disabled={rows.length === 0}>
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
        {periodEntries.length} approved entries · {rows.length} employees · CSV uses Rippling
        headers exactly ({RIPPLING_PAYROLL_COLUMNS.length} columns)
      </p>
    </div>
  );
}
