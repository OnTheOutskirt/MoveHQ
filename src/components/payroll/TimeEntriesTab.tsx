"use client";

import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import type { TimeEntry, WorkerType } from "@/lib/payroll/types";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

type TimeEntriesTabProps = {
  entries: TimeEntry[];
  onUpdateEntry: (id: string, patch: Partial<TimeEntry>) => void;
};

type WorkerFilter = "all" | WorkerType;

export function TimeEntriesTab({ entries, onUpdateEntry }: TimeEntriesTabProps) {
  const [workerFilter, setWorkerFilter] = useState<WorkerFilter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (workerFilter === "all") return entries;
    return entries.filter((e) => e.workerType === workerFilter);
  }, [entries, workerFilter]);

  const columns = useMemo<Column<TimeEntry>[]>(
    () => [
      {
        key: "person",
        header: "Person",
        cell: (e) => (
          <div>
            <p className="font-medium text-slate-900">{e.personName}</p>
            <p className="text-xs text-slate-500">{e.roleLabel}</p>
          </div>
        ),
      },
      {
        key: "type",
        header: "Type",
        cell: (e) => (
          <Badge variant={e.workerType === "crew" ? "brand" : "default"}>
            {e.workerType === "crew" ? "Crew" : "Office"}
          </Badge>
        ),
      },
      {
        key: "date",
        header: "Date",
        cell: (e) => e.date,
      },
      {
        key: "job",
        header: "Job",
        cell: (e) => e.jobRef ?? "—",
      },
      {
        key: "hours",
        header: "Hours",
        cell: (e) => {
          if (editingId === e.id) {
            return (
              <input
                type="number"
                step="0.25"
                defaultValue={e.hours}
                className="w-20 rounded border border-slate-200 px-2 py-1 text-sm"
                onBlur={(ev) => {
                  const hours = parseFloat(ev.target.value);
                  if (!Number.isNaN(hours)) onUpdateEntry(e.id, { hours });
                  setEditingId(null);
                }}
              />
            );
          }
          return (
            <button
              type="button"
              className="font-medium tabular-nums text-slate-900 hover:text-brand-700"
              onClick={() => setEditingId(e.id)}
              title="Click to edit hours"
            >
              {e.hours.toFixed(2)}
            </button>
          );
        },
      },
      {
        key: "source",
        header: "Source",
        cell: (e) => (
          <span className="text-xs text-slate-600">
            {e.source === "crew_app"
              ? "Crew app"
              : e.source === "office_manual"
                ? "Office"
                : "Manager edit"}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (e) => (
          <button
            type="button"
            onClick={() =>
              onUpdateEntry(e.id, {
                status: e.status === "approved" ? "pending" : "approved",
              })
            }
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
              e.status === "approved"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-900",
            )}
          >
            {e.status}
          </button>
        ),
      },
    ],
    [editingId, onUpdateEntry],
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Crew hours flow from the crew app clock on job days. Office and hourly managers can log
        time here (or via a future office clock). Approve entries before payroll export.
      </p>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "Everyone"],
            ["crew", "Crew only"],
            ["office", "Office / managers"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setWorkerFilter(id)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm font-medium",
              workerFilter === id
                ? "border-brand-600 bg-brand-50 text-brand-800"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage="No time entries for this filter."
        getRowKey={(e) => e.id}
      />
    </div>
  );
}
