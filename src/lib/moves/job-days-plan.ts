import { formatMoveDate } from "./format";
import { getSuggestedJobDays } from "./move-workspace";
import type { MoveJobDay, MoveRecord, PipelineStageId } from "./types";

const PRE_BOOK_STAGES: PipelineStageId[] = [
  "new_lead",
  "waiting",
  "quote_sent",
  "needs_contract",
];

export function isPreBookPipelineStage(stage: PipelineStageId): boolean {
  return PRE_BOOK_STAGES.includes(stage);
}

export type JobDayPlanRow =
  | { kind: "job_day"; day: MoveJobDay }
  | {
      kind: "suggestion";
      id: string;
      label: string;
      dateHint?: string;
      recommendation: string;
    };

/** Job days on the move, or intake-based suggestions when none exist yet. */
export function getJobDayPlanRows(move: MoveRecord): JobDayPlanRow[] {
  if (move.jobDays.length > 0) {
    return [...move.jobDays]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((day) => ({ kind: "job_day" as const, day }));
  }

  return getSuggestedJobDays(move).map((s) => ({
    kind: "suggestion" as const,
    id: s.id,
    label: s.label,
    dateHint: s.dateHint,
    recommendation: s.recommendation,
  }));
}

export function jobDayPlanSummary(move: MoveRecord): string {
  const count = move.jobDays.length;
  if (count === 0) return "Not planned yet";
  const proposed = move.jobDays.filter((d) => d.status === "proposed").length;
  if (proposed === count) return `${count} day${count === 1 ? "" : "s"} on quote`;
  if (proposed > 0) return `${count} days · ${proposed} on quote`;
  return `${count} day${count === 1 ? "" : "s"} planned`;
}

export function formatJobDayDate(date: string): string {
  return date ? formatMoveDate(date) : "Date TBD";
}
