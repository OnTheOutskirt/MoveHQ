import { formatMoveDate } from "./format";
import type { MoveRecord } from "./types";

/** Primary move date(s) for headers — job days when planned, else intake/preferred. */
export function formatMoveDatesDisplay(move: MoveRecord): string {
  const dates = [...new Set(move.jobDays.map((d) => d.date).filter(Boolean))].sort();

  if (dates.length === 1) {
    return formatMoveDate(dates[0]!);
  }

  if (dates.length > 1) {
    return dates.map((d) => formatMoveDate(d)).join(" · ");
  }

  const fallback = move.intake.moveDate || move.preferredDate;
  return fallback ? formatMoveDate(fallback) : "—";
}

export function moveDatesCount(move: MoveRecord): number {
  const fromDays = new Set(move.jobDays.map((d) => d.date).filter(Boolean)).size;
  return fromDays > 0 ? fromDays : move.intake.moveDate || move.preferredDate ? 1 : 0;
}

/** Overview meta label — plural when multiple job days on Move Plan. */
export function jobDateMetaLabel(move: MoveRecord): string {
  const n = move.jobDays.length;
  if (n > 1) return "Job dates";
  return "Job date";
}
