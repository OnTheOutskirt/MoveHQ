"use client";

import { Button } from "@/components/ui/Button";
import { useCalendarSettings } from "@/components/providers/CalendarSettingsProvider";
import type { ClosedDayEntry } from "@/lib/calendar/settings/types";
import { Trash2 } from "lucide-react";
import { useState } from "react";

function formatClosedDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y!, m! - 1, d).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DaysOffTab() {
  const { settingsClosedDays, addClosedDay, updateClosedDay, removeClosedDay } =
    useCalendarSettings();

  const [newDate, setNewDate] = useState("");
  const [newLabel, setNewLabel] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newDate || !newLabel.trim()) return;
    addClosedDay({
      date: newDate,
      label: newLabel.trim(),
      source: "custom",
    });
    setNewDate("");
    setNewLabel("");
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">Add custom day off</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-medium text-slate-600">
            Date
            <input
              type="date"
              required
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            Label
            <input
              type="text"
              required
              placeholder="Company meeting"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            />
          </label>
        </div>
        <Button type="submit" size="sm">
          Add day off
        </Button>
      </form>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-900">
          Scheduled closures ({settingsClosedDays.length})
        </p>
        <ul className="space-y-2">
          {settingsClosedDays.map((entry) => (
            <ClosedDayRow
              key={entry.id}
              entry={entry}
              onUpdate={(patch) => updateClosedDay(entry.id, patch)}
              onRemove={() => removeClosedDay(entry.id)}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

function ClosedDayRow({
  entry,
  onUpdate,
  onRemove,
}: {
  entry: ClosedDayEntry;
  onUpdate: (patch: Partial<Pick<ClosedDayEntry, "label">>) => void;
  onRemove: () => void;
}) {
  return (
    <li className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">{formatClosedDate(entry.date)}</p>
          {entry.source === "custom" ? (
            <label className="mt-1 block text-xs font-medium text-slate-500">
              Label
              <input
                type="text"
                value={entry.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
                className="mt-1 w-full rounded border border-slate-200 px-2 py-1.5 text-sm text-slate-800"
              />
            </label>
          ) : (
            <p className="text-sm text-slate-700">{entry.label}</p>
          )}
          {entry.source === "federal" && (
            <span className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
              Federal
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
          aria-label={`Remove ${entry.label}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}
