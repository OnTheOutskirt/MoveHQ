"use client";

import { InventoryActivityPanel } from "@/components/operations/inventory/InventoryActivityPanel";
import { InventoryAdjustDialog } from "@/components/operations/inventory/InventoryAdjustDialog";
import { useInventory } from "@/components/providers/InventoryProvider";
import { TabBar } from "@/components/shared/TabBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { ViewSwitcher } from "@/components/ui/ViewSwitcher";
import {
  billableValueOnHand,
  countLowStock,
  filterStockLines,
  formatInventoryQuantity,
  inventoryTypeLabel,
  searchStockLines,
  usageRowsForPeriod,
} from "@/lib/operations/inventory";
import type { InventoryAdjustmentKind, InventoryFilter, InventoryStockLine } from "@/lib/operations/inventory-types";
import { pageMeta } from "@/lib/navigation/page-meta";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  LayoutGrid,
  List,
  Package,
  PackageMinus,
  PackagePlus,
  RefreshCw,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const meta = pageMeta["/operations/inventory"];

const FILTER_TABS: { id: InventoryFilter | "low"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "billable", label: "Billable" },
  { id: "non-billable", label: "Non-billable" },
  { id: "low", label: "Low stock" },
];

const VIEW_OPTIONS = [
  { id: "cards" as const, label: "Cards", icon: LayoutGrid },
  { id: "table" as const, label: "Table", icon: List },
];

type AdjustTarget = {
  line: InventoryStockLine;
  kind: InventoryAdjustmentKind;
};

