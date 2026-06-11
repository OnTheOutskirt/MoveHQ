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

export type TruckOffEntry = {
  truck: FleetTruck;
  label: string;
  detail: string;
};

function truckOffLabelFromReason(reason: string): string {
  const lower = reason.toLowerCase();
  if (
    lower.includes("maintenance") ||
    lower.includes("repair") ||
    lower.includes("shop") ||
    lower.includes("inspection") ||
    lower.includes("service")
  ) {
    return "Maintenance";
  }
  return "Out of service";
}

/** Active roster trucks out of service on a given day. */
export function trucksOffOnDate(
  trucks: FleetTruck[],
  outages: TruckOutage[],
  dateKey: string,
): TruckOffEntry[] {
  const seen = new Set<string>();
  const entries: TruckOffEntry[] = [];

  for (const truck of trucks) {
    if (!truck.active) continue;
    if (!isTruckOutOnDate(truck.id, dateKey, outages)) continue;
    const outage = outages.find(
      (o) => o.truckId === truck.id && isDateInRange(dateKey, o.startDate, o.endDate),
    );
    const detail = outage?.reason ?? "Unavailable for dispatch";
    entries.push({
      truck,
      label: truckOffLabelFromReason(detail),
      detail,
    });
    seen.add(truck.id);
  }

  for (const truck of trucks) {
    if (truck.active || seen.has(truck.id)) continue;
    entries.push({
      truck,
      label: "Inactive",
      detail: "Removed from active fleet",
    });
  }

  return entries.sort((a, b) => a.truck.label.localeCompare(b.truck.label));
}

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
