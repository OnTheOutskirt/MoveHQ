"use client";

import { ChecklistGroup } from "@/components/planning/ChecklistGroup";
import { usePlanningProgress } from "@/components/planning/PlanningProgressProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  allSaasPlanItemIds,
  formatUsd,
  SAAS_COMPETITORS,
  SAAS_COST_ESTIMATES,
  SAAS_DIFFERENTIATORS,
  SAAS_MARKETING_CHANNELS,
  SAAS_PLAN_GROUPS,
  SAAS_PRICING,
  SAAS_REVENUE_SCENARIOS,
} from "@/lib/planning/saas-plan";
import { countProgress } from "@/lib/planning/planning-progress";
import { cn } from "@/lib/utils";
import {
  Building2,
  DollarSign,
  Megaphone,
  Rocket,
  Scale,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo } from "react";

type SaasMarketingChannelCost = "low" | "medium" | "high";

const COST_BADGE: Record<SaasMarketingChannelCost, string> = {
  low: "bg-emerald-100 text-emerald-800",
  medium: "bg-amber-100 text-amber-900",
  high: "bg-rose-100 text-rose-800",
};

function CostBadge({ cost }: { cost: SaasMarketingChannelCost }) {
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        COST_BADGE[cost],
      )}
    >
      {cost} spend
    </span>
  );
}

