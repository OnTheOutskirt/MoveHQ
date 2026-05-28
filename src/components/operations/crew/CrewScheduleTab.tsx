"use client";

import { useFleet } from "@/components/providers/FleetProvider";
import { WEEKDAY_IDS, WEEKDAY_LABELS, type WeekdayId } from "@/lib/operations/fleet";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function CrewScheduleTab() {
  const { crew, getWorkSchedule, setWorkSchedule } = useFleet();
  const [selectedId, setSelectedId] = useState(crew[0]?.id ?? "");

  const selected = crew.find((c) => c.id === selectedId);
  const workDays = selectedId ? getWorkSchedule(selectedId) : [];

  function toggleDay(day: WeekdayId) {
    if (!selectedId) return;
    const next = workDays.includes(day)
      ? workDays.filter((d) => d !== day)
      : [...workDays, day].sort((a, b) => a - b);
    if (next.length === 0) return;
    setWorkSchedule(selectedId, next);
  }

  function applyWeekdayPreset() {
    if (!selectedId) return;
    setWorkSchedule(selectedId, [1, 2, 3, 4, 5]);
  }

  function applyWeekendOff() {
    if (!selectedId) return;
    setWorkSchedule(selectedId, [1, 2, 3, 4, 5]);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Default pattern is Monday–Friday on, Saturday–Sunday off. Adjust per person; dispatch and
        time-off checks use this schedule.
      </p>

      <div className="grid gap-4 lg:grid-cols-[14rem_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-2">
          <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Crew
          </p>
          <ul className="max-h-[24rem] overflow-y-auto">
            {crew.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    "w-full rounded-lg px-2 py-1.5 text-left text-sm",
                    selectedId === c.id
                      ? "bg-brand-50 font-medium text-brand-800"
                      : "text-slate-700 hover:bg-slate-50",
                  )}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {selected ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900">{selected.name}</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={applyWeekdayPreset}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                >
                  Mon–Fri
                </button>
                <button
                  type="button"
                  onClick={applyWeekendOff}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                >
                  Reset default
                </button>
              </div>
            </div>

            <p className="mt-1 text-xs text-slate-500">Select days this person normally works</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {WEEKDAY_IDS.map((day) => {
                const on = workDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={cn(
                      "flex h-12 w-12 flex-col items-center justify-center rounded-xl border text-sm font-semibold transition-colors",
                      on
                        ? "border-brand-500 bg-brand-50 text-brand-800"
                        : "border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300",
                    )}
                  >
                    {WEEKDAY_LABELS[day]}
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Working:{" "}
              {workDays.map((d) => WEEKDAY_LABELS[d]).join(", ") || "—"}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
