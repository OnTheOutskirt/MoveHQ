import { ensureDriverMoverLengths } from "./crew-slots";
import type { DispatchJob, DispatchJobAssignment } from "./types";

export const DISPATCH_CREW_SIZE_MIN = 1;
export const DISPATCH_CREW_SIZE_MAX = 12;
export const DISPATCH_TRUCKS_MIN = 1;
export const DISPATCH_TRUCKS_MAX = 4;

export type EffectiveJobRequirements = {
  crewSizeNeeded: number;
  trucksNeeded: number;
  crewOverridden: boolean;
  trucksOverridden: boolean;
};

export function effectiveRequirements(
  job: DispatchJob,
  assignment: DispatchJobAssignment,
): EffectiveJobRequirements {
  const crewSizeNeeded = clampCrew(
    assignment.crewSizeOverride ?? job.crewSizeNeeded,
  );
  const trucksNeeded = clampTrucks(
    assignment.trucksNeededOverride ?? job.trucksNeeded,
  );
  return {
    crewSizeNeeded,
    trucksNeeded,
    crewOverridden:
      assignment.crewSizeOverride != null &&
      assignment.crewSizeOverride !== job.crewSizeNeeded,
    trucksOverridden:
      assignment.trucksNeededOverride != null &&
      assignment.trucksNeededOverride !== job.trucksNeeded,
  };
}

/** Job copy with dispatch-effective crew/truck counts for slot math. */
export function effectiveDispatchJob(
  job: DispatchJob,
  assignment: DispatchJobAssignment,
): DispatchJob {
  const req = effectiveRequirements(job, assignment);
  return {
    ...job,
    crewSizeNeeded: req.crewSizeNeeded,
    trucksNeeded: req.trucksNeeded,
  };
}

export function clampCrew(n: number): number {
  return Math.min(DISPATCH_CREW_SIZE_MAX, Math.max(DISPATCH_CREW_SIZE_MIN, Math.round(n)));
}

export function clampTrucks(n: number): number {
  return Math.min(DISPATCH_TRUCKS_MAX, Math.max(DISPATCH_TRUCKS_MIN, Math.round(n)));
}

/** After crew/truck count changes, trim assignments that no longer fit. */
export function trimAssignmentToRequirements(
  job: DispatchJob,
  assignment: DispatchJobAssignment,
  crewSizeNeeded: number,
  trucksNeeded: number,
): Pick<
  DispatchJobAssignment,
  "skipperId" | "driverIds" | "moverIds" | "truckIds"
> {
  const effectiveJob: DispatchJob = { ...job, crewSizeNeeded, trucksNeeded };
  const normalized = ensureDriverMoverLengths(effectiveJob, assignment);

  return {
    skipperId: normalized.skipperId,
    driverIds: normalized.driverIds,
    moverIds: normalized.moverIds,
    truckIds: normalized.truckIds.slice(0, trucksNeeded),
  };
}
