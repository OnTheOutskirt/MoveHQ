"use client";

import { useDispatch } from "@/components/dispatch/DispatchProvider";
import { addDays, parseDateKey, toDateKey } from "@/lib/calendar/date-utils";
import { cn } from "@/lib/utils";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

export function DispatchDayPicker() {
  const { dateKey, setDateKey } = useDispatch();
  const date = parseDateKey(dateKey);
  const today = new Date();
  const todayKey = toDateKey(today);
  const tomorrowKey = toDateKey(addDays(today, 1));

  function shift(days: number) {
    setDateKey(toDateKey(addDays(date, days)));
  }

  return (
    <div className="flex shrink-0 flex-nowrap items-center gap-2">
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
            value={dateKey}
            onChange={(e) => e.target.value && setDateKey(e.target.value)}
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

      <div className="flex gap-1">
        <QuickDayButton
          label="Today · reassign"
          active={dateKey === todayKey}
          onClick={() => setDateKey(todayKey)}
          title="Same-day crew reassignments"
        />
        <QuickDayButton
          label="Tomorrow"
          active={dateKey === tomorrowKey}
          onClick={() => setDateKey(tomorrowKey)}
        />
      </div>
    </div>
  );
}

function QuickDayButton({
  label,
  active,
  onClick,
  title,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-brand-500 bg-brand-50 text-brand-800"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
      )}
    >
      {label}
    </button>
  );
}
