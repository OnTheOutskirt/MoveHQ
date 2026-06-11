"use client";

import { PricingTypeBadge } from "@/components/moves/detail/PricingTypeBadge";
import { OpsJobDayOpsPanel } from "@/components/operations/jobs/OpsJobDayOpsPanel";
import {
  formatProfitCurrency,
  formatProfitHours,
  formatVarianceCurrency,
  formatVarianceHours,
} from "@/lib/moves/profitability-format";
import type { MoveJobDay, MoveRecord } from "@/lib/moves/types";
import { getOpsJobDayInfo } from "@/lib/operations/ops-job-day-info";
import { cn } from "@/lib/utils";
import { BarChart3 } from "lucide-react";
import { useMemo } from "react";

type OpsJobDayInfoPanelProps = {
  move: MoveRecord;
  jobDay: MoveJobDay;
  onJobDayChange: (patch: Partial<MoveJobDay>) => void;
};

type ComparisonRow = {
  key: string;
  label: string;
  estimate: string;
  actual: React.ReactNode;
  variance?: ReturnType<typeof formatVarianceCurrency>;
};

export function OpsJobDayInfoPanel({
  move,
  jobDay,
  onJobDayChange,
}: OpsJobDayInfoPanelProps) {
  const info = useMemo(() => getOpsJobDayInfo(move, jobDay), [move, jobDay]);
  const { analysis, profitabilityRow } = info;

  const hoursEst = jobDay.hoursEstimated ?? profitabilityRow?.hoursEstimated ?? 0;
  const hoursAct = jobDay.hoursActual ?? null;
  const hoursVariance =
    hoursAct != null ? formatVarianceHours(hoursAct - hoursEst, null) : undefined;

  const costEst = profitabilityRow?.costEstimated ?? null;
  const costAct = profitabilityRow?.costActual ?? null;
  const costVariance =
    costEst != null && costAct != null
      ? formatVarianceCurrency(costAct - costEst, null, { invertGood: true })
      : undefined;

  const revenueEst = profitabilityRow?.revenueEstimated ?? null;
  const revenueAct = profitabilityRow?.revenueActual ?? null;

  const rows: ComparisonRow[] = [
    {
      key: "crew",
      label: "Crew",
      estimate: `${info.crewPlanned} mover${info.crewPlanned === 1 ? "" : "s"}`,
      actual: (
        <label className="inline-flex items-center justify-end gap-1">
          <input
            type="number"
            min={1}
            max={20}
            step={1}
            value={info.crewActual ?? ""}
            onChange={(e) => {
              const raw = e.target.value;
              onJobDayChange({
                crewSizeActual: raw === "" ? undefined : Number(raw),
              });
            }}
            placeholder={String(info.crewPlanned)}
            className="w-14 rounded-md border border-slate-200 bg-white px-1.5 py-1 text-right text-sm tabular-nums"
          />
          <span className="text-xs text-slate-500">sent</span>
        </label>
      ),
    },
    {
      key: "hours",
      label: "Labor hours",
      estimate: formatProfitHours(hoursEst),
      actual: (
        <label className="inline-flex items-center justify-end gap-1">
          <input
            type="number"
            min={0}
            step={0.25}
            value={hoursAct ?? ""}
            onChange={(e) => {
              const raw = e.target.value;
              onJobDayChange({
                hoursActual: raw === "" ? undefined : Number(raw),
              });
            }}
            placeholder={hoursEst > 0 ? String(hoursEst) : undefined}
            className="w-16 rounded-md border border-slate-200 bg-white px-1.5 py-1 text-right text-sm tabular-nums"
          />
          <span className="text-xs text-slate-500">hrs</span>
        </label>
      ),
      variance: hoursVariance,
    },
    {
      key: "drive",
      label: "Drive time",
      estimate: formatProfitHours(info.driveEstimated),
      actual: (
        <label className="inline-flex items-center justify-end gap-1">
          <input
            type="number"
            min={0}
            step={0.25}
            value={info.driveActual ?? ""}
            onChange={(e) => {
              const raw = e.target.value;
              onJobDayChange({
                actualDriveHours: raw === "" ? null : Number(raw),
              });
            }}
            placeholder={String(info.driveEstimated)}
            className="w-16 rounded-md border border-slate-200 bg-white px-1.5 py-1 text-right text-sm tabular-nums"
          />
          <span className="text-xs text-slate-500">hrs</span>
        </label>
      ),
    },
    {
      key: "materials",
      label: "Materials",
      estimate: formatProfitCurrency(info.materialsEstimated),
      actual: "—",
    },
    {
      key: "cost",
      label: "Job cost",
      estimate: costEst != null ? formatProfitCurrency(costEst) : "—",
      actual: costAct != null ? formatProfitCurrency(costAct) : "—",
      variance: costVariance,
    },
  ];

  if (move.quoteType !== "hourly" && revenueEst != null) {
    rows.push({
      key: "revenue",
      label: "Revenue",
      estimate: formatProfitCurrency(revenueEst),
      actual: revenueAct != null ? formatProfitCurrency(revenueAct) : "—",
    });
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
            <BarChart3 className="h-3.5 w-3.5" aria-hidden />
            Estimated vs actual
          </p>
          <PricingTypeBadge quoteType={move.quoteType} />
        </div>
        <p className="mt-1 text-xs text-slate-500">{analysis.statusNote}</p>

        <div className="mt-3 overflow-x-auto rounded-lg border border-slate-100">
          <table className="w-full min-w-[20rem] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Metric
                </th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Estimate
                </th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Actual
                </th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  vs est.
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-b border-slate-50 last:border-0">
                  <td className="px-3 py-2 font-medium text-slate-800">{row.label}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-slate-900">
                    {row.estimate}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-slate-900">
                    {row.actual}
                  </td>
                  <td
                    className={cn(
                      "px-3 py-2 text-right text-xs font-medium tabular-nums",
                      row.variance?.tone === "good" && "text-emerald-700",
                      row.variance?.tone === "bad" && "text-red-700",
                      (!row.variance || row.variance.tone === "neutral") && "text-slate-500",
                    )}
                  >
                    {row.variance?.text ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Record crew sent and labor hours after the job — used for ops reporting and profitability.
        </p>
      </section>

      <OpsJobDayOpsPanel
        move={move}
        jobDay={jobDay}
        onDriveHoursChange={(hours) => onJobDayChange({ actualDriveHours: hours })}
        hideDriveSection
      />
    </div>
  );
}
