import {
  countFilledCrewSlots,
  countFilledRoleSlots,
  driversNeededForJob,
  ensureDriverMoverLengths,
  skippersNeededForJob,
} from "./crew-slots";
import { effectiveDispatchJob } from "./job-requirements";
import type { DispatchDaySnapshot, DispatchJob, DispatchJobAssignment } from "./types";

export type DispatchDayRequirements = {
  jobCount: number;
  crewNeeded: number;
  skippersNeeded: number;
  driversNeeded: number;
  trucksNeeded: number;
  crewFilled: number;
  skippersFilled: number;
  driversFilled: number;
  trucksFilled: number;
  shortCrew: number;
  shortSkippers: number;
  shortDrivers: number;
  shortTrucks: number;
  hasShortfall: boolean;
};

export function evaluateDayRequirements(
  day: DispatchDaySnapshot,
  getAssignment: (jobId: string) => DispatchJobAssignment,
): DispatchDayRequirements {
  let crewNeeded = 0;
  let skippersNeeded = 0;
  let driversNeeded = 0;
  let trucksNeeded = 0;
  let crewFilled = 0;
  let skippersFilled = 0;
  let driversFilled = 0;
  let trucksFilled = 0;

  for (const job of day.jobs) {
    const raw = getAssignment(job.id);
    const effective = effectiveDispatchJob(job, raw);
    const assignment = ensureDriverMoverLengths(effective, raw);

    const { filled, required } = countFilledCrewSlots(effective, assignment);
    const roles = countFilledRoleSlots(effective, assignment);

    crewNeeded += required;
    crewFilled += filled;
    skippersNeeded += skippersNeededForJob(effective);
    skippersFilled += roles.skippers;
    driversNeeded += driversNeededForJob(effective);
    driversFilled += roles.drivers;
    trucksNeeded += effective.trucksNeeded;
    trucksFilled += assignment.truckIds.length;
  }

  const shortCrew = Math.max(0, crewNeeded - crewFilled);
  const shortSkippers = Math.max(0, skippersNeeded - skippersFilled);
  const shortDrivers = Math.max(0, driversNeeded - driversFilled);
  const shortTrucks = Math.max(0, trucksNeeded - trucksFilled);

  return {
    jobCount: day.jobs.length,
    crewNeeded,
    skippersNeeded,
    driversNeeded,
    trucksNeeded,
    crewFilled,
    skippersFilled,
    driversFilled,
    trucksFilled,
    shortCrew,
    shortSkippers,
    shortDrivers,
    shortTrucks,
    hasShortfall:
      shortCrew > 0 || shortSkippers > 0 || shortDrivers > 0 || shortTrucks > 0,
  };
}
