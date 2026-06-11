import {
  collectReferralPartnerStats,
  rollupReferralStatsByOrganization,
} from "./referral-metrics";
import type { MoveRecord } from "@/lib/moves/types";
import type { ReferralPartnerCategory, ReferralPartnerStats } from "./types";

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

export type ReferralReportCategory = ReferralPartnerCategory | "all";

export type ReferralReportGroupBy = "person" | "organization";

export type ReferralReportFilters = {
  period: ReferralReportPeriodId;
  customStart: string;
  customEnd: string;
  category: ReferralReportCategory;
  groupBy: ReferralReportGroupBy;
  search: string;
};

export const REFERRAL_CATEGORY_OPTIONS: {
  id: ReferralReportCategory;
  label: string;
  description: string;
}[] = [
  { id: "all", label: "All referrals", description: "Every referral lead source" },
  {
    id: "realtor",
    label: "Realtors",
    description: "Listing agents and brokerages",
  },
  {
    id: "senior_living",
    label: "Senior living",
    description: "Communities and transition coordinators",
  },
  {
    id: "business",
    label: "Business",
    description: "Commercial and business referrers",
  },
  { id: "other", label: "Other", description: "Misc. referral sources" },
];

export const REFERRAL_CATEGORY_LABELS: Record<ReferralPartnerCategory, string> = {
  realtor: "Realtor",
  senior_living: "Senior living",
  business: "Business",
  other: "Other",
};

export function defaultGroupByForCategory(
  category: ReferralReportCategory,
): ReferralReportGroupBy {
  switch (category) {
    case "senior_living":
    case "business":
      return "organization";
    case "realtor":
      return "person";
    default:
      return "person";
  }
}

export function groupByLabel(
  category: ReferralReportCategory,
  groupBy: ReferralReportGroupBy,
): string {
  if (groupBy === "organization") {
    if (category === "realtor") return "By brokerage";
    if (category === "senior_living") return "By community";
    return "By organization";
  }
  if (category === "realtor") return "By realtor";
  if (category === "senior_living") return "By coordinator";
  return "By contact";
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
    stats = stats.filter((s) => s.category === filters.category);
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
