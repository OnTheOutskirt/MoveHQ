"use client";

import { PriorityBadge } from "@/components/moves/shared/PriorityBadge";
import { priorityCardBorderClass } from "@/components/moves/shared/PriorityBadge";
import { formatMoveDate, formatQuote } from "@/lib/moves/format";
import { getFollowUpBucket } from "@/lib/moves/follow-ups";
import { getNextAction } from "@/lib/moves/move-workspace";
import {
  isMoveLost,
  pipelineStageLabel,
  waitingSubstageLabel,
} from "@/lib/moves/move-pipeline";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

type MovePriorityCardProps = {
  move: MoveRecord;
};

function stageLine(move: MoveRecord): string {
  if (isMoveLost(move) && move.lostFromStage) {
    return `Lost · ${pipelineStageLabel(move.lostFromStage)}`;
  }
  if (move.pipelineStage === "waiting" && move.waitingSubstage) {
    return `Waiting · ${waitingSubstageLabel(move.waitingSubstage)}`;
  }
  return pipelineStageLabel(move.pipelineStage);
}

export function MovePriorityCard({ move }: MovePriorityCardProps) {
  const next = getNextAction(move);
  const lost = isMoveLost(move);
  const fuBucket = getFollowUpBucket(move);

  const fuSuffix =
    fuBucket === "overdue" ? " · Overdue" : fuBucket === "today" ? " · Due today" : "";

  return (
    <Link
      href={`/moves/${move.id}`}
      className={cn(
        "block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md",
        !lost && priorityCardBorderClass(move),
        lost && "border-red-200 bg-red-50/30",
        fuBucket === "overdue" && !lost && "ring-1 ring-amber-300/60",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-slate-900">{move.customerName}</h3>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {formatQuote(move.quoteAmount, move.quoteType)}
          </p>
          <p className="mt-0.5 text-sm text-slate-600">{formatMoveDate(move.preferredDate)}</p>
          <p className="mt-2 text-sm text-slate-700">{stageLine(move)}</p>
          <p className="text-sm text-slate-600">{move.assignedRep}</p>
        </div>
        <PriorityBadge move={move} className="shrink-0" />
      </div>

      <p className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-600">
        <span className="font-medium text-slate-800">Next:</span> {next.label}
        {fuSuffix ? (
          <span className={cn(fuBucket === "overdue" && "font-medium text-amber-800")}>
            {fuSuffix}
          </span>
        ) : null}
      </p>
    </Link>
  );
}
