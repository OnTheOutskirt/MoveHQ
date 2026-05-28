"use client";

import {
  effectiveRequirements,
  DISPATCH_CREW_SIZE_MAX,
  DISPATCH_CREW_SIZE_MIN,
  DISPATCH_TRUCKS_MAX,
  DISPATCH_TRUCKS_MIN,
} from "@/lib/dispatch/job-requirements";
import type { DispatchJob, DispatchJobAssignment } from "@/lib/dispatch/types";
import { cn } from "@/lib/utils";
import { Minus, Plus, RotateCcw } from "lucide-react";

type DispatchRequirementsEditorProps = {
  job: DispatchJob;
  assignment: DispatchJobAssignment;
  onCrewSizeChange: (size: number) => void;
  onTrucksNeededChange: (count: number) => void;
  onResetCrew?: () => void;
  onResetTrucks?: () => void;
  compact?: boolean;
  className?: string;
};

function Stepper({
  label,
  value,
  min,
  max,
  planned,
  overridden,
  onChange,
  onReset,
  compact,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  planned: number;
  overridden: boolean;
  onChange: (n: number) => void;
  onReset?: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-white",
        overridden ? "border-brand-200 ring-1 ring-brand-100" : "border-slate-200",
        compact ? "px-2 py-1.5" : "px-3 py-2",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        {overridden && onReset ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            className="inline-flex items-center gap-0.5 text-[10px] font-medium text-brand-600 hover:text-brand-800"
            title={`Reset to planned (${planned})`}
          >
            <RotateCcw className="h-3 w-3" />
            Planned {planned}
          </button>
        ) : (
          <span className="text-[10px] text-slate-400">Planned {planned}</span>
        )}
      </div>
      <div className="mt-1.5 flex items-center gap-1">
        <button
          type="button"
          disabled={value <= min}
          onClick={(e) => {
            e.stopPropagation();
            onChange(value - 1);
          }}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span
          className={cn(
            "min-w-[2rem] text-center font-semibold tabular-nums text-slate-900",
            compact ? "text-sm" : "text-base",
          )}
        >
          {value}
        </span>
        <button
          type="button"
          disabled={value >= max}
          onClick={(e) => {
            e.stopPropagation();
            onChange(value + 1);
          }}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function DispatchRequirementsEditor({
  job,
  assignment,
  onCrewSizeChange,
  onTrucksNeededChange,
  onResetCrew,
  onResetTrucks,
  compact = false,
  className,
}: DispatchRequirementsEditorProps) {
  const req = effectiveRequirements(job, assignment);

  return (
    <div
      className={cn("grid gap-2", compact ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2", className)}
      onClick={(e) => e.stopPropagation()}
    >
      <Stepper
        label="Crew size"
        value={req.crewSizeNeeded}
        min={DISPATCH_CREW_SIZE_MIN}
        max={DISPATCH_CREW_SIZE_MAX}
        planned={job.crewSizeNeeded}
        overridden={req.crewOverridden}
        onChange={onCrewSizeChange}
        onReset={req.crewOverridden ? onResetCrew : undefined}
        compact={compact}
      />
      <Stepper
        label="Trucks"
        value={req.trucksNeeded}
        min={DISPATCH_TRUCKS_MIN}
        max={DISPATCH_TRUCKS_MAX}
        planned={job.trucksNeeded}
        overridden={req.trucksOverridden}
        onChange={onTrucksNeededChange}
        onReset={req.trucksOverridden ? onResetTrucks : undefined}
        compact={compact}
      />
    </div>
  );
}
