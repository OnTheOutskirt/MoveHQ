import { DEMO_CREW_MEMBERS } from "@/lib/crew-app/session";
import type { CrewAppCrewSlot, CrewAppJob } from "@/lib/crew-app/types";

export function resolveCrewIdByName(name: string): string | undefined {
  const exact = DEMO_CREW_MEMBERS.find((m) => m.name === name);
  if (exact) return exact.id;
  return undefined;
}

export function defaultSkipperCrewId(job: CrewAppJob): string | undefined {
  const skipper = job.crew.find((s) => s.role === "skipper");
  if (!skipper) return undefined;
  return resolveCrewIdByName(skipper.name);
}

export function crewSlotKey(slot: CrewAppCrewSlot, index: number): string {
  return `${slot.role}-${slot.name}-${index}`;
}

export type JobCrewAssignee = {
  crewId: string;
  name: string;
  role: string;
};

/** Crew on this job with fleet ids where known. */
export function jobCrewAssignees(
  job: CrewAppJob,
  fleetIdsByName?: Record<string, string>,
): JobCrewAssignee[] {
  return job.crew
    .map((slot, index) => {
      const crewId =
        fleetIdsByName?.[slot.name] ??
        resolveCrewIdByName(slot.name) ??
        crewSlotKey(slot, index);
      return { crewId, name: slot.name, role: slot.role };
    })
    .filter((a, i, arr) => arr.findIndex((x) => x.crewId === a.crewId) === i);
}

export function fleetIdMap(members: { id: string; name: string }[]): Record<string, string> {
  return Object.fromEntries(members.map((m) => [m.name, m.id]));
}
