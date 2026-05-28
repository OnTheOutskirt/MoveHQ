export const MOVES_VIEW_MODES = ["pipeline", "list"] as const;

export type MovesViewMode = (typeof MOVES_VIEW_MODES)[number];

export function isMovesViewMode(value: string): value is MovesViewMode {
  return MOVES_VIEW_MODES.includes(value as MovesViewMode);
}
