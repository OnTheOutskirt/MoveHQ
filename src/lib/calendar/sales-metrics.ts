import type { DaySalesMetrics } from "./types";

export function bookingRatePercent(sales: DaySalesMetrics): number {
  if (sales.proposalsSent <= 0) return 0;
  return Math.round((sales.bookedJobs / sales.proposalsSent) * 1000) / 10;
}

export const EMPTY_SALES: DaySalesMetrics = {
  leadsLocal: 0,
  leadsLongDistance: 0,
  proposalsSent: 0,
  bookedJobs: 0,
};
