import { currentStepLabel, isWaitingOnVendor } from "./claims-workflow";
import type {
  ClaimCategory,
  ClaimPendingReason,
  ClaimResolutionType,
  ClaimStatus,
  ClaimStatusTab,
  MoveClaim,
} from "./claims-types";

export function formatClaimMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  new: "New",
  in_progress: "In progress",
  pending: "Pending",
  completed: "Completed",
  denied: "Denied",
};

export const CLAIM_STATUS_BADGE: Record<ClaimStatus, string> = {
  new: "bg-violet-100 text-violet-900",
  in_progress: "bg-sky-100 text-sky-900",
  pending: "bg-amber-100 text-amber-900",
  completed: "bg-emerald-100 text-emerald-900",
  denied: "bg-slate-200 text-slate-700",
};

export const CLAIM_CATEGORY_LABELS: Record<ClaimCategory, string> = {
  damage: "Damage",
  lost_item: "Lost item",
  other: "Other",
};

export const CLAIM_RESOLUTION_LABELS: Record<ClaimResolutionType, string> = {
  repair: "Repair completed",
  credit: "Service credit",
  payout: "Cash payout",
  denied: "Denied",
  insurance: "Insurance claim",
};

export const CLAIM_PENDING_LABELS: Record<ClaimPendingReason, string> = {
  customer: "Waiting on customer",
  insurance: "Insurance",
  vendor: "Vendor / third party",
  internal: "Internal review",
  legal: "Legal",
};

export function claimMatchesStatusTab(claim: MoveClaim, tab: ClaimStatusTab): boolean {
  if (tab === "completed") return claim.status === "completed" || claim.status === "denied";
  if (tab === "waiting_vendor") return isWaitingOnVendor(claim);
  if (tab === "pending") return claim.status === "pending" && !isWaitingOnVendor(claim);
  return claim.status === tab;
}

export function claimsForTab(claims: MoveClaim[], tab: ClaimStatusTab): MoveClaim[] {
  return claims
    .filter((c) => claimMatchesStatusTab(c, tab))
    .sort((a, b) => b.reportedDate.localeCompare(a.reportedDate));
}

export function countClaimsByTab(claims: MoveClaim[]): Record<ClaimStatusTab, number> {
  return {
    new: claims.filter((c) => c.status === "new").length,
    in_progress: claims.filter((c) => c.status === "in_progress").length,
    waiting_vendor: claims.filter((c) => isWaitingOnVendor(c)).length,
    pending: claims.filter((c) => c.status === "pending" && !isWaitingOnVendor(c)).length,
    completed: claims.filter((c) => c.status === "completed" || c.status === "denied").length,
  };
}

export type ClaimsSummary = {
  openCount: number;
  totalClaimed: number;
  totalPaid: number;
};

export function summarizeClaims(claims: MoveClaim[]): ClaimsSummary {
  const open = claims.filter((c) => c.status !== "completed" && c.status !== "denied");
  return {
    openCount: open.length,
    totalClaimed: claims.reduce((s, c) => s + c.amountClaimed, 0),
    totalPaid: claims.reduce((s, c) => s + c.amountPaid, 0),
  };
}

export function claimsForMove(claims: MoveClaim[], moveId: string): MoveClaim[] {
  return claims.filter((c) => c.moveId === moveId);
}

export { currentStepLabel };
