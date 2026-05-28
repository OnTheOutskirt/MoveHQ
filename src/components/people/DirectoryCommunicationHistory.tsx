"use client";

import { useMoves } from "@/components/moves/MovesProvider";
import { formatActivityTime } from "@/lib/moves/format";
import {
  DIRECTORY_CHANNEL_LABELS,
  getPersonAllCommunicationHistory,
  type DirectoryContactChannel,
} from "@/lib/people/contact-communication-history";
import { cn } from "@/lib/utils";
import { useMemo, useState, type ReactNode } from "react";

type DirectoryCommunicationHistoryProps = {
  moveIds: string[];
  limit?: number;
};

type ChannelFilter = "all" | DirectoryContactChannel;

export function DirectoryCommunicationHistory({
  moveIds,
  limit = 12,
}: DirectoryCommunicationHistoryProps) {
  const { moves } = useMoves();
  const [filter, setFilter] = useState<ChannelFilter>("all");

  const allItems = useMemo(
    () => getPersonAllCommunicationHistory(moves, moveIds),
    [moves, moveIds],
  );

  const filtered = useMemo(() => {
    const list = filter === "all" ? allItems : allItems.filter((i) => i.channel === filter);
    return list.slice(0, limit);
  }, [allItems, filter, limit]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Communication history
        </p>
        <div className="flex flex-wrap gap-1">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            All
          </FilterChip>
          {(["call", "sms", "email"] as DirectoryContactChannel[]).map((ch) => (
            <FilterChip key={ch} active={filter === ch} onClick={() => setFilter(ch)}>
              {DIRECTORY_CHANNEL_LABELS[ch]}
            </FilterChip>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">
          {moveIds.length === 0
            ? "No linked moves — log calls, texts, and emails from a move record."
            : "No calls, texts, or emails yet on linked moves."}
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {filtered.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 ring-1 ring-slate-200">
                  {DIRECTORY_CHANNEL_LABELS[item.channel]}
                </span>
                {item.moveReference ? (
                  <span className="font-mono text-[10px] text-slate-400">{item.moveReference}</span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-slate-800">{item.summary}</p>
              <p className="mt-1 text-[10px] text-slate-400">
                {formatActivityTime(item.at)}
                {item.actor ? ` · ${item.actor}` : null}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors",
        active
          ? "bg-brand-600 text-white"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200",
      )}
    >
      {children}
    </button>
  );
}
