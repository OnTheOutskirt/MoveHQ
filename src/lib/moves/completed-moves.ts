import type { MoveRecord } from "./types";

export function isCompletedMove(move: MoveRecord): boolean {
  return move.pipelineStage === "completed";
}

export function searchCompletedMoves(
  moves: MoveRecord[],
  query: string,
  limit = 8,
): MoveRecord[] {
  const completed = moves
    .filter(isCompletedMove)
    .slice()
    .sort((a, b) => b.preferredDate.localeCompare(a.preferredDate));

  const q = query.trim().toLowerCase();
  if (!q) return completed.slice(0, limit);

  return completed
    .filter((move) => {
      const haystack = [
        move.reference,
        move.customerName,
        move.originAddress,
        move.destinationAddress,
        move.moveType,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    })
    .slice(0, limit);
}
