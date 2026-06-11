"use client";

import {
  SKIPPER_CALLBACK_VIOLATION_ID,
  SKIPPER_VIOLATION_LABELS,
  type SkipperViolationId,
} from "@/lib/operations/skipper-violations";
import { cn } from "@/lib/utils";

type SkipperViolationsSummaryProps = {
  violations: SkipperViolationId[];
  callbackNote?: string;
  otherNote?: string;
  className?: string;
};

export function SkipperViolationsSummary({
  violations,
  callbackNote,
  otherNote,
  className,
}: SkipperViolationsSummaryProps) {
  if (violations.length === 0) return null;

  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <div className="flex flex-wrap gap-1">
        {violations.map((id) => (
          <span
            key={id}
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold",
              id === SKIPPER_CALLBACK_VIOLATION_ID
                ? "bg-violet-100 text-violet-900 ring-1 ring-violet-200"
                : "bg-slate-100 text-slate-700",
            )}
          >
            {SKIPPER_VIOLATION_LABELS[id]}
          </span>
        ))}
      </div>
      {violations.includes(SKIPPER_CALLBACK_VIOLATION_ID) && callbackNote ? (
        <p className="line-clamp-2 text-[11px] text-violet-800">{callbackNote}</p>
      ) : null}
      {violations.includes("other") && otherNote ? (
        <p className="line-clamp-2 text-[11px] text-slate-500">{otherNote}</p>
      ) : null}
    </div>
  );
}
