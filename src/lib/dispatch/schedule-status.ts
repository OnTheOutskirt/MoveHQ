import {
  allCrewIdsFromAssignment,
  countFilledCrewSlots,
  ensureDriverMoverLengths,
  isJobCrewComplete,
} from "./crew-slots";
import { effectiveDispatchJob } from "./job-requirements";
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
    const raw = getAssignment(job.id);
    const effective = effectiveDispatchJob(job, raw);
    const a = ensureDriverMoverLengths(effective, raw);
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
    const raw = getAssignment(job.id);
    const effective = effectiveDispatchJob(job, raw);
    const a = ensureDriverMoverLengths(effective, raw);
    const { filled, required } = countFilledCrewSlots(effective, a);
    const missingCrew = Math.max(0, required - filled);
    const missingTrucks = Math.max(0, effective.trucksNeeded - a.truckIds.length);
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

  const allCrewOk = day.jobs.every((job) => {
    const raw = getAssignment(job.id);
    const effective = effectiveDispatchJob(job, raw);
    return isJobCrewComplete(effective, ensureDriverMoverLengths(effective, raw));
  });
  const allTrucksOk = day.jobs.every((job) => {
    const raw = getAssignment(job.id);
    const effective = effectiveDispatchJob(job, raw);
    return raw.truckIds.length >= effective.trucksNeeded;
  });

  return {
    jobCount: day.jobs.length,
    complete: day.jobs.length > 0 && gaps.length === 0 && allCrewOk && allTrucksOk,
    gaps,
    assignedCrewCount: crewIds.size,
    assignedTruckCount: truckIds.size,
  };
}
