"use client";

import { RelatedMoveCell } from "@/components/operations/crew/RelatedMoveCell";
import { SkipperViolationsSummary } from "@/components/operations/crew/SkipperViolationsSummary";
import { useCrewRecords } from "@/components/providers/CrewRecordsProvider";
import { useFleet } from "@/components/providers/FleetProvider";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { GroupedMonthlyBarChart, SimpleBarChart } from "@/components/ui/SimpleBarChart";
import {
  buildCrewMemberMeetingReport,
  meetingReportRoleLabel,
  type ReportPeriodDays,
} from "@/lib/operations/crew-member-report";
import {
  CREW_ISSUE_KIND_LABELS,
  CREW_ISSUE_STATUS_LABELS,
  CREW_ISSUE_SUBJECT_LABELS,
  issueKindBadgeVariant,
  isDriver,
  isSkipper,
} from "@/lib/operations/crew-records";
import type { CrewIssue, DriverReview, SkipperRating } from "@/lib/operations/crew-records-types";
import {
  DRIVER_VIOLATION_IDS,
  DRIVER_VIOLATION_LABELS,
  formatDriverViolationList,
  hasThreeDriverViolationsFlag,
} from "@/lib/operations/driver-violations";
import {
  hasThreeViolationsFlag,
  SKIPPER_VIOLATION_IDS,
  SKIPPER_VIOLATION_LABELS,
} from "@/lib/operations/skipper-violations";
import { formatViolationRating, violationRatingTextClass } from "@/lib/operations/violation-rating";
import { cn } from "@/lib/utils";
import { useTerminology } from "@/lib/terminology/use-terminology";
import { useMemo, useState } from "react";

const PERIODS: { id: ReportPeriodDays; label: string }[] = [
  { id: 30, label: "Last 30 days" },
  { id: 90, label: "Last 90 days" },
  { id: null, label: "All time" },
];

function periodLabel(days: ReportPeriodDays): string {
  return PERIODS.find((p) => p.id === days)?.label ?? "Selected period";
}

function ReportStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-white px-4 py-3",
        highlight ? "border-amber-200 bg-amber-50/50" : "border-slate-200",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}

