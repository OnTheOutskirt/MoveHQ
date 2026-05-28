import type { FleetCrewMember } from "./fleet-types";
import type {
  CrewIssue,
  CrewIssueType,
  CrewRecordsStore,
  SkipperRating,
} from "./crew-records-types";

export const CREW_ISSUE_TYPE_LABELS: Record<CrewIssueType, string> = {
  tardy: "Tardy",
  driving: "Driving",
  on_job: "On-the-job",
  claim: "Claim",
  callback: "Callback",
};

export const CREW_ISSUE_STATUS_LABELS: Record<CrewIssue["status"], string> = {
  open: "Open",
  under_review: "Under review",
  resolved: "Resolved",
};

export function isSkipper(crew: Pick<FleetCrewMember, "roles">): boolean {
  return crew.roles.includes("skipper");
}

export function isDriver(crew: Pick<FleetCrewMember, "roles">): boolean {
  return crew.roles.includes("driver");
}

export function averageSkipperRating(ratings: SkipperRating[], skipperId?: string): number | null {
  const list = skipperId ? ratings.filter((r) => r.skipperId === skipperId) : ratings;
  if (list.length === 0) return null;
  const sum = list.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / list.length) * 10) / 10;
}

export type CrewMemberPerformanceSummary = {
  crewId: string;
  name: string;
  isSkipper: boolean;
  avgRating: number | null;
  ratingCount: number;
  openIssues: number;
  tardies30d: number;
  driving30d: number;
  onJob30d: number;
  claimsOpen: number;
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
        tardies30d: recent.filter((i) => i.type === "tardy").length,
        driving30d: recent.filter((i) => i.type === "driving").length,
        onJob30d: recent.filter((i) => i.type === "on_job").length,
        claimsOpen: memberIssues.filter((i) => i.type === "claim" && i.status !== "resolved")
          .length,
        callbacks30d: recent.filter((i) => i.type === "callback").length,
        totalIssues30d: recent.length,
      };
    });
}

export function countIssuesByType(
  issues: CrewIssue[],
  type?: CrewIssueType,
): number {
  return issues.filter((i) => (type ? i.type === type : true)).length;
}
