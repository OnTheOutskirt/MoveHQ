import {
  applyAcknowledgementSent,
  applyCloseout,
  applyIntakeReviewed,
  applyIssueDocumented,
  applyResolutionProposed,
  applyVendorPackageSent,
  applyVendorResponseReceived,
  createDefaultChecklist,
  markChecklistDone,
} from "./claims-workflow";
import type { ClaimsStore, MoveClaim } from "./claims-types";

const now = "2026-05-19T10:00:00Z";

function baseClaim(
  partial: Omit<MoveClaim, "checklist" | "commsLog"> & {
    checklist?: MoveClaim["checklist"];
    commsLog?: MoveClaim["commsLog"];
  },
): MoveClaim {
  const category = partial.category;
  return {
    ...partial,
    checklist: partial.checklist ?? createDefaultChecklist(category),
    commsLog: partial.commsLog ?? [],
  };
}

/** CLM-1041 — brand new damage claim, workflow not started */
const clm1 = baseClaim({
  id: "clm-1",
  reference: "CLM-1041",
  moveId: "mv-booked",
  customerName: "Patricia & James Okonkwo",
  moveReference: "MV-BOOKED",
  status: "new",
  category: "damage",
  title: "Scratched hardwood — dining room",
  description: "Customer reported gouges after furniture placement. Photos in move file.",
  reportedDate: "2026-05-20",
  amountClaimed: 2400,
  amountPaid: 0,
  reportedBy: "Skipper — Marcus T.",
  createdAt: now,
  updatedAt: now,
});

/** CLM-1038 — ack sent, documenting done, ready for vendor */
let clm2 = baseClaim({
  id: "clm-2",
  reference: "CLM-1038",
  moveId: "mv-complete-2day",
  customerName: "Helen & Robert Marsh",
  moveReference: "MV-COMPLETE-2D",
  status: "in_progress",
  category: "damage",
  title: "Wall scuff — stair landing",
  description: "Touch-up paint and patch quoted; vendor walkthrough scheduled.",
  reportedDate: "2026-05-12",
  amountClaimed: 850,
  amountPaid: 0,
  reportedBy: "Customer call",
  notes: "Got two repair bids — using lower bid pending customer OK.",
  createdAt: "2026-05-12T14:00:00Z",
  updatedAt: now,
});
clm2 = { ...clm2, ...applyIntakeReviewed(clm2, "Reviewed move photos and crew sign-off") };
clm2 = {
  ...clm2,
  ...applyIssueDocumented(
    clm2,
    "Scuff on stair landing drywall, ~18\" long. Customer photos match crew unload photos.",
    850,
  ),
};
clm2 = {
  ...clm2,
  ...applyAcknowledgementSent(clm2, "email", "Acknowledgement email sent to customer"),
};

/** CLM-1035 — other category, at propose resolution */
let clm3 = baseClaim({
  id: "clm-3",
  reference: "CLM-1035",
  moveId: "mv-complete",
  customerName: "Denise Carter",
  moveReference: "MV-COMPLETE",
  status: "in_progress",
  category: "other",
  title: "Disputed overtime charge",
  description: "Customer disputes 1.5 hrs over quote; reviewing time sheet and GPS.",
  reportedDate: "2026-05-08",
  amountClaimed: 420,
  amountPaid: 0,
  reportedBy: "Billing",
  notes: "Waiting on ops lead to sign off on adjustment before proposing credit.",
  createdAt: "2026-05-08T09:00:00Z",
  updatedAt: now,
});
clm3 = { ...clm3, ...applyIntakeReviewed(clm3) };
clm3 = {
  ...clm3,
  ...applyIssueDocumented(
    clm3,
    "Customer billed 1.5 hrs over quoted labor. GPS and time sheet show 45 min overrun; dispute is partial.",
    420,
  ),
};
clm3 = { ...clm3, ...applyAcknowledgementSent(clm3, "email", "Billing dispute acknowledgement sent") };

