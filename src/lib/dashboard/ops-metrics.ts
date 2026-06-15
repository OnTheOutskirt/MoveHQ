import { addDays, toDateKey } from "@/lib/calendar/date-utils";
import { countClaimsByTab, summarizeClaims } from "@/lib/operations/claims";
import { isWaitingOnVendor } from "@/lib/operations/claims-workflow";
import type { MoveClaim } from "@/lib/operations/claims-types";
import type { TruckCapacityBreakdown } from "@/lib/operations/fleet-capacity";
import { countLowStock } from "@/lib/operations/inventory";
import type { InventoryStockLine } from "@/lib/operations/inventory-types";
import {
  collectOpsJobDays,
  filterOpsJobDays,
  type OpsJobDayRow,
} from "@/lib/operations/ops-jobs";
import type { ManualOpsPrepTask } from "@/lib/operations/ops-prep-custom-storage";
import {
  collectOpsPrepTasks,
  mergeOpsPrepTasks,
  openOpsPrepTasks,
  openOpsPrepTasksDueToday,
  OPS_PREP_CATEGORY_LABELS,
  type OpsPrepCategory,
  type OpsPrepTask,
} from "@/lib/operations/ops-prep-tasks";
import type { OpsPrepRulesSettings } from "@/lib/settings/ops-prep-rules";
import type { MoveRecord } from "@/lib/moves/types";

export type OpsJobDayStaffing = {
  missingCrew: number;
  missingTruck: number;
  unstaffedRows: OpsJobDayRow[];
};

export type OpsPrepMetrics = {
  dueToday: number;
  overdue: number;
  openTotal: number;
  byCategory: Record<OpsPrepCategory, number>;
  dueTodayTasks: OpsPrepTask[];
};

export type OpsDashboardMetrics = {
  todayKey: string;
  tomorrowKey: string;
  todayJobs: OpsJobDayRow[];
  tomorrowJobs: OpsJobDayRow[];
  todayStaffing: OpsJobDayStaffing;
  tomorrowStaffing: OpsJobDayStaffing;
  prep: OpsPrepMetrics;
  claims: {
    openCount: number;
    newCount: number;
    inProgressCount: number;
    waitingVendor: number;
    pendingCount: number;
  };
  inventory: {
    lowStockCount: number;
    lowStockLabels: string[];
  };
  fleetToday: TruckCapacityBreakdown;
  fleetTomorrow: TruckCapacityBreakdown;
  pendingTimeOff: number;
};

function isActiveJobDay(row: OpsJobDayRow): boolean {
  return row.status === "scheduled" || row.status === "in_progress";
}

export function staffingForJobDays(rows: OpsJobDayRow[]): OpsJobDayStaffing {
  const unstaffedRows: OpsJobDayRow[] = [];
  let missingCrew = 0;
  let missingTruck = 0;

  for (const row of rows) {
    if (!isActiveJobDay(row)) continue;
    const crewMissing = !row.crewLine;
    const truckMissing = !row.truckLine;
    if (crewMissing) missingCrew += 1;
    if (truckMissing) missingTruck += 1;
    if (crewMissing || truckMissing) unstaffedRows.push(row);
  }

  return { missingCrew, missingTruck, unstaffedRows };
}

export function computeOpsPrepMetrics(
  moves: MoveRecord[],
  manualTasks: ManualOpsPrepTask[],
  doneIds: Set<string>,
  rules: OpsPrepRulesSettings | undefined,
  today: Date = new Date(),
): OpsPrepMetrics {
  const todayKey = toDateKey(today);
  const derived = collectOpsPrepTasks(moves, { rules, today });
  const merged = mergeOpsPrepTasks(derived, manualTasks);
  const open = openOpsPrepTasks(merged, doneIds);
  const dueTodayTasks = openOpsPrepTasksDueToday(merged, doneIds, todayKey);
  const overdue = open.filter((task) => task.dueDate < todayKey);

  const byCategory = Object.keys(OPS_PREP_CATEGORY_LABELS).reduce(
    (acc, key) => {
      acc[key as OpsPrepCategory] = 0;
      return acc;
    },
    {} as Record<OpsPrepCategory, number>,
  );

  for (const task of dueTodayTasks) {
    byCategory[task.category] += 1;
  }

  return {
    dueToday: dueTodayTasks.length,
    overdue: overdue.length,
    openTotal: open.length,
    byCategory,
    dueTodayTasks: dueTodayTasks.slice(0, 6),
  };
}

export function computeOpsDashboardMetrics(input: {
  moves: MoveRecord[];
  claims: MoveClaim[];
  manualPrepTasks: ManualOpsPrepTask[];
  prepDoneIds: Set<string>;
  opsPrepRules?: OpsPrepRulesSettings;
  stockLines: InventoryStockLine[];
  fleetToday: TruckCapacityBreakdown;
  fleetTomorrow: TruckCapacityBreakdown;
  pendingTimeOff: number;
  today?: Date;
}): OpsDashboardMetrics {
  const today = input.today ?? new Date();
  const todayKey = toDateKey(today);
  const tomorrowKey = toDateKey(addDays(today, 1));
  const allRows = collectOpsJobDays(input.moves, today);
  const todayJobs = filterOpsJobDays(allRows, "today", today);
  const tomorrowJobs = filterOpsJobDays(allRows, "tomorrow", today);
  const claimCounts = countClaimsByTab(input.claims);
  const summary = summarizeClaims(input.claims);
  const lowStockLines = input.stockLines.filter((line) => line.isLow);

  return {
    todayKey,
    tomorrowKey,
    todayJobs,
    tomorrowJobs,
    todayStaffing: staffingForJobDays(todayJobs),
    tomorrowStaffing: staffingForJobDays(tomorrowJobs),
    prep: computeOpsPrepMetrics(
      input.moves,
      input.manualPrepTasks,
      input.prepDoneIds,
      input.opsPrepRules,
      today,
    ),
    claims: {
      openCount: summary.openCount,
      newCount: claimCounts.new,
      inProgressCount: claimCounts.in_progress,
      waitingVendor: input.claims.filter((c) => isWaitingOnVendor(c)).length,
      pendingCount: claimCounts.pending,
    },
    inventory: {
      lowStockCount: countLowStock(input.stockLines),
      lowStockLabels: lowStockLines.slice(0, 4).map((line) => line.label),
    },
    fleetToday: input.fleetToday,
    fleetTomorrow: input.fleetTomorrow,
    pendingTimeOff: input.pendingTimeOff,
  };
}

export function opsDashboardHasUrgentAttention(metrics: OpsDashboardMetrics): boolean {
  return (
    metrics.prep.dueToday > 0 ||
    metrics.prep.overdue > 0 ||
    metrics.todayStaffing.missingCrew > 0 ||
    metrics.todayStaffing.missingTruck > 0 ||
    metrics.tomorrowStaffing.missingCrew > 0 ||
    metrics.tomorrowStaffing.missingTruck > 0 ||
    metrics.claims.newCount > 0 ||
    metrics.claims.waitingVendor > 0 ||
    metrics.inventory.lowStockCount > 0
  );
}
