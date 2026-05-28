/** Canonical app routes — prefer these over hard-coded path strings. */
export const ROUTES = {
  salesMoves: "/sales/moves",
  salesFollowUps: "/sales/follow-ups",
  salesDocuments: "/sales/documents",
  salesDirectory: "/sales/directory",
  /** Flat-rate web quote queues (incomplete, quoted, booked review). */
  salesWebQuotes: "/sales/web-quotes",
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
