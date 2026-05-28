import { formatIntakeAddress } from "./intake-display";
import type { IntakeAddress, IntakeLocationType } from "./flat-rate-intake";
import { INTAKE_LOCATION_TYPES } from "./flat-rate-intake";
import type { JobDayLocation, JobDayLocationRole, MoveJobDay, MoveRecord } from "./types";

export { INTAKE_LOCATION_TYPES };

export type KnownJobDayLocation = {
  key: string;
  label: string;
  street: string;
  cityStateZip: string;
  locationType: IntakeLocationType | "";
  formattedAddress: string;
};

export const SCOPE_ORIGIN_KEY = "scope-origin";
export const SCOPE_DESTINATION_KEY = "scope-destination";
export const CUSTOM_LOCATION_KEY = "__custom__";

export function scopeOriginForMove(move: MoveRecord): JobDayLocation | null {
  const { intake } = move;
  if (intake.jobType === "unpack-only") return null;
  if (!intake.origin.street && !intake.origin.cityStateZip) return null;
  return locationFromIntake(intake.origin, "origin", "scope-origin");
}

export function scopeDestinationForMove(move: MoveRecord): JobDayLocation | null {
  const { intake } = move;
  if (["pack-only", "in-facility", "in-home-rearrange", "junk"].includes(intake.jobType)) {
    return null;
  }
  if (!intake.destination.street && !intake.destination.cityStateZip) return null;
  return locationFromIntake(intake.destination, "destination", "scope-destination");
}

export function locationsMatch(a: JobDayLocation, b: JobDayLocation): boolean {
  const fa = formatJobDayLocationAddress(a).toLowerCase();
  const fb = formatJobDayLocationAddress(b).toLowerCase();
  return fa.length > 0 && fa === fb;
}

export function resolveLocationSelectKey(
  loc: JobDayLocation,
  scopeDefault: JobDayLocation | null,
  knownLocations: KnownJobDayLocation[],
): string {
  if (scopeDefault && locationsMatch(loc, scopeDefault)) {
    return scopeDefault.role === "origin" ? SCOPE_ORIGIN_KEY : SCOPE_DESTINATION_KEY;
  }
  const formatted = formatJobDayLocationAddress(loc);
  if (!formatted.trim()) {
    return scopeDefault
      ? scopeDefault.role === "origin"
        ? SCOPE_ORIGIN_KEY
        : SCOPE_DESTINATION_KEY
      : CUSTOM_LOCATION_KEY;
  }
  const known = knownLocations.find((k) => k.formattedAddress === formatted);
  if (known) return known.key;
  return CUSTOM_LOCATION_KEY;
}

export function formatJobDayLocationAddress(loc: Pick<
  JobDayLocation,
  "street" | "cityStateZip" | "formattedAddress"
>): string {
  if (loc.formattedAddress.trim()) return loc.formattedAddress.trim();
  return [loc.street, loc.cityStateZip].filter(Boolean).join(", ") || "";
}

export function googleMapsSearchUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

/** Ordered route points (origin → stops → destination) with non-empty addresses. */
export function routeAddressesFromLocations(locations: JobDayLocation[]): string[] {
  const origin = locations.find((l) => l.role === "origin");
  const stops = locations.filter((l) => l.role === "stop");
  const destination = locations.find((l) => l.role === "destination");
  return [origin, ...stops, destination]
    .filter((l): l is JobDayLocation => l != null)
    .map((l) => formatJobDayLocationAddress(l))
    .filter((a) => a.trim().length > 0);
}

export function googleMapsDirectionsUrl(locations: JobDayLocation[]): string | null {
  const route = routeAddressesFromLocations(locations);
  if (route.length < 2) return null;
  return `https://www.google.com/maps/dir/${route.map((p) => encodeURIComponent(p)).join("/")}`;
}

/** Embed URL for full route preview (no API key). */
export function googleMapsRouteEmbedUrl(locations: JobDayLocation[]): string | null {
  const route = routeAddressesFromLocations(locations);
  if (route.length < 2) return null;
  if (route.length === 2) {
    return `https://maps.google.com/maps?f=d&saddr=${encodeURIComponent(route[0]!)}&daddr=${encodeURIComponent(route[1]!)}&output=embed`;
  }
  const origin = route[0]!;
  const destination = route[route.length - 1]!;
  const waypoints = route.slice(1, -1).map((p) => encodeURIComponent(p)).join("%7C");
  return `https://maps.google.com/maps?f=d&saddr=${encodeURIComponent(origin)}&daddr=${encodeURIComponent(destination)}&waypoints=${waypoints}&output=embed`;
}

/** Placeholder — residential property lookup (HAR / county records). */
export function harPropertySearchUrl(address: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(`${address} property records site:auditor`)}`;
}

export function isHouseLocationType(type: IntakeLocationType | ""): boolean {
  return ["single-story", "2-story", "townhouse"].includes(type);
}

export function locationFromIntake(
  addr: IntakeAddress,
  role: JobDayLocationRole,
  id?: string,
): JobDayLocation {
  const formatted = formatIntakeAddress(addr);
  return {
    id: id ?? `loc-${role}-${Date.now()}`,
    role,
    formattedAddress: formatted,
    street: addr.street,
    cityStateZip: addr.cityStateZip,
    locationType: addr.locationType,
    accessNotes: Object.entries(addr.access)
      .filter(([, v]) => v)
      .map(([, v]) => v)
      .join(" · ") || undefined,
  };
}

export function emptyJobDayLocation(role: JobDayLocationRole, label?: string): JobDayLocation {
  return {
    id: `loc-${role}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    role,
    label,
    formattedAddress: "",
    street: "",
    cityStateZip: "",
    locationType: "",
  };
}

