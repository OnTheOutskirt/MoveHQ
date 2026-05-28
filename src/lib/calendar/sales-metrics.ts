import type { DaySalesMetrics } from "./types";

export function totalLeads(sales: DaySalesMetrics): number {
  return sales.leadsLocal + sales.leadsLongDistance;
}

export function bookingRatePercent(sales: DaySalesMetrics): number {
  if (sales.proposalsSent <= 0) return 0;
  return Math.round((sales.bookedJobs / sales.proposalsSent) * 1000) / 10;
}

/** Human-readable qualification split under total leads. */
export function formatLeadsQualification(sales: DaySalesMetrics): string {
  return `${sales.leadsQualified} qualified · ${sales.leadsUnqualified} unqualified`;
}

export const EMPTY_SALES: DaySalesMetrics = {
  leadsLocal: 0,
  leadsLongDistance: 0,
  leadsQualified: 0,
  leadsUnqualified: 0,
  proposalsSent: 0,
  bookedJobs: 0,
};
