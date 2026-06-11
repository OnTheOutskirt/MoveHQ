"use client";

import { useMovesData } from "@/components/moves/MovesProvider";
import { buildInboxThreadsFromMoves } from "@/lib/inbox/build-threads";
import { inboxSummaryForThreads } from "@/lib/inbox/inbox-summary";
import type { InboxSummary } from "@/lib/inbox/inbox-summary";
import type { InboxThread } from "@/lib/inbox/types";
import { useSession } from "@/components/providers/SessionProvider";
import { repFilterForPersona } from "@/lib/session/personas";
import {
  createContext,
  useCallback,
  useContext,
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

function applyReadState(
  built: InboxThread[],
  readByMessage: Record<string, Record<string, boolean>>,
): InboxThread[] {
  return built.map((thread) => {
    const saved = readByMessage[thread.id];
    if (!saved) return thread;
    const messages = thread.messages.map((m) =>
      saved[m.id] === true ? { ...m, read: true } : m,
    );
    const unreadCount = messages.filter((m) => !m.read).length;
    return { ...thread, messages, unreadCount };
  });
}

export function InboxProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const { moves } = useMovesData();
  const [readByMessage, setReadByMessage] = useState<Record<string, Record<string, boolean>>>(
    {},
  );

  const threads = useMemo(() => {
    const built = buildInboxThreadsFromMoves(moves);
    return applyReadState(built, readByMessage);
  }, [moves, readByMessage]);

  const markThreadRead = useCallback((threadId: string) => {
    setReadByMessage((prev) => {
      const thread = threads.find((t) => t.id === threadId);
      if (!thread) return prev;
      const nextThread: Record<string, boolean> = { ...prev[threadId] };
      for (const message of thread.messages) {
        nextThread[message.id] = true;
      }
      return { ...prev, [threadId]: nextThread };
    });
  }, [threads]);

  const getThread = useCallback(
    (threadId: string) => threads.find((t) => t.id === threadId),
    [threads],
  );

  const summaryForRep = useCallback(
    (repFilter: string) => inboxSummaryForThreads(threads, repFilter),
    [threads],
  );

  const mySummary = useMemo(
    () => inboxSummaryForThreads(threads, repFilterForPersona(user)),
    [threads, user.id, user.followUpScope, user.assignedRep],
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
