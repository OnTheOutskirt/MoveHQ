import {
  collectReferralPartnerStats,
  rollupReferralStatsByOrganization,
} from "./referral-metrics";
import type { MoveRecord } from "@/lib/moves/types";
import type { ReferralPartnerStats } from "./types";

export type ReferralReportPeriodId =
  | "this_month"
  | "last_month"
  | "this_quarter"
  | "last_quarter"
  | "custom";

export const REFERRAL_REPORT_PERIODS: { id: ReferralReportPeriodId; label: string }[] = [
  { id: "this_month", label: "This month" },
  { id: "last_month", label: "Last month" },
  { id: "this_quarter", label: "This quarter" },
  { id: "last_quarter", label: "Last quarter" },
  { id: "custom", label: "Custom" },
];

/** Field-catalog referral type id, or all types. */
export type ReferralReportCategory = string | "all";

export type ReferralReportGroupBy = "person" | "organization";

export type ReferralReportFilters = {
  period: ReferralReportPeriodId;
  customStart: string;
  customEnd: string;
  category: ReferralReportCategory;
  groupBy: ReferralReportGroupBy;
  search: string;
};

export function defaultGroupByForCategory(
  category: ReferralReportCategory,
): ReferralReportGroupBy {
  if (category === "all") return "person";
  if (
    category === "senior_living" ||
    category === "business" ||
    category === "storage_facility" ||
    category === "developer" ||
    category === "restoration_company"
  ) {
    return "organization";
  }
  return "person";
}

export function groupByLabel(groupBy: ReferralReportGroupBy): string {
  return groupBy === "organization" ? "By organization" : "By contact";
}

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function quarterStart(d: Date): Date {
  const quarter = Math.floor(d.getMonth() / 3);
  return new Date(d.getFullYear(), quarter * 3, 1);
}

function quarterEnd(d: Date): Date {
  const quarter = Math.floor(d.getMonth() / 3);
  return new Date(d.getFullYear(), quarter * 3 + 3, 0);
}

export function defaultReferralReportFilters(): ReferralReportFilters {
  const today = toDateKey(new Date());
  const yearStart = `${new Date().getFullYear()}-01-01`;
  return {
    period: "this_quarter",
    customStart: yearStart,
    customEnd: today,
    category: "all",
    groupBy: "person",
    search: "",
  };
}

export function referralDateRange(filters: ReferralReportFilters): {
  start: string;
  end: string;
} {
  if (filters.period === "custom") {
    return {
      start: filters.customStart || "1970-01-01",
      end: filters.customEnd || toDateKey(new Date()),
    };
  }

  const today = new Date();

  switch (filters.period) {
    case "this_month":
      return { start: toDateKey(startOfMonth(today)), end: toDateKey(today) };
    case "last_month": {
      const prev = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      return { start: toDateKey(startOfMonth(prev)), end: toDateKey(endOfMonth(prev)) };
    }
    case "this_quarter":
      return { start: toDateKey(quarterStart(today)), end: toDateKey(today) };
    case "last_quarter": {
      const thisQuarterStart = quarterStart(today);
      const lastQuarterEnd = new Date(thisQuarterStart);
      lastQuarterEnd.setDate(lastQuarterEnd.getDate() - 1);
      return {
        start: toDateKey(quarterStart(lastQuarterEnd)),
        end: toDateKey(quarterEnd(lastQuarterEnd)),
      };
    }
    default:
      return { start: toDateKey(startOfMonth(today)), end: toDateKey(today) };
  }
}

export function applyReferralReportFilters(
  moves: MoveRecord[],
  filters: ReferralReportFilters,
): ReferralPartnerStats[] {
  const { start, end } = referralDateRange(filters);

  let stats = collectReferralPartnerStats(moves, { dateFrom: start, dateTo: end });

  if (filters.category !== "all") {
    stats = stats.filter((s) => s.referralTypeId === filters.category);
  }

  const q = filters.search.trim().toLowerCase();
  if (q) {
    stats = stats.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.organizationName?.toLowerCase().includes(q) ?? false) ||
        (s.subtitle?.toLowerCase().includes(q) ?? false),
    );
  }

  if (filters.groupBy === "organization") {
    stats = rollupReferralStatsByOrganization(stats);
  }

  return stats;
}

export function referralReportTotals(stats: ReferralPartnerStats[]) {
  return stats.reduce(
    (acc, row) => {
      acc.referrals += row.referralCount;
      acc.booked += row.bookedCount;
      acc.completed += row.completedCount;
      acc.revenue += row.revenueTotal;
      return acc;
    },
    { referrals: 0, booked: 0, completed: 0, revenue: 0 },
  );
}
