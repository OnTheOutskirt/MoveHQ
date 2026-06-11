import type { CrewRole, DispatchCrewMember, DispatchTruck } from "@/lib/dispatch/types";

export type FleetCrewMember = DispatchCrewMember & {
  active: boolean;
  /** Links to Settings → Team Members when set */
  teamMemberId?: string;
  /** Customer-facing headshot for move-day portal & day-before messages */
  headshotDataUrl?: string | null;
  /** Short bio shown on the customer move-day portal */
  bio?: string;
  /** When false, hidden from customer move-day portal */
  showOnCustomerPortal?: boolean;
};

export const TRUCK_VEHICLE_TYPES = [
  "box_truck",
  "straight_truck",
  "rental_truck",
  "cargo_van",
  "passenger_van",
  "pickup_truck",
  "trailer",
] as const;

export type TruckVehicleType = (typeof TRUCK_VEHICLE_TYPES)[number];

export const TRUCK_VEHICLE_TYPE_LABELS: Record<TruckVehicleType, string> = {
  box_truck: "Box truck",
  straight_truck: "Straight truck",
  rental_truck: "Rental truck",
  cargo_van: "Cargo van",
  passenger_van: "Passenger van",
  pickup_truck: "Pickup truck",
  trailer: "Trailer",
};

export const CAB_SIZES = [2, 3, 4, 5, 6] as const;

export type FleetTruck = DispatchTruck & {
  active: boolean;
  vehicleType: TruckVehicleType;
  /** Box/body length in feet, e.g. "26", "24", "8" */
  lengthFt?: string;
  /** Seating capacity in cab */
  cabSize?: number;
  hasLiftgate?: boolean;
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  plate?: string;
};

export type TruckFormInput = {
  label: string;
  vehicleType: TruckVehicleType;
  lengthFt?: string;
  cabSize?: number;
  hasLiftgate?: boolean;
  active?: boolean;
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  plate?: string;
};

export const RENTAL_VENDORS = ["U-Haul", "Penske", "Enterprise", "Budget", "Other"] as const;
export type RentalVendor = (typeof RENTAL_VENDORS)[number];

export type TemporaryTruckRental = {
  id: string;
  label: string;
  vendor: RentalVendor;
  vehicleType: TruckVehicleType;
  lengthFt?: string;
  cabSize?: number;
  hasLiftgate?: boolean;
  startDate: string;
  endDate: string;
  notes?: string;
};

export type TemporaryTruckFormInput = {
  label: string;
  vendor: RentalVendor;
  vehicleType: TruckVehicleType;
  lengthFt?: string;
  cabSize?: number;
  hasLiftgate?: boolean;
  startDate: string;
  endDate: string;
  notes?: string;
};

export function normalizeTemporaryRental(
  raw: Partial<TemporaryTruckRental> & Pick<TemporaryTruckRental, "id" | "label" | "startDate" | "endDate">,
): TemporaryTruckRental {
  const vehicleType = raw.vehicleType ?? "rental_truck";
  const vendor = raw.vendor ?? "U-Haul";
  const startDate = raw.startDate;
  const endDate = raw.endDate >= startDate ? raw.endDate : startDate;
  return {
    id: raw.id,
    label: raw.label.trim(),
    vendor,
    vehicleType,
    lengthFt: raw.lengthFt?.trim() || undefined,
    cabSize: raw.cabSize,
    hasLiftgate:
      raw.hasLiftgate ??
      (truckSupportsLiftgate(vehicleType) ? vehicleType === "rental_truck" : undefined),
    startDate,
    endDate,
    notes: raw.notes?.trim() || undefined,
  };
}

export function temporaryRentalFromFormInput(
  id: string,
  input: TemporaryTruckFormInput,
): TemporaryTruckRental {
  const lengthFt = input.lengthFt?.trim() || undefined;
  const vehicleType = input.vehicleType;
  const endDate = input.endDate >= input.startDate ? input.endDate : input.startDate;
  return normalizeTemporaryRental({
    id,
    label: input.label.trim(),
    vendor: input.vendor,
    vehicleType,
    lengthFt,
    cabSize: input.cabSize,
    hasLiftgate: truckSupportsLiftgate(vehicleType) ? Boolean(input.hasLiftgate) : undefined,
    startDate: input.startDate,
    endDate,
    notes: input.notes?.trim() || undefined,
  });
}

export type RentalScheduleStatus = "upcoming" | "active" | "ended";

export function rentalScheduleStatus(
  rental: Pick<TemporaryTruckRental, "startDate" | "endDate">,
  todayKey: string,
): RentalScheduleStatus {
  if (todayKey < rental.startDate) return "upcoming";
  if (todayKey > rental.endDate) return "ended";
  return "active";
}

/** @deprecated Use TRUCK_VEHICLE_TYPES */
export const TRUCK_TYPES = TRUCK_VEHICLE_TYPES;
/** @deprecated Use TruckVehicleType */
export type TruckType = TruckVehicleType;

export const WEEKDAY_IDS = [0, 1, 2, 3, 4, 5, 6] as const;
export type WeekdayId = (typeof WEEKDAY_IDS)[number];

export const WEEKDAY_LABELS: Record<WeekdayId, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

