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
const MANUAL_NEEDS_REPLY_KEY = "movehq-inbox-manual-needs-reply-v1";
const READ_STATE_KEY = "movehq-inbox-read-state-v1";

type InboxContextValue = {
  threads: InboxThread[];
  summaryForRep: (repFilter: string) => InboxSummary;
  mySummary: InboxSummary;
  markThreadRead: (threadId: string) => void;
  markThreadUnread: (threadId: string) => void;
  dismissNeedsReply: (threadId: string) => void;
  markNeedsReply: (threadId: string) => void;
  getThread: (threadId: string) => InboxThread | undefined;
};

const InboxContext = createContext<InboxContextValue | null>(null);

function readStringMap(key: string): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

function writeStringMap(key: string, map: Record<string, string>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(map));
}

function readReadState(): Record<string, Record<string, boolean>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(READ_STATE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, Record<string, boolean>>;
  } catch {
    return {};
  }
}

function writeReadState(map: Record<string, Record<string, boolean>>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(READ_STATE_KEY, JSON.stringify(map));
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

/** Combine the heuristic with manual "mark waiting" and "clear" — most recent action wins. */
function resolveNeedsReply(
  thread: InboxThread,
  dismissedAt: string | undefined,
  manualAt: string | undefined,
): boolean {
  const dismissedTime = dismissedAt ? new Date(dismissedAt).getTime() : 0;
  const manualTime = manualAt ? new Date(manualAt).getTime() : 0;
  if (manualTime && manualTime >= dismissedTime) return true;
  return effectiveNeedsReply(thread, dismissedAt);
}

function latestMessageId(thread: InboxThread): string | null {
  const sorted = [...thread.messages].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );
  return sorted[0]?.id ?? null;
}

function applyReadState(
  built: InboxThread[],
  readByMessage: Record<string, Record<string, boolean>>,
): InboxThread[] {
  return built.map((thread) => {
    const saved = readByMessage[thread.id];
    if (!saved) return thread;
    const messages = thread.messages.map((m) => {
      const override = saved[m.id];
      if (override === undefined) return m;
      return { ...m, read: override };
    });
    const unreadCount = messages.filter((m) => !m.read).length;
    return { ...thread, messages, unreadCount };
  });
}

function applyNeedsReplyOverrides(
  threads: InboxThread[],
  dismissedAtByThread: Record<string, string>,
  manualAtByThread: Record<string, string>,
): InboxThread[] {
  return threads.map((thread) => ({
    ...thread,
    needsReply: resolveNeedsReply(
      thread,
      dismissedAtByThread[thread.id],
      manualAtByThread[thread.id],
    ),
  }));
}

export function InboxProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const { moves } = useMovesData();
  const [readByMessage, setReadByMessage] = useState<Record<string, Record<string, boolean>>>(
    {},
  );
  const [dismissedNeedsReplyAt, setDismissedNeedsReplyAt] = useState<Record<string, string>>({});
  const [manualNeedsReplyAt, setManualNeedsReplyAt] = useState<Record<string, string>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDismissedNeedsReplyAt(readStringMap(DISMISSED_NEEDS_REPLY_KEY));
    setManualNeedsReplyAt(readStringMap(MANUAL_NEEDS_REPLY_KEY));
    setReadByMessage(readReadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeStringMap(DISMISSED_NEEDS_REPLY_KEY, dismissedNeedsReplyAt);
  }, [dismissedNeedsReplyAt, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    writeStringMap(MANUAL_NEEDS_REPLY_KEY, manualNeedsReplyAt);
  }, [manualNeedsReplyAt, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    writeReadState(readByMessage);
  }, [readByMessage, hydrated]);

  const threads = useMemo(() => {
    const built = buildInboxThreadsFromMoves(moves);
    const withRead = applyReadState(built, readByMessage);
    return applyNeedsReplyOverrides(withRead, dismissedNeedsReplyAt, manualNeedsReplyAt);
  }, [moves, readByMessage, dismissedNeedsReplyAt, manualNeedsReplyAt]);

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

  const markThreadUnread = useCallback((threadId: string) => {
    setReadByMessage((prev) => {
      const thread = threads.find((t) => t.id === threadId);
      if (!thread) return prev;
      const latestId = latestMessageId(thread);
      if (!latestId) return prev;
      return { ...prev, [threadId]: { ...prev[threadId], [latestId]: false } };
    });
  }, [threads]);

  const dismissNeedsReply = useCallback((threadId: string) => {
    setDismissedNeedsReplyAt((prev) => ({
      ...prev,
      [threadId]: new Date().toISOString(),
    }));
  }, []);

  const markNeedsReply = useCallback((threadId: string) => {
    setManualNeedsReplyAt((prev) => ({
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
      markThreadUnread,
      dismissNeedsReply,
      markNeedsReply,
      getThread,
    }),
    [
      threads,
      summaryForRep,
      mySummary,
      markThreadRead,
      markThreadUnread,
      dismissNeedsReply,
      markNeedsReply,
      getThread,
    ],
  );

  return <InboxContext.Provider value={value}>{children}</InboxContext.Provider>;
}

export function useInbox() {
  const ctx = useContext(InboxContext);
  if (!ctx) throw new Error("useInbox must be used within InboxProvider");
  return ctx;
}
