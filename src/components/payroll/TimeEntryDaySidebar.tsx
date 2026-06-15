"use client";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  categoryKeysForEntry,
  isOfficeClockEntry,
  PAYROLL_CATEGORY_LABELS,
  timeEntrySourceLabel,
} from "@/lib/payroll/category-labels";
import {
  dailyHoursTotal,
  sumCategories,
  totalHoursFromCategories,
} from "@/lib/payroll/time-entry-utils";
import type { TimeCategoryHours, TimeEntry, TimeEntryDaySelection } from "@/lib/payroll/types";
import { cn } from "@/lib/utils";
import { Check, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

type TimeEntryDaySidebarProps = {
  selection: TimeEntryDaySelection | null;
  onClose: () => void;
  onUpdateEntry: (id: string, patch: Partial<TimeEntry>) => void;
  onDeleteEntry?: (id: string) => void;
  canApprove?: boolean;
};

export function TimeEntryDaySidebar({
  selection,
  onClose,
  onUpdateEntry,
  onDeleteEntry,
  canApprove = false,
}: TimeEntryDaySidebarProps) {
  const open = selection != null;
  const primary = selection?.entries[0];
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    setActiveId(selection?.entries[0]?.id ?? null);
    setEditing(false);
    setDeleteConfirmOpen(false);
  }, [selection]);

  const activeEntry = selection?.entries.find((e) => e.id === activeId) ?? primary;
  const dayTotal = selection ? dailyHoursTotal(selection.entries) : 0;

  return (
    <DetailSidebar
      open={open}
      onClose={onClose}
      title={selection ? `${selection.personName}` : "Time entry"}
      description={
        selection
          ? `${formatDayLabel(selection.date)} · ${dayTotal.toFixed(2)} hrs total`
          : undefined
      }
      widthClassName="max-w-md"
    >
      {selection && activeEntry ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Total time
            </p>
            <p className="mt-1 text-4xl font-bold tabular-nums tracking-tight text-slate-900">
              {dayTotal.toFixed(2)}
              <span className="ml-1 text-lg font-semibold text-slate-500">hrs</span>
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
                  {entryTabLabel(entry)}
                </button>
              ))}
            </div>
          ) : null}

          <EntryPanel
            key={activeEntry.id}
            entry={activeEntry}
            editing={editing}
            canApprove={canApprove}
            onStartEdit={() => setEditing(true)}
            onCancelEdit={() => setEditing(false)}
            onUpdate={(patch) => onUpdateEntry(activeEntry.id, patch)}
            onDelete={
              onDeleteEntry && !activeEntry.isLiveClock
                ? () => setDeleteConfirmOpen(true)
                : undefined
            }
          />

          {selection.entries.length > 1 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">Day breakdown</p>
              <CategorySummary
                categories={sumCategories(selection.entries)}
                workerType={selection.entries[0]?.workerType ?? "crew"}
                large
              />
            </div>
          ) : null}
        </div>
      ) : null}

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => {
          if (activeEntry && onDeleteEntry) onDeleteEntry(activeEntry.id);
        }}
        title="Delete time entry?"
        description={
          selection && activeEntry
            ? `Remove ${activeEntry.jobRef ?? "this entry"} for ${selection.personName} on ${formatDayLabel(selection.date)}? This cannot be undone.`
            : "Remove this time entry? This cannot be undone."
        }
        confirmLabel="Delete"
        variant="danger"
        zIndexClassName="z-[70]"
      />
    </DetailSidebar>
  );
}

function entryTabLabel(entry: TimeEntry): string {
  if (isOfficeClockEntry(entry)) return "Office clock";
  return entry.jobRef ?? "Office";
}

