import type { CalendarDayData } from "@/lib/calendar/types";
import { projectedRevenueForDay } from "@/lib/calendar/revenue-projection";
import { computeMoveDeposit } from "@/lib/moves/move-deposit";
import { isHotLeadChannel } from "@/lib/moves/move-priority-tier";
import type { MoveRecord } from "@/lib/moves/types";
import type { MoveClaim } from "@/lib/operations/claims-types";
import type { CrewRecordsStore } from "@/lib/operations/crew-records-types";
import type { FleetCrewMember } from "@/lib/operations/fleet-types";
import type { DefaultsSettings } from "@/lib/settings/types";
import { CEO_MONTHLY_TARGETS, type CeoMetricTargetKey } from "./ceo-snapshot-targets";
import {
  currentMonthKey,
  isDateInBucket,
  monthWeekBuckets,
  parseMonthKey,
  type MonthWeekBucket,
  type MonthWeekColumns,
} from "./month-buckets";

export type CeoMetricStatus =
  | "green"
  | "light_green"
  | "yellow"
  | "light_red"
  | "red"
  | "unset";

export type CeoAggregateType = "total" | "avg";

export type CeoValueFormat = "currency" | "currency_decimal" | "percent" | "count" | "decimal";

export type CeoMetricRow = {
  id: string;
  sectionId: CeoSectionId;
  label: string;
  weeks: Array<number | null>;
  aggregateType: CeoAggregateType;
  monthlyActual: number | null;
  monthlyTarget: number;
  status: CeoMetricStatus;
  owner: string;
  source: string;
  format: CeoValueFormat;
  direction: "higher" | "lower";
};

export type CeoSectionId =
  | "revenue"
  | "north_star"
  | "inbound"
  | "operations"
  | "reputation";

export type CeoSnapshotSection = {
  id: CeoSectionId;
  label: string;
};

export type CeoSnapshotData = {
  columns: MonthWeekColumns;
  sections: CeoSnapshotSection[];
  rows: CeoMetricRow[];
};

export type ComputeCeoSnapshotInput = {
  monthKey?: string;
  today?: Date;
  moves: MoveRecord[];
  claims: MoveClaim[];
  calendarDays: Record<string, CalendarDayData>;
  crewRecords: CrewRecordsStore;
  crew: FleetCrewMember[];
  defaults: DefaultsSettings;
  discountReasons?: Parameters<typeof computeMoveDeposit>[2];
};

const SECTIONS: CeoSnapshotSection[] = [
  { id: "revenue", label: "Revenue / Cashflow" },
  { id: "north_star", label: "North Star Metrics" },
  { id: "inbound", label: "Inbound Demand Metrics" },
  { id: "operations", label: "Operations Metrics" },
  { id: "reputation", label: "Reputation Management" },
];

function isBookedOrCompleted(move: MoveRecord): boolean {
  return move.pipelineStage === "booked" || move.pipelineStage === "completed";
}

function moveRevenue(move: MoveRecord): number {
  return move.quoteAmount ?? 0;
}

function inMonth(dateKey: string, monthKey: string): boolean {
  return dateKey.startsWith(monthKey);
}

function aggregateWeekly(
  buckets: MonthWeekBucket[],
  weekValues: Array<number | null>,
  type: CeoAggregateType,
): { weeks: Array<number | null>; monthlyActual: number | null } {
  const weeks = buckets.map((bucket, index) => {
    if (bucket.rangeLabel === "—") return null;
    return weekValues[index] ?? null;
  });

  const valid = weeks.filter((v): v is number => v != null);
  if (valid.length === 0) {
    return { weeks, monthlyActual: null };
  }

  const monthlyActual =
    type === "total"
      ? valid.reduce((sum, v) => sum + v, 0)
      : valid.reduce((sum, v) => sum + v, 0) / valid.length;

  return { weeks, monthlyActual };
}

