"use client";

import { useMoves } from "@/components/moves/MovesProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import {
  isMoveLost,
  pipelineStageIndex,
  moveDetailPipelineStageLabel,
} from "@/lib/moves/move-pipeline";
import type { MoveRecord, PipelineStageId } from "@/lib/moves/types";
import { cn } from "@/lib/utils";

function formatIntakeSubmitted(at: string | undefined): string | null {
  if (!at) return null;
  const d = new Date(at);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Progress width aligned to step dots (each centered in an equal flex column).
 * Bar runs from the left through the current step's dot; Move Complete fills the track.
 */
function pipelineProgressPercent(
  currentIdx: number,
  stageCount: number,
  stage: PipelineStageId,
  lost: boolean,
): number {
  if (lost || stageCount <= 0 || currentIdx < 0) return 0;
  if (stage === "completed") return 100;
  return ((currentIdx + 0.5) / stageCount) * 100;
}

type MoveLifecycleStepperProps = {
  move: MoveRecord;
  className?: string;
};

export function MoveLifecycleStepper({ move, className }: MoveLifecycleStepperProps) {
  const { updateMovePipelineStage } = useMoves();
  const { settings } = useSettings();
  const pipelineStages = settings.fieldCatalog.pipelineStages;
  const stageIds = pipelineStages.map((s) => s.id);
  const lost = isMoveLost(move);
  const current = move.pipelineStage;
  const currentIdx = pipelineStageIndex(current);
  const stageCount = stageIds.length;
  const progressPct = pipelineProgressPercent(currentIdx, stageCount, current, lost);
  return (
    <nav className={cn("min-w-0", className)} aria-label="Pipeline">
      <div className="relative px-0.5 pb-5 pt-1">
        <div
          className="pointer-events-none absolute left-2 right-2 top-[11px] h-px bg-slate-200"
          aria-hidden
        />
        {!lost ? (
          <div
            className="pointer-events-none absolute left-2 top-[11px] h-0.5 bg-brand-500 transition-[width] duration-200"
            style={{ width: `calc((100% - 1rem) * ${progressPct / 100})` }}
            aria-hidden
          />
        ) : null}

        <ol className="relative flex justify-between gap-0.5">
          {pipelineStages.map((stage, i) => {
            const stageId = stage.id;
            const isCurrent = !lost && stageId === current;
            const isPast = !lost && i < currentIdx;
            const intakeSubmitted =
              stageId === "new_lead" ? formatIntakeSubmitted(move.intake.submittedAt) : null;
            const stepLabel = stage.detailLabel ?? stage.label;
            return (
              <li key={stageId} className="flex min-w-0 flex-1 flex-col items-center">
                <button
                  type="button"
                  disabled={lost}
                  onClick={() => updateMovePipelineStage(move.id, stageId as PipelineStageId)}
                  title={moveDetailPipelineStageLabel(stageId)}
                  aria-label={`${moveDetailPipelineStageLabel(stageId)}${isCurrent ? " (current)" : ""}`}
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn(
                    "group relative z-10 flex w-full flex-col items-center gap-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500",
                    lost && "cursor-default",
                  )}
                >
                  <span
                    className={cn(
                      "rounded-full border-2 transition-all",
                      "h-3.5 w-3.5 shrink-0",
                      lost && "border-slate-300 bg-slate-100",
                      !lost &&
                        isCurrent &&
                        "border-brand-600 bg-brand-600 shadow-sm ring-2 ring-brand-100",
                      !lost && isPast && "border-brand-500 bg-brand-500",
                      !lost &&
                        !isPast &&
                        !isCurrent &&
                        "border-slate-300 bg-white group-hover:border-brand-300 group-hover:bg-brand-50",
                    )}
                  />
                  <span
                    className={cn(
                      "max-w-[5.5rem] text-center text-[9px] font-medium leading-tight",
                      lost && "text-slate-400",
                      !lost && isCurrent && "text-brand-600",
                      !lost && !isCurrent && "text-slate-400",
                    )}
                  >
                    {stepLabel}
                  </span>
                  {intakeSubmitted ? (
                    <span className="max-w-[5.5rem] text-center text-[8px] leading-tight text-slate-500">
                      {intakeSubmitted}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ol>

        {lost ? (
          <p className="absolute -bottom-0.5 right-0 text-[10px] font-semibold text-red-600">
            Lost
          </p>
        ) : null}
      </div>
    </nav>
  );
}
