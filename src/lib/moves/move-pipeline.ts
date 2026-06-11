import { buildLostReasonDisplay, type MarkLostPayload } from "./lost-reasons";
import {
  hasEnabledStageAutomations,
  mergeAutomationFollowUps,
} from "@/lib/settings/pipeline-automation-runtime";
import { syncFollowUpDue, createFollowUp, defaultFollowUpForStage } from "./move-follow-ups";
import type {
  MoveConditionStatus,
  MoveRecord,
  MoveStatus,
  PipelineStageId,
  WaitingSubstage,
} from "./types";
import { WAITING_SUBSTAGES } from "./types";
import {
  catalogMoveDetailPipelineStageLabel,
  catalogPipelineBoardStageIds,
  catalogPipelineStageLabel,
  catalogPipelineStageStyle,
  catalogWaitingSubstageBadge,
  catalogWaitingSubstageLabel,
  catalogWaitingSubstageIds,
  catalogAllPipelineStageIds,
} from "@/lib/settings/field-catalog-runtime";
import type { PipelineStageStyle } from "@/lib/settings/field-catalog-types";

export type { PipelineStageStyle };

export { WAITING_SUBSTAGES };

export const PIPELINE_STAGES: { id: PipelineStageId; label: string; description: string }[] = [
  { id: "new_lead", label: "New Lead", description: "Just came in — assign rep and first contact" },
  {
    id: "waiting",
    label: "Waiting",
    description: "Gathering info, walkthrough needed, or visit scheduled",
  },
  { id: "quote_sent", label: "Quote Sent", description: "Proposal out to client" },
  { id: "needs_contract", label: "Needs Contract", description: "Awaiting contract or deposit" },
  { id: "booked", label: "Booked", description: "Booked — schedule, crew, and move execution" },
  { id: "completed", label: "Completed", description: "Move finished — close-out & billing" },
];

const PRE_BOOK_PIPELINE_STAGES: PipelineStageId[] = [
  "new_lead",
  "waiting",
  "quote_sent",
  "needs_contract",
];

/** True until the move is booked (or completed). */
export function isPreBookPipelineStage(stage: PipelineStageId): boolean {
  return PRE_BOOK_PIPELINE_STAGES.includes(stage);
}

export const WAITING_SUBSTAGE_CONFIG: Record<
  WaitingSubstage,
  { label: string; description: string; badge: string }
> = {
  needs_info: {
    label: "Needs Info",
    description: "Missing details before we can quote",
    badge: "bg-blue-50 text-blue-800",
  },
  needs_walkthrough: {
    label: "Needs Walkthrough",
    description: "Site visit or video walkthrough required",
    badge: "bg-indigo-50 text-indigo-800",
  },
  walkthrough_scheduled: {
    label: "Walkthrough Scheduled",
    description: "Visit on calendar — complete then quote",
    badge: "bg-violet-50 text-violet-800",
  },
};

export const pipelineStageConfig: Record<PipelineStageId, PipelineStageStyle> = {
  new_lead: {
    label: "New Lead",
    description: "Just came in — assign rep and first contact",
    badge: "bg-slate-100 text-slate-700",
    column: "border-slate-200 bg-slate-50/80",
    dot: "bg-slate-400",
  },
  waiting: {
    label: "Waiting",
    description: "Needs info, walkthrough, or scheduled visit",
    badge: "bg-blue-50 text-blue-800",
    column: "border-blue-100 bg-blue-50/50",
    dot: "bg-blue-500",
  },
  quote_sent: {
    label: "Quote Sent",
    description: "Proposal out to client",
    badge: "bg-violet-50 text-violet-800",
    column: "border-violet-100 bg-violet-50/50",
    dot: "bg-violet-500",
  },
  needs_contract: {
    label: "Needs Contract",
    description: "Awaiting contract or deposit",
    badge: "bg-amber-50 text-amber-900",
    column: "border-amber-100 bg-amber-50/50",
    dot: "bg-amber-500",
  },
  booked: {
    label: "Booked",
    description: "Schedule, crew, and active move",
    badge: "bg-emerald-50 text-emerald-800",
    column: "border-emerald-100 bg-emerald-50/50",
    dot: "bg-emerald-500",
  },
  completed: {
    label: "Completed",
    description: "Finished — billing & reviews",
    badge: "bg-slate-200 text-slate-800",
    column: "border-slate-200 bg-slate-50/80",
    dot: "bg-slate-600",
  },
};

/** @deprecated Use allPipelineStageIds() — kept for legacy imports. */
export const MOVES_PIPELINE_STAGES: PipelineStageId[] = [...PIPELINE_STAGES.map((s) => s.id)];

/** All pipeline stage ids from field catalog (order preserved). */
export function allPipelineStageIds(): PipelineStageId[] {
  return catalogAllPipelineStageIds() as PipelineStageId[];
}

