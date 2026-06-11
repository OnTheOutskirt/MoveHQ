import { MOCK_MOVES } from "@/lib/moves/mock-data";
import { normalizeMoveCrewFeedback } from "@/lib/moves/move-feedback-portal";
import type { MoveRecord } from "@/lib/moves/types";

const MOVES_SESSION_KEY = "jm-app.moves.v4";

export { MOVES_SESSION_KEY };

const MOCK_BY_ID = new Map(MOCK_MOVES.map((move) => [move.id, move]));

/** Merge persisted moves with mock seeds (e.g. demo crew feedback on completed moves). */
export function hydrateStoredMoves(moves: MoveRecord[]): MoveRecord[] {
  return moves.map((move) => {
    const normalized = normalizeMoveCrewFeedback(move.crewFeedback);
    const mockSeed = MOCK_BY_ID.get(move.id)?.crewFeedback;
    const crewFeedback = normalized ?? mockSeed ?? null;

    return {
      ...move,
      quoteDiscount: move.quoteDiscount ?? null,
      ...(crewFeedback ? { crewFeedback } : {}),
    };
  });
}

export function readMovesSession(): MoveRecord[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(MOVES_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MoveRecord[];
    if (!Array.isArray(parsed)) return null;
    return hydrateStoredMoves(parsed);
  } catch {
    return null;
  }
}

/** Cheap change detection — avoids full JSON.stringify when nothing material changed. */
export function movesSessionFingerprint(moves: MoveRecord[]): string {
  let stamp = `${moves.length}`;
  for (const move of moves) {
    const feedbackAt = move.crewFeedback?.submittedAt ?? "";
    stamp += `|${move.id}:${move.updatedAt}:${move.pipelineStage}:${feedbackAt}`;
  }
  return stamp;
}

export function writeMovesSession(moves: MoveRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(MOVES_SESSION_KEY, JSON.stringify(moves));
  } catch {
    // ignore quota / private mode
  }
}

export function initialMovesState(): MoveRecord[] {
  return hydrateStoredMoves([...MOCK_MOVES]);
}
