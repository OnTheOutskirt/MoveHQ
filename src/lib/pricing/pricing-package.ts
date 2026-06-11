import type { FlatRateInventoryBasis } from "@/lib/settings/types";

/** Crew sizes 2–10; 11 represents 10+. */
export const CREW_SIZE_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

export type CrewSizeId = (typeof CREW_SIZE_OPTIONS)[number];

export function crewSizeLabel(size: CrewSizeId): string {
  return size >= 11 ? "10+" : String(size);
}

export type CrewSizeHourlyRate = {
  crewSize: CrewSizeId;
  hourlyRate: number;
  minimumHoursLocal: number;
  minimumHoursLongDistance: number;
};

export type TravelChargeMethod =
  | "flat_round_trip"
  | "split_depot_legs"
  | "clocked_between_stops"
  | "flat_travel_only";

export const TRAVEL_CHARGE_METHOD_LABELS: Record<TravelChargeMethod, string> = {
  flat_round_trip: "Flat round trip (depot → home → depot)",
  split_depot_legs: "Split legs (depot → origin, destination → depot)",
  clocked_between_stops: "On the clock between stops (local)",
  flat_travel_only: "Flat travel fee only — not on the clock (long distance)",
};

export type MoveTypePricingId = "local" | "long_distance" | "commercial" | "labor_only";

export const MOVE_TYPE_PRICING_IDS: MoveTypePricingId[] = [
  "local",
  "long_distance",
  "commercial",
  "labor_only",
];

export const MOVE_TYPE_PRICING_LABELS: Record<MoveTypePricingId, string> = {
  local: "Local",
  long_distance: "Long distance",
  commercial: "Commercial",
  labor_only: "Labor only",
};

export type TravelFeeConfig = {
  method: TravelChargeMethod;
  /** Used for flat_round_trip and flat_travel_only. */
  flatAmount: number;
  /** Depot → origin (split legs). */
  depotToOrigin: number;
  /** Destination → depot (split legs). */
  destinationToDepot: number;
};

export type TravelFeesByMoveType = Record<MoveTypePricingId, TravelFeeConfig>;

export type ServiceFeeStandards = {
  dumpFee: number;
  cratingFrom: number;
  cratingHourly?: number;
  applianceFee: number;
  stairCarryFee: number;
  packingLaborPerHour: number;
};

export type FlatRateQuoteSettings = {
  inventoryBasis: FlatRateInventoryBasis;
  /** Rate per cubic foot or per pound — used by AI / manual flat quotes. */
  ratePerUnit: number;
  minimumCharge: number;
};

export type HourlyQuoteSettings = {
  /** @deprecated Legacy single rate — use crewRates; kept for snapshots. */
  travelFee: number;
  /** @deprecated Legacy — use crewRates minimumHoursLocal. */
  minimumHours: number;
  dumpFee: number;
  cratingFrom: number;
  crewRates: CrewSizeHourlyRate[];
  travelByMoveType: TravelFeesByMoveType;
  serviceFees: ServiceFeeStandards;
};

export type PricingPackageSettings = {
  defaultPricingType: "hourly" | "flat_rate";
  hourly: HourlyQuoteSettings;
  flatRate: FlatRateQuoteSettings;
};

const defaultTravel = (method: TravelChargeMethod, flat: number): TravelFeeConfig => ({
  method,
  flatAmount: flat,
  depotToOrigin: Math.round(flat * 0.55),
  destinationToDepot: Math.round(flat * 0.45),
});

export const DEFAULT_SERVICE_FEES: ServiceFeeStandards = {
  dumpFee: 85,
  cratingFrom: 175,
  cratingHourly: 95,
  applianceFee: 45,
  stairCarryFee: 75,
  packingLaborPerHour: 65,
};

export const DEFAULT_FLAT_RATE_SETTINGS: FlatRateQuoteSettings = {
  inventoryBasis: "cubic_feet",
  ratePerUnit: 4.25,
  minimumCharge: 695,
};

