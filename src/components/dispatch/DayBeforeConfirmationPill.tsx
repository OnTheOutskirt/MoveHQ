"use client";

import {
  DAY_BEFORE_CONFIRMATION_LABELS,
  DAY_BEFORE_CONFIRMATION_SELECTABLE_STATUSES,
  resolveDayBeforeConfirmation,
  type DayBeforeConfirmation,
  type DayBeforeConfirmationStatus,
} from "@/lib/dispatch/day-before-confirmation";
import { readConfirmationOverride, writeConfirmationOverride, subscribeConfirmationStore } from "@/lib/dispatch/confirmation-storage";
import type { DispatchJob } from "@/lib/dispatch/types";
import type { OpsJobDayRow } from "@/lib/operations/ops-jobs";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
  /** Tiny pill for schedule timeline blocks */
  micro?: boolean;
  className?: string;
};

function useConfirmationOverride(jobId: string | undefined) {
  const [override, setOverride] = useState<DayBeforeConfirmationStatus | null>(null);

  useEffect(() => {
    if (!jobId) {
      setOverride(null);
      return;
    }
    setOverride(readConfirmationOverride(jobId));
    return subscribeConfirmationStore(() => {
      setOverride(readConfirmationOverride(jobId));
    });
  }, [jobId]);

  return override;
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

/** Day-before confirmation for Operations → Jobs (uses job-day row id for overrides). */
export function useOpsJobDayConfirmation(
  row: OpsJobDayRow | undefined,
  move: MoveRecord | undefined,
) {
  const override = useConfirmationOverride(row?.id);

  const confirmation = useMemo(() => {
    if (!row) return null;
    return resolveDayBeforeConfirmation(row.date, {
      move,
      jobDayId: row.jobDayId,
      jobId: row.id,
      override,
    });
  }, [row, move, override]);

  function setOverride(status: DayBeforeConfirmationStatus | null) {
    if (!row) return;
    writeConfirmationOverride(row.id, status);
  }

  return { confirmation, setOverride };
}

export function DayBeforeConfirmationPill({
  jobId,
  confirmation,
  onOverrideChange,
  compact = false,
  micro = false,
  className,
}: DayBeforeConfirmationPillProps) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const label = DAY_BEFORE_CONFIRMATION_LABELS[confirmation.status];

  const updateMenuPos = useCallback(() => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMenuPos({ top: rect.bottom + 4, left: rect.right });
  }, []);

  useEffect(() => {
    if (!open) return;
    updateMenuPos();
    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
      setMenuPos(null);
    }
    function onReposition() {
      updateMenuPos();
    }
    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, updateMenuPos]);

  function applyOverride(status: DayBeforeConfirmationStatus | null) {
    writeConfirmationOverride(jobId, status);
    onOverrideChange?.(status);
    setOpen(false);
    setMenuPos(null);
  }

  const menu = open ? (
    <div
      ref={menuRef}
      role="listbox"
      className="fixed z-[300] min-w-[9rem] -translate-x-full rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
      style={
        menuPos
          ? { top: menuPos.top, left: menuPos.left }
          : { top: 0, left: 0, visibility: "hidden" as const }
      }
      onClick={(e) => e.stopPropagation()}
    >
      {DAY_BEFORE_CONFIRMATION_SELECTABLE_STATUSES.map((status) => (
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
  ) : null;

  return (
    <div ref={rootRef} className={cn("relative shrink-0", className)}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (open) {
            setOpen(false);
            setMenuPos(null);
          } else {
            updateMenuPos();
            setOpen(true);
          }
        }}
        title={confirmation.detail}
        className={cn(
          "inline-flex items-center gap-0.5 rounded-full border font-semibold uppercase tracking-wide transition-colors hover:opacity-90",
          micro
            ? "px-1.5 py-px text-[8px] leading-tight"
            : compact
              ? "px-2 py-0.5 text-[10px]"
              : "px-2.5 py-0.5 text-[11px]",
          DAY_BEFORE_CONFIRMATION_PILL_STYLES[confirmation.status],
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {label}
        <ChevronDown
          className={cn(
            "opacity-60",
            micro ? "h-2 w-2" : compact ? "h-2.5 w-2.5" : "h-3 w-3",
          )}
        />
      </button>

      {typeof document !== "undefined" && menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
