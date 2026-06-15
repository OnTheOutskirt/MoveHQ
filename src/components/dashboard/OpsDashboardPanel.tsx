"use client";

import { useManualOpsPrepTasks } from "@/components/operations/jobs/use-manual-ops-prep";
import { useOpsPrepDoneIds } from "@/components/operations/jobs/use-ops-prep-done";
import { useClaims } from "@/components/providers/ClaimsProvider";
import { useFleet } from "@/components/providers/FleetProvider";
import { useInventory } from "@/components/providers/InventoryProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import { useMoves } from "@/components/moves/MovesProvider";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  computeOpsDashboardMetrics,
  opsDashboardHasUrgentAttention,
  type OpsDashboardMetrics,
} from "@/lib/dashboard/ops-metrics";
import { addDays, toDateKey } from "@/lib/calendar/date-utils";
import { formatMoveDate } from "@/lib/moves/format";
import { OPS_PREP_CATEGORY_LABELS } from "@/lib/operations/ops-prep-tasks";
import type { TruckCapacityBreakdown } from "@/lib/operations/fleet-capacity";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  Package,
  Route,
  Scale,
  Timer,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export function OpsDashboardPanel() {
  const { moves } = useMoves();
  const { claims } = useClaims();
  const { settings } = useSettings();
  const doneIds = useOpsPrepDoneIds();
  const manualTasks = useManualOpsPrepTasks();
  const { stockLines } = useInventory();
  const { getTruckCapacityBreakdownForDate, timeOffRequests } = useFleet();

  const metrics = useMemo(() => {
    const today = new Date();
    return computeOpsDashboardMetrics({
      moves,
      claims,
      manualPrepTasks: manualTasks,
      prepDoneIds: doneIds,
      opsPrepRules: settings.opsPrepRules,
      stockLines,
      fleetToday: getTruckCapacityBreakdownForDate(toDateKey(today)),
      fleetTomorrow: getTruckCapacityBreakdownForDate(toDateKey(addDays(today, 1))),
      pendingTimeOff: timeOffRequests.filter((r) => r.status === "pending").length,
      today,
    });
  }, [
    moves,
    claims,
    manualTasks,
    doneIds,
    settings.opsPrepRules,
    stockLines,
    getTruckCapacityBreakdownForDate,
    timeOffRequests,
  ]);

  const urgent = opsDashboardHasUrgentAttention(metrics);

  return (
    <div className="space-y-6">
      {urgent ? (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Items need attention today — prep due, staffing gaps, new claims, or low inventory.
            Details below.
          </p>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Jobs today"
          value={String(metrics.todayJobs.length)}
          hint={
            metrics.todayStaffing.unstaffedRows.length > 0
              ? `${metrics.todayStaffing.unstaffedRows.length} need crew or truck`
              : metrics.todayJobs.length > 0
                ? "On schedule"
                : undefined
          }
          urgent={metrics.todayStaffing.unstaffedRows.length > 0}
          href="/operations/jobs?view=today"
        />
        <SummaryCard
          label="Prep due today"
          value={String(metrics.prep.dueToday)}
          hint={
            metrics.prep.overdue > 0
              ? `${metrics.prep.overdue} overdue from earlier`
              : metrics.prep.openTotal > metrics.prep.dueToday
                ? `${metrics.prep.openTotal} open total`
                : undefined
          }
          urgent={metrics.prep.dueToday > 0 || metrics.prep.overdue > 0}
          href="/operations/jobs?view=today"
        />
        <SummaryCard
          label="Tomorrow jobs"
          value={String(metrics.tomorrowJobs.length)}
          hint={
            metrics.tomorrowStaffing.unstaffedRows.length > 0
              ? `${metrics.tomorrowStaffing.unstaffedRows.length} unstaffed`
              : metrics.tomorrowJobs.length > 0
                ? "Review dispatch"
                : undefined
          }
          urgent={metrics.tomorrowStaffing.unstaffedRows.length > 0}
          href="/operations/dispatch"
        />
        <SummaryCard
          label="Open claims"
          value={String(metrics.claims.openCount)}
          hint={
            metrics.claims.waitingVendor > 0
              ? `${metrics.claims.waitingVendor} waiting on vendor`
              : metrics.claims.newCount > 0
                ? `${metrics.claims.newCount} new`
                : undefined
          }
          urgent={metrics.claims.newCount > 0 || metrics.claims.waitingVendor > 0}
          href="/operations/claims?tab=new"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TodayJobsCard metrics={metrics} />
        <OpsPrepCard metrics={metrics} />
        <TomorrowDispatchCard metrics={metrics} />
        <ClaimsCard metrics={metrics} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FleetCard metrics={metrics} />
        <InventoryCard metrics={metrics} />
        <CrewPayrollCard metrics={metrics} />
      </div>

      <QuickLinksRow />
    </div>
  );
}

function TodayJobsCard({ metrics }: { metrics: OpsDashboardMetrics }) {
  const rows = metrics.todayJobs.slice(0, 6);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Today&apos;s job days</CardTitle>
        <SectionLink href="/operations/jobs?view=today" />
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptySection message="No booked jobs for today." />
        ) : (
          <ul className="space-y-2">
            {rows.map((row) => {
              const needsStaff =
                (row.status === "scheduled" || row.status === "in_progress") &&
                (!row.crewLine || !row.truckLine);
              return (
                <li
                  key={row.id}
                  className="flex items-start justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {row.customerName}
                    </p>
                    <p className="text-xs text-slate-600">
                      {row.dayLabel} · {row.moveType}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {row.crewLine ?? "Crew TBD"} · {row.truckLine ?? "Truck TBD"}
                    </p>
                  </div>
                  {needsStaff ? (
                    <Badge className="shrink-0 bg-amber-100 text-amber-900">Staff</Badge>
                  ) : row.status === "completed" ? (
                    <Badge className="shrink-0 bg-emerald-100 text-emerald-900">Done</Badge>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function OpsPrepCard({ metrics }: { metrics: OpsDashboardMetrics }) {
  const categories = (
    Object.entries(metrics.prep.byCategory) as Array<
      [keyof typeof OPS_PREP_CATEGORY_LABELS, number]
    >
  ).filter(([, count]) => count > 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Ops prep due today</CardTitle>
        <SectionLink href="/operations/jobs?view=today" />
      </CardHeader>
      <CardContent>
        {metrics.prep.dueToday === 0 ? (
          <EmptySection message="No prep items due today." />
        ) : (
          <div className="space-y-3">
            {categories.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {categories.map(([category, count]) => (
                  <Badge key={category} className="bg-amber-50 text-amber-900">
                    {count} {OPS_PREP_CATEGORY_LABELS[category]}
                  </Badge>
                ))}
              </div>
            ) : null}
            <ul className="space-y-1.5">
              {metrics.prep.dueTodayTasks.map((task) => (
                <li key={task.id} className="text-sm text-slate-700">
                  <span className="font-medium text-slate-900">{task.title}</span>
                  <span className="text-slate-500"> · {task.customerName}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TomorrowDispatchCard({ metrics }: { metrics: OpsDashboardMetrics }) {
  const { tomorrowStaffing, fleetTomorrow } = metrics;
  const hasGap = tomorrowStaffing.unstaffedRows.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Tomorrow dispatch</CardTitle>
        <SectionLink href="/operations/dispatch" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          className={cn(
            "rounded-lg border px-3 py-2 text-sm",
            hasGap ? "border-amber-200 bg-amber-50/80" : "border-emerald-200 bg-emerald-50/60",
          )}
        >
          <p className="font-medium text-slate-900">
            {metrics.tomorrowJobs.length} job{metrics.tomorrowJobs.length === 1 ? "" : "s"} booked
          </p>
          <p className="mt-0.5 text-xs text-slate-600">
            {tomorrowStaffing.missingCrew > 0
              ? `${tomorrowStaffing.missingCrew} missing crew · `
              : ""}
            {tomorrowStaffing.missingTruck > 0
              ? `${tomorrowStaffing.missingTruck} missing truck · `
              : ""}
            {fleetTomorrow.total} truck{fleetTomorrow.total === 1 ? "" : "s"} available
            {fleetTomorrow.outOfService > 0
              ? ` (${fleetTomorrow.outOfService} out of service)`
              : ""}
          </p>
        </div>
        {tomorrowStaffing.unstaffedRows.length > 0 ? (
          <ul className="space-y-1.5 text-sm text-slate-700">
            {tomorrowStaffing.unstaffedRows.slice(0, 4).map((row) => (
              <li key={row.id}>
                {row.customerName} — {!row.crewLine ? "crew" : "truck"} needed
              </li>
            ))}
          </ul>
        ) : metrics.tomorrowJobs.length > 0 ? (
          <p className="text-sm text-emerald-800">Staffing looks complete on job files.</p>
        ) : (
          <EmptySection message="No jobs booked for tomorrow yet." />
        )}
      </CardContent>
    </Card>
  );
}

function ClaimsCard({ metrics }: { metrics: OpsDashboardMetrics }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Claims workflow</CardTitle>
        <SectionLink href="/operations/claims" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <MiniStat label="New" value={metrics.claims.newCount} href="/operations/claims?tab=new" />
          <MiniStat
            label="In progress"
            value={metrics.claims.inProgressCount}
            href="/operations/claims?tab=in_progress"
          />
          <MiniStat
            label="Waiting vendor"
            value={metrics.claims.waitingVendor}
            href="/operations/claims?tab=waiting_vendor"
            warn={metrics.claims.waitingVendor > 0}
          />
          <MiniStat
            label="Pending"
            value={metrics.claims.pendingCount}
            href="/operations/claims?tab=pending"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function FleetCard({ metrics }: { metrics: OpsDashboardMetrics }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Fleet capacity</CardTitle>
        <SectionLink href="/operations/fleet" />
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <CapacityLine label="Today" breakdown={metrics.fleetToday} dateKey={metrics.todayKey} />
        <CapacityLine
          label="Tomorrow"
          breakdown={metrics.fleetTomorrow}
          dateKey={metrics.tomorrowKey}
        />
      </CardContent>
    </Card>
  );
}

function InventoryCard({ metrics }: { metrics: OpsDashboardMetrics }) {
  const { lowStockCount, lowStockLabels } = metrics.inventory;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Inventory</CardTitle>
        <SectionLink href="/operations/inventory" />
      </CardHeader>
      <CardContent>
        {lowStockCount === 0 ? (
          <p className="text-sm text-emerald-800">All stock levels above reorder points.</p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium text-amber-900">
              {lowStockCount} item{lowStockCount === 1 ? "" : "s"} at or below reorder
            </p>
            <p className="text-xs text-slate-600">{lowStockLabels.join(" · ")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CrewPayrollCard({ metrics }: { metrics: OpsDashboardMetrics }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Crew & time</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="text-slate-600">Time-off requests pending</span>
          <Link
            href="/operations/crew?tab=time-off"
            className={cn(
              "font-semibold tabular-nums",
              metrics.pendingTimeOff > 0 ? "text-amber-800" : "text-slate-900",
            )}
          >
            {metrics.pendingTimeOff}
          </Link>
        </div>
        <Link
          href="/operations/payroll"
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <Timer className="h-3.5 w-3.5" />
          Payroll & time approval
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href="/operations/crew"
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <Users className="h-3.5 w-3.5" />
          Crew roster & availability
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}

function QuickLinksRow() {
  const links = [
    { href: "/operations/jobs", label: "Jobs", icon: ClipboardList },
    { href: "/operations/dispatch", label: "Dispatch", icon: Route },
    { href: "/operations/claims", label: "Claims", icon: Scale },
    { href: "/operations/fleet", label: "Fleet", icon: Truck },
    { href: "/operations/inventory", label: "Inventory", icon: Package },
    { href: "/operations/reports?tab=operations", label: "Ops reports", icon: ClipboardList },
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
  urgent,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  urgent?: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-xl border bg-white px-4 py-3 shadow-sm transition-colors hover:border-brand-200 hover:bg-brand-50/40",
        urgent ? "border-amber-200" : "border-slate-200",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
      {hint ? (
        <p className={cn("mt-0.5 text-xs", urgent ? "text-amber-800" : "text-slate-500")}>{hint}</p>
      ) : null}
    </Link>
  );
}

function MiniStat({
  label,
  value,
  href,
  warn,
}: {
  label: string;
  value: number;
  href: string;
  warn?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-lg border px-3 py-2 transition-colors hover:bg-slate-50",
        warn ? "border-amber-200 bg-amber-50/50" : "border-slate-100 bg-slate-50/40",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-lg font-semibold tabular-nums text-slate-900">{value}</p>
    </Link>
  );
}

function CapacityLine({
  label,
  breakdown,
  dateKey,
}: {
  label: string;
  breakdown: TruckCapacityBreakdown;
  dateKey: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <span className="font-medium text-slate-800">
        {label}{" "}
        <span className="text-xs font-normal text-slate-500">({formatMoveDate(dateKey, { omitYear: true })})</span>
      </span>
      <span className="tabular-nums text-slate-700">
        {breakdown.total} available
        {breakdown.rentals > 0 ? ` · ${breakdown.rentals} rental` : ""}
        {breakdown.outOfService > 0 ? ` · ${breakdown.outOfService} OOS` : ""}
      </span>
    </div>
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

function EmptySection({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-3 py-6 text-center text-sm text-slate-500">
      {message}
    </p>
  );
}
