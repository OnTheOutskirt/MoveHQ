import { ALL_LOCATIONS_SCOPE } from "./constants";
import type {
  ActiveLocationScope,
  UserWorkspaceMembership,
  WorkspaceLocation,
  WorkspaceRole,
} from "./types";

const ALL_ACCESS_ROLES: WorkspaceRole[] = ["owner", "admin", "manager"];

export function canViewAllLocations(membership: UserWorkspaceMembership): boolean {
  if (membership.locationAccess === "all") return true;
  return ALL_ACCESS_ROLES.includes(membership.role);
}

export function allowedLocationIds(
  membership: UserWorkspaceMembership,
  locations: WorkspaceLocation[],
): string[] {
  const active = locations.filter((l) => l.status === "active" || l.status === "planned");
  if (canViewAllLocations(membership)) return active.map((l) => l.id);
  if (membership.locationAccess === "all") return active.map((l) => l.id);
  const allowed = new Set(membership.locationAccess);
  return active.filter((l) => allowed.has(l.id)).map((l) => l.id);
}

export function resolveActiveScope(
  requested: ActiveLocationScope,
  membership: UserWorkspaceMembership,
  locations: WorkspaceLocation[],
): ActiveLocationScope {
  const allowed = allowedLocationIds(membership, locations);
  if (requested === ALL_LOCATIONS_SCOPE) {
    return canViewAllLocations(membership) ? ALL_LOCATIONS_SCOPE : membership.primaryLocationId;
  }
  if (allowed.includes(requested)) return requested;
  if (allowed.includes(membership.primaryLocationId)) return membership.primaryLocationId;
  return allowed[0] ?? membership.primaryLocationId;
}

export function locationIdForNewRecords(
  activeScope: ActiveLocationScope,
  membership: UserWorkspaceMembership,
): string {
  if (activeScope !== ALL_LOCATIONS_SCOPE) return activeScope;
  return membership.primaryLocationId;
}
