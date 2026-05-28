"use client";

import { hasConfirmedJobDays, hasProposedJobDays } from "@/lib/moves/move-lifecycle";
import { getSuggestedJobDays } from "@/lib/moves/move-workspace";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { CalendarPlus } from "lucide-react";

type MoveScheduleStripProps = {
  move: MoveRecord;
  onOpenSchedule?: () => void;
};

export function MoveScheduleStrip({ move, onOpenSchedule }: MoveScheduleStripProps) {
  const days = getSuggestedJobDays(move);
  const proposedOnly = hasProposedJobDays(move) && !hasConfirmedJobDays(move);
  const title = proposedOnly
    ? "Proposed job plan (on quote)"
    : move.jobDays.length > 0
      ? "Job days"
      : "Suggested job plan";

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">
            {proposedOnly
              ? "Planned during quoting — confirm on calendar after booking"
              : "Job days timeline — operational backbone"}
          </p>
        </div>
        {onOpenSchedule ? (
          <button
            type="button"
            onClick={onOpenSchedule}
            className="text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            Move plan →
          </button>
        ) : null}
      </div>

      <ul className="divide-y divide-slate-100 px-4 py-2">
        {days.map((day) => {
          const jobDay = move.jobDays.find((j) => j.id === day.id);
          const isProposed = jobDay?.status === "proposed";
          const isConfirmed =
            jobDay &&
            jobDay.status !== "proposed" &&
            jobDay.status !== "cancelled";
          const isCancelled = jobDay?.status === "cancelled";

          return (
            <li key={day.id} className="flex gap-3 py-3">
              <span
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold",
                  isConfirmed
                    ? "border-brand-600 bg-brand-50 text-brand-700"
                    : isProposed
                      ? "border-violet-400 bg-violet-50 text-violet-700"
                      : isCancelled
                        ? "border-slate-200 bg-slate-50 text-slate-400"
                        : "border-slate-300 bg-white text-slate-400",
                )}
              >
                {isCancelled ? "×" : isConfirmed ? "●" : "○"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{day.label}</p>
                <p className="text-xs text-slate-500">
                  {day.dateHint ?? "TBD"}
                  {day.recommendation ? ` · ${day.recommendation}` : null}
                </p>
              </div>
              {isProposed ? (
                <span className="shrink-0 self-center rounded bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-800">
                  Proposed
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>

      {proposedOnly && days.length > 0 ? (
        <div className="border-t border-slate-100 bg-violet-50/50 px-4 py-3">
          <p className="text-xs text-violet-900">
            Job days are part of the quote. After deposit, confirm each day on the calendar.
          </p>
        </div>
      ) : null}
    </section>
  );
}
