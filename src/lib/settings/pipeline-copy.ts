import { getNextAction } from "@/lib/moves/move-workspace";
import type { PipelineStageId, WaitingSubstage } from "@/lib/moves/types";
import type { MoveRecord } from "@/lib/moves/types";

export type PipelineCopyEntry = {
  label: string;
  detail?: string;
};

export type PipelineCopySettings = {
  byStage: Partial<Record<PipelineStageId, PipelineCopyEntry>>;
  waitingBySubstage: Partial<Record<WaitingSubstage, PipelineCopyEntry>>;
};

export function defaultPipelineCopySettings(): PipelineCopySettings {
  return {
    byStage: {
      new_lead: { label: "Make first contact", detail: "New lead — no outreach yet" },
      waiting: { label: "Set waiting reason", detail: "Needs info, walkthrough, or scheduled visit" },
      quote_sent: { label: "Follow up on open proposal" },
      needs_contract: {
        label: "Collect contract & deposit",
        detail: "Client ready to book",
      },
      booked: {
        label: "Confirm crew & calendar",
        detail: "Booked — lock job days from quote",
      },
      completed: { label: "Send final invoice & request review", detail: "Move finished" },
    },
    waitingBySubstage: {
      needs_info: {
        label: "Collect missing details",
        detail: "Cannot send quote until intake is complete",
      },
      needs_walkthrough: {
        label: "Schedule walkthrough",
        detail: "Site visit or video before quoting",
      },
      walkthrough_scheduled: {
        label: "Complete walkthrough, then send quote",
        detail: "Visit on calendar",
      },
    },
  };
}

export function resolveUpNextCopy(
  move: MoveRecord,
  settings: PipelineCopySettings,
): PipelineCopyEntry {
  if (move.pipelineStage === "waiting" && move.waitingSubstage) {
    const custom = settings.waitingBySubstage[move.waitingSubstage];
    if (custom?.label) return custom;
  }
  const custom = settings.byStage[move.pipelineStage];
  if (custom?.label) return custom;
  const fallback = getNextAction(move);
  return { label: fallback.label, detail: fallback.detail };
}
