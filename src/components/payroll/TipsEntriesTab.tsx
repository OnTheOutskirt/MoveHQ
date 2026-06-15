"use client";

import { TipEntryDaySidebar } from "@/components/payroll/TipEntryDaySidebar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  addDays,
  formatWeekRange,
  toDateKey,
} from "@/lib/calendar/date-utils";
import {
  dailyTipsTotal,
  formatTipAmount,
  tipsForPersonDate,
  tipsForWeek,
  uniquePeopleInTips,
  weekdayHeadersForWeek,
  weekDayKeys,
  weeklyTipsTotal,
} from "@/lib/payroll/time-entry-utils";
import type { TipEntry, TipEntryDaySelection } from "@/lib/payroll/types";
import { useBusinessCalendar } from "@/lib/settings/use-business-calendar";
import { cn } from "@/lib/utils";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type TipsEntriesTabProps = {
  tips: TipEntry[];
  onUpdateTip: (id: string, patch: Partial<TipEntry>) => void;
  onBulkApproveTips: (ids: string[]) => void;
  canApprove?: boolean;
};

export function TipsEntriesTab({
  tips,
  onUpdateTip,
  onBulkApproveTips,
  canApprove = false,
}: TipsEntriesTabProps) {
  const { today, startOfWeek, weekStartsOn, weekRangeLabel } = useBusinessCalendar();
  const weekHeaders = useMemo(() => weekdayHeadersForWeek(weekStartsOn), [weekStartsOn]);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today));
  const [selection, setSelection] = useState<TipEntryDaySelection | null>(null);

  useEffect(() => {
    setWeekStart(startOfWeek(today));
  }, [weekStartsOn, today, startOfWeek]);

  const weekKeys = useMemo(() => weekDayKeys(weekStart), [weekStart]);
  const weekTips = useMemo(() => tipsForWeek(tips, weekStart), [tips, weekStart]);
  const people = useMemo(() => uniquePeopleInTips(weekTips), [weekTips]);
  const pendingCount = weekTips.filter((t) => t.status === "pending").length;
  const todayKey = toDateKey(today);

  function openDay(personId: string, personName: string, date: string) {
    const dayTips = tipsForPersonDate(tips, personId, date);
    if (dayTips.length === 0) return;
    setSelection({ personId, personName, date, entries: dayTips });
  }

  function shiftWeek(delta: number) {
    setWeekStart((prev) => addDays(prev, delta * 7));
    setSelection(null);
  }

  function approveIds(ids: string[]) {
    if (!canApprove || ids.length === 0) return;
    onBulkApproveTips(ids);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Crew tips from completed jobs and customer payments. Office and manager roles are excluded.
        Review and approve tips before payroll export — they export to Rippling as cash tips.
      </p>

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
          {pendingCount > 0 ? (
            <Badge variant="warning">{pendingCount} tips pending</Badge>
          ) : (
            <Badge variant="success">All tips approved this week</Badge>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-[760px] w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="sticky left-0 z-10 bg-slate-50/95 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Crew member
              </th>
              {weekKeys.map((dateKey, i) => {
                const dayPending = weekTips.filter(
                  (t) => t.date === dateKey && t.status === "pending",
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
                        onClick={() => approveIds(dayPending.map((t) => t.id))}
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
                  No crew tips logged this week.
                </td>
              </tr>
            ) : (
              people.map((person) => {
                const personWeekTips = weekTips.filter((t) => t.personId === person.personId);
                return (
                  <tr key={person.personId} className="border-b border-slate-100 last:border-0">
                    <td className="sticky left-0 z-10 bg-white px-3 py-2">
                      <p className="font-medium text-slate-900">{person.personName}</p>
                      <p className="text-xs text-slate-500">Crew</p>
                    </td>
                    {weekKeys.map((dateKey) => {
                      const dayTips = tipsForPersonDate(tips, person.personId, dateKey);
                      const total = dailyTipsTotal(dayTips);
                      const hasPending = dayTips.some((t) => t.status === "pending");
                      return (
                        <td key={dateKey} className="px-1 py-1 text-center">
                          <button
                            type="button"
                            disabled={dayTips.length === 0}
                            onClick={() => openDay(person.personId, person.personName, dateKey)}
                            className={cn(
                              "relative w-full min-w-[3rem] rounded-lg border px-1 py-2 text-sm tabular-nums transition",
                              dayTips.length === 0
                                ? "cursor-default border-transparent text-slate-300"
                                : hasPending
                                  ? "border-amber-200 bg-amber-50/80 text-amber-900 hover:bg-amber-100"
                                  : "border-slate-200 bg-white text-slate-800 hover:border-brand-200 hover:bg-brand-50/50",
                            )}
                          >
                            {formatTipAmount(total)}
                          </button>
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-right">
                      <p className="font-semibold tabular-nums text-slate-900">
                        {formatTipAmount(weeklyTipsTotal(personWeekTips))}
                      </p>
                      {canApprove && personWeekTips.some((t) => t.status === "pending") ? (
                        <button
                          type="button"
                          onClick={() =>
                            approveIds(
                              personWeekTips
                                .filter((t) => t.status === "pending")
                                .map((t) => t.id),
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

      <TipEntryDaySidebar
        selection={selection}
        onClose={() => setSelection(null)}
        onUpdateTip={onUpdateTip}
        canApprove={canApprove}
      />
    </div>
  );
}
