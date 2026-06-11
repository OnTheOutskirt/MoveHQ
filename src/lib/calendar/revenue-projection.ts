import type { CalendarDayData, DayPipelineRow } from "./types";

const AVG_BOOKED_JOB_REVENUE = 2450;

/** Demo projected revenue for a calendar day from booked pipeline rows. */
export function projectedRevenueForDay(day: CalendarDayData): number {
  const booked = day.pipeline.filter((r) => r.stage === "booked");
  if (booked.length === 0) {
    return day.sales.bookedJobs * AVG_BOOKED_JOB_REVENUE;
  }
  return booked.reduce((sum, row) => sum + estimateRowRevenue(row), 0);
}

function estimateRowRevenue(row: DayPipelineRow): number {
  const base = AVG_BOOKED_JOB_REVENUE;
  const moverFactor = 1 + (row.movers - 3) * 0.08;
  const truckFactor = 1 + (row.trucks - 1) * 0.12;
  return Math.round(base * moverFactor * truckFactor);
}

/** Compact $ for calendar: $6.1k, $6k, $1.2M — at most one decimal, no trailing .0 */
export function formatRevenueProjection(amount: number): string {
  if (amount >= 1_000_000) {
    return formatScaledCurrency(amount, 1_000_000, "M");
  }
  if (amount >= 1000) {
    return formatScaledCurrency(amount, 1000, "k");
  }
  return `$${amount.toLocaleString("en-US")}`;
}

function formatScaledCurrency(amount: number, divisor: number, suffix: string): string {
  const scaled = Math.round((amount / divisor) * 10) / 10;
  const text = Number.isInteger(scaled) ? String(scaled) : scaled.toFixed(1);
  return `$${text}${suffix}`;
}
