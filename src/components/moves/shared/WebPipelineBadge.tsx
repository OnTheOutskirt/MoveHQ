"use client";

import { resolveWebPipelineBadge } from "@/lib/moves/acquisition";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";

type WebPipelineBadgeProps = {
  move: Pick<
    MoveRecord,
    | "quoteChannel"
    | "source"
    | "leadChannel"
    | "conditionStatus"
    | "pipelineStage"
    | "quoteAmount"
    | "bookingReviewStatus"
    | "websiteIntake"
    | "sentQuote"
  >;
  size?: "sm" | "md";
  className?: string;
};

/** One chip for web intake state on pipeline / board cards (phone & office show nothing). */
export function WebPipelineBadge({ move, size = "sm", className }: WebPipelineBadgeProps) {
  const web = resolveWebPipelineBadge(move);
  if (!web) return null;

  const textSize = size === "md" ? "text-xs" : "text-[10px]";
  const pad = size === "md" ? "px-2 py-0.5" : "px-1.5 py-0.5";

  return (
    <span
      className={cn(
        "inline-flex rounded font-medium",
        pad,
        textSize,
        web.badge,
        className,
      )}
      title={web.label}
    >
      {web.label}
    </span>
  );
}
