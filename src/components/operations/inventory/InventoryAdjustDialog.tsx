"use client";

import { Button } from "@/components/ui/Button";
import type { InventoryAdjustmentKind, InventoryStockLine } from "@/lib/operations/inventory-types";
import { formatInventoryQuantity } from "@/lib/operations/inventory";
import { cn } from "@/lib/utils";
import { PackageMinus, PackagePlus, RefreshCw, X } from "lucide-react";
import { useEffect, useState } from "react";

type InventoryAdjustDialogProps = {
  line: InventoryStockLine | null;
  initialKind: InventoryAdjustmentKind;
  open: boolean;
  onClose: () => void;
  onSave: (input: { kind: InventoryAdjustmentKind; amount: number; note: string }) => void;
};

const KIND_META: Record<
  InventoryAdjustmentKind,
  { label: string; description: string; icon: typeof PackagePlus; action: string }
> = {
  receive: {
    label: "Received",
    description: "Shipment arrived or you restocked from the supplier.",
    icon: PackagePlus,
    action: "Add to stock",
  },
  use: {
    label: "Used",
    description: "Materials went out on jobs or were consumed in the shop.",
    icon: PackageMinus,
    action: "Remove from stock",
  },
  count: {
    label: "Set count",
    description: "Physical count — enter exactly what you have on hand right now.",
    icon: RefreshCw,
    action: "Save count",
  },
};

export function InventoryAdjustDialog({
  line,
  initialKind,
  open,
  onClose,
  onSave,
}: InventoryAdjustDialogProps) {
  const [kind, setKind] = useState<InventoryAdjustmentKind>(initialKind);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setKind(initialKind);
    setAmount(initialKind === "count" && line ? String(line.quantityOnHand) : "");
    setNote("");
  }, [open, initialKind, line]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !line) return null;

  const meta = KIND_META[kind];
  const parsed = Number(amount);
  const valid =
    kind === "count"
      ? Number.isFinite(parsed) && parsed >= 0
      : Number.isFinite(parsed) && parsed > 0;

  const preview =
    kind === "count"
      ? valid
        ? `New on hand: ${formatInventoryQuantity(parsed, line.unit)}`
        : null
      : valid
        ? kind === "receive"
          ? `New on hand: ${formatInventoryQuantity(line.quantityOnHand + parsed, line.unit)}`
          : `New on hand: ${formatInventoryQuantity(Math.max(0, line.quantityOnHand - parsed), line.unit)}`
        : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="inventory-adjust-title"
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <p id="inventory-adjust-title" className="text-sm font-semibold text-slate-900">
              {line.label}
            </p>
            <p className="text-xs text-slate-500">
              Currently {formatInventoryQuantity(line.quantityOnHand, line.unit)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-1 border-b border-slate-100 px-3 py-2">
          {(Object.keys(KIND_META) as InventoryAdjustmentKind[]).map((k) => {
            const m = KIND_META[k];
            const Icon = m.icon;
            return (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setKind(k);
                  setAmount(k === "count" ? String(line.quantityOnHand) : "");
                }}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-2 text-[11px] font-semibold transition-colors",
                  kind === k
                    ? "bg-brand-50 text-brand-800"
                    : "text-slate-500 hover:bg-slate-50",
                )}
              >
                <Icon className="h-4 w-4" />
                {m.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-4 px-4 py-4">
          <p className="text-xs leading-relaxed text-slate-500">{meta.description}</p>

          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {kind === "count" ? "How many do you have?" : "How many?"}
            </span>
            <input
              type="number"
              min={0}
              step={1}
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-lg font-semibold tabular-nums text-slate-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <span className="mt-1 block text-xs text-slate-400">{line.unit}</span>
          </label>

          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Note (optional)
            </span>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={kind === "receive" ? "e.g. Uline delivery" : "e.g. Saturday jobs"}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </label>

          {preview ? (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
              {preview}
            </p>
          ) : null}
        </div>

        <div className="flex gap-2 border-t border-slate-100 px-4 py-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1"
            disabled={!valid}
            onClick={() => {
              onSave({ kind, amount: parsed, note });
              onClose();
            }}
          >
            {meta.action}
          </Button>
        </div>
      </div>
    </div>
  );
}
