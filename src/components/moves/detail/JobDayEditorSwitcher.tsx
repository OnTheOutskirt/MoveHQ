"use client";

import { formatJobDayDate } from "@/lib/moves/job-days-plan";
import type { JobDayFormValues } from "@/lib/moves/job-day-form";
import type { MoveJobDay } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { Calendar, Plus } from "lucide-react";

function moversFromForm(values: JobDayFormValues): string {
  const n = parseInt(values.crewSize.trim(), 10);
  if (Number.isNaN(n) || values.crewSize.trim() === "") return "TBD";
  return `${n} mover${n === 1 ? "" : "s"}`;
}

function trucksFromForm(values: JobDayFormValues): string {
  const n = parseInt(values.truckCount.trim(), 10);
  if (Number.isNaN(n) || values.truckCount.trim() === "") return "TBD";
  return `${n} truck${n === 1 ? "" : "s"}`;
}

type SwitcherCardProps = {
  label: string;
  dateLabel: string;
  crewTruckLine: string;
  active: boolean;
  onClick: () => void;
  isNew?: boolean;
};

function SwitcherCard({
  label,
  dateLabel,
  crewTruckLine,
  active,
  onClick,
  isNew,
}: SwitcherCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-[6.75rem] shrink-0 flex-col rounded-md border px-2 py-1.5 text-left transition-colors",
        active
          ? "border-brand-400 bg-brand-50 shadow-sm ring-1 ring-brand-200"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
        isNew && !active && "border-dashed",
      )}
    >
      <span
        className={cn(
          "truncate text-[10px] font-semibold leading-tight",
          active ? "text-brand-900" : "text-slate-800",
        )}
      >
        {label}
      </span>
      <span className="mt-0.5 flex items-center gap-0.5 truncate text-[10px] text-slate-600">
        <Calendar className="h-2.5 w-2.5 shrink-0 text-slate-400" />
        <span className="truncate">{dateLabel}</span>
      </span>
      <p className="mt-1 truncate text-[9px] leading-tight text-slate-500">{crewTruckLine}</p>
    </button>
  );
}

function crewTruckLineFromForm(values: JobDayFormValues): string {
  return `${moversFromForm(values)} · ${trucksFromForm(values)}`;
}

type JobDayEditorSwitcherProps = {
  days: MoveJobDay[];
  newDayKeys: string[];
  activeKey: string;
  /** Resolved form for the active tab only. */
  activeValues: JobDayFormValues;
  resolveCardValues: (key: string) => JobDayFormValues;
  resolveDayLabel: (key: string) => string;
  onSelect: (key: string) => void;
  onAddAnother?: () => void;
  atDayCap?: boolean;
};

export function JobDayEditorSwitcher({
  days,
  newDayKeys,
  activeKey,
  activeValues,
  resolveCardValues,
  resolveDayLabel,
  onSelect,
  onAddAnother,
  atDayCap,
}: JobDayEditorSwitcherProps) {
  const showStrip = days.length > 0 || newDayKeys.length > 0 || onAddAnother;
  if (!showStrip) return null;

  return (
    <div className="-mx-1 mb-4 border-b border-slate-100 pb-3">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Job days</p>
        {atDayCap ? (
          <p className="text-[10px] text-slate-400">Max 10 days</p>
        ) : null}
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        {days.map((day) => {
          const cardValues = activeKey === day.id ? activeValues : resolveCardValues(day.id);
          const dateLabel = cardValues.date
            ? formatJobDayDate(cardValues.date)
            : day.date
              ? formatJobDayDate(day.date)
              : "No date";

          return (
            <SwitcherCard
              key={day.id}
              label={resolveDayLabel(day.id)}
              dateLabel={dateLabel}
              crewTruckLine={crewTruckLineFromForm(cardValues)}
              active={activeKey === day.id}
              onClick={() => onSelect(day.id)}
            />
          );
        })}

        {newDayKeys.map((key) => {
          const cardValues = activeKey === key ? activeValues : resolveCardValues(key);
          return (
            <SwitcherCard
              key={key}
              label={resolveDayLabel(key)}
              dateLabel={
                cardValues.date ? formatJobDayDate(cardValues.date) : "Set date"
              }
              crewTruckLine={crewTruckLineFromForm(cardValues)}
              active={activeKey === key}
              onClick={() => onSelect(key)}
              isNew
            />
          );
        })}

        {onAddAnother && !atDayCap ? (
          <button
            type="button"
            onClick={onAddAnother}
            title="Add another day"
            className="flex h-[3.25rem] w-[6.75rem] shrink-0 flex-col items-center justify-center gap-0.5 rounded-md border border-dashed border-slate-300 bg-slate-50/80 text-[10px] font-medium text-slate-600 transition-colors hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-800"
          >
            <Plus className="h-3.5 w-3.5" />
            Add day
          </button>
        ) : null}
      </div>
    </div>
  );
}
