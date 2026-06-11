"use client";

import { FollowUpTaskDetail } from "@/components/follow-ups/FollowUpTaskDetail";
import { FollowUpTaskRow } from "@/components/follow-ups/FollowUpTaskRow";
import { TabBar } from "@/components/shared/TabBar";
import {
  FOLLOW_UP_TABS,
  followUpQueueForRep,
  followUpSummaryForRep,
  followUpTabCountsForRep,
  groupFollowUpQueue,
  type FollowUpBucket,
  type FollowUpQueueItem,
  type FollowUpTabId,
} from "@/lib/moves/follow-ups";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

const BUCKET_SECTION: Record<
  FollowUpBucket,
  { title: string; accent: string }
> = {
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
  const [activeTab, setActiveTab] = useState<FollowUpTabId>("follow_ups");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const tabCounts = useMemo(() => followUpTabCountsForRep(moves, rep), [moves, rep]);
  const summary = useMemo(() => followUpSummaryForRep(moves, rep), [moves, rep]);

  const tabs = useMemo(
    () =>
      FOLLOW_UP_TABS.map((tab) => ({
        ...tab,
        label: `${tab.label} (${tabCounts[tab.id]})`,
      })),
    [tabCounts],
  );

  const queueItems = useMemo(
    () => followUpQueueForRep(moves, rep, activeTab),
    [moves, rep, activeTab],
  );

  const grouped = useMemo(() => groupFollowUpQueue(queueItems), [queueItems]);

  const selectedItem = useMemo(
    () => queueItems.find((item) => item.followUp.id === selectedId) ?? queueItems[0] ?? null,
    [queueItems, selectedId],
  );

  useEffect(() => {
    setSelectedId(null);
  }, [rep, activeTab]);

  return (
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
      </div>

      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab as FollowUpTabId)}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div
          className={cn(
            "flex min-h-0 w-full flex-col overflow-hidden border-slate-200 lg:w-[52%] lg:border-r",
            selectedItem ? "hidden lg:flex" : "flex",
          )}
        >
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {queueItems.length === 0 ? (
              <p className="px-2 py-8 text-center text-sm text-slate-500">
                No {FOLLOW_UP_TABS.find((t) => t.id === activeTab)?.label.toLowerCase()} for{" "}
                {rep.split(" ")[0]} right now.
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
                          <span className="ml-1.5 font-normal text-slate-600">
                            ({items.length})
                          </span>
                        </h3>
                      </div>
                      <ul className="space-y-2">
                        {items.map((item) => (
                          <li key={item.followUp.id}>
                            <FollowUpTaskRow
                              item={item}
                              selected={selectedItem?.followUp.id === item.followUp.id}
                              onSelect={() => setSelectedId(item.followUp.id)}
                            />
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white",
            selectedItem ? "flex" : "hidden lg:flex",
          )}
        >
          {selectedItem ? (
            <>
              <div className="flex shrink-0 items-center border-b border-slate-100 px-3 py-2 lg:hidden">
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="text-sm font-medium text-brand-600"
                >
                  ← Back to list
                </button>
              </div>
              <FollowUpTaskDetail item={selectedItem} />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-slate-500">
              Select a follow-up to see move details and next steps.
            </div>
          )}
        </div>
      </div>
    </div>
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
