export const CREW_ISSUE_TYPES = [
  "tardy",
  "driving",
  "on_job",
  "claim",
  "callback",
] as const;

export type CrewIssueType = (typeof CREW_ISSUE_TYPES)[number];

export type CrewIssueStatus = "open" | "under_review" | "resolved";

export type CrewIssue = {
  id: string;
  crewId: string;
  type: CrewIssueType;
  date: string;
  title: string;
  description?: string;
  jobRef?: string;
  moveId?: string;
  status: CrewIssueStatus;
  reportedBy?: string;
  createdAt: string;
  resolvedAt?: string;
  notes?: string;
};

export type SkipperRating = {
  id: string;
  skipperId: string;
  date: string;
  jobRef?: string;
  moveId?: string;
  /** 1–5 overall */
  rating: number;
  communication?: number;
  leadership?: number;
  care?: number;
  efficiency?: number;
  notes?: string;
  ratedBy?: string;
  createdAt: string;
};

export type CrewRecordsStore = {
  issues: CrewIssue[];
  skipperRatings: SkipperRating[];
};
