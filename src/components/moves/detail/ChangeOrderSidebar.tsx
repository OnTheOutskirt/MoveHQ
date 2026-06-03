"use client";

import { useChangeOrders } from "@/components/providers/ChangeOrdersProvider";
import { Button } from "@/components/ui/Button";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { formatQuote } from "@/lib/moves/format";
import {
  CHANGE_ORDER_KIND_DESCRIPTIONS,
  CHANGE_ORDER_KIND_LABELS,
  CHANGE_ORDER_STATUS_LABELS,
  defaultTitleForKind,
  kindRequiresNewTruckOrDay,
} from "@/lib/moves/change-orders";
import type { ChangeOrder, ChangeOrderKind, ChangeOrderStatus } from "@/lib/moves/change-orders-types";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

export type ChangeOrderPanelMode =
  | { type: "closed" }
  | { type: "view"; orderId: string }
  | { type: "create"; kind: ChangeOrderKind; moveId: string };

type ChangeOrderSidebarProps = {
  mode: ChangeOrderPanelMode;
  move: MoveRecord;
  onClose: () => void;
};

export function ChangeOrderSidebar({ mode, move, onClose }: ChangeOrderSidebarProps) {
  const { getOrderById, addOrder, updateOrder } = useChangeOrders();
  const open = mode.type !== "closed";

  const existing =
    mode.type === "view" ? getOrderById(mode.orderId) : undefined;

  const [draft, setDraft] = useState<Partial<ChangeOrder>>({});

  useEffect(() => {
    if (mode.type === "create") {
      setDraft({
        kind: mode.kind,
        title: defaultTitleForKind(mode.kind),
        summary: "",
        amountDelta: null,
        originalQuoteAmount: move.quoteAmount,
        revisedQuoteAmount: move.quoteAmount,
        requiresNewTruckOrDay: kindRequiresNewTruckOrDay(mode.kind),
        aiGenerated: mode.kind === "charge_order",
        createdBy: mode.kind === "charge_order" ? "AI quote system" : move.assignedRep,
        notes: "",
      });
    } else if (existing) {
      setDraft(existing);
    }
  }, [mode, existing, move.quoteAmount, move.assignedRep]);

  function saveDraft() {
    if (mode.type !== "create" || !draft.kind || !draft.title) return;
    addOrder({
      moveId: move.id,
      kind: draft.kind,
      title: draft.title.trim(),
      summary: draft.summary?.trim() ?? "",
      amountDelta: draft.amountDelta ?? null,
      originalQuoteAmount: draft.originalQuoteAmount ?? move.quoteAmount,
      revisedQuoteAmount: draft.revisedQuoteAmount ?? null,
      requiresNewTruckOrDay: draft.requiresNewTruckOrDay ?? false,
      aiGenerated: draft.aiGenerated ?? false,
      createdBy: draft.createdBy ?? move.assignedRep,
      notes: draft.notes,
      status: "draft",
    });
    onClose();
  }

  function applyStatus(status: ChangeOrderStatus) {
    if (mode.type !== "view" || !existing) return;
    updateOrder(existing.id, { status });
  }

  const title =
    mode.type === "create"
      ? `New ${CHANGE_ORDER_KIND_LABELS[mode.kind]}`
      : existing?.title ?? "Change order";

  const kind = mode.type === "create" ? mode.kind : existing?.kind;

  return (
    <DetailSidebar
      open={open}
      onClose={onClose}
      title={title}
      description={
        kind ? CHANGE_ORDER_KIND_DESCRIPTIONS[kind] : undefined
      }
      widthClassName="max-w-lg"
      footer={
        mode.type === "create" ? (
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={saveDraft}>
              Save draft
            </Button>
          </div>
        ) : existing?.status === "draft" ? (
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => applyStatus("pending_client")}
            >
              Send to client
            </Button>
            <Button type="button" size="sm" onClick={() => applyStatus("applied")}>
              Apply to quote
            </Button>
          </div>
        ) : null
      }
    >
      {mode.type === "create" && draft.kind ? (
        <CreateForm draft={draft} move={move} onChange={setDraft} />
      ) : existing ? (
        <ViewForm order={existing} onStatusChange={applyStatus} />
      ) : null}
    </DetailSidebar>
  );
}

