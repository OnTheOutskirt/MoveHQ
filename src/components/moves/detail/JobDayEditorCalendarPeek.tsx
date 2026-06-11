"use client";

import { CalendarLegend } from "@/components/calendar/CalendarLegend";
import { MonthView } from "@/components/calendar/MonthView";
import { useCalendarSettings } from "@/components/providers/CalendarSettingsProvider";
import {
  addMonths,
  formatMonthYear,
  parseDateKey,
  startOfMonth,
  toDateKey,
} from "@/lib/calendar/date-utils";
import type { CalendarDayData } from "@/lib/calendar/types";
import { useCalendarMonthDays } from "@/lib/calendar/use-calendar-month-days";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

/** Matches job day editor `DetailSidebar` width (`max-w-lg`). */
const JOB_DAY_SIDEBAR_WIDTH = "32rem";
/** Max width of the peek panel — wider than before for roomier day cells. */
const PEEK_CALENDAR_MAX_WIDTH = "42rem";

type JobDayEditorCalendarPeekProps = {
  open: boolean;
  onClose: () => void;
  /** ISO date (yyyy-mm-dd) for the job day being edited — highlighted on the grid. */
  jobDayDate: string;
  onPickDate: (dateKey: string) => void;
};

export function JobDayEditorCalendarPeek({
  open,
  onClose,
  jobDayDate,
  onPickDate,
}: JobDayEditorCalendarPeekProps) {
  const { closedDays, federalHolidayBookedDates } = useCalendarSettings();

  const initialAnchor = useMemo(() => {
    if (jobDayDate.trim()) {
      try {
        return startOfMonth(parseDateKey(jobDayDate));
      } catch {
        /* fall through */
      }
    }
    return startOfMonth(new Date());
  }, [jobDayDate]);

  const [anchor, setAnchor] = useState(initialAnchor);
  const { days, today } = useCalendarMonthDays(anchor);

  useEffect(() => {
    if (!open) return;
    setAnchor(initialAnchor);
  }, [open, initialAnchor]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      onClose();
    }
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open, onClose]);

  function selectDay(date: Date, _day: CalendarDayData) {
    onPickDate(toDateKey(date));
  }

  if (!open) return null;

  const jobDayKey = jobDayDate.trim();

  return (
    <div className="fixed inset-0 z-[55]" aria-hidden={false}>
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-transparent"
        onClick={onClose}
        aria-label="Close move calendar"
      />
      <div
        className="pointer-events-auto fixed top-4 bottom-4 z-10 flex -translate-x-1/2 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        style={{
          left: `calc((100vw - min(${JOB_DAY_SIDEBAR_WIDTH}, 100vw)) / 2)`,
          width: `min(${PEEK_CALENDAR_MAX_WIDTH}, calc(100vw - min(${JOB_DAY_SIDEBAR_WIDTH}, 100vw) - 2rem))`,
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-slate-500" />
            <p className="truncate text-sm font-semibold text-slate-900">Move calendar</p>
            <span className="truncate text-xs text-slate-500">{formatMonthYear(anchor)}</span>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={() => setAnchor((prev) => addMonths(prev, -1))}
              className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setAnchor(startOfMonth(today))}
              className="rounded-md px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setAnchor((prev) => addMonths(prev, 1))}
              className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="ml-1 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close calendar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-2 pb-2 pt-1">
          <MonthView
            anchor={anchor}
            closedDays={closedDays}
            federalHolidayBookedDates={federalHolidayBookedDates}
            days={days}
            highlightDateKey={jobDayKey || undefined}
            cellMode="capacity-only"
            fillHeight
            onDaySelect={selectDay}
          />
          <div className="shrink-0 px-1 pt-2">
            <CalendarLegend />
          </div>
        </div>
      </div>
    </div>
  );
}
