import type { CrewRole } from "@/lib/dispatch/types";
import type { DispatchCrewMember, DispatchTruck } from "@/lib/dispatch/types";
import { defaultFleetStore } from "./fleet-defaults";

export type {
  CrewWorkSchedule,
  FleetCrewMember,
  FleetStore,
  FleetTruck,
  MaintenanceStatus,
  TimeOffRequest,
  TimeOffRequestStatus,
  TruckMaintenanceRecord,
  TruckOutage,
  TruckType,
  WeekdayId,
} from "./fleet-types";

export {
  DEFAULT_WORK_DAYS,
  TRUCK_TYPES,
  WEEKDAY_IDS,
  WEEKDAY_LABELS,
} from "./fleet-types";

export { crewRolesToJobTitles, jobTitlesToCrewRoles, applyCrewToTeamMember } from "./crew-sync";
export { evaluateTimeOffImpact, MIN_MOVERS_FOR_APPROVAL } from "./time-off-impact";
export type { DayImpact, TimeOffImpactResult } from "./time-off-impact";

/** Static defaults for SSR / first paint */
export const FLEET_CREW = defaultFleetStore().crew;
export const FLEET_TRUCKS = defaultFleetStore().trucks;

export function activeCrewFromList(crew: { active: boolean; id: string; name: string; roles: CrewRole[] }[]): DispatchCrewMember[] {
  return crew.filter((c) => c.active).map(({ id, name, roles }) => ({ id, name, roles }));
}

export function activeTrucksFromList(trucks: { active: boolean; id: string; label: string; type: string }[]): DispatchTruck[] {
  return trucks.filter((t) => t.active).map(({ id, label, type }) => ({ id, label, type }));
}

/** @deprecated Use useFleet() in client components */
export function activeCrewForDispatch(): DispatchCrewMember[] {
  return activeCrewFromList(FLEET_CREW);
}

/** @deprecated Use useFleet() in client components */
export function activeTrucksForDispatch(): DispatchTruck[] {
  return activeTrucksFromList(FLEET_TRUCKS);
}

export function formatTruckType(type: string): string {
  if (type === "26ft") return "26ft";
  if (type === "enterprise") return "Enterprise";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function formatTruckInline(truck: Pick<DispatchTruck, "label" | "type">): string {
  return `${truck.label} · ${formatTruckType(truck.type)}`;
}

export function formatCrewRolesList(roles: CrewRole[]): string {
  const labels: Record<CrewRole, string> = {
    skipper: "Skipper",
    driver: "Driver",
    mover: "Mover",
  };
  return roles.map((r) => labels[r]).join(" · ");
}
