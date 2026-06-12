import { compareSalesPriority } from "./move-priority-tier";
import { followUpOriginKind } from "./move-follow-ups";
import {
  getFollowUpDueBucket,
  getOpenFollowUps,
  moveHasFollowUpDueToday,
  moveHasNoScheduledFollowUp,
  moveHasOpenFollowUp,
  moveHasOverdueFollowUp,
  type FollowUpDueBucket,
  type FollowUpOriginKind,
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

export type FollowUpOriginFilter = "all" | FollowUpOriginKind;

export type FollowUpQueueItem = {
  followUp: MoveFollowUp;
  move: MoveRecord;
  bucket: FollowUpDueBucket;
};

export function followUpMatchesOriginFilter(
  followUp: MoveFollowUp,
  filter: FollowUpOriginFilter,
): boolean {
  if (filter === "all") return true;
  return followUpOriginKind(followUp) === filter;
}

export function followUpQueueForRep(
  moves: MoveRecord[],
  rep: string,
  originFilter: FollowUpOriginFilter = "all",
): FollowUpQueueItem[] {
  const items: FollowUpQueueItem[] = [];
  for (const move of moves) {
    if (move.assignedRep !== rep) continue;
    for (const followUp of getOpenFollowUps(move)) {
      if (!followUpMatchesOriginFilter(followUp, originFilter)) continue;
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

export function followUpOriginCountsForRep(
  moves: MoveRecord[],
  rep: string,
): Record<FollowUpOriginFilter, number> {
  return {
    all: followUpQueueForRep(moves, rep, "all").length,
    manual: followUpQueueForRep(moves, rep, "manual").length,
    automated: followUpQueueForRep(moves, rep, "automated").length,
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
