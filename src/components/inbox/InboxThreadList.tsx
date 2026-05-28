"use client";

import { formatActivityTime } from "@/lib/moves/format";
import type { InboxChannel, InboxThread } from "@/lib/inbox/types";
import { cn } from "@/lib/utils";
import { Mail, MessageSquare, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const CHANNEL_ICONS: Record<InboxChannel, LucideIcon> = {
  call: Phone,
  sms: MessageSquare,
  email: Mail,
};

type InboxThreadListProps = {
  threads: InboxThread[];
  selectedId: string | null;
  onSelect: (threadId: string) => void;
};

export function InboxThreadList({ threads, selectedId, onSelect }: InboxThreadListProps) {
  if (threads.length === 0) {
    return (
      <div className="flex items-center justify-center p-6 text-center text-sm text-slate-500">
        No conversations match these filters.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {threads.map((thread) => {
        const Icon = CHANNEL_ICONS[thread.lastChannel];
        const selected = thread.id === selectedId;
        return (
          <li key={thread.id}>
            <button
              type="button"
              onClick={() => onSelect(thread.id)}
              className={cn(
                "flex w-full gap-3 px-3 py-3 text-left transition-colors",
                selected ? "bg-brand-50" : "hover:bg-slate-50",
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  thread.unreadCount > 0 ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-600",
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p
                    className={cn(
                      "truncate text-sm",
                      thread.unreadCount > 0 ? "font-semibold text-slate-900" : "font-medium text-slate-800",
                    )}
                  >
                    {thread.customerName}
                  </p>
                  <span className="shrink-0 text-[10px] text-slate-400">
                    {formatActivityTime(thread.lastAt)}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  <span className="font-mono">{thread.moveReference}</span>
                  <span className="text-slate-300"> · </span>
                  {thread.assignedRep}
                </p>
                <p
                  className={cn(
                    "mt-1 line-clamp-2 text-xs leading-snug",
                    thread.unreadCount > 0 ? "text-slate-800" : "text-slate-500",
                  )}
                >
                  {thread.lastPreview}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {thread.needsReply ? (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900">
                      Needs reply
                    </span>
                  ) : null}
                  {thread.unreadCount > 0 ? (
                    <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-800">
                      {thread.unreadCount} unread
                    </span>
                  ) : null}
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
