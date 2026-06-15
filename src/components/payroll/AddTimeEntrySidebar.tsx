"use client";

import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { Button } from "@/components/ui/Button";
import { PAYROLL_CATEGORY_LABELS } from "@/lib/payroll/category-labels";
import {
  createManualTimeEntry,
  PAYROLL_DEMO_PEOPLE,
} from "@/lib/payroll/mock-time-entries";
import { totalHoursFromCategories, normalizeCategories } from "@/lib/payroll/time-entry-utils";
import type { TimeCategoryHours, TimeEntry } from "@/lib/payroll/types";
import { useEffect, useMemo, useState } from "react";

type AddTimeEntrySidebarProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (entry: TimeEntry) => void;
  defaultDate?: string;
};

const EMPTY_CREW_CATEGORIES: TimeCategoryHours = {
  move: 0,
  drive: 0,
  extra: 0,
  office: 0,
  break: 0,
};

export function AddTimeEntrySidebar({
  open,
  onClose,
  onAdd,
  defaultDate,
}: AddTimeEntrySidebarProps) {
  const [personId, setPersonId] = useState(PAYROLL_DEMO_PEOPLE[0]?.personId ?? "");
  const [date, setDate] = useState(defaultDate ?? "");
  const [jobRef, setJobRef] = useState("");
  const [notes, setNotes] = useState("");
  const [categories, setCategories] = useState<TimeCategoryHours>(EMPTY_CREW_CATEGORIES);

  const person = useMemo(
    () => PAYROLL_DEMO_PEOPLE.find((p) => p.personId === personId),
    [personId],
  );

  const categoryKeys = useMemo(() => {
    if (person?.workerType === "office") {
      return ["office", "break"] as const;
    }
    return ["move", "drive", "extra", "break"] as const;
  }, [person?.workerType]);

  useEffect(() => {
    if (!open) return;
    setDate(defaultDate ?? new Date().toISOString().slice(0, 10));
    setJobRef("");
    setNotes("");
    setCategories(EMPTY_CREW_CATEGORIES);
  }, [open, defaultDate]);

  useEffect(() => {
    if (!person) return;
    if (person.workerType === "office") {
      setCategories(normalizeCategories({ move: 0, drive: 0, extra: 0, office: 8, break: 0 }));
    } else {
      setCategories(EMPTY_CREW_CATEGORIES);
    }
  }, [personId, person]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!person || !date) return;
    const total = totalHoursFromCategories(categories);
    if (total <= 0) return;

    onAdd(
      createManualTimeEntry({
        person,
        date,
        jobRef: person.workerType === "crew" ? jobRef.trim() || "Manual entry" : null,
        categories,
        notes: notes.trim() || undefined,
      }),
    );
    onClose();
  }

  return (
    <DetailSidebar
      open={open}
      onClose={onClose}
      title="Add time"
      description="Create a manual time entry — saved as pending until approved."
      widthClassName="max-w-md"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500">
            Team member
          </label>
          <select
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            required
          >
            {PAYROLL_DEMO_PEOPLE.map((p) => (
              <option key={p.personId} value={p.personId}>
                {p.personName} · {p.roleLabel}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            required
          />
        </div>

        {person?.workerType === "crew" ? (
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500">
              Job reference
            </label>
            <input
              type="text"
              value={jobRef}
              onChange={(e) => setJobRef(e.target.value)}
              placeholder="MV-1234 or job name"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        ) : null}

        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Hours by category
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
                    setCategories((prev) =>
                      normalizeCategories({
                        ...prev,
                        [key]: Number.isFinite(value) ? value : 0,
                      }),
                    );
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm tabular-nums"
                />
              </label>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-600">
            Total time{" "}
            <span className="font-semibold tabular-nums text-slate-900">
              {totalHoursFromCategories(categories).toFixed(2)} hrs
            </span>
            <span className="text-slate-400"> (excl. breaks)</span>
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Optional"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={totalHoursFromCategories(categories) <= 0}>
            Add entry
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </DetailSidebar>
  );
}
