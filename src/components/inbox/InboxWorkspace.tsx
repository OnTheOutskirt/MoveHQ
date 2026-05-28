"use client";

import { InboxConversation } from "@/components/inbox/InboxConversation";
import { InboxThreadList } from "@/components/inbox/InboxThreadList";
import { useInbox } from "@/components/providers/InboxProvider";
import { useMoves } from "@/components/moves/MovesProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { threadMatchesFilter } from "@/lib/inbox/build-threads";
import type { InboxFilter } from "@/lib/inbox/types";
import { pageMeta } from "@/lib/navigation/page-meta";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

const meta = pageMeta["/inbox"];

const FILTER_PILLS: { id: InboxFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "needs_reply", label: "Needs reply" },
  { id: "call", label: "Calls" },
  { id: "sms", label: "SMS" },
  { id: "email", label: "Email" },
];

export function InboxWorkspace() {
  const { moves } = useMoves();
  const { threads, summaryForRep, markThreadRead } = useInbox();
  const [repFilter, setRepFilter] = useState("all");
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const reps = useMemo(
    () => [...new Set(moves.map((m) => m.assignedRep))].sort(),
    [moves],
  );

  const summary = useMemo(() => summaryForRep(repFilter), [summaryForRep, repFilter]);

  const filteredThreads = useMemo(() => {
    let list = threads;
    if (repFilter !== "all") {
      list = list.filter((t) => t.assignedRep === repFilter);
    }
    list = list.filter((t) => threadMatchesFilter(t, filter));
    return list;
  }, [threads, repFilter, filter]);

  const selectedThread = useMemo(
    () => filteredThreads.find((t) => t.id === selectedId) ?? filteredThreads[0] ?? null,
    [filteredThreads, selectedId],
  );

  function selectThread(threadId: string) {
    setSelectedId(threadId);
    markThreadRead(threadId);
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <PageHeader title={meta.title} />

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {FILTER_PILLS.map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => {
                setFilter(pill.id);
                setSelectedId(null);
              }}
              className={cn(
                "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                filter === pill.id
                  ? "border-brand-600 bg-brand-50 text-brand-800"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
              )}
            >
              {pill.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-3">
          <p className="text-sm text-slate-500 whitespace-nowrap">
            {summary.unread > 0 ? (
              <span className="font-medium text-brand-700">{summary.unread} unread</span>
            ) : (
              "No unread"
            )}
            {summary.needsReply > 0 ? (
              <>
                <span className="text-slate-300"> · </span>
                <span className="font-medium text-amber-800">{summary.needsReply} need reply</span>
              </>
            ) : null}
          </p>
          <select
            value={repFilter}
            onChange={(e) => {
              setRepFilter(e.target.value);
              setSelectedId(null);
            }}
            aria-label="Filter by salesperson"
            className="h-9 shrink-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="all">All salespeople</option>
            {reps.map((rep) => (
              <option key={rep} value={rep}>
                {rep}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div
          className={cn(
            "flex min-h-0 w-full flex-col overflow-hidden border-slate-200 md:w-96 md:shrink-0 md:border-r",
            selectedThread ? "hidden md:flex" : "flex",
          )}
        >
          <div className="shrink-0 border-b border-slate-100 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Conversations ({filteredThreads.length})
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <InboxThreadList
              threads={filteredThreads}
              selectedId={selectedThread?.id ?? null}
              onSelect={selectThread}
            />
          </div>
        </div>

        <div
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
            selectedThread ? "flex" : "hidden md:flex",
          )}
        >
          {selectedThread ? (
            <>
              <div className="flex shrink-0 items-center border-b border-slate-100 px-3 py-2 md:hidden">
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="text-sm font-medium text-brand-600"
                >
                  ← Back to list
                </button>
              </div>
              <InboxConversation thread={selectedThread} />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-slate-500">
              Select a conversation to view calls, texts, and email in one thread.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
