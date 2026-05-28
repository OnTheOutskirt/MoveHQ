"use client";

import { useMoves } from "@/components/moves/MovesProvider";
import { WAITING_SUBSTAGE_CONFIG } from "@/lib/moves/move-pipeline";
import { WAITING_SUBSTAGES, type MoveRecord, type WaitingSubstage } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

type MoveWaitingSubstagePickerProps = {
  move: MoveRecord;
  className?: string;
  /** Under pipeline stepper — compact but readable */
  variant?: "stepper" | "inline";
};

const STEPPER_TINT: Record<WaitingSubstage | "unset", string> = {
  unset: "border-blue-200 bg-blue-50/70",
  needs_info: "border-blue-200 bg-blue-50/70",
  needs_walkthrough: "border-indigo-200 bg-indigo-50/60",
  walkthrough_scheduled: "border-violet-200 bg-violet-50/60",
};

export function MoveWaitingSubstagePicker({
  move,
  className,
  variant = "inline",
}: MoveWaitingSubstagePickerProps) {
  const { updateWaitingSubstage } = useMoves();

  if (move.conditionStatus === "lost" || move.pipelineStage !== "waiting") return null;

  const substage = move.waitingSubstage;
  const config = substage ? WAITING_SUBSTAGE_CONFIG[substage] : null;
  const tintKey = substage ?? "unset";

  const select = (
    <div className="relative min-w-0">
      <select
        id={variant === "stepper" ? `waiting-reason-${move.id}` : undefined}
        value={substage ?? ""}
        onChange={(e) => updateWaitingSubstage(move.id, e.target.value as WaitingSubstage)}
        aria-label="Waiting reason"
        className={cn(
          "w-full appearance-none rounded-md border bg-white font-medium text-slate-800",
          "focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-200",
          !substage && "text-slate-500",
          variant === "stepper"
            ? "py-1.5 pl-2.5 pr-8 text-xs sm:text-sm"
            : "py-2 pl-3 pr-9 text-sm",
          substage === "needs_info" && variant === "stepper" && "border-blue-200",
          substage === "needs_walkthrough" && variant === "stepper" && "border-indigo-200",
          substage === "walkthrough_scheduled" && variant === "stepper" && "border-violet-200",
          variant === "inline" && "border-slate-200 shadow-sm",
        )}
      >
        <option value="" disabled>
          Select reason…
        </option>
        {WAITING_SUBSTAGES.map((sub) => (
          <option key={sub} value={sub}>
            {WAITING_SUBSTAGE_CONFIG[sub].label}
          </option>
        ))}
      </select>
      <ChevronDown
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-400",
          variant === "stepper" ? "right-2 h-3.5 w-3.5" : "right-3 h-4 w-4",
        )}
        aria-hidden
      />
    </div>
  );

  if (variant === "stepper") {
    return (
      <div
        className={cn(
          "w-full min-w-[11rem] max-w-full rounded-lg border px-2.5 py-2 sm:w-1/3",
          STEPPER_TINT[tintKey],
          className,
        )}
        role="group"
        aria-labelledby="waiting-reason-label"
      >
        <label
          id="waiting-reason-label"
          htmlFor={`waiting-reason-${move.id}`}
          className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-600"
        >
          Waiting reason
        </label>
        {select}
        {config ? (
          <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-slate-500" title={config.description}>
            {config.description}
          </p>
        ) : (
          <p className="mt-1 text-[10px] text-slate-500">Required while in Waiting</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("max-w-md", className)}>
      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
        Waiting reason
      </label>
      <div className="mt-1.5">{select}</div>
      {config ? (
        <p className="mt-1.5 text-xs text-slate-500">{config.description}</p>
      ) : null}
    </div>
  );
}
