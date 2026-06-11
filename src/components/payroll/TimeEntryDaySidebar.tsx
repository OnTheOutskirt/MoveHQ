"use client";

import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { Badge } from "@/components/ui/Badge";
import {
  categoryKeysForEntry,
  isOfficeClockEntry,
  PAYROLL_CATEGORY_LABELS,
  timeEntrySourceLabel,
} from "@/lib/payroll/category-labels";
import {
  billableHoursFromCategories,
  dailyHoursTotal,
  sumCategories,
} from "@/lib/payroll/time-entry-utils";
import type { TimeCategoryHours, TimeEntry, TimeEntryDaySelection } from "@/lib/payroll/types";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type TimeEntryDaySidebarProps = {
  selection: TimeEntryDaySelection | null;
  onClose: () => void;
  onUpdateEntry: (id: string, patch: Partial<TimeEntry>) => void;
};

export function TimeEntryDaySidebar({
  selection,
  onClose,
  onUpdateEntry,
}: TimeEntryDaySidebarProps) {
  const open = selection != null;
  const primary = selection?.entries[0];
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setActiveId(selection?.entries[0]?.id ?? null);
  }, [selection]);

  const activeEntry = selection?.entries.find((e) => e.id === activeId) ?? primary;

  return (
    <DetailSidebar
      open={open}
      onClose={onClose}
      title={selection ? `${selection.personName}` : "Time entry"}
      description={
        selection
          ? `${formatDayLabel(selection.date)} · ${dailyHoursTotal(selection.entries).toFixed(2)} hrs billable`
          : undefined
      }
      widthClassName="max-w-md"
    >
      {selection && activeEntry ? (
        <div className="space-y-4">
          {selection.entries.length > 1 ? (
            <div className="flex flex-wrap gap-1.5">
              {selection.entries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setActiveId(entry.id)}
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

          <EntryEditor
            key={activeEntry.id}
            entry={activeEntry}
            onUpdate={(patch) => onUpdateEntry(activeEntry.id, patch)}
          />

          {selection.entries.length > 1 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">Day total</p>
              <CategorySummary
                categories={sumCategories(selection.entries)}
                workerType={selection.entries[0]?.workerType ?? "crew"}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </DetailSidebar>
  );
}

function entryTabLabel(entry: TimeEntry): string {
  if (isOfficeClockEntry(entry)) return "Office clock";
  return entry.jobRef ?? "Office";
}

function EntryEditor({
  entry,
  onUpdate,
}: {
  entry: TimeEntry;
  onUpdate: (patch: Partial<TimeEntry>) => void;
}) {
  const [categories, setCategories] = useState(entry.categories);
  const [notes, setNotes] = useState(entry.notes ?? "");
  const categoryKeys = categoryKeysForEntry(entry);
  const isOffice = entry.workerType === "office";
  const fromClock = isOfficeClockEntry(entry);

  useEffect(() => {
    setCategories(entry.categories);
    setNotes(entry.notes ?? "");
  }, [entry]);

  function saveCategories(next: TimeCategoryHours) {
    setCategories(next);
    onUpdate({
      categories: next,
      hours: billableHoursFromCategories(next),
    });
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
        <div>
          <dt className="text-[10px] font-semibold uppercase text-slate-500">Status</dt>
          <dd>
            <button
              type="button"
              onClick={() =>
                onUpdate({ status: entry.status === "approved" ? "pending" : "approved" })
              }
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                entry.status === "approved"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-900",
              )}
            >
              {entry.status}
            </button>
          </dd>
        </div>
        {entry.clockInAt ? (
          <>
            <div>
              <dt className="text-[10px] font-semibold uppercase text-slate-500">Clock in</dt>
              <dd className="tabular-nums text-slate-800">{formatClockTimestamp(entry.clockInAt)}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase text-slate-500">Clock out</dt>
              <dd className="tabular-nums text-slate-800">
                {entry.clockOutAt ? formatClockTimestamp(entry.clockOutAt) : "—"}
              </dd>
            </div>
          </>
        ) : null}
      </dl>

      <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Time by category
        </p>
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
                  saveCategories({
                    ...categories,
                    [key]: Number.isFinite(value) ? value : 0,
                  });
                }}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm tabular-nums"
              />
            </label>
          ))}
        </div>
        <div className="mt-3 border-t border-slate-200 pt-3">
          <p className="text-xs text-slate-600">
            Billable total{" "}
            <span className="font-semibold tabular-nums text-slate-900">
              {billableHoursFromCategories(categories).toFixed(2)} hrs
            </span>
            <span className="text-slate-400">
              {isOffice ? " (office time)" : " (move + drive + extra)"}
            </span>
          </p>
          <CategorySummary categories={categories} workerType={entry.workerType} className="mt-2" />
        </div>
      </div>

      <label className="block">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Notes
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => onUpdate({ notes: notes.trim() || undefined })}
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
          placeholder="Adjustments, missing clock-outs…"
        />
      </label>
    </>
  );
}

function CategorySummary({
  categories,
  workerType,
  className,
}: {
  categories: TimeCategoryHours;
  workerType: TimeEntry["workerType"];
  className?: string;
}) {
  const keys = workerType === "office" ? (["office", "break"] as const) : (["move", "drive", "extra", "break"] as const);

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {keys.map((key) => {
        const value = categories[key];
        if (value <= 0) return null;
        return (
          <Badge key={key} variant="default">
            {PAYROLL_CATEGORY_LABELS[key]} {value.toFixed(2)}h
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
