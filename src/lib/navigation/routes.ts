/** Canonical app routes — prefer these over hard-coded path strings. */
export const ROUTES = {
  schedule: "/schedule",
  salesDashboard: "/sales/dashboard",
  salesMoves: "/sales/moves",
  salesFollowUps: "/sales/follow-ups",
  salesDocuments: "/sales/documents",
  salesDirectory: "/sales/directory",
  /** Referral partner stats — Directory tab. */
  salesReferralPartners: "/sales/directory?tab=referral-partners",
  /** @deprecated Use salesReferralPartners — kept for redirects. */
  salesReferralPartnersReport: "/sales/directory?tab=referral-partners",
  /** Flat-rate web quote queues (incomplete, quoted, booked review). */
  salesWebQuotes: "/sales/web-quotes",
  salesWalkthroughs: "/sales/walkthroughs",
  /** Customer self-schedule walkthrough (no login). */
  portalWalkthrough: "/portal/walkthrough",
  account: "/account",
  signIn: "/sign-in",
} as const;

export function salesMovePath(id: string): string {
  return `${ROUTES.salesMoves}/${id}`;
}

export function salesDirectoryPersonPath(personId: string): string {
  return `${ROUTES.salesDirectory}?person=${encodeURIComponent(personId)}`;
}

export function salesDirectoryOrgPath(orgId: string): string {
  return `${ROUTES.salesDirectory}?org=${encodeURIComponent(orgId)}`;
}
