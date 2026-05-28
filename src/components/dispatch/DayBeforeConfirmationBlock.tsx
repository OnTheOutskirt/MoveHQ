"use client";

import type { ReactNode } from "react";
import {
  DAY_BEFORE_CONFIRMATION_LABELS,
  type DayBeforeConfirmation,
  type DayBeforeConfirmationStatus,
} from "@/lib/dispatch/day-before-confirmation";
import { writeConfirmationOverride } from "@/lib/dispatch/confirmation-storage";
import { cn } from "@/lib/utils";
import { Phone } from "lucide-react";

const STATUS_STYLES: Record<DayBeforeConfirmationStatus, string> = {
  confirmed: "border-emerald-200 bg-emerald-50 text-emerald-900",
  pending: "border-amber-200 bg-amber-50 text-amber-950",
  attempted: "border-sky-200 bg-sky-50 text-sky-950",
  not_due: "border-slate-200 bg-slate-50 text-slate-700",
};

type DayBeforeConfirmationBlockProps = {
  jobId: string;
  confirmation: DayBeforeConfirmation;
  onOverrideChange?: (status: DayBeforeConfirmationStatus | null) => void;
};

export function DayBeforeConfirmationBlock({
  jobId,
  confirmation,
  onOverrideChange,
}: DayBeforeConfirmationBlockProps) {
  const label = DAY_BEFORE_CONFIRMATION_LABELS[confirmation.status];

  function setOverride(status: DayBeforeConfirmationStatus) {
    writeConfirmationOverride(jobId, status);
    onOverrideChange?.(status);
  }

  function clearOverride() {
    writeConfirmationOverride(jobId, null);
    onOverrideChange?.(null);
  }

  return (
    <section
      className={cn(
        "rounded-lg border px-3 py-2.5",
        STATUS_STYLES[confirmation.status],
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Phone className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
              Day-before confirmation
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <ConfirmationBadge status={confirmation.status} label={label} />
              <span className="text-sm font-medium">{label}</span>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-1.5 text-sm leading-snug opacity-90">{confirmation.detail}</p>
      <p className="mt-2 text-[10px] opacity-70">
        Full call logging coming soon — use move follow-ups for now.
      </p>
      <div className="mt-2 flex flex-wrap gap-1">
        <OverrideButton
          active={confirmation.status === "confirmed"}
          onClick={() => setOverride("confirmed")}
        >
          Confirmed
        </OverrideButton>
        <OverrideButton
          active={confirmation.status === "attempted"}
          onClick={() => setOverride("attempted")}
        >
          Attempted
        </OverrideButton>
        <OverrideButton
          active={confirmation.status === "pending"}
          onClick={() => setOverride("pending")}
        >
          Needs call
        </OverrideButton>
        <button
          type="button"
          onClick={clearOverride}
          className="rounded-md px-2 py-0.5 text-[10px] font-medium opacity-70 underline-offset-2 hover:underline"
        >
          Reset
        </button>
      </div>
    </section>
  );
}

function ConfirmationBadge({
  status,
  label,
}: {
  status: DayBeforeConfirmationStatus;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        STATUS_STYLES[status],
      )}
      title={label}
    >
      {label}
    </span>
  );
}

function OverrideButton({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border px-2 py-0.5 text-[10px] font-medium transition-colors",
        active
          ? "border-slate-800 bg-white/90 text-slate-900"
          : "border-transparent bg-black/5 text-inherit hover:bg-black/10",
      )}
    >
      {children}
    </button>
  );
}
