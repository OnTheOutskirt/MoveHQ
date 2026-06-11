export const CLAIM_STATUSES = [
  "new",
  "in_progress",
  "pending",
  "completed",
  "denied",
] as const;

export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

/** Tab groups on the operations Claims page */
export const CLAIM_STATUS_TABS = [
  "new",
  "in_progress",
  "waiting_vendor",
  "pending",
  "completed",
] as const;

export type ClaimStatusTab = (typeof CLAIM_STATUS_TABS)[number];

/** Pipeline board columns — includes waiting-on-vendor lane */
export const CLAIM_PIPELINE_COLUMNS = [
  "new",
  "in_progress",
  "waiting_vendor",
  "pending",
  "completed",
] as const;

export type ClaimPipelineColumn = (typeof CLAIM_PIPELINE_COLUMNS)[number];

export const CLAIM_CATEGORIES = ["damage", "lost_item", "other"] as const;

export type ClaimCategory = (typeof CLAIM_CATEGORIES)[number];

export const CLAIM_PENDING_REASONS = [
  "customer",
  "insurance",
  "vendor",
  "internal",
  "legal",
] as const;

export type ClaimPendingReason = (typeof CLAIM_PENDING_REASONS)[number];

export const CLAIM_CHECKLIST_IDS = [
  "intake_review",
  "document_damage",
  "send_acknowledgement",
  "select_vendor",
  "send_to_vendor",
  "waiting_vendor",
  "propose_resolution",
  "closeout",
] as const;

export type ClaimChecklistId = (typeof CLAIM_CHECKLIST_IDS)[number];

export type ClaimChecklistItem = {
  id: ClaimChecklistId;
  label: string;
  done: boolean;
  doneAt?: string;
};

export type ClaimCommsChannel = "email" | "sms" | "vendor";

export type ClaimCommsEntry = {
  id: string;
  at: string;
  channel: ClaimCommsChannel;
  direction: "outbound" | "inbound";
  summary: string;
  recipient?: string;
  templateId?: string;
};

export const CLAIM_RESOLUTION_TYPES = [
  "repair",
  "credit",
  "payout",
  "denied",
  "insurance",
] as const;

export type ClaimResolutionType = (typeof CLAIM_RESOLUTION_TYPES)[number];

export type MoveClaim = {
  id: string;
  /** Display id, e.g. CLM-1042 */
  reference: string;
  moveId: string;
  customerName: string;
  moveReference: string;
  status: ClaimStatus;
  category: ClaimCategory;
  title: string;
  description?: string;
  reportedDate: string;
  pendingReason?: ClaimPendingReason;
  /** Customer / third-party ask */
  amountClaimed: number;
  /** Actually paid out */
  amountPaid: number;
  reportedBy?: string;
  notes?: string;
  /** Step-by-step workflow checklist */
  checklist: ClaimChecklistItem[];
  /** Structured issue documentation from workflow step 2 */
  damageDocumentation?: string;
  /** Customer-facing resolution proposal text */
  resolutionProposal?: string;
  resolutionType?: ClaimResolutionType;
  denialReason?: string;
  /** Outbound / inbound comms log */
  commsLog: ClaimCommsEntry[];
  /** Selected third-party vendor (MoveBees, AHM, etc.) */
  vendorId?: string;
  acknowledgementSentAt?: string;
  vendorSentAt?: string;
  vendorResponseDue?: string;
  vendorResponseReceivedAt?: string;
  assignedTo?: string;
  /** Field capture media ids attached from crew / ops app */
  fieldMediaIds?: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
};

export type ClaimsStore = {
  claims: MoveClaim[];
};

export type NewMoveClaim = Omit<
  MoveClaim,
  "id" | "reference" | "createdAt" | "updatedAt" | "resolvedAt"
>;
