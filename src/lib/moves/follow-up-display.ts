import { followUpOriginKind, getFollowUpDueBucket, type FollowUpOriginKind } from "./move-follow-ups";
import type { FollowUpChannel, FollowUpStatus, MoveFollowUp } from "./types";

export type { FollowUpOriginKind };

export type FollowUpComposerChannel = Exclude<FollowUpChannel, "task">;

export const MANUAL_FOLLOW_UP_CHANNELS: FollowUpComposerChannel[] = ["call", "sms", "email"];

export function followUpComposerChannel(
  channel: FollowUpChannel,
): FollowUpComposerChannel | null {
  if (channel === "task") return null;
  return channel;
}

export const FOLLOW_UP_ORIGIN_LABELS: Record<FollowUpOriginKind, string> = {
  manual: "Manual",
  automated: "Automated",
};

export const FOLLOW_UP_STATUS_LABELS: Record<FollowUpStatus, string> = {
  open: "Open",
  completed: "Done",
  skipped: "Skipped",
};

export const FOLLOW_UP_CHANNEL_LABELS: Record<FollowUpChannel, string> = {
  call: "Call",
  sms: "SMS",
  email: "Email",
  task: "Task",
};

export function partitionMoveFollowUps(followUps: MoveFollowUp[]): {
  open: MoveFollowUp[];
  closed: MoveFollowUp[];
} {
  const open = followUps
    .filter((f) => f.status === "open")
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  const closed = followUps
    .filter((f) => f.status !== "open")
    .sort((a, b) => b.dueAt.localeCompare(a.dueAt));
  return { open, closed };
}

export function followUpOpenOriginCounts(
  followUps: MoveFollowUp[],
): Record<FollowUpOriginKind, number> {
  const open = followUps.filter((f) => f.status === "open");
  return {
    manual: open.filter((f) => followUpOriginKind(f) === "manual").length,
    automated: open.filter((f) => followUpOriginKind(f) === "automated").length,
  };
}

export function followUpMatchesOriginKind(
  followUp: MoveFollowUp,
  origin: FollowUpOriginKind,
): boolean {
  return followUpOriginKind(followUp) === origin;
}

export function followUpDueLabel(followUp: MoveFollowUp): string | null {
  if (followUp.status !== "open") return null;
  const bucket = getFollowUpDueBucket(followUp);
  if (bucket === "overdue") return "Overdue";
  if (bucket === "today") return "Due today";
  return null;
}

export function followUpSourceLabel(followUp: MoveFollowUp): string {
  return FOLLOW_UP_ORIGIN_LABELS[followUpOriginKind(followUp)];
}
