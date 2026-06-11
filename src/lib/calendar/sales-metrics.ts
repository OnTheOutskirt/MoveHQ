import type { CalendarColorTheme } from "./settings/colors";
import type { DaySalesMetrics } from "./types";

export function totalLeads(sales: DaySalesMetrics): number {
  return sales.leadsLocal + sales.leadsLongDistance;
}

export function bookingRatePercent(sales: DaySalesMetrics): number {
  if (sales.leadsQualified <= 0) return 0;
  return Math.round((sales.bookedJobs / sales.leadsQualified) * 1000) / 10;
}

export const BOOKING_RATE_FORMULA_LABEL = "booked ÷ qualified leads";

/** Month-cell booking rate color: red below 50%, otherwise theme booking-rate accent. */
export function bookingRateHighlightColor(
  rate: number,
  colors: CalendarColorTheme,
  isPast: boolean,
): string {
  if (isPast) return colors.resourceMutedText;
  if (rate < 50) return colors.capacityFullText;
  return colors.bookingRateText;
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
