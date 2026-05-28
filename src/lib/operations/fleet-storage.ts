import { defaultFleetStore } from "./fleet-defaults";
import type { FleetStore } from "./fleet-types";

const STORAGE_KEY = "jm-fleet-store-v1";

export function loadFleetStore(): FleetStore {
  if (typeof window === "undefined") return defaultFleetStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultFleetStore();
    const parsed = JSON.parse(raw) as Partial<FleetStore>;
    const defaults = defaultFleetStore();
    return {
      crew: parsed.crew?.length ? parsed.crew : defaults.crew,
      trucks: parsed.trucks?.length ? parsed.trucks : defaults.trucks,
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
