/** Mock signed-in user until auth is wired up. */
export const CURRENT_USER = {
  id: "user-alex-rivera",
  name: "Alex Rivera",
  initials: "AR",
  title: "Sales",
  /** Matches `MoveRecord.assignedRep` for follow-up filtering */
  assignedRep: "Alex Rivera",
} as const;
