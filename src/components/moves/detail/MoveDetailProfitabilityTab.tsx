"use client";

import { DetailSection } from "@/components/moves/detail/DetailSection";
import { MoveDetailSectionAnchor } from "@/components/moves/detail/MoveDetailSectionAnchor";
import { MoveDetailTabSections } from "@/components/moves/detail/MoveDetailTabSections";
import { PricingTypeBadge } from "@/components/moves/detail/PricingTypeBadge";
import {
  formatProfitCurrency,
  formatProfitHours,
  formatProfitMargin,
  formatVarianceCurrency,
  formatVarianceHours,
} from "@/lib/moves/profitability-format";
import { getMoveProfitabilityAnalysis } from "@/lib/moves/profitability";
import {
  PROFITABILITY_SECTION_IDS,
  PROFITABILITY_SECTIONS,
} from "@/lib/moves/move-detail-sections";
import type { MoveProfitabilityAnalysis, ProfitabilityMetricSet } from "@/lib/moves/profitability";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { formatJobDayDate } from "@/lib/moves/job-days-plan";

type MoveDetailProfitabilityTabProps = {
  move: MoveRecord;
};

function MetricCell({
  label,
  value,
  sub,
  className,
}: {
  label: string;
  value: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums text-slate-900">{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-slate-500">{sub}</p> : null}
    </div>
  );
}

function MetricsPanel({
  title,
  subtitle,
  metrics,
  muted,
}: {
  title: string;
  subtitle?: string;
  metrics: ProfitabilityMetricSet;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        muted ? "border-dashed border-slate-200 bg-slate-50/80" : "border-slate-200 bg-white shadow-sm",
      )}
    >
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
        {subtitle ? <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p> : null}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCell label="Hours" value={formatProfitHours(metrics.hours)} />
        <MetricCell label="Revenue" value={formatProfitCurrency(metrics.revenue)} />
        <MetricCell label="Profit" value={formatProfitCurrency(metrics.profit)} />
        <MetricCell label="Margin" value={formatProfitMargin(metrics.marginPct)} />
      </div>
      <p className="mt-3 border-t border-slate-100 pt-2 text-xs text-slate-500">
        Total cost {formatProfitCurrency(metrics.cost)}
      </p>
    </div>
  );
}

function ComparisonPanel({ analysis }: { analysis: MoveProfitabilityAnalysis }) {
  const v = analysis.totals.variance;
  const act = analysis.totals.actual;
  if (!v || !act || !analysis.showComparison) return null;

  const hoursVar = formatVarianceHours(v.hours, v.hoursPct);
  const revVar = formatVarianceCurrency(v.revenue, v.revenuePct);
  const costVar = formatVarianceCurrency(v.cost, v.costPct, { invertGood: true });
  const profitVar = formatVarianceCurrency(v.profit, v.profitPct);

  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-800">vs estimate</p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            ["Hours", hoursVar],
            ["Revenue", revVar],
            ["Cost", costVar],
            ["Profit", profitVar],
          ] as const
        ).map(([label, item]) => (
          <div key={label}>
            <p className="text-[10px] font-medium text-slate-600">{label}</p>
            <p
              className={cn(
                "mt-0.5 text-sm font-semibold tabular-nums",
                item.tone === "good" && "text-emerald-700",
                item.tone === "bad" && "text-red-700",
                item.tone === "neutral" && "text-slate-700",
              )}
            >
              {item.text}
            </p>
          </div>
        ))}
      </div>
      {v.marginPts != null ? (
        <p className="mt-2 text-xs text-slate-600">
          Margin {v.marginPts > 0 ? "+" : ""}
          {v.marginPts} pts vs estimate
        </p>
      ) : null}
    </div>
  );
}

