"use client";

import { FollowUpListRow } from "@/components/follow-ups/FollowUpListRow";
import { FollowUpOriginFilterBar } from "@/components/follow-ups/FollowUpOriginFilterBar";
import { MoveQuickActionSidebar } from "@/components/moves/detail/MoveQuickActionSidebar";
import { useMoves } from "@/components/moves/MovesProvider";
import type { FollowUpComposerChannel } from "@/lib/moves/follow-up-display";
import { moveRouteLabel } from "@/lib/moves/format";
import {
  followUpOriginCountsForRep,
  followUpQueueForRep,
  followUpSummaryForRep,
  groupFollowUpQueue,
  type FollowUpBucket,
} from "@/lib/moves/follow-ups";
import type { FollowUpOriginKind } from "@/lib/moves/follow-up-display";
import type { MoveQuickActionId } from "@/lib/moves/quick-actions";
import type { MoveRecord } from "@/lib/moves/types";
import { salesMovePath } from "@/lib/navigation/routes";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

const BUCKET_SECTION: Record<FollowUpBucket, { title: string; accent: string }> = {
  overdue: {
    title: "Overdue",
    accent: "border-amber-300 bg-amber-50/60",
  },
  today: {
    title: "Due today",
    accent: "border-brand-200 bg-brand-50/40",
  },
  upcoming: {
    title: "Coming up",
    accent: "border-slate-200 bg-slate-50/50",
  },
};

type FollowUpsRepPanelProps = {
  rep: string;
  moves: MoveRecord[];
};

export function FollowUpsRepPanel({ rep, moves }: FollowUpsRepPanelProps) {
  const { updateFollowUpStatus } = useMoves();
  const [originFilter, setOriginFilter] = useState<FollowUpOriginKind>("manual");
  const [composerMoveId, setComposerMoveId] = useState<string | null>(null);
  const [composerAction, setComposerAction] = useState<MoveQuickActionId | null>(null);

  const originCounts = useMemo(() => followUpOriginCountsForRep(moves, rep), [moves, rep]);
  const summary = useMemo(() => followUpSummaryForRep(moves, rep), [moves, rep]);

  const queueItems = useMemo(
    () => followUpQueueForRep(moves, rep, originFilter),
    [moves, rep, originFilter],
  );

  const grouped = useMemo(() => groupFollowUpQueue(queueItems), [queueItems]);

  const composerMove = useMemo(
    () => (composerMoveId ? moves.find((move) => move.id === composerMoveId) ?? null : null),
    [composerMoveId, moves],
  );

  function openComposer(move: MoveRecord, channel: FollowUpComposerChannel) {
    setComposerMoveId(move.id);
    setComposerAction(channel);
  }

  function closeComposer() {
    setComposerAction(null);
    setComposerMoveId(null);
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-slate-100 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">{rep}</h2>
              <p className="text-xs text-slate-500">
                {summary.total} open
                {summary.overdue > 0 ? (
                  <span className="font-medium text-amber-800"> · {summary.overdue} overdue</span>
                ) : null}
              </p>
            </div>
            <div className="flex gap-2 text-center text-[10px]">
              <MiniStat label="Overdue" value={summary.overdue} urgent={summary.overdue > 0} />
              <MiniStat label="Today" value={summary.today} />
              <MiniStat label="Upcoming" value={summary.upcoming} />
            </div>
          </div>

          <FollowUpOriginFilterBar
            className="mt-3"
            value={originFilter}
            onChange={setOriginFilter}
            counts={{
              manual: originCounts.manual,
              automated: originCounts.automated,
            }}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {queueItems.length === 0 ? (
            <p className="px-2 py-8 text-center text-sm text-slate-500">
              No open {originFilter} follow-ups for {rep.split(" ")[0]}.
            </p>
          ) : (
            <div className="space-y-6">
              {(["overdue", "today", "upcoming"] as const).map((bucket) => {
                const items = grouped[bucket];
                if (items.length === 0) return null;
                const cfg = BUCKET_SECTION[bucket];
                return (
                  <section key={bucket}>
                    <div className={cn("mb-2 rounded-md border px-3 py-1.5", cfg.accent)}>
                      <h3 className="text-xs font-semibold text-slate-900">
                        {cfg.title}
                        <span className="ml-1.5 font-normal text-slate-600">({items.length})</span>
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {items.map((item) => (
                        <FollowUpListRow
                          key={item.followUp.id}
                          followUp={item.followUp}
                          moveContext={{
                            customerName: item.move.customerName,
                            route: moveRouteLabel(
                              item.move.originAddress,
                              item.move.destinationAddress,
                            ),
                            moveHref: salesMovePath(item.move.id),
                          }}
                          onOpenChannel={(channel) => openComposer(item.move, channel)}
                          onComplete={() =>
                            updateFollowUpStatus(item.move.id, item.followUp.id, "completed")
                          }
                          onSkip={() =>
                            updateFollowUpStatus(item.move.id, item.followUp.id, "skipped")
                          }
                        />
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {composerMove && composerAction ? (
        <MoveQuickActionSidebar
          move={composerMove}
          action={composerAction}
          onClose={closeComposer}
        />
      ) : null}
    </>
  );
}

function MiniStat({
  label,
  value,
  urgent,
}: {
  label: string;
  value: number;
  urgent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md border px-2 py-1",
        urgent ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white",
      )}
    >
      <p className="font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p
        className={cn(
          "text-sm font-bold tabular-nums",
          urgent ? "text-amber-900" : "text-slate-900",
        )}
      >
        {value}
      </p>
    </div>
  );
}
