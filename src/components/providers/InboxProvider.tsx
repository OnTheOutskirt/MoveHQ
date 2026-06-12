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
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const DISMISSED_NEEDS_REPLY_KEY = "movehq-inbox-dismissed-needs-reply-v1";

type InboxContextValue = {
  threads: InboxThread[];
  summaryForRep: (repFilter: string) => InboxSummary;
  mySummary: InboxSummary;
  markThreadRead: (threadId: string) => void;
  dismissNeedsReply: (threadId: string) => void;
  getThread: (threadId: string) => InboxThread | undefined;
};

const InboxContext = createContext<InboxContextValue | null>(null);

function readDismissedNeedsReplyAt(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(DISMISSED_NEEDS_REPLY_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

function writeDismissedNeedsReplyAt(map: Record<string, string>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DISMISSED_NEEDS_REPLY_KEY, JSON.stringify(map));
}

function lastInboundAt(thread: InboxThread): string | null {
  const inbound = thread.messages
    .filter((m) => m.direction === "inbound")
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  return inbound[0]?.at ?? null;
}

function effectiveNeedsReply(thread: InboxThread, dismissedAt: string | undefined): boolean {
  if (!thread.needsReply) return false;
  if (!dismissedAt) return true;
  const inboundAt = lastInboundAt(thread);
  if (!inboundAt) return false;
  return new Date(inboundAt).getTime() > new Date(dismissedAt).getTime();
}

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

function applyNeedsReplyDismissals(
  threads: InboxThread[],
  dismissedAtByThread: Record<string, string>,
): InboxThread[] {
  return threads.map((thread) => ({
    ...thread,
    needsReply: effectiveNeedsReply(thread, dismissedAtByThread[thread.id]),
  }));
}

export function InboxProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const { moves } = useMovesData();
  const [readByMessage, setReadByMessage] = useState<Record<string, Record<string, boolean>>>(
    {},
  );
  const [dismissedNeedsReplyAt, setDismissedNeedsReplyAt] = useState<Record<string, string>>({});

  useEffect(() => {
    setDismissedNeedsReplyAt(readDismissedNeedsReplyAt());
  }, []);

  useEffect(() => {
    writeDismissedNeedsReplyAt(dismissedNeedsReplyAt);
  }, [dismissedNeedsReplyAt]);

  const threads = useMemo(() => {
    const built = buildInboxThreadsFromMoves(moves);
    const withRead = applyReadState(built, readByMessage);
    return applyNeedsReplyDismissals(withRead, dismissedNeedsReplyAt);
  }, [moves, readByMessage, dismissedNeedsReplyAt]);

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

  const dismissNeedsReply = useCallback((threadId: string) => {
    setDismissedNeedsReplyAt((prev) => ({
      ...prev,
      [threadId]: new Date().toISOString(),
    }));
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
    () => inboxSummaryForThreads(threads, repFilterForPersona(user)),
    [threads, user.id, user.followUpScope, user.assignedRep],
  );

  const value = useMemo(
    () => ({
      threads,
      summaryForRep,
      mySummary,
      markThreadRead,
      dismissNeedsReply,
      getThread,
    }),
    [threads, summaryForRep, mySummary, markThreadRead, dismissNeedsReply, getThread],
  );

  return <InboxContext.Provider value={value}>{children}</InboxContext.Provider>;
}

export function useInbox() {
  const ctx = useContext(InboxContext);
  if (!ctx) throw new Error("useInbox must be used within InboxProvider");
  return ctx;
}
