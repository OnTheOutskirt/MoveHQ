"use client";

import { useCalendarSettings } from "@/components/providers/CalendarSettingsProvider";
import { DAY_PORTION_LABELS } from "@/lib/day-share/units";
import { DAY_PORTIONS, type DayPortion, type DayShareFraction } from "@/lib/day-share/types";

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
        <p className="text-[11px] text-slate-500">
          Set each duration&apos;s name and how much of a crew-day it fills.
        </p>
        {FRACTION_KEYS.map((key) => (
          <div key={key}>
            <label className="text-[10px] uppercase tracking-wide text-slate-500">{key}</label>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={settings.fractionLabels[key]}
                onChange={(e) =>
                  updateDayShareSettings({
                    fractionLabels: { ...settings.fractionLabels, [key]: e.target.value },
                  })
                }
                className="min-w-[8rem] flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                aria-label={`${key} label`}
              />
              <select
                value={settings.fractionPortions[key]}
                onChange={(e) =>
                  updateDayShareSettings({
                    fractionPortions: {
                      ...settings.fractionPortions,
                      [key]: e.target.value as DayPortion,
                    },
                  })
                }
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                aria-label={`${key} portion`}
              >
                {DAY_PORTIONS.map((portion) => (
                  <option key={portion} value={portion}>
                    {DAY_PORTION_LABELS[portion]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
