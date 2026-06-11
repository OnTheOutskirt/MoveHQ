import type { FleetCrewMember } from "./fleet-types";
import type {
  CrewIssue,
  CrewIssueKind,
  CrewIssueSubject,
  CrewRecordsStore,
  DriverReview,
  SkipperRating,
} from "./crew-records-types";
import { CREW_ISSUE_KINDS } from "./crew-records-types";
import { countSkipperCallbacks } from "./skipper-violations";
import { averageViolationRating } from "./violation-rating";

export const CREW_ISSUE_KIND_LABELS: Record<CrewIssueKind, string> = {
  mistake: "Mistake",
  failure: "Failure",
  violation: "Violation",
};

export const CREW_ISSUE_SUBJECT_LABELS: Record<CrewIssueSubject, string> = {
  uniforms: "Uniforms",
  attendance: "Attendance",
  seat_belt: "Seat belt",
  policy: "Policy",
  customer_complaint: "Customer complaint",
  work_rule: "Work rule",
};

export const CREW_ISSUE_STATUS_LABELS: Record<CrewIssue["status"], string> = {
  open: "Open",
  under_review: "Under review",
  resolved: "Resolved",
};

/** All issue kinds shown in the operations issues log. */
export const ISSUES_LOG_KINDS = CREW_ISSUE_KINDS;

export function isSkipper(crew: Pick<FleetCrewMember, "roles">): boolean {
  return crew.roles.includes("skipper");
}

export function isDriver(crew: Pick<FleetCrewMember, "roles">): boolean {
  return crew.roles.includes("driver");
}

export function isMover(crew: Pick<FleetCrewMember, "roles">): boolean {
  return crew.roles.includes("mover");
}

export function averageSkipperRating(ratings: SkipperRating[], skipperId?: string): number | null {
  const list = skipperId ? ratings.filter((r) => r.skipperId === skipperId) : ratings;
  return averageViolationRating(list);
}

export function averageDriverRating(reviews: DriverReview[], driverId?: string): number | null {
  const list = driverId ? reviews.filter((r) => r.driverId === driverId) : reviews;
  return averageViolationRating(list);
}

export function issueKindBadgeVariant(
  kind: CrewIssueKind,
): "default" | "warning" | "danger" {
  if (kind === "violation") return "danger";
  if (kind === "failure") return "warning";
  return "default";
}

export type CrewMemberPerformanceSummary = {
  crewId: string;
  name: string;
  isSkipper: boolean;
  avgRating: number | null;
  ratingCount: number;
  openIssues: number;
  attendance30d: number;
  seatBelt30d: number;
  customerComplaints30d: number;
  openCustomerComplaints: number;
  callbacks30d: number;
  totalIssues30d: number;
};

function isWithinDays(dateKey: string, days: number, today: Date): boolean {
  const d = new Date(`${dateKey}T12:00:00`);
  const start = new Date(today);
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  return d >= start;
}

export function buildCrewPerformanceSummaries(
  crew: FleetCrewMember[],
  records: CrewRecordsStore,
  today: Date = new Date(),
): CrewMemberPerformanceSummary[] {
  return crew
    .filter((c) => c.active)
    .map((c) => {
      const memberIssues = records.issues.filter((i) => i.crewId === c.id);
      const recent = memberIssues.filter((i) => isWithinDays(i.date, 30, today));
      const skipperRatings = records.skipperRatings.filter((r) => r.skipperId === c.id);

      return {
        crewId: c.id,
        name: c.name,
        isSkipper: isSkipper(c),
        avgRating: averageSkipperRating(skipperRatings),
        ratingCount: skipperRatings.length,
        openIssues: memberIssues.filter((i) => i.status !== "resolved").length,
        attendance30d: recent.filter((i) => i.subject === "attendance").length,
        seatBelt30d: recent.filter((i) => i.subject === "seat_belt").length,
        customerComplaints30d: recent.filter((i) => i.subject === "customer_complaint").length,
        openCustomerComplaints: memberIssues.filter(
          (i) => i.subject === "customer_complaint" && i.status !== "resolved",
        ).length,
        callbacks30d: isSkipper(c)
          ? countSkipperCallbacks(skipperRatings, 30, today)
          : 0,
        totalIssues30d: recent.length,
      };
    });
}

export function countIssuesByKind(issues: CrewIssue[], kind?: CrewIssueKind): number {
  return issues.filter((i) => (kind ? i.kind === kind : true)).length;
}

export function countIssuesBySubject(
  issues: CrewIssue[],
  subject?: CrewIssueSubject,
): number {
  return issues.filter((i) => (subject ? i.subject === subject : true)).length;
}
