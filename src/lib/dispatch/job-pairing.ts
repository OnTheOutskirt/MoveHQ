import { fractionLabel, periodLabel } from "@/lib/day-share/labels";
import { combinationsFillDay, DAY_SHARE_CAPACITY, fractionUnits } from "@/lib/day-share/units";
import { effectiveDispatchJob } from "./job-requirements";
import type { DispatchFtaBooking } from "./fta";
import type { DispatchJob, DispatchJobAssignment } from "./types";

export const DISPATCH_JOB_PAIR_DRAG_TYPE = "application/x-jm-dispatch-job";

export function encodeJobPairDrag(jobId: string): string {
  return jobId;
}

export function parseJobPairDrag(raw: string): string | null {
  const id = raw.trim();
  return id.length > 0 ? id : null;
}

function bookingFromJob(job: DispatchJob): DispatchFtaBooking | null {
  return job.ftaBooking ?? null;
}

export function formatJobPairingLabel(booking: DispatchFtaBooking): string {
  return `${booking.crewSize}-man ${periodLabel(booking.period)} ${fractionLabel(booking.duration)}`;
}

function effectiveCrewSizeForPairing(
  job: DispatchJob,
  getAssignment: (jobId: string) => DispatchJobAssignment,
): number {
  return effectiveDispatchJob(job, getAssignment(job.id)).crewSizeNeeded;
}

export type JobPairingCrewSizeMismatch = {
  incomingCrewSize: number;
  anchorCrewSize: number;
};

export type JobPairingValidation = {
  ok: boolean;
  complete?: boolean;
  message?: string;
  crewSizeMismatch?: JobPairingCrewSizeMismatch;
};

export function formatCrewSizeMismatchMessage(
  incoming: DispatchJob,
  anchor: DispatchJob,
  mismatch: JobPairingCrewSizeMismatch,
): string {
  const incomingLabel =
    mismatch.incomingCrewSize === 1 ? "1 crew member" : `${mismatch.incomingCrewSize} crew members`;
  const anchorLabel =
    mismatch.anchorCrewSize === 1 ? "1-person" : `${mismatch.anchorCrewSize}-person`;
  return `${incoming.customerName} is only planned for ${incomingLabel}. Update planned crew size to ${anchorLabel} in the job sidebar, then drag here to pair with ${anchor.customerName}.`;
}

export function validateJobPairing(
  anchor: DispatchJob,
  partnerJobs: DispatchJob[],
  incoming: DispatchJob,
  getAssignment: (jobId: string) => DispatchJobAssignment,
): JobPairingValidation {
  if (anchor.id === incoming.id) {
    return { ok: false, message: "Cannot pair a job with itself." };
  }
  if (partnerJobs.some((p) => p.id === incoming.id)) {
    return { ok: false, message: "This job is already paired." };
  }

  const anchorBooking = bookingFromJob(anchor);
  const incomingBooking = bookingFromJob(incoming);
  if (!anchorBooking) {
    return { ok: false, message: "Drop onto a partial-day job (Brief, Short, or Medium)." };
  }
  if (!incomingBooking) {
    return { ok: false, message: "Drag a partial-day job (Brief, Short, or Medium)." };
  }

  const anchorCrewSize = effectiveCrewSizeForPairing(anchor, getAssignment);
  const incomingCrewSize = effectiveCrewSizeForPairing(incoming, getAssignment);
  if (incomingCrewSize !== anchorCrewSize) {
    return {
      ok: false,
      crewSizeMismatch: { incomingCrewSize, anchorCrewSize },
      message: formatCrewSizeMismatchMessage(incoming, anchor, {
        incomingCrewSize,
        anchorCrewSize,
      }),
    };
  }
  for (const partner of partnerJobs) {
    if (effectiveCrewSizeForPairing(partner, getAssignment) !== anchorCrewSize) {
      return { ok: false, message: "Paired jobs must use the same crew size." };
    }
  }

  if (incomingBooking.period === anchorBooking.period) {
    return {
      ok: false,
      message: "Pair with the opposite part of the day (morning ↔ afternoon).",
    };
  }

  for (const partner of partnerJobs) {
    const pb = bookingFromJob(partner);
    if (pb && pb.period !== incomingBooking.period) {
      return {
        ok: false,
        message: "Additional afternoon (or morning) jobs must match the same period.",
      };
    }
  }

  const fractions = [
    anchorBooking.duration,
    ...partnerJobs.map((p) => bookingFromJob(p)!.duration),
    incomingBooking.duration,
  ];
  const units = fractions.reduce((sum, f) => sum + fractionUnits(f), 0);
  if (units > DAY_SHARE_CAPACITY) {
    return { ok: false, message: "These jobs exceed one crew-day together." };
  }
  if (units === DAY_SHARE_CAPACITY) {
    const result = combinationsFillDay(fractions);
    if (!result.valid) {
      return { ok: false, message: result.message ?? "Invalid day-share combination." };
    }
    return { ok: true, complete: true };
  }
  return { ok: true, complete: false };
}
