import { formatMoveDate } from "./format";
import { getNextOpenFollowUp, moveHasOverdueFollowUp } from "./move-follow-ups";
import {
  getPipelineStage,
  getPrimaryWorkspaceMode,
  hasConfirmedJobDays,
  hasProposedJobDays,
  isMoveLost,
  moveStageDisplayLabel,
  pipelineStageLabel,
  waitingSubstageLabel,
  type PrimaryWorkspaceMode,
} from "./move-pipeline";
import { getMoveOperationalSummary } from "./move-operational";
import { jobDayStatusLabel } from "./job-days";
import { packingServiceLabel } from "./intake-display";
import type { JobDayStatus, MoveRecord, PipelineStageId } from "./types";
import { getMoveQuickActions, type MoveQuickActionId } from "./quick-actions";

export type MoveHealth = "on_track" | "attention" | "problem";

export type OperationsSnapshot = {
  coordinator: string;
  proposalStatus: string;
  proposalDetail?: string;
  depositStatus: string;
  scheduleStatus: string;
  nextAction: string;
  nextActionUrgent?: boolean;
};

export type NextAction = {
  label: string;
  detail?: string;
  urgent?: boolean;
};

export type MovePlanSummary = {
  scope: string;
  complexity: "Low" | "Medium" | "High";
  crewRecommendation: string;
  estimatedDuration: string;
  specialConditions: string[];
  aiConfidence: string;
};

export type SuggestedJobDay = {
  id: string;
  label: string;
  recommendation: string;
  dateHint?: string;
};

export function getMoveHealth(move: MoveRecord): { health: MoveHealth; reasons: string[] } {
  const reasons: string[] = [];
  if (isMoveLost(move)) {
    return {
      health: "problem",
      reasons: [
        `Lost from ${move.lostFromStage ? pipelineStageLabel(move.lostFromStage) : "pipeline"}`,
      ],
    };
  }
  if (move.intake.manualReviewRequired) reasons.push("Manual review required");
  if (moveHasOverdueFollowUp(move)) reasons.push("Follow-up overdue");
  if (move.pipelineStage === "booked" && !hasConfirmedJobDays(move) && move.jobDays.length > 0) {
    reasons.push("Confirm job days on calendar");
  }
  if (
    move.pipelineStage === "booked" &&
    move.jobDays.some((d) => d.crewSummary?.includes("Unassigned"))
  ) {
    reasons.push("Crew assignment pending");
  }

  if (reasons.length >= 2) return { health: "problem", reasons };
  if (reasons.length === 1) return { health: "attention", reasons };
  return { health: "on_track", reasons: ["On track"] };
}

export function getOperationsSnapshot(move: MoveRecord): OperationsSnapshot {
  const ops = getMoveOperationalSummary(move);
  const stage = move.pipelineStage;

  let proposalStatus = "Not sent";
  let proposalDetail: string | undefined;
  if (stage === "quote_sent" || stage === "needs_contract" || stage === "booked" || stage === "completed") {
    proposalStatus = stage === "quote_sent" ? "Sent" : "Accepted";
    if (stage === "quote_sent") {
      proposalDetail = `Updated ${formatMoveDate(move.updatedAt.slice(0, 10))}`;
    }
  } else if (stage === "waiting") {
    proposalStatus = "In progress";
    if (move.waitingSubstage) {
      proposalDetail = waitingSubstageLabel(move.waitingSubstage);
    }
  }

  let depositStatus = "Not required";
  if (stage === "needs_contract") depositStatus = "Awaiting deposit";
  else if (stage === "booked" || stage === "completed") depositStatus = "Partial · balance due";

  let scheduleStatus = "Not planned";
  if (hasProposedJobDays(move) && !hasConfirmedJobDays(move)) {
    scheduleStatus = `${move.jobDays.filter((d) => d.status === "proposed").length} day(s) on quote`;
  } else if (move.jobDays.length > 0) {
    const unassigned = move.jobDays.some(
      (d) =>
        d.status !== "proposed" &&
        d.status !== "cancelled" &&
        (d.crewSummary?.includes("Unassigned") || !d.crewSummary),
    );
    scheduleStatus = unassigned
      ? `${move.jobDays.length} day(s) · crew pending`
      : `${move.jobDays.length} day(s) scheduled`;
  }

  const next = getNextAction(move);

  return {
    coordinator: ops.coordinator,
    proposalStatus,
    proposalDetail,
    depositStatus,
    scheduleStatus,
    nextAction: next.label,
    nextActionUrgent: next.urgent,
  };
}

