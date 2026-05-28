"use client";

import { usePlanningSchedule } from "@/components/planning/PlanningScheduleProvider";
import { GANTT_STREAMS } from "@/lib/planning/roadmap-data";
import type { GanttBar } from "@/lib/planning/types";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";

const DAY_MS = 86_400_000;

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

function barStyle(bar: GanttBar, rangeStart: Date, totalDays: number) {
  const start = parseDate(bar.start);
  const end = parseDate(bar.end);
  const left = daysBetween(rangeStart, start);
  const width = daysBetween(start, end) + 1;
  return {
    left: `${(left / totalDays) * 100}%`,
    width: `${(width / totalDays) * 100}%`,
  };
}

function formatWeekLabel(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDayHoverLabel(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function weekStartsInRange(rangeStart: Date, rangeEnd: Date): Date[] {
  const weeks: Date[] = [];
  const cursor = new Date(rangeStart);
  const day = cursor.getDay();
  const toMonday = day === 0 ? -6 : 1 - day;
  cursor.setDate(cursor.getDate() + toMonday);
  if (cursor < rangeStart) cursor.setDate(cursor.getDate() + 7);

  while (cursor <= rangeEnd) {
    weeks.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 7);
  }
  return weeks;
}

function monthsInRange(planStart: string, planEnd: string) {
  const start = parseDate(planStart);
  const end = parseDate(planEnd);
  const months: { label: string; start: string; end: string }[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);

  while (cursor <= end) {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const monthStart = new Date(y, m, 1);
    const monthEnd = new Date(y, m + 1, 0);
    const clipStart = monthStart < start ? start : monthStart;
    const clipEnd = monthEnd > end ? end : monthEnd;
    months.push({
      label: clipStart.toLocaleDateString("en-US", { month: "long" }),
      start: clipStart.toISOString().slice(0, 10),
      end: clipEnd.toISOString().slice(0, 10),
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

function isBlockedBar(bar: GanttBar): boolean {
  return bar.stream === "blocked";
}

export function PlanningGantt() {
  const { ganttBars, planStart, planEnd } = usePlanningSchedule();
  const rangeStart = parseDate(planStart);
  const rangeEnd = parseDate(planEnd);
  const totalDays = daysBetween(rangeStart, rangeEnd) + 1;
  const dayWidth = 4;
  const chartWidth = totalDays * dayWidth;
  const weeks = weekStartsInRange(rangeStart, rangeEnd);
  const months = monthsInRange(planStart, planEnd);

  const [hoverDay, setHoverDay] = useState<Date | null>(null);

  const hoverLeftPct =
    hoverDay !== null ? (daysBetween(rangeStart, hoverDay) / totalDays) * 100 : null;

  const resolveDayFromPointer = useCallback(
    (clientX: number, el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0) return null;
      const x = clientX - rect.left;
      const ratio = Math.min(1, Math.max(0, x / rect.width));
      const dayIndex = Math.min(totalDays - 1, Math.floor(ratio * totalDays));
      return addDays(rangeStart, dayIndex);
    },
    [rangeStart, totalDays],
  );

  const onTimelinePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      setHoverDay(resolveDayFromPointer(e.clientX, e.currentTarget));
    },
    [resolveDayFromPointer],
  );

  const onTimelinePointerLeave = useCallback(() => {
    setHoverDay(null);
  }, []);

  const legendStreams = Object.entries(GANTT_STREAMS).filter(([key]) => key !== "blocked");

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Gantt chart</p>
          <p className="text-xs text-slate-500">
            Dates sync from the timeline table · launch target September 1 · hover for day
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {legendStreams.map(([key, stream]) => (
            <span key={key} className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className={cn("h-2.5 w-2.5 rounded-sm", stream.color)} />
              {stream.label}
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div style={{ minWidth: chartWidth + 200 }}>
          {/* Month headings */}
          <div className="flex border-b border-slate-200">
            <div className="sticky left-0 z-20 w-[200px] shrink-0 border-r border-slate-100 bg-slate-50" />
            <div
              className="relative flex-1 cursor-crosshair bg-slate-100/80"
              style={{ width: chartWidth, height: 32 }}
              onPointerMove={onTimelinePointerMove}
              onPointerLeave={onTimelinePointerLeave}
            >
              {months.map((month) => {
                const mStart = parseDate(month.start);
                const mEnd = parseDate(month.end);
                const left = (daysBetween(rangeStart, mStart) / totalDays) * 100;
                const width = ((daysBetween(mStart, mEnd) + 1) / totalDays) * 100;
                return (
                  <div
                    key={month.start}
                    className="absolute inset-y-0 flex items-center justify-center border-r border-slate-200/80 text-sm font-bold text-slate-800"
                    style={{ left: `${left}%`, width: `${width}%` }}
                  >
                    {month.label} 2026
                  </div>
                );
              })}
              {hoverLeftPct !== null && hoverDay ? (
                <>
                  <div
                    className="pointer-events-none absolute inset-y-0 z-10 w-px bg-brand-500"
                    style={{ left: `${hoverLeftPct}%` }}
                  />
                  <div
                    className="pointer-events-none absolute top-1 z-20 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-0.5 text-[10px] font-medium text-white shadow"
                    style={{ left: `${hoverLeftPct}%` }}
                  >
                    {formatDayHoverLabel(hoverDay)}
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* Week row */}
          <div className="flex border-b border-slate-100">
            <div className="sticky left-0 z-20 w-[200px] shrink-0 border-r border-slate-100 bg-white py-0.5 pl-3 text-[10px] font-medium text-slate-400">
              Weeks
            </div>
            <div
              className="relative flex-1 cursor-crosshair"
              style={{ width: chartWidth, height: 24 }}
              onPointerMove={onTimelinePointerMove}
              onPointerLeave={onTimelinePointerLeave}
            >
              {weeks.map((weekStart) => {
                const left = (daysBetween(rangeStart, weekStart) / totalDays) * 100;
                const nextWeek = new Date(weekStart);
                nextWeek.setDate(nextWeek.getDate() + 7);
                const width = Math.min(
                  (daysBetween(weekStart, nextWeek) / totalDays) * 100,
                  100 - left,
                );
                return (
                  <div
                    key={weekStart.toISOString()}
                    className="absolute top-0 border-r border-slate-100 py-0.5 text-center text-[9px] text-slate-500"
                    style={{ left: `${left}%`, width: `${width}%` }}
                  >
                    {formatWeekLabel(weekStart)}
                  </div>
                );
              })}
              {hoverLeftPct !== null && hoverDay ? (
                <div
                  className="pointer-events-none absolute inset-y-0 z-10 w-px bg-brand-500/70"
                  style={{ left: `${hoverLeftPct}%` }}
                />
              ) : null}
            </div>
          </div>

          {/* Day hover row — shows the active day label while moving over the chart */}
          <div className="flex border-b border-slate-50">
            <div className="sticky left-0 z-20 w-[200px] shrink-0 border-r border-slate-100 bg-white py-0.5 pl-3 text-[10px] font-medium text-slate-400">
              Day
            </div>
            <div
              className="relative flex-1 cursor-crosshair bg-white"
              style={{ width: chartWidth, height: 18 }}
              onPointerMove={onTimelinePointerMove}
              onPointerLeave={onTimelinePointerLeave}
            >
              {hoverDay ? (
                <p
                  className="pointer-events-none absolute top-0.5 z-10 -translate-x-1/2 text-[9px] font-semibold text-brand-700"
                  style={{ left: `${hoverLeftPct}%` }}
                >
                  {hoverDay.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </p>
              ) : (
                <p className="px-1 py-0.5 text-[9px] text-slate-400">Hover chart for date</p>
              )}
            </div>
          </div>

          {/* Bars */}
          <div className="relative flex">
            <div className="sticky left-0 z-20 w-[200px] shrink-0 border-r border-slate-100 bg-white">
              {ganttBars.map((bar) => (
                <div
                  key={bar.id}
                  className={cn(
                    "flex h-8 items-center border-b border-slate-50 px-2 text-[11px] font-medium leading-tight",
                    isBlockedBar(bar) ? "text-slate-500" : "text-slate-800",
                  )}
                  title={bar.note}
                >
                  <span className="line-clamp-2">{bar.label}</span>
                </div>
              ))}
            </div>

            <div
              className="relative flex-1 cursor-crosshair"
              style={{ width: chartWidth, height: ganttBars.length * 32 }}
              onPointerMove={onTimelinePointerMove}
              onPointerLeave={onTimelinePointerLeave}
            >
              {hoverLeftPct !== null ? (
                <div
                  className="pointer-events-none absolute inset-y-0 z-[5] w-px bg-brand-400/60"
                  style={{ left: `${hoverLeftPct}%` }}
                />
              ) : null}

              {ganttBars.map((bar, rowIndex) => {
                const style = barStyle(bar, rangeStart, totalDays);
                const stream = GANTT_STREAMS[bar.stream];
                const blocked = isBlockedBar(bar);
                return (
                  <div
                    key={bar.id}
                    className="absolute h-8"
                    style={{ top: rowIndex * 32 + 4, ...style }}
                  >
                    <div
                      className={cn(
                        "mx-0.5 flex h-5 items-center overflow-hidden rounded px-1.5 text-[9px] font-medium shadow-sm",
                        blocked
                          ? "border border-slate-300 bg-slate-200 text-slate-600"
                          : cn(stream.color, "text-white"),
                      )}
                      title={`${bar.label} (${bar.start} → ${bar.end})${bar.note ? ` — ${bar.note}` : ""}`}
                    >
                      <span className="truncate">{bar.label}</span>
                    </div>
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
