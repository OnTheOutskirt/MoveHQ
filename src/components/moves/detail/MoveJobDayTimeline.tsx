"use client";

import { jobDayStatusConfig, jobDayStatusLabel } from "@/lib/moves/job-days";
import type { MoveJobDay, MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { formatMoveDate } from "@/lib/moves/format";
import { Calendar, Clock, MapPin, Truck, Users } from "lucide-react";

const SERVICE_LABELS: Record<string, string> = {
  packing: "Packing",
  moving: "Moving",
  unpacking: "Unpacking",
  storage: "Storage",
  junk_removal: "Junk removal",
};

function JobDayCard({ day, index }: { day: MoveJobDay; index: number }) {
  const statusStyle = jobDayStatusConfig[day.status];

  return (
    <article className="relative flex gap-4 pb-8 last:pb-0">
      <div className="flex flex-col items-center">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
          {index + 1}
        </span>
        <span className="mt-1 w-px flex-1 bg-slate-200" aria-hidden />
      </div>
      <div className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{day.label}</h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-600">
              <Calendar className="h-3.5 w-3.5" />
              {formatMoveDate(day.date)}
              {day.arrivalWindow ? ` · ${day.arrivalWindow}` : null}
            </p>
          </div>
          <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", statusStyle.badge)}>
            {jobDayStatusLabel(day.status)}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {day.services?.map((s) => (
            <span
              key={s}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
            >
              {SERVICE_LABELS[s] ?? s}
            </span>
          ))}
        </div>

        <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
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
          {day.durationLabel ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-400" />
              {day.durationLabel}
            </span>
          ) : null}
          {day.hoursEstimated != null ? (
            <span>{day.hoursEstimated} hrs estimated</span>
          ) : null}
        </div>

        {(day.originNote || day.destinationNote) && (
          <div className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <MapPin className="mb-1 inline h-3.5 w-3.5 text-slate-400" />
            {day.originNote && <p>{day.originNote}</p>}
            {day.destinationNote && <p className="mt-0.5">{day.destinationNote}</p>}
            {day.stopsNote && <p className="mt-0.5 text-slate-500">{day.stopsNote}</p>}
          </div>
        )}

        {day.dispatchNotes ? (
          <p className="mt-2 text-xs text-slate-500">
            <span className="font-medium">Dispatch:</span> {day.dispatchNotes}
          </p>
        ) : null}
        {day.accessNotes ? (
          <p className="mt-1 text-xs text-amber-800">
            <span className="font-medium">Access:</span> {day.accessNotes}
          </p>
        ) : null}
      </div>
    </article>
  );
}

type MoveJobDayTimelineProps = {
  move: MoveRecord;
};

export function MoveJobDayTimeline({ move }: MoveJobDayTimelineProps) {
  const days = [...move.jobDays].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  if (days.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
        <p className="text-sm font-medium text-slate-900">No job days on the timeline yet</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
          Plan job days in Quote &amp; Contract before sending the proposal — packing, load,
          delivery, and storage all live on this move.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 lg:p-6">
      <p className="mb-4 text-xs text-slate-500">Job days for this move</p>
      {days.map((day, i) => (
        <JobDayCard key={day.id} day={day} index={i} />
      ))}
    </div>
  );
}
