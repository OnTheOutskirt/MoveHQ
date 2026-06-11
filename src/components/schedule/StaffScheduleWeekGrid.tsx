"use client";

import { StaffScheduleEventBlock } from "@/components/schedule/StaffScheduleEventBlock";
import {
  openDatesInWeek,
  scheduleGridHeightPx,
  scheduleMinutesToPx,
  SCHEDULE_HOUR_HEIGHT_PX,
  SCHEDULE_SCROLL_TO_HOUR,
  SCHEDULE_SLOT_MINUTES,
  scheduleScrollTopPx,
  scheduleSlotCount,
  formatScheduleHourLabel,
} from "@/lib/schedule/schedule-time-grid";
import type { StaffCalendarEvent, StaffCalendarScope } from "@/lib/schedule/types";
import type { WeekdayId } from "@/lib/operations/fleet-types";
import { isSameDay, toDateKey } from "@/lib/calendar/date-utils";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useRef } from "react";

type StaffScheduleWeekGridProps = {
  weekStart: Date;
  today: Date;
  events: StaffCalendarEvent[];
  scope: StaffCalendarScope;
  officeOpenDays: WeekdayId[];
  selectedEventId: string | null;
  onSelectEvent: (event: StaffCalendarEvent) => void;
};

function eventsForDay(events: StaffCalendarEvent[], dateKey: string): StaffCalendarEvent[] {
  return events
    .filter((e) => e.dateKey === dateKey)
    .sort((a, b) => a.startMinutes - b.startMinutes);
}

export function StaffScheduleWeekGrid({
  weekStart,
  today,
  events,
  scope,
  officeOpenDays,
  selectedEventId,
  onSelectEvent,
}: StaffScheduleWeekGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const gridHeight = scheduleGridHeightPx();
  const slotCount = scheduleSlotCount();
  const showStaff = scope === "company";

  const openDays = useMemo(
    () => openDatesInWeek(weekStart, officeOpenDays),
    [weekStart, officeOpenDays],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = scheduleScrollTopPx(SCHEDULE_SCROLL_TO_HOUR);
  }, [weekStart, officeOpenDays]);

  if (openDays.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-500 shadow-sm">
        No office open days configured for this week. Update open days under Admin → Company →
        Location.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex border-b border-slate-200 bg-white">
        <div className="w-14 shrink-0 border-r border-slate-100 sm:w-16" aria-hidden />
        <div className="flex min-w-0 flex-1 overflow-x-auto">
          <div
            className="grid flex-1"
            style={{ gridTemplateColumns: `repeat(${openDays.length}, minmax(5.5rem, 1fr))` }}
          >
            {openDays.map((date) => {
              const isToday = isSameDay(date, today);
              return (
                <div
                  key={toDateKey(date)}
                  className={cn(
                    "min-w-[5.5rem] border-r border-slate-100 px-2 py-2 last:border-r-0 sm:px-2.5",
                    isToday && "bg-brand-50/40",
                  )}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </p>
                  <p
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      isToday ? "text-brand-800" : "text-slate-900",
                    )}
                  >
                    {date.getDate()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="max-h-[32rem] overflow-auto">
        <div className="flex" style={{ height: gridHeight }}>
          <div className="sticky left-0 z-10 w-14 shrink-0 border-r border-slate-100 bg-white sm:w-16">
            {Array.from({ length: 24 }, (_, hour) => (
              <div
                key={hour}
                className="relative border-t border-slate-100 text-[10px] font-medium tabular-nums text-slate-400 first:border-t-0"
                style={{ height: SCHEDULE_HOUR_HEIGHT_PX }}
              >
                <span className="absolute -top-2 right-1.5 bg-white px-0.5 sm:right-2">
                  {formatScheduleHourLabel(hour)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex min-w-0 flex-1 overflow-x-auto">
            <div
              className="grid flex-1"
              style={{ gridTemplateColumns: `repeat(${openDays.length}, minmax(5.5rem, 1fr))` }}
            >
              {openDays.map((date) => {
                const dateKey = toDateKey(date);
                const dayEvents = eventsForDay(events, dateKey);
                const isToday = isSameDay(date, today);

                return (
                  <div
                    key={dateKey}
                    className={cn(
                      "relative min-w-[5.5rem] border-r border-slate-100 last:border-r-0",
                      isToday && "bg-brand-50/20",
                    )}
                  >
                    {Array.from({ length: slotCount }, (_, slotIndex) => {
                      const isHour = slotIndex % (60 / SCHEDULE_SLOT_MINUTES) === 0;
                      return (
                        <div
                          key={slotIndex}
                          className={cn(
                            "border-t",
                            isHour ? "border-slate-100" : "border-slate-50",
                          )}
                          style={{ height: scheduleMinutesToPx(SCHEDULE_SLOT_MINUTES) }}
                        />
                      );
                    })}

                    {dayEvents.map((ev) => {
                      const top = scheduleMinutesToPx(ev.startMinutes);
                      const height = Math.max(
                        scheduleMinutesToPx(ev.endMinutes - ev.startMinutes),
                        scheduleMinutesToPx(15),
                      );

                      return (
                        <StaffScheduleEventBlock
                          key={ev.id}
                          event={ev}
                          top={top}
                          height={height}
                          showStaff={showStaff}
                          selected={selectedEventId === ev.id}
                          onSelect={() => onSelectEvent(ev)}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
