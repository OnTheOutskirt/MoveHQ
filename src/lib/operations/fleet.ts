import type { CrewRole, DispatchCrewMember, DispatchTruck } from "@/lib/dispatch/types";
import { formatCrewRoles } from "@/lib/terminology/labels";
import type { TerminologySettings } from "@/lib/terminology/types";
import { defaultFleetStore } from "./fleet-defaults";
import { buildTruckDispatchType, TRUCK_VEHICLE_TYPE_LABELS } from "./fleet-types";
import type { FleetTruck } from "./fleet-types";

export type {
  CrewWorkSchedule,
  FleetCrewMember,
  FleetStore,
  FleetTruck,
  MaintenanceStatus,
  RentalVendor,
  RentalScheduleStatus,
  TemporaryTruckFormInput,
  TemporaryTruckRental,
  TimeOffRequest,
  TimeOffRequestStatus,
  TruckFormInput,
  TruckMaintenanceRecord,
  TruckOutage,
  TruckType,
  TruckVehicleType,
  WeekdayId,
} from "./fleet-types";

export {
  DEFAULT_WORK_DAYS,
  TRUCK_VEHICLE_TYPES,
  TRUCK_VEHICLE_TYPE_LABELS,
  CAB_SIZES,
  RENTAL_VENDORS,
  TRUCK_TYPES,
  WEEKDAY_IDS,
  WEEKDAY_LABELS,
  buildTruckDispatchType,
  normalizeFleetTruck,
  normalizeTemporaryRental,
  rentalScheduleStatus,
  temporaryRentalFromFormInput,
  truckFromFormInput,
  truckSupportsLiftgate,
  truckSupportsLength,
} from "./fleet-types";

export {
  dispatchTrucksForDate,
  rosterTrucksAvailableOnDate,
  temporaryRentalsOnDate,
  truckCapacityBreakdownForDate,
  truckCapacityForDate,
  type TruckCapacityBreakdown,
} from "./fleet-capacity";

export { crewRolesToJobTitles, jobTitlesToCrewRoles, applyCrewToTeamMember } from "./crew-sync";
export { evaluateTimeOffImpact, MIN_MOVERS_FOR_APPROVAL } from "./time-off-impact";
export type { DayImpact, TimeOffImpactResult } from "./time-off-impact";

/** Static defaults for SSR / first paint */
export const FLEET_CREW = defaultFleetStore().crew;
export const FLEET_TRUCKS = defaultFleetStore().trucks;

export function activeCrewFromList(crew: { active: boolean; id: string; name: string; roles: CrewRole[] }[]): DispatchCrewMember[] {
  return crew.filter((c) => c.active).map(({ id, name, roles }) => ({ id, name, roles }));
}

export function activeTrucksFromList(trucks: FleetTruck[]): DispatchTruck[] {
  return trucks
    .filter((t) => t.active)
    .map(({ id, label, vehicleType, lengthFt, type }) => ({
      id,
      label,
      type: vehicleType ? buildTruckDispatchType({ vehicleType, lengthFt }) : type,
    }));
}

/** @deprecated Use useFleet() in client components */
export function activeCrewForDispatch(): DispatchCrewMember[] {
  return activeCrewFromList(FLEET_CREW);
}

/** @deprecated Use useFleet() in client components */
export function activeTrucksForDispatch(): DispatchTruck[] {
  return activeTrucksFromList(FLEET_TRUCKS);
}

export function formatTruckVehicleType(vehicleType: string): string {
  if (vehicleType in TRUCK_VEHICLE_TYPE_LABELS) {
    return TRUCK_VEHICLE_TYPE_LABELS[vehicleType as keyof typeof TRUCK_VEHICLE_TYPE_LABELS];
  }
  return formatTruckType(vehicleType);
}

export function formatTruckType(type: string): string {
  if (type in TRUCK_VEHICLE_TYPE_LABELS) {
    return TRUCK_VEHICLE_TYPE_LABELS[type as keyof typeof TRUCK_VEHICLE_TYPE_LABELS];
  }
  if (type === "26ft") return "26ft box";
  if (type === "enterprise") return "Rental truck";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function formatTruckInline(
  truck: Pick<DispatchTruck, "label" | "type"> & Partial<Pick<FleetTruck, "vehicleType" | "lengthFt">>,
): string {
  if (truck.vehicleType) {
    return `${truck.label} · ${buildTruckDispatchType(truck as Pick<FleetTruck, "vehicleType" | "lengthFt">)}`;
  }
  return `${truck.label} · ${formatTruckType(truck.type)}`;
}

export function formatCrewRolesList(
  roles: CrewRole[],
  terms?: TerminologySettings,
): string {
  return formatCrewRoles(roles, terms);
}