export function defaultCrewRates(baseRate = 185, minLocal = 3, minLd = 4): CrewSizeHourlyRate[] {
  return CREW_SIZE_OPTIONS.map((crewSize) => {
    const scale = crewSize >= 11 ? 1.35 : 1 + (crewSize - 2) * 0.08;
    return {
      crewSize,
      hourlyRate: Math.round(baseRate * scale),
      minimumHoursLocal: minLocal,
      minimumHoursLongDistance: minLd,
    };
  });
}

export const DEFAULT_HOURLY_QUOTE_SETTINGS: HourlyQuoteSettings = {
  travelFee: 150,
  minimumHours: 3,
  dumpFee: 85,
  cratingFrom: 175,
  crewRates: defaultCrewRates(185, 3, 4),
  travelByMoveType: {
    local: defaultTravel("clocked_between_stops", 0),
    long_distance: defaultTravel("flat_travel_only", 450),
    commercial: defaultTravel("clocked_between_stops", 175),
    labor_only: defaultTravel("clocked_between_stops", 0),
  },
  serviceFees: { ...DEFAULT_SERVICE_FEES },
};

export function defaultPricingPackage(): PricingPackageSettings {
  return {
    defaultPricingType: "flat_rate",
    hourly: { ...DEFAULT_HOURLY_QUOTE_SETTINGS, crewRates: defaultCrewRates() },
    flatRate: { ...DEFAULT_FLAT_RATE_SETTINGS },
  };
}

function normalizeCrewRates(
  raw: Partial<CrewSizeHourlyRate>[] | undefined,
  legacyRate: number,
  legacyMin: number,
): CrewSizeHourlyRate[] {
  const defaults = defaultCrewRates(legacyRate, legacyMin, legacyMin + 1);
  if (!raw?.length) return defaults;
  return CREW_SIZE_OPTIONS.map((crewSize) => {
    const saved = raw.find((r) => r.crewSize === crewSize);
    const fallback = defaults.find((d) => d.crewSize === crewSize)!;
    return {
      crewSize,
      hourlyRate:
        typeof saved?.hourlyRate === "number" && saved.hourlyRate > 0
          ? saved.hourlyRate
          : fallback.hourlyRate,
      minimumHoursLocal:
        typeof saved?.minimumHoursLocal === "number" && saved.minimumHoursLocal > 0
          ? saved.minimumHoursLocal
          : fallback.minimumHoursLocal,
      minimumHoursLongDistance:
        typeof saved?.minimumHoursLongDistance === "number" && saved.minimumHoursLongDistance > 0
          ? saved.minimumHoursLongDistance
          : fallback.minimumHoursLongDistance,
    };
  });
}

function normalizeTravelConfig(
  raw: Partial<TravelFeeConfig> | undefined,
  fallback: TravelFeeConfig,
): TravelFeeConfig {
  if (!raw) return fallback;
  const method =
    raw.method && raw.method in TRAVEL_CHARGE_METHOD_LABELS ? raw.method : fallback.method;
  return {
    method,
    flatAmount: typeof raw.flatAmount === "number" ? raw.flatAmount : fallback.flatAmount,
    depotToOrigin:
      typeof raw.depotToOrigin === "number" ? raw.depotToOrigin : fallback.depotToOrigin,
    destinationToDepot:
      typeof raw.destinationToDepot === "number"
        ? raw.destinationToDepot
        : fallback.destinationToDepot,
  };
}

