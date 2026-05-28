import type { DispatchJob, DispatchJobAssignment } from "./types";

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

export function jobCrewSlots(job: DispatchJob): CrewSlotDefinition[] {
  const slots: CrewSlotDefinition[] = [];
  if (job.crewSizeNeeded < 1) return slots;

  slots.push({ kind: "skipper", label: "Skipper" });

  const driverCount = Math.min(job.trucksNeeded, Math.max(0, job.crewSizeNeeded - 1));
  for (let i = 0; i < driverCount; i++) {
    slots.push({
      kind: "driver",
      index: i,
      label: driverCount === 1 ? "Driver" : `Driver ${i + 1}`,
    });
  }

  const moverCount = Math.max(0, job.crewSizeNeeded - 1 - driverCount);
  for (let i = 0; i < moverCount; i++) {
    slots.push({
      kind: "mover",
      index: i,
      label: moverCount === 1 ? "Mover" : `Mover ${i + 1}`,
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
