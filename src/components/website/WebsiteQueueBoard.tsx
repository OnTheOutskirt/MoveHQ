"use client";

import { MoveCompactTile } from "@/components/moves/shared/MoveCompactTile";
import {
  WEBSITE_QUEUE_IDS,
  websiteQueueConfig,
  websiteQueueMoves,
  type WebsiteQueueId,
} from "@/lib/moves/acquisition";
import { compareSalesPriority } from "@/lib/moves/move-priority-tier";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

const COLUMN_ACCENT: Record<WebsiteQueueId, string> = {
  incomplete: "border-amber-200 bg-amber-50/50",
  quoted: "border-violet-200 bg-violet-50/40",
  booked_review: "border-sky-200 bg-sky-50/40",
};

const COLUMN_DOT: Record<WebsiteQueueId, string> = {
  incomplete: "bg-amber-500",
  quoted: "bg-violet-500",
  booked_review: "bg-sky-500",
};

type WebsiteQueueBoardProps = {
  moves: MoveRecord[];
};

export function WebsiteQueueBoard({ moves }: WebsiteQueueBoardProps) {
  const columns = useMemo(() => {
    const map = new Map<WebsiteQueueId, MoveRecord[]>();
    for (const id of WEBSITE_QUEUE_IDS) {
      map.set(id, [...websiteQueueMoves(moves, id)].sort(compareSalesPriority));
    }
    return map;
  }, [moves]);

  return (
    <div className="overflow-x-auto pb-2">
      <div
        className="grid min-w-[48rem] items-stretch gap-3"
        style={{ gridTemplateColumns: `repeat(${WEBSITE_QUEUE_IDS.length}, minmax(14rem, 1fr))` }}
      >
        {WEBSITE_QUEUE_IDS.map((queueId) => {
          const config = websiteQueueConfig[queueId];
          const columnMoves = columns.get(queueId) ?? [];

          return (
            <div
              key={queueId}
              className={cn(
                "flex min-h-[12rem] flex-col rounded-lg border",
                COLUMN_ACCENT[queueId],
              )}
            >
              <div className="shrink-0 border-b border-inherit px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", COLUMN_DOT[queueId])} />
                    <span className="truncate text-sm font-semibold text-slate-900">
                      {config.label}
                    </span>
                  </div>
                  <span className="shrink-0 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-slate-600 tabular-nums">
                    {columnMoves.length}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-snug text-slate-600">{config.description}</p>
                <p className="mt-1 text-[10px] leading-snug text-slate-500">{config.exitHint}</p>
              </div>

              <div className="flex flex-1 flex-col gap-2 p-2">
                {columnMoves.length === 0 ? (
                  <p className="flex flex-1 items-center justify-center rounded-md border border-dashed border-slate-200/90 px-2 py-10 text-center text-xs text-slate-400">
                    Empty
                  </p>
                ) : (
                  columnMoves.map((move) => (
                    <MoveCompactTile key={move.id} move={move} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
