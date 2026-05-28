import {
  activeCrewFromList,
  activeTrucksFromList,
  FLEET_CREW,
  FLEET_TRUCKS,
} from "@/lib/operations/fleet";
import type { DispatchCrewMember } from "./types";

/** @deprecated Use useFleet().activeCrewForDispatch() */
export const DISPATCH_CREW_ROSTER = activeCrewFromList(FLEET_CREW);

/** @deprecated Use useFleet().activeTrucksForDispatch() */
export const DISPATCH_TRUCKS = activeTrucksFromList(FLEET_TRUCKS);

export { FLEET_CREW, FLEET_TRUCKS };

/** Match calendar crew-off names to roster ids (fuzzy by first token). */
export function crewOffIdsFromCalendarNames(
  offNames: { name: string }[],
  roster: DispatchCrewMember[],
): string[] {
  const ids: string[] = [];
  for (const off of offNames) {
    const token = off.name.split(/\s+/)[0]?.toLowerCase();
    const match = roster.find((c) => {
      const crewToken = c.name.split(/\s+/)[0]?.toLowerCase();
      return crewToken === token || c.name.toLowerCase().startsWith(off.name.toLowerCase());
    });
    if (match && !ids.includes(match.id)) ids.push(match.id);
  }
  return ids;
}
