"use client";

import {
  TIME_CATEGORIES,
  TIME_CATEGORY_LABELS,
  type JobFieldState,
  type TimeCategory,
  slotElapsed,
} from "@/lib/crew-app/job-field-storage";
import { cn } from "@/lib/utils";
import { Coffee, Car, Clock, Plus, Timer } from "lucide-react";
import { useEffect, useState } from "react";

const CATEGORY_ICONS: Record<TimeCategory, typeof Clock> = {
  move: Clock,
  drive: Car,
  extra: Plus,
  break: Coffee,
};

type CrewTimeClockPanelProps = {
  state: JobFieldState;
  onChange: (next: JobFieldState) => void;
};

export function CrewTimeClockPanel({ state, onChange }: CrewTimeClockPanelProps) {
  const [, tick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => tick((n) => n + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  function patchCategory(category: TimeCategory, patch: Partial<JobFieldState["times"][TimeCategory]>) {
    onChange({
      ...state,
      times: {
        ...state.times,
        [category]: { ...state.times[category], ...patch },
      },
    });
  }

  function clockIn(category: TimeCategory) {
    patchCategory(category, { clockIn: new Date().toISOString(), clockOut: null });
  }

  function clockOut(category: TimeCategory) {
    patchCategory(category, { clockOut: new Date().toISOString() });
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-brand-50/60 px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Timer className="h-4 w-4 text-brand-600" />
          Time clock
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Clock in and out by category — syncs to payroll when live.
        </p>
      </div>
      <ul className="divide-y divide-slate-100">
        {TIME_CATEGORIES.map((category) => {
          const slot = state.times[category];
          const active = slot.clockIn && !slot.clockOut;
          const Icon = CATEGORY_ICONS[category];
          return (
            <li key={category} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
                    <Icon className="h-3.5 w-3.5 text-slate-400" />
                    {TIME_CATEGORY_LABELS[category]}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 text-lg font-semibold tabular-nums tracking-tight",
                      active ? "text-brand-700" : "text-slate-700",
                    )}
                  >
                    {slotElapsed(slot)}
                  </p>
                  {slot.clockIn ? (
                    <p className="text-[10px] text-slate-400">
                      In {formatTime(slot.clockIn)}
                      {slot.clockOut ? ` · Out ${formatTime(slot.clockOut)}` : " · running"}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    disabled={Boolean(slot.clockIn && !slot.clockOut)}
                    onClick={() => clockIn(category)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                      slot.clockIn && !slot.clockOut
                        ? "bg-slate-100 text-slate-400"
                        : "bg-brand-600 text-white hover:bg-brand-700",
                    )}
                  >
                    In
                  </button>
                  <button
                    type="button"
                    disabled={!slot.clockIn || Boolean(slot.clockOut)}
                    onClick={() => clockOut(category)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                      !slot.clockIn || slot.clockOut
                        ? "border-slate-200 text-slate-400"
                        : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50",
                    )}
                  >
                    Out
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}
