import type { MoveRecord } from "@/lib/moves/types";

function isEligibleForCalendarPlacement(move: MoveRecord): boolean {
  return (
    move.conditionStatus !== "lost" &&
    move.conditionStatus !== "cancelled" &&
    move.conditionStatus !== "closed"
  );
}

export function searchMovesForCalendar(
  moves: MoveRecord[],
  query: string,
  limit = 10,
): MoveRecord[] {
  const eligible = moves
    .filter(isEligibleForCalendarPlacement)
    .slice()
    .sort((a, b) => b.preferredDate.localeCompare(a.preferredDate));

  const q = query.trim().toLowerCase();
  if (!q) return eligible.slice(0, limit);

  return eligible
    .filter((move) => {
      const haystack = [
        move.reference,
        move.customerName,
        move.customerPhone,
        move.customerEmail,
        move.originAddress,
        move.destinationAddress,
        move.moveType,
        move.assignedRep,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    })
    .slice(0, limit);
}