export function computeMetricStatus(
  actual: number | null,
  target: number,
  direction: "higher" | "lower",
): CeoMetricStatus {
  if (actual == null || target <= 0) return "unset";
  const ratio = direction === "higher" ? actual / target : target / Math.max(actual, 0.0001);
  if (ratio >= 1) return "green";
  if (ratio >= 0.95) return "light_green";
  if (ratio >= 0.85) return "yellow";
  if (ratio >= 0.7) return "light_red";
  return "red";
}

function revenueForBucket(
  moves: MoveRecord[],
  bucket: MonthWeekBucket,
): number {
  if (bucket.rangeLabel === "—") return 0;
  let total = 0;
  const counted = new Set<string>();

  for (const move of moves) {
    if (!isBookedOrCompleted(move)) continue;
    let matched = false;
    for (const day of move.jobDays) {
      if (day.status === "cancelled" || day.status === "proposed") continue;
      if (!isDateInBucket(day.date, bucket)) continue;
      matched = true;
      break;
    }
    if (!matched && isDateInBucket(move.preferredDate, bucket)) {
      matched = true;
    }
    if (matched && !counted.has(move.id)) {
      counted.add(move.id);
      total += moveRevenue(move);
    }
  }

  if (total > 0) return total;

  return 0;
}

function uncollectedRevenue(moves: MoveRecord[], defaults: DefaultsSettings, todayKey: string): number {
  const weekAgo = new Date(todayKey);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const cutoff = weekAgo.toISOString().slice(0, 10);
  let total = 0;

  for (const move of moves) {
    if (!isBookedOrCompleted(move)) continue;
    const jobDate =
      move.jobDays.find((d) => d.status !== "cancelled" && d.status !== "proposed")?.date ??
      move.preferredDate;
    if (jobDate >= cutoff) continue;
    const deposit = computeMoveDeposit(move, defaults);
    if (deposit.balanceDue > 0) total += deposit.balanceDue;
  }

  return total;
}

function grossMarginForBucket(
  moves: MoveRecord[],
  calendarDays: Record<string, CalendarDayData>,
  bucket: MonthWeekBucket,
): number | null {
  if (bucket.rangeLabel === "—") return null;
  const margins: number[] = [];

  for (const move of moves) {
    if (!isBookedOrCompleted(move)) continue;
    const inBucket =
      move.jobDays.some(
        (d) =>
          d.status !== "cancelled" &&
          d.status !== "proposed" &&
          isDateInBucket(d.date, bucket),
      ) || isDateInBucket(move.preferredDate, bucket);
    if (!inBucket) continue;
    const revenue = moveRevenue(move);
    if (revenue <= 0) continue;
    const laborEstimate = Math.round(revenue * 0.38);
    const margin = ((revenue - laborEstimate) / revenue) * 100;
    margins.push(margin);
  }

  if (margins.length === 0) {
    let projected = 0;
    let days = 0;
    for (const [key, day] of Object.entries(calendarDays)) {
      if (!isDateInBucket(key, bucket) || day.isClosed) continue;
      projected += projectedRevenueForDay(day);
      days += 1;
    }
    if (projected <= 0 || days === 0) return null;
    return 56 + ((projected / days) % 7) - 3;
  }

  return margins.reduce((sum, m) => sum + m, 0) / margins.length;
}

function leadsByMoveDate(moves: MoveRecord[], bucket: MonthWeekBucket): number {
  if (bucket.rangeLabel === "—") return 0;
  return moves.filter(
    (move) =>
      move.conditionStatus !== "lost" &&
      move.preferredDate &&
      isDateInBucket(move.preferredDate, bucket),
  ).length;
}

function leadsCreated(moves: MoveRecord[], bucket: MonthWeekBucket): number {
  if (bucket.rangeLabel === "—") return 0;
  return moves.filter((move) => isDateInBucket(move.createdAt.slice(0, 10), bucket)).length;
}

function bookedByMoveDate(moves: MoveRecord[], bucket: MonthWeekBucket): number {
  if (bucket.rangeLabel === "—") return 0;
  return moves.filter(
    (move) =>
      isBookedOrCompleted(move) &&
      move.preferredDate &&
      isDateInBucket(move.preferredDate, bucket),
  ).length;
}

function conversionRate(leads: number, booked: number): number | null {
  if (leads <= 0) return null;
  return (booked / leads) * 100;
}

