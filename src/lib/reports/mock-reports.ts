/** Demo data for operations reports — replace with Supabase aggregates later. */

export type ReportPeriodId = "7" | "30" | "90" | "ytd";

export const REPORT_PERIODS: { id: ReportPeriodId; label: string }[] = [
  { id: "7", label: "Last 7 days" },
  { id: "30", label: "Last 30 days" },
  { id: "90", label: "Last 90 days" },
  { id: "ytd", label: "Year to date" },
];

export type SpeedToLeadRow = {
  id: string;
  channel: string;
  handledBy: "AI" | "Person" | "Mixed";
  leads: number;
  contacted: number;
  booked: number;
  avgFirstResponseMin: number;
  conversionPct: number;
};

export type SalesRevenueRow = {
  id: string;
  name: string;
  leads: number;
  proposals: number;
  bookedJobs: number;
  bookedRevenue: number;
  avgJobValue: number;
};

export type CommissionRow = {
  id: string;
  name: string;
  bookedRevenue: number;
  commissionRatePct: number;
  commissionDue: number;
  paidYtd: number;
  balance: number;
  status: "current" | "pending_payout" | "paid";
};

export type LaborHoursRow = {
  id: string;
  moveRef: string;
  customer: string;
  jobDate: string;
  movers: number;
  hoursEstimated: number;
  hoursActual: number | null;
  varianceHours: number | null;
  status: "scheduled" | "in_progress" | "completed";
};

export type BudgetActualsRow = {
  id: string;
  moveRef: string;
  customer: string;
  jobDate: string;
  milesEstimated: number;
  milesActual: number | null;
  laborEstimated: number;
  laborActual: number | null;
  materialsEstimated: number;
  materialsActual: number | null;
  flatRate: number;
  marginEstimatedPct: number;
  marginActualPct: number | null;
};

export type DispatchChangeRow = {
  id: string;
  moveRef: string;
  jobDate: string;
  changeSummary: string;
  aiQuoteBaseline: string;
  dispatchOverride: string;
  impactUsd: number;
  impactLabel: "saves" | "costs" | "neutral";
};

export type AiQuoteAccuracyRow = {
  id: string;
  moveRef: string;
  customer: string;
  quotedAt: string;
  aiQuoteUsd: number;
  finalBookedUsd: number | null;
  varianceUsd: number | null;
  variancePct: number | null;
  inventoryMatchPct: number;
  laborMatchPct: number;
  outcome: "booked" | "quoted" | "abandoned";
};

const SPEED_TO_LEAD: SpeedToLeadRow[] = [
  {
    id: "stl-web-ai",
    channel: "Website — AI flat rate",
    handledBy: "AI",
    leads: 84,
    contacted: 72,
    booked: 31,
    avgFirstResponseMin: 4,
    conversionPct: 36.9,
  },
  {
    id: "stl-web-person",
    channel: "Website — handoff to sales",
    handledBy: "Person",
    leads: 22,
    contacted: 21,
    booked: 14,
    avgFirstResponseMin: 38,
    conversionPct: 63.6,
  },
  {
    id: "stl-phone",
    channel: "Phone",
    handledBy: "Person",
    leads: 56,
    contacted: 54,
    booked: 29,
    avgFirstResponseMin: 12,
    conversionPct: 51.8,
  },
  {
    id: "stl-office",
    channel: "Office / walk-in",
    handledBy: "Person",
    leads: 11,
    contacted: 11,
    booked: 8,
    avgFirstResponseMin: 5,
    conversionPct: 72.7,
  },
];

const SALES_REVENUE: SalesRevenueRow[] = [
  {
    id: "rep-jordan",
    name: "Jordan M.",
    leads: 48,
    proposals: 32,
    bookedJobs: 18,
    bookedRevenue: 42850,
    avgJobValue: 2381,
  },
  {
    id: "rep-sam",
    name: "Sam K.",
    leads: 41,
    proposals: 28,
    bookedJobs: 15,
    bookedRevenue: 36200,
    avgJobValue: 2413,
  },
  {
    id: "rep-alex",
    name: "Alex R.",
    leads: 35,
    proposals: 22,
    bookedJobs: 12,
    bookedRevenue: 29100,
    avgJobValue: 2425,
  },
  {
    id: "rep-ai",
    name: "Web AI (no rep)",
    leads: 49,
    proposals: 41,
    bookedJobs: 27,
    bookedRevenue: 52400,
    avgJobValue: 1941,
  },
];

