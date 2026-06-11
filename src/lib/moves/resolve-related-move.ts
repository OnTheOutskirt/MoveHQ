import type { MoveRecord } from "./types";

export function resolveRelatedMove(
  moves: MoveRecord[],
  opts: { moveId?: string; jobRef?: string },
): MoveRecord | undefined {
  if (opts.moveId) {
    const byId = moves.find((m) => m.id === opts.moveId);
    if (byId) return byId;
  }
  const ref = opts.jobRef?.trim().toLowerCase();
  if (ref) {
    return moves.find((m) => m.reference.toLowerCase() === ref);
  }
  return undefined;
}