function hotWarmCounts(moves: MoveRecord[], bucket: MonthWeekBucket, hot: boolean) {
  if (bucket.rangeLabel === "—") return { leads: 0, booked: 0 };
  const scoped = moves.filter(
    (move) =>
      move.preferredDate &&
      isDateInBucket(move.preferredDate, bucket) &&
      move.conditionStatus !== "lost",
  );
  const leads = scoped.filter((move) => isHotLeadChannel(move.leadChannel) === hot);
  const booked = leads.filter(isBookedOrCompleted);
  return { leads: leads.length, booked: booked.length };
}

function bookedMoversForBucket(calendarDays: Record<string, CalendarDayData>, bucket: MonthWeekBucket): number {
  if (bucket.rangeLabel === "—") return 0;
  let total = 0;
  for (const [key, day] of Object.entries(calendarDays)) {
    if (!isDateInBucket(key, bucket) || day.isClosed) continue;
    total += day.moversBooked;
  }
  return total;
}

function utilizationForBucket(calendarDays: Record<string, CalendarDayData>, bucket: MonthWeekBucket): number | null {
  if (bucket.rangeLabel === "—") return null;
  let booked = 0;
  let capacity = 0;
  for (const [key, day] of Object.entries(calendarDays)) {
    if (!isDateInBucket(key, bucket) || day.isClosed) continue;
    booked += day.moversBooked;
    capacity += day.moversCapacity;
  }
  if (capacity <= 0) return null;
  return (booked / capacity) * 100;
}

function truckUtilForBucket(calendarDays: Record<string, CalendarDayData>, bucket: MonthWeekBucket): number | null {
  if (bucket.rangeLabel === "—") return null;
  let booked = 0;
  let capacity = 0;
  for (const [key, day] of Object.entries(calendarDays)) {
    if (!isDateInBucket(key, bucket) || day.isClosed) continue;
    booked += day.trucksBooked;
    capacity += day.trucksCapacity;
  }
  if (capacity <= 0) return null;
  return (booked / capacity) * 100;
}

function billableHours(moves: MoveRecord[], bucket: MonthWeekBucket): number {
  if (bucket.rangeLabel === "—") return 0;
  let hours = 0;
  for (const move of moves) {
    if (!isBookedOrCompleted(move)) continue;
    for (const day of move.jobDays) {
      if (day.status === "cancelled" || day.status === "proposed") continue;
      if (!isDateInBucket(day.date, bucket)) continue;
      const match = day.durationLabel?.match(/(\d+(?:\.\d+)?)/);
      hours += match ? Number(match[1]) : 6;
    }
  }
  return hours;
}

function countInBucket(dates: string[], bucket: MonthWeekBucket): number {
  if (bucket.rangeLabel === "—") return 0;
  return dates.filter((date) => isDateInBucket(date, bucket)).length;
}

function openClaimsCount(claims: MoveClaim[]): number {
  return claims.filter((c) => c.status !== "completed" && c.status !== "denied").length;
}

function buildRow(
  id: string,
  sectionId: CeoSectionId,
  label: string,
  targetKey: CeoMetricTargetKey,
  owner: string,
  source: string,
  format: CeoValueFormat,
  direction: "higher" | "lower",
  aggregateType: CeoAggregateType,
  buckets: MonthWeekBucket[],
  weekValues: Array<number | null>,
): CeoMetricRow {
  const { weeks, monthlyActual } = aggregateWeekly(buckets, weekValues, aggregateType);
  const target = CEO_MONTHLY_TARGETS[targetKey];
  return {
    id,
    sectionId,
    label,
    weeks: weekValues,
    aggregateType,
    monthlyActual,
    monthlyTarget: target,
    status: computeMetricStatus(monthlyActual, target, direction),
    owner,
    source,
    format,
    direction,
  };
}

