/** City / state / ZIP helpers for intake and job-day locations. */

export const INTAKE_ACCESS_FIELDS = [
  { key: "stories", label: "Stories" },
  { key: "entrySteps", label: "Entry steps" },
  { key: "walk", label: "Walk to truck" },
  { key: "elevator", label: "Elevator" },
  { key: "hoa", label: "HOA rules" },
  { key: "coi", label: "COI" },
] as const;

export function parseCityStateZip(combined: string): {
  city: string;
  state: string;
  zip: string;
} {
  const raw = combined.trim();
  if (!raw) return { city: "", state: "", zip: "" };

  const zipMatch = raw.match(/(\d{5}(?:-\d{4})?)\s*$/);
  const zip = zipMatch ? zipMatch[1]! : "";
  let rest = zipMatch ? raw.slice(0, zipMatch.index).trim() : raw;
  rest = rest.replace(/,\s*$/, "");

  const parts = rest.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const state = parts[parts.length - 1]!;
    const city = parts.slice(0, -1).join(", ");
    return { city, state, zip };
  }

  const stateZip = rest.match(/^(.+?)\s+([A-Z]{2})$/i);
  if (stateZip) {
    return { city: stateZip[1]!.trim(), state: stateZip[2]!.toUpperCase(), zip };
  }

  return { city: rest, state: "", zip };
}

export function formatCityStateZip(city: string, state: string, zip: string): string {
  const c = city.trim();
  const s = state.trim();
  const z = zip.trim();
  if (!c && !s && !z) return "";
  if (c && s && z) return `${c}, ${s} ${z}`;
  if (c && s) return `${c}, ${s}`;
  if (c && z) return `${c} ${z}`;
  return c || s || z;
}

export function formatStreetCityStateZip(street: string, city: string, state: string, zip: string): string {
  const line2 = formatCityStateZip(city, state, zip);
  return [street.trim(), line2].filter(Boolean).join(", ") || "";
}
