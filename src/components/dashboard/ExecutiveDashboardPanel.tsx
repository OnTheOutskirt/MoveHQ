"use client";

import { useManualOpsPrepTasks } from "@/components/operations/jobs/use-manual-ops-prep";
import { useOpsPrepDoneIds } from "@/components/operations/jobs/use-ops-prep-done";
import { useClaims } from "@/components/providers/ClaimsProvider";
import { useCrewRecords } from "@/components/providers/CrewRecordsProvider";
import { useFleet } from "@/components/providers/FleetProvider";
import { useInventory } from "@/components/providers/InventoryProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import { useMoves } from "@/components/moves/MovesProvider";
import { CeoSnapshotTable } from "@/components/dashboard/CeoSnapshotTable";
import { TabBar } from "@/components/shared/TabBar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useCalendarMonthDays } from "@/lib/calendar/use-calendar-month-days";
import { addDays, toDateKey } from "@/lib/calendar/date-utils";
import {
  CEO_STATUS_BADGE,
  CEO_STATUS_LABELS,
  computeCeoSnapshot,
  type CeoMetricStatus,
} from "@/lib/dashboard/ceo-snapshot";
import {
  computeExecutiveDashboardMetrics,
  executiveDashboardHasUrgentAttention,
  type ExecutiveDashboardMetrics,
} from "@/lib/dashboard/executive-metrics";
import { currentMonthKey, parseMonthKey } from "@/lib/dashboard/month-buckets";
import { formatMoney } from "@/lib/settings/document-valuation";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  BarChart2,
  ClipboardList,
  Globe,
  Scale,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type ExecutiveTab = "dashboard" | "ceo_snapshot";

export function ExecutiveDashboardPanel() {
  const [tab, setTab] = useState<ExecutiveTab>("dashboard");
  const [monthKey, setMonthKey] = useState(() => currentMonthKey());

  const { moves } = useMoves();
  const { claims } = useClaims();
  const { settings } = useSettings();
  const doneIds = useOpsPrepDoneIds();
  const manualTasks = useManualOpsPrepTasks();
  const { stockLines } = useInventory();
  const { getTruckCapacityBreakdownForDate, timeOffRequests, crew } = useFleet();
  const crewRecords = useCrewRecords();

  const monthAnchor = useMemo(() => {
    const { year, monthIndex } = parseMonthKey(monthKey);
    return new Date(year, monthIndex, 1);
  }, [monthKey]);

  const { days: calendarDays } = useCalendarMonthDays(monthAnchor);

  const metrics = useMemo(() => {
    const today = new Date();
    return computeExecutiveDashboardMetrics({
      moves,
      claims,
      calendarDays,
      manualPrepTasks: manualTasks,
      prepDoneIds: doneIds,
      opsPrepRules: settings.opsPrepRules,
      stockLines,
      fleetToday: getTruckCapacityBreakdownForDate(toDateKey(today)),
      fleetTomorrow: getTruckCapacityBreakdownForDate(toDateKey(addDays(today, 1))),
      pendingTimeOff: timeOffRequests.filter((r) => r.status === "pending").length,
      today,
      weekStartsOn: settings.company.weekStartsOn,
    });
  }, [
    moves,
    claims,
    calendarDays,
    manualTasks,
    doneIds,
    settings.opsPrepRules,
    settings.company.weekStartsOn,
    stockLines,
    getTruckCapacityBreakdownForDate,
    timeOffRequests,
  ]);

  const snapshot = useMemo(
    () =>
      computeCeoSnapshot({
        monthKey,
        moves,
        claims,
        calendarDays,
        crewRecords: {
          issues: crewRecords.issues,
          skipperRatings: crewRecords.skipperRatings,
          driverReviews: crewRecords.driverReviews,
        },
        crew,
        defaults: settings.defaults,
      }),
    [monthKey, moves, claims, calendarDays, crewRecords, crew, settings.defaults],
  );

  const urgent = executiveDashboardHasUrgentAttention(metrics);

  return (
    <div className="space-y-6">
      <TabBar
        tabs={[
          { id: "dashboard", label: "Dashboard" },
          { id: "ceo_snapshot", label: "CEO Snapshot" },
        ]}
        activeTab={tab}
        onChange={setTab}
      />

      {tab === "ceo_snapshot" ? (
        <CeoSnapshotTable data={snapshot} monthKey={monthKey} onMonthChange={setMonthKey} />
      ) : (
        <ExecutiveOverview metrics={metrics} urgent={urgent} />
      )}
    </div>
  );
}

