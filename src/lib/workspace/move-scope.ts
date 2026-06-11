import { DEFAULT_COMPANY_ID, DEFAULT_PRIMARY_LOCATION_ID } from "./constants";
import { normalizeLocationId } from "./storage";
import type { MoveRecord } from "@/lib/moves/types";

export function ensureMoveWorkspaceFields(
  move: MoveRecord,
  companyId: string = DEFAULT_COMPANY_ID,
  fallbackLocationId: string = DEFAULT_PRIMARY_LOCATION_ID,
): MoveRecord {
  return {
    ...move,
    companyId: move.companyId ?? companyId,
    locationId: normalizeLocationId(move.locationId ?? fallbackLocationId),
  };
}

export function ensureMovesWorkspaceFields(
  moves: MoveRecord[],
  companyId?: string,
  fallbackLocationId?: string,
): MoveRecord[] {
  return moves.map((m) => ensureMoveWorkspaceFields(m, companyId, fallbackLocationId));
}