function CreateForm({
  draft,
  move,
  onChange,
}: {
  draft: Partial<ChangeOrder>;
  move: MoveRecord;
  onChange: (d: Partial<ChangeOrder>) => void;
}) {
  const isAi = draft.kind === "charge_order";

  return (
    <div className="space-y-4">
      {isAi ? (
        <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm text-violet-950">
          <p className="flex items-center gap-1.5 font-semibold">
            <Sparkles className="h-4 w-4" />
            AI charge order
          </p>
          <p className="mt-1 text-xs text-violet-900/90">
            Suggests line items from scope changes — review before sending to the client.
          </p>
        </div>
      ) : null}

      <Field label="Title">
        <input
          value={draft.title ?? ""}
          onChange={(e) => onChange({ ...draft, title: e.target.value })}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </Field>

      <Field label="Summary">
        <textarea
          value={draft.summary ?? ""}
          onChange={(e) => onChange({ ...draft, summary: e.target.value })}
          rows={3}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder={
            draft.kind === "full_requote"
              ? "Describe packing, storage, or major scope change…"
              : "What changed and why…"
          }
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Original quote">
          <p className="text-sm font-medium tabular-nums text-slate-900">
            {formatQuote(draft.originalQuoteAmount ?? move.quoteAmount, move.quoteType)}
          </p>
        </Field>
        <Field label="Change ($)">
          <input
            type="number"
            value={draft.amountDelta ?? ""}
            onChange={(e) => {
              const delta = e.target.value ? Number(e.target.value) : null;
              const base = draft.originalQuoteAmount ?? move.quoteAmount ?? 0;
              onChange({
                ...draft,
                amountDelta: delta,
                revisedQuoteAmount: delta != null && base ? base + delta : draft.revisedQuoteAmount,
              });
            }}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm tabular-nums"
          />
        </Field>
      </div>

      {draft.kind === "full_requote" ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
          Full requote may add job days or trucks — update job days after applying.
        </p>
      ) : draft.kind === "small_inventory_labor" || draft.kind === "small_minor" ? (
        <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          Same trucks and job days — flat-rate total only.
        </p>
      ) : null}

      <Field label="Internal notes">
        <textarea
          value={draft.notes ?? ""}
          onChange={(e) => onChange({ ...draft, notes: e.target.value })}
          rows={2}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </Field>
    </div>
  );
}

function ViewForm({
  order,
  onStatusChange,
}: {
  order: ChangeOrder;
  onStatusChange: (s: ChangeOrderStatus) => void;
}) {
  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap gap-2">
        <BadgePill>{CHANGE_ORDER_KIND_LABELS[order.kind]}</BadgePill>
        <BadgePill variant={statusVariant(order.status)}>
          {CHANGE_ORDER_STATUS_LABELS[order.status]}
        </BadgePill>
        {order.aiGenerated ? <BadgePill variant="violet">AI</BadgePill> : null}
        {order.requiresNewTruckOrDay ? (
          <BadgePill variant="amber">New truck / day</BadgePill>
        ) : (
          <BadgePill variant="muted">Same trucks & days</BadgePill>
        )}
      </div>

      <p className="text-slate-700">{order.summary}</p>

      <dl className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
        <div>
          <dt className="text-[10px] font-semibold uppercase text-slate-500">Original</dt>
          <dd className="font-medium tabular-nums">
            {order.originalQuoteAmount != null
              ? `$${order.originalQuoteAmount.toLocaleString()}`
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase text-slate-500">Revised</dt>
          <dd className="font-medium tabular-nums">
            {order.revisedQuoteAmount != null
              ? `$${order.revisedQuoteAmount.toLocaleString()}`
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase text-slate-500">Delta</dt>
          <dd
            className={cn(
              "font-medium tabular-nums",
              (order.amountDelta ?? 0) >= 0 ? "text-emerald-700" : "text-red-700",
            )}
          >
            {order.amountDelta != null
              ? `${order.amountDelta >= 0 ? "+" : ""}$${order.amountDelta.toLocaleString()}`
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase text-slate-500">Created by</dt>
          <dd>{order.createdBy}</dd>
        </div>
      </dl>

      {order.notes ? (
        <div>
          <p className="text-[10px] font-semibold uppercase text-slate-500">Notes</p>
          <p className="mt-1 text-slate-700">{order.notes}</p>
        </div>
      ) : null}

      {order.status === "draft" ? (
        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          <Button type="button" size="sm" variant="secondary" onClick={() => onStatusChange("void")}>
            Void
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function BadgePill({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "violet" | "amber" | "muted" | "success" | "warning";
}) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        variant === "default" && "bg-slate-100 text-slate-700",
        variant === "violet" && "bg-violet-100 text-violet-800",
        variant === "amber" && "bg-amber-100 text-amber-900",
        variant === "muted" && "bg-slate-50 text-slate-500 ring-1 ring-slate-200",
        variant === "success" && "bg-emerald-100 text-emerald-800",
        variant === "warning" && "bg-amber-100 text-amber-900",
      )}
    >
      {children}
    </span>
  );
}

function statusVariant(status: ChangeOrderStatus): "default" | "warning" | "success" {
  if (status === "applied" || status === "approved") return "success";
  if (status === "pending_client" || status === "draft") return "warning";
  return "default";
}