/** CLM-1032 — waiting on MoveBees vendor */
let clm4 = baseClaim({
  id: "clm-4",
  reference: "CLM-1032",
  moveId: "mv-complete-2day",
  customerName: "Helen & Robert Marsh",
  moveReference: "MV-COMPLETE-2D",
  status: "pending",
  category: "damage",
  title: "Floor scratch — bedroom",
  description: "Gouge in bedroom hardwood; photos attached. MoveBees walkthrough requested.",
  reportedDate: "2026-05-05",
  amountClaimed: 180,
  amountPaid: 0,
  reportedBy: "Customer email",
  createdAt: "2026-05-05T11:00:00Z",
  updatedAt: now,
});
clm4 = { ...clm4, ...applyIntakeReviewed(clm4) };
clm4 = {
  ...clm4,
  ...applyIssueDocumented(clm4, "Gouge ~6\" on bedroom hardwood near closet.", 180),
};
clm4 = { ...clm4, ...applyAcknowledgementSent(clm4, "email", "Claim received — repair partner assigned") };
clm4 = {
  ...clm4,
  ...applyVendorPackageSent(clm4, "vendor-movebees", "Claim package emailed to MoveBees"),
};

/** CLM-1028 — completed goodwill credit */
let clm5 = baseClaim({
  id: "clm-5",
  reference: "CLM-1028",
  moveId: "mv-complete",
  customerName: "Denise Carter",
  moveReference: "MV-COMPLETE",
  status: "completed",
  category: "other",
  title: "Late arrival — goodwill credit",
  description: "Crew arrived 45 min late; offered service credit.",
  reportedDate: "2026-05-02",
  amountClaimed: 150,
  amountPaid: 150,
  reportedBy: "Coordinator",
  notes: "Credit applied to final invoice.",
  createdAt: "2026-05-02T16:00:00Z",
  updatedAt: "2026-05-04T10:00:00Z",
  resolvedAt: "2026-05-04T10:00:00Z",
});
clm5 = { ...clm5, ...applyIntakeReviewed(clm5) };
clm5 = { ...clm5, ...applyIssueDocumented(clm5, "Crew arrived 45 minutes late per GPS.", 150) };
clm5 = { ...clm5, ...applyAcknowledgementSent(clm5, "sms", "Apology SMS sent with credit offer") };
clm5 = {
  ...clm5,
  ...applyResolutionProposed(clm5, "$150 service credit applied to invoice", "email"),
};
clm5 = {
  ...clm5,
  ...applyCloseout(clm5, {
    resolutionType: "credit",
    amountPaid: 150,
    closeoutNotes: "Credit applied to final invoice.",
  }),
};

/** CLM-1021 — denied pre-existing damage */
let clm6 = baseClaim({
  id: "clm-6",
  reference: "CLM-1021",
  moveId: "mv-quote-sent",
  customerName: "Nina & Tom Walsh",
  moveReference: "MV-QUOTE",
  status: "denied",
  category: "damage",
  title: "Pre-existing carpet stain",
  description: "Walkthrough photos show stain before load.",
  reportedDate: "2026-04-28",
  amountClaimed: 500,
  amountPaid: 0,
  reportedBy: "Claims review",
  notes: "Denied — not caused by crew.",
  createdAt: "2026-04-28T12:00:00Z",
  updatedAt: "2026-05-01T09:00:00Z",
  resolvedAt: "2026-05-01T09:00:00Z",
});
clm6 = { ...clm6, ...applyIntakeReviewed(clm6, "Compared pre-move walkthrough photos") };
clm6 = {
  ...clm6,
  ...applyIssueDocumented(clm6, "Carpet stain claimed; pre-move photos show same stain.", 500),
};
clm6 = { ...clm6, ...applyAcknowledgementSent(clm6, "email", "Claim under review acknowledgement") };
clm6 = {
  ...clm6,
  checklist: markChecklistDone(
    markChecklistDone(clm6.checklist, "select_vendor"),
    "send_to_vendor",
  ),
};
clm6 = { ...clm6, ...applyVendorResponseReceived(clm6, "N/A — denied before vendor repair") };
clm6 = {
  ...clm6,
  ...applyResolutionProposed(clm6, "Claim denied — pre-existing condition documented", "email"),
};
clm6 = {
  ...clm6,
  ...applyCloseout(clm6, {
    resolutionType: "denied",
    amountPaid: 0,
    denialReason: "Pre-existing stain visible in walkthrough photos before load.",
  }),
};

export const DEFAULT_CLAIMS: MoveClaim[] = [clm1, clm2, clm3, clm4, clm5, clm6];

export function defaultClaimsStore(): ClaimsStore {
  return { claims: DEFAULT_CLAIMS.map((c) => ({ ...c })) };
}