/** Columns on /moves pipeline board — from field catalog (excludes hideFromBoard). */
export function getMovesPipelineBoardStages(): PipelineStageId[] {
  return catalogPipelineBoardStageIds() as PipelineStageId[];
}

export type PipelinePhase = "sales" | "operations" | "post";

export type PrimaryWorkspaceMode = "quote" | "schedule" | "dispatch" | "post";

export function pipelineStageLabel(stage: PipelineStageId | string): string {
  return catalogPipelineStageLabel(stage);
}

export function pipelineStageConfigFor(stage: PipelineStageId | string): PipelineStageStyle {
  return catalogPipelineStageStyle(stage);
}

/** @deprecated Use pipelineStageConfigFor — kept for legacy imports. */
export function getPipelineStageConfig(stage: PipelineStageId): PipelineStageStyle {
  return catalogPipelineStageStyle(stage);
}

/** Move detail stepper & overview — e.g. New Lead, Move Complete (not Lead / Done / Completed). */
export const MOVE_DETAIL_PIPELINE_LABELS: Record<PipelineStageId, string> = {
  new_lead: "New Lead",
  waiting: "Waiting",
  quote_sent: "Quote Sent",
  needs_contract: "Needs Contract",
  booked: "Booked",
  completed: "Move Complete",
};

export function moveDetailPipelineStageLabel(stage: PipelineStageId | string): string {
  return catalogMoveDetailPipelineStageLabel(stage);
}

export function waitingSubstageLabel(sub: WaitingSubstage | string): string {
  return catalogWaitingSubstageLabel(sub);
}

export function waitingSubstageBadge(sub: WaitingSubstage | string): string {
  return catalogWaitingSubstageBadge(sub);
}

function stageDisplayLabel(
  move: MoveRecord,
  labelFor: (stage: PipelineStageId) => string,
): string {
  if (move.conditionStatus === "lost" && move.lostFromStage) {
    return `Lost · was ${labelFor(move.lostFromStage)}`;
  }
  if (move.conditionStatus === "cancelled") {
    return `Cancelled · was ${labelFor(move.pipelineStage)}`;
  }
  if (move.conditionStatus === "on_hold") {
    return `On hold · ${labelFor(move.pipelineStage)}`;
  }
  if (move.conditionStatus === "needs_review") {
    return `${labelFor(move.pipelineStage)} · needs review`;
  }
  if (move.conditionStatus === "closed") {
    return `Closed · ${labelFor(move.pipelineStage)}`;
  }
  if (move.pipelineStage === "waiting" && move.waitingSubstage) {
    return `${labelFor("waiting")} · ${waitingSubstageLabel(move.waitingSubstage)}`;
  }
  return labelFor(move.pipelineStage);
}

/** Full stage label including waiting sub-status. */
export function moveStageDisplayLabel(move: MoveRecord): string {
  return stageDisplayLabel(move, pipelineStageLabel);
}

/** Same as moveStageDisplayLabel but uses move-detail pipeline names. */
export function moveDetailStageDisplayLabel(move: MoveRecord): string {
  return stageDisplayLabel(move, moveDetailPipelineStageLabel);
}

export function isPipelineStage(value: string): value is PipelineStageId {
  return catalogAllPipelineStageIds().includes(value);
}

export function isWaitingSubstage(value: string): value is WaitingSubstage {
  return catalogWaitingSubstageIds().includes(value);
}

export function pipelineStageIndex(stage: PipelineStageId): number {
  return catalogAllPipelineStageIds().indexOf(stage);
}

export function getPipelineStage(move: MoveRecord): PipelineStageId {
  return move.pipelineStage;
}

/** @deprecated Use getPipelineStage */
export const getLifecycleStage = getPipelineStage;

export function isMoveLost(move: MoveRecord): boolean {
  return move.conditionStatus === "lost";
}

export function isMoveCancelled(move: MoveRecord): boolean {
  return move.conditionStatus === "cancelled";
}

export function getPipelinePhase(stage: PipelineStageId): PipelinePhase {
  if (stage === "completed") return "post";
  if (stage === "booked") return "operations";
  return "sales";
}

export function getPrimaryWorkspaceMode(move: MoveRecord): PrimaryWorkspaceMode {
  if (move.conditionStatus === "lost" || move.conditionStatus === "cancelled") return "post";
  const stage = move.pipelineStage;
  if (stage === "completed") return "post";
  if (stage === "booked") {
    if (move.jobDays.some((d) => d.status === "in_progress")) return "dispatch";
    return "schedule";
  }
  return "quote";
}

export function primaryWorkspaceTitle(mode: PrimaryWorkspaceMode): string {
  switch (mode) {
    case "quote":
      return "Quote & proposal";
    case "schedule":
      return "Scheduling & crew";
    case "dispatch":
      return "Active move";
    case "post":
      return "Complete & close-out";
  }
}

