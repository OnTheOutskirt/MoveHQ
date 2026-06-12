"use client";

import {
  buildArrivalTimeOptions,
  formatArrivalWindowFromRange,
  followOnArrivalWindowSuffix,
  minutesToTime24,
  resolveParsedArrivalWindow,
  snapToArrivalIncrement,
  time24ToMinutes,
  type JobDayArrivalDefaults,
} from "@/lib/moves/job-day-arrival";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

const ARRIVAL_TIME_OPTIONS = buildArrivalTimeOptions();

type JobDayArrivalWindowFieldsProps = {
  arrivalWindow: string;
  computedArrival: string;
  isFirstJobOfDay: boolean;
  manual: boolean;
  defaults?: JobDayArrivalDefaults;
  onChange: (nextWindow: string) => void;
};

export function JobDayArrivalWindowFields({
  arrivalWindow,
  computedArrival,
  isFirstJobOfDay,
  manual,
  defaults,
  onChange,
}: JobDayArrivalWindowFieldsProps) {
  const parsed = useMemo(
    () =>
      resolveParsedArrivalWindow(arrivalWindow, {
        isFirstJobOfDay,
        computedFallback: computedArrival,
        defaults,
      }),
    [arrivalWindow, computedArrival, isFirstJobOfDay, defaults],
  );

  const followOnSuffix = useMemo(
    () => (isFirstJobOfDay ? "" : followOnArrivalWindowSuffix(defaults)),
    [isFirstJobOfDay, defaults],
  );

  const startTime24 = minutesToTime24(parsed.startMinutes);
  const endTime24 = minutesToTime24(parsed.endMinutes);
  const suffix = parsed.suffix || followOnSuffix;

  function updateTimes(nextStart24: string, nextEnd24: string) {
    const startMinutes = snapToArrivalIncrement(time24ToMinutes(nextStart24));
    let endMinutes = snapToArrivalIncrement(time24ToMinutes(nextEnd24));
    if (endMinutes <= startMinutes) {
      endMinutes = startMinutes + 30;
    }
    onChange(
      formatArrivalWindowFromRange({
        startMinutes,
        endMinutes,
        suffix: isFirstJobOfDay ? "" : suffix,
      }),
    );
  }

  const selectClassName = cn(
    "w-full appearance-none rounded-md border px-2 py-1.5 text-sm tabular-nums",
    manual
      ? "border-slate-200 bg-white"
      : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-700",
  );

  return (
    <div className="mt-0.5 space-y-1">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5">
        <select
          value={startTime24}
          disabled={!manual}
          onChange={(e) => updateTimes(e.target.value, endTime24)}
          aria-label="Arrival window start"
          className={selectClassName}
        >
          {ARRIVAL_TIME_OPTIONS.map((option) => (
            <option key={`start-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-slate-400">to</span>
        <select
          value={endTime24}
          disabled={!manual}
          onChange={(e) => updateTimes(startTime24, e.target.value)}
          aria-label="Arrival window end"
          className={selectClassName}
        >
          {ARRIVAL_TIME_OPTIONS.map((option) => (
            <option key={`end-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {!isFirstJobOfDay && suffix ? (
        <p className="text-[10px] text-slate-500">{suffix.trim()}</p>
      ) : null}
    </div>
  );
}
