"use client";

import { useInventory } from "@/components/providers/InventoryProvider";
import { ReportMockFooter } from "@/components/reports/ReportMockFooter";
import { ReportPeriodPicker } from "@/components/reports/ReportPeriodPicker";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import {
  adjustmentKindLabel,
  billableValueOnHand,
  countLowStock,
  formatInventoryQuantity,
  formatTransactionSummary,
  inventoryTypeLabel,
  usageRowsForPeriod,
} from "@/lib/operations/inventory";
import type { InventoryStockLine, InventoryTransaction } from "@/lib/operations/inventory-types";
import { REPORT_PERIODS, type ReportPeriodId } from "@/lib/reports/mock-reports";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useMemo, useState } from "react";

type UsageRow = ReturnType<typeof usageRowsForPeriod>[number];

export function InventoryReport() {
  const { isReady, stockLines, transactions } = useInventory();
  const [period, setPeriod] = useState<ReportPeriodId>("30");

  const periodDays = Number(period);
  const usageRows = useMemo(
    () => usageRowsForPeriod(stockLines, transactions, periodDays),
    [stockLines, transactions, periodDays],
  );

  const lowLines = useMemo(() => stockLines.filter((l) => l.isLow), [stockLines]);
  const billableValue = useMemo(() => billableValueOnHand(stockLines), [stockLines]);
  const totalUsed = useMemo(() => usageRows.reduce((s, r) => s + r.used, 0), [usageRows]);
  const totalReceived = useMemo(() => usageRows.reduce((s, r) => s + r.received, 0), [usageRows]);

  const recentActivity = useMemo(() => {
    const cutoff = Date.now() - periodDays * 24 * 60 * 60 * 1000;
    return transactions
      .filter((t) => new Date(t.at).getTime() >= cutoff)
      .slice(0, 20);
  }, [transactions, periodDays]);

  const usageColumns = useMemo<Column<UsageRow>[]>(
    () => [
      {
        key: "item",
        header: "Item",
        cell: (row) => (
          <div>
            <p className="font-medium text-slate-900">{row.label}</p>
            <p className="text-xs text-slate-500">{inventoryTypeLabel(row.billable)}</p>
          </div>
        ),
      },
      {
        key: "used",
        header: "Used",
        cell: (row) => (
          <span className="tabular-nums font-medium text-slate-800">
            {row.used > 0 ? row.used : "—"}
          </span>
        ),
      },
      {
        key: "received",
        header: "Received",
        cell: (row) => (
          <span className="tabular-nums text-slate-700">
            {row.received > 0 ? row.received : "—"}
          </span>
        ),
      },
      {
        key: "onHand",
        header: "On hand now",
        cell: (row) => (
          <span className="tabular-nums font-semibold">{row.onHand}</span>
        ),
      },
      {
        key: "value",
        header: "Stock value",
        cell: (row) =>
          row.billable && row.unitPrice > 0 ? (
            <span className="tabular-nums">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(row.onHand * row.unitPrice)}
            </span>
          ) : (
            <span className="text-slate-400">—</span>
          ),
      },
    ],
    [],
  );

  const activityColumns = useMemo<Column<InventoryTransaction & { label: string; unit: string }>[]>(
    () => [
      {
        key: "at",
        header: "When",
        cell: (row) => (
          <span className="text-sm text-slate-700">
            {new Date(row.at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        ),
      },
      {
        key: "item",
        header: "Item",
        cell: (row) => <span className="font-medium text-slate-900">{row.label}</span>,
      },
      {
        key: "change",
        header: "Change",
        cell: (row) => (
          <span className="text-sm text-slate-700">
            {formatTransactionSummary(row, row.label, row.unit)}
          </span>
        ),
      },
      {
        key: "kind",
        header: "Type",
        cell: (row) => <Badge variant="default">{adjustmentKindLabel(row.kind)}</Badge>,
      },
      {
        key: "by",
        header: "By",
        cell: (row) => <span className="text-sm text-slate-600">{row.by}</span>,
      },
    ],
    [],
  );

  const activityRows = useMemo(
    () =>
      recentActivity.map((tx) => {
        const line = stockLines.find((l) => l.catalogId === tx.catalogId);
        return {
          ...tx,
          label: line?.label ?? tx.catalogId,
          unit: line?.unit ?? "ea",
        };
      }),
    [recentActivity, stockLines],
  );

  if (!isReady) {
    return <p className="text-sm text-slate-500">Loading inventory report…</p>;
  }

  const periodLabel = REPORT_PERIODS.find((p) => p.id === period)?.label ?? `${periodDays} days`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ReportPeriodPicker value={period} onChange={setPeriod} />
        <Link
          href="/operations/inventory"
          className="text-xs font-semibold text-brand-600 hover:text-brand-800"
        >
          Go to inventory →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Billable value on hand" value={formatMoney(billableValue)} />
        <MetricCard label="Items low" value={String(countLowStock(stockLines))} warn={lowLines.length > 0} />
        <MetricCard label={`Used (${periodLabel})`} value={String(totalUsed)} />
        <MetricCard label={`Received (${periodLabel})`} value={String(totalReceived)} />
      </div>

      {lowLines.length > 0 ? (
        <Card className="border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Reorder soon</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-slate-100">
              {lowLines.map((line) => (
                <LowStockRow key={line.catalogId} line={line} />
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Usage by item</CardTitle>
          <p className="text-xs font-normal text-slate-500">
            What moved in and out over the selected period.
          </p>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <DataTable
            columns={usageColumns}
            data={usageRows}
            emptyMessage="No inventory activity in this period."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <DataTable
            columns={activityColumns}
            data={activityRows}
            emptyMessage="No adjustments logged yet."
          />
        </CardContent>
      </Card>

      <ReportMockFooter note="Inventory report uses ops adjustments until job-level auto-deduction is wired." />
    </div>
  );
}

function MetricCard({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3",
        warn ? "border-amber-200 bg-amber-50/40" : "border-slate-200 bg-white",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={cn("mt-1 text-xl font-semibold tabular-nums", warn ? "text-amber-900" : "text-slate-900")}>
        {value}
      </p>
    </div>
  );
}

function LowStockRow({ line }: { line: InventoryStockLine }) {
  const shortfall = Math.max(0, line.reorderPoint - line.quantityOnHand + 1);
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
      <div>
        <p className="font-medium text-slate-900">{line.label}</p>
        <p className="text-xs text-slate-500">
          {formatInventoryQuantity(line.quantityOnHand, line.unit)} on hand · reorder at {line.reorderPoint}
        </p>
      </div>
      <p className="text-xs font-medium text-amber-800">
        Suggest ordering ~{shortfall} {line.unit}
      </p>
    </li>
  );
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
