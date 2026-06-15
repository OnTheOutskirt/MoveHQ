"use client";

import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { Button } from "@/components/ui/Button";
import { dailyTipsTotal } from "@/lib/payroll/time-entry-utils";
import type { TipEntry, TipEntryDaySelection } from "@/lib/payroll/types";
import { cn } from "@/lib/utils";
import { Check, Pencil } from "lucide-react";
import { useEffect, useState } from "react";

type TipEntryDaySidebarProps = {
  selection: TipEntryDaySelection | null;
  onClose: () => void;
  onUpdateTip: (id: string, patch: Partial<TipEntry>) => void;
  canApprove?: boolean;
};

export function TipEntryDaySidebar({
  selection,
  onClose,
  onUpdateTip,
  canApprove = false,
}: TipEntryDaySidebarProps) {
  const open = selection != null;
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const dayTotal = selection ? dailyTipsTotal(selection.entries) : 0;
  const activeEntry =
    selection?.entries.find((e) => e.id === activeId) ?? selection?.entries[0];

  useEffect(() => {
    setActiveId(selection?.entries[0]?.id ?? null);
    setEditing(false);
  }, [selection]);

  return (
    <DetailSidebar
      open={open}
      onClose={onClose}
      title={selection ? `${selection.personName}` : "Tips"}
      description={
        selection
          ? `${formatDayLabel(selection.date)} · ${formatMoney(dayTotal)} total`
          : undefined
      }
      widthClassName="max-w-md"
    >
      {selection && activeEntry ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-violet-200 bg-violet-50/60 px-4 py-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-700">
              Tips this day
            </p>
            <p className="mt-1 text-4xl font-bold tabular-nums tracking-tight text-violet-950">
              {formatMoney(dayTotal)}
            </p>
          </div>

          {selection.entries.length > 1 ? (
            <div className="flex flex-wrap gap-1.5">
              {selection.entries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => {
                    setActiveId(entry.id);
                    setEditing(false);
                  }}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium",
                    entry.id === activeEntry.id
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                  )}
                >
                  {entry.jobRef}
                </button>
              ))}
            </div>
          ) : null}

          <TipEntryPanel
            key={activeEntry.id}
            entry={activeEntry}
            editing={editing}
            canApprove={canApprove}
            onStartEdit={() => setEditing(true)}
            onCancelEdit={() => setEditing(false)}
            onUpdate={(patch) => onUpdateTip(activeEntry.id, patch)}
          />
        </div>
      ) : null}
    </DetailSidebar>
  );
}

function TipEntryPanel({
  entry,
  editing,
  canApprove,
  onStartEdit,
  onCancelEdit,
  onUpdate,
}: {
  entry: TipEntry;
  editing: boolean;
  canApprove: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (patch: Partial<TipEntry>) => void;
}) {
  const [amount, setAmount] = useState(entry.amount);
  const [editReason, setEditReason] = useState("");
  const hasChanges = amount !== entry.amount;
  const canSaveEdit = editReason.trim().length > 0 && hasChanges;

  useEffect(() => {
    setAmount(entry.amount);
    setEditReason("");
  }, [entry]);

  function handleCancelEdit() {
    setAmount(entry.amount);
    setEditReason("");
    onCancelEdit();
  }

  function handleSaveEdit() {
    if (!canSaveEdit) return;
    onUpdate({
      amount,
      source: "manager_edit",
      notes: appendTipEditNote(entry.notes, editReason),
      status: "pending",
    });
    setEditReason("");
    onCancelEdit();
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase",
            entry.status === "approved"
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-900",
          )}
        >
          {entry.status}
        </span>
        <div className="flex flex-wrap gap-2">
          {canApprove && entry.status === "pending" && !editing ? (
            <Button type="button" size="sm" onClick={() => onUpdate({ status: "approved" })}>
              <Check className="h-4 w-4" />
              Approve
            </Button>
          ) : null}
          {canApprove && !editing ? (
            <Button type="button" size="sm" variant="secondary" onClick={onStartEdit}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          ) : null}
          {editing ? (
            <>
              <Button type="button" size="sm" variant="secondary" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={handleSaveEdit} disabled={!canSaveEdit}>
                Save changes
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-[10px] font-semibold uppercase text-slate-500">Job</dt>
          <dd className="font-medium text-slate-900">{entry.jobRef}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase text-slate-500">Source</dt>
          <dd className="capitalize text-slate-700">{entry.source.replace("_", " ")}</dd>
        </div>
      </dl>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Tip amount</p>
        {editing ? (
          <label className="mt-2 block">
            <span className="sr-only">Tip amount</span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={amount}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setAmount(Number.isFinite(value) ? value : 0);
                }}
                className="mt-1 w-full rounded-lg border border-slate-200 py-2 pl-7 pr-3 text-lg tabular-nums"
              />
            </div>
          </label>
        ) : (
          <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">
            {formatMoney(entry.amount)}
          </p>
        )}
      </div>

      {editing ? (
        <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-900">
              Reason for edit <span className="text-red-600">*</span>
            </span>
            <textarea
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              rows={2}
              required
              className="mt-1 w-full rounded-lg border border-amber-200 bg-white px-2.5 py-1.5 text-sm"
              placeholder="Why is this tip amount being changed?"
            />
          </label>
          {!hasChanges ? (
            <p className="text-xs text-amber-800">Change the tip amount to save.</p>
          ) : !editReason.trim() ? (
            <p className="text-xs text-amber-800">A reason is required before saving.</p>
          ) : (
            <p className="text-xs text-amber-800">
              Saving resets this tip to pending for re-approval.
            </p>
          )}
        </div>
      ) : entry.notes ? (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Notes</p>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-snug text-slate-700">{entry.notes}</p>
        </div>
      ) : null}
    </>
  );
}

function appendTipEditNote(existing: string | undefined, reason: string): string {
  const line = `Edit: ${reason.trim()}`;
  return existing ? `${existing}\n\n${line}` : line;
}

function formatDayLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function formatMoney(amount: number): string {
  return `$${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
}
