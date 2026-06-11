import type {
  CrewIssue,
  CrewIssueKind,
  CrewIssueSubject,
} from "./crew-records-types";
import {
  CREW_ISSUE_KINDS,
  CREW_ISSUE_SUBJECTS,
} from "./crew-records-types";

type LegacyIssueRow = CrewIssue & {
  type?: string;
  title?: string;
};

const LEGACY_TYPE_MAP: Record<
  string,
  { kind: CrewIssueKind; subject: CrewIssueSubject }
> = {
  tardy: { kind: "violation", subject: "attendance" },
  driving: { kind: "violation", subject: "seat_belt" },
  on_job: { kind: "failure", subject: "customer_complaint" },
  claim: { kind: "failure", subject: "customer_complaint" },
  callback: { kind: "failure", subject: "customer_complaint" },
};

function normalizeKind(value: unknown): CrewIssueKind {
  if (typeof value === "string" && (CREW_ISSUE_KINDS as readonly string[]).includes(value)) {
    return value as CrewIssueKind;
  }
  return "violation";
}

function normalizeSubject(value: unknown): CrewIssueSubject {
  if (typeof value === "string" && (CREW_ISSUE_SUBJECTS as readonly string[]).includes(value)) {
    return value as CrewIssueSubject;
  }
  return "work_rule";
}

/** Backfill and migrate older localStorage issue rows. */
export function normalizeCrewIssue(raw: LegacyIssueRow): CrewIssue | null {
  if (raw.type === "callback") return null;

  const legacy = raw.type ? LEGACY_TYPE_MAP[raw.type] : undefined;
  const kind = raw.kind ?? legacy?.kind ?? normalizeKind(raw.kind);
  const subject = raw.subject ?? legacy?.subject ?? normalizeSubject(raw.subject);

  const description =
    raw.description?.trim() ||
    raw.title?.trim() ||
    "Issue logged (no description on file).";

  return {
    id: raw.id,
    crewId: raw.crewId,
    kind,
    subject,
    date: raw.date,
    description,
    messageSent: Boolean(raw.messageSent),
    jobRef: raw.jobRef,
    moveId: raw.moveId,
    status: raw.status ?? "open",
    reportedBy: raw.reportedBy,
    createdAt: raw.createdAt,
    resolvedAt: raw.resolvedAt,
    notes: raw.notes,
  };
}

export function normalizeCrewIssues(rawIssues: LegacyIssueRow[]): CrewIssue[] {
  return rawIssues
    .map(normalizeCrewIssue)
    .filter((issue): issue is CrewIssue => issue != null);
}
