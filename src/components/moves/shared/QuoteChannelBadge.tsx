"use client";

import {
  quoteChannelConfig,
  resolveQuoteChannel,
  resolveWebPipelineBadge,
} from "@/lib/moves/acquisition";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";

type QuoteChannelBadgeProps = {
  move: Pick<
    MoveRecord,
    | "quoteChannel"
    | "source"
    | "leadChannel"
    | "intakeProgress"
    | "pipelineStage"
    | "quoteAmount"
    | "bookingReviewStatus"
  >;
  /** Show web intake progress chip alongside quote channel (web AI only). */
  showIntakeProgress?: boolean;
  size?: "sm" | "md";
  className?: string;
};

export function QuoteChannelBadge({
  move,
  showIntakeProgress = false,
  size = "sm",
  className,
}: QuoteChannelBadgeProps) {
  const channel = resolveQuoteChannel(move);
  const textSize = size === "md" ? "text-xs" : "text-[10px]";
  const pad = size === "md" ? "px-2 py-0.5" : "px-1.5 py-0.5";

  if (showIntakeProgress && channel === "web_ai") {
    const web = resolveWebPipelineBadge(move);
    if (!web) return null;
    return (
      <span
        className={cn("inline-flex rounded font-medium", pad, textSize, web.badge, className)}
        title={web.label}
      >
        {web.label}
      </span>
    );
  }

  if (channel === "web_ai" || channel === "unknown") {
    return null;
  }

  const channelCfg = quoteChannelConfig[channel];
  return (
    <span
      className={cn(
        "inline-flex rounded font-semibold uppercase tracking-wide",
        pad,
        textSize,
        channelCfg.badge,
        className,
      )}
      title={channelCfg.description}
    >
      {channelCfg.shortLabel}
    </span>
  );
}
