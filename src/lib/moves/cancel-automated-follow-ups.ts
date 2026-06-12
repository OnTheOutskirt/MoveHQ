import { followUpOriginKind, syncFollowUpDue } from "./move-follow-ups";
import type { MoveFollowUp, MoveRecord } from "./types";

export function isAutomatedFollowUp(followUp: MoveFollowUp): boolean {
  return followUpOriginKind(followUp) === "automated";
}

export function openAutomatedFollowUps(move: MoveRecord): MoveFollowUp[] {
  return move.followUps.filter((f) => f.status === "open" && isAutomatedFollowUp(f));
}

export function cancelAutomatedFollowUpsOnMove(move: MoveRecord): MoveRecord {
  const followUps = move.followUps.map((f) =>
    f.status === "open" && isAutomatedFollowUp(f) ? { ...f, status: "skipped" as const } : f,
  );
  return syncFollowUpDue({ ...move, followUps, automationsSuppressed: true });
}
