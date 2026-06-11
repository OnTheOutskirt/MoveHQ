"use client";

import { useCalendarSettings } from "@/components/providers/CalendarSettingsProvider";
import { DAY_SHARE_COMBINATION_HINT } from "@/lib/day-share/units";
import type { DayShareFraction } from "@/lib/day-share/types";

const FRACTION_KEYS: DayShareFraction[] = ["brief", "short", "medium", "long"];
const CREW_SIZE_OPTIONS = [2, 3, 4, 5, 6, 7, 8];

export function DayShareTab() {
  const { settingsDayShareSettings, updateDayShareSettings } = useCalendarSettings();
  const settings = settingsDayShareSettings;

  function toggleCrewSize(size: number) {
    const current = new Set(settings.allowedCrewSizes);
    if (current.has(size)) current.delete(size);
    else current.add(size);
    const next = [...current].sort((a, b) => a - b);
    updateDayShareSettings({
      allowedCrewSizes: next.length > 0 ? next : [size],
    });
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600">
        Partial-day scheduling fills crew-days by pairing morning and afternoon jobs.
        Open slots show what still fits based on jobs already on the calendar.
      </p>
      <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        {DAY_SHARE_COMBINATION_HINT}
      </p>

      <div>
        <label className="text-xs font-medium text-slate-600">Section label</label>
        <input
          type="text"
          value={settings.sectionLabel}
          onChange={(e) => updateDayShareSettings({ sectionLabel: e.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <p className="mt-1 text-[11px] text-slate-500">
          Replaces legacy &quot;FTA&quot; wording on the move calendar and dispatch board.
        </p>
      </div>

      <div>
        <p className="text-xs font-medium text-slate-600">Allowed crew sizes</p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          Only these crew sizes participate in open-slot scheduling (Google Sheets used 2 &amp; 3).
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CREW_SIZE_OPTIONS.map((size) => {
            const active = settings.allowedCrewSizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleCrewSize(size)}
                className={
                  active
                    ? "rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white"
                    : "rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
                }
              >
                {size}-person
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium text-slate-600">Duration labels</p>
        {FRACTION_KEYS.map((key) => (
          <div key={key}>
            <label className="text-[10px] uppercase tracking-wide text-slate-500">{key}</label>
            <input
              type="text"
              value={settings.fractionLabels[key]}
              onChange={(e) =>
                updateDayShareSettings({
                  fractionLabels: { ...settings.fractionLabels, [key]: e.target.value },
                })
              }
              className="mt-0.5 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