export function getNextAction(move: MoveRecord): NextAction {
  if (isMoveLost(move)) {
    return {
      label: "Archive or re-open if client returns",
      detail: move.lostReason ?? `Lost from ${move.lostFromStage ? pipelineStageLabel(move.lostFromStage) : "pipeline"}`,
    };
  }

  const nextFu = getNextOpenFollowUp(move);
  if (nextFu) {
    const overdue = moveHasOverdueFollowUp(move);
    return {
      label: nextFu.title,
      detail: overdue ? "Overdue" : `Due ${formatMoveDate(nextFu.dueAt.slice(0, 10))}`,
      urgent: overdue,
    };
  }

  const stage = move.pipelineStage;
  const ops = getMoveOperationalSummary(move);

  if (stage === "waiting" && move.waitingSubstage) {
    const sub = move.waitingSubstage;
    if (sub === "needs_info") {
      return {
        label: "Collect missing details",
        detail: "Cannot send quote until intake is complete",
      };
    }
    if (sub === "needs_walkthrough") {
      return { label: "Schedule walkthrough", detail: "Site visit or video before quoting" };
    }
    return {
      label: "Complete walkthrough, then send quote",
      detail: "Visit on calendar",
    };
  }

  const byStage: Record<PipelineStageId, NextAction> = {
    new_lead: { label: "Make first contact", detail: "New lead — no outreach yet" },
    waiting: { label: "Set waiting reason", detail: "Needs info, walkthrough, or scheduled visit" },
    quote_sent: {
      label: "Follow up on open proposal",
      detail: ops.estimatedRevenue,
    },
    needs_contract: {
      label: "Collect contract & deposit",
      detail: "Client ready to book",
      urgent: true,
    },
    booked: move.jobDays.some((d) => d.status === "in_progress")
      ? {
          label: "Monitor active job day",
          detail: "Move is in progress on site",
        }
      : {
          label: "Confirm crew & calendar",
          detail: "Booked — lock job days from quote",
          urgent: !hasConfirmedJobDays(move),
        },
    completed: {
      label: "Send final invoice & request review",
      detail: "Move finished",
    },
  };

  return byStage[stage] ?? { label: "Advance pipeline", detail: moveStageDisplayLabel(move) };
}

export function getMovePlanSummary(move: MoveRecord): MovePlanSummary {
  const ops = getMoveOperationalSummary(move);
  const { intake } = move;
  const pricing =
    move.quoteType === "flat" ? "Flat rate" : move.quoteType === "hourly" ? "Hourly" : "TBD";

  const scope = `${intake.homeSizeLabel} · ${move.moveType} · ${pricing} move`;

  let complexity: MovePlanSummary["complexity"] = "Medium";
  if (intake.packingDensity === "heavy" || intake.hasSpecialtyItems) complexity = "High";
  if (intake.packingDensity === "light" && !intake.hasSpecialtyItems) complexity = "Low";

  const specialConditions: string[] = [];
  if (intake.packingService === "partial" || intake.packingService === "full") {
    specialConditions.push(packingServiceLabel(intake.packingService));
  }
  if (intake.origin.access.entrySteps === "Yes" || intake.destination.access.entrySteps === "Yes") {
    specialConditions.push("Stairs");
  }
  const longWalk = (v: string) => v.includes("100") || v.includes("200") || v.includes("300");
  if (longWalk(intake.origin.access.walk ?? "") || longWalk(intake.destination.access.walk ?? "")) {
    specialConditions.push("Long carry");
  }
  if (intake.appliances.length > 0) {
    specialConditions.push(`${intake.appliances.reduce((s, a) => s + a.quantity, 0)} appliances`);
  }
  if (intake.origin.access.elevator || intake.destination.access.elevator) {
    specialConditions.push("Apartment / elevator");
  }
  if (intake.origin.access.coi?.includes("Yes")) specialConditions.push("COI required");
  if (intake.hasTimingComplexity) specialConditions.push("Timing constraints");

  return {
    scope,
    complexity,
    crewRecommendation: ops.crewNeeded,
    estimatedDuration: ops.estimatedHours,
    specialConditions: specialConditions.length ? specialConditions : ["None flagged"],
    aiConfidence: ops.quoteConfidence ?? "—",
  };
}

