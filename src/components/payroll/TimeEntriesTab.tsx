"use client";

import { TimeEntryDaySidebar } from "@/components/payroll/TimeEntryDaySidebar";
import { AddTimeEntrySidebar } from "@/components/payroll/AddTimeEntrySidebar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  addDays,
  formatWeekRange,
  toDateKey,
} from "@/lib/calendar/date-utils";
import {
  dailyHoursTotal,
  entriesForPersonDate,
  entriesForWeek,
  formatHoursShort,
  uniquePeopleInEntries,
  weeklyHoursTotal,
  weekdayHeadersForWeek,
  weekDayKeys,
} from "@/lib/payroll/time-entry-utils";
import { isOfficeClockEntry } from "@/lib/payroll/category-labels";
import type { TimeEntry, TimeEntryDaySelection, WorkerType } from "@/lib/payroll/types";
import { useBusinessCalendar } from "@/lib/settings/use-business-calendar";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Check, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type TimeEntriesTabProps = {
  entries: TimeEntry[];
  onUpdateEntry: (id: string, patch: Partial<TimeEntry>) => void;
  onBulkApproveEntries: (ids: string[]) => void;
  onAddEntry: (entry: TimeEntry) => void;
  onDeleteEntry: (id: string) => void;
  canApprove?: boolean;
};

type WorkerFilter = "all" | WorkerType;

