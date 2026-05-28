"use client";

import {
  DAY_BEFORE_CONFIRMATION_LABELS,
  resolveDayBeforeConfirmation,
  type DayBeforeConfirmation,
  type DayBeforeConfirmationStatus,
} from "@/lib/dispatch/day-before-confirmation";
import { readConfirmationOverride, writeConfirmationOverride, subscribeConfirmationStore } from "@/lib/dispatch/confirmation-storage";
import type { DispatchJob } from "@/lib/dispatch/types";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export const DAY_BEFORE_CONFIRMATION_PILL_STYLES: Record<DayBeforeConfirmationStatus, string> = {
  confirmed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  pending: "border-amber-200 bg-amber-50 text-amber-900",
  attempted: "border-sky-200 bg-sky-50 text-sky-900",
  not_due: "border-slate-200 bg-slate-100 text-slate-600",
};

type DayBeforeConfirmationPillProps = {
  jobId: string;
  confirmation: DayBeforeConfirmation;
  onOverrideChange?: (status: DayBeforeConfirmationStatus | null) => void;
  /** Smaller text on dispatch cards */
  compact?: boolean;
  className?: string;
};

function useConfirmationOverride(jobId: string | undefined) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!jobId) return;
    return subscribeConfirmationStore(() => setTick((n) => n + 1));
  }, [jobId]);

  return useMemo(
    () => (jobId ? readConfirmationOverride(jobId) : null),
    [jobId, tick],
  );
}

export function useDayBeforeConfirmationForJob(
  job: DispatchJob | undefined,
  move?: MoveRecord,
) {
  const override = useConfirmationOverride(job?.id);

  const confirmation = useMemo(() => {
    if (!job) return null;
    return resolveDayBeforeConfirmation(job.date, {
      move,
      jobDayId: job.jobDayId,
      jobId: job.id,
      override,
    });
  }, [job, move, override]);

  function setOverride(status: DayBeforeConfirmationStatus | null) {
    if (!job) return;
    writeConfirmationOverride(job.id, status);
  }

  return { confirmation, setOverride };
}

export function DayBeforeConfirmationPill({
  jobId,
  confirmation,
  onOverrideChange,
  compact = false,
  className,
}: DayBeforeConfirmationPillProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const label = DAY_BEFORE_CONFIRMATION_LABELS[confirmation.status];

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  function applyOverride(status: DayBeforeConfirmationStatus | null) {
    writeConfirmationOverride(jobId, status);
    onOverrideChange?.(status);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={cn("relative shrink-0", className)}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        title={confirmation.detail}
        className={cn(
          "inline-flex items-center gap-0.5 rounded-full border font-semibold uppercase tracking-wide transition-colors hover:opacity-90",
          compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-[11px]",
          DAY_BEFORE_CONFIRMATION_PILL_STYLES[confirmation.status],
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {label}
        <ChevronDown className={cn("opacity-60", compact ? "h-2.5 w-2.5" : "h-3 w-3")} />
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute right-0 z-20 mt-1 min-w-[9rem] rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {(
            [
              "confirmed",
              "attempted",
              "pending",
              "not_due",
            ] as DayBeforeConfirmationStatus[]
          ).map((status) => (
            <button
              key={status}
              type="button"
              role="option"
              aria-selected={confirmation.status === status}
              onClick={() => applyOverride(status)}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-slate-50",
                confirmation.status === status && "bg-slate-50 font-medium",
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full border",
                  DAY_BEFORE_CONFIRMATION_PILL_STYLES[status],
                )}
              />
              {DAY_BEFORE_CONFIRMATION_LABELS[status]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => applyOverride(null)}
            className="w-full border-t border-slate-100 px-3 py-1.5 text-left text-[11px] text-slate-500 hover:bg-slate-50"
          >
            Reset to auto
          </button>
        </div>
      ) : null}
    </div>
  );
}
