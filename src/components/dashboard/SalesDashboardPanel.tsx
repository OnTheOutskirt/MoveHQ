"use client";

import { useMoves } from "@/components/moves/MovesProvider";
import { useSession } from "@/components/providers/SessionProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import { TabBar } from "@/components/shared/TabBar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  computeSalesDashboardMetrics,
  salesDashboardHasUrgentAttention,
  salesRepsFromMoves,
  type SalesDashboardMetrics,
  type SalesRepFilter,
} from "@/lib/dashboard/sales-metrics";
import { pipelineStageLabel } from "@/lib/moves/move-pipeline";
import { formatMoveDate } from "@/lib/moves/format";
import { ROUTES, salesMovePath } from "@/lib/navigation/routes";
import { formatMoney } from "@/lib/settings/document-valuation";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  Footprints,
  Globe,
  ListChecks,
  Package,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type SalesScopeTab = "me" | "overall";

const SELECT_CLASS =
  "h-9 shrink-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

export function SalesDashboardPanel() {
  const { user } = useSession();
  const { moves } = useMoves();
  const { settings } = useSettings();

  const canManageTeam = user.followUpScope === "all";
  const reps = useMemo(() => salesRepsFromMoves(moves), [moves]);

  const [scopeTab, setScopeTab] = useState<SalesScopeTab>("me");
  const [teamRepFilter, setTeamRepFilter] = useState<SalesRepFilter>("all");

  const repFilter: SalesRepFilter = useMemo(() => {
    if (scopeTab === "me") return user.assignedRep;
    if (canManageTeam && teamRepFilter !== "all") return teamRepFilter;
    return "all";
  }, [scopeTab, user.assignedRep, canManageTeam, teamRepFilter]);

  const includeLeaderboard =
    scopeTab === "overall" && canManageTeam && teamRepFilter === "all";

  const metrics = useMemo(
    () =>
      computeSalesDashboardMetrics({
        moves,
        repFilter,
        includeLeaderboard,
        weekStartsOn: settings.company.weekStartsOn,
      }),
    [moves, repFilter, includeLeaderboard, settings.company.weekStartsOn],
  );

  const urgent = salesDashboardHasUrgentAttention(metrics);

  const scopeDescription = useMemo(() => {
    if (scopeTab === "me") return `Your pipeline and follow-ups — ${user.name}`;
    if (teamRepFilter !== "all" && canManageTeam) {
      return `${teamRepFilter}'s sales metrics`;
    }
    return "Team-wide pipeline, bookings, and follow-ups";
  }, [scopeTab, user.name, teamRepFilter, canManageTeam]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <TabBar
            tabs={[
              { id: "me", label: "My sales" },
              { id: "overall", label: "All sales" },
            ]}
            activeTab={scopeTab}
            onChange={setScopeTab}
          />
          <p className="mt-2 text-sm text-slate-600">{scopeDescription}</p>
        </div>

        {canManageTeam && scopeTab === "overall" ? (
          <label className="flex shrink-0 flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Salesperson</span>
            <select
              value={teamRepFilter}
              onChange={(e) => setTeamRepFilter(e.target.value)}
              aria-label="Filter by salesperson"
              className={SELECT_CLASS}
            >
              <option value="all">All team</option>
              {reps.map((rep) => (
                <option key={rep} value={rep}>
                  {rep}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {urgent ? (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Items need attention — overdue follow-ups, web bookings to review, or walkthroughs to
            schedule.
          </p>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Follow-ups due"
          value={String(metrics.followUps.total)}
          hint={
            metrics.followUps.overdue > 0
              ? `${metrics.followUps.overdue} overdue`
              : metrics.followUps.today > 0
                ? `${metrics.followUps.today} due today`
                : undefined
          }
          urgent={metrics.followUps.overdue > 0}
          href={ROUTES.salesFollowUps}
        />
        <SummaryCard
          label="Open pipeline"
          value={String(metrics.pipeline.openCount)}
          hint={
            metrics.pipeline.totalQuoteValue > 0
              ? formatMoney(metrics.pipeline.totalQuoteValue)
              : undefined
          }
          href={ROUTES.salesMoves}
        />
        <SummaryCard
          label="Web quote queue"
          value={String(metrics.webQuotes.total)}
          hint={
            metrics.webQuotes.booked_review > 0
              ? `${metrics.webQuotes.booked_review} need booking review`
              : metrics.webQuotes.incomplete > 0
                ? `${metrics.webQuotes.incomplete} incomplete`
                : undefined
          }
          urgent={metrics.webQuotes.booked_review > 0}
          href={ROUTES.salesWebQuotes}
        />
        <SummaryCard
          label="Booked this month"
          value={String(metrics.bookings.thisMonth)}
          hint={
            metrics.bookings.monthRevenue > 0
              ? formatMoney(metrics.bookings.monthRevenue)
              : metrics.bookings.thisWeek > 0
                ? `${metrics.bookings.thisWeek} this week`
                : undefined
          }
          href={ROUTES.salesMoves}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FollowUpsCard metrics={metrics} />
        <PipelineCard metrics={metrics} />
        <WebQuotesCard metrics={metrics} />
        <WalkthroughsCard metrics={metrics} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BookingsCard metrics={metrics} />
        <LostReasonsCard metrics={metrics} />
      </div>

      {metrics.leaderboard && metrics.leaderboard.length > 0 ? (
        <LeaderboardCard metrics={metrics} />
      ) : null}

      <QuickLinksRow />
    </div>
  );
}

function FollowUpsCard({ metrics }: { metrics: SalesDashboardMetrics }) {
  const rows = [
    { label: "Overdue", count: metrics.followUps.overdue, urgent: true },
    { label: "Due today", count: metrics.followUps.today, urgent: false },
    { label: "Upcoming", count: metrics.followUps.upcoming, urgent: false },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Follow-ups</CardTitle>
        <SectionLink href={ROUTES.salesFollowUps} />
      </CardHeader>
      <CardContent>
        {metrics.followUps.total === 0 ? (
          <EmptySection message="No open follow-ups in this view." />
        ) : (
          <ul className="space-y-2">
            {rows.map(({ label, count, urgent }) =>
              count > 0 ? (
                <li
                  key={label}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2"
                >
                  <span className="text-sm text-slate-700">{label}</span>
                  <Badge className={urgent ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-700"}>
                    {count}
                  </Badge>
                </li>
              ) : null,
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function PipelineCard({ metrics }: { metrics: SalesDashboardMetrics }) {
  const stages = Object.entries(metrics.pipeline.byStage).filter(([, count]) => count > 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Pipeline by stage</CardTitle>
        <SectionLink href={ROUTES.salesMoves} />
      </CardHeader>
      <CardContent>
        {metrics.pipeline.openCount === 0 ? (
          <EmptySection message="No open pipeline moves in this view." />
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              {metrics.pipeline.openCount} open ·{" "}
              {metrics.pipeline.totalQuoteValue > 0
                ? formatMoney(metrics.pipeline.totalQuoteValue)
                : "No quoted value yet"}
            </p>
            <ul className="space-y-1.5">
              {stages.map(([stage, count]) => (
                <li
                  key={stage}
                  className="flex items-center justify-between text-sm text-slate-700"
                >
                  <span>{pipelineStageLabel(stage)}</span>
                  <span className="font-medium tabular-nums text-slate-900">{count}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function WebQuotesCard({ metrics }: { metrics: SalesDashboardMetrics }) {
  const rows = [
    {
      label: "Incomplete intakes",
      count: metrics.webQuotes.incomplete,
      href: `${ROUTES.salesWebQuotes}?queue=incomplete`,
    },
    {
      label: "Quoted, not booked",
      count: metrics.webQuotes.quoted,
      href: `${ROUTES.salesWebQuotes}?queue=quoted`,
    },
    {
      label: "Booking review",
      count: metrics.webQuotes.booked_review,
      href: `${ROUTES.salesWebQuotes}?queue=booked_review`,
      urgent: true,
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">AI web quotes</CardTitle>
        <SectionLink href={ROUTES.salesWebQuotes} />
      </CardHeader>
      <CardContent>
        {metrics.webQuotes.total === 0 ? (
          <EmptySection message="No web quote queue items in this view." />
        ) : (
          <ul className="space-y-2">
            {rows.map(({ label, count, href, urgent }) =>
              count > 0 ? (
                <li key={label}>
                  <Link
                    href={href}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 hover:border-brand-200 hover:bg-brand-50/40"
                  >
                    <span className="text-sm text-slate-700">{label}</span>
                    <Badge
                      className={
                        urgent ? "bg-violet-100 text-violet-900" : "bg-slate-100 text-slate-700"
                      }
                    >
                      {count}
                    </Badge>
                  </Link>
                </li>
              ) : null,
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function WalkthroughsCard({ metrics }: { metrics: SalesDashboardMetrics }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Walkthroughs</CardTitle>
        <SectionLink href={ROUTES.salesWalkthroughs} />
      </CardHeader>
      <CardContent>
        {metrics.walkthroughs.total === 0 ? (
          <EmptySection message="No walkthrough pipeline items in this view." />
        ) : (
          <ul className="space-y-2">
            {metrics.walkthroughs.needsScheduling > 0 ? (
              <li className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2">
                <span className="text-sm text-amber-900">Needs scheduling</span>
                <Badge className="bg-amber-100 text-amber-900">
                  {metrics.walkthroughs.needsScheduling}
                </Badge>
              </li>
            ) : null}
            {metrics.walkthroughs.scheduled > 0 ? (
              <li className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
                <span className="text-sm text-slate-700">Scheduled</span>
                <Badge className="bg-violet-100 text-violet-900">
                  {metrics.walkthroughs.scheduled}
                </Badge>
              </li>
            ) : null}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function BookingsCard({ metrics }: { metrics: SalesDashboardMetrics }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Bookings</CardTitle>
        <SectionLink href={ROUTES.salesMoves} />
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          <MiniStat label="This week" value={String(metrics.bookings.thisWeek)} />
          <MiniStat label="This month" value={String(metrics.bookings.thisMonth)} />
          <MiniStat
            label="Week revenue"
            value={
              metrics.bookings.weekRevenue > 0
                ? formatMoney(metrics.bookings.weekRevenue)
                : "—"
            }
          />
          <MiniStat
            label="Month revenue"
            value={
              metrics.bookings.monthRevenue > 0
                ? formatMoney(metrics.bookings.monthRevenue)
                : "—"
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

function LostReasonsCard({ metrics }: { metrics: SalesDashboardMetrics }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Recent lost (30 days)</CardTitle>
        <SectionLink href={ROUTES.salesMoves} />
      </CardHeader>
      <CardContent>
        {metrics.lostRecent.count30Days === 0 ? (
          <EmptySection message="No lost moves in the last 30 days for this view." />
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">{metrics.lostRecent.count30Days} lost moves</p>
            <ul className="space-y-2">
              {metrics.lostRecent.samples.map((row) => (
                <li
                  key={row.id}
                  className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2"
                >
                  <Link
                    href={salesMovePath(row.id)}
                    className="text-sm font-medium text-slate-900 hover:text-brand-700"
                  >
                    {row.customerName}
                  </Link>
                  <p className="mt-0.5 text-xs text-slate-600">
                    {row.lostReason ?? "No reason recorded"}
                    {row.lostAt ? ` · ${formatMoveDate(row.lostAt.slice(0, 10))}` : null}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LeaderboardCard({ metrics }: { metrics: SalesDashboardMetrics }) {
  const rows = metrics.leaderboard ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Team leaderboard (this month)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="pb-2 pr-3">Rep</th>
                <th className="pb-2 pr-3 text-right">Booked</th>
                <th className="pb-2 pr-3 text-right">Revenue</th>
                <th className="pb-2 pr-3 text-right">Pipeline</th>
                <th className="pb-2 text-right">Overdue F/U</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.rep} className="border-b border-slate-50 last:border-0">
                  <td className="py-2 pr-3 font-medium text-slate-900">{row.rep}</td>
                  <td className="py-2 pr-3 text-right tabular-nums text-slate-700">
                    {row.bookedThisMonth}
                  </td>
                  <td className="py-2 pr-3 text-right tabular-nums text-slate-700">
                    {row.bookedRevenueMonth > 0 ? formatMoney(row.bookedRevenueMonth) : "—"}
                  </td>
                  <td className="py-2 pr-3 text-right tabular-nums text-slate-700">
                    {row.openPipeline}
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {row.followUpsOverdue > 0 ? (
                      <span className="font-medium text-red-700">{row.followUpsOverdue}</span>
                    ) : (
                      "0"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickLinksRow() {
  const links = [
    { href: ROUTES.salesMoves, label: "Moves", icon: Package },
    { href: ROUTES.salesFollowUps, label: "Follow-ups", icon: ListChecks },
    { href: ROUTES.salesWebQuotes, label: "Web quotes", icon: Globe },
    { href: ROUTES.salesWalkthroughs, label: "Walkthroughs", icon: Footprints },
    { href: ROUTES.salesDirectory, label: "Directory", icon: Users },
    { href: ROUTES.salesDocuments, label: "Documents", icon: TrendingUp },
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums text-slate-900">{value}</p>
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
  return <p className="text-sm text-slate-500">{message}</p>;
}
