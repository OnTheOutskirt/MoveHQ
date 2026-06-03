"use client";

import { useMoves } from "@/components/moves/MovesProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import type { MoveRecord, WaitingSubstage } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

type MoveWaitingSubstagePickerProps = {
  move: MoveRecord;
  className?: string;
  variant?: "stepper" | "inline";
};

export function MoveWaitingSubstagePicker({
  move,
  className,
  variant = "inline",
}: MoveWaitingSubstagePickerProps) {
  const { settings } = useSettings();
  const { updateWaitingSubstage } = useMoves();
  const substageOptions = settings.fieldCatalog.waitingSubstages;

  if (move.conditionStatus === "lost" || move.pipelineStage !== "waiting") return null;

  const substage = move.waitingSubstage;
  const description =
    settings.fieldCatalog.waitingSubstages.find((s) => s.id === substage)?.description ?? null;

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
          variant === "inline" && "border-slate-200 shadow-sm",
        )}
      >
        <option value="" disabled>
          Select reason…
        </option>
        {substageOptions.map((sub) => (
          <option key={sub.id} value={sub.id}>
            {sub.label}
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
          "w-full min-w-[11rem] max-w-full rounded-lg border border-blue-200 bg-blue-50/70 px-2.5 py-2 sm:w-1/3",
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
        {description ? (
          <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-slate-500" title={description}>
            {description}
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
      {description ? <p className="mt-1.5 text-xs text-slate-500">{description}</p> : null}
    </div>
  );
}
