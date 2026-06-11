import { ALL_LOCATIONS_SCOPE } from "./constants";
import type { ActiveLocationScope } from "./types";

const STORAGE_KEY = "jm-active-location-v1";

type ActiveContextStore = Record<string, ActiveLocationScope>;

function readStore(): ActiveContextStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ActiveContextStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: ActiveContextStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function loadActiveLocationScope(userId: string): ActiveLocationScope | null {
  const scope = readStore()[userId];
  if (!scope || typeof scope !== "string") return null;
  return scope;
}

export function saveActiveLocationScope(userId: string, scope: ActiveLocationScope): void {
  const store = readStore();
  store[userId] = scope;
  writeStore(store);
}

export function clearActiveLocationScope(userId: string): void {
  const store = readStore();
  delete store[userId];
  writeStore(store);
}

export { ALL_LOCATIONS_SCOPE };