function EntryPanel({
  entry,
  editing,
  canApprove,
  onStartEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
}: {
  entry: TimeEntry;
  editing: boolean;
  canApprove: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (patch: Partial<TimeEntry>) => void;
  onDelete?: () => void;
}) {
  const [categories, setCategories] = useState(entry.categories);
  const [editReason, setEditReason] = useState("");
  const categoryKeys = categoryKeysForEntry(entry);
  const isOffice = entry.workerType === "office";
  const fromClock = isOfficeClockEntry(entry);
  const totalHours = totalHoursFromCategories(categories);
  const hasChanges = !categoriesEqual(categories, entry.categories);
  const canSaveEdit = editReason.trim().length > 0 && hasChanges;

  useEffect(() => {
    setCategories(entry.categories);
    setEditReason("");
  }, [entry]);

  function handleCancelEdit() {
    setCategories(entry.categories);
    setEditReason("");
    onCancelEdit();
  }

  function handleSaveEdit() {
    if (!canSaveEdit) return;
    onUpdate({
      categories,
      hours: totalHoursFromCategories(categories),
      notes: appendEditNote(entry.notes, editReason),
      status: "pending",
    });
    setEditReason("");
    onCancelEdit();
  }

  return (
    <>
      {entry.isLiveClock ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-2.5 text-xs text-emerald-900">
          <p className="font-semibold">Still on the clock</p>
          <p className="mt-0.5 text-emerald-800">
            Hours update until they clock out from the header time clock.
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <StatusBadge status={entry.status} />
        <div className="flex flex-wrap gap-2">
          {canApprove && entry.status === "pending" && !editing ? (
            <Button
              type="button"
              size="sm"
              onClick={() => onUpdate({ status: "approved" })}
            >
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
          {canApprove && onDelete ? (
            <Button type="button" size="sm" variant="secondary" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          ) : null}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-[10px] font-semibold uppercase text-slate-500">
            {isOffice ? "Shift" : "Job"}
          </dt>
          <dd className="font-medium text-slate-900">
            {fromClock ? "Office time clock" : (entry.jobRef ?? "Office / non-job")}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase text-slate-500">Role</dt>
          <dd>{entry.roleLabel}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase text-slate-500">Source</dt>
          <dd className="text-slate-700">{timeEntrySourceLabel(entry.source)}</dd>
        </div>
        {entry.clockInAt ? (
          <>
            <div>
              <dt className="text-[10px] font-semibold uppercase text-slate-500">Clock in</dt>
              <dd className="text-base tabular-nums font-medium text-slate-900">
                {formatClockTimestamp(entry.clockInAt)}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase text-slate-500">Clock out</dt>
              <dd className="text-base tabular-nums font-medium text-slate-900">
                {entry.clockOutAt ? formatClockTimestamp(entry.clockOutAt) : "—"}
              </dd>
            </div>
          </>
        ) : null}
      </dl>

      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Time by category
        </p>

        {editing ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {categoryKeys.map((key) => (
              <label key={key} className="block">
                <span className="text-xs font-medium text-slate-600">
                  {PAYROLL_CATEGORY_LABELS[key]}
                </span>
                <input
                  type="number"
                  min={0}
                  step={0.25}
                  value={categories[key]}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setCategories({
                      ...categories,
                      [key]: Number.isFinite(value) ? value : 0,
                    });
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm tabular-nums"
                />
              </label>
            ))}
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {categoryKeys.map((key) => {
              const value = categories[key];
              if (value <= 0) return null;
              return (
                <div key={key} className="flex items-baseline justify-between gap-3">
                  <span className="text-sm text-slate-600">{PAYROLL_CATEGORY_LABELS[key]}</span>
                  <span className="text-xl font-semibold tabular-nums text-slate-900">
                    {value.toFixed(2)}
                    <span className="ml-0.5 text-sm font-medium text-slate-500">hrs</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-3 border-t border-slate-200 pt-3">
          <p className="text-xs text-slate-600">
            Total time{" "}
            <span className="text-lg font-bold tabular-nums text-slate-900">
              {totalHours.toFixed(2)} hrs
            </span>
            <span className="text-slate-400"> (excl. breaks)</span>
          </p>
          {!editing ? (
            <CategorySummary categories={categories} workerType={entry.workerType} className="mt-2" />
          ) : null}
        </div>
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
              placeholder="Why are these hours being changed?"
            />
          </label>
          {!hasChanges ? (
            <p className="text-xs text-amber-800">Change at least one hour value to save.</p>
          ) : !editReason.trim() ? (
            <p className="text-xs text-amber-800">A reason is required before saving.</p>
          ) : (
            <p className="text-xs text-amber-800">
              Saving resets this entry to pending for re-approval.
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

function categoriesEqual(a: TimeCategoryHours, b: TimeCategoryHours): boolean {
  return (
    a.move === b.move &&
    a.drive === b.drive &&
    a.extra === b.extra &&
    a.office === b.office &&
    a.break === b.break
  );
}

function appendEditNote(existing: string | undefined, reason: string): string {
  const line = `Edit: ${reason.trim()}`;
  return existing ? `${existing}\n\n${line}` : line;
}

function StatusBadge({ status }: { status: TimeEntry["status"] }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase",
        status === "approved"
          ? "bg-emerald-100 text-emerald-800"
          : "bg-amber-100 text-amber-900",
      )}
    >
      {status}
    </span>
  );
}

function CategorySummary({
  categories,
  workerType,
  className,
  large,
}: {
  categories: TimeCategoryHours;
  workerType: TimeEntry["workerType"];
  className?: string;
  large?: boolean;
}) {
  const keys =
    workerType === "office"
      ? (["office", "break"] as const)
      : (["move", "drive", "extra", "break"] as const);

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {keys.map((key) => {
        const value = categories[key];
        if (value <= 0) return null;
        return (
          <Badge key={key} variant="default">
            {PAYROLL_CATEGORY_LABELS[key]}{" "}
            {large ? (
              <span className="font-semibold">{value.toFixed(2)}h</span>
            ) : (
              `${value.toFixed(2)}h`
            )}
          </Badge>
        );
      })}
    </div>
  );
}

function formatDayLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function formatClockTimestamp(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}
