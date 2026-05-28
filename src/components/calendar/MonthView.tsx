"use client";

import {
  MonthDayCell,
  MonthEmptyCell,
  MonthWeekdayHeader,
} from "@/components/calendar/MonthDayCell";
import { getMonthOnlyGridCells, toDateKey } from "@/lib/calendar/date-utils";
import { getDayData } from "@/lib/calendar/mock-data";
import type { ClosedDayEntry } from "@/lib/calendar/settings/types";
import type { CalendarDayData } from "@/lib/calendar/types";

type MonthViewProps = {
  anchor: Date;
  today: Date;
  closedDays: ClosedDayEntry[];
  federalHolidayBookedDates: string[];
  days: Record<string, CalendarDayData>;
  onDaySelect: (date: Date, day: CalendarDayData) => void;
  onEditNotes: (date: Date, day: CalendarDayData, e: React.MouseEvent) => void;
};

export function MonthView({
  anchor,
  today,
  closedDays,
  federalHolidayBookedDates,
  days,
  onDaySelect,
  onEditNotes,
}: MonthViewProps) {
  const cells = getMonthOnlyGridCells(anchor);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <MonthWeekdayHeader />
      <div className="grid grid-cols-6 border-l border-slate-200">
        {cells.map((date, index) => {
          if (!date) {
            return <MonthEmptyCell key={`empty-${index}`} />;
          }
          const day = getDayData(days, date, today, closedDays, federalHolidayBookedDates);
          return (
            <MonthDayCell
              key={toDateKey(date)}
              date={date}
              today={today}
              day={day}
              onSelect={() => onDaySelect(date, day)}
              onEditNotes={(e) => {
                e.stopPropagation();
                onEditNotes(date, day, e);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
