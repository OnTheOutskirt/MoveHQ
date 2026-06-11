import type { CrewAppRole } from "./types";

export function isSkipperRole(role: CrewAppRole): boolean {
  return role === "skipper";
}

export function canSeePricing(role: CrewAppRole): boolean {
  return role === "skipper";
}

export function canSeeCustomerPhone(role: CrewAppRole): boolean {
  return role === "skipper";
}

export function canManageTruckAndCrew(role: CrewAppRole): boolean {
  return role === "skipper";
}

export function hasAppRole(appRoles: CrewAppRole[], role: CrewAppRole): boolean {
  return appRoles.includes(role);
}

/** Customer inventory, contents summary, and shop load checklist — skipper profile only. */
export function canSeeInventory(appRoles: CrewAppRole[]): boolean {
  return hasAppRole(appRoles, "skipper");
}

/** Skippers and drivers can capture field photos on jobs. */
export function canCaptureFieldMedia(jobRole: CrewAppRole): boolean {
  return jobRole === "skipper" || jobRole === "driver";
}

/** Office / ops staff capture from the operations workspace (not crew job role). */
export function canCaptureFieldMediaOps(): boolean {
  return true;
}

export function formatAddressForRole(address: string, role: CrewAppRole): string {
  if (role !== "mover") return address;
  return extractZipFromAddress(address) ?? "—";
}

export function formatRouteForRole(
  origin: string,
  destination: string,
  role: CrewAppRole,
): string {
  if (role !== "mover") return `${origin} → ${destination}`;
  const from = extractZipFromAddress(origin) ?? "—";
  const to = extractZipFromAddress(destination) ?? "—";
  return `${from} → ${to}`;
}

function extractZipFromAddress(address: string): string | null {
  const match = address.match(/\b(\d{5})(?:-\d{4})?\b/);
  return match ? match[1]! : null;
}