export function InventoryWorkspace() {
  const { isReady, stockLines, transactions, adjust } = useInventory();
  const [filter, setFilter] = useState<InventoryFilter | "low">("all");
  const [view, setView] = useState<"cards" | "table">("cards");
  const [search, setSearch] = useState("");
  const [adjustTarget, setAdjustTarget] = useState<AdjustTarget | null>(null);

  const filtered = useMemo(() => {
    let lines = filter === "low" ? stockLines.filter((l) => l.isLow) : filterStockLines(stockLines, filter);
    return searchStockLines(lines, search);
  }, [stockLines, filter, search]);

  const lowCount = useMemo(() => countLowStock(stockLines), [stockLines]);
  const billableValue = useMemo(() => billableValueOnHand(stockLines), [stockLines]);
  const usage7d = useMemo(
    () => usageRowsForPeriod(stockLines, transactions, 7).slice(0, 6),
    [stockLines, transactions],
  );

  const billableLines = useMemo(() => filtered.filter((l) => l.billable), [filtered]);
  const nonBillableLines = useMemo(() => filtered.filter((l) => !l.billable), [filtered]);

  if (!isReady) {
    return <p className="text-sm text-slate-500">Loading inventory…</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={meta.title}
        description="Track packing supplies and move-day gear — stock levels, usage, and reorder alerts."
      />

      {lowCount > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                {lowCount} item{lowCount === 1 ? "" : "s"} running low
              </p>
              <p className="text-xs text-amber-800">
                Reorder or receive stock before the next busy weekend.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFilter("low")}
            className="text-xs font-semibold text-amber-900 hover:underline"
          >
            View low stock
          </button>
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-4">
        <SummaryCard label="Items tracked" value={String(stockLines.length)} />
        <SummaryCard
          label="Billable stock value"
          value={new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }).format(billableValue)}
          hint="Customer-charged supplies only"
        />
        <SummaryCard
          label="Need reorder"
          value={String(lowCount)}
          hint={lowCount > 0 ? "At or below reorder point" : "All levels OK"}
          urgent={lowCount > 0}
        />
        <SummaryCard
          label="7-day usage"
          value={String(usage7d.length)}
          hint="Items with receive/use activity"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TabBar
          tabs={FILTER_TABS.map((t) => ({
            ...t,
            label: t.id === "low" && lowCount > 0 ? `${t.label} (${lowCount})` : t.label,
          }))}
          activeTab={filter}
          onChange={setFilter}
        />
        <ViewSwitcher options={VIEW_OPTIONS} value={view} onChange={setView} ariaLabel="Inventory view" />
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search supplies…"
          className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </div>

      {usage7d.length > 0 ? (
        <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">7-day usage highlights</h2>
              <p className="text-xs text-slate-500">Most consumed billable and internal supplies</p>
            </div>
            <Link
              href="/operations/reports?tab=operations&report=inventory"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
            >
              Full report
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {usage7d.map((row) => (
              <li
                key={row.catalogId}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <p className="font-medium text-slate-900">{row.label}</p>
                <p className="mt-0.5 text-xs text-slate-600">
                  Used {row.used} · Received {row.received} · On hand {row.onHand}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {view === "table" ? (
        <InventoryTable lines={filtered} onAdjust={(line, kind) => setAdjustTarget({ line, kind })} />
      ) : (
        <div className="space-y-6">
          {(filter === "all" || filter === "billable" || filter === "low") && billableLines.length > 0 ? (
            <InventorySection
              title="Billable supplies"
              description="Charged to customers on quotes — boxes, paper, wrap, and packing kits."
              lines={billableLines}
              onAdjust={(line, kind) => setAdjustTarget({ line, kind })}
            />
          ) : null}

          {(filter === "all" || filter === "non-billable" || filter === "low") &&
          nonBillableLines.length > 0 ? (
            <InventorySection
              title="Non-billable gear"
              description="Internal use — blankets, floor protection, dollies, and move-day equipment."
              lines={nonBillableLines}
              onAdjust={(line, kind) => setAdjustTarget({ line, kind })}
            />
          ) : null}

          {filtered.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
              No items match this view. Try another filter or search term.
            </p>
          ) : null}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <InventoryActivityPanel transactions={transactions} />
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Quick actions</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
            <li>
              <span className="font-medium text-slate-700">Received</span> — shipment or restock
            </li>
            <li>
              <span className="font-medium text-slate-700">Used</span> — materials out on jobs
            </li>
            <li>
              <span className="font-medium text-slate-700">Count</span> — physical inventory check
            </li>
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            Catalog items are managed in Admin → Setup → Equipment &amp; supplies.
          </p>
        </div>
      </div>

      <InventoryAdjustDialog
        line={adjustTarget?.line ?? null}
        initialKind={adjustTarget?.kind ?? "receive"}
        open={adjustTarget != null}
        onClose={() => setAdjustTarget(null)}
        onSave={({ kind, amount, note }) => {
          if (!adjustTarget) return;
          adjust({
            catalogId: adjustTarget.line.catalogId,
            kind,
            amount,
            note: note || undefined,
          });
        }}
      />
    </div>
  );
}

function InventoryTable({
  lines,
  onAdjust,
}: {
  lines: InventoryStockLine[];
  onAdjust: (line: InventoryStockLine, kind: InventoryAdjustmentKind) => void;
}) {
  if (lines.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
        No items in this view.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-[40rem] w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-2.5">Item</th>
            <th className="px-4 py-2.5">Type</th>
            <th className="px-4 py-2.5 text-right">On hand</th>
            <th className="px-4 py-2.5 text-right">Reorder at</th>
            <th className="px-4 py-2.5">Status</th>
            <th className="px-4 py-2.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {lines.map((line) => (
            <tr key={line.catalogId} className={line.isLow ? "bg-amber-50/30" : undefined}>
              <td className="px-4 py-3 font-medium text-slate-900">{line.label}</td>
              <td className="px-4 py-3 text-slate-600">{inventoryTypeLabel(line.billable)}</td>
              <td className="px-4 py-3 text-right tabular-nums font-semibold">
                {formatInventoryQuantity(line.quantityOnHand, line.unit)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                {line.reorderPoint} {line.unit}
              </td>
              <td className="px-4 py-3">
                {line.isLow ? (
                  <Badge variant="warning">Low</Badge>
                ) : (
                  <Badge variant="success">OK</Badge>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <Button type="button" size="sm" variant="secondary" onClick={() => onAdjust(line, "receive")}>
                    +
                  </Button>
                  <Button type="button" size="sm" variant="secondary" onClick={() => onAdjust(line, "use")}>
                    −
                  </Button>
                  <Button type="button" size="sm" variant="secondary" onClick={() => onAdjust(line, "count")}>
                    #
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  urgent,
}: {
  label: string;
  value: string;
  hint?: string;
  urgent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3",
        urgent ? "border-amber-200 bg-amber-50/50" : "border-slate-200 bg-white",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={cn("mt-1 text-2xl font-semibold tabular-nums", urgent ? "text-amber-900" : "text-slate-900")}>
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function InventorySection({
  title,
  description,
  lines,
  onAdjust,
}: {
  title: string;
  description: string;
  lines: InventoryStockLine[];
  onAdjust: (line: InventoryStockLine, kind: InventoryAdjustmentKind) => void;
}) {
  return (
    <section>
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <ul className="space-y-2">
        {lines.map((line) => (
          <InventoryRow key={line.catalogId} line={line} onAdjust={onAdjust} />
        ))}
      </ul>
    </section>
  );
}

function InventoryRow({
  line,
  onAdjust,
}: {
  line: InventoryStockLine;
  onAdjust: (line: InventoryStockLine, kind: InventoryAdjustmentKind) => void;
}) {
  const fillPct =
    line.reorderPoint > 0
      ? Math.min(100, Math.round((line.quantityOnHand / (line.reorderPoint * 2)) * 100))
      : 100;

  return (
    <li
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        line.isLow ? "border-amber-200" : "border-slate-200",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Package className="h-4 w-4 text-slate-400" aria-hidden />
          <p className="font-medium text-slate-900">{line.label}</p>
          <Badge variant="default">{inventoryTypeLabel(line.billable)}</Badge>
          {line.isLow ? (
            <Badge variant="warning">Low</Badge>
          ) : (
            <Badge variant="success">OK</Badge>
          )}
        </div>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
          {formatInventoryQuantity(line.quantityOnHand, line.unit)}
        </p>
        <div className="mt-2 h-1.5 max-w-xs overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn("h-full rounded-full", line.isLow ? "bg-amber-500" : "bg-emerald-500")}
            style={{ width: `${fillPct}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Reorder at {line.reorderPoint} {line.unit}
          {line.billable && line.unitPrice > 0
            ? ` · ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(line.unitPrice)} each`
            : ""}
          {line.lastCountedAt
            ? ` · Counted ${line.lastCountedAt.slice(0, 10)}`
            : ""}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 sm:shrink-0">
        <Button type="button" size="sm" variant="secondary" onClick={() => onAdjust(line, "receive")}>
          <PackagePlus className="h-4 w-4" />
          Received
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={() => onAdjust(line, "use")}>
          <PackageMinus className="h-4 w-4" />
          Used
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={() => onAdjust(line, "count")}>
          <RefreshCw className="h-4 w-4" />
          Count
        </Button>
      </div>
    </li>
  );
}
