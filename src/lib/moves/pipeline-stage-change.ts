import { moveDetailPipelineStageLabel, pipelineStageLabel } from "./move-pipeline";
import type { MoveRecord, PipelineStageId, WaitingSubstage } from "./types";
import { hasBookedWalkthrough } from "./walkthroughs";

const PIPELINE_ORDER: PipelineStageId[] = [
  "new_lead",
  "waiting",
  "quote_sent",
  "needs_contract",
  "booked",
  "completed",
];

const STAGE_ADVANCE_HINT: Record<PipelineStageId, string> = {
  new_lead: "when a new lead is created",
  waiting: "when you move a lead into waiting with a reason",
  quote_sent: "when you send a quote from the move",
  needs_contract: "when the customer requests a contract",
  booked: "when the move is signed and scheduled",
  completed: "when the job finishes in operations",
};

/** Specific copy for high-traffic transitions — falls back to generated text. */
const CONFIRM_COPY: Partial<
  Record<`${PipelineStageId}->${PipelineStageId}`, { title: string; description: string }>
> = {
  "waiting->quote_sent": {
    title: "Move to Quote Sent manually?",
    description:
      "Quote Sent usually updates when you send a quote from the move. Are you sure you want to mark Quote Sent without sending?",
  },
  "quote_sent->needs_contract": {
    title: "Move to Needs Contract manually?",
    description:
      "Needs Contract normally updates when the customer requests a contract. Are you sure you want to set it now?",
  },
  "needs_contract->booked": {
    title: "Move to Booked manually?",
    description:
      "Booked usually happens when the move is signed and scheduled. Are you sure you want to mark this move Booked?",
  },
  "booked->completed": {
    title: "Move to Completed manually?",
    description:
      "Completed normally updates when the job finishes in operations. Are you sure you want to mark this move Completed?",
  },
};

function pipelineStageOrder(stage: PipelineStageId): number {
  return PIPELINE_ORDER.indexOf(stage);
}

function skippedStageLabels(from: PipelineStageId, to: PipelineStageId): string[] {
  const fromIdx = pipelineStageOrder(from);
  const toIdx = pipelineStageOrder(to);
  if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return [];
  const step = fromIdx < toIdx ? 1 : -1;
  const skipped: string[] = [];
  for (let i = fromIdx + step; i !== toIdx; i += step) {
    skipped.push(moveDetailPipelineStageLabel(PIPELINE_ORDER[i]));
  }
  return skipped;
}

export function requiresWaitingReasonOnStageChange(
  from: PipelineStageId,
  to: PipelineStageId,
): boolean {
  return to === "waiting" && from !== "waiting";
}

export function requiresWalkthroughScheduledSubstageConfirm(
  move: MoveRecord,
  substage: WaitingSubstage,
): boolean {
  return substage === "walkthrough_scheduled" && !hasBookedWalkthrough(move);
}

export function walkthroughScheduledWithoutBookingConfirm(): {
  title: string;
  description: string;
} {
  return {
    title: "No walkthrough scheduled",
    description:
      "There is no walkthrough currently scheduled on this move. Are you sure you want to continue?",
  };
}

/** Every manual stage change needs confirmation except new lead → waiting (reason picker). */
export function requiresManualStageConfirm(
  from: PipelineStageId,
  to: PipelineStageId,
): boolean {
  if (from === to) return false;
  if (requiresWaitingReasonOnStageChange(from, to)) return false;
  return true;
}

function buildGeneratedConfirm(
  from: PipelineStageId,
  to: PipelineStageId,
): { title: string; description: string } {
  const fromLabel = moveDetailPipelineStageLabel(from);
  const toLabel = moveDetailPipelineStageLabel(to);
  const fromIdx = pipelineStageOrder(from);
  const toIdx = pipelineStageOrder(to);
  const skipped = skippedStageLabels(from, to);

  if (skipped.length > 0) {
    const skippedList =
      skipped.length === 1
        ? skipped[0]
        : skipped.length === 2
          ? `${skipped[0]} and ${skipped[1]}`
          : `${skipped.slice(0, -1).join(", ")}, and ${skipped[skipped.length - 1]}`;

    return {
      title: `Skip ahead to ${toLabel}?`,
      description: `This skips ${skippedList} and jumps from ${fromLabel} to ${toLabel}. Pipeline stages normally advance one step at a time (${STAGE_ADVANCE_HINT[to]}). Are you sure?`,
    };
  }

  if (toIdx > fromIdx) {
    return {
      title: `Move to ${toLabel} manually?`,
      description: `${toLabel} normally updates ${STAGE_ADVANCE_HINT[to]}. Are you sure you want to move from ${fromLabel} to ${toLabel}?`,
    };
  }

  return {
    title: `Move back to ${toLabel}?`,
    description: `Moving backward from ${fromLabel} to ${toLabel} is unusual and can affect follow-ups and automations. Are you sure?`,
  };
}

export function getManualStageChangeConfirm(
  from: PipelineStageId,
  to: PipelineStageId,
): { title: string; description: string } | null {
  if (!requiresManualStageConfirm(from, to)) return null;

  const key = `${from}->${to}` as `${PipelineStageId}->${PipelineStageId}`;
  return CONFIRM_COPY[key] ?? buildGeneratedConfirm(from, to);
}

export function waitingReasonDialogTitle(): string {
  return "Why is this move waiting?";
}

export function waitingReasonDialogDescription(): string {
  return `Select a waiting reason before moving this move to ${pipelineStageLabel("waiting")}.`;
}
