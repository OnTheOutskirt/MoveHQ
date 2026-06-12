"use client";

import { useMoves } from "@/components/moves/MovesProvider";
import { Button } from "@/components/ui/Button";
import {
  resolveActiveWebsiteQueue,
  websiteQueueConfig,
  type WebsiteQueueId,
} from "@/lib/moves/acquisition";
import { bookingReviewLabel } from "@/lib/moves/move-condition";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { CheckCircle2, ClipboardList, FileText, Globe } from "lucide-react";

type WebIntakeQueuePanelProps = {
  move: MoveRecord;
};

const panelStyles: Record<
  WebsiteQueueId,
  { border: string; bg: string; title: string; body: string; hint: string; icon: typeof Globe }
> = {
  booked_review: {
    border: "border-sky-200",
    bg: "bg-sky-50/80",
    title: "text-sky-950",
    body: "text-sky-900/90",
    hint: "text-sky-800/80",
    icon: CheckCircle2,
  },
  quoted: {
    border: "border-violet-200",
    bg: "bg-violet-50/80",
    title: "text-violet-950",
    body: "text-violet-900/90",
    hint: "text-violet-800/80",
    icon: FileText,
  },
  incomplete: {
    border: "border-amber-200",
    bg: "bg-amber-50/80",
    title: "text-amber-950",
    body: "text-amber-900/90",
    hint: "text-amber-800/80",
    icon: ClipboardList,
  },
};

/** Action banner for moves on an AI Web Quotes list — clears badge and queue membership. */
export function WebIntakeQueuePanel({ move }: WebIntakeQueuePanelProps) {
  const { clearFromWebsiteQueue } = useMoves();
  const queue = resolveActiveWebsiteQueue(move);

  if (!queue) return null;

  const config = websiteQueueConfig[queue];
  const styles = panelStyles[queue];
  const Icon = styles.icon;
  const isBookedReview = queue === "booked_review";

  return (
    <section className={cn("rounded-lg border p-4", styles.border, styles.bg)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={cn("flex items-center gap-1.5 text-sm font-semibold", styles.title)}>
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {config.label}
          </p>
          <p className={cn("mt-1 text-sm", styles.body)}>{config.description}</p>
          {isBookedReview ? (
            <p className={cn("mt-1 text-sm", styles.body)}>
              Status: {bookingReviewLabel(move.bookingReviewStatus)}.
            </p>
          ) : null}
          <p className={cn("mt-2 text-xs", styles.hint)}>{config.exitHint}</p>
        </div>
        <Button
          type="button"
          size="sm"
          className="shrink-0"
          onClick={() => clearFromWebsiteQueue(move.id, queue)}
        >
          {isBookedReview ? "Mark reviewed" : "Mark handled"}
        </Button>
      </div>
    </section>
  );
}

/** @deprecated Use WebIntakeQueuePanel */
export const WebBookingReviewPanel = WebIntakeQueuePanel;
