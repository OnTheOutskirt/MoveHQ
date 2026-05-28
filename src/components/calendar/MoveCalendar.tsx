"use client";

import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CalendarLegend } from "@/components/calendar/CalendarLegend";
import { DayDetailSidebar } from "@/components/calendar/DayDetailSidebar";
import { MonthView } from "@/components/calendar/MonthView";
import { CalendarSettingsSidebar } from "@/components/calendar/settings/CalendarSettingsSidebar";
import { useCalendarSettings } from "@/components/providers/CalendarSettingsProvider";
import {
  addMonths,
  formatMonthYear,
  startOfMonth,
  toDateKey,
} from "@/lib/calendar/date-utils";
import { buildMockMonth } from "@/lib/calendar/mock-data";
import { findClosedDay } from "@/lib/calendar/settings/apply-closed";
import type { ClosedDaySource } from "@/lib/calendar/settings/types";
import type { CalendarDayData } from "@/lib/calendar/types";
import { useEffect, useMemo, useState } from "react";

export function MoveCalendar() {
  const today = useMemo(() => new Date(), []);
  const {
    closedDays,
    federalHolidayBookedDates,
    isReady,
    setFederalHolidayBooked,
    addClosedDay,
    removeClosedDayForDate,
  } = useCalendarSettings();
  const [anchor, setAnchor] = useState(() => startOfMonth(today));
  const [days, setDays] = useState<Record<string, CalendarDayData>>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [daySidebarOpen, setDaySidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    setDays((prev) => ({
      ...prev,
      ...buildMockMonth(anchor, today, closedDays, federalHolidayBookedDates),
    }));
  }, [isReady, anchor, today, closedDays, federalHolidayBookedDates]);

  const selectedDay = selectedDate ? (days[toDateKey(selectedDate)] ?? null) : null;
  const selectedClosedEntry = selectedDate
    ? findClosedDay(toDateKey(selectedDate), closedDays)
    : undefined;
  const selectedClosedSource: ClosedDaySource | undefined = selectedDay?.isClosed
    ? selectedClosedEntry?.source
    : undefined;

  function mergeMonth(monthAnchor: Date) {
    setDays((prev) => ({
      ...prev,
      ...buildMockMonth(monthAnchor, today, closedDays, federalHolidayBookedDates),
    }));
  }

  function goPrevious() {
    const next = addMonths(anchor, -1);
    mergeMonth(next);
    setAnchor(next);
  }

  function goNext() {
    const next = addMonths(anchor, 1);
    mergeMonth(next);
    setAnchor(next);
  }

  function goToday() {
    const m = startOfMonth(today);
    setAnchor(m);
    mergeMonth(m);
  }

  function openDay(date: Date, day: CalendarDayData) {
    setSettingsOpen(false);
    setSelectedDate(date);
    setDaySidebarOpen(true);
    setDays((prev) => ({ ...prev, [day.date]: day }));
  }

  function openDayForNotes(date: Date, day: CalendarDayData) {
    openDay(date, day);
  }

  function openSettings() {
    setDaySidebarOpen(false);
    setSettingsOpen(true);
  }

  function patchSelectedDay(patch: Partial<CalendarDayData>) {
    if (!selectedDate) return;
    const key = toDateKey(selectedDate);
    setDays((prev) => {
      const existing = prev[key];
      if (!existing) return prev;
      return { ...prev, [key]: { ...existing, ...patch } };
    });
  }

  function updateNotes(notes: string) {
    patchSelectedDay({ importantNotes: notes });
  }

  function updateManuallyMarkedBooked(checked: boolean) {
    if (!selectedDate) return;
    const key = toDateKey(selectedDate);
    const entry = findClosedDay(key, closedDays);
    if (entry?.source === "federal") {
      setFederalHolidayBooked(key, checked);
      return;
    }
    patchSelectedDay({ manuallyMarkedBooked: checked });
  }

  function reopenSelectedDay() {
    if (!selectedDate) return;
    removeClosedDayForDate(toDateKey(selectedDate));
    setDaySidebarOpen(false);
  }

  function markSelectedDayOff(label: string) {
    if (!selectedDate) return;
    addClosedDay({
      date: toDateKey(selectedDate),
      label,
      source: "custom",
    });
  }

  return (
    <div className="space-y-2">
      <CalendarHeader
        periodLabel={formatMonthYear(anchor)}
        onPrevious={goPrevious}
        onNext={goNext}
        onToday={goToday}
        onOpenSettings={openSettings}
      />

      <MonthView
        anchor={anchor}
        today={today}
        closedDays={closedDays}
        federalHolidayBookedDates={federalHolidayBookedDates}
        days={days}
        onDaySelect={openDay}
        onEditNotes={openDayForNotes}
      />
      <CalendarLegend />

      <DayDetailSidebar
        open={daySidebarOpen}
        date={selectedDate}
        day={selectedDay}
        onClose={() => setDaySidebarOpen(false)}
        onNotesChange={updateNotes}
        closedDaySource={selectedClosedSource}
        onManuallyMarkedBookedChange={updateManuallyMarkedBooked}
        onMarkDayOff={markSelectedDayOff}
        onReopenDay={reopenSelectedDay}
      />

      <CalendarSettingsSidebar open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
