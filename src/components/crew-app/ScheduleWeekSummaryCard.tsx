"use client";

import { useCrewApp } from "@/components/crew-app/CrewAppProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import {
  crewScheduleTodayKey,
  listHistoryWeeks,
  summarizeWeek,
  weekStartKeyForDate,
} from "@/lib/crew-app/crew-history";
import { cn } from "@/lib/utils";
import { CalendarRange, ChevronRight, Clock, DollarSign } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export function ScheduleWeekSummaryCard() {
  const { myJobs, crewPath, isClientReady, session } = useCrewApp();
  const { settings } = useSettings();
  const weekStartsOn = settings.company.weekStartsOn ?? "monday";
  const [weekPickerOpen, setWeekPickerOpen] = useState(false);

  const currentWeekStart = useMemo(
    () => weekStartKeyForDate(crewScheduleTodayKey(), weekStartsOn),
    [weekStartsOn],
  );

  const summary = useMemo(
    () => summarizeWeek(myJobs, currentWeekStart, weekStartsOn),
    [myJobs, currentWeekStart, weekStartsOn],
  );

  const otherWeeks = useMemo(
    () => listHistoryWeeks(myJobs, weekStartsOn).filter((k) => k !== currentWeekStart),
    [myJobs, weekStartsOn, currentWeekStart],
  );

  const detailHref = isClientReady
    ? crewPath(`/crew/schedule/history?week=${currentWeekStart}`)
    : `/crew/schedule/history?week=${currentWeekStart}`;

  return (
    <section className="relative">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          This week
        </h2>
        {otherWeeks.length > 0 ? (
          <button
            type="button"
            onClick={() => setWeekPickerOpen((v) => !v)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
            aria-label="Previous weeks"
            aria-expanded={weekPickerOpen}
          >
            <CalendarRange className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {weekPickerOpen ? (
        <div className="absolute right-0 top-8 z-20 min-w-[12rem] rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Previous weeks
          </p>
          {otherWeeks.map((weekKey) => {
            const label = summarizeWeek(myJobs, weekKey, weekStartsOn).label;
            const href = isClientReady
              ? crewPath(`/crew/schedule/history?week=${weekKey}`)
              : `/crew/schedule/history?week=${weekKey}`;
            return (
              <Link
                key={weekKey}
                href={href}
                onClick={() => setWeekPickerOpen(false)}
                className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                {label}
              </Link>
            );
          })}
        </div>
      ) : null}

      <Link
        href={detailHref}
        className="group block overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition active:scale-[0.99]"
      >
        <div className="bg-gradient-to-br from-slate-50 to-white px-4 py-3.5">
          <p className="text-sm font-semibold text-slate-900">Time & tips overview</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {session.name} · {summary.label}
          </p>
          <div className="mt-3 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                <Clock className="h-4 w-4" />
              </span>
              <div>
                <p className="text-lg font-semibold tabular-nums leading-none text-slate-900">
                  {summary.totalHours}h
                </p>
                <p className="text-[10px] text-slate-500">logged</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                <DollarSign className="h-4 w-4" />
              </span>
              <div>
                <p className="text-lg font-semibold tabular-nums leading-none text-slate-900">
                  ${summary.totalTips}
                </p>
                <p className="text-[10px] text-slate-500">tips (est.)</p>
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {summary.jobCount === 0
              ? "No completed days yet this week."
              : `${summary.jobCount} job${summary.jobCount === 1 ? "" : "s"} · tap for breakdown`}
          </p>
        </div>
        <div
          className={cn(
            "flex items-center justify-between border-t border-slate-100 px-4 py-2.5 text-xs font-semibold",
            "text-brand-700 group-hover:bg-brand-50/50",
          )}
        >
          View jobs & details
          <ChevronRight className="h-4 w-4" />
        </div>
      </Link>
    </section>
  );
}
