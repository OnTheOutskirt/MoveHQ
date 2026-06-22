"use client";

import { Button } from "@/components/ui/Button";
import { useCalendarSettings } from "@/components/providers/CalendarSettingsProvider";
import type { ClosedDayEntry } from "@/lib/calendar/settings/types";
import { cn } from "@/lib/utils";
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
  const {
    settingsClosedDays,
    settingsFederalHolidayBookedDates,
    addClosedDay,
    updateClosedDay,
    setClosedDayEnabled,
  } = useCalendarSettings();

  function isEntryEnabled(entry: ClosedDayEntry): boolean {
    if (entry.source === "federal") return !settingsFederalHolidayBookedDates.includes(entry.date);
    return entry.enabled !== false;
  }

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
        <p className="mb-1 text-sm font-semibold text-slate-900">
          Scheduled closures ({settingsClosedDays.length})
        </p>
        <p className="mb-2 text-xs text-slate-500">
          Turn a closure off to reopen the day for booking — it stays saved so you can turn it back
          on later.
        </p>
        <ul className="space-y-2">
          {settingsClosedDays.map((entry) => (
            <ClosedDayRow
              key={entry.id}
              entry={entry}
              enabled={isEntryEnabled(entry)}
              onUpdate={(patch) => updateClosedDay(entry.id, patch)}
              onToggle={(enabled) => setClosedDayEnabled(entry.id, enabled)}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

function ClosureToggle({
  enabled,
  onToggle,
  label,
}: {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={`${enabled ? "Turn off" : "Turn on"} ${label}`}
      onClick={() => onToggle(!enabled)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
        enabled ? "bg-brand-600" : "bg-slate-200",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform",
          enabled ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}

function ClosedDayRow({
  entry,
  enabled,
  onUpdate,
  onToggle,
}: {
  entry: ClosedDayEntry;
  enabled: boolean;
  onUpdate: (patch: Partial<Pick<ClosedDayEntry, "label">>) => void;
  onToggle: (enabled: boolean) => void;
}) {
  return (
    <li
      className={cn(
        "rounded-lg border p-3 transition-colors",
        enabled ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={cn("min-w-0 flex-1", !enabled && "opacity-60")}>
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
        <div className="flex shrink-0 flex-col items-center gap-1">
          <ClosureToggle enabled={enabled} onToggle={onToggle} label={entry.label} />
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            {enabled ? "On" : "Off"}
          </span>
        </div>
      </div>
    </li>
  );
}
