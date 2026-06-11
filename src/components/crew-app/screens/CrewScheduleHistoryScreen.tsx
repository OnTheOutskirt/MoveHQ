"use client";

import { CrewHistoryJobDisputeForm } from "@/components/crew-app/CrewHistoryJobDisputeForm";
import { useCrewApp } from "@/components/crew-app/CrewAppProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import {
  crewScheduleTodayKey,
  summarizeWeek,
  weekStartKeyForDate,
} from "@/lib/crew-app/crew-history";
import { formatCrewJobPrice } from "@/lib/crew-app/mock-jobs";
import { formatMoveDate } from "@/lib/moves/format";
import { cn } from "@/lib/utils";
import { ChevronLeft, Clock, DollarSign } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type CrewScheduleHistoryScreenProps = {
  weekStartKey: string;
};

export function CrewScheduleHistoryScreen({ weekStartKey }: CrewScheduleHistoryScreenProps) {
  const { myJobs, crewPath, isClientReady } = useCrewApp();
  const { settings } = useSettings();
  const weekStartsOn = settings.company.weekStartsOn ?? "monday";
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const summary = useMemo(
    () => summarizeWeek(myJobs, weekStartKey, weekStartsOn),
    [myJobs, weekStartKey, weekStartsOn],
  );

  const backHref = isClientReady ? crewPath("/crew/schedule") : "/crew/schedule";

  return (
    <div className="space-y-4">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm font-medium text-brand-700"
      >
        <ChevronLeft className="h-4 w-4" />
        Schedule
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">{summary.label}</h1>
        <p className="mt-0.5 text-xs text-slate-500">
          {formatMoveDate(summary.weekStartKey)} – {formatMoveDate(summary.weekEndKey)}
        </p>
        <div className="mt-3 flex gap-6">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-brand-600" />
            <span className="font-semibold tabular-nums">{summary.totalHours}h</span>
            <span className="text-slate-500">logged</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            <span className="font-semibold tabular-nums">${summary.totalTips}</span>
            <span className="text-slate-500">tips (est.)</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Tips finalize in payroll — use message ops on a job if something looks wrong.
        </p>
      </div>

      {summary.jobs.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500">
          No jobs in this week yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {summary.jobs.map(({ job, hours, tips }) => {
            const expanded = expandedJobId === job.id;
            const isToday = job.dateKey === crewScheduleTodayKey();
            return (
              <li
                key={job.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setExpandedJobId(expanded ? null : job.id)}
                  className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{job.customerName}</p>
                    <p className="text-xs text-slate-500">
                      {formatMoveDate(job.dateKey)}
                      {isToday ? " · Today" : ""} · {job.moveRef}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      {hours > 0 ? `${hours}h` : "No time logged"} · ${tips} tips ·{" "}
                      {formatCrewJobPrice(job)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-xs font-medium",
                      expanded ? "text-brand-700" : "text-slate-400",
                    )}
                  >
                    {expanded ? "Hide" : "Details"}
                  </span>
                </button>
                {expanded ? (
                  <div className="border-t border-slate-100 px-4 pb-4 pt-2">
                    <p className="text-xs text-slate-600">{job.dayLabel}</p>
                    {job.arrivalWindow ? (
                      <p className="mt-1 text-xs text-slate-500">Arrival {job.arrivalWindow}</p>
                    ) : null}
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                      {job.origin} → {job.destination}
                    </p>
                    <CrewHistoryJobDisputeForm job={job} hours={hours} tips={tips} />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