const COMMISSIONS: CommissionRow[] = [
  {
    id: "rep-jordan",
    name: "Jordan M.",
    bookedRevenue: 42850,
    commissionRatePct: 4,
    commissionDue: 1714,
    paidYtd: 14200,
    balance: 1714,
    status: "pending_payout",
  },
  {
    id: "rep-sam",
    name: "Sam K.",
    bookedRevenue: 36200,
    commissionRatePct: 4,
    commissionDue: 1448,
    paidYtd: 11800,
    balance: 1448,
    status: "pending_payout",
  },
  {
    id: "rep-alex",
    name: "Alex R.",
    bookedRevenue: 29100,
    commissionRatePct: 3.5,
    commissionDue: 1019,
    paidYtd: 9800,
    balance: 1019,
    status: "current",
  },
];

const LABOR_HOURS: LaborHoursRow[] = [
  {
    id: "lh-1",
    moveRef: "MV-1042",
    customer: "Patel family",
    jobDate: "2026-05-18",
    movers: 4,
    hoursEstimated: 6,
    hoursActual: 6.5,
    varianceHours: 0.5,
    status: "completed",
  },
  {
    id: "lh-2",
    moveRef: "MV-1038",
    customer: "Chen / Westlake",
    jobDate: "2026-05-18",
    movers: 3,
    hoursEstimated: 4.5,
    hoursActual: 4.25,
    varianceHours: -0.25,
    status: "completed",
  },
  {
    id: "lh-3",
    moveRef: "MV-1051",
    customer: "Brooks LLC",
    jobDate: "2026-05-19",
    movers: 5,
    hoursEstimated: 8,
    hoursActual: null,
    varianceHours: null,
    status: "scheduled",
  },
  {
    id: "lh-4",
    moveRef: "MV-1049",
    customer: "Nguyen",
    jobDate: "2026-05-19",
    movers: 4,
    hoursEstimated: 5.5,
    hoursActual: 5,
    varianceHours: -0.5,
    status: "in_progress",
  },
];

const BUDGET_ACTUALS: BudgetActualsRow[] = [
  {
    id: "ba-1",
    moveRef: "MV-1042",
    customer: "Patel family",
    jobDate: "2026-05-18",
    milesEstimated: 28,
    milesActual: 31,
    laborEstimated: 1008,
    laborActual: 1092,
    materialsEstimated: 85,
    materialsActual: 120,
    flatRate: 1895,
    marginEstimatedPct: 32,
    marginActualPct: 26.4,
  },
  {
    id: "ba-2",
    moveRef: "MV-1038",
    customer: "Chen / Westlake",
    jobDate: "2026-05-18",
    milesEstimated: 12,
    milesActual: 11,
    laborEstimated: 567,
    laborActual: 535,
    materialsEstimated: 40,
    materialsActual: 40,
    flatRate: 1295,
    marginEstimatedPct: 35,
    marginActualPct: 37.2,
  },
  {
    id: "ba-3",
    moveRef: "MV-1044",
    customer: "Harrison",
    jobDate: "2026-05-17",
    milesEstimated: 142,
    milesActual: 148,
    laborEstimated: 1344,
    laborActual: 1410,
    materialsEstimated: 210,
    materialsActual: 245,
    flatRate: 3295,
    marginEstimatedPct: 28,
    marginActualPct: 24.1,
  },
];

const DISPATCH_CHANGES: DispatchChangeRow[] = [
  {
    id: "dc-1",
    moveRef: "MV-1051",
    jobDate: "2026-05-19",
    changeSummary: "Added 1 mover",
    aiQuoteBaseline: "4 crew · 26 ft",
    dispatchOverride: "5 crew · 26 ft",
    impactUsd: -168,
    impactLabel: "costs",
  },
  {
    id: "dc-2",
    moveRef: "MV-1049",
    jobDate: "2026-05-19",
    changeSummary: "Downsized truck",
    aiQuoteBaseline: "4 crew · 26 ft",
    dispatchOverride: "4 crew · 16 ft",
    impactUsd: 95,
    impactLabel: "saves",
  },
  {
    id: "dc-3",
    moveRef: "MV-1042",
    jobDate: "2026-05-18",
    changeSummary: "Removed 1 mover (finished early)",
    aiQuoteBaseline: "5 crew · 26 ft",
    dispatchOverride: "4 crew · 26 ft",
    impactUsd: 84,
    impactLabel: "saves",
  },
  {
    id: "dc-4",
    moveRef: "MV-1038",
    jobDate: "2026-05-18",
    changeSummary: "Matched AI quote",
    aiQuoteBaseline: "3 crew · 16 ft",
    dispatchOverride: "3 crew · 16 ft",
    impactUsd: 0,
    impactLabel: "neutral",
  },
];

