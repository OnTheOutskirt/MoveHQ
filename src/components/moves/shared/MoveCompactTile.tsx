"use client";

import { QuadrantBadge, quadrantCardAccentClass } from "@/components/moves/shared/QuadrantBadge";
import { WebPipelineBadge } from "@/components/moves/shared/WebPipelineBadge";
import { formatMoveDate, formatQuote } from "@/lib/moves/format";
import { moveHasOverdueFollowUp } from "@/lib/moves/move-follow-ups";
import {
  isMoveLost,
  pipelineStageLabel,
  waitingSubstageLabel,
} from "@/lib/moves/move-pipeline";
import type { MoveRecord } from "@/lib/moves/types";
import { salesMovePath } from "@/lib/navigation/routes";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";

type MoveCompactTileProps = {
  move: MoveRecord;
  isDragging?: boolean;
  dragStyle?: CSSProperties;
  dragHandleProps?: Record<string, unknown>;
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

export function MoveCompactTile({
  move,
  isDragging = false,
  dragStyle,
  dragHandleProps,
}: MoveCompactTileProps) {
  const router = useRouter();
  const lost = isMoveLost(move);
  const overdue = !lost && moveHasOverdueFollowUp(move);
  return (
    <div
      {...dragHandleProps}
      style={dragStyle}
      role="button"
      tabIndex={0}
      onClick={() => router.push(salesMovePath(move.id))}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(salesMovePath(move.id));
        }
      }}
      className={cn(
        "flex w-full cursor-grab flex-col rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm",
        "hover:shadow-md active:cursor-grabbing",
        !lost && quadrantCardAccentClass(move),
        isDragging && "opacity-40",
        lost && "!border-red-200 bg-red-50/40",
        overdue && "ring-1 ring-amber-300/60",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="truncate font-medium text-slate-900">{move.customerName}</p>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            <QuadrantBadge move={move} />
            {overdue ? (
            <span className="text-[10px] font-bold uppercase text-amber-800" title="Follow-up overdue">
              !
            </span>
          ) : null}
          </div>
          <WebPipelineBadge move={move} />
        </div>
      </div>

      <p className="mt-1 text-sm font-semibold tabular-nums text-slate-800">
        {formatQuote(move.quoteAmount, move.quoteType)}
      </p>
      <p className="mt-1 text-xs text-slate-600">{formatMoveDate(move.preferredDate)}</p>
      <p className="mt-2 text-xs font-medium text-slate-700">{stageLine(move)}</p>
      <p className="mt-1 text-xs text-slate-500">{move.assignedRep}</p>
    </div>
  );
}
