import { countFilledCrewSlots } from "./crew-slots";
import type { DispatchJob, DispatchJobAssignment } from "./types";

export function assignmentHasCrewOrTrucks(
  job: DispatchJob,
  assignment: DispatchJobAssignment,
): boolean {
  const { filled } = countFilledCrewSlots(job, assignment);
  return filled > 0 || assignment.truckIds.length > 0;
}

export function emptyJobResourcesPatch(): Partial<DispatchJobAssignment> {
  return {
    skipperId: null,
    driverIds: [],
    moverIds: [],
    truckIds: [],
    skipperAlsoDriver: false,
  };
}

/** Full dispatch-day reset for a job — keeps notes only. */
export function resetDayAssignmentPatch(): Partial<DispatchJobAssignment> {
  return {
    ...emptyJobResourcesPatch(),
    scheduleStartOverrideMinutes: null,
    pairedJobIds: [],
    crewSizeOverride: null,
    trucksNeededOverride: null,
  };
}

export function assignmentHasDispatchChanges(
  job: DispatchJob,
  assignment: DispatchJobAssignment,
): boolean {
  if (assignment.scheduleStartOverrideMinutes != null) return true;
  if ((assignment.pairedJobIds ?? []).length > 0) return true;
  if (assignment.skipperAlsoDriver) return true;
  if (assignment.crewSizeOverride != null) return true;
  if (assignment.trucksNeededOverride != null) return true;
  return assignmentHasCrewOrTrucks(job, assignment);
}
