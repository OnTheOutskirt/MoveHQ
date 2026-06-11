"use client";

import { formatJobDayDate } from "@/lib/moves/job-days-plan";
import { jobDayStatusConfig, jobDayStatusLabel } from "@/lib/moves/job-days";
import { jobDayLocationLines, serviceLabel } from "@/lib/moves/job-day-display";
import type { JobDayDispatchDisplay } from "@/lib/moves/job-day-dispatch-display";
import type { MoveJobDay, MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { Calendar, FileText, MapPin, Truck, Users } from "lucide-react";

type MoveJobDayOpsCardProps = {
  move: MoveRecord;
  day: MoveJobDay;
  index: number;
  dispatch: JobDayDispatchDisplay;
};

export function MoveJobDayOpsCard({ move, day, index, dispatch }: MoveJobDayOpsCardProps) {
  const locations = jobDayLocationLines(move, day);
  const services = day.services ?? [];
  const status = jobDayStatusConfig[day.status];

  return (
    <article className="flex w-[17.5rem] shrink-0 flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-white">
              {index + 1}
            </span>
            <p className="truncate text-sm font-semibold text-slate-900">{day.label}</p>
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-700">
            <Calendar className="h-3 w-3 shrink-0 text-slate-400" />
            {formatJobDayDate(day.date)}
            {day.arrivalWindow ? ` · ${day.arrivalWindow}` : ""}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            status.badge,
          )}
        >
          {jobDayStatusLabel(day.status)}
        </span>
      </div>

      {services.length > 0 ? (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {services.map((s) => (
            <span
              key={s}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700"
            >
              {serviceLabel(s)}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-2.5 space-y-1 text-[11px] leading-snug text-slate-700">
        <p className="line-clamp-2">
          <MapPin className="mr-0.5 inline h-3 w-3 shrink-0 text-slate-400" />
          <span className="font-medium text-slate-500">From </span>
          {locations.origin}
        </p>
        <p className="line-clamp-2">
          <MapPin className="mr-0.5 inline h-3 w-3 shrink-0 text-emerald-600" />
          <span className="font-medium text-slate-500">To </span>
          {locations.destination}
        </p>
      </div>

      <div className="mt-2.5 grid grid-cols-1 gap-2 border-t border-slate-100 pt-2 text-[11px]">
        <div>
          <p className="font-semibold uppercase tracking-wide text-slate-400">
            Crew
            {dispatch.crewFromDispatch ? (
              <span className="ml-1 font-normal normal-case text-brand-600">· dispatch</span>
            ) : null}
          </p>
          <p className="mt-0.5 inline-flex items-start gap-1 font-medium text-slate-800">
            <Users className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
            <span className="line-clamp-2">{dispatch.crewLine ?? "Not assigned"}</span>
          </p>
        </div>
        <div>
          <p className="font-semibold uppercase tracking-wide text-slate-400">
            Truck{dispatch.truckLine?.includes(",") ? "s" : ""}
            {dispatch.trucksFromDispatch ? (
              <span className="ml-1 font-normal normal-case text-brand-600">· dispatch</span>
            ) : null}
          </p>
          <p className="mt-0.5 inline-flex items-start gap-1 font-medium text-slate-800">
            <Truck className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
            <span className="line-clamp-2">{dispatch.truckLine ?? "Not assigned"}</span>
          </p>
        </div>
      </div>

      {day.dispatchNotes ? (
        <p className="mt-2 rounded-md bg-amber-50 px-2 py-1.5 text-[10px] leading-snug text-amber-950">
          {day.dispatchNotes}
        </p>
      ) : null}

      <div className="mt-auto pt-2.5">
        <div className="rounded-md border border-dashed border-slate-200 px-2 py-2 text-center">
          <FileText className="mx-auto h-4 w-4 text-slate-400" />
          <p className="mt-1 text-[10px] font-medium text-slate-600">BOL / day contract</p>
          <p className="text-[9px] text-slate-400">Coming soon</p>
        </div>
        {day.hoursActual != null ? (
          <p className="mt-2 text-[10px] text-slate-500">
            Actual {day.hoursActual} hr
            {day.hoursEstimated != null ? ` · est. ${day.hoursEstimated}` : ""}
          </p>
        ) : null}
      </div>
    </article>
  );
}
