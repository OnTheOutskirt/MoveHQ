"use client";

import { MoveLifecycleStepper } from "@/components/moves/detail/MoveLifecycleStepper";
import { PricingTypeBadge } from "@/components/moves/detail/PricingTypeBadge";
import { QuoteChannelBadge } from "@/components/moves/shared/QuoteChannelBadge";
import { QuadrantBadge } from "@/components/moves/shared/QuadrantBadge";
import { MarkMoveLostAction } from "@/components/moves/detail/MarkMoveLostAction";
import { useMoves } from "@/components/moves/MovesProvider";
import { Button } from "@/components/ui/Button";
import { formatLostMoveSummary, lostQualificationBadgeClass } from "@/lib/moves/lost-reasons";
import { formatQuote } from "@/lib/moves/format";
import {
  bookingReviewConfig,
  conditionStatusConfig,
} from "@/lib/moves/move-condition";
import { getNextOpenFollowUp } from "@/lib/moves/move-follow-ups";
import {
  isMoveLost,
  moveDetailPipelineStageLabel,
  moveDetailStageDisplayLabel,
} from "@/lib/moves/move-pipeline";
import { moveDisplayTitle } from "@/lib/moves/get-move-contact";
import { getMoveEstimatedValue } from "@/lib/moves/move-priority-tier";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { formatMoveDate } from "@/lib/moves/format";

type MoveDetailSummaryHeaderProps = {
  move: MoveRecord;
  className?: string;
};

export function MoveDetailSummaryHeader({ move, className }: MoveDetailSummaryHeaderProps) {
  const { reopenMove } = useMoves();
  const lost = isMoveLost(move);
  const lostSummary = formatLostMoveSummary(move);
  const est = getMoveEstimatedValue(move);
  const nextFu = getNextOpenFollowUp(move);
  const condCfg = conditionStatusConfig[move.conditionStatus];
  const reviewCfg =
    move.bookingReviewStatus !== "not_required"
      ? bookingReviewConfig[move.bookingReviewStatus]
      : null;

  return (
    <header
      className={cn(
        "shrink-0 border-b border-slate-200 bg-white px-4 py-4 lg:px-5",
        className,
      )}
    >
      {lost ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
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
          <Button type="button" size="sm" variant="secondary" onClick={() => reopenMove(move.id)}>
            Re-open
          </Button>
        </div>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 lg:text-2xl">
              {moveDisplayTitle(move)}
            </h1>
            <QuadrantBadge move={move} />
            <QuoteChannelBadge move={move} showIntakeProgress />
            <span className={cn("rounded px-2 py-0.5 text-[10px] font-semibold", condCfg.badge)}>
              {condCfg.label}
            </span>
            {reviewCfg ? (
              <span className={cn("rounded px-2 py-0.5 text-[10px] font-semibold", reviewCfg.badge)}>
                {reviewCfg.label}
              </span>
            ) : null}
          </div>

          <p className="text-sm text-slate-700">
            <span>{move.moveType}</span>
            <span className="text-slate-300"> · </span>
            <PricingTypeBadge quoteType={move.quoteType} />
          </p>

          <p className="text-sm font-semibold tabular-nums text-slate-900">
            {formatQuote(est, move.quoteType)}
            {!move.quoteAmount ? <span className="font-normal text-slate-500"> estimate</span> : null}
          </p>

          <p className="text-sm text-slate-600">{moveDetailStageDisplayLabel(move)}</p>
          <p className="text-sm text-slate-600">{move.assignedRep}</p>

          {nextFu && !lost ? (
            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-800">Next:</span> {nextFu.title}
              <span className="text-slate-400"> · due {formatMoveDate(nextFu.dueAt.slice(0, 10))}</span>
            </p>
          ) : null}
        </div>
      </div>

      {!lost ? (
        <div className="mt-3 flex justify-end">
          <MarkMoveLostAction move={move} />
        </div>
      ) : null}

      <div className="mt-4 border-t border-slate-100 pt-3">
        <MoveLifecycleStepper move={move} />
      </div>
    </header>
  );
}
