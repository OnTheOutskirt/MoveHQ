import { collectDispatchDay } from "@/lib/dispatch/collect-day-jobs";
import { getJobAssignment, type DispatchAssignmentStore } from "@/lib/dispatch/storage";
import type { CrewRole, DispatchJob, DispatchJobAssignment } from "@/lib/dispatch/types";
import type { FleetCrewMember } from "@/lib/operations/fleet-types";
import type { MoveRecord } from "./types";

export type MoveDayCrewMember = {
  id: string;
  name: string;
  roles: CrewRole[];
  primaryRole: CrewRole;
  headshotDataUrl?: string | null;
  bio?: string;
};

export type MoveDayPortalData = {
  move: MoveRecord;
  dateKey: string;
  job: DispatchJob;
  assignment: DispatchJobAssignment;
  crew: MoveDayCrewMember[];
  arrivalWindow?: string;
  isPublished: boolean;
};

export function buildMoveDayPortalUrl(moveId: string, dateKey?: string): string {
  const params = new URLSearchParams({ move: moveId });
  if (dateKey) params.set("date", dateKey);
  return `/portal/move-day?${params.toString()}`;
}

export function absoluteMoveDayPortalUrl(
  moveId: string,
  dateKey?: string,
  origin = "",
): string {
  const path = buildMoveDayPortalUrl(moveId, dateKey);
  if (!origin) return path;
  return `${origin.replace(/\/$/, "")}${path}`;
}

function primaryRoleForCrew(
  crewId: string,
  assignment: DispatchJobAssignment,
  member: FleetCrewMember,
): CrewRole {
  if (assignment.skipperId === crewId) return "skipper";
  if (assignment.driverIds.includes(crewId)) return "driver";
  if (assignment.moverIds.includes(crewId)) return "mover";
  return member.roles[0] ?? "mover";
}

function assignmentCrewIds(assignment: DispatchJobAssignment): string[] {
  const ids = new Set<string>();
  if (assignment.skipperId) ids.add(assignment.skipperId);
  for (const id of assignment.driverIds) if (id) ids.add(id);
  for (const id of assignment.moverIds) if (id) ids.add(id);
  return [...ids];
}

export function resolveMoveDayPortalData(input: {
  move: MoveRecord;
  dateKey: string;
  fleet: FleetCrewMember[];
  assignments: DispatchAssignmentStore;
  moves: MoveRecord[];
  isPublished: boolean;
}): MoveDayPortalData | null {
  const { move, dateKey, fleet, assignments, moves } = input;
  const day = collectDispatchDay(moves, dateKey, new Date(`${dateKey}T12:00:00`));
  const job = day.jobs.find((j) => j.moveId === move.id);
  if (!job) return null;

  const assignment = getJobAssignment(assignments, dateKey, job.id);
  const fleetById = new Map(fleet.map((c) => [c.id, c]));

  const crew: MoveDayCrewMember[] = [];
  for (const crewId of assignmentCrewIds(assignment)) {
    const member = fleetById.get(crewId);
    if (!member || member.showOnCustomerPortal === false) continue;
    crew.push({
      id: member.id,
      name: member.name,
      roles: member.roles,
      primaryRole: primaryRoleForCrew(crewId, assignment, member),
      headshotDataUrl: member.headshotDataUrl,
      bio: member.bio,
    });
  }

  return {
    move,
    dateKey,
    job,
    assignment,
    crew,
    arrivalWindow: job.arrivalWindow,
    isPublished: input.isPublished,
  };
}
