import {
  allCrewIdsFromAssignment,
  countFilledCrewSlots,
  ensureDriverMoverLengths,
  isJobCrewComplete,
} from "./crew-slots";
import type { DispatchDaySnapshot, DispatchJob, DispatchJobAssignment } from "./types";

export type ScheduleGap = {
  jobId: string;
  customerName: string;
  missingCrew: number;
  missingTrucks: number;
  needsSkipper?: boolean;
};

export type DispatchScheduleStatus = {
  jobCount: number;
  complete: boolean;
  gaps: ScheduleGap[];
  assignedCrewCount: number;
  assignedTruckCount: number;
};

export function collectAssignedIds(
  jobs: DispatchJob[],
  getAssignment: (jobId: string) => DispatchJobAssignment,
): { crewIds: Set<string>; truckIds: Set<string> } {
  const crewIds = new Set<string>();
  const truckIds = new Set<string>();
  for (const job of jobs) {
    const a = ensureDriverMoverLengths(job, getAssignment(job.id));
    for (const id of allCrewIdsFromAssignment(a)) crewIds.add(id);
    for (const id of a.truckIds) truckIds.add(id);
  }
  return { crewIds, truckIds };
}

export function evaluateDispatchSchedule(
  day: DispatchDaySnapshot,
  getAssignment: (jobId: string) => DispatchJobAssignment,
): DispatchScheduleStatus {
  const { crewIds, truckIds } = collectAssignedIds(day.jobs, getAssignment);
  const gaps: ScheduleGap[] = [];

  for (const job of day.jobs) {
    const a = ensureDriverMoverLengths(job, getAssignment(job.id));
    const { filled, required } = countFilledCrewSlots(job, a);
    const missingCrew = Math.max(0, required - filled);
    const missingTrucks = Math.max(0, job.trucksNeeded - a.truckIds.length);
    if (missingCrew > 0 || missingTrucks > 0) {
      gaps.push({
        jobId: job.id,
        customerName: job.customerName,
        missingCrew,
        missingTrucks,
        needsSkipper: !a.skipperId,
      });
    }
  }

  const allCrewOk = day.jobs.every((job) =>
    isJobCrewComplete(job, ensureDriverMoverLengths(job, getAssignment(job.id))),
  );
  const allTrucksOk = day.jobs.every(
    (job) => getAssignment(job.id).truckIds.length >= job.trucksNeeded,
  );

  return {
    jobCount: day.jobs.length,
    complete: day.jobs.length > 0 && gaps.length === 0 && allCrewOk && allTrucksOk,
    gaps,
    assignedCrewCount: crewIds.size,
    assignedTruckCount: truckIds.size,
  };
}
