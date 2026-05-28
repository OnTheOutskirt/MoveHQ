"use client";

import { getNextAction } from "@/lib/moves/move-workspace";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { ArrowRight, CircleAlert } from "lucide-react";

type NextActionBannerProps = {
  move: MoveRecord;
  /** Tighter layout for the move detail right rail. */
  compact?: boolean;
};

export function NextActionBanner({ move, compact }: NextActionBannerProps) {
  const next = getNextAction(move);
  const urgent = Boolean(next.urgent);

  return (
    <div
      className={cn(
        compact
          ? "mx-2 mt-2 min-w-0 max-w-[calc(100%-1rem)] rounded-lg border px-3 py-3 shadow-sm"
          : "border-b px-4 py-3 lg:px-5",
        urgent
          ? "border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100/80"
          : compact
            ? "border-brand-200 bg-gradient-to-br from-brand-50 to-white"
            : "border-slate-100 bg-white",
        !compact && urgent && "border-amber-200",
      )}
    >
      <div className="flex items-start gap-2">
        <span
          className={cn(
            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
            urgent ? "bg-amber-200 text-amber-900" : "bg-brand-100 text-brand-700",
          )}
          aria-hidden
        >
          {urgent ? (
            <CircleAlert className="h-3.5 w-3.5" />
          ) : (
            <ArrowRight className="h-3.5 w-3.5" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-[10px] font-bold uppercase tracking-wide",
              urgent ? "text-amber-800" : "text-brand-700",
            )}
          >
            Up next
          </p>
          <p
            className={cn(
              "mt-0.5 font-semibold leading-snug",
              urgent ? "text-amber-950" : "text-slate-900",
              compact ? "text-sm" : "text-base",
            )}
          >
            {next.label}
          </p>
          {next.detail ? (
            <p
              className={cn(
                "mt-1 leading-snug",
                compact ? "text-xs" : "text-sm",
                urgent ? "font-medium text-amber-900/90" : "text-slate-600",
              )}
            >
              {next.detail}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
