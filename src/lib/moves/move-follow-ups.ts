import { isWebAiQuote } from "./acquisition";
import { getMovePriorityTier } from "./move-priority-tier";
import { followUpSourceForMove } from "@/lib/settings/priority-tier-rules-runtime";
import type { FollowUpSource, MoveFollowUp, MoveRecord, PipelineStageId } from "./types";

function dueDateKey(iso: string): string {
  return iso.slice(0, 10);
}

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type FollowUpDueBucket = "overdue" | "today" | "upcoming";

export function getOpenFollowUps(move: MoveRecord): MoveFollowUp[] {
  return move.followUps.filter((f) => f.status === "open");
}

export function getNextOpenFollowUp(move: MoveRecord): MoveFollowUp | null {
  const open = getOpenFollowUps(move);
  if (open.length === 0) return null;
  return [...open].sort((a, b) => a.dueAt.localeCompare(b.dueAt))[0];
}

export function syncFollowUpDue(move: MoveRecord): MoveRecord {
  const next = getNextOpenFollowUp(move);
  return { ...move, followUpDue: next?.dueAt ?? null };
}

export function getFollowUpDueBucket(followUp: MoveFollowUp): FollowUpDueBucket {
  const due = dueDateKey(followUp.dueAt);
  const today = todayKey();
  if (due < today) return "overdue";
  if (due === today) return "today";
  return "upcoming";
}

export function moveHasOpenFollowUp(move: MoveRecord): boolean {
  return getOpenFollowUps(move).length > 0;
}

export function moveHasOverdueFollowUp(move: MoveRecord): boolean {
  return getOpenFollowUps(move).some((f) => getFollowUpDueBucket(f) === "overdue");
}

export function moveHasFollowUpDueToday(move: MoveRecord): boolean {
  return getOpenFollowUps(move).some((f) => getFollowUpDueBucket(f) === "today");
}

export function moveHasNoScheduledFollowUp(move: MoveRecord): boolean {
  if (isTerminalMoveForFollowUp(move)) return false;
  return !moveHasOpenFollowUp(move);
}

function isTerminalMoveForFollowUp(move: MoveRecord): boolean {
  return (
    move.conditionStatus === "lost" ||
    move.conditionStatus === "cancelled" ||
    move.conditionStatus === "closed"
  );
}

/** Default follow-up when a move enters a pipeline stage. */
export function defaultFollowUpForStage(
  move: MoveRecord,
  stage: PipelineStageId,
): Omit<MoveFollowUp, "id" | "moveId"> | null {
  const source = followUpSourceForMove(getMovePriorityTier(move), stage);
  const base = {
    assignedTo: move.assignedRep,
    status: "open" as const,
    linkedStage: stage,
    source,
  };

  switch (stage) {
    case "new_lead":
      return {
        ...base,
        type: "first_contact",
        title: "Call lead within 15 minutes",
        dueAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        channel: "call",
      };
    case "waiting":
      return {
        ...base,
        type: "info_request",
        title: "Request missing details",
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        channel: "email",
      };
    case "quote_sent":
      return {
        ...base,
        type: "proposal_follow_up",
        title: "Follow up on proposal",
        dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        channel: "call",
      };
    case "needs_contract":
      return {
        ...base,
        type: "contract_reminder",
        title: "Send contract reminder",
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        channel: "email",
      };
    case "booked":
      return {
        ...base,
        type: "booking_confirm",
        title: isWebAiQuote(move)
          ? "Review web booking — kickoff call & verify quote"
          : "Confirm booking details",
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        channel: "call",
      };
    case "completed":
      return {
        ...base,
        type: "review_request",
        title: "Ask for review",
        dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        channel: "email",
      };
  }
}

export function createFollowUp(
  move: MoveRecord,
  partial: Omit<MoveFollowUp, "id" | "moveId">,
): MoveFollowUp {
  return {
    id: `fu-${move.id}-${Date.now()}`,
    moveId: move.id,
    ...partial,
    source: partial.source ?? "manual",
  };
}

export function resolveFollowUpSource(followUp: MoveFollowUp): FollowUpSource {
  if (followUp.source) return followUp.source;
  if (followUp.type === "custom") return "manual";
  return "automation";
}
