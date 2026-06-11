"use client";

import {
  MonthDayCell,
  type MonthDayCellMode,
  MonthEmptyCell,
  MonthWeekdayHeader,
} from "@/components/calendar/MonthDayCell";
import { getDayData } from "@/lib/calendar/mock-data";
import { toDateKey } from "@/lib/calendar/date-utils";
import type { ClosedDayEntry } from "@/lib/calendar/settings/types";
import type { CalendarDayData } from "@/lib/calendar/types";
import { useBusinessCalendar } from "@/lib/settings/use-business-calendar";
import { cn } from "@/lib/utils";

type MonthViewProps = {
  anchor: Date;
  closedDays: ClosedDayEntry[];
  federalHolidayBookedDates: string[];
  days: Record<string, CalendarDayData>;
  /** Highlight the job day or active selection (yyyy-mm-dd). */
  highlightDateKey?: string;
  cellMode?: MonthDayCellMode;
  /** Stretch week rows to fill the parent — avoids scroll in peek panels. */
  fillHeight?: boolean;
  onDaySelect: (date: Date, day: CalendarDayData) => void;
  onEditNotes?: (date: Date, day: CalendarDayData, e: React.MouseEvent) => void;
};

export function MonthView({
  anchor,
  closedDays,
  federalHolidayBookedDates,
  days,
  highlightDateKey,
  cellMode = "default",
  fillHeight = false,
  onDaySelect,
  onEditNotes,
}: MonthViewProps) {
  const { today, columnWeekdays, getMonthGridCells, openDays } = useBusinessCalendar();
  const cells = getMonthGridCells(anchor);
  const colCount = columnWeekdays.length;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm",
        fillHeight && "flex min-h-0 flex-1 flex-col",
      )}
    >
      <MonthWeekdayHeader columnWeekdays={columnWeekdays} />
      <div
        className={cn("grid border-l border-slate-200", fillHeight && "min-h-0 flex-1")}
        style={{
          gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
          ...(fillHeight ? { gridAutoRows: "1fr" } : {}),
        }}
      >
        {cells.map((date, index) => {
          if (!date) {
            return <MonthEmptyCell key={`empty-${index}`} fillHeight={fillHeight} />;
          }
          const day = getDayData(days, date, today, closedDays, federalHolidayBookedDates, openDays);
          return (
            <MonthDayCell
              key={toDateKey(date)}
              date={date}
              today={today}
              day={day}
              highlighted={highlightDateKey === toDateKey(date)}
              mode={cellMode}
              fillHeight={fillHeight}
              onSelect={() => onDaySelect(date, day)}
              onEditNotes={
                onEditNotes
                  ? (e) => {
                      e.stopPropagation();
                      onEditNotes(date, day, e);
                    }
                  : undefined
              }
            />
          );
        })}
      </div>
    </div>
  );
}
