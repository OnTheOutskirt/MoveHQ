export const CLAIM_STATUSES = [
  "new",
  "in_progress",
  "pending",
  "completed",
  "denied",
] as const;

export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

/** Tab groups on the operations Claims page */
export const CLAIM_STATUS_TABS = ["new", "in_progress", "pending", "completed"] as const;

export type ClaimStatusTab = (typeof CLAIM_STATUS_TABS)[number];

export const CLAIM_CATEGORIES = [
  "damage",
  "billing",
  "service",
  "lost_item",
  "liability",
  "other",
] as const;

export type ClaimCategory = (typeof CLAIM_CATEGORIES)[number];

export const CLAIM_PENDING_REASONS = [
  "customer",
  "insurance",
  "vendor",
  "internal",
  "legal",
] as const;

export type ClaimPendingReason = (typeof CLAIM_PENDING_REASONS)[number];

export type MoveClaim = {
  id: string;
  /** Display id, e.g. CLM-1042 */
  reference: string;
  moveId: string;
  customerName: string;
  moveReference: string;
  jobDayId?: string;
  jobDayLabel?: string;
  status: ClaimStatus;
  category: ClaimCategory;
  title: string;
  description?: string;
  reportedDate: string;
  pendingReason?: ClaimPendingReason;
  /** Customer / third-party ask */
  amountClaimed: number;
  /** Approved reserve or settlement offer */
  amountReserved: number;
  /** Actually paid out */
  amountPaid: number;
  assignedTo: string;
  reportedBy?: string;
  notes?: string;
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
