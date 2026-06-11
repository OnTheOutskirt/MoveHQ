"use client";

import { SettingsField, SettingsInput } from "@/components/settings/SettingsField";
import {
  buildRecurrenceFromForm,
  monthlyStyleLabels,
  RECURRENCE_WEEKDAY_SHORT,
  RECURRENCE_WEEKDAYS,
  recurrenceFormFromRecurrence,
  type RecurrenceFormValue,
  type RecurrenceWeekday,
  type StaffCalendarRecurrence,
  weekdayFromDateKey,
  yearlyStyleLabels,
} from "@/lib/schedule/recurrence";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

type RecurrencePickerProps = {
  anchorDateKey: string;
  value?: StaffCalendarRecurrence;
  onChange: (recurrence: StaffCalendarRecurrence | undefined) => void;
};

const MODE_OPTIONS = [
  { id: "none" as const, label: "Does not repeat" },
  { id: "daily" as const, label: "Daily" },
  { id: "weekly" as const, label: "Weekly" },
  { id: "monthly" as const, label: "Monthly" },
  { id: "yearly" as const, label: "Yearly" },
];

export function RecurrencePicker({ anchorDateKey, value, onChange }: RecurrencePickerProps) {
  const [form, setForm] = useState<RecurrenceFormValue>(() =>
    recurrenceFormFromRecurrence(value, anchorDateKey),
  );

  useEffect(() => {
    setForm(recurrenceFormFromRecurrence(value, anchorDateKey));
  }, [value, anchorDateKey]);

  const monthlyLabels = useMemo(() => monthlyStyleLabels(anchorDateKey), [anchorDateKey]);
  const yearlyLabels = useMemo(() => yearlyStyleLabels(anchorDateKey), [anchorDateKey]);

  const previewLabel = useMemo(() => {
    const built = buildRecurrenceFromForm(form, anchorDateKey);
    return built?.label ?? "Does not repeat";
  }, [form, anchorDateKey]);

  function update(patch: Partial<RecurrenceFormValue>) {
    const next = { ...form, ...patch };
    setForm(next);
    onChange(buildRecurrenceFromForm(next, anchorDateKey));
  }

  function toggleWeekday(day: RecurrenceWeekday) {
    const set = new Set(form.weeklyDays);
    if (set.has(day)) {
      if (set.size === 1) return;
      set.delete(day);
    } else {
      set.add(day);
    }
    update({ weeklyDays: RECURRENCE_WEEKDAYS.filter((d) => set.has(d)) });
  }

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3">
      <SettingsField label="Repeats">
        <select
          value={form.mode}
          onChange={(e) => {
            const mode = e.target.value as RecurrenceFormValue["mode"];
            const reset =
              mode === "weekly" && form.weeklyDays.length === 0
                ? { weeklyDays: [weekdayFromDateKey(anchorDateKey)] }
                : {};
            update({ mode, ...reset });
          }}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
        >
          {MODE_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </SettingsField>

      {form.mode === "daily" || form.mode === "weekly" || form.mode === "monthly" ? (
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
          <span>Every</span>
          <select
            value={form.interval}
            onChange={(e) => update({ interval: Number(e.target.value) })}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm"
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span>
            {form.mode === "daily"
              ? "day(s)"
              : form.mode === "weekly"
                ? "week(s)"
                : "month(s)"}
          </span>
        </div>
      ) : null}

      {form.mode === "weekly" ? (
        <div>
          <p className="mb-1.5 text-xs font-medium text-slate-600">On</p>
          <div className="flex flex-wrap gap-1">
            {RECURRENCE_WEEKDAYS.map((day) => {
              const active = form.weeklyDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleWeekday(day)}
                  className={cn(
                    "min-w-[2.25rem] rounded-md border px-2 py-1 text-xs font-semibold transition-colors",
                    active
                      ? "border-brand-300 bg-brand-50 text-brand-800"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  )}
                >
                  {RECURRENCE_WEEKDAY_SHORT[day]}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {form.mode === "monthly" ? (
        <fieldset className="space-y-1.5">
          <legend className="sr-only">Monthly pattern</legend>
          <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="monthly-style"
              checked={form.monthlyStyle === "date"}
              onChange={() => update({ monthlyStyle: "date" })}
              className="mt-0.5"
            />
            <span>{monthlyLabels.date}</span>
          </label>
          <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="monthly-style"
              checked={form.monthlyStyle === "ordinal"}
              onChange={() => update({ monthlyStyle: "ordinal" })}
              className="mt-0.5"
            />
            <span>{monthlyLabels.ordinal}</span>
          </label>
        </fieldset>
      ) : null}

      {form.mode === "yearly" ? (
        <fieldset className="space-y-1.5">
          <legend className="sr-only">Yearly pattern</legend>
          <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="yearly-style"
              checked={form.yearlyStyle === "date"}
              onChange={() => update({ yearlyStyle: "date" })}
              className="mt-0.5"
            />
            <span>{yearlyLabels.date}</span>
          </label>
          <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="yearly-style"
              checked={form.yearlyStyle === "ordinal"}
              onChange={() => update({ yearlyStyle: "ordinal" })}
              className="mt-0.5"
            />
            <span>{yearlyLabels.ordinal}</span>
          </label>
        </fieldset>
      ) : null}

      {form.mode !== "none" ? (
        <div className="border-t border-slate-200 pt-3">
          <p className="mb-1.5 text-xs font-medium text-slate-600">Ends</p>
          <select
            value={form.endType}
            onChange={(e) =>
              update({ endType: e.target.value as RecurrenceFormValue["endType"] })
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="noEnd">Never</option>
            <option value="endDate">On date</option>
            <option value="numbered">After occurrences</option>
          </select>
          {form.endType === "endDate" ? (
            <SettingsInput
              type="date"
              value={form.endDate}
              onChange={(e) => update({ endDate: e.target.value })}
              className="mt-2"
            />
          ) : null}
          {form.endType === "numbered" ? (
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-700">
              <SettingsInput
                type="number"
                min={1}
                max={999}
                value={form.occurrenceCount}
                onChange={(e) => update({ occurrenceCount: Number(e.target.value) || 1 })}
                className="w-20"
              />
              <span>occurrences</span>
            </div>
          ) : null}
        </div>
      ) : null}

      <p className="text-xs text-slate-500">
        <span className="font-medium text-slate-700">{previewLabel}</span>
        {form.mode !== "none" ? " · matches Microsoft Graph recurrence when Outlook syncs." : null}
      </p>
    </div>
  );
}
