"use client";

import { formatJobDayDate } from "@/lib/moves/job-days-plan";
import { jobDayStatusConfig, jobDayStatusLabel } from "@/lib/moves/job-days";
import {
  jobDayCrewLine,
  jobDayLocationLines,
  jobDayTruckLine,
  serviceLabel,
} from "@/lib/moves/job-day-display";
import type { MoveJobDay, MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { Calendar, Clock, MapPin, Truck, Users } from "lucide-react";

type MoveJobDayCardProps = {
  move: MoveRecord;
  day: MoveJobDay;
  index: number;
};

export function MoveJobDayCard({ move, day, index }: MoveJobDayCardProps) {
  const statusStyle = jobDayStatusConfig[day.status];
  const isProposed = day.status === "proposed";
  const locations = jobDayLocationLines(move, day);
  const crew = jobDayCrewLine(day);
  const truck = jobDayTruckLine(day);

  return (
    <li
      className={cn(
        "rounded-lg border bg-white p-4",
        isProposed ? "border-violet-200 bg-violet-50/30" : "border-slate-200",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[11px] font-bold text-white">
            {index + 1}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900">{day.label}</p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatJobDayDate(day.date)}
              </span>
              {day.departureWindow ? (
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <Clock className="h-3 w-3" />
                  Crew {day.departureWindow}
                </span>
              ) : null}
              {day.arrivalWindow ? (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Arrive {day.arrivalWindow}
                </span>
              ) : null}
              {day.durationLabel ? <span>{day.durationLabel}</span> : null}
            </p>
          </div>
        </div>
        <span
          className={cn("shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold", statusStyle.badge)}
        >
          {jobDayStatusLabel(day.status)}
        </span>
      </div>

      {day.services && day.services.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1">
          {day.services.map((s) => (
            <span
              key={s}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700"
            >
              {serviceLabel(s)}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-3 space-y-1.5 rounded-md border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs text-slate-700">
        <p className="inline-flex items-start gap-1.5">
          <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
          <span>
            <span className="font-medium text-slate-500">From </span>
            {locations.origin}
          </span>
        </p>
        {locations.stops ? (
          <p className="pl-[1.125rem] text-slate-600">
            <span className="font-medium text-slate-500">Stops </span>
            {locations.stops}
          </p>
        ) : null}
        <p className="inline-flex items-start gap-1.5">
          <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
          <span>
            <span className="font-medium text-slate-500">To </span>
            {locations.destination}
          </span>
        </p>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-md border border-slate-100 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Crew</p>
          <p className="mt-0.5 inline-flex items-center gap-1 text-sm text-slate-800">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            {crew ?? (isProposed ? "Proposed crew TBD" : "Unassigned")}
          </p>
          {day.hoursEstimated != null ? (
            <p className="mt-0.5 text-xs text-slate-500">Est. {day.hoursEstimated} hrs</p>
          ) : null}
        </div>
        <div className="rounded-md border border-slate-100 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Trucks</p>
          <p className="mt-0.5 inline-flex items-center gap-1 text-sm text-slate-800">
            <Truck className="h-3.5 w-3.5 text-slate-400" />
            {truck ?? (isProposed ? "Proposed truck TBD" : "Unassigned")}
          </p>
        </div>
      </div>

      {day.dispatchNotes ? (
        <p className="mt-2 text-xs text-slate-600">
          <span className="font-medium">Dispatch: </span>
          {day.dispatchNotes}
        </p>
      ) : null}
      {day.accessNotes ? (
        <p className="mt-1 text-xs text-amber-800">{day.accessNotes}</p>
      ) : null}
      {day.customerNotes ? (
        <p className="mt-1 text-xs text-slate-500">
          <span className="font-medium">Client: </span>
          {day.customerNotes}
        </p>
      ) : null}
    </li>
  );
}
