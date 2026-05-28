/** @deprecated Legacy CRM status — use `conditionStatus` + `pipelineStage`. */
export const MOVE_STATUSES = [
  "new_request",
  "waiting",
  "quote_sent",
  "needs_contract",
  "booked",
  "scheduling",
  "in_progress",
  "completed",
  "lost",
] as const;

export type MoveStatus = (typeof MOVE_STATUSES)[number];

/** Where the move is in the sales/job lifecycle. */
export const PIPELINE_STAGE_IDS = [
  "new_lead",
  "waiting",
  "quote_sent",
  "needs_contract",
  "booked",
  "completed",
] as const;

export type PipelineStageId = (typeof PIPELINE_STAGE_IDS)[number];

export const WAITING_SUBSTAGES = [
  "needs_info",
  "needs_walkthrough",
  "walkthrough_scheduled",
] as const;

export type WaitingSubstage = (typeof WAITING_SUBSTAGES)[number];

/** Condition of the move — separate from pipeline stage. */
export const MOVE_CONDITION_STATUSES = [
  "active",
  "lost",
  "cancelled",
  "on_hold",
  "needs_review",
  "closed",
] as const;

export type MoveConditionStatus = (typeof MOVE_CONDITION_STATUSES)[number];

export const BOOKING_REVIEW_STATUSES = [
  "not_required",
  "pending_review",
  "approved",
  "needs_client_call",
  "needs_quote_adjustment",
  "rejected",
] as const;

export type BookingReviewStatus = (typeof BOOKING_REVIEW_STATUSES)[number];

export const LEAD_CHANNELS = [
  "repeat_customer",
  "referral_realtor",
  "referral_senior_living",
  "referral_business",
  "referral_other",
  "google",
  "google_maps",
  "facebook",
  "yelp",
  "instagram",
  "nextdoor",
  "saw_truck",
  "website",
  "phone",
  "other",
] as const;

export type LeadChannel = (typeof LEAD_CHANNELS)[number];

export type LeadHeat = "hot" | "cold";

export type ValueTier = "high" | "low";

export type PriorityTierId = "Q1" | "Q2" | "Q3" | "Q4";

/** @deprecated Use PriorityTierId */
export type QuadrantId = PriorityTierId;

export const MOVE_SOURCES = [
  "Website",
  "Phone",
  "Referral",
  "Repeat customer",
  "Manual entry",
] as const;

export type MoveSource = (typeof MOVE_SOURCES)[number];

export type MoveType = "Local" | "Long distance" | "Commercial" | "Labor only";

export const FOLLOW_UP_TYPES = [
  "first_contact",
  "info_request",
  "walkthrough",
  "proposal_follow_up",
  "contract_reminder",
  "booking_confirm",
  "ops_coordination",
  "review_request",
  "custom",
] as const;

export type FollowUpType = (typeof FOLLOW_UP_TYPES)[number];

export const FOLLOW_UP_CHANNELS = ["call", "sms", "email", "task"] as const;

export type FollowUpChannel = (typeof FOLLOW_UP_CHANNELS)[number];

export const FOLLOW_UP_STATUSES = ["open", "completed", "skipped"] as const;

export type FollowUpStatus = (typeof FOLLOW_UP_STATUSES)[number];

/** Follow-up tasks — separate from pipeline stage and move notes. */
export type MoveFollowUp = {
  id: string;
  moveId: string;
  type: FollowUpType;
  title: string;
  dueAt: string;
  assignedTo: string;
  channel: FollowUpChannel;
  status: FollowUpStatus;
  linkedStage: PipelineStageId;
  notes?: string;
  result?: string;
};

export type MoveActivityType =
  | "note"
  | "status_change"
  | "call"
  | "email"
  | "document"
  | "follow_up";

export type MoveActivity = {
  id: string;
  type: MoveActivityType;
  at: string;
  summary: string;
  actor?: string;
};

export const JOB_DAY_STATUSES = [
  "proposed",
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
] as const;
export type JobDayStatus = (typeof JOB_DAY_STATUSES)[number];

export const JOB_DAY_SERVICES = [
  "packing",
  "loading",
  "moving",
  "unloading",
  "unpacking",
  "junk_removal",
  "storage",
] as const;

export type JobDayService = (typeof JOB_DAY_SERVICES)[number];

export const JOB_DAY_LOCATION_ROLES = ["origin", "destination", "stop"] as const;
export type JobDayLocationRole = (typeof JOB_DAY_LOCATION_ROLES)[number];

/** Structured address on a job day — maps to Google Places later via placeId. */
export type JobDayLocation = {
  id: string;
  role: JobDayLocationRole;
  /** Stop label when role is stop */
  label?: string;
  formattedAddress: string;
  street: string;
  cityStateZip: string;
  locationType: IntakeLocationType | "";
  placeId?: string;
  accessNotes?: string;
};

export type MoveJobDay = {
  id: string;
  label: string;
  date: string;
  status: JobDayStatus;
  arrivalWindow?: string;
  durationLabel?: string;
  crewSize?: number;
  crewSummary?: string;
  /** @deprecated Prefer truckCount — kept for mock/display fallback */
  truckSummary?: string;
  truckCount?: number;
  locations?: JobDayLocation[];
  originNote?: string;
  destinationNote?: string;
  stopsNote?: string;
  services?: JobDayService[];
  hoursEstimated?: number;
  hoursActual?: number;
  laborCostEstimated?: number;
  dispatchNotes?: string;
  customerNotes?: string;
  accessNotes?: string;
  notes?: string;
};

export const LINKED_PERSON_ROLES = [
  "customer",
  "care_of",
  "realtor",
  "senior_living",
  "referral_partner",
  "facility",
  "other",
] as const;

export type LinkedPersonRole = (typeof LINKED_PERSON_ROLES)[number];

export type MoveLinkedPerson = {
  id: string;
  personId?: string;
  name: string;
  role: LinkedPersonRole;
  phone?: string;
  email?: string;
  organization?: string;
  relationship?: string;
  isPrimary?: boolean;
};

import type { FlatRateIntake, IntakeLocationType } from "./flat-rate-intake";

export type MoveRecord = {
  id: string;
  reference: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  /** Primary person record in /people */
  contactId: string;
  /** Legacy — synced from condition + pipeline */
  status: MoveStatus;
  pipelineStage: PipelineStageId;
  waitingSubstage: WaitingSubstage | null;
  conditionStatus: MoveConditionStatus;
  bookingReviewStatus: BookingReviewStatus;
  lostAt: string | null;
  lostFromStage: PipelineStageId | null;
  lostReason: string | null;
  leadChannel: LeadChannel;
  /** @deprecated Prefer `followUps` — kept for migration */
  followUpDue: string | null;
  followUps: MoveFollowUp[];
  source: MoveSource;
  assignedRep: string;
  coordinator: string | null;
  moveType: MoveType;
  originAddress: string;
  destinationAddress: string;
  preferredDate: string;
  quoteAmount: number | null;
  quoteType: "hourly" | "flat" | null;
  bedrooms: number | null;
  createdAt: string;
  updatedAt: string;
  activities: MoveActivity[];
  jobDays: MoveJobDay[];
  linkedPeople: MoveLinkedPerson[];
  intake: FlatRateIntake;
};
