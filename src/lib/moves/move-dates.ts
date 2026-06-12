import { formatMoveDate } from "./format";
import { isPreBookPipelineStage } from "./move-pipeline";
import type { MoveRecord } from "./types";

/** When a move has more than this many job dates, omit the year in compact displays. */
export const COMPACT_MOVE_DATES_THRESHOLD = 4;

/** Sorted unique ISO date keys from job days. */
export function getMoveJobDateKeys(move: MoveRecord): string[] {
  return [...new Set(move.jobDays.map((d) => d.date).filter(Boolean))].sort();
}

function formatMoveDateList(dates: string[]): string {
  const omitYear = dates.length > COMPACT_MOVE_DATES_THRESHOLD;
  return dates.map((d) => formatMoveDate(d, { omitYear })).join(" · ");
}

/** Primary move date(s) for headers — job days when planned, else intake/preferred. */
export function formatMoveDatesDisplay(move: MoveRecord): string {
  const dates = getMoveJobDateKeys(move);

  if (dates.length === 1) {
    return formatMoveDate(dates[0]!);
  }

  if (dates.length > 1) {
    return formatMoveDateList(dates);
  }

  const fallback = move.intake.moveDate || move.preferredDate;
  return fallback ? formatMoveDate(fallback) : "—";
}

export function moveDatesCount(move: MoveRecord): number {
  const fromDays = getMoveJobDateKeys(move).length;
  return fromDays > 0 ? fromDays : move.intake.moveDate || move.preferredDate ? 1 : 0;
}

/** Label for dates in overview — target before book, job dates after. */
export function moveDateFieldLabel(move: MoveRecord): string {
  const n = moveDatesCount(move);
  const booked = !isPreBookPipelineStage(move.pipelineStage);
  if (booked) {
    return n > 1 ? "Job dates" : "Job date";
  }
  return n > 1 ? "Target job dates" : "Target job date";
}

/** @deprecated Use moveDateFieldLabel */
export function jobDateMetaLabel(move: MoveRecord): string {
  return moveDateFieldLabel(move);
}