function ExecutiveOverview({
  metrics,
  urgent,
}: {
  metrics: ExecutiveDashboardMetrics;
  urgent: boolean;
}) {
  return (
    <>
      {urgent ? (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            {metrics.attentionCount} area{metrics.attentionCount === 1 ? "" : "s"} need executive
            attention — overdue follow-ups, claims volume, ops prep, or staffing gaps.
          </p>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Revenue MTD"
          value={formatMoney(metrics.revenueMtd)}
          hint={`Target ${formatMoney(metrics.revenueTarget)}`}
          status={metrics.revenueStatus}
          href="/operations/reports?tab=sales"
        />
        <SummaryCard
          label="Gross margin"
          value={
            metrics.grossMarginPct != null ? `${metrics.grossMarginPct.toFixed(1)}%` : "—"
          }
          hint={`Target ${metrics.grossMarginTarget.toFixed(0)}%`}
          status={metrics.grossMarginStatus}
          href="/operations/reports?tab=budget"
        />
        <SummaryCard
          label="Open claims"
          value={String(metrics.openClaims)}
          hint={`Target ≤ ${metrics.claimsTarget}`}
          status={metrics.claimsStatus}
          href="/operations/claims"
        />
        <SummaryCard
          label="Pipeline value"
          value={formatMoney(metrics.pipelineValue)}
          hint={
            metrics.followUpsOverdue > 0
              ? `${metrics.followUpsOverdue} overdue follow-ups`
              : undefined
          }
          status="unset"
          href="/sales/moves"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <UtilizationCard metrics={metrics} />
        <OperationsPulseCard metrics={metrics} />
      </div>

      <QuickLinksRow />
    </>
  );
}

function UtilizationCard({ metrics }: { metrics: ExecutiveDashboardMetrics }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Utilization ({metrics.monthLabel})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          <MiniStat
            label="Mover utilization"
            value={
              metrics.moverUtilizationPct != null
                ? `${metrics.moverUtilizationPct.toFixed(1)}%`
                : "—"
            }
            target="Target 95%"
          />
          <MiniStat
            label="Truck utilization"
            value={
              metrics.truckUtilizationPct != null
                ? `${metrics.truckUtilizationPct.toFixed(1)}%`
                : "—"
            }
            target="Target 85%"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function OperationsPulseCard({ metrics }: { metrics: ExecutiveDashboardMetrics }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Operations pulse</CardTitle>
        <SectionLink href="/operations/dashboard" />
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          <PulseRow
            label="Ops prep due today"
            value={metrics.opsPrepDueToday}
            warn={metrics.opsPrepDueToday > 0}
          />
          <PulseRow
            label="Staffing gaps today"
            value={metrics.staffingGapsToday}
            warn={metrics.staffingGapsToday > 0}
          />
          <PulseRow
            label="Web quote queue"
            value={metrics.webQuotesQueue}
            warn={metrics.webQuotesQueue > 0}
          />
          <PulseRow
            label="Overdue follow-ups"
            value={metrics.followUpsOverdue}
            warn={metrics.followUpsOverdue > 0}
          />
        </ul>
      </CardContent>
    </Card>
  );
}

function QuickLinksRow() {
  const links = [
    { href: "/operations/reports?tab=day", label: "Day pipeline", icon: BarChart2 },
    { href: "/operations/reports?tab=sales", label: "Sales revenue", icon: TrendingUp },
    { href: "/operations/reports?tab=budget", label: "Budget vs actual", icon: ClipboardList },
    { href: "/sales/web-quotes", label: "Web quotes", icon: Globe },
    { href: "/operations/claims", label: "Claims", icon: Scale },
  ];

  return (
    <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
        >
          <Icon className="h-4 w-4 opacity-70" />
          {label}
        </Link>
      ))}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  status,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  status: CeoMetricStatus;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-colors hover:border-brand-200 hover:bg-brand-50/40"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <Badge className={cn("text-[10px]", CEO_STATUS_BADGE[status])}>
          {CEO_STATUS_LABELS[status]}
        </Badge>
      </div>
      <p className="mt-0.5 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-slate-500">{hint}</p> : null}
    </Link>
  );
}

function MiniStat({ label, value, target }: { label: string; value: string; target: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{target}</p>
    </div>
  );
}

function PulseRow({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <li className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
      <span className="text-sm text-slate-700">{label}</span>
      <Badge className={warn ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-700"}>
        {value}
      </Badge>
    </li>
  );
}

function SectionLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-0.5 text-xs font-medium text-brand-600 hover:text-brand-700"
    >
      Open
      <ArrowRight className="h-3 w-3" />
    </Link>
  );
}
