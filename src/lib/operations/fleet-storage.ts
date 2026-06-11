import { defaultFleetStore } from "./fleet-defaults";
import { normalizeFleetTruck, normalizeTemporaryRental } from "./fleet-types";
import type { FleetStore } from "./fleet-types";

const STORAGE_KEY = "jm-fleet-store-v1";

const CREW_ROLE_PATCH_IDS = new Set(["crew-marcus", "crew-devon"]);

function patchCrewRolesFromDefaults(
  crew: FleetStore["crew"],
  defaults: FleetStore["crew"],
): FleetStore["crew"] {
  const defaultById = new Map(defaults.map((c) => [c.id, c]));
  return crew.map((member) => {
    if (!CREW_ROLE_PATCH_IDS.has(member.id)) return member;
    const fallback = defaultById.get(member.id);
    return fallback ? { ...member, roles: fallback.roles } : member;
  });
}

export function loadFleetStore(): FleetStore {
  if (typeof window === "undefined") return defaultFleetStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultFleetStore();
    const parsed = JSON.parse(raw) as Partial<FleetStore>;
    const defaults = defaultFleetStore();
    return {
      crew: patchCrewRolesFromDefaults(
        parsed.crew?.length ? parsed.crew : defaults.crew,
        defaults.crew,
      ),
      trucks: parsed.trucks?.length
        ? parsed.trucks.map((t) =>
            normalizeFleetTruck(t as Parameters<typeof normalizeFleetTruck>[0]),
          )
        : defaults.trucks,
      temporaryRentals: Array.isArray(parsed.temporaryRentals)
        ? parsed.temporaryRentals.map((r) =>
            normalizeTemporaryRental(r as Parameters<typeof normalizeTemporaryRental>[0]),
          )
        : defaults.temporaryRentals,
      schedules: parsed.schedules?.length ? parsed.schedules : defaults.schedules,
      timeOffRequests: parsed.timeOffRequests ?? defaults.timeOffRequests,
      truckOutages: parsed.truckOutages ?? defaults.truckOutages,
      maintenance: parsed.maintenance?.length ? parsed.maintenance : defaults.maintenance,
    };
  } catch {
    return defaultFleetStore();
  }
}

export function saveFleetStore(store: FleetStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function generateFleetId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}`;
}
