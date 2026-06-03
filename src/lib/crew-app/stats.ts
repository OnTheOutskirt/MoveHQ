import {
  CREW_ISSUE_STATUS_LABELS,
  CREW_ISSUE_TYPE_LABELS,
} from "@/lib/operations/crew-records";
import type { CrewIssue } from "@/lib/operations/crew-records-types";
import type { CrewAppIssueSummary } from "./types";

export function issuesForCrewMember(issues: CrewIssue[], crewId: string): CrewIssue[] {
  return issues
    .filter((i) => i.crewId === crewId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function summarizeIssues(issues: CrewIssue[]): CrewAppIssueSummary[] {
  return issues.map((i) => ({
    id: i.id,
    type: i.type,
    date: i.date,
    title: i.title,
    status: i.status,
    statusLabel: CREW_ISSUE_STATUS_LABELS[i.status],
  }));
}

export function openIssueCount(issues: CrewIssue[]): number {
  return issues.filter((i) => i.status === "open" || i.status === "under_review").length;
}

export function issueTypeLabel(type: CrewIssue["type"]): string {
  return CREW_ISSUE_TYPE_LABELS[type];
}
