"use client";

import { useCalendarSettings } from "@/components/providers/CalendarSettingsProvider";
import {
  bookingRatePercent,
  formatLeadsQualification,
  totalLeads,
} from "@/lib/calendar/sales-metrics";
import { toDateKey } from "@/lib/calendar/date-utils";
import type { DaySalesMetrics } from "@/lib/calendar/types";
import { dayReportHref } from "@/lib/reports/day-sales-by-rep";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

function SalesMetric({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 text-center">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

type DaySalesSectionProps = {
  sales: DaySalesMetrics;
  date: Date;
};

export function DaySalesSection({ sales, date }: DaySalesSectionProps) {
  const { colors } = useCalendarSettings();
  const rate = bookingRatePercent(sales);
  const leadsTotal = totalLeads(sales);
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
      <div className="mt-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
        <div className="grid grid-cols-4 gap-2">
          <SalesMetric label="Leads">
            <p className="text-base font-semibold tabular-nums leading-tight text-slate-900">
              {leadsTotal}
            </p>
            <p className="mt-0.5 text-[10px] leading-tight text-slate-600">
              {formatLeadsQualification(sales)}
            </p>
            <p className="mt-0.5 text-[10px] leading-tight text-slate-500">
              ({sales.leadsLocal} local / {sales.leadsLongDistance} LD)
            </p>
          </SalesMetric>
          <SalesMetric label="Proposals sent">
            <p className="text-base font-semibold tabular-nums leading-tight text-slate-900">
              {sales.proposalsSent}
            </p>
          </SalesMetric>
          <SalesMetric label="Booked jobs">
            <p className="text-base font-semibold tabular-nums leading-tight text-slate-900">
              {sales.bookedJobs}
            </p>
          </SalesMetric>
          <SalesMetric label="Booking rate">
            <p
              className="text-base font-semibold tabular-nums leading-tight"
              style={{ color: colors.bookingRateText }}
            >
              {rate}%
            </p>
            <p className="mt-0.5 text-[10px] leading-tight text-slate-500">booked ÷ proposals</p>
          </SalesMetric>
        </div>
      </div>
    </section>
  );
}
