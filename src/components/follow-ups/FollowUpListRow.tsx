"use client";

import {
  FOLLOW_UP_CHANNEL_LABELS,
  FOLLOW_UP_STATUS_LABELS,
  followUpComposerChannel,
  followUpDueLabel,
  followUpSourceLabel,
  type FollowUpComposerChannel,
} from "@/lib/moves/follow-up-display";
import { formatMoveDate } from "@/lib/moves/format";
import type { MoveFollowUp } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { ArrowUpRight, CheckCircle2, Circle, MinusCircle } from "lucide-react";
import Link from "next/link";

export type FollowUpListRowMoveContext = {
  customerName: string;
  route: string;
  moveHref: string;
};

type FollowUpListRowProps = {
  followUp: MoveFollowUp;
  moveContext?: FollowUpListRowMoveContext;
  onComplete?: () => void;
  onSkip?: () => void;
  onOpenChannel?: (channel: FollowUpComposerChannel) => void;
};

function ChannelBadge({
  followUp,
  onOpenChannel,
}: {
  followUp: MoveFollowUp;
  onOpenChannel?: (channel: FollowUpComposerChannel) => void;
}) {
  const composerChannel = followUpComposerChannel(followUp.channel);
  const label = FOLLOW_UP_CHANNEL_LABELS[followUp.channel];

  if (composerChannel && onOpenChannel) {
    return (
      <button
        type="button"
        onClick={() => onOpenChannel(composerChannel)}
        className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100"
      >
        {label}
      </button>
    );
  }

  return (
    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
      {label}
    </span>
  );
}

export function FollowUpListRow({
  followUp,
  moveContext,
  onComplete,
  onSkip,
  onOpenChannel,
}: FollowUpListRowProps) {
  const isOpen = followUp.status === "open";
  const dueHint = followUpDueLabel(followUp);
  const composerChannel = followUpComposerChannel(followUp.channel);
  const StatusIcon =
    followUp.status === "completed"
      ? CheckCircle2
      : followUp.status === "skipped"
        ? MinusCircle
        : Circle;

  return (
    <li
      className={cn(
        "rounded-lg border px-3 py-2.5",
        isOpen ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50/80",
      )}
    >
      <div className="flex items-start gap-2.5">
        <StatusIcon
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0",
            followUp.status === "completed" && "text-emerald-600",
            followUp.status === "skipped" && "text-slate-400",
            followUp.status === "open" && dueHint === "Overdue" && "text-amber-600",
            followUp.status === "open" && dueHint !== "Overdue" && "text-slate-300",
          )}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p
              className={cn(
                "text-sm font-medium text-slate-900",
                !isOpen && "text-slate-500 line-through",
              )}
            >
              {followUp.title}
            </p>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
              {followUpSourceLabel(followUp)}
            </span>
            <ChannelBadge followUp={followUp} onOpenChannel={onOpenChannel} />
            {!isOpen ? (
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                {FOLLOW_UP_STATUS_LABELS[followUp.status]}
              </span>
            ) : null}
          </div>

          {moveContext ? (
            <p className="mt-1 truncate text-xs text-slate-600">
              {moveContext.customerName}
              <span className="text-slate-300"> · </span>
              {moveContext.route}
            </p>
          ) : null}

          <p className="mt-1 text-xs text-slate-500">
            Due {formatMoveDate(followUp.dueAt.slice(0, 10))}
            {dueHint ? (
              <span
                className={cn(
                  "ml-1.5 font-semibold",
                  dueHint === "Overdue" ? "text-amber-800" : "text-brand-700",
                )}
              >
                · {dueHint}
              </span>
            ) : null}
            {followUp.notes ? <span className="text-slate-400"> · {followUp.notes}</span> : null}
          </p>

          {isOpen ? (
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
              {composerChannel && onOpenChannel ? (
                <button
                  type="button"
                  onClick={() => onOpenChannel(composerChannel)}
                  className="text-[11px] font-semibold text-brand-700 hover:text-brand-800"
                >
                  Open {FOLLOW_UP_CHANNEL_LABELS[composerChannel].toLowerCase()}
                </button>
              ) : null}
              {moveContext ? (
                <Link
                  href={moveContext.moveHref}
                  className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                >
                  Open move
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              ) : null}
              {onComplete ? (
                <button
                  type="button"
                  onClick={onComplete}
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Mark done
                </button>
              ) : null}
              {onSkip ? (
                <button
                  type="button"
                  onClick={onSkip}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-700"
                >
                  Skip
                </button>
              ) : null}
            </div>
          ) : moveContext ? (
            <Link
              href={moveContext.moveHref}
              className="mt-2 inline-flex items-center gap-0.5 text-[11px] font-medium text-slate-500 hover:text-slate-800"
            >
              Open move
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          ) : null}
        </div>
      </div>
    </li>
  );
}
