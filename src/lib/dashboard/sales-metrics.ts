import { startOfMonth, toDateKey } from "@/lib/calendar/date-utils";
import { websiteQueueSummary, websiteQueueTotal } from "@/lib/moves/acquisition";
import { showOnPipelineBoard } from "@/lib/moves/move-condition";
import { followUpCountsByRep, followUpSummary } from "@/lib/moves/follow-ups";
import {
  getMovesPipelineBoardStages,
  isPreBookPipelineStage,
} from "@/lib/moves/move-pipeline";
import type { MoveRecord, PipelineStageId } from "@/lib/moves/types";
import {
  buildWalkthroughListItems,
  filterWalkthroughsByAssignee,
} from "@/lib/moves/walkthroughs";
import { startOfWeek } from "@/lib/settings/business-calendar";
import type { WeekStartsOn } from "@/lib/settings/types";

export type SalesRepFilter = "all" | string;

export function filterMovesForSalesRep(
  moves: MoveRecord[],
  rep: SalesRepFilter,
): MoveRecord[] {
  if (rep === "all") return moves;
  return moves.filter((m) => m.assignedRep === rep);
}

export function salesRepsFromMoves(moves: MoveRecord[]): string[] {
  return [...new Set(moves.map((m) => m.assignedRep))].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
}

function isBookedOrCompleted(move: MoveRecord): boolean {
  return move.pipelineStage === "booked" || move.pipelineStage === "completed";
}

function bookingDateKey(move: MoveRecord): string {
  return move.websiteIntake?.bookedAt?.slice(0, 10) ?? move.updatedAt.slice(0, 10);
}

function moveQuoteValue(move: MoveRecord): number {
  return move.quoteAmount ?? 0;
}

function isOpenPipelineMove(move: MoveRecord): boolean {
  return showOnPipelineBoard(move) && isPreBookPipelineStage(move.pipelineStage);
}

export type SalesLeaderboardRow = {
  rep: string;
  openPipeline: number;
  pipelineValue: number;
  followUpsOverdue: number;
  bookedThisMonth: number;
  bookedRevenueMonth: number;
};

export type SalesDashboardMetrics = {
  repFilter: SalesRepFilter;
  followUps: ReturnType<typeof followUpSummary>;
  pipeline: {
    openCount: number;
    byStage: Partial<Record<PipelineStageId, number>>;
    totalQuoteValue: number;
  };
  webQuotes: ReturnType<typeof websiteQueueSummary> & { total: number };
  walkthroughs: {
    needsScheduling: number;
    scheduled: number;
    total: number;
  };
  bookings: {
    thisWeek: number;
    thisMonth: number;
    weekRevenue: number;
    monthRevenue: number;
  };
  lostRecent: {
    count30Days: number;
    samples: Array<{
      id: string;
      customerName: string;
      lostReason: string | null;
      lostAt: string | null;
    }>;
  };
  leaderboard: SalesLeaderboardRow[] | null;
};

export type ComputeSalesDashboardMetricsInput = {
  moves: MoveRecord[];
  repFilter: SalesRepFilter;
  includeLeaderboard: boolean;
  today?: Date;
  weekStartsOn?: WeekStartsOn;
};