export function MoveDetailProfitabilityTab({ move }: MoveDetailProfitabilityTabProps) {
  const analysis = getMoveProfitabilityAnalysis(move);
  const { estimated, actual } = analysis.totals;

  const jobDayBadge =
    analysis.jobDayMode === "multi"
      ? `${analysis.jobDayCount} job days`
      : analysis.jobDayMode === "single"
        ? "Single day"
        : "No job days yet";

  return (
    <MoveDetailTabSections
      sections={PROFITABILITY_SECTIONS}
      ariaLabel="Profitability sections"
    >
      <MoveDetailSectionAnchor id={PROFITABILITY_SECTION_IDS.summary}>
      <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <PricingTypeBadge quoteType={move.quoteType} />
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
          {jobDayBadge}
        </span>
        {analysis.pricingModel === "hourly" ? (
          <span className="text-xs text-slate-500">Revenue = rate × hours</span>
        ) : null}
      </div>

      <p className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-600">
        {analysis.statusNote}
      </p>

      <MetricsPanel title="Estimate" metrics={estimated} />

      {analysis.showActuals && actual ? (
        <MetricsPanel
          title={analysis.showComparison ? "Actuals" : "Actuals (partial)"}
          subtitle={
            analysis.showComparison
              ? "Final numbers after move completion"
              : "Updates as each job day is completed"
          }
          metrics={actual}
          muted={!analysis.showComparison}
        />
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center">
          <p className="text-sm font-medium text-slate-700">Actuals not available yet</p>
          <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
            Labor hours, revenue, and margin comparison unlock when job days are complete and the
            move is closed out.
          </p>
        </div>
      )}

      <ComparisonPanel analysis={analysis} />
      </div>
      </MoveDetailSectionAnchor>

      <MoveDetailSectionAnchor id={PROFITABILITY_SECTION_IDS.costBreakdown}>
      <DetailSection
        title="Estimated cost breakdown"
        description="Labor, drive time, materials, truck, fuel, and other"
      >
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-2 font-semibold">Category</th>
                <th className="px-4 py-2 font-semibold text-right">Estimated</th>
                <th className="px-4 py-2 font-semibold text-right">Actual</th>
                {analysis.showComparison ? (
                  <th className="px-4 py-2 font-semibold text-right">Variance</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {analysis.costLines.map((line) => {
                const varAmt =
                  line.actual != null ? line.actual - line.estimated : null;
                const varPct =
                  varAmt != null && line.estimated !== 0
                    ? Math.round((varAmt / line.estimated) * 1000) / 10
                    : null;
                const varFmt = formatVarianceCurrency(varAmt, varPct, { invertGood: true });
                return (
                  <tr key={line.category} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-2.5 text-slate-800">{line.label}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-900">
                      {formatProfitCurrency(line.estimated)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">
                      {line.actual != null ? formatProfitCurrency(line.actual) : "—"}
                    </td>
                    {analysis.showComparison ? (
                      <td
                        className={cn(
                          "px-4 py-2.5 text-right text-xs font-medium tabular-nums",
                          varFmt.tone === "good" && "text-emerald-700",
                          varFmt.tone === "bad" && "text-red-700",
                          varFmt.tone === "neutral" && "text-slate-500",
                        )}
                      >
                        {varFmt.text}
                      </td>
                    ) : null}
                  </tr>
                );
              })}
              <tr className="bg-slate-50/80 font-semibold">
                <td className="px-4 py-2.5 text-slate-900">Total cost</td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {formatProfitCurrency(estimated.cost)}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-slate-700">
                  {actual ? formatProfitCurrency(actual.cost) : "—"}
                </td>
                {analysis.showComparison && analysis.totals.variance ? (
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-700">
                    {formatVarianceCurrency(
                      analysis.totals.variance.cost,
                      analysis.totals.variance.costPct,
                      { invertGood: true },
                    ).text}
                  </td>
                ) : null}
              </tr>
            </tbody>
          </table>
        </div>
      </DetailSection>
      </MoveDetailSectionAnchor>

      <MoveDetailSectionAnchor id={PROFITABILITY_SECTION_IDS.byJobDay}>
      <DetailSection
        title={
          analysis.jobDayMode === "multi"
            ? "By job day"
            : analysis.jobDayMode === "single"
              ? "Single job day"
              : "By job day"
        }
        description="Hours and cost allocation per day — revenue split by planned hours"
      >
        {analysis.byJobDay.length === 0 ? (
          <p className="text-sm text-slate-500">
            Plan job days on the Move Plan tab to see per-day profitability.
          </p>
        ) : (
          <div
            className={cn(
              "gap-3",
              analysis.jobDayMode === "multi"
                ? "grid md:grid-cols-2"
                : "max-w-xl",
            )}
          >
            {analysis.byJobDay.map((row, i) => (
              <article
                key={row.jobDayId}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-slate-500">
                      Day {i + 1}
                    </p>
                    <p className="font-semibold text-slate-900">{row.label}</p>
                    <p className="text-xs text-slate-500">{formatJobDayDate(row.date)}</p>
                  </div>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium capitalize text-slate-600">
                    {row.status.replace("_", " ")}
                  </span>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  <div>
                    <dt className="text-slate-500">Est. hours</dt>
                    <dd className="font-medium tabular-nums">{formatProfitHours(row.hoursEstimated)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Actual hours</dt>
                    <dd className="font-medium tabular-nums">
                      {row.hoursActual != null ? formatProfitHours(row.hoursActual) : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Crew</dt>
                    <dd className="font-medium">{row.crewSize} movers</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Est. revenue</dt>
                    <dd className="font-medium tabular-nums">
                      {formatProfitCurrency(row.revenueEstimated)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Est. profit</dt>
                    <dd className="font-medium tabular-nums text-emerald-800">
                      {formatProfitCurrency(row.profitEstimated)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Est. margin</dt>
                    <dd className="font-medium tabular-nums">
                      {formatProfitMargin(row.marginEstimatedPct)}
                    </dd>
                  </div>
                </dl>
                {analysis.showComparison && row.profitActual != null ? (
                  <p className="mt-2 border-t border-slate-100 pt-2 text-xs text-slate-600">
                    Actual profit {formatProfitCurrency(row.profitActual)}
                    {row.marginActualPct != null
                      ? ` · ${formatProfitMargin(row.marginActualPct)} margin`
                      : ""}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </DetailSection>
      </MoveDetailSectionAnchor>
    </MoveDetailTabSections>
  );
}
