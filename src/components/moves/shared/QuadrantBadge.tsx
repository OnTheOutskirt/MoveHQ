"use client";

import {
  getMovePriorityTier,
  priorityTierStyle,
  quadrantInputsLabel,
} from "@/lib/moves/move-priority-tier";
import type { MoveRecord } from "@/lib/moves/types";

type QuadrantBadgeProps = {
  move: MoveRecord;
  className?: string;
};

/** Subtle Q1–Q4 badge — full meaning on hover. */
export function QuadrantBadge({ move, className }: QuadrantBadgeProps) {
  const tier = getMovePriorityTier(move);
  if (!tier) {
    return (
      <span
        className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-500 ${className ?? ""}`}
        title="Quadrant pending — add estimate"
      >
        —
      </span>
    );
  }
  const cfg = priorityTierStyle(tier);
  return (
    <span
      className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${cfg.badge} ${className ?? ""}`}
      title={`${cfg.shortCode} — ${quadrantInputsLabel(move)}`}
    >
      {cfg.shortCode}
    </span>
  );
}

const CARD_BORDER: Record<string, string> = {
  Q1: "border-l-emerald-500",
  Q2: "border-l-sky-500",
  Q3: "border-l-amber-400",
  Q4: "border-l-slate-300",
};

export function quadrantCardAccentClass(move: MoveRecord): string {
  const tier = getMovePriorityTier(move);
  if (!tier) return "border-l-slate-200";
  return `border-l-4 ${CARD_BORDER[tier] ?? "border-l-slate-200"}`;
}
