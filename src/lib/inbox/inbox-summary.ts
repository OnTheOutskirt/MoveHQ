import type { InboxThread } from "./types";

export type InboxSummary = {
  totalThreads: number;
  unread: number;
  needsReply: number;
};

export function inboxSummaryForThreads(
  threads: InboxThread[],
  repFilter: string = "all",
): InboxSummary {
  const list =
    repFilter === "all" ? threads : threads.filter((t) => t.assignedRep === repFilter);

  return {
    totalThreads: list.length,
    unread: list.reduce((sum, t) => sum + t.unreadCount, 0),
    needsReply: list.filter((t) => t.needsReply).length,
  };
}
