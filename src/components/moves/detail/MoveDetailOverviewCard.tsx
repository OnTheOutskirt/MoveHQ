"use client";

import type { ReactNode } from "react";
import { MoveLifecycleStepper } from "@/components/moves/detail/MoveLifecycleStepper";
import { MoveWaitingSubstagePicker } from "@/components/moves/detail/MoveWaitingSubstagePicker";
import { MoveSalesRepPicker } from "@/components/moves/detail/MoveSalesRepPicker";
import { PricingTypeBadge } from "@/components/moves/detail/PricingTypeBadge";
import { QuoteChannelBadge } from "@/components/moves/shared/QuoteChannelBadge";
import { QuadrantBadge } from "@/components/moves/shared/QuadrantBadge";
import { MarkMoveLostAction } from "@/components/moves/detail/MarkMoveLostAction";
import { formatLostMoveSummary, lostQualificationBadgeClass } from "@/lib/moves/lost-reasons";
import { formatQuote } from "@/lib/moves/format";
import {
  bookingReviewConfig,
  conditionStatusConfig,
} from "@/lib/moves/move-condition";
import {
  isMoveLost,
  moveDetailPipelineStageLabel,
} from "@/lib/moves/move-pipeline";
import { formatMoveDatesDisplay, moveDateFieldLabel } from "@/lib/moves/move-dates";
import { intakeJobTypeLabel } from "@/lib/moves/intake-display";
import { getMoveEstimatedValue } from "@/lib/moves/move-priority-tier";
import { moveDisplayTitle } from "@/lib/moves/get-move-contact";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";

type MoveDetailOverviewCardProps = {
  move: MoveRecord;
  className?: string;
  onOpenMovePlan?: () => void;
};

function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-0.5 text-sm text-slate-900">{children}</div>
    </div>
  );
}

function moveTypeLabel(moveType: MoveRecord["moveType"]): string {
  if (moveType === "Long distance") return "Long distance";
  return moveType;
}

export function MoveDetailOverviewCard({
  move,
  className,
  onOpenMovePlan,
}: MoveDetailOverviewCardProps) {
  const lost = isMoveLost(move);
  const lostSummary = formatLostMoveSummary(move);
  const est = getMoveEstimatedValue(move);
  const condCfg = conditionStatusConfig[move.conditionStatus];
  const reviewCfg =
    move.bookingReviewStatus !== "not_required"
      ? bookingReviewConfig[move.bookingReviewStatus]
      : null;
  const datesLabel = formatMoveDatesDisplay(move);
  const jobDateLabel = moveDateFieldLabel(move);
  return (
    <section
      className={cn(
        "shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm",
        className,
      )}
    >
      {lost ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          <p className="text-sm text-red-900">
            <span className="font-semibold">Lost</span>
            {move.lostQualification ? (
              <span
                className={cn(
                  "ml-2 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                  lostQualificationBadgeClass(move.lostQualification),
                )}
              >
                {move.lostQualification}
              </span>
            ) : null}
            {move.lostFromStage ? ` · was ${moveDetailPipelineStageLabel(move.lostFromStage)}` : ""}
            {lostSummary ? ` — ${lostSummary}` : ""}
          </p>
          <MarkMoveLostAction move={move} />
        </div>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">
              {moveDisplayTitle(move)}
            </h1>
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-medium text-slate-600">
              {move.reference}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <QuadrantBadge move={move} />
            <QuoteChannelBadge move={move} showIntakeProgress />
            <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", condCfg.badge)}>
              {condCfg.label}
            </span>
            {reviewCfg ? (
              <span
                className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", reviewCfg.badge)}
              >
                {reviewCfg.label}
              </span>
            ) : null}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Estimate
          </p>
          <p className="text-xl font-semibold tabular-nums tracking-tight text-slate-900">
            {formatQuote(est, move.quoteType)}
            {!move.quoteAmount ? (
              <span className="ml-1 text-sm font-normal text-slate-500">est.</span>
            ) : null}
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-5">
        <Meta label="Job type">
          <span className="font-medium">{intakeJobTypeLabel(move.intake.jobType)}</span>
        </Meta>
        <Meta label="Type">
          <span className="font-medium">{moveTypeLabel(move.moveType)}</span>
        </Meta>
        <Meta label="Pricing">
          <PricingTypeBadge quoteType={move.quoteType} />
        </Meta>
        <Meta label="Sales rep">
          <MoveSalesRepPicker moveId={move.id} value={move.assignedRep} />
        </Meta>
        <Meta label={jobDateLabel}>
          {onOpenMovePlan ? (
            <button
              type="button"
              onClick={onOpenMovePlan}
              className="text-left font-medium leading-snug text-brand-600 underline-offset-2 hover:text-brand-700 hover:underline"
            >
              {datesLabel}
            </button>
          ) : (
            <span className="font-medium leading-snug">{datesLabel}</span>
          )}
        </Meta>
      </div>

      <div className="mt-3 border-t border-slate-100 pt-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <MoveLifecycleStepper move={move} />
          </div>
          {!lost ? (
            <MarkMoveLostAction move={move} className="shrink-0 pt-0.5" />
          ) : null}
        </div>
        {!lost && move.pipelineStage === "waiting" ? (
          <MoveWaitingSubstagePicker move={move} variant="stepper" className="mt-2" />
        ) : null}
      </div>
    </section>
  );
}