export function TimeEntriesTab({
  entries,
  onUpdateEntry,
  onBulkApproveEntries,
  onAddEntry,
  onDeleteEntry,
  canApprove = false,
}: TimeEntriesTabProps) {
  const { today, startOfWeek, weekStartsOn, weekRangeLabel } = useBusinessCalendar();
  const weekHeaders = useMemo(() => weekdayHeadersForWeek(weekStartsOn), [weekStartsOn]);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today));
  const [workerFilter, setWorkerFilter] = useState<WorkerFilter>("all");
  const [selection, setSelection] = useState<TimeEntryDaySelection | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    setWeekStart(startOfWeek(today));
  }, [weekStartsOn, today, startOfWeek]);

  const weekKeys = useMemo(() => weekDayKeys(weekStart), [weekStart]);
  const weekEntries = useMemo(
    () => entriesForWeek(entries, weekStart),
    [entries, weekStart],
  );

  const people = useMemo(() => {
    const list = uniquePeopleInEntries(weekEntries);
    if (workerFilter === "all") return list;
    return list.filter((p) => p.workerType === workerFilter);
  }, [weekEntries, workerFilter]);

  const pendingCount = weekEntries.filter((e) => e.status === "pending").length;
  const todayKey = toDateKey(today);

  function openDay(personId: string, personName: string, date: string) {
    const dayEntries = entriesForPersonDate(entries, personId, date);
    if (dayEntries.length === 0) return;
    setSelection({ personId, personName, date, entries: dayEntries });
  }

  function shiftWeek(delta: number) {
    setWeekStart((prev) => addDays(prev, delta * 7));
    setSelection(null);
  }

  function approveIds(ids: string[]) {
    if (!canApprove || ids.length === 0) return;
    onBulkApproveEntries(ids);
  }

  function handleDeleteEntry(id: string) {
    onDeleteEntry(id);
    setSelection((prev) => {
      if (!prev) return null;
      const nextEntries = prev.entries.filter((e) => e.id !== id);
      if (nextEntries.length === 0) return null;
      return { ...prev, entries: nextEntries };
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={() => shiftWeek(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[10rem] text-center">
            <p className="text-sm font-semibold text-slate-900">{formatWeekRange(weekStart)}</p>
            <p className="text-xs text-slate-500">{weekRangeLabel}</p>
          </div>
          <Button type="button" size="sm" variant="secondary" onClick={() => shiftWeek(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setWeekStart(startOfWeek(today));
              setSelection(null);
            }}
          >
            This week
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canApprove ? (
            <Button type="button" size="sm" variant="secondary" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Add time
            </Button>
          ) : null}
          {pendingCount > 0 ? (
            <Badge variant="warning">{pendingCount} pending this week</Badge>
          ) : (
            <Badge variant="success">All approved this week</Badge>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "Everyone"],
            ["crew", "Crew only"],
            ["office", "Office / managers"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setWorkerFilter(id)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm font-medium",
              workerFilter === id
                ? "border-brand-600 bg-brand-50 text-brand-800"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-[760px] w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="sticky left-0 z-10 bg-slate-50/95 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Team member
              </th>
              {weekKeys.map((dateKey, i) => {
                const dayPending = weekEntries.filter(
                  (e) => e.date === dateKey && e.status === "pending",
                );
                return (
                  <th
                    key={dateKey}
                    className={cn(
                      "px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide",
                      dateKey === todayKey ? "text-brand-700" : "text-slate-500",
                    )}
                  >
                    <span className="block">{weekHeaders[i]}</span>
                    <span className="mt-0.5 block font-normal normal-case text-slate-400">
                      {dateKey.slice(5).replace("-", "/")}
                    </span>
                    {canApprove && dayPending.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => approveIds(dayPending.map((e) => e.id))}
                        className="mt-1 inline-flex items-center gap-0.5 rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold normal-case text-emerald-800 hover:bg-emerald-100"
                      >
                        <Check className="h-3 w-3" />
                        Approve all
                      </button>
                    ) : null}
                  </th>
                );
              })}
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Week
              </th>
            </tr>
          </thead>
          <tbody>
            {people.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-500">
                  No time logged this week for this filter.
                </td>
              </tr>
            ) : (
              people.map((person) => {
                const personWeekEntries = weekEntries.filter((e) => e.personId === person.personId);
                return (
                  <tr key={person.personId} className="border-b border-slate-100 last:border-0">
                    <td className="sticky left-0 z-10 bg-white px-3 py-2">
                      <p className="font-medium text-slate-900">{person.personName}</p>
                      <p className="text-xs text-slate-500">{person.roleLabel}</p>
                    </td>
                    {weekKeys.map((dateKey) => {
                      const dayEntries = entriesForPersonDate(entries, person.personId, dateKey);
                      const total = dailyHoursTotal(dayEntries);
                      const hasPending = dayEntries.some((e) => e.status === "pending");
                      const hasLiveClock = dayEntries.some((e) => e.isLiveClock);
                      const hasOfficeClock = dayEntries.some((e) => isOfficeClockEntry(e));
                      return (
                        <td key={dateKey} className="px-1 py-1 text-center">
                          <button
                            type="button"
                            disabled={dayEntries.length === 0}
                            onClick={() => openDay(person.personId, person.personName, dateKey)}
                            className={cn(
                              "relative w-full min-w-[3rem] rounded-lg border px-1 py-2 text-sm tabular-nums transition",
                              dayEntries.length === 0
                                ? "cursor-default border-transparent text-slate-300"
                                : hasLiveClock
                                  ? "border-emerald-300 bg-emerald-50/90 text-emerald-900 hover:bg-emerald-100"
                                  : hasPending
                                    ? "border-amber-200 bg-amber-50/80 text-amber-900 hover:bg-amber-100"
                                    : "border-slate-200 bg-white text-slate-800 hover:border-brand-200 hover:bg-brand-50/50",
                              dateKey === todayKey && dayEntries.length > 0 && "ring-1 ring-brand-300",
                            )}
                          >
                            {formatHoursShort(total)}
                            {hasLiveClock ? (
                              <span
                                className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-emerald-500"
                                aria-label="On the clock"
                              />
                            ) : hasOfficeClock && hasPending ? (
                              <span
                                className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-500"
                                aria-label="Office clock pending"
                              />
                            ) : null}
                          </button>
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-right">
                      <p className="font-semibold tabular-nums text-slate-900">
                        {formatHoursShort(weeklyHoursTotal(personWeekEntries))}
                      </p>
                      {canApprove && personWeekEntries.some((e) => e.status === "pending") ? (
                        <button
                          type="button"
                          onClick={() =>
                            approveIds(
                              personWeekEntries
                                .filter((e) => e.status === "pending")
                                .map((e) => e.id),
                            )
                          }
                          className="mt-1 text-[10px] font-semibold text-emerald-700 hover:text-emerald-900"
                        >
                          Approve week
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <TimeEntryDaySidebar
        selection={selection}
        onClose={() => setSelection(null)}
        onUpdateEntry={onUpdateEntry}
        onDeleteEntry={canApprove ? handleDeleteEntry : undefined}
        canApprove={canApprove}
      />

      <AddTimeEntrySidebar
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={(entry) => {
          onAddEntry(entry);
          const existing = entriesForPersonDate(entries, entry.personId, entry.date);
          setSelection({
            personId: entry.personId,
            personName: entry.personName,
            date: entry.date,
            entries: [...existing, entry],
          });
        }}
        defaultDate={todayKey}
      />
    </div>
  );
}
