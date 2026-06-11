import { getJobAssignment, type DispatchAssignmentStore } from "./storage";
import type { DispatchJob, DispatchJobAssignment } from "./types";

function assignmentPayload(assignment: DispatchJobAssignment) {
  return {
    skipperId: assignment.skipperId,
    driverIds: assignment.driverIds,
    moverIds: assignment.moverIds,
    truckIds: assignment.truckIds,
    skipperAlsoDriver: assignment.skipperAlsoDriver,
    pairedJobIds: [...(assignment.pairedJobIds ?? [])].sort(),
    scheduleStartOverrideMinutes: assignment.scheduleStartOverrideMinutes,
    crewSizeOverride: assignment.crewSizeOverride,
    trucksNeededOverride: assignment.trucksNeededOverride,
    dispatchNotes: assignment.dispatchNotes ?? "",
  };
}

export function buildDispatchPublishSnapshot(
  dateKey: string,
  jobs: DispatchJob[],
  assignments: DispatchAssignmentStore,
): string {
  const rows = [...jobs]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((job) => ({
      id: job.id,
      ...assignmentPayload(getJobAssignment(assignments, dateKey, job.id)),
    }));
  return JSON.stringify(rows);
}

export function dispatchMatchesPublishSnapshot(
  snapshot: string | undefined,
  dateKey: string,
  jobs: DispatchJob[],
  assignments: DispatchAssignmentStore,
): boolean {
  if (!snapshot) return false;
  return snapshot === buildDispatchPublishSnapshot(dateKey, jobs, assignments);
}
