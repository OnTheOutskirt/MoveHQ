import {
  CREW_ISSUE_KIND_LABELS,
  CREW_ISSUE_STATUS_LABELS,
  CREW_ISSUE_SUBJECT_LABELS,
  averageDriverRating,
  averageSkipperRating,
} from "@/lib/operations/crew-records";
import type {
  CrewIssue,
  CrewRecordsStore,
  DriverReview,
  SkipperRating,
} from "@/lib/operations/crew-records-types";
import { countSkipperCallbacks } from "@/lib/operations/skipper-violations";
import type { CrewAppRole } from "./types";
import type { CrewAppIssueSummary } from "./types";

export function issuesForCrewMember(issues: CrewIssue[], crewId: string): CrewIssue[] {
  return issues
    .filter((i) => i.crewId === crewId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function summarizeIssues(issues: CrewIssue[]): CrewAppIssueSummary[] {
  return issues.map((i) => ({
    id: i.id,
    kind: i.kind,
    subject: i.subject,
    date: i.date,
    description: i.description,
    status: i.status,
    statusLabel: CREW_ISSUE_STATUS_LABELS[i.status],
  }));
}

export function openIssueCount(issues: CrewIssue[]): number {
  return issues.filter((i) => i.status === "open" || i.status === "under_review").length;
}

export function issueKindLabel(kind: CrewIssue["kind"]): string {
  return CREW_ISSUE_KIND_LABELS[kind];
}

export function issueSubjectLabel(subject: CrewIssue["subject"]): string {
  return CREW_ISSUE_SUBJECT_LABELS[subject];
}

function isWithinDays(dateKey: string, days: number, today: Date): boolean {
  const d = new Date(`${dateKey}T12:00:00`);
  const start = new Date(today);
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  return d >= start;
}

export type CrewAppMemberStats = {
  issues: CrewIssue[];
  issueSummaries: CrewAppIssueSummary[];
  openIssues: number;
  totalIssues: number;
  issues30d: number;
  attendance30d: number;
  seatBelt30d: number;
  customerComplaints30d: number;
  openCustomerComplaints: number;
  skipperRatings: SkipperRating[];
  avgSkipperRating: number | null;
  skipperCallbacks30d: number;
  driverReviews: DriverReview[];
  avgDriverRating: number | null;
};

export function buildCrewMemberStats(
  crewId: string,
  records: CrewRecordsStore,
  today: Date = new Date(),
): CrewAppMemberStats {
  const issues = issuesForCrewMember(records.issues, crewId);
  const recentIssues = issues.filter((i) => isWithinDays(i.date, 30, today));
  const skipperRatings = records.skipperRatings
    .filter((r) => r.skipperId === crewId)
    .sort((a, b) => b.date.localeCompare(a.date));
  const driverReviews = records.driverReviews
    .filter((r) => r.driverId === crewId)
    .sort((a, b) => b.date.localeCompare(a.date));

  return {
    issues,
    issueSummaries: summarizeIssues(issues),
    openIssues: openIssueCount(issues),
    totalIssues: issues.length,
    issues30d: recentIssues.length,
    attendance30d: recentIssues.filter((i) => i.subject === "attendance").length,
    seatBelt30d: recentIssues.filter((i) => i.subject === "seat_belt").length,
    customerComplaints30d: recentIssues.filter((i) => i.subject === "customer_complaint").length,
    openCustomerComplaints: issues.filter(
      (i) => i.subject === "customer_complaint" && i.status !== "resolved",
    ).length,
    skipperRatings,
    avgSkipperRating: averageSkipperRating(skipperRatings),
    skipperCallbacks30d: countSkipperCallbacks(skipperRatings, 30, today),
    driverReviews,
    avgDriverRating: averageDriverRating(driverReviews),
  };
}

export function showSkipperPerformance(appRoles: CrewAppRole[]): boolean {
  return appRoles.includes("skipper");
}

export function showDriverPerformance(appRoles: CrewAppRole[]): boolean {
  return appRoles.includes("driver");
}
