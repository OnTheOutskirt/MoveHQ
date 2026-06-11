import { jobDayToDispatchJob } from "@/lib/dispatch/collect-day-jobs";
import { getSlotCrewId, jobCrewSlots } from "@/lib/dispatch/crew-slots";
import { getJobAssignment, type DispatchAssignmentStore } from "@/lib/dispatch/storage";
import type { DispatchCrewMember, DispatchJobAssignment, DispatchTruck } from "@/lib/dispatch/types";
import { formatTruckInline } from "@/lib/operations/fleet";
import { DEFAULT_TERMINOLOGY } from "@/lib/terminology/defaults";
import type { TerminologySettings } from "@/lib/terminology/types";
import { jobDayCrewLine, jobDayTruckLine } from "@/lib/moves/job-day-display";
import type { MoveJobDay, MoveRecord } from "@/lib/moves/types";

export function dispatchJobIdForMoveDay(moveId: string, dayId: string): string {
  return `move:${moveId}:${dayId}`;
}

export function formatDispatchTruckLine(
  assignment: DispatchJobAssignment,
  trucks: DispatchTruck[],
): string | null {
  if (assignment.truckIds.length === 0) return null;
  return assignment.truckIds
    .map((id) => {
      const truck = trucks.find((t) => t.id === id);
      return truck ? formatTruckInline(truck) : id;
    })
    .join(", ");
}

export function formatDispatchCrewLine(
  move: MoveRecord,
  day: MoveJobDay,
  assignment: DispatchJobAssignment,
  crewRoster: DispatchCrewMember[],
  terms: TerminologySettings = DEFAULT_TERMINOLOGY,
): string | null {
  const job = jobDayToDispatchJob(move, day, new Date());
  const slots = jobCrewSlots(job, terms);
  const names = slots
    .map((slot) => {
      const id = getSlotCrewId(assignment, slot);
      if (!id) return null;
      return crewRoster.find((c) => c.id === id)?.name ?? null;
    })
    .filter((name): name is string => Boolean(name));

  if (names.length === 0) return null;
  return names.join(", ");
}

export type JobDayDispatchDisplay = {
  assignment: DispatchJobAssignment;
  crewLine: string | null;
  truckLine: string | null;
  crewFromDispatch: boolean;
  trucksFromDispatch: boolean;
};

export function resolveJobDayDispatchDisplay(
  move: MoveRecord,
  day: MoveJobDay,
  store: DispatchAssignmentStore,
  crewRoster: DispatchCrewMember[],
  trucks: DispatchTruck[],
  terms?: TerminologySettings,
): JobDayDispatchDisplay {
  const jobId = dispatchJobIdForMoveDay(move.id, day.id);
  const assignment = getJobAssignment(store, day.date, jobId);
  const dispatchCrew = formatDispatchCrewLine(move, day, assignment, crewRoster, terms);
  const dispatchTrucks = formatDispatchTruckLine(assignment, trucks);
  const plannedCrew = jobDayCrewLine(day);
  const plannedTrucks = jobDayTruckLine(day);

  return {
    assignment,
    crewLine: dispatchCrew ?? plannedCrew,
    truckLine: dispatchTrucks ?? plannedTrucks,
    crewFromDispatch: Boolean(dispatchCrew),
    trucksFromDispatch: Boolean(dispatchTrucks),
  };
}