export function collectKnownLocations(move: MoveRecord): KnownJobDayLocation[] {
  const seen = new Set<string>();
  const out: KnownJobDayLocation[] = [];

  function add(
    key: string,
    label: string,
    street: string,
    cityStateZip: string,
    locationType: IntakeLocationType | "",
  ) {
    const formatted = [street, cityStateZip].filter(Boolean).join(", ");
    if (!formatted || seen.has(formatted)) return;
    seen.add(formatted);
    out.push({ key, label, street, cityStateZip, locationType, formattedAddress: formatted });
  }

  const { intake } = move;
  if (intake.origin.street || intake.origin.cityStateZip) {
    add(
      SCOPE_ORIGIN_KEY,
      "Origin (scope of work)",
      intake.origin.street,
      intake.origin.cityStateZip,
      intake.origin.locationType,
    );
  }
  if (intake.destination.street || intake.destination.cityStateZip) {
    add(
      SCOPE_DESTINATION_KEY,
      "Destination (scope of work)",
      intake.destination.street,
      intake.destination.cityStateZip,
      intake.destination.locationType,
    );
  }
  for (const stop of intake.stops) {
    add(
      `intake-stop-${stop.id}`,
      `Intake — ${stop.label}`,
      stop.street,
      stop.cityStateZip,
      stop.locationType,
    );
  }

  if (move.originAddress) {
    add("move-origin", "Move — Origin (summary)", move.originAddress, "", "");
  }
  if (move.destinationAddress) {
    add("move-destination", "Move — Destination (summary)", move.destinationAddress, "", "");
  }

  for (const day of move.jobDays) {
    for (const loc of day.locations ?? []) {
      const formatted = formatJobDayLocationAddress(loc);
      if (!formatted) continue;
      const roleLabel =
        loc.role === "origin"
          ? "Origin"
          : loc.role === "destination"
            ? "Destination"
            : loc.label ?? "Stop";
      add(`day-${day.id}-${loc.id}`, `${day.label} — ${roleLabel}`, loc.street, loc.cityStateZip, loc.locationType);
    }
    if (day.originNote) {
      add(`day-${day.id}-origin-note`, `${day.label} — From`, day.originNote, "", "");
    }
    if (day.destinationNote) {
      add(`day-${day.id}-dest-note`, `${day.label} — To`, day.destinationNote, "", "");
    }
  }

  return out;
}

export function applyKnownLocation(
  loc: JobDayLocation,
  known: KnownJobDayLocation,
): JobDayLocation {
  return {
    ...loc,
    street: known.street,
    cityStateZip: known.cityStateZip,
    locationType: known.locationType,
    formattedAddress: known.formattedAddress,
  };
}

export function syncLocationFormattedAddress(loc: JobDayLocation): JobDayLocation {
  const formatted = [loc.street, loc.cityStateZip].filter(Boolean).join(", ");
  return { ...loc, formattedAddress: formatted || loc.formattedAddress };
}

export function locationsFromLegacyNotes(day: MoveJobDay): JobDayLocation[] {
  const out: JobDayLocation[] = [];
  if (day.originNote?.trim()) {
    out.push({
      id: `${day.id}-origin`,
      role: "origin",
      formattedAddress: day.originNote.trim(),
      street: day.originNote.trim(),
      cityStateZip: "",
      locationType: "",
    });
  }
  if (day.destinationNote?.trim()) {
    out.push({
      id: `${day.id}-destination`,
      role: "destination",
      formattedAddress: day.destinationNote.trim(),
      street: day.destinationNote.trim(),
      cityStateZip: "",
      locationType: "",
    });
  }
  if (day.stopsNote?.trim()) {
    day.stopsNote.split(/[;|]/).forEach((part, i) => {
      const t = part.trim();
      if (!t) return;
      out.push({
        id: `${day.id}-stop-${i}`,
        role: "stop",
        label: `Stop ${i + 1}`,
        formattedAddress: t,
        street: t,
        cityStateZip: "",
        locationType: "",
      });
    });
  }
  return out;
}

export function resolveJobDayLocations(day: MoveJobDay): JobDayLocation[] {
  if (day.locations && day.locations.length > 0) return day.locations;
  return locationsFromLegacyNotes(day);
}

export function syncLegacyLocationNotes(day: MoveJobDay): Pick<
  MoveJobDay,
  "originNote" | "destinationNote" | "stopsNote" | "locations"
> {
  const locations = (day.locations ?? resolveJobDayLocations(day)).map(syncLocationFormattedAddress);
  const origin = locations.find((l) => l.role === "origin");
  const destination = locations.find((l) => l.role === "destination");
  const stops = locations.filter((l) => l.role === "stop");

  return {
    locations,
    originNote: origin ? formatJobDayLocationAddress(origin) : undefined,
    destinationNote: destination ? formatJobDayLocationAddress(destination) : undefined,
    stopsNote:
      stops.length > 0
        ? stops.map((s) => formatJobDayLocationAddress(s)).join(" · ")
        : undefined,
  };
}

export function defaultLocationsForNewDay(move: MoveRecord): JobDayLocation[] {
  const locs: JobDayLocation[] = [];
  const origin = scopeOriginForMove(move);
  const destination = scopeDestinationForMove(move);
  if (origin) locs.push({ ...origin, id: "loc-origin-default" });
  if (destination) locs.push({ ...destination, id: "loc-dest-default" });
  return locs;
}
