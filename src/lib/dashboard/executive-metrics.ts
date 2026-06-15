import type { CalendarDayData } from "@/lib/calendar/types";
import { projectedRevenueForDay } from "@/lib/calendar/revenue-projection";
import { followUpSummary } from "@/lib/moves/follow-ups";
import type { MoveRecord } from "@/lib/moves/types";
import { summarizeClaims } from "@/lib/operations/claims";
import type { MoveClaim } from "@/lib/operations/claims-types";
import { computeSalesDashboardMetrics } from "@/lib/dashboard/sales-metrics";
import { computeOpsDashboardMetrics } from "@/lib/dashboard/ops-metrics";
import type { ManualOpsPrepTask } from "@/lib/operations/ops-prep-custom-storage";
import type { OpsPrepRulesSettings } from "@/lib/settings/ops-prep-rules";
import type { InventoryStockLine } from "@/lib/operations/inventory-types";
import type { TruckCapacityBreakdown } from "@/lib/operations/fleet-capacity";
import { CEO_MONTHLY_TARGETS } from "./ceo-snapshot-targets";
import { computeMetricStatus } from "./ceo-snapshot";
import { currentMonthKey, monthWeekBuckets, parseMonthKey } from "./month-buckets";

export type ExecutiveDashboardMetrics = {
  monthKey: string;
  monthLabel: string;
  revenueMtd: number;
  revenueTarget: number;
  revenueStatus: ReturnType<typeof computeMetricStatus>;
  grossMarginPct: number | null;
  grossMarginTarget: number;
  grossMarginStatus: ReturnType<typeof computeMetricStatus>;
  openClaims: number;
  claimsTarget: number;
  claimsStatus: ReturnType<typeof computeMetricStatus>;
  moverUtilizationPct: number | null;
  truckUtilizationPct: number | null;
  pipelineValue: number;
  followUpsOverdue: number;
  webQuotesQueue: number;
  opsPrepDueToday: number;
  staffingGapsToday: number;
  attentionCount: number;
};

export type ComputeExecutiveDashboardMetricsInput = {
  moves: MoveRecord[];
  claims: MoveClaim[];
  calendarDays: Record<string, CalendarDayData>;
  manualPrepTasks: ManualOpsPrepTask[];
  prepDoneIds: Set<string>;
  opsPrepRules: OpsPrepRulesSettings;
  stockLines: InventoryStockLine[];
  fleetToday: TruckCapacityBreakdown;
  fleetTomorrow: TruckCapacityBreakdown;
  pendingTimeOff: number;
  today?: Date;
  weekStartsOn?: "sunday" | "monday";
};

function isBookedOrCompleted(move: MoveRecord): boolean {
  return move.pipelineStage === "booked" || move.pipelineStage === "completed";
}

function revenueMtdFromMoves(moves: MoveRecord[], monthKey: string): number {
  let total = 0;
  const counted = new Set<string>();
  for (const move of moves) {
    if (!isBookedOrCompleted(move)) continue;
    const dates = [
      ...move.jobDays
        .filter((d) => d.status !== "cancelled" && d.status !== "proposed")
        .map((d) => d.date),
      move.preferredDate,
    ].filter((d) => d.startsWith(monthKey));
    if (dates.length === 0) continue;
    if (counted.has(move.id)) continue;
    counted.add(move.id);
    total += move.quoteAmount ?? 0;
  }
  return total;
}

function calendarUtilization(
  calendarDays: Record<string, CalendarDayData>,
  monthKey: string,
  field: "movers" | "trucks",
): number | null {
  let booked = 0;
  let capacity = 0;
  for (const [key, day] of Object.entries(calendarDays)) {
    if (!key.startsWith(monthKey) || day.isClosed) continue;
    if (field === "movers") {
      booked += day.moversBooked;
      capacity += day.moversCapacity;
    } else {
      booked += day.trucksBooked;
      capacity += day.trucksCapacity;
    }
  }
  if (capacity <= 0) return null;
  return (booked / capacity) * 100;
}

