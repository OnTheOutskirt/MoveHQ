import type { DispatchTruck } from "@/lib/dispatch/types";
import type {
  FleetTruck,
  TemporaryTruckRental,
  TruckOutage,
} from "./fleet-types";
import { buildTruckDispatchType } from "./fleet-types";

export function isDateInRange(dateKey: string, startDate: string, endDate: string): boolean {
  return dateKey >= startDate && dateKey <= endDate;
}

export function isTruckOutOnDate(truckId: string, dateKey: string, outages: TruckOutage[]): boolean {
  return outages.some(
    (o) => o.truckId === truckId && isDateInRange(dateKey, o.startDate, o.endDate),
  );
}

/** Active roster trucks available on a given day (not out of service). */
export function rosterTrucksAvailableOnDate(
  trucks: FleetTruck[],
  outages: TruckOutage[],
  dateKey: string,
): FleetTruck[] {
  return trucks.filter(
    (t) => t.active && !isTruckOutOnDate(t.id, dateKey, outages),
  );
}

export function temporaryRentalsOnDate(
  rentals: TemporaryTruckRental[],
  dateKey: string,
): TemporaryTruckRental[] {
  return rentals.filter((r) => isDateInRange(dateKey, r.startDate, r.endDate));
}

export function truckCapacityForDate(
  trucks: FleetTruck[],
  outages: TruckOutage[],
  rentals: TemporaryTruckRental[],
  dateKey: string,
): number {
  return (
    rosterTrucksAvailableOnDate(trucks, outages, dateKey).length +
    temporaryRentalsOnDate(rentals, dateKey).length
  );
}

export function temporaryRentalToDispatchTruck(rental: TemporaryTruckRental): DispatchTruck {
  const specs = buildTruckDispatchType(rental);
  return {
    id: rental.id,
    label: rental.label,
    type: rental.vendor ? `${specs} · ${rental.vendor}` : specs,
  };
}

export function dispatchTrucksForDate(
  trucks: FleetTruck[],
  outages: TruckOutage[],
  rentals: TemporaryTruckRental[],
  dateKey: string,
): DispatchTruck[] {
  const roster = rosterTrucksAvailableOnDate(trucks, outages, dateKey).map(
    ({ id, label, vehicleType, lengthFt, type }) => ({
      id,
      label,
      type: vehicleType ? buildTruckDispatchType({ vehicleType, lengthFt }) : type,
    }),
  );
  const temp = temporaryRentalsOnDate(rentals, dateKey).map(temporaryRentalToDispatchTruck);
  return [...roster, ...temp];
}

export type TruckCapacityBreakdown = {
  roster: number;
  rentals: number;
  outOfService: number;
  total: number;
};

export function truckCapacityBreakdownForDate(
  trucks: FleetTruck[],
  outages: TruckOutage[],
  rentals: TemporaryTruckRental[],
  dateKey: string,
): TruckCapacityBreakdown {
  const activeRoster = trucks.filter((t) => t.active);
  const available = rosterTrucksAvailableOnDate(trucks, outages, dateKey);
  const outOfService = activeRoster.length - available.length;
  const rentalCount = temporaryRentalsOnDate(rentals, dateKey).length;
  return {
    roster: available.length,
    rentals: rentalCount,
    outOfService,
    total: available.length + rentalCount,
  };
}
