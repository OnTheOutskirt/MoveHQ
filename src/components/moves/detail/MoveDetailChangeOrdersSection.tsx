"use client";

import {
  ChangeOrderSidebar,
  type ChangeOrderPanelMode,
} from "@/components/moves/detail/ChangeOrderSidebar";
import { DetailSection } from "@/components/moves/detail/DetailSection";
import { useChangeOrders } from "@/components/providers/ChangeOrdersProvider";
import { formatMoveDate } from "@/lib/moves/format";
import {
  CHANGE_ORDER_KIND_LABELS,
  CHANGE_ORDER_STATUS_LABELS,
  changeOrdersForMove,
} from "@/lib/moves/change-orders";
import type { ChangeOrderKind } from "@/lib/moves/change-orders-types";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { RefreshCw, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

const CHANGE_ORDER_OPTIONS: {
  kind: ChangeOrderKind;
  icon: typeof Sparkles;
  accent: string;
}[] = [
  {
    kind: "small_minor",
    icon: Sparkles,
    accent: "border-violet-200 bg-violet-50/60 hover:border-violet-300",
  },
  {
    kind: "full_requote",
    icon: RefreshCw,
    accent: "border-amber-200 bg-amber-50/60 hover:border-amber-300",
  },
];

type MoveDetailChangeOrdersSectionProps = {
  move: MoveRecord;
  /** Nested under flat-rate quote — lighter chrome, no outer DetailSection. */
  embedded?: boolean;
};

export function MoveDetailChangeOrdersSection({
  move,
  embedded = false,
}: MoveDetailChangeOrdersSectionProps) {
  const { orders } = useChangeOrders();
  const [panel, setPanel] = useState<ChangeOrderPanelMode>({ type: "closed" });

  const moveOrders = useMemo(
    () => changeOrdersForMove(orders, move.id),
    [orders, move.id],
  );

  function openCreate(kind: ChangeOrderKind) {
    setPanel({ type: "create", kind, moveId: move.id });
  }

  const content = (
    <>
        <div className="grid gap-3 sm:grid-cols-2">
          {CHANGE_ORDER_OPTIONS.map(({ kind, icon: Icon, accent }) => (
            <button
              key={kind}
              type="button"
              onClick={() => openCreate(kind)}
              className={cn("rounded-xl border p-4 text-left transition-colors", accent)}
            >
              <Icon className="h-5 w-5 text-slate-700" aria-hidden />
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {CHANGE_ORDER_KIND_LABELS[kind]}
              </p>
              <p className="mt-1 text-xs leading-snug text-slate-600">
                {kind === "small_minor"
                  ? "Minor scope or access adjustments — same trucks and job days."
                  : "Regenerate pricing for packing, storage, or major scope changes."}
              </p>
            </button>
          ))}
        </div>

        {moveOrders.length > 0 ? (
          <ul className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
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
                      {formatMoveDate(order.createdAt.slice(0, 10))}
                      {order.aiGenerated ? " · AI" : ""}
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
        ) : (
          <p className="mt-4 text-sm text-slate-500">No change orders on this move yet.</p>
        )}
    </>
  );

  return (
    <>
      {embedded ? (
        <div className="mt-4 border-t border-slate-200 pt-4">
          <p className="text-sm font-semibold text-slate-900">Change orders</p>
          <p className="mt-0.5 text-xs text-slate-500">
            Adjust scope after the flat rate quote — small tweaks or a full requote.
          </p>
          <div className="mt-3">{content}</div>
        </div>
      ) : (
        <DetailSection
          title="Change orders"
          description="AI-assisted updates after the original quote — small tweaks or a full requote."
        >
          {content}
        </DetailSection>
      )}

      <ChangeOrderSidebar mode={panel} move={move} onClose={() => setPanel({ type: "closed" })} />
    </>
  );
}