export function computeSalesDashboardMetrics(
  input: ComputeSalesDashboardMetricsInput,
): SalesDashboardMetrics {
  const today = input.today ?? new Date();
  const weekStartsOn = input.weekStartsOn ?? "monday";
  const weekStartKey = toDateKey(startOfWeek(today, weekStartsOn));
  const monthStartKey = toDateKey(startOfMonth(today));
  const todayKey = toDateKey(today);
  const lostSinceKey = toDateKey(
    new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30),
  );

  const scoped = filterMovesForSalesRep(input.moves, input.repFilter);
  const boardStages = getMovesPipelineBoardStages().filter(isPreBookPipelineStage);

  const byStage: Partial<Record<PipelineStageId, number>> = {};
  let openCount = 0;
  let totalQuoteValue = 0;

  for (const stage of boardStages) {
    byStage[stage] = 0;
  }

  for (const move of scoped) {
    if (!isOpenPipelineMove(move)) continue;
    openCount += 1;
    byStage[move.pipelineStage] = (byStage[move.pipelineStage] ?? 0) + 1;
    totalQuoteValue += moveQuoteValue(move);
  }

  const webSummary = websiteQueueSummary(scoped);

  const walkthroughItems = filterWalkthroughsByAssignee(
    buildWalkthroughListItems(scoped),
    input.repFilter,
  );
  const needsScheduling = walkthroughItems.filter((item) => item.needsScheduling).length;
  const scheduled = walkthroughItems.filter((item) => !item.needsScheduling).length;

  let bookedThisWeek = 0;
  let bookedThisMonth = 0;
  let weekRevenue = 0;
  let monthRevenue = 0;

  for (const move of scoped) {
    if (!isBookedOrCompleted(move)) continue;
    const bookedKey = bookingDateKey(move);
    const value = moveQuoteValue(move);
    if (bookedKey >= weekStartKey && bookedKey <= todayKey) {
      bookedThisWeek += 1;
      weekRevenue += value;
    }
    if (bookedKey >= monthStartKey && bookedKey <= todayKey) {
      bookedThisMonth += 1;
      monthRevenue += value;
    }
  }

  const lostMoves = scoped
    .filter(
      (move) =>
        move.conditionStatus === "lost" &&
        move.lostAt != null &&
        move.lostAt.slice(0, 10) >= lostSinceKey,
    )
    .sort((a, b) => (b.lostAt ?? "").localeCompare(a.lostAt ?? ""));

  const leaderboard = input.includeLeaderboard
    ? buildSalesLeaderboard(input.moves, monthStartKey, todayKey)
    : null;

  return {
    repFilter: input.repFilter,
    followUps: followUpSummary(scoped),
    pipeline: {
      openCount,
      byStage,
      totalQuoteValue,
    },
    webQuotes: {
      ...webSummary,
      total: websiteQueueTotal(scoped),
    },
    walkthroughs: {
      needsScheduling,
      scheduled,
      total: walkthroughItems.length,
    },
    bookings: {
      thisWeek: bookedThisWeek,
      thisMonth: bookedThisMonth,
      weekRevenue,
      monthRevenue,
    },
    lostRecent: {
      count30Days: lostMoves.length,
      samples: lostMoves.slice(0, 5).map((move) => ({
        id: move.id,
        customerName: move.customerName,
        lostReason: move.lostReason,
        lostAt: move.lostAt,
      })),
    },
    leaderboard,
  };
}

function buildSalesLeaderboard(
  moves: MoveRecord[],
  monthStartKey: string,
  todayKey: string,
): SalesLeaderboardRow[] {
  const reps = salesRepsFromMoves(moves);
  const followUpByRep = new Map(followUpCountsByRep(moves).map((row) => [row.rep, row]));

  return reps
    .map((rep) => {
      const repMoves = filterMovesForSalesRep(moves, rep);
      let openPipeline = 0;
      let pipelineValue = 0;
      let bookedThisMonth = 0;
      let bookedRevenueMonth = 0;

      for (const move of repMoves) {
        if (isOpenPipelineMove(move)) {
          openPipeline += 1;
          pipelineValue += moveQuoteValue(move);
        }
        if (!isBookedOrCompleted(move)) continue;
        const bookedKey = bookingDateKey(move);
        if (bookedKey >= monthStartKey && bookedKey <= todayKey) {
          bookedThisMonth += 1;
          bookedRevenueMonth += moveQuoteValue(move);
        }
      }

      return {
        rep,
        openPipeline,
        pipelineValue,
        followUpsOverdue: followUpByRep.get(rep)?.overdue ?? 0,
        bookedThisMonth,
        bookedRevenueMonth,
      };
    })
    .sort(
      (a, b) =>
        b.bookedRevenueMonth - a.bookedRevenueMonth ||
        b.openPipeline - a.openPipeline ||
        a.rep.localeCompare(b.rep),
    );
}

export function salesDashboardHasUrgentAttention(metrics: SalesDashboardMetrics): boolean {
  return (
    metrics.followUps.overdue > 0 ||
    metrics.webQuotes.booked_review > 0 ||
    metrics.walkthroughs.needsScheduling > 0
  );
}