export function CrewMeetingReportPanel() {
  const { crew } = useFleet();
  const { label, plural } = useTerminology();
  const { issues, skipperRatings, driverReviews } = useCrewRecords();
  const activeCrew = useMemo(() => crew.filter((c) => c.active), [crew]);
  const [crewId, setCrewId] = useState(activeCrew[0]?.id ?? "");
  const [periodDays, setPeriodDays] = useState<ReportPeriodDays>(90);

  const member = activeCrew.find((c) => c.id === crewId);

  const report = useMemo(() => {
    if (!member) return null;
    return buildCrewMemberMeetingReport(
      member,
      { issues, skipperRatings, driverReviews },
      periodDays,
    );
  }, [member, issues, skipperRatings, driverReviews, periodDays]);

  const issueColumns = useMemo<Column<CrewIssue>[]>(
    () => [
      { key: "date", header: "Date", cell: (row) => row.date },
      {
        key: "kind",
        header: "Type",
        cell: (row) => (
          <Badge variant={issueKindBadgeVariant(row.kind)}>{CREW_ISSUE_KIND_LABELS[row.kind]}</Badge>
        ),
      },
      {
        key: "subject",
        header: "Subject",
        cell: (row) => CREW_ISSUE_SUBJECT_LABELS[row.subject],
      },
      {
        key: "description",
        header: "Description",
        cell: (row) => (
          <p className="line-clamp-2 min-w-0 text-sm text-slate-800">{row.description}</p>
        ),
      },
      {
        key: "move",
        header: "Related move",
        cell: (row) => <RelatedMoveCell moveId={row.moveId} jobRef={row.jobRef} />,
      },
      {
        key: "status",
        header: "Status",
        cell: (row) => CREW_ISSUE_STATUS_LABELS[row.status],
      },
    ],
    [],
  );

  const skipperReviewColumns = useMemo<Column<SkipperRating>[]>(
    () => [
      { key: "date", header: "Date", cell: (row) => row.date },
      {
        key: "violations",
        header: "Violations",
        cell: (row) => (
          <SkipperViolationsSummary
            violations={row.violations ?? []}
            callbackNote={row.callbackNote}
            otherNote={row.otherNote}
          />
        ),
      },
      {
        key: "rating",
        header: "Score",
        cell: (row) => (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={cn("tabular-nums font-semibold", violationRatingTextClass(row.rating))}>
              {formatViolationRating(row.rating)}
            </span>
            {hasThreeViolationsFlag(row.violations ?? []) ? (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-800">
                3+ violations
              </span>
            ) : null}
          </div>
        ),
      },
      { key: "move", header: "Related move", cell: (row) => <RelatedMoveCell moveId={row.moveId} jobRef={row.jobRef} /> },
    ],
    [],
  );

  const driverReviewColumns = useMemo<Column<DriverReview>[]>(
    () => [
      { key: "date", header: "Date", cell: (row) => row.date },
      {
        key: "violations",
        header: "Violations",
        cell: (row) => {
          const count = row.violations?.length ?? 0;
          if (count === 0) return null;
          return formatDriverViolationList(row.violations ?? []);
        },
      },
      {
        key: "rating",
        header: "Score",
        cell: (row) => (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={cn("tabular-nums font-semibold", violationRatingTextClass(row.rating))}>
              {formatViolationRating(row.rating)}
            </span>
            {hasThreeDriverViolationsFlag(row.violations ?? []) ? (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-800">
                3+ violations
              </span>
            ) : null}
          </div>
        ),
      },
      { key: "move", header: "Related move", cell: (row) => <RelatedMoveCell moveId={row.moveId} jobRef={row.jobRef} /> },
    ],
    [],
  );

  const monthlyChart = useMemo(() => {
    if (!report) return [];
    return report.monthlyIssues.map((bucket) => ({
      label: bucket.label.replace(/\s\d{4}$/, ""),
      segments: [
        { label: "Attendance", value: bucket.attendance },
        { label: "Seat belt", value: bucket.seatBelt },
        { label: "Customer", value: bucket.customerComplaint },
        { label: "Work rule", value: bucket.workRule },
        { label: "Uniforms", value: bucket.uniforms },
        { label: "Policy", value: bucket.policy },
        { label: "Callbacks", value: bucket.callback },
      ],
    }));
  }, [report]);

  if (activeCrew.length === 0) {
    return (
      <p className="text-sm text-slate-500">No active crew on the roster to build a meeting report.</p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate-600">
            Pull one person&apos;s full record for skipper meetings, driver reviews, or mover
            attendance check-ins.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-medium text-slate-500">
            Crew member
            <select
              value={crewId}
              onChange={(e) => setCrewId(e.target.value)}
              className="ml-2 max-w-[14rem] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800"
            >
              {activeCrew.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-slate-500">
            Period
            <select
              value={periodDays === null ? "all" : String(periodDays)}
              onChange={(e) => {
                const v = e.target.value;
                setPeriodDays(v === "all" ? null : (Number(v) as ReportPeriodDays));
              }}
              className="ml-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800"
            >
              {PERIODS.map((p) => (
                <option key={String(p.id)} value={p.id === null ? "all" : String(p.id)}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {member && report ? (
        <>
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">{member.name}</h2>
              <span className="text-sm text-slate-500">
                {meetingReportRoleLabel(member, {
                  skipper: label("skipper"),
                  driver: label("driver"),
                  mover: label("mover"),
                })}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">{periodLabel(periodDays)}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ReportStat label="Open issues" value={String(report.openIssues)} highlight={report.openIssues > 0} />
            <ReportStat label="Attendance" value={String(report.attendanceCount)} />
            <ReportStat
              label="Customer complaints"
              value={String(report.issuesBySubject.customer_complaint)}
              highlight={report.issuesBySubject.customer_complaint > 0}
            />
            <ReportStat label="Callbacks (skipper)" value={String(report.monthlyIssues.reduce((s, b) => s + b.callback, 0))} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Issues by type">
              <SimpleBarChart
                items={[
                  { label: "Mistake", value: report.issuesByKind.mistake, barClassName: "bg-slate-500" },
                  { label: "Failure", value: report.issuesByKind.failure, barClassName: "bg-amber-500" },
                  { label: "Violation", value: report.issuesByKind.violation, barClassName: "bg-red-500" },
                ]}
              />
            </ChartCard>

            <ChartCard title="Issues over time (6 months)">
              <GroupedMonthlyBarChart groups={monthlyChart} />
            </ChartCard>
          </div>

          {isSkipper(member) ? (
            <section className="space-y-3">
              <SectionHeader
                title={`${label("skipper")} job reviews`}
                subtitle={`${report.skipperReviews.length} review${report.skipperReviews.length === 1 ? "" : "s"} in period`}
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <ReportStat
                  label="Avg score"
                  value={
                    report.avgSkipperRating != null
                      ? formatViolationRating(report.avgSkipperRating)
                      : "—"
                  }
                />
                <ReportStat
                  label="Total violations"
                  value={String(
                    Object.values(report.skipperViolationCounts).reduce((sum, n) => sum + n, 0),
                  )}
                />
                <ReportStat
                  label="3+ violation jobs"
                  value={String(report.threePlusSkipperJobs)}
                  highlight={report.threePlusSkipperJobs > 0}
                />
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <ChartCard title="Skipper violations breakdown">
                  <SimpleBarChart
                    items={SKIPPER_VIOLATION_IDS.map((id) => ({
                      label: SKIPPER_VIOLATION_LABELS[id],
                      value: report.skipperViolationCounts[id],
                    }))}
                    emptyMessage="No skipper violations in this period."
                  />
                </ChartCard>
                <div className="rounded-xl border border-slate-200 bg-white">
                  <DataTable
                    columns={skipperReviewColumns}
                    data={report.skipperReviews}
                    emptyMessage={`No ${label("skipper").toLowerCase()} job reviews in this period.`}
                    getRowKey={(row) => row.id}
                  />
                </div>
              </div>
            </section>
          ) : null}

          {isDriver(member) ? (
            <section className="space-y-3">
              <SectionHeader
                title={`${label("driver")} telematics reviews`}
                subtitle={`${report.driverReviews.length} event${report.driverReviews.length === 1 ? "" : "s"} in period`}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <ReportStat
                  label="Total violations"
                  value={String(
                    Object.values(report.driverViolationCounts).reduce((sum, n) => sum + n, 0),
                  )}
                />
                <ReportStat
                  label="3+ violation events"
                  value={String(report.threePlusDriverEvents)}
                  highlight={report.threePlusDriverEvents > 0}
                />
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <ChartCard title="Driver violations breakdown">
                  <SimpleBarChart
                    items={DRIVER_VIOLATION_IDS.map((id) => ({
                      label: DRIVER_VIOLATION_LABELS[id],
                      value: report.driverViolationCounts[id],
                    }))}
                    emptyMessage="No driver violations in this period."
                  />
                </ChartCard>
                <div className="rounded-xl border border-slate-200 bg-white">
                  <DataTable
                    columns={driverReviewColumns}
                    data={report.driverReviews}
                    emptyMessage={`No ${label("driver").toLowerCase()} reviews in this period.`}
                    getRowKey={(row) => row.id}
                  />
                </div>
              </div>
            </section>
          ) : null}

          {!isSkipper(member) && !isDriver(member) ? (
            <section className="space-y-3">
              <SectionHeader
                title="Attendance"
                subtitle="Attendance subject issues for movers"
              />
              <div className="rounded-xl border border-slate-200 bg-white">
                <DataTable
                  columns={issueColumns}
                  data={report.issues.filter((i) => i.subject === "attendance")}
                  emptyMessage="No attendance issues in this period."
                  getRowKey={(row) => row.id}
                />
              </div>
            </section>
          ) : null}

          <section className="space-y-3">
            <SectionHeader title="All issues" subtitle="Full issue log for this period" />
            <div className="rounded-xl border border-slate-200 bg-white">
              <DataTable
                columns={issueColumns}
                data={report.issues}
                emptyMessage="No issues in this period."
                getRowKey={(row) => row.id}
              />
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}
