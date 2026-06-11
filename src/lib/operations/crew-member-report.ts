import type { CrewRole } from "@/lib/dispatch/types";
import {
  countDriverViolations,
  type DriverViolationId,
} from "./driver-violations";
import {
  averageSkipperRating,
  isDriver,
  isSkipper,
} from "./crew-records";
import type {
  CrewIssue,
  CrewIssueKind,
  CrewIssueSubject,
  CrewRecordsStore,
  DriverReview,
  SkipperRating,
} from "./crew-records-types";
import {
  countSkipperCallbacks,
  countSkipperViolations,
  hasThreeViolationsFlag,
  SKIPPER_CALLBACK_VIOLATION_ID,
  type SkipperViolationId,
} from "./skipper-violations";
import type { FleetCrewMember } from "./fleet-types";

export type ReportPeriodDays = 30 | 90 | null;

export type MonthlyIssueBucket = {
  monthKey: string;
  label: string;
  attendance: number;
  seatBelt: number;
  uniforms: number;
  policy: number;
  customerComplaint: number;
  workRule: number;
  callback: number;
};

export type CrewMemberMeetingReport = {
  crewId: string;
  name: string;
  roles: CrewRole[];
  periodDays: ReportPeriodDays;
  issues: CrewIssue[];
  issuesByKind: Record<CrewIssueKind, number>;
  issuesBySubject: Record<CrewIssueSubject, number>;
  openIssues: number;
  attendanceCount: number;
  skipperReviews: SkipperRating[];
  skipperViolationCounts: Record<SkipperViolationId, number>;
  avgSkipperRating: number | null;
  threePlusSkipperJobs: number;
  driverReviews: DriverReview[];
  driverViolationCounts: Record<DriverViolationId, number>;
  threePlusDriverEvents: number;
  monthlyIssues: MonthlyIssueBucket[];
};

function isWithinDays(dateKey: string, days: number, today: Date): boolean {
  const d = new Date(`${dateKey}T12:00:00`);
  const start = new Date(today);
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  return d >= start;
}

function filterByPeriod<T extends { date: string }>(
  rows: T[],
  periodDays: ReportPeriodDays,
  today: Date,
): T[] {
  if (periodDays == null) return rows;
  return rows.filter((r) => isWithinDays(r.date, periodDays, today));
}

function monthKey(dateKey: string): string {
  return dateKey.slice(0, 7);
}

function monthLabel(monthKeyValue: string): string {
  const [year, month] = monthKeyValue.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

function buildMonthlyIssues(
  issues: CrewIssue[],
  skipperReviews: SkipperRating[],
  today: Date,
): MonthlyIssueBucket[] {
  const keys: string[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  return keys.map((key) => {
    const inMonth = issues.filter((issue) => monthKey(issue.date) === key);
    const reviewsInMonth = skipperReviews.filter((r) => monthKey(r.date) === key);
    return {
      monthKey: key,
      label: monthLabel(key),
      attendance: inMonth.filter((i) => i.subject === "attendance").length,
      seatBelt: inMonth.filter((i) => i.subject === "seat_belt").length,
      uniforms: inMonth.filter((i) => i.subject === "uniforms").length,
      policy: inMonth.filter((i) => i.subject === "policy").length,
      customerComplaint: inMonth.filter((i) => i.subject === "customer_complaint").length,
      workRule: inMonth.filter((i) => i.subject === "work_rule").length,
      callback: reviewsInMonth.filter((r) =>
        (r.violations ?? []).includes(SKIPPER_CALLBACK_VIOLATION_ID),
      ).length,
    };
  });
}

function emptyIssuesByKind(): Record<CrewIssueKind, number> {
  return { mistake: 0, failure: 0, violation: 0 };
}

function emptyIssuesBySubject(): Record<CrewIssueSubject, number> {
  return {
    uniforms: 0,
    attendance: 0,
    seat_belt: 0,
    policy: 0,
    customer_complaint: 0,
    work_rule: 0,
  };
}

export function buildCrewMemberMeetingReport(
  member: FleetCrewMember,
  records: CrewRecordsStore,
  periodDays: ReportPeriodDays = 90,
  today: Date = new Date(),
): CrewMemberMeetingReport {
  const memberIssues = records.issues.filter((i) => i.crewId === member.id);
  const issues = filterByPeriod(memberIssues, periodDays, today);

  const issuesByKind = emptyIssuesByKind();
  const issuesBySubject = emptyIssuesBySubject();
  for (const issue of issues) {
    issuesByKind[issue.kind] += 1;
    issuesBySubject[issue.subject] += 1;
  }

  const skipperReviews = filterByPeriod(
    records.skipperRatings.filter((r) => r.skipperId === member.id),
    periodDays,
    today,
  );

  const driverReviews = filterByPeriod(
    (records.driverReviews ?? []).filter((r) => r.driverId === member.id),
    periodDays,
    today,
  );

  return {
    crewId: member.id,
    name: member.name,
    roles: member.roles,
    periodDays,
    issues,
    issuesByKind,
    issuesBySubject,
    openIssues: memberIssues.filter((i) => i.status !== "resolved").length,
    attendanceCount: issuesBySubject.attendance,
    skipperReviews,
    skipperViolationCounts: countSkipperViolations(skipperReviews),
    avgSkipperRating: averageSkipperRating(skipperReviews),
    threePlusSkipperJobs: skipperReviews.filter((r) =>
      hasThreeViolationsFlag(r.violations ?? []),
    ).length,
    driverReviews,
    driverViolationCounts: countDriverViolations(driverReviews),
    threePlusDriverEvents: driverReviews.filter((r) =>
      (r.violations?.length ?? 0) >= 3,
    ).length,
    monthlyIssues: buildMonthlyIssues(memberIssues, skipperReviews, today),
  };
}

export function meetingReportRoleLabel(
  member: Pick<FleetCrewMember, "roles">,
  terms: { skipper: string; driver: string; mover: string },
): string {
  const parts: string[] = [];
  if (isSkipper(member)) parts.push(terms.skipper);
  if (isDriver(member)) parts.push(terms.driver);
  if (member.roles.includes("mover")) parts.push(terms.mover);
  return parts.join(" · ") || "Crew";
}