function grossMarginEstimate(moves: MoveRecord[], monthKey: string): number | null {
  const margins: number[] = [];
  for (const move of moves) {
    if (!isBookedOrCompleted(move)) continue;
    const inMonth =
      move.preferredDate.startsWith(monthKey) ||
      move.jobDays.some((d) => d.date.startsWith(monthKey));
    if (!inMonth) continue;
    const revenue = move.quoteAmount ?? 0;
    if (revenue <= 0) continue;
    margins.push(((revenue - revenue * 0.38) / revenue) * 100);
  }
  if (margins.length === 0) return null;
  return margins.reduce((sum, m) => sum + m, 0) / margins.length;
}

export function computeExecutiveDashboardMetrics(
  input: ComputeExecutiveDashboardMetricsInput,
): ExecutiveDashboardMetrics {
  const today = input.today ?? new Date();
  const monthKey = currentMonthKey(today);
  const { year, monthIndex } = parseMonthKey(monthKey);
  const columns = monthWeekBuckets(year, monthIndex);

  const revenueMtd =
    revenueMtdFromMoves(input.moves, monthKey) ||
    Object.entries(input.calendarDays)
      .filter(([key, day]) => key.startsWith(monthKey) && !day.isClosed)
      .reduce((sum, [, day]) => sum + projectedRevenueForDay(day), 0);

  const grossMarginPct = grossMarginEstimate(input.moves, monthKey);
  const claimsSummary = summarizeClaims(input.claims);
  const sales = computeSalesDashboardMetrics({
    moves: input.moves,
    repFilter: "all",
    includeLeaderboard: false,
    today,
    weekStartsOn: input.weekStartsOn,
  });
  const ops = computeOpsDashboardMetrics({
    moves: input.moves,
    claims: input.claims,
    manualPrepTasks: input.manualPrepTasks,
    prepDoneIds: input.prepDoneIds,
    opsPrepRules: input.opsPrepRules,
    stockLines: input.stockLines,
    fleetToday: input.fleetToday,
    fleetTomorrow: input.fleetTomorrow,
    pendingTimeOff: input.pendingTimeOff,
    today,
  });
  const followUps = followUpSummary(input.moves);

  const attentionItems = [
    sales.followUps.overdue > 0,
    sales.webQuotes.booked_review > 0,
    ops.prep.overdue > 0,
    ops.todayStaffing.unstaffedRows.length > 0,
    claimsSummary.openCount > CEO_MONTHLY_TARGETS.open_claims,
  ].filter(Boolean).length;

  return {
    monthKey,
    monthLabel: columns.monthLabel,
    revenueMtd,
    revenueTarget: CEO_MONTHLY_TARGETS.revenue,
    revenueStatus: computeMetricStatus(revenueMtd, CEO_MONTHLY_TARGETS.revenue, "higher"),
    grossMarginPct,
    grossMarginTarget: CEO_MONTHLY_TARGETS.gross_margin_pct,
    grossMarginStatus: computeMetricStatus(
      grossMarginPct,
      CEO_MONTHLY_TARGETS.gross_margin_pct,
      "higher",
    ),
    openClaims: claimsSummary.openCount,
    claimsTarget: CEO_MONTHLY_TARGETS.open_claims,
    claimsStatus: computeMetricStatus(
      claimsSummary.openCount,
      CEO_MONTHLY_TARGETS.open_claims,
      "lower",
    ),
    moverUtilizationPct: calendarUtilization(input.calendarDays, monthKey, "movers"),
    truckUtilizationPct: calendarUtilization(input.calendarDays, monthKey, "trucks"),
    pipelineValue: sales.pipeline.totalQuoteValue,
    followUpsOverdue: followUps.overdue,
    webQuotesQueue: sales.webQuotes.total,
    opsPrepDueToday: ops.prep.dueToday,
    staffingGapsToday: ops.todayStaffing.unstaffedRows.length,
    attentionCount: attentionItems,
  };
}

export function executiveDashboardHasUrgentAttention(metrics: ExecutiveDashboardMetrics): boolean {
  return metrics.attentionCount > 0;
}
