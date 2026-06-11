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

export type JobCrewSlotsOptions = {
  skipperAlsoDriver?: boolean;
};

/** Separate driver slots shown in the UI (skipper-as-driver uses one truck). */
export function separateDriverSlotCount(
  job: DispatchJob,
  skipperAlsoDriver?: boolean,
): number {
  const base = Math.min(job.trucksNeeded, Math.max(0, job.crewSizeNeeded - 1));
  return skipperAlsoDriver ? Math.max(0, base - 1) : base;
}

export function jobCrewSlots(
  job: DispatchJob,
  terms: TerminologySettings = DEFAULT_TERMINOLOGY,
  options?: JobCrewSlotsOptions,
): CrewSlotDefinition[] {
  const slots: CrewSlotDefinition[] = [];
  if (job.crewSizeNeeded < 1) return slots;

  const combined = options?.skipperAlsoDriver === true;

  slots.push({
    kind: "skipper",
    label: combined ? "S/D" : roleSlotLabel(terms, "skipper", 0, 1),
  });

  const driverCount = separateDriverSlotCount(job, combined);
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
  const combined = assignment.skipperAlsoDriver === true;
  const driverCount = separateDriverSlotCount(job, combined);
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
  const slots = jobCrewSlots(job, DEFAULT_TERMINOLOGY, {
    skipperAlsoDriver: assignment.skipperAlsoDriver,
  });
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

/** Can fill combined skipper + driver slot (S/D/M or S/D). */
export function crewMemberCanSkipperDrive(member: DispatchCrewMember): boolean {
  return crewMemberHasRole(member, "skipper") && crewMemberHasRole(member, "driver");
}

export function assignmentHasFilledDriver(assignment: DispatchJobAssignment): boolean {
  return assignment.driverIds.some((id) => Boolean(id));
}

export function filledDriverNamesFromAssignment(
  assignment: DispatchJobAssignment,
  roster: DispatchCrewMember[],
): string[] {
  return assignment.driverIds
    .filter((id): id is string => Boolean(id))
    .map((id) => roster.find((member) => member.id === id)?.name)
    .filter((name): name is string => Boolean(name));
}

export function shouldCombineSkipperDriver(
  member: DispatchCrewMember | undefined,
  slot: CrewSlotRef,
  assignment: DispatchJobAssignment,
): boolean {
  if (!member || !crewMemberCanSkipperDrive(member)) return false;
  if (slot.kind !== "skipper" && slot.kind !== "driver") return false;
  if (assignmentHasFilledDriver(assignment)) return false;
  return true;
}

export function crewFitsSlot(member: DispatchCrewMember, slot: CrewSlotRef): boolean {
  const role = requiredRoleForSlot(slot);
  if (!role) return true;
  return crewMemberHasRole(member, role);
}

export function skippersNeededForJob(job: DispatchJob): number {
  return job.crewSizeNeeded >= 1 ? 1 : 0;
}

export function driversNeededForJob(
  job: DispatchJob,
  assignment?: Pick<DispatchJobAssignment, "skipperAlsoDriver">,
): number {
  return separateDriverSlotCount(job, assignment?.skipperAlsoDriver === true);
}

/** Day totals — S/D does not reduce driver roles needed; fill still counts skipper-as-driver. */
export function driverRolesNeededForDayTotals(job: DispatchJob): number {
  return Math.min(job.trucksNeeded, Math.max(0, job.crewSizeNeeded - 1));
}

export function countFilledRoleSlots(
  job: DispatchJob,
  assignment: DispatchJobAssignment,
): { skippers: number; drivers: number } {
  const normalized = ensureDriverMoverLengths(job, assignment);
  const separateDrivers = normalized.driverIds.filter((id): id is string => Boolean(id)).length;
  const skipperDriving =
    normalized.skipperAlsoDriver && normalized.skipperId ? 1 : 0;
  return {
    skippers: normalized.skipperId ? 1 : 0,
    drivers: separateDrivers + skipperDriving,
  };
}
