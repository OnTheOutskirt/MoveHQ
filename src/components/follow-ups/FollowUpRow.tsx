"use client";

import { QuadrantBadge, quadrantCardAccentClass } from "@/components/moves/shared/QuadrantBadge";
import { getNextOpenFollowUp } from "@/lib/moves/move-follow-ups";
import { formatMoveDate, formatQuote, moveRouteLabel } from "@/lib/moves/format";
import type { FollowUpBucket } from "@/lib/moves/follow-ups";
import { moveStageDisplayLabel } from "@/lib/moves/move-pipeline";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

type FollowUpRowProps = {
  move: MoveRecord;
  bucket: FollowUpBucket;
};

export function FollowUpRow({ move, bucket }: FollowUpRowProps) {
  return (
    <Link
      href={`/moves/${move.id}`}
      className={cn(
        "group flex items-center gap-4 rounded-lg border bg-white px-4 py-3 shadow-sm transition-colors",
        "hover:border-brand-300 hover:bg-brand-50/30",
        quadrantCardAccentClass(move),
        bucket === "overdue" ? "ring-1 ring-amber-300/60" : "border-slate-200",
      )}
    >
      <div
        className={cn(
          "flex w-20 shrink-0 flex-col text-center",
          bucket === "overdue" ? "text-amber-900" : "text-slate-700",
        )}
      >
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Due</span>
        <span className="text-sm font-bold tabular-nums">
          {getNextOpenFollowUp(move)
            ? formatMoveDate(getNextOpenFollowUp(move)!.dueAt.slice(0, 10))
            : "—"}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-semibold text-slate-900">{move.customerName}</p>
          <QuadrantBadge move={move} />
        </div>
        <p className="mt-0.5 truncate text-sm text-slate-600">
          {moveRouteLabel(move.originAddress, move.destinationAddress)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {moveStageDisplayLabel(move)}
          <span className="text-slate-300"> · </span>
          {move.assignedRep}
          <span className="text-slate-300"> · </span>
          {formatQuote(move.quoteAmount, move.quoteType)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2 text-slate-400 group-hover:text-brand-600">
        <span className="hidden text-xs font-medium sm:inline">Open move</span>
        <ChevronRight className="h-4 w-4" />
      </div>
    </Link>
  );
}
