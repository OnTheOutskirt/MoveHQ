"use client";

import { useEquipmentCatalog } from "@/components/providers/EquipmentCatalogProvider";
import {
  adjustmentKindLabel,
  formatInventoryQuantity,
  formatTransactionSummary,
} from "@/lib/operations/inventory";
import type { InventoryTransaction } from "@/lib/operations/inventory-types";
import { formatMoveDate } from "@/lib/moves/format";
import { cn } from "@/lib/utils";
import { History } from "lucide-react";

type InventoryActivityPanelProps = {
  transactions: InventoryTransaction[];
  limit?: number;
  className?: string;
};

export function InventoryActivityPanel({
  transactions,
  limit = 12,
  className,
}: InventoryActivityPanelProps) {
  const { catalog } = useEquipmentCatalog();
  const recent = transactions.slice(0, limit);

  if (recent.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center",
          className,
        )}
      >
        <History className="mx-auto h-6 w-6 text-slate-300" />
        <p className="mt-2 text-sm text-slate-500">No stock adjustments yet.</p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white", className)}>
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">Recent activity</h2>
        <p className="text-xs text-slate-500">Receives, job usage, and physical counts</p>
      </div>
      <ul className="divide-y divide-slate-100">
        {recent.map((tx) => {
          const item = catalog.find((c) => c.id === tx.catalogId);
          const label = item?.label ?? tx.catalogId;
          const unit = item?.unit ?? "units";
          return (
            <li key={tx.id} className="flex flex-wrap items-start justify-between gap-2 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">{label}</p>
                <p className="text-xs text-slate-600">
                  {formatTransactionSummary(tx, label, unit)}
                </p>
                {tx.note ? <p className="mt-0.5 text-xs text-slate-500">{tx.note}</p> : null}
              </div>
              <div className="text-right text-xs text-slate-500">
                <p className="font-medium text-slate-700">{adjustmentKindLabel(tx.kind)}</p>
                <p>{formatMoveDate(tx.at.slice(0, 10))}</p>
                <p>On hand {formatInventoryQuantity(tx.quantityAfter, unit)}</p>
                <p className="text-slate-400">{tx.by}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