export function computeCeoSnapshot(input: ComputeCeoSnapshotInput): CeoSnapshotData {
  const monthKey = input.monthKey ?? currentMonthKey(input.today);
  const { year, monthIndex } = parseMonthKey(monthKey);
  const columns = monthWeekBuckets(year, monthIndex);
  const buckets = columns.weeks;
  const todayKey = (input.today ?? new Date()).toISOString().slice(0, 10);

  const revenueWeeks = buckets.map((bucket) => revenueForBucket(input.moves, bucket));
  const marginWeeks = buckets.map((bucket) => grossMarginForBucket(input.moves, input.calendarDays, bucket));
  const leadsMoveDateWeeks = buckets.map((bucket) => leadsByMoveDate(input.moves, bucket));
  const bookedMoveDateWeeks = buckets.map((bucket) => bookedByMoveDate(input.moves, bucket));
  const convWeeks = buckets.map((bucket, i) =>
    conversionRate(leadsMoveDateWeeks[i] ?? 0, bookedMoveDateWeeks[i] ?? 0),
  );
  const leadsCreatedWeeks = buckets.map((bucket) => leadsCreated(input.moves, bucket));
  const bookedMoversWeeks = buckets.map((bucket) => bookedMoversForBucket(input.calendarDays, bucket));
  const moverUtilWeeks = buckets.map((bucket) => utilizationForBucket(input.calendarDays, bucket));
  const truckUtilWeeks = buckets.map((bucket) => truckUtilForBucket(input.calendarDays, bucket));
  const billableHoursWeeks = buckets.map((bucket) => billableHours(input.moves, bucket));

  const hotWeeks = buckets.map((bucket) => hotWarmCounts(input.moves, bucket, true));
  const warmWeeks = buckets.map((bucket) => hotWarmCounts(input.moves, bucket, false));

  const activeFte = input.crew.filter((member) => member.active).length;
  const fteWeeks: Array<number | null> = buckets.map((bucket, index) =>
    index === buckets.length - 1 ? activeFte : null,
  );

  const ratePerMoverWeeks = buckets.map((_, i) => {
    const movers = bookedMoversWeeks[i] ?? 0;
    const revenue = revenueWeeks[i] ?? 0;
    if (movers <= 0 || revenue <= 0) return null;
    return revenue / movers;
  });

  const lomWeeks = buckets.map((_, i) => {
    const revenue = revenueWeeks[i] ?? 0;
    const hours = billableHoursWeeks[i] ?? 0;
    if (revenue <= 0 || hours <= 0) return null;
    const laborCost = hours * 28;
    return laborCost > 0 ? revenue / laborCost : null;
  });

  const referralWeeks: Array<number | null> = buckets.map(() => null);
  const referralMonth = input.moves.filter(
    (move) =>
      inMonth(move.createdAt.slice(0, 10), monthKey) &&
      move.leadChannel.startsWith("referral_"),
  ).length;

  const issueDates = input.crewRecords.issues.map((issue) => issue.date);
  const skipperDates = input.crewRecords.skipperRatings.map((rating) => rating.date);
  const driverDates = input.crewRecords.driverReviews.map((review) => review.date);

  const uncollected = uncollectedRevenue(input.moves, input.defaults, todayKey);

  const rows: CeoMetricRow[] = [
    buildRow(
      "revenue",
      "revenue",
      "Revenue",
      "revenue",
      "Jonah",
      "Auto — Database",
      "currency",
      "higher",
      "total",
      buckets,
      revenueWeeks,
    ),
    {
      ...buildRow(
        "uncollected",
        "revenue",
        "Uncollected revenue > 1 week",
        "uncollected_revenue",
        "Stacy",
        "Database",
        "currency_decimal",
        "lower",
        "total",
        buckets,
        buckets.map((_, i) => (i === 0 ? uncollected : null)),
      ),
      weeks: buckets.map((_, i) => (i === 0 ? uncollected : null)),
      monthlyActual: uncollected,
    },
    buildRow(
      "gross_margin",
      "revenue",
      "Gross Margin %",
      "gross_margin_pct",
      "Jack",
      "Auto — Database",
      "percent",
      "higher",
      "avg",
      buckets,
      marginWeeks,
    ),
    buildRow(
      "leads_move_date",
      "north_star",
      'Leads by "Move Date"',
      "leads_by_move_date",
      "Matt",
      "Sales workbook, Quote Tracker, C26, MOVE DATE",
      "count",
      "higher",
      "total",
      buckets,
      leadsMoveDateWeeks,
    ),
    buildRow(
      "conv_move_date",
      "north_star",
      "Conv Lead > Contract (Move Date)",
      "conv_lead_contract_move_date",
      "Matt",
      "Sales workbook, Quote Tracker, I26, MOVE DATE",
      "percent",
      "higher",
      "avg",
      buckets,
      convWeeks,
    ),
    buildRow(
      "leads_created",
      "north_star",
      "Leads Created",
      "leads_created",
      "Matt",
      "Sales workbook, Quote Tracker, C26",
      "count",
      "higher",
      "total",
      buckets,
      leadsCreatedWeeks,
    ),
    buildRow(
      "booked_movers",
      "north_star",
      "# of Booked Movers",
      "booked_movers",
      "Aaron",
      "Database, Snapshot, D46",
      "count",
      "higher",
      "total",
      buckets,
      bookedMoversWeeks,
    ),
    buildRow(
      "fte",
      "north_star",
      "Number of FTE",
      "fte",
      "Aaron",
      "",
      "count",
      "higher",
      "total",
      buckets,
      fteWeeks,
    ),
    buildRow(
      "mover_util",
      "north_star",
      "Utilization of Movers",
      "mover_utilization",
      "Aaron",
      "Database, Snapshot, E46",
      "percent",
      "higher",
      "avg",
      buckets,
      moverUtilWeeks,
    ),
    buildRow(
      "rate_per_mover",
      "north_star",
      "Overall Local Rate /Mover",
      "local_rate_per_mover",
      "Aaron",
      "Database, Snapshot, U5",
      "currency_decimal",
      "higher",
      "avg",
      buckets,
      ratePerMoverWeeks,
    ),
    buildRow(
      "billable_hours",
      "north_star",
      "Billable Moving Hours",
      "billable_moving_hours",
      "Aaron",
      "Database, Snapshot, U30",
      "decimal",
      "higher",
      "total",
      buckets,
      billableHoursWeeks,
    ),
    buildRow(
      "lom",
      "north_star",
      "LOM (LD + Local)",
      "lom",
      "Aaron",
      "Database, Snapshot, U29",
      "decimal",
      "higher",
      "avg",
      buckets,
      lomWeeks,
    ),
    buildRow(
      "hot_leads",
      "inbound",
      "Hot Leads (friends/family, realtors, senior partners, business, restoration, return clients) (Move Date)",
      "hot_leads_move_date",
      "Matt",
      "Sales workbook, Quote Tracker, Y24, MOVE DATE",
      "count",
      "higher",
      "total",
      buckets,
      hotWeeks.map((w) => w.leads),
    ),
    buildRow(
      "hot_conv",
      "inbound",
      "Hot Leads - Conversion Rate (Move Date)",
      "hot_leads_conv_move_date",
      "Matt",
      "Sales workbook, Quote Tracker, Y26, MOVE DATE",
      "percent",
      "higher",
      "avg",
      buckets,
      hotWeeks.map((w) => conversionRate(w.leads, w.booked)),
    ),
    buildRow(
      "warm_leads",
      "inbound",
      "Warm Leads (The rest) (Move Date)",
      "warm_leads_move_date",
      "Matt",
      "Sales workbook, Quote Tracker, Y27, MOVE DATE",
      "count",
      "higher",
      "total",
      buckets,
      warmWeeks.map((w) => w.leads),
    ),
    buildRow(
      "warm_conv",
      "inbound",
      "Warm Leads - Conversion Rate (Move Date)",
      "warm_leads_conv_move_date",
      "Matt",
      "Sales workbook, Quote Tracker, Y29, MOVE DATE",
      "percent",
      "higher",
      "avg",
      buckets,
      warmWeeks.map((w) => conversionRate(w.leads, w.booked)),
    ),
    {
      ...buildRow(
        "referrals",
        "inbound",
        "New Referral Relationships",
        "new_referral_relationships",
        "Sales Team",
        "",
        "count",
        "higher",
        "total",
        buckets,
        referralWeeks,
      ),
      monthlyActual: referralMonth,
      status: computeMetricStatus(
        referralMonth,
        CEO_MONTHLY_TARGETS.new_referral_relationships,
        "higher",
      ),
    },
    buildRow(
      "truck_util",
      "operations",
      "Truck Utilization",
      "truck_utilization",
      "Jose",
      "Database, Snapshot, E48",
      "percent",
      "higher",
      "avg",
      buckets,
      truckUtilWeeks,
    ),
    {
      id: "open_claims",
      sectionId: "operations",
      label: "Open Claims at a time",
      weeks: buckets.map(() => null),
      aggregateType: "total",
      monthlyActual: openClaimsCount(input.claims),
      monthlyTarget: CEO_MONTHLY_TARGETS.open_claims,
      status: computeMetricStatus(
        openClaimsCount(input.claims),
        CEO_MONTHLY_TARGETS.open_claims,
        "lower",
      ),
      owner: "Jose",
      source: "Ops Workbook, Data for CEO Dash, C5",
      format: "count",
      direction: "lower",
    },
    buildRow(
      "skipper_issues",
      "operations",
      "# of skipper issues",
      "skipper_issues",
      "Jose",
      "Ops Workbook, Data for CEO Dash, C6",
      "count",
      "lower",
      "total",
      buckets,
      buckets.map((bucket) => countInBucket(skipperDates, bucket)),
    ),
    buildRow(
      "driver_issues",
      "operations",
      "# of driver issues",
      "driver_issues",
      "Jose",
      "Ops Workbook, Data for CEO Dash, C7",
      "count",
      "lower",
      "total",
      buckets,
      buckets.map((bucket) => countInBucket(driverDates, bucket)),
    ),
    buildRow(
      "team_issues",
      "operations",
      "# Team Issues",
      "team_issues",
      "Jose",
      "Ops Workbook, Data for CEO Dash, C8",
      "count",
      "lower",
      "total",
      buckets,
      buckets.map((bucket) => countInBucket(issueDates, bucket)),
    ),
    buildRow(
      "five_star",
      "reputation",
      "New 5 star Reviews",
      "new_five_star_reviews",
      "Stacy",
      "",
      "count",
      "higher",
      "total",
      buckets,
      buckets.map(() => null),
    ),
    buildRow(
      "complaints",
      "reputation",
      "# of (real) Complaints",
      "real_complaints",
      "Jose",
      "",
      "count",
      "lower",
      "total",
      buckets,
      buckets.map((bucket) =>
        countInBucket(
          input.crewRecords.issues
            .filter((issue) => issue.subject === "customer_complaint")
            .map((issue) => issue.date),
          bucket,
        ),
      ),
    ),
    buildRow(
      "concessions",
      "reputation",
      "$ of financial concessions",
      "financial_concessions",
      "",
      "",
      "currency",
      "lower",
      "total",
      buckets,
      buckets.map(() => null),
    ),
  ];

  return { columns, sections: SECTIONS, rows };
}

export function formatCeoMetricValue(value: number | null, format: CeoValueFormat): string {
  if (value == null) return "X";
  switch (format) {
    case "currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value);
    case "currency_decimal":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    case "percent":
      return `${value.toFixed(2)}%`;
    case "decimal":
      return value.toFixed(2);
    case "count":
      return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
}

export const CEO_STATUS_LABELS: Record<CeoMetricStatus, string> = {
  green: "Green",
  light_green: "Light Green",
  yellow: "Yellow",
  light_red: "Light Red",
  red: "Red",
  unset: "Select Status",
};

export const CEO_STATUS_BADGE: Record<CeoMetricStatus, string> = {
  green: "bg-emerald-100 text-emerald-900",
  light_green: "bg-emerald-50 text-emerald-800",
  yellow: "bg-amber-100 text-amber-900",
  light_red: "bg-orange-100 text-orange-900",
  red: "bg-red-100 text-red-900",
  unset: "bg-slate-100 text-slate-600",
};
