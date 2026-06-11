"use client";

import type { PricingRateScheduleEntry } from "@/lib/pricing/rate-history-types";
import { cn } from "@/lib/utils";
import { History } from "lucide-react";

type RateHistoryPanelProps = {
  entries: PricingRateScheduleEntry[];
  className?: string;
};

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function RateHistoryPanel({ entries, className }: RateHistoryPanelProps) {
  const sorted = [...entries].sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));

  return (
    <section className={cn("rounded-xl border border-slate-200 bg-white", className)}>
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
        <History className="h-4 w-4 text-slate-400" aria-hidden />
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Rate history</h3>
          <p className="text-xs text-slate-500">
            Contracted moves keep the rates effective on their lock date; new quotes use the latest
            schedule.
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {sorted.map((entry, index) => {
          const isCurrent = index === 0;
          const supplySamples = Object.entries(entry.supplyUnitPrices)
            .filter(([id]) => ["small_box", "medium_box", "wardrobe_box"].includes(id))
            .slice(0, 3);

          return (
            <div key={entry.id} className="px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-slate-900">
                  Effective {formatDate(entry.effectiveFrom)}
                </p>
                {isCurrent ? (
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
                    Current
                  </span>
                ) : null}
              </div>
              {entry.note ? <p className="mt-0.5 text-xs text-slate-500">{entry.note}</p> : null}
              <dl className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Hourly crew rate</dt>
                  <dd className="font-medium text-slate-800">{formatMoney(entry.hourlyCrewRate)}/hr</dd>
                </div>
                {supplySamples.map(([id, price]) => (
                  <div key={id}>
                    <dt className="text-slate-500">{id.replace(/_/g, " ")}</dt>
                    <dd className="font-medium text-slate-800">{formatMoney(price)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          );
        })}
      </div>
    </section>
  );
}
