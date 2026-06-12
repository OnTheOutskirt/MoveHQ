"use client";

import { useCalendarSettings } from "@/components/providers/CalendarSettingsProvider";
import { holdPillStyle, waitlistPillStyle } from "@/lib/calendar/color-styles";
import { formatJobDayDate } from "@/lib/moves/job-days-plan";
import {
  jobDayCrewLine,
  jobDayLocationLines,
  jobDayTruckLine,
  serviceLabel,
} from "@/lib/moves/job-day-display";
import { resolveDayFractionManualOverride } from "@/lib/moves/job-day-form";
import { fractionLabel, periodLabel } from "@/lib/day-share/labels";
import { isJobDayFirstStop, jobDaySharePeriod } from "@/lib/moves/job-day-schedule";
import type { MoveJobDay, MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { Calendar, Clock, Copy, MapPin, Pencil, Truck, Users } from "lucide-react";

type MoveJobDayHorizontalCardProps = {
  move: MoveRecord;
  day: MoveJobDay;
  index: number;
  onHold?: boolean;
  onWaitlist?: boolean;
  onEdit: () => void;
  onDuplicate: () => void;
};

export function MoveJobDayHorizontalCard({
  move,
  day,
  index,
  onHold = false,
  onWaitlist = false,
  onEdit,
  onDuplicate,
}: MoveJobDayHorizontalCardProps) {
  const { colors } = useCalendarSettings();
  const locations = jobDayLocationLines(move, day);
  const crew = jobDayCrewLine(day);
  const truck = jobDayTruckLine(day);
  const services = day.services ?? [];
  const hasPlacement = onHold || onWaitlist;
  const dayFractionOverridden = resolveDayFractionManualOverride(day);
  const cardAccentStyle = onHold
    ? {
        backgroundColor: colors.holdRowBg,
        borderColor: colors.holdBorder,
      }
    : onWaitlist
      ? {
          backgroundColor: colors.waitlistRowBg,
          borderColor: colors.waitlistBorder,
        }
      : undefined;

  return (
    <article
      className={cn(
        "flex w-[min(100%,17rem)] shrink-0 flex-col rounded-xl border p-3 shadow-sm sm:w-[17.5rem]",
        hasPlacement ? "border-2" : "border-slate-200 bg-white hover:border-brand-300 hover:shadow-md",
      )}
      style={cardAccentStyle}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="flex min-w-0 flex-1 items-center gap-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded-md"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-white">
            {index + 1}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{day.label}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-slate-700">
              <Calendar className="h-3 w-3 shrink-0 text-slate-400" />
              {formatJobDayDate(day.date)}
            </p>
            {day.departureWindow || day.arrivalWindow ? (
              <p className="mt-0.5 space-y-0.5 text-[10px] text-slate-600">
                {day.departureWindow ? (
                  <span className="flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5 shrink-0 text-slate-400" />
                    Crew {day.departureWindow}
                  </span>
                ) : null}
                {day.arrivalWindow ? (
                  <span className="flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5 shrink-0 text-slate-400" />
                    {day.arrivalWindow}
                  </span>
                ) : null}
              </p>
            ) : null}
            {hasPlacement ? (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {onHold ? (
                  <span
                    className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={holdPillStyle(colors)}
                  >
                    On hold
                  </span>
                ) : null}
                {onWaitlist ? (
                  <span
                    className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={waitlistPillStyle(colors)}
                  >
                    Waitlist
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </button>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={onDuplicate}
            title="Duplicate day"
            aria-label={`Duplicate ${day.label}`}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-brand-700"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onEdit}
            title="Edit day"
            aria-label={`Edit ${day.label}`}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onEdit}
        className="mt-2 flex flex-1 flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded-md"
      >

      {day.dayFraction && day.dayFraction !== "long" ? (
        <p className="mt-2 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-900">
          {!isJobDayFirstStop(day)
            ? "Follow-on"
            : periodLabel(jobDaySharePeriod(day))}{" "}
          · {fractionLabel(day.dayFraction)}
          {dayFractionOverridden ? " · Overridden" : null}
        </p>
      ) : dayFractionOverridden ? (
        <p className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-900">
          Day length overridden
        </p>
      ) : null}

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
      ) : (
        <p className="mt-2 text-[10px] text-slate-400">No services selected</p>
      )}

      <div className="mt-2.5 space-y-1 text-[11px] leading-snug text-slate-700">
        <p className="line-clamp-2">
          <MapPin className="mr-0.5 inline h-3 w-3 shrink-0 text-slate-400" />
          <span className="font-medium text-slate-500">From </span>
          {locations.origin}
        </p>
        {locations.stops ? (
          <p className="line-clamp-1 pl-[1.125rem] text-slate-600">
            <span className="font-medium text-slate-500">Stops </span>
            {locations.stops}
          </p>
        ) : null}
        <p className="line-clamp-2">
          <MapPin className="mr-0.5 inline h-3 w-3 shrink-0 text-emerald-600" />
          <span className="font-medium text-slate-500">To </span>
          {locations.destination}
        </p>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-2 text-[11px]">
        <div>
          <p className="font-semibold uppercase tracking-wide text-slate-400">Movers</p>
          <p className="mt-0.5 inline-flex items-start gap-1 font-medium text-slate-800">
            <Users className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
            <span className="line-clamp-2">{crew ?? "TBD"}</span>
          </p>
        </div>
        <div>
          <p className="font-semibold uppercase tracking-wide text-slate-400">Trucks</p>
          <p className="mt-0.5 inline-flex items-start gap-1 font-medium text-slate-800">
            <Truck className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
            <span className="line-clamp-2">{truck ?? "TBD"}</span>
          </p>
        </div>
      </div>
      </button>
    </article>
  );
}
