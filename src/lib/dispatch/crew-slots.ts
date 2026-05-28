import { DEFAULT_TERMINOLOGY } from "@/lib/terminology/defaults";
import { roleSlotLabel } from "@/lib/terminology/labels";
import type { TerminologySettings } from "@/lib/terminology/types";
import type {
  CrewRole,
  DispatchCrewMember,
  DispatchJob,
  DispatchJobAssignment,
} from "./types";

export type CrewSlotKind = "skipper" | "driver" | "mover";

export type CrewSlotRef =
  | { kind: "skipper" }
  | { kind: "driver"; index: number }
  | { kind: "mover"; index: number };

export type CrewSlotDefinition = CrewSlotRef & {
  label: string;
};

export function emptyCrewAssignment(): Pick<
  DispatchJobAssignment,
  "skipperId" | "driverIds" | "moverIds"
> {
  return { skipperId: null, driverIds: [], moverIds: [] };
}

export function jobCrewSlots(
  job: DispatchJob,
  terms: TerminologySettings = DEFAULT_TERMINOLOGY,
): CrewSlotDefinition[] {
  const slots: CrewSlotDefinition[] = [];
  if (job.crewSizeNeeded < 1) return slots;

  slots.push({
    kind: "skipper",
    label: roleSlotLabel(terms, "skipper", 0, 1),
  });

  const driverCount = Math.min(job.trucksNeeded, Math.max(0, job.crewSizeNeeded - 1));
  for (let i = 0; i < driverCount; i++) {
    slots.push({
      kind: "driver",
      index: i,
      label: roleSlotLabel(terms, "driver", i, driverCount),
    });
  }

  const moverCount = Math.max(0, job.crewSizeNeeded - 1 - driverCount);
  for (let i = 0; i < moverCount; i++) {
    slots.push({
      kind: "mover",
      index: i,
      label: roleSlotLabel(terms, "mover", i, moverCount),
    });
  }

  return slots;
}

export function ensureDriverMoverLengths(
  job: DispatchJob,
  assignment: DispatchJobAssignment,
): DispatchJobAssignment {
  const driverCount = Math.min(job.trucksNeeded, Math.max(0, job.crewSizeNeeded - 1));
  const moverCount = Math.max(0, job.crewSizeNeeded - 1 - driverCount);

  const driverIds = [...assignment.driverIds];
  while (driverIds.length < driverCount) driverIds.push(null);
  if (driverIds.length > driverCount) driverIds.length = driverCount;

  const moverIds = [...assignment.moverIds];
  while (moverIds.length < moverCount) moverIds.push(null);
  if (moverIds.length > moverCount) moverIds.length = moverCount;

  return { ...assignment, driverIds, moverIds };
}

export function getSlotCrewId(
  assignment: DispatchJobAssignment,
  slot: CrewSlotRef,
): string | null {
  if (slot.kind === "skipper") return assignment.skipperId;
  if (slot.kind === "driver") return assignment.driverIds[slot.index] ?? null;
  return assignment.moverIds[slot.index] ?? null;
}

export function allCrewIdsFromAssignment(assignment: DispatchJobAssignment): string[] {
  const ids: string[] = [];
  if (assignment.skipperId) ids.push(assignment.skipperId);
  for (const id of assignment.driverIds) {
    if (id) ids.push(id);
  }
  for (const id of assignment.moverIds) {
    if (id) ids.push(id);
  }
  return ids;
}

export function setSlotCrew(
  job: DispatchJob,
  assignment: DispatchJobAssignment,
  slot: CrewSlotRef,
  crewId: string | null,
): DispatchJobAssignment {
  let next: DispatchJobAssignment = {
    ...ensureDriverMoverLengths(job, assignment),
    skipperId: assignment.skipperId,
    driverIds: [...assignment.driverIds],
    moverIds: [...assignment.moverIds],
  };

  const strip = (id: string | null) => {
    if (!id) return;
    if (next.skipperId === id) next = { ...next, skipperId: null };
    next = {
      ...next,
      driverIds: next.driverIds.map((d) => (d === id ? null : d)),
      moverIds: next.moverIds.map((m) => (m === id ? null : m)),
    };
  };

  if (crewId) strip(crewId);

  if (slot.kind === "skipper") {
    next = { ...next, skipperId: crewId };
  } else if (slot.kind === "driver") {
    const driverIds = [...next.driverIds];
    driverIds[slot.index] = crewId;
    next = { ...next, driverIds };
  } else {
    const moverIds = [...next.moverIds];
    moverIds[slot.index] = crewId;
    next = { ...next, moverIds };
  }

  return ensureDriverMoverLengths(job, next);
}

export function countFilledCrewSlots(
  job: DispatchJob,
  assignment: DispatchJobAssignment,
): { filled: number; required: number } {
  const slots = jobCrewSlots(job);
  const normalized = ensureDriverMoverLengths(job, assignment);
  let filled = 0;
  for (const slot of slots) {
    if (getSlotCrewId(normalized, slot)) filled += 1;
  }
  return { filled, required: slots.length };
}

export function isJobCrewComplete(job: DispatchJob, assignment: DispatchJobAssignment): boolean {
  const { filled, required } = countFilledCrewSlots(job, assignment);
  return required > 0 && filled >= required;
}

export function requiredRoleForSlot(slot: CrewSlotRef): CrewRole | null {
  if (slot.kind === "skipper") return "skipper";
  if (slot.kind === "driver") return "driver";
  return null;
}

export function crewMemberHasRole(member: DispatchCrewMember, role: CrewRole): boolean {
  return member.roles.includes(role);
}

export function crewFitsSlot(member: DispatchCrewMember, slot: CrewSlotRef): boolean {
  const role = requiredRoleForSlot(slot);
  if (!role) return true;
  return crewMemberHasRole(member, role);
}

export function skippersNeededForJob(job: DispatchJob): number {
  return job.crewSizeNeeded >= 1 ? 1 : 0;
}

export function driversNeededForJob(job: DispatchJob): number {
  return Math.min(job.trucksNeeded, Math.max(0, job.crewSizeNeeded - 1));
}

export function countFilledRoleSlots(
  job: DispatchJob,
  assignment: DispatchJobAssignment,
): { skippers: number; drivers: number } {
  const normalized = ensureDriverMoverLengths(job, assignment);
  const drivers = normalized.driverIds.filter((id): id is string => Boolean(id)).length;
  return {
    skippers: normalized.skipperId ? 1 : 0,
    drivers,
  };
}
