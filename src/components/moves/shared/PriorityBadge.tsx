"use client";

import {
  displayPriorityConfig,
  getDisplayPriority,
} from "@/lib/moves/move-priority-tier";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";

type PriorityBadgeProps = {
  move: MoveRecord;
  className?: string;
};

/** Small label only — cards use border color instead when possible. */
export function PriorityBadge({ move, className }: PriorityBadgeProps) {
  const cfg = displayPriorityConfig[getDisplayPriority(move)];
  return (
    <span
      className={cn(
        "inline-flex rounded px-2 py-0.5 text-[10px] font-semibold",
        cfg.badge,
        className,
      )}
    >
      {cfg.label}
    </span>
  );
}

export function priorityCardBorderClass(move: MoveRecord): string {
  return displayPriorityConfig[getDisplayPriority(move)].cardBorder;
}