const AI_QUOTES: AiQuoteAccuracyRow[] = [
  {
    id: "aq-1",
    moveRef: "MV-WEB-881",
    customer: "Okonkwo",
    quotedAt: "2026-05-16",
    aiQuoteUsd: 1245,
    finalBookedUsd: 1295,
    varianceUsd: 50,
    variancePct: 4,
    inventoryMatchPct: 92,
    laborMatchPct: 88,
    outcome: "booked",
  },
  {
    id: "aq-2",
    moveRef: "MV-WEB-879",
    customer: "Rivera",
    quotedAt: "2026-05-15",
    aiQuoteUsd: 1895,
    finalBookedUsd: 1895,
    varianceUsd: 0,
    variancePct: 0,
    inventoryMatchPct: 100,
    laborMatchPct: 95,
    outcome: "booked",
  },
  {
    id: "aq-3",
    moveRef: "MV-WEB-875",
    customer: "Singh",
    quotedAt: "2026-05-14",
    aiQuoteUsd: 2195,
    finalBookedUsd: null,
    varianceUsd: null,
    variancePct: null,
    inventoryMatchPct: 78,
    laborMatchPct: 0,
    outcome: "quoted",
  },
  {
    id: "aq-4",
    moveRef: "MV-WEB-870",
    customer: "Walsh",
    quotedAt: "2026-05-12",
    aiQuoteUsd: 995,
    finalBookedUsd: null,
    varianceUsd: null,
    variancePct: null,
    inventoryMatchPct: 45,
    laborMatchPct: 0,
    outcome: "abandoned",
  },
];

export function getSpeedToLeadRows(_period: ReportPeriodId): SpeedToLeadRow[] {
  return SPEED_TO_LEAD;
}

export function getSalesRevenueRows(_period: ReportPeriodId): SalesRevenueRow[] {
  return SALES_REVENUE;
}

export function salesRevenueTotals(rows: SalesRevenueRow[]): {
  bookedJobs: number;
  bookedRevenue: number;
} {
  return rows.reduce(
    (acc, r) => ({
      bookedJobs: acc.bookedJobs + r.bookedJobs,
      bookedRevenue: acc.bookedRevenue + r.bookedRevenue,
    }),
    { bookedJobs: 0, bookedRevenue: 0 },
  );
}

export function getCommissionRows(_period: ReportPeriodId): CommissionRow[] {
  return COMMISSIONS;
}

export function getLaborHoursRows(_period: ReportPeriodId): LaborHoursRow[] {
  return LABOR_HOURS;
}

export function getBudgetActualsRows(_period: ReportPeriodId): BudgetActualsRow[] {
  return BUDGET_ACTUALS;
}

export function getDispatchChangeRows(_period: ReportPeriodId): DispatchChangeRow[] {
  return DISPATCH_CHANGES;
}

export function dispatchChangeTotals(rows: DispatchChangeRow[]): {
  saves: number;
  costs: number;
  net: number;
} {
  let saves = 0;
  let costs = 0;
  for (const r of rows) {
    if (r.impactLabel === "saves") saves += r.impactUsd;
    if (r.impactLabel === "costs") costs += Math.abs(r.impactUsd);
  }
  return { saves, costs, net: saves - costs };
}

export function getAiQuoteAccuracyRows(_period: ReportPeriodId): AiQuoteAccuracyRow[] {
  return AI_QUOTES;
}

export function aiQuoteAccuracySummary(rows: AiQuoteAccuracyRow[]): {
  quoted: number;
  booked: number;
  abandoned: number;
  avgVariancePct: number | null;
  avgInventoryMatchPct: number;
} {
  const booked = rows.filter((r) => r.outcome === "booked");
  const variances = booked.map((r) => r.variancePct).filter((v): v is number => v != null);
  return {
    quoted: rows.length,
    booked: booked.length,
    abandoned: rows.filter((r) => r.outcome === "abandoned").length,
    avgVariancePct:
      variances.length > 0 ? variances.reduce((a, b) => a + b, 0) / variances.length : null,
    avgInventoryMatchPct:
      rows.reduce((a, r) => a + r.inventoryMatchPct, 0) / Math.max(rows.length, 1),
  };
}
