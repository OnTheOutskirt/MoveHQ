import { ALL_LOCATIONS_SCOPE } from "./constants";
import type { ActiveLocationScope } from "./types";

export function isAllLocationsScope(scope: ActiveLocationScope): boolean {
  return scope === ALL_LOCATIONS_SCOPE;
}

export function moveMatchesLocationScope(
  locationId: string | undefined,
  scope: ActiveLocationScope,
  allowedLocationIds: string[],
): boolean {
  if (!locationId) return true;
  if (scope === ALL_LOCATIONS_SCOPE) {
    return allowedLocationIds.includes(locationId);
  }
  return locationId === scope;
}

export function filterByLocationScope<T extends { locationId?: string }>(
  items: T[],
  scope: ActiveLocationScope,
  allowedLocationIds: string[],
): T[] {
  return items.filter((item) =>
    moveMatchesLocationScope(item.locationId, scope, allowedLocationIds),
  );
}
