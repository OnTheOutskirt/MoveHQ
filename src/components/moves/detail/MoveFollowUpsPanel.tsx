"use client";

import { FollowUpListRow } from "@/components/follow-ups/FollowUpListRow";
import { FollowUpOriginFilterBar } from "@/components/follow-ups/FollowUpOriginFilterBar";
import { useMoves } from "@/components/moves/MovesProvider";
import { Button } from "@/components/ui/Button";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { openAutomatedFollowUps } from "@/lib/moves/cancel-automated-follow-ups";
import { formatMoveDate } from "@/lib/moves/format";
import {
  FOLLOW_UP_CHANNEL_LABELS,
  followUpComposerChannel,
  followUpDueLabel,
  followUpMatchesOriginKind,
  followUpOpenOriginCounts,
  followUpSourceLabel,
  partitionMoveFollowUps,
  type FollowUpComposerChannel,
  type FollowUpOriginKind,
} from "@/lib/moves/follow-up-display";
import { getNextOpenFollowUp } from "@/lib/moves/move-follow-ups";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { CalendarPlus } from "lucide-react";
import { useMemo, useState } from "react";

/** Full follow-up task list — used in the detail sidebar. */
export function MoveFollowUpsList({
  move,
  onOpenChannel,
}: {
  move: MoveRecord;
  onOpenChannel?: (channel: FollowUpComposerChannel) => void;
}) {
  const { updateFollowUpStatus, cancelAutomatedFollowUps } = useMoves();
  const [originFilter, setOriginFilter] = useState<FollowUpOriginKind>("manual");
  const { open, closed } = partitionMoveFollowUps(move.followUps);
  const originCounts = useMemo(
    () => followUpOpenOriginCounts(move.followUps),
    [move.followUps],
  );
  const filteredOpen = useMemo(
    () => open.filter((followUp) => followUpMatchesOriginKind(followUp, originFilter)),
    [open, originFilter],
  );
  const filteredClosed = useMemo(
    () => closed.filter((followUp) => followUpMatchesOriginKind(followUp, originFilter)),
    [closed, originFilter],
  );
  const openAutomated = openAutomatedFollowUps(move);
  const total = move.followUps.length;

  if (total === 0) {
    return (
      <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
        No follow-up tasks on this move yet. Pipeline automations and manual tasks will show up
        here.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <FollowUpOriginFilterBar
        value={originFilter}
        onChange={setOriginFilter}
        counts={originCounts}
      />

      {filteredOpen.length > 0 ? (
        <ul className="space-y-2">
          {filteredOpen.map((followUp) => (
            <FollowUpListRow
              key={followUp.id}
              followUp={followUp}
              onOpenChannel={onOpenChannel}
              onComplete={() => updateFollowUpStatus(move.id, followUp.id, "completed")}
              onSkip={() => updateFollowUpStatus(move.id, followUp.id, "skipped")}
            />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">
          No open {originFilter} follow-ups.
        </p>
      )}

      {filteredClosed.length > 0 ? (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Done &amp; skipped
          </p>
          <ul className="mt-2 space-y-2">
            {filteredClosed.map((followUp) => (
              <FollowUpListRow key={followUp.id} followUp={followUp} />
            ))}
          </ul>
        </div>
      ) : null}

      {originFilter === "automated" &&
      (openAutomated.length > 0 || move.automationsSuppressed) ? (
        <div className="border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => cancelAutomatedFollowUps(move.id)}
            disabled={openAutomated.length === 0}
            className="text-xs font-medium text-red-700 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {move.automationsSuppressed && openAutomated.length === 0
              ? "Automated follow-ups cancelled for this move"
              : `Cancel remaining automated follow-ups (${openAutomated.length})`}
          </button>
        </div>
      ) : null}
    </div>
  );
}

type MoveFollowUpsRailSectionProps = {
  move: MoveRecord;
  onSeeAll: () => void;
  onOpenChannel?: (channel: FollowUpComposerChannel) => void;
};

/** Compact next follow-up preview in the move detail right rail. */
export function MoveFollowUpsRailSection({
  move,
  onSeeAll,
  onOpenChannel,
}: MoveFollowUpsRailSectionProps) {
  const nextFu = getNextOpenFollowUp(move);
  const { open, closed } = partitionMoveFollowUps(move.followUps);
  const dueHint = nextFu ? followUpDueLabel(nextFu) : null;
  const total = move.followUps.length;
  const composerChannel = nextFu ? followUpComposerChannel(nextFu.channel) : null;

  function handleNextFollowUpClick() {
    if (composerChannel && onOpenChannel) {
      onOpenChannel(composerChannel);
      return;
    }
    onSeeAll();
  }

  return (
    <div className="shrink-0 border-b border-slate-200 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Follow-ups</p>
        <button
          type="button"
          onClick={onSeeAll}
          className="shrink-0 text-[11px] font-medium text-slate-400 hover:text-brand-600"
        >
          See all
        </button>
      </div>

      {nextFu ? (
        <button
          type="button"
          onClick={handleNextFollowUpClick}
          className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-left transition hover:border-brand-200 hover:bg-brand-50/50"
        >
          <p className="truncate text-sm font-medium text-slate-900">{nextFu.title}</p>
          <p className="mt-1 text-[11px] text-slate-500">
            Due {formatMoveDate(nextFu.dueAt.slice(0, 10))}
            <span className="mx-1 text-slate-300">·</span>
            {followUpSourceLabel(nextFu)}
            <span className="mx-1 text-slate-300">·</span>
            {FOLLOW_UP_CHANNEL_LABELS[nextFu.channel]}
          </p>
          {dueHint ? (
            <p
              className={cn(
                "mt-1 text-[11px] font-semibold",
                dueHint === "Overdue" ? "text-amber-800" : "text-brand-700",
              )}
            >
              {dueHint}
            </p>
          ) : null}
          {composerChannel && onOpenChannel ? (
            <p className="mt-1 text-[11px] font-medium text-brand-700">
              Open {FOLLOW_UP_CHANNEL_LABELS[composerChannel].toLowerCase()}
            </p>
          ) : null}
        </button>
      ) : (
        <p className="mt-2 text-xs text-slate-500">
          {total === 0
            ? "No follow-ups scheduled."
            : open.length === 0
              ? `${closed.length} done or skipped — nothing open.`
              : "No open follow-ups."}
        </p>
      )}

      {total > 0 && !nextFu ? (
        <button
          type="button"
          onClick={onSeeAll}
          className="mt-2 text-[11px] font-medium text-brand-600 hover:text-brand-700"
        >
          View history
        </button>
      ) : null}
    </div>
  );
}

type MoveFollowUpsSidebarProps = {
  move: MoveRecord;
  open: boolean;
  onClose: () => void;
  onAddFollowUp?: () => void;
  onOpenChannel?: (channel: FollowUpComposerChannel) => void;
};

export function MoveFollowUpsSidebar({
  move,
  open: sidebarOpen,
  onClose,
  onAddFollowUp,
  onOpenChannel,
}: MoveFollowUpsSidebarProps) {
  const { open: openTasks, closed } = partitionMoveFollowUps(move.followUps);

  if (!sidebarOpen) return null;

  return (
    <DetailSidebar
      open
      title="Follow-ups"
      description={`${openTasks.length} open${closed.length > 0 ? ` · ${closed.length} done or skipped` : ""}`}
      onClose={onClose}
      widthClassName="max-w-lg"
      bodyClassName="overflow-y-auto px-4 py-4"
      footer={
        onAddFollowUp ? (
          <div className="border-t border-slate-200 bg-slate-50/90 px-4 py-4">
            <Button type="button" className="w-full" variant="secondary" onClick={onAddFollowUp}>
              <CalendarPlus className="h-4 w-4" />
              Add follow-up task
            </Button>
          </div>
        ) : undefined
      }
    >
      <MoveFollowUpsList move={move} onOpenChannel={onOpenChannel} />
    </DetailSidebar>
  );
}
