import { bookingRatePercent } from "@/lib/calendar/sales-metrics";
import type { DaySalesMetrics } from "@/lib/calendar/types";

export type SalesRepDayMetrics = {
  id: string;
  name: string;
  leadsLocal: number;
  leadsLongDistance: number;
  proposalsSent: number;
  bookedJobs: number;
  bookingRatePercent: number;
};

const SALES_REPS = [
  { id: "rep-jordan", name: "Jordan M." },
  { id: "rep-sam", name: "Sam K." },
  { id: "rep-alex", name: "Alex R." },
] as const;

function seeded(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/** Split a total across three reps using seeded weights (sums exactly to total). */
function splitAcrossReps(total: number, seed: number): [number, number, number] {
  if (total <= 0) return [0, 0, 0];
  const w0 = 0.2 + seeded(seed) * 0.5;
  const w1 = 0.2 + seeded(seed + 1) * 0.5;
  const w2 = 0.2 + seeded(seed + 2) * 0.5;
  const sum = w0 + w1 + w2;
  const raw = [Math.floor((w0 / sum) * total), Math.floor((w1 / sum) * total), Math.floor((w2 / sum) * total)];
  let left = total - raw[0]! - raw[1]! - raw[2]!;
  let i = 0;
  while (left > 0) {
    raw[i % 3]! += 1;
    left -= 1;
    i += 1;
  }
  return [raw[0]!, raw[1]!, raw[2]!];
}

export function buildSalesRepDayMetrics(
  sales: DaySalesMetrics,
  dateKey: string,
): SalesRepDayMetrics[] {
  const seedBase =
    dateKey.split("").reduce((n, c) => n + c.charCodeAt(0), 0) * 17 + 3;

  const localParts = splitAcrossReps(sales.leadsLocal, seedBase);
  const ldParts = splitAcrossReps(sales.leadsLongDistance, seedBase + 10);
  const proposalParts = splitAcrossReps(sales.proposalsSent, seedBase + 20);
  const bookedParts = splitAcrossReps(sales.bookedJobs, seedBase + 30);

  return SALES_REPS.map((rep, i) => {
    const repSales: DaySalesMetrics = {
      leadsLocal: localParts[i]!,
      leadsLongDistance: ldParts[i]!,
      proposalsSent: proposalParts[i]!,
      bookedJobs: bookedParts[i]!,
    };
    return {
      id: rep.id,
      name: rep.name,
      ...repSales,
      bookingRatePercent: bookingRatePercent(repSales),
    };
  });
}

export function dayReportHref(dateKey: string): string {
  return `/operations/reports?tab=day&date=${dateKey}`;
}
