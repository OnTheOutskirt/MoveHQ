"use client";

import {
  ChangeOrderSidebar,
  type ChangeOrderPanelMode,
} from "@/components/moves/detail/ChangeOrderSidebar";
import { DetailSection } from "@/components/moves/detail/DetailSection";
import { useChangeOrders } from "@/components/providers/ChangeOrdersProvider";
import { Button } from "@/components/ui/Button";
import { formatMoveDate } from "@/lib/moves/format";
import {
  CHANGE_ORDER_KIND_DESCRIPTIONS,
  CHANGE_ORDER_KIND_LABELS,
  CHANGE_ORDER_STATUS_LABELS,
  changeOrdersForMove,
} from "@/lib/moves/change-orders";
import type { ChangeOrderKind } from "@/lib/moves/change-orders-types";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { ArrowRightLeft, Package, Plus, RefreshCw, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

const WORKFLOW_CARDS: {
  kind: ChangeOrderKind;
  icon: typeof Sparkles;
  accent: string;
}[] = [
  {
    kind: "charge_order",
    icon: Sparkles,
    accent: "border-violet-200 bg-violet-50/80 hover:border-violet-300",
  },
  {
    kind: "small_minor",
    icon: ArrowRightLeft,
    accent: "border-sky-200 bg-sky-50/80 hover:border-sky-300",
  },
  {
    kind: "small_inventory_labor",
    icon: Package,
    accent: "border-teal-200 bg-teal-50/80 hover:border-teal-300",
  },
  {
    kind: "full_requote",
    icon: RefreshCw,
    accent: "border-amber-200 bg-amber-50/80 hover:border-amber-300",
  },
];

type MoveDetailChangeOrdersSectionProps = {
  move: MoveRecord;
};

export function MoveDetailChangeOrdersSection({ move }: MoveDetailChangeOrdersSectionProps) {
  const { orders } = useChangeOrders();
  const [panel, setPanel] = useState<ChangeOrderPanelMode>({ type: "closed" });

  const moveOrders = useMemo(
    () => changeOrdersForMove(orders, move.id),
    [orders, move.id],
  );

  function openCreate(kind: ChangeOrderKind) {
    setPanel({ type: "create", kind, moveId: move.id });
  }

  return (
    <>
      <DetailSection
        title="Quotes & change orders"
        description="Charge orders, small changes, and full requotes — without leaving the move."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {WORKFLOW_CARDS.map(({ kind, icon: Icon, accent }) => (
            <button
              key={kind}
              type="button"
              onClick={() => openCreate(kind)}
              className={cn(
                "rounded-xl border p-4 text-left transition-colors",
                accent,
              )}
            >
              <Icon className="h-5 w-5 text-slate-700" aria-hidden />
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {CHANGE_ORDER_KIND_LABELS[kind]}
              </p>
              <p className="mt-1 text-xs leading-snug text-slate-600">
                {CHANGE_ORDER_KIND_DESCRIPTIONS[kind]}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-600">
            {moveOrders.length === 0
              ? "No change orders on this move yet."
              : `${moveOrders.length} change order${moveOrders.length === 1 ? "" : "s"}`}
          </p>
          <Button type="button" size="sm" variant="secondary" onClick={() => openCreate("small_minor")}>
            <Plus className="h-4 w-4" />
            New change order
          </Button>
        </div>

        {moveOrders.length > 0 ? (
          <ul className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {moveOrders.map((order) => (
              <li key={order.id}>
                <button
                  type="button"
                  onClick={() => setPanel({ type: "view", orderId: order.id })}
                  className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">{order.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {CHANGE_ORDER_KIND_LABELS[order.kind]} ·{" "}
                      {formatMoveDate(order.createdAt.slice(0, 10))} · {order.createdBy}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-700">
                      {CHANGE_ORDER_STATUS_LABELS[order.status]}
                    </span>
                    {order.amountDelta != null ? (
                      <span
                        className={cn(
                          "text-sm font-semibold tabular-nums",
                          order.amountDelta >= 0 ? "text-emerald-700" : "text-red-700",
                        )}
                      >
                        {order.amountDelta >= 0 ? "+" : ""}$
                        {order.amountDelta.toLocaleString()}
                      </span>
                    ) : null}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </DetailSection>

      <ChangeOrderSidebar mode={panel} move={move} onClose={() => setPanel({ type: "closed" })} />
    </>
  );
}
