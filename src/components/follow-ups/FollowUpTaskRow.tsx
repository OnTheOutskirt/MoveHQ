"use client";

import { QuadrantBadge } from "@/components/moves/shared/QuadrantBadge";
import { formatMoveDate, formatQuote, moveRouteLabel } from "@/lib/moves/format";
import type { FollowUpBucket, FollowUpQueueItem } from "@/lib/moves/follow-ups";
import { resolveFollowUpSource } from "@/lib/moves/move-follow-ups";
import { moveStageDisplayLabel } from "@/lib/moves/move-pipeline";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

const BUCKET_LABEL: Record<FollowUpBucket, string> = {
  overdue: "Overdue",
  today: "Today",
  upcoming: "Upcoming",
};

const SOURCE_LABEL = {
  manual: "Manual",
  automation: "Auto",
  scheduled: "Scheduled",
} as const;

type FollowUpTaskRowProps = {
  item: FollowUpQueueItem;
  selected: boolean;
  onSelect: () => void;
};

export function FollowUpTaskRow({ item, selected, onSelect }: FollowUpTaskRowProps) {
  const { followUp, move, bucket } = item;
  const source = resolveFollowUpSource(followUp);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
        selected
          ? "border-brand-300 bg-brand-50 ring-1 ring-brand-200"
          : "border-slate-200 bg-white hover:border-brand-200 hover:bg-brand-50/30",
        bucket === "overdue" && !selected && "ring-1 ring-amber-200/80",
      )}
    >
      <div
        className={cn(
          "flex w-[4.5rem] shrink-0 flex-col text-center",
          bucket === "overdue" ? "text-amber-900" : "text-slate-700",
        )}
      >
        <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Due</span>
        <span className="text-xs font-bold tabular-nums">
          {formatMoveDate(followUp.dueAt.slice(0, 10))}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{followUp.title}</p>
        <p className="mt-0.5 truncate text-xs text-slate-600">
          {move.customerName}
          <span className="text-slate-300"> · </span>
          {moveRouteLabel(move.originAddress, move.destinationAddress)}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
          <span
            className={cn(
              "rounded px-1 py-px font-medium uppercase tracking-wide",
              bucket === "overdue"
                ? "bg-amber-100 text-amber-900"
                : bucket === "today"
                  ? "bg-brand-100 text-brand-800"
                  : "bg-slate-100 text-slate-600",
            )}
          >
            {BUCKET_LABEL[bucket]}
          </span>
          <span className="rounded bg-slate-100 px-1 py-px font-medium text-slate-600">
            {SOURCE_LABEL[source]}
          </span>
          <span>{followUp.channel}</span>
          <span className="text-slate-300">·</span>
          <span>{moveStageDisplayLabel(move)}</span>
          <span className="text-slate-300">·</span>
          <span>{formatQuote(move.quoteAmount, move.quoteType)}</span>
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <QuadrantBadge move={move} />
        <ChevronRight className="h-4 w-4 text-slate-400" />
      </div>
    </button>
  );
}