export function SaasPlanView() {
  const { progress } = usePlanningProgress();
  const planIds = useMemo(() => allSaasPlanItemIds(), []);
  const planStats = useMemo(() => {
    const { done, total } = countProgress(planIds, progress);
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [planIds, progress]);

  const monthlyCostLow = SAAS_COST_ESTIMATES.reduce((s, c) => s + c.lowEstimate, 0);
  const monthlyCostHigh = SAAS_COST_ESTIMATES.reduce((s, c) => s + c.highEstimate, 0);

  return (
    <div className="space-y-6">
      <Card className="border-brand-200 bg-brand-50/40">
        <CardContent className="flex items-start gap-3 py-5">
          <Rocket className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" />
          <div>
            <p className="text-sm font-semibold text-brand-900">MoveHQ as SaaS</p>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-700">
              Business plan for selling MoveHQ to other moving companies. We expect a stronger
              product than incumbents — full operations, deep integrations, and AI flat-rate quoting
              from the website — with lean marketing and a clear path from 10 → 50 → 100 customers.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-slate-200 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-brand-600" />
              Why MoveHQ wins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {SAAS_DIFFERENTIATORS.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-slate-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="py-5 text-center">
            <p className="text-2xl font-bold tabular-nums text-brand-700">{planStats.pct}%</p>
            <p className="text-xs font-medium text-slate-500">
              {planStats.done} of {planStats.total} planning items done
            </p>
            <p className="mt-2 text-xs text-slate-500">Check off decisions as you lock them in.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-slate-600" />
            Competitive landscape
          </CardTitle>
          <p className="text-sm text-slate-500">
            Known players — we believe MoveHQ is broader and more modern across ops + AI.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SAAS_COMPETITORS.map((c) => (
              <div
                key={c.name}
                className="rounded-lg border border-slate-100 bg-slate-50/60 p-3"
              >
                <p className="font-semibold text-slate-900">{c.name}</p>
                <p className="mt-1 text-xs text-slate-600">{c.note}</p>
                {c.strength ? (
                  <p className="mt-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-600">Their strength:</span> {c.strength}
                  </p>
                ) : null}
                {c.gap ? (
                  <p className="mt-1 text-xs text-brand-800/90">
                    <span className="font-medium">Our edge:</span> {c.gap}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4 text-emerald-700" />
              Pricing model
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-2xl font-bold text-slate-900">{SAAS_PRICING.label}</p>
            <p className="text-sm text-slate-600">{SAAS_PRICING.note}</p>
            <div className="rounded-lg border border-emerald-200 bg-white/80 p-3 text-sm text-slate-700">
              <p className="font-medium text-slate-900">Example</p>
              <p className="mt-1">
                3-location company: {formatUsd(SAAS_PRICING.baseMonthly)} + 2 ×{" "}
                {formatUsd(SAAS_PRICING.additionalLocationMonthly)} ={" "}
                <strong>
                  {formatUsd(
                    SAAS_PRICING.baseMonthly + 2 * SAAS_PRICING.additionalLocationMonthly,
                  )}
                  /mo
                </strong>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-brand-600" />
              Revenue scenarios
            </CardTitle>
            <p className="text-sm text-slate-500">
              Assumes {formatUsd(SAAS_PRICING.baseMonthly)}/mo per customer, one location each.
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[280px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="pb-2 pr-4">Customers</th>
                    <th className="pb-2 pr-4">MRR</th>
                    <th className="pb-2">ARR</th>
                  </tr>
                </thead>
                <tbody>
                  {SAAS_REVENUE_SCENARIOS.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-2.5 pr-4">
                        <span className="font-semibold text-slate-900">{row.customers}</span>
                        <span className="ml-2 text-xs text-slate-500">{row.label}</span>
                      </td>
                      <td className="py-2.5 pr-4 font-medium tabular-nums text-slate-800">
                        {formatUsd(row.monthlyRevenue)}/mo
                      </td>
                      <td className="py-2.5 font-medium tabular-nums text-brand-800">
                        {formatUsd(row.annualRevenue)}/yr
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="h-4 w-4 text-slate-600" />
            Cost estimates (monthly)
          </CardTitle>
          <p className="text-sm text-slate-500">
            Rough ranges for planning — not a budget commitment. Defer hires until MRR supports
            them.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm text-slate-600">
              Combined monthly burn (all lines):{" "}
              <strong className="text-slate-900">
                {formatUsd(monthlyCostLow)} – {formatUsd(monthlyCostHigh)}
              </strong>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              At 10 customers ({formatUsd(15_000)} MRR), aim to stay under ~50% of MRR on opex
              excluding founder salary.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {SAAS_COST_ESTIMATES.map((line) => (
              <div
                key={line.role}
                className="rounded-lg border border-slate-100 bg-white p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{line.role}</p>
                  <p className="text-sm font-medium tabular-nums text-slate-700">
                    {line.lowEstimate === 0 && line.highEstimate > 0
                      ? `Up to ${formatUsd(line.highEstimate)}`
                      : `${formatUsd(line.lowEstimate)} – ${formatUsd(line.highEstimate)}`}
                    /mo
                  </p>
                </div>
                <p className="mt-1 text-xs text-slate-600">{line.note}</p>
                {line.options ? (
                  <p className="mt-1 text-xs text-slate-500">
                    <span className="font-medium">Options:</span> {line.options}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Megaphone className="h-4 w-4 text-slate-600" />
            Marketing plan (lean spend)
          </CardTitle>
          <p className="text-sm text-slate-500">
            Conferences for trust + demos; digital and referrals for scale without heavy ad spend.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {SAAS_MARKETING_CHANNELS.map((channel) => (
              <div
                key={channel.name}
                className="rounded-lg border border-slate-100 bg-slate-50/50 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900">{channel.name}</p>
                  <CostBadge cost={channel.cost} />
                </div>
                <p className="mt-2 text-xs text-slate-600">{channel.note}</p>
                <ul className="mt-3 space-y-1">
                  {channel.tactics.map((t) => (
                    <li key={t} className="flex gap-2 text-xs text-slate-700">
                      <Target className="mt-0.5 h-3 w-3 shrink-0 text-brand-500" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-300 bg-slate-50">
        <CardContent className="flex items-start gap-3 py-4">
          <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-slate-600" />
          <p className="text-sm text-slate-600">
            <strong className="text-slate-800">Next step:</strong> work through the checklist below
            — positioning, pricing validation, first sales hire, conference calendar, and SaaS
            product readiness (billing, multi-tenant, migration).
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {SAAS_PLAN_GROUPS.map((group) => (
          <ChecklistGroup key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
}
