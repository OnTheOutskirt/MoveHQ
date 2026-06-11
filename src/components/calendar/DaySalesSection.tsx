"use client";

import { useCalendarSettings } from "@/components/providers/CalendarSettingsProvider";
import {
  BOOKING_RATE_FORMULA_LABEL,
  bookingRatePercent,
  totalLeads,
} from "@/lib/calendar/sales-metrics";
import { toDateKey } from "@/lib/calendar/date-utils";
import { formatRevenueProjection, projectedRevenueForDay } from "@/lib/calendar/revenue-projection";
import type { CalendarDayData, DaySalesMetrics } from "@/lib/calendar/types";
import { dayReportHref } from "@/lib/reports/day-sales-by-rep";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type DaySalesSectionProps = {
  sales: DaySalesMetrics;
  date: Date;
  day?: CalendarDayData | null;
};

function PipelineStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0 text-center sm:text-left">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums leading-tight text-slate-900">{value}</p>
    </div>
  );
}

export function DaySalesSection({ sales, date, day }: DaySalesSectionProps) {
  const { colors } = useCalendarSettings();
  const rate = bookingRatePercent(sales);
  const revenue = day ? projectedRevenueForDay(day) : null;
  const reportHref = dayReportHref(toDateKey(date));

  return (
    <section>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">Sales pipeline</h3>
        <Link
          href={reportHref}
          className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          Day report
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white px-3 py-2.5">
        <div className="grid grid-cols-5 gap-2">
          <PipelineStat
            label="Qualified leads"
            value={
              <span>
                {sales.leadsQualified}
                {sales.leadsUnqualified > 0 ? (
                  <span className="mt-0.5 block text-[10px] font-normal text-slate-400">
                    {sales.leadsUnqualified} unqualified
                  </span>
                ) : null}
              </span>
            }
          />
          <PipelineStat label="Proposals" value={sales.proposalsSent} />
          <PipelineStat label="Booked" value={sales.bookedJobs} />
          <PipelineStat
            label="Booking rate"
            value={
              <span title={BOOKING_RATE_FORMULA_LABEL} style={{ color: colors.bookingRateText }}>
                {rate}%
              </span>
            }
          />
          <PipelineStat
            label="Proj. rev"
            value={
              revenue != null ? (
                <span className="text-emerald-800">{formatRevenueProjection(revenue)}</span>
              ) : (
                "—"
              )
            }
          />
        </div>
      </div>
    </section>
  );
}