export function getSuggestedJobDays(move: MoveRecord): SuggestedJobDay[] {
  if (move.jobDays.length > 0) {
    return move.jobDays.map((d) => {
      const parts = [d.crewSummary, d.truckSummary].filter(Boolean);
      const suffix =
        d.status === "proposed"
          ? " · on quote"
          : d.status === "cancelled"
            ? " · cancelled"
            : "";
      return {
        id: d.id,
        label: d.label,
        recommendation: (parts.join(" · ") || jobDayStatusLabel(d.status)) + suffix,
        dateHint: d.date ? formatMoveDate(d.date) : "TBD",
      };
    });
  }

  const date = move.intake.moveDate || move.preferredDate;
  const ops = getMoveOperationalSummary(move);
  const suggestions: SuggestedJobDay[] = [];

  if (move.intake.packingService === "partial" || move.intake.packingService === "full") {
    suggestions.push({
      id: "sug-pack",
      label: "Day 1 — Packing",
      recommendation: `2 movers · proposed`,
      dateHint: formatMoveDate(date),
    });
  }

  suggestions.push({
    id: "sug-move",
    label: "Day 1 — Move",
    recommendation: `${ops.crewNeeded.replace(" movers", "")} movers · 1 truck`,
    dateHint: formatMoveDate(date),
  });

  return suggestions;
}

export function getContextualQuickActions(
  move: MoveRecord,
): { id: MoveQuickActionId; label: string; primary?: boolean }[] {
  if (isMoveLost(move)) {
    return [
      { id: "note", label: "Add note" },
      { id: "call", label: "Re-open move", primary: true },
    ];
  }

  const actions = getMoveQuickActions(move);
  return actions.map((a, i) => ({
    ...a,
    primary: i === 0 && a.id === "call",
  }));
}

export function getProposalStatusRows(move: MoveRecord) {
  const rows: { label: string; value: string; status?: "ok" | "pending" | "warn" }[] = [];
  const ops = getMoveOperationalSummary(move);
  const stage = move.pipelineStage;

  if (stage === "quote_sent" || stage === "needs_contract" || stage === "booked" || stage === "completed") {
    rows.push({
      label: "Quote",
      value: stage === "quote_sent" ? "Sent to client" : "Accepted",
      status: "ok",
    });
  } else {
    rows.push({ label: "Quote", value: "Not sent yet", status: "pending" });
  }

  const nextFu = getNextOpenFollowUp(move);
  if (nextFu && !isMoveLost(move)) {
    const overdue = moveHasOverdueFollowUp(move);
    rows.push({
      label: "Follow-up",
      value: overdue ? "Overdue" : formatMoveDate(nextFu.dueAt.slice(0, 10)),
      status: overdue ? "warn" : "pending",
    });
  }

  rows.push({
    label: "Deposit",
    value: stage === "needs_contract" ? "Awaiting" : stage === "booked" || stage === "completed" ? "Received" : "—",
    status: stage === "needs_contract" ? "pending" : "ok",
  });

  rows.push({
    label: "Pricing",
    value: `${ops.estimatedRevenue} · ${ops.aiQuoteRecommendation}`,
    status: "ok",
  });

  if (move.jobDays.length > 0) {
    const proposed = move.jobDays.filter((d) => d.status === "proposed").length;
    rows.push({
      label: "Job plan",
      value:
        proposed > 0
          ? `${move.jobDays.length} day(s) · ${proposed} on quote`
          : `${move.jobDays.length} day(s) scheduled`,
      status: proposed > 0 && stage !== "booked" ? "pending" : "ok",
    });
  }

  return rows;
}

export { getPipelineStage as getLifecycleStage };
