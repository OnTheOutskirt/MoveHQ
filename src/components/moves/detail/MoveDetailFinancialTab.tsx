"use client";

import { MoveDetailLiabilityTab } from "@/components/moves/detail/MoveDetailLiabilityTab";
import { PricingTypeBadge } from "@/components/moves/detail/PricingTypeBadge";
import { DetailSection } from "@/components/moves/detail/DetailSection";
import { formatQuote } from "@/lib/moves/format";
import { getMoveOperationalSummary } from "@/lib/moves/move-operational";
import type { MoveRecord } from "@/lib/moves/types";

type MoveDetailFinancialTabProps = {
  move: MoveRecord;
};

export function MoveDetailFinancialTab({ move }: MoveDetailFinancialTabProps) {
  const ops = getMoveOperationalSummary(move);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border-2 border-brand-200 bg-gradient-to-br from-white to-brand-50/40 p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Live operational estimator
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">
              {formatQuote(move.quoteAmount, move.quoteType)}
            </p>
            <div className="mt-2">
              <PricingTypeBadge quoteType={move.quoteType} />
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm">
            <p className="font-semibold text-slate-900">{ops.aiQuoteRecommendation}</p>
            {ops.quoteConfidence ? (
              <p className="mt-1 text-slate-600">
                Confidence: <span className="font-medium text-emerald-700">{ops.quoteConfidence}</span>
              </p>
            ) : null}
          </div>
        </div>
        {ops.costDrivers.length > 0 ? (
          <div className="mt-4 border-t border-brand-100 pt-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Cost drivers</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ops.costDrivers.map((d) => (
                <span
                  key={d}
                  className="rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        <p className="mt-4 text-xs text-slate-500">
          Quote built from move plan — intake, access, inventory, and service mix. Adjust intake to
          refresh the estimate.
        </p>
      </div>

      <DetailSection title="Payments & balance">
        <dl className="grid gap-3 sm:grid-cols-3 text-sm">
          <div>
            <dt className="text-slate-500">Outstanding</dt>
            <dd className="font-semibold text-slate-900">{ops.outstandingBalance}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Deposit</dt>
            <dd className="font-medium text-slate-400">—</dd>
          </div>
          <div>
            <dt className="text-slate-500">Final invoice</dt>
            <dd className="font-medium text-slate-400">—</dd>
          </div>
        </dl>
      </DetailSection>

      <DetailSection title="Profitability">
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center text-sm text-slate-500">
          Margin and labor cost analysis after job completion — coming soon
        </div>
      </DetailSection>

      <MoveDetailLiabilityTab move={move} />
    </div>
  );
}
