import type { MoveQuoteDiscount } from "./quote-discount";

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

/** How the quote was built — distinct from `leadChannel` (marketing attribution). */
export const QUOTE_CHANNELS = ["web_ai", "phone", "office", "unknown"] as const;

export type QuoteChannel = (typeof QUOTE_CHANNELS)[number];

/** Website flat-rate intake completion state. */
export const INTAKE_PROGRESS_IDS = ["started", "quoted", "booked"] as const;

export type IntakeProgress = (typeof INTAKE_PROGRESS_IDS)[number];

export type WebsiteIntakeMeta = {
  sessionId?: string;
  lastStepCompleted?: string;
  quotedAt?: string | null;
  bookedAt?: string | null;
  /** Manually cleared from AI Web Quotes lists (incomplete / quoted). */
  dismissedQueues?: ("incomplete" | "quoted" | "booked_review")[];
};

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

export const FOLLOW_UP_SOURCES = ["manual", "automation", "scheduled"] as const;

export type FollowUpSource = (typeof FOLLOW_UP_SOURCES)[number];

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
  /** How the task was created — defaults inferred for legacy rows. */
  source?: FollowUpSource;
  /** Pipeline automation rule that created this row — used to avoid duplicates. */
  automationRuleId?: string;
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

export type MoveActivityDocumentMeta = {
  kind: "quote" | "contract";
  event: "sent" | "resent" | "viewed" | "booking_requested" | "signed" | "deposit_paid";
};

export type MoveActivity = {
  id: string;
  type: MoveActivityType;
  at: string;
  summary: string;
  actor?: string;
  document?: MoveActivityDocumentMeta;
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
  city?: string;
  state?: string;
  zip?: string;
  locationType: IntakeLocationType | "";
  placeId?: string;
  access?: Record<string, string>;
  accessNotes?: string;
};

/** Partial-day fraction for day-share scheduling. */
export const JOB_DAY_FRACTIONS = ["brief", "short", "medium", "long"] as const;
export type JobDayFraction = (typeof JOB_DAY_FRACTIONS)[number];

export const JOB_DAY_PERIODS = ["morning", "afternoon"] as const;
export type JobDayPeriod = (typeof JOB_DAY_PERIODS)[number];

/** Crew hotel for this job day — client charge on quote; ops books via prep task. */
export type JobDayCrewHotel = {
  needed: boolean;
  moverCount?: number;
  roomCount?: number;
  roomRate?: number;
  perDiemPerMover?: number;
  /** Total client charge (rooms + per diem) */
  clientCharge?: number;
  notes?: string;
};

export type MoveJobDay = {
  id: string;
  label: string;
  date: string;
  status: JobDayStatus;
  /** Partial-day length — `long` is a full crew-day (default). */
  dayFraction?: JobDayFraction;
  /** When true, day length is set manually and does not follow est. hours. */
  dayFractionOverride?: boolean;
  /** Morning = tight arrival window; afternoon = flexible 11–4. @deprecated Prefer isFirstJobOfDay */
  dayPeriod?: JobDayPeriod;
  /** When false, crew is already on the road — flexible 11 AM–4 PM arrival, no shop departure. */
  isFirstJobOfDay?: boolean;
  arrivalWindow?: string;
  /** When crew leaves the shop / yard */
  departureWindow?: string;
  durationLabel?: string;
  crewSize?: number;
  /** Movers who actually worked the day (ops post-job correction). */
  crewSizeActual?: number;
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
  /** Crew travel hours recorded by ops (shop ↔ job). */
  actualDriveHours?: number | null;
  laborCostEstimated?: number;
  dispatchNotes?: string;
  customerNotes?: string;
  accessNotes?: string;
  notes?: string;
  crewHotel?: JobDayCrewHotel;
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
import type { LostQualification } from "./lost-reasons";

export type MoveSentDocument = {
  sentAt: string;
  portalUrl: string;
  firstViewedAt?: string | null;
  lastViewedAt?: string | null;
  viewCount?: number;
  bookingRequestedAt?: string | null;
  signedAt?: string | null;
  depositPaidAt?: string | null;
  depositAmount?: number | null;
};

export type WalkthroughMode = "in_person" | "virtual";
export type WalkthroughStatus = "scheduled" | "completed" | "cancelled";

export type MoveWalkthrough = {
  id: string;
  scheduledDate: string;
  startTime: string;
  assignedTo: string;
  mode: WalkthroughMode;
  status: WalkthroughStatus;
  location?: string;
  bookedAt: string;
};

/** Post-move crew rating from the customer feedback portal. */
export type MoveCrewFeedback = {
  rating: number;
  comment: string;
  submittedAt: string;
  /** Customer was shown the Google review link after submitting. */
  googleReviewOffered: boolean;
};

export type WalkthroughScheduleDraft = {
  scheduledDate: string;
  startTime: string;
  assignedTo: string;
  mode: WalkthroughMode;
};

export type MoveRecord = {
  id: string;
  reference: string;
  /** SaaS tenant — moving company workspace. */
  companyId: string;
  /** Branch that owns / services this move. */
  locationId: string;
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
  /** Display string — built from qualification + reason (+ notes). */
  lostReason: string | null;
  lostQualification: LostQualification | null;
  lostReasonId: string | null;
  lostNotes: string | null;
  leadChannel: LeadChannel;
  /** How the quote was produced (web AI vs phone vs office). */
  quoteChannel: QuoteChannel;
  /** Website intake completion — used for web work queues. */
  intakeProgress: IntakeProgress;
  /** Optional metadata from the website quoting session. */
  websiteIntake: WebsiteIntakeMeta | null;
  /** @deprecated Prefer `followUps` — kept for migration */
  followUpDue: string | null;
  followUps: MoveFollowUp[];
  /** When true, pipeline automations will not create new follow-up rows on this move. */
  automationsSuppressed?: boolean;
  source: MoveSource;
  assignedRep: string;
  coordinator: string | null;
  moveType: MoveType;
  originAddress: string;
  destinationAddress: string;
  preferredDate: string;
  quoteAmount: number | null;
  quoteType: "hourly" | "flat" | null;
  /** Optional sales discount applied on the quote tab. */
  quoteDiscount: MoveQuoteDiscount | null;
  sentQuote: MoveSentDocument | null;
  sentContract: MoveSentDocument | null;
  bedrooms: number | null;
  createdAt: string;
  updatedAt: string;
  activities: MoveActivity[];
  jobDays: MoveJobDay[];
  linkedPeople: MoveLinkedPerson[];
  intake: FlatRateIntake;
  scheduledWalkthrough?: MoveWalkthrough | null;
  /** Customer crew rating from post-move feedback portal. */
  crewFeedback?: MoveCrewFeedback | null;
};
