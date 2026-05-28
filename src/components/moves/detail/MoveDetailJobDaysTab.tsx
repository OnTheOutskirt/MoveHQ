"use client";

import { Button } from "@/components/ui/Button";
import { formatMoveDate } from "@/lib/moves/format";
import { jobDayStatusLabel, jobDayStatusConfig } from "@/lib/moves/job-days";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { Calendar, Plus, Truck, Users } from "lucide-react";
import Link from "next/link";

type MoveDetailJobDaysTabProps = {
  move: MoveRecord;
};

export function MoveDetailJobDaysTab({ move }: MoveDetailJobDaysTabProps) {
  const { jobDays, status } = move;

  if (jobDays.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
        <Calendar className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-900">No job days yet</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
          {status === "booked"
            ? "Add job days when scheduling crew and trucks on the calendar."
            : "Plan job days in Quote & Contract before sending the quote — one move can span packing, load, and delivery."}
        </p>
        <Button type="button" size="sm" className="mt-4" disabled title="Coming soon">
          <Plus className="h-4 w-4" />
          Add job day
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-600">
          This move has <strong className="text-slate-900">{jobDays.length}</strong> scheduled job{" "}
          {jobDays.length === 1 ? "day" : "days"}.
        </p>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="secondary" disabled title="Coming soon">
            <Plus className="h-4 w-4" />
            Add day
          </Button>
          <Link
            href="/calendar"
            className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Open calendar
          </Link>
        </div>
      </div>

      <ul className="space-y-3">
        {jobDays.map((day, index) => {
          const statusStyle = jobDayStatusConfig[day.status];
          return (
            <li
              key={day.id}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-slate-500">Job day {index + 1}</p>
                  <p className="text-base font-semibold text-slate-900">{day.label}</p>
                  <p className="mt-0.5 text-sm text-slate-600">{formatMoveDate(day.date)}</p>
                </div>
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-xs font-medium",
                    statusStyle.badge,
                  )}
                >
                  {jobDayStatusLabel(day.status)}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                {day.crewSummary ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-slate-400" />
                    {day.crewSummary}
                  </span>
                ) : null}
                {day.truckSummary ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-slate-400" />
                    {day.truckSummary}
                  </span>
                ) : null}
                {day.hoursEstimated != null ? (
                  <span>{day.hoursEstimated} hrs est.</span>
                ) : null}
              </div>
              {day.notes ? (
                <p className="mt-2 text-sm text-slate-500">{day.notes}</p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