function normalizeTravelByMoveType(
  raw: Partial<TravelFeesByMoveType> | undefined,
  legacyTravelFee: number,
): TravelFeesByMoveType {
  const defaults = DEFAULT_HOURLY_QUOTE_SETTINGS.travelByMoveType;
  const migrated = { ...defaults };
  if (!raw && legacyTravelFee > 0) {
    migrated.local = defaultTravel("clocked_between_stops", legacyTravelFee);
    migrated.commercial = defaultTravel("clocked_between_stops", legacyTravelFee);
    migrated.long_distance = defaultTravel("flat_travel_only", legacyTravelFee * 2);
  }
  for (const id of MOVE_TYPE_PRICING_IDS) {
    migrated[id] = normalizeTravelConfig(raw?.[id], migrated[id]);
  }
  return migrated;
}

export function normalizeHourlyQuoteSettings(
  raw: Partial<HourlyQuoteSettings> | null | undefined,
): HourlyQuoteSettings {
  const legacyRate = typeof raw?.travelFee === "number" ? raw.travelFee : 150;
  const legacyMin =
    typeof raw?.minimumHours === "number" && raw.minimumHours > 0 ? raw.minimumHours : 3;
  const legacyCrewRate =
    typeof (raw as { hourlyCrewRate?: number })?.hourlyCrewRate === "number"
      ? (raw as { hourlyCrewRate: number }).hourlyCrewRate
      : 185;

  const serviceDefaults = DEFAULT_SERVICE_FEES;
  const serviceRaw = raw?.serviceFees;
  return {
    travelFee: legacyRate,
    minimumHours: legacyMin,
    dumpFee: typeof raw?.dumpFee === "number" ? raw.dumpFee : serviceDefaults.dumpFee,
    cratingFrom: typeof raw?.cratingFrom === "number" ? raw.cratingFrom : serviceDefaults.cratingFrom,
    crewRates: normalizeCrewRates(raw?.crewRates, legacyCrewRate, legacyMin),
    travelByMoveType: normalizeTravelByMoveType(raw?.travelByMoveType, legacyRate),
    serviceFees: {
      dumpFee: serviceRaw?.dumpFee ?? raw?.dumpFee ?? serviceDefaults.dumpFee,
      cratingFrom: serviceRaw?.cratingFrom ?? raw?.cratingFrom ?? serviceDefaults.cratingFrom,
      cratingHourly: serviceRaw?.cratingHourly ?? serviceDefaults.cratingHourly,
      applianceFee: serviceRaw?.applianceFee ?? serviceDefaults.applianceFee,
      stairCarryFee: serviceRaw?.stairCarryFee ?? serviceDefaults.stairCarryFee,
      packingLaborPerHour: serviceRaw?.packingLaborPerHour ?? serviceDefaults.packingLaborPerHour,
    },
  };
}

export function normalizeFlatRateQuoteSettings(
  raw: Partial<FlatRateQuoteSettings> | null | undefined,
): FlatRateQuoteSettings {
  const defaults = DEFAULT_FLAT_RATE_SETTINGS;
  return {
    inventoryBasis: raw?.inventoryBasis === "weight" ? "weight" : defaults.inventoryBasis,
    ratePerUnit:
      typeof raw?.ratePerUnit === "number" && raw.ratePerUnit > 0
        ? raw.ratePerUnit
        : defaults.ratePerUnit,
    minimumCharge:
      typeof raw?.minimumCharge === "number" && raw.minimumCharge > 0
        ? raw.minimumCharge
        : defaults.minimumCharge,
  };
}

export function resolveCrewHourlyRate(
  settings: HourlyQuoteSettings,
  crewSize: number,
): CrewSizeHourlyRate {
  const normalized = normalizeHourlyQuoteSettings(settings);
  const id: CrewSizeId =
    crewSize >= 10 ? 11 : (Math.max(2, Math.min(10, crewSize)) as CrewSizeId);
  return (
    normalized.crewRates.find((r) => r.crewSize === id) ??
    normalized.crewRates.find((r) => r.crewSize === 4) ??
    normalized.crewRates[0]!
  );
}

export function legacyHourlyCrewRate(settings: HourlyQuoteSettings): number {
  return resolveCrewHourlyRate(settings, 4).hourlyRate;
}