export function statusForPipelineStage(stage: PipelineStageId, move?: MoveRecord): MoveStatus {
  if (move?.conditionStatus === "lost") return "lost";
  if (move?.conditionStatus === "cancelled") return "lost";
  if (move?.conditionStatus === "closed") return "completed";
  switch (stage) {
    case "new_lead":
      return "new_request";
    case "waiting":
      return "waiting";
    case "quote_sent":
      return "quote_sent";
    case "needs_contract":
      return "needs_contract";
    case "booked":
      if (move?.jobDays.some((d) => d.status === "in_progress")) return "in_progress";
      if (move?.jobDays.some((d) => d.status === "scheduled")) return "scheduling";
      return "booked";
    case "completed":
      return "completed";
  }
}

export function conditionForPipelineStage(
  stage: PipelineStageId,
  move?: MoveRecord,
): MoveConditionStatus {
  if (move?.conditionStatus === "lost") return "lost";
  if (move?.conditionStatus === "cancelled") return "cancelled";
  if (move?.conditionStatus === "on_hold") return "on_hold";
  if (move?.conditionStatus === "needs_review") return "needs_review";
  if (stage === "completed") return move?.conditionStatus === "closed" ? "closed" : "active";
  return "active";
}

export function applyPipelineStage(
  move: MoveRecord,
  stage: PipelineStageId,
  waitingSubstage?: WaitingSubstage | null,
): MoveRecord {
  const substage =
    stage === "waiting"
      ? waitingSubstage ?? move.waitingSubstage ?? "needs_info"
      : null;
  const patched = { ...move, pipelineStage: stage, waitingSubstage: substage };
  const next = {
    ...patched,
    status: statusForPipelineStage(stage, patched),
    conditionStatus: conditionForPipelineStage(stage, patched),
  };
  const withAutomations = mergeAutomationFollowUps(next, stage);
  if (withAutomations.followUps.length > next.followUps.length || hasEnabledStageAutomations(stage)) {
    return syncFollowUpDue(withAutomations);
  }
  const template = defaultFollowUpForStage(next, stage);
  if (template && !getOpenFollowUpsFromMove(next)) {
    const withFu = {
      ...next,
      followUps: [...next.followUps, createFollowUp(next, template)],
    };
    return syncFollowUpDue(withFu);
  }
  return syncFollowUpDue(withAutomations);
}

function getOpenFollowUpsFromMove(move: MoveRecord) {
  return move.followUps.filter((f) => f.status === "open");
}

export function applyWaitingSubstage(move: MoveRecord, substage: WaitingSubstage): MoveRecord {
  if (move.pipelineStage !== "waiting") {
    return applyPipelineStage(move, "waiting", substage);
  }
  return {
    ...move,
    waitingSubstage: substage,
    status: statusForPipelineStage("waiting", { ...move, waitingSubstage: substage }),
  };
}

export function markMoveLost(
  move: MoveRecord,
  payload: MarkLostPayload,
  at = new Date().toISOString(),
): MoveRecord {
  const cleared = move.followUps.map((f) =>
    f.status === "open" ? { ...f, status: "skipped" as const } : f,
  );
  return syncFollowUpDue({
    ...move,
    lostAt: at,
    lostFromStage: move.pipelineStage,
    lostQualification: payload.qualification,
    lostReasonId: payload.reasonId,
    lostNotes: payload.notes?.trim() || null,
    lostReason: buildLostReasonDisplay(payload),
    conditionStatus: "lost",
    status: "lost",
    followUps: cleared,
  });
}

export function reopenLostMove(move: MoveRecord): MoveRecord {
  const stage = move.lostFromStage ?? move.pipelineStage;
  const patched = {
    ...move,
    lostAt: null,
    lostFromStage: null,
    lostReason: null,
    lostQualification: null,
    lostReasonId: null,
    lostNotes: null,
    pipelineStage: stage,
    conditionStatus: "active" as const,
  };
  return syncFollowUpDue({
    ...patched,
    status: statusForPipelineStage(stage, patched),
  });
}

export function hasProposedJobDays(move: MoveRecord): boolean {
  return move.jobDays.some((d) => d.status === "proposed");
}

export function hasConfirmedJobDays(move: MoveRecord): boolean {
  return move.jobDays.some((d) => d.status !== "proposed" && d.status !== "cancelled");
}

export { moveHasOverdueFollowUp as isFollowUpOverdue } from "./move-follow-ups";
export { moveHasOpenFollowUp as moveNeedsFollowUp } from "./move-follow-ups";

export type MoveDetailSectionId =
  | "scope_of_work"
  | "move_plan"
  | "quote_contract"
  | "operations"
  | "profitability"
  | "activity"
  | "claims";

export function emphasizedSections(phase: PipelinePhase): MoveDetailSectionId[] {
  switch (phase) {
    case "sales":
      return ["scope_of_work", "move_plan", "quote_contract", "profitability", "activity"];
    case "operations":
      return ["move_plan", "operations", "quote_contract", "activity"];
    case "post":
      return ["operations", "profitability", "activity", "claims"];
  }
}
