"use client";

import { useMoves } from "@/components/moves/MovesProvider";
import { formatMoveDate, moveRouteLabel } from "@/lib/moves/format";
import { resolveRelatedMove } from "@/lib/moves/resolve-related-move";
import { salesMovePath } from "@/lib/navigation/routes";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useMemo } from "react";

type RelatedMoveCellProps = {
  moveId?: string;
  jobRef?: string;
  className?: string;
};

export function RelatedMoveCell({ moveId, jobRef, className }: RelatedMoveCellProps) {
  const { moves } = useMoves();
  const move = useMemo(
    () => resolveRelatedMove(moves, { moveId, jobRef }),
    [moves, moveId, jobRef],
  );

  if (!move && !jobRef?.trim()) {
    return <span className="text-slate-400">—</span>;
  }

  if (!move) {
    return <span className="text-sm text-slate-600">{jobRef}</span>;
  }

  return (
    <Link
      href={salesMovePath(move.id)}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "block min-w-[9rem] max-w-xs rounded-lg border border-slate-200 bg-slate-50/90 px-2.5 py-2 transition hover:border-brand-200 hover:bg-brand-50/40",
        className,
      )}
    >
      <p className="truncate text-sm font-medium text-slate-900">{move.customerName}</p>
      <p className="mt-0.5 text-[10px] text-slate-500">
        {formatMoveDate(move.preferredDate)}
        <span className="text-slate-400"> · </span>
        {move.reference}
      </p>
      {move.originAddress || move.destinationAddress ? (
        <p className="mt-0.5 truncate text-[10px] text-slate-500">
          {moveRouteLabel(move.originAddress, move.destinationAddress)}
        </p>
      ) : null}
    </Link>
  );
}

export function RelatedMoveMiniCard({
  move,
  className,
  onClear,
}: {
  move: {
    id: string;
    customerName: string;
    reference: string;
    preferredDate: string;
    originAddress: string;
    destinationAddress: string;
  };
  className?: string;
  onClear?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-900">{move.customerName}</p>
        <p className="mt-0.5 text-[11px] text-slate-600">
          {formatMoveDate(move.preferredDate)} · {move.reference}
        </p>
        <p className="mt-0.5 truncate text-[10px] text-slate-500">
          {moveRouteLabel(move.originAddress, move.destinationAddress)}
        </p>
      </div>
      {onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="shrink-0 text-[10px] font-semibold text-slate-500 hover:text-slate-800"
        >
          Clear
        </button>
      ) : null}
    </div>
  );
}
