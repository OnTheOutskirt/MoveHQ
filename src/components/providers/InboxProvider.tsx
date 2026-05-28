"use client";

import { useMoves } from "@/components/moves/MovesProvider";
import { buildInboxThreadsFromMoves } from "@/lib/inbox/build-threads";
import { inboxSummaryForThreads } from "@/lib/inbox/inbox-summary";
import type { InboxSummary } from "@/lib/inbox/inbox-summary";
import type { InboxThread } from "@/lib/inbox/types";
import { CURRENT_USER } from "@/lib/session/current-user";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type InboxContextValue = {
  threads: InboxThread[];
  summaryForRep: (repFilter: string) => InboxSummary;
  mySummary: InboxSummary;
  markThreadRead: (threadId: string) => void;
  getThread: (threadId: string) => InboxThread | undefined;
};

const InboxContext = createContext<InboxContextValue | null>(null);

function markAllRead(thread: InboxThread): InboxThread {
  const messages = thread.messages.map((m) => ({ ...m, read: true }));
  return {
    ...thread,
    messages,
    unreadCount: 0,
    needsReply: thread.needsReply,
  };
}

export function InboxProvider({ children }: { children: ReactNode }) {
  const { moves } = useMoves();
  const [threads, setThreads] = useState<InboxThread[]>([]);

  useEffect(() => {
    setThreads((prev) => {
      const built = buildInboxThreadsFromMoves(moves);
      const readState = new Map(
        prev.map((t) => [t.id, t.messages.map((m) => [m.id, m.read] as const)]),
      );
      return built.map((thread) => {
        const saved = readState.get(thread.id);
        if (!saved) return thread;
        const messages = thread.messages.map((m) => {
          const pair = saved.find(([id]) => id === m.id);
          return pair ? { ...m, read: pair[1] } : m;
        });
        const unreadCount = messages.filter((m) => !m.read).length;
        return { ...thread, messages, unreadCount };
      });
    });
  }, [moves]);

  const markThreadRead = useCallback((threadId: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? markAllRead(t) : t)),
    );
  }, []);

  const getThread = useCallback(
    (threadId: string) => threads.find((t) => t.id === threadId),
    [threads],
  );

  const summaryForRep = useCallback(
    (repFilter: string) => inboxSummaryForThreads(threads, repFilter),
    [threads],
  );

  const mySummary = useMemo(
    () => inboxSummaryForThreads(threads, CURRENT_USER.assignedRep),
    [threads],
  );

  const value = useMemo(
    () => ({
      threads,
      summaryForRep,
      mySummary,
      markThreadRead,
      getThread,
    }),
    [threads, summaryForRep, mySummary, markThreadRead, getThread],
  );

  return <InboxContext.Provider value={value}>{children}</InboxContext.Provider>;
}

export function useInbox() {
  const ctx = useContext(InboxContext);
  if (!ctx) throw new Error("useInbox must be used within InboxProvider");
  return ctx;
}
