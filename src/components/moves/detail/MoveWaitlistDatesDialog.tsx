"use client";

import { Button } from "@/components/ui/Button";
import {
  defaultWaitlistPickerDates,
  MAX_WAITLIST_DATES,
  validateWaitlistDates,
} from "@/lib/calendar/placement";
import type { MoveRecord } from "@/lib/moves/types";
import { Plus, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

type MoveWaitlistDatesDialogProps = {
  open: boolean;
  move: MoveRecord;
  existingDates?: string[];
  onClose: () => void;
  onConfirm: (dates: string[]) => void;
};

function createRowId() {
  return `wl-${Math.random().toString(36).slice(2, 9)}`;
}

export function MoveWaitlistDatesDialog({
  open,
  move,
  existingDates = [],
  onClose,
  onConfirm,
}: MoveWaitlistDatesDialogProps) {
  const titleId = useId();
  const [rows, setRows] = useState<{ id: string; date: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const existingKey = existingDates.join(",");

  useEffect(() => {
    if (!open) return;
    const initial = defaultWaitlistPickerDates(move, existingDates);
    setRows(initial.map((date) => ({ id: createRowId(), date })));
    setError(null);
  }, [open, move, existingKey, existingDates]);

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

  function updateRow(id: string, date: string) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, date } : row)));
  }

  function removeRow(id: string) {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((row) => row.id !== id)));
  }

  function addRow() {
    if (rows.length >= MAX_WAITLIST_DATES) return;
    setRows((prev) => [...prev, { id: createRowId(), date: "" }]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dates = rows.map((row) => row.date);
    const validationError = validateWaitlistDates(dates);
    if (validationError) {
      setError(validationError);
      return;
    }
    onConfirm(dates.map((d) => d.trim()).filter(Boolean));
    onClose();
  }

  if (!open) return null;

  const isEditing = existingDates.length > 0;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <form
        onSubmit={handleSubmit}
        className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
      >
        <div className="overflow-y-auto p-6">
          <h2 id={titleId} className="text-lg font-semibold text-slate-900">
            Waitlist dates
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Choose up to {MAX_WAITLIST_DATES} dates for this move. Defaults to job day dates — adjust
            or add more as needed.
          </p>

          <div className="mt-4 space-y-2">
            {rows.map((row, index) => (
              <div key={row.id} className="flex items-center gap-2">
                <label className="sr-only" htmlFor={`${row.id}-date`}>
                  Waitlist date {index + 1}
                </label>
                <input
                  id={`${row.id}-date`}
                  type="date"
                  required
                  value={row.date}
                  onChange={(e) => updateRow(row.id, e.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length <= 1}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:pointer-events-none disabled:opacity-40"
                  aria-label={`Remove date ${index + 1}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={addRow}
            disabled={rows.length >= MAX_WAITLIST_DATES}
          >
            <Plus className="h-3.5 w-3.5" />
            Add date
          </Button>

          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{isEditing ? "Save dates" : "Add to waitlist"}</Button>
        </div>
      </form>
    </div>
  );
}
