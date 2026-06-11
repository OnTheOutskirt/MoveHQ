import type { DriverViolationId } from "./driver-violations";
import type { SkipperViolationId } from "./skipper-violations";

/** Top-level classification: mistake, failure, or violation. */
export const CREW_ISSUE_KINDS = ["mistake", "failure", "violation"] as const;

export type CrewIssueKind = (typeof CREW_ISSUE_KINDS)[number];

/** What the issue was about — shown as "Subject" in the UI. */
export const CREW_ISSUE_SUBJECTS = [
  "uniforms",
  "attendance",
  "seat_belt",
  "policy",
  "customer_complaint",
  "work_rule",
] as const;

export type CrewIssueSubject = (typeof CREW_ISSUE_SUBJECTS)[number];

export type CrewIssueStatus = "open" | "under_review" | "resolved";

export type CrewIssue = {
  id: string;
  crewId: string;
  kind: CrewIssueKind;
  subject: CrewIssueSubject;
  date: string;
  description: string;
  messageSent: boolean;
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
  /** 0–10 overall — computed from violations when logged */
  rating: number;
  /** Checklist items marked on this job review */
  violations: SkipperViolationId[];
  /** Detail when "Callback" is checked */
  callbackNote?: string;
  /** Detail when "Other" is checked */
  otherNote?: string;
  notes?: string;
  ratedBy?: string;
  createdAt: string;
  /** Linked field capture from crew / ops app */
  fieldMediaId?: string;
  photoDataUrl?: string;
  /** @deprecated Legacy sub-scores — kept for older saved records */
  communication?: number;
  leadership?: number;
  care?: number;
  efficiency?: number;
};

export type DriverReview = {
  id: string;
  driverId: string;
  date: string;
  jobRef?: string;
  moveId?: string;
  /** 0–10 overall — computed from violations when logged */
  rating: number;
  violations: DriverViolationId[];
  otherNote?: string;
  notes?: string;
  reviewedBy?: string;
  createdAt: string;
};

export type CrewRecordsStore = {
  issues: CrewIssue[];
  skipperRatings: SkipperRating[];
  driverReviews: DriverReview[];
};
