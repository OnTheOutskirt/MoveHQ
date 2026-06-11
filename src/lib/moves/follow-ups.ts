import { compareSalesPriority } from "./move-priority-tier";
import {
  getFollowUpDueBucket,
  getOpenFollowUps,
  moveHasFollowUpDueToday,
  moveHasNoScheduledFollowUp,
  moveHasOpenFollowUp,
  moveHasOverdueFollowUp,
  resolveFollowUpSource,
  type FollowUpDueBucket,
} from "./move-follow-ups";
import { showOnPipelineBoard } from "./move-condition";
import type { MoveFollowUp, MoveRecord } from "./types";

export type { FollowUpDueBucket };

export type FollowUpBucket = "overdue" | "today" | "upcoming";

export function getFollowUpBucket(move: MoveRecord): FollowUpBucket | null {
  const next = getOpenFollowUps(move).sort((a, b) => a.dueAt.localeCompare(b.dueAt))[0];
  if (!next) return null;
  return getFollowUpDueBucket(next);
}

export function compareFollowUpMoves(a: MoveRecord, b: MoveRecord): number {
  return compareSalesPriority(a, b);
}

export function getFollowUpMoves(moves: MoveRecord[]): MoveRecord[] {
  return moves.filter(moveHasOpenFollowUp).sort(compareFollowUpMoves);
}

export function groupFollowUpMoves(moves: MoveRecord[]): Record<FollowUpBucket, MoveRecord[]> {
  const groups: Record<FollowUpBucket, MoveRecord[]> = {
    overdue: [],
    today: [],
    upcoming: [],
  };

  for (const move of getFollowUpMoves(moves)) {
    const bucket = getFollowUpBucket(move);
    if (bucket) groups[bucket].push(move);
  }

  return groups;
}

export function followUpSummary(moves: MoveRecord[]) {
  const groups = groupFollowUpMoves(moves);
  return {
    overdue: groups.overdue.length,
    today: groups.today.length,
    upcoming: groups.upcoming.length,
    total: groups.overdue.length + groups.today.length + groups.upcoming.length,
  };
}

export function followUpSummaryForRep(moves: MoveRecord[], rep: string) {
  const list = rep === "all" ? moves : moves.filter((m) => m.assignedRep === rep);
  return followUpSummary(list);
}

export function filterMovesForFollowUpScope(
  moves: MoveRecord[],
  rep: string,
): MoveRecord[] {
  return rep === "all" ? moves : moves.filter((m) => m.assignedRep === rep);
}

export type RepFollowUpCounts = {
  rep: string;
  total: number;
  overdue: number;
};

/** Open follow-up task counts per assigned rep, sorted by overdue then total. */
export function followUpCountsByRep(moves: MoveRecord[]): RepFollowUpCounts[] {
  const map = new Map<string, RepFollowUpCounts>();

  for (const move of moves) {
    for (const followUp of getOpenFollowUps(move)) {
      const rep = move.assignedRep;
      const entry = map.get(rep) ?? { rep, total: 0, overdue: 0 };
      entry.total += 1;
      if (getFollowUpDueBucket(followUp) === "overdue") entry.overdue += 1;
      map.set(rep, entry);
    }
  }

  return [...map.values()].sort((a, b) => {
    if (b.overdue !== a.overdue) return b.overdue - a.overdue;
    return b.total - a.total || a.rep.localeCompare(b.rep);
  });
}

export function isFollowUpDueToday(move: MoveRecord): boolean {
  return moveHasFollowUpDueToday(move);
}

export { moveHasOverdueFollowUp as isFollowUpOverdue };

export type MovesQueueFilter = "all" | "due_today" | "overdue" | "no_followup";

export function filterMovesByQueue(moves: MoveRecord[], queue: MovesQueueFilter): MoveRecord[] {
  const active = moves.filter(showOnPipelineBoard);
  switch (queue) {
    case "all":
      return active;
    case "due_today":
      return active.filter(moveHasFollowUpDueToday);
    case "overdue":
      return active.filter(moveHasOverdueFollowUp);
    case "no_followup":
      return active.filter(moveHasNoScheduledFollowUp);
  }
}

export function formatFollowUpDue(followUp: MoveFollowUp): string {
  return followUp.dueAt.slice(0, 10);
}

export const FOLLOW_UP_TABS = [
  { id: "follow_ups", label: "Follow-ups" },
  { id: "automated", label: "Automated" },
  { id: "scheduled", label: "Scheduled" },
] as const;

export type FollowUpTabId = (typeof FOLLOW_UP_TABS)[number]["id"];

export type FollowUpQueueItem = {
  followUp: MoveFollowUp;
  move: MoveRecord;
  bucket: FollowUpDueBucket;
};

export function followUpMatchesTab(followUp: MoveFollowUp, tab: FollowUpTabId): boolean {
  const bucket = getFollowUpDueBucket(followUp);
  const source = resolveFollowUpSource(followUp);
  switch (tab) {
    case "follow_ups":
      return source === "manual" || bucket === "overdue" || bucket === "today";
    case "automated":
      return source === "automation";
    case "scheduled":
      return bucket === "upcoming" || source === "scheduled";
  }
}

export function followUpQueueForRep(
  moves: MoveRecord[],
  rep: string,
  tab: FollowUpTabId,
): FollowUpQueueItem[] {
  const items: FollowUpQueueItem[] = [];
  for (const move of moves) {
    if (move.assignedRep !== rep) continue;
    for (const followUp of getOpenFollowUps(move)) {
      if (!followUpMatchesTab(followUp, tab)) continue;
      items.push({
        followUp,
        move,
        bucket: getFollowUpDueBucket(followUp),
      });
    }
  }
  return items.sort(
    (a, b) =>
      a.followUp.dueAt.localeCompare(b.followUp.dueAt) ||
      a.move.customerName.localeCompare(b.move.customerName),
  );
}

export function followUpTabCountsForRep(
  moves: MoveRecord[],
  rep: string,
): Record<FollowUpTabId, number> {
  return {
    follow_ups: followUpQueueForRep(moves, rep, "follow_ups").length,
    automated: followUpQueueForRep(moves, rep, "automated").length,
    scheduled: followUpQueueForRep(moves, rep, "scheduled").length,
  };
}

export function groupFollowUpQueue(
  items: FollowUpQueueItem[],
): Record<FollowUpBucket, FollowUpQueueItem[]> {
  const groups: Record<FollowUpBucket, FollowUpQueueItem[]> = {
    overdue: [],
    today: [],
    upcoming: [],
  };
  for (const item of items) {
    groups[item.bucket].push(item);
  }
  return groups;
}
