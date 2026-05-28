"use client";

import { addDays, formatDayLong, parseDateKey, toDateKey } from "@/lib/calendar/date-utils";
import type { OpsJobsView } from "@/lib/operations/ops-jobs";
import { cn } from "@/lib/utils";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const VIEW_TABS: { id: OpsJobsView; label: string }[] = [
  { id: "past", label: "Past" },
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
];

type JobsDayToolbarProps = {
  view: OpsJobsView;
  onViewChange: (view: OpsJobsView) => void;
  selectedDateKey: string;
  onSelectedDateChange: (dateKey: string) => void;
  jobCount: number;
};

export function JobsDayToolbar({
  view,
  onViewChange,
  selectedDateKey,
  onSelectedDateChange,
  jobCount,
}: JobsDayToolbarProps) {
  const today = new Date();
  const todayKey = toDateKey(today);
  const date = parseDateKey(selectedDateKey);

  function shift(days: number) {
    const next = toDateKey(addDays(date, days));
    onSelectedDateChange(next);
    onViewChange("date");
  }

  function pickView(next: OpsJobsView) {
    onViewChange(next);
    if (next === "today") onSelectedDateChange(todayKey);
    if (next === "tomorrow") onSelectedDateChange(toDateKey(addDays(today, 1)));
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => pickView(tab.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                view === tab.id
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center rounded-lg border border-slate-200 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => shift(-1)}
            className="rounded-l-lg p-2 text-slate-500 hover:bg-slate-50"
            aria-label="Previous day"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <label className="flex items-center gap-2 border-x border-slate-200 px-3 py-1.5">
            <Calendar className="h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={selectedDateKey}
              onChange={(e) => {
                if (!e.target.value) return;
                onSelectedDateChange(e.target.value);
                onViewChange("date");
              }}
              className="text-sm font-medium text-slate-900 focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => shift(1)}
            className="rounded-r-lg p-2 text-slate-500 hover:bg-slate-50"
            aria-label="Next day"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-600">
        <span className="font-medium text-slate-900">{jobCount}</span> job
        {jobCount === 1 ? "" : "s"}
        {view === "date" ? (
          <span className="text-slate-500"> · {formatDayLong(date)}</span>
        ) : null}
      </p>
    </div>
  );
}