/** Default Mon–Fri */
export const DEFAULT_WORK_DAYS: WeekdayId[] = [1, 2, 3, 4, 5];

export type CrewWorkSchedule = {
  crewId: string;
  workDays: WeekdayId[];
};

export type TimeOffRequestStatus = "pending" | "approved" | "denied";

export type TimeOffRequest = {
  id: string;
  crewId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: TimeOffRequestStatus;
  source: "crew_app" | "manual";
  submittedAt: string;
  reviewedAt?: string;
  reviewNote?: string;
};

export type TruckOutage = {
  id: string;
  truckId: string;
  startDate: string;
  endDate: string;
  reason: string;
};

export type MaintenanceStatus = "scheduled" | "completed" | "overdue";

export type TruckMaintenanceRecord = {
  id: string;
  truckId: string;
  title: string;
  type: string;
  scheduledDate: string;
  status: MaintenanceStatus;
  mileage?: number;
  vendor?: string;
  notes?: string;
};

export type FleetStore = {
  crew: FleetCrewMember[];
  trucks: FleetTruck[];
  temporaryRentals: TemporaryTruckRental[];
  schedules: CrewWorkSchedule[];
  timeOffRequests: TimeOffRequest[];
  truckOutages: TruckOutage[];
  maintenance: TruckMaintenanceRecord[];
};

export function truckSupportsLiftgate(vehicleType: TruckVehicleType): boolean {
  return (
    vehicleType === "box_truck" ||
    vehicleType === "rental_truck" ||
    vehicleType === "straight_truck" ||
    vehicleType === "cargo_van"
  );
}

export function truckSupportsLength(vehicleType: TruckVehicleType): boolean {
  return vehicleType !== "pickup_truck" && vehicleType !== "passenger_van";
}

const LEGACY_VEHICLE_TYPE_MAP: Record<string, TruckVehicleType> = {
  "26ft": "box_truck",
  enterprise: "rental_truck",
  box: "box_truck",
  cab: "pickup_truck",
  shuttle: "passenger_van",
};

export function buildTruckDispatchType(
  truck: Pick<FleetTruck, "vehicleType" | "lengthFt">,
): string {
  const typeLabel = TRUCK_VEHICLE_TYPE_LABELS[truck.vehicleType];
  const length = truck.lengthFt?.trim();
  if (length && truckSupportsLength(truck.vehicleType)) {
    return `${length}ft ${typeLabel}`;
  }
  return typeLabel;
}

function optionalTrim(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function optionalYear(value: number | undefined): number | undefined {
  if (value == null || !Number.isFinite(value)) return undefined;
  const year = Math.trunc(value);
  if (year < 1900 || year > 2100) return undefined;
  return year;
}

function truckRegistrationFields(
  raw: Pick<TruckFormInput, "make" | "model" | "year" | "vin" | "plate">,
): Pick<FleetTruck, "make" | "model" | "year" | "vin" | "plate"> {
  return {
    make: optionalTrim(raw.make),
    model: optionalTrim(raw.model),
    year: optionalYear(raw.year),
    vin: optionalTrim(raw.vin)?.toUpperCase(),
    plate: optionalTrim(raw.plate)?.toUpperCase(),
  };
}

export function normalizeFleetTruck(raw: Partial<FleetTruck> & Pick<FleetTruck, "id" | "label">): FleetTruck {
  const legacyType = raw.type ?? "";
  const vehicleType =
    raw.vehicleType ??
    LEGACY_VEHICLE_TYPE_MAP[legacyType] ??
    (legacyType.includes("enterprise") ? "rental_truck" : "box_truck");

  let lengthFt = raw.lengthFt?.trim() || undefined;
  if (!lengthFt && /^(\d+)ft?$/.test(legacyType)) {
    lengthFt = legacyType.replace(/ft$/, "");
  }
  if (!lengthFt && vehicleType === "box_truck" && legacyType === "26ft") {
    lengthFt = "26";
  }

  const active = raw.active !== false;
  const normalized: FleetTruck = {
    id: raw.id,
    label: raw.label,
    active,
    vehicleType,
    lengthFt,
    cabSize: raw.cabSize,
    hasLiftgate: raw.hasLiftgate,
    ...truckRegistrationFields(raw),
    type: buildTruckDispatchType({ vehicleType, lengthFt }),
  };

  if (normalized.hasLiftgate == null && truckSupportsLiftgate(vehicleType)) {
    normalized.hasLiftgate = vehicleType === "box_truck" || vehicleType === "rental_truck";
  }

  return normalized;
}

export function truckFromFormInput(
  id: string,
  input: TruckFormInput,
): FleetTruck {
  const lengthFt = input.lengthFt?.trim() || undefined;
  const vehicleType = input.vehicleType;
  return {
    id,
    label: input.label.trim(),
    active: input.active !== false,
    vehicleType,
    lengthFt,
    cabSize: input.cabSize,
    hasLiftgate: truckSupportsLiftgate(vehicleType) ? Boolean(input.hasLiftgate) : undefined,
    ...truckRegistrationFields(input),
    type: buildTruckDispatchType({ vehicleType, lengthFt }),
  };
}
