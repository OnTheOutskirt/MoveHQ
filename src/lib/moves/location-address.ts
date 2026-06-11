/** City / state / ZIP helpers for intake and job-day locations. */

/** @deprecated Intake tab still stores HOA/COI on access records when present. */
export const INTAKE_ACCESS_FIELDS = [
  { key: "stories", label: "Stories" },
  { key: "entrySteps", label: "Entry steps" },
  { key: "walk", label: "Walk to truck" },
  { key: "elevator", label: "Elevator" },
  { key: "hoa", label: "HOA rules" },
  { key: "coi", label: "COI" },
] as const;

export const JOB_DAY_ACCESS_FIELDS = [
  {
    key: "stories",
    label: "Stories",
    options: ["", "1 story", "2 story", "3 story", "4+ story"],
  },
  {
    key: "entrySteps",
    label: "Entry steps",
    options: ["", "No", "Yes — few steps", "Yes — many steps"],
  },
  {
    key: "walk",
    label: "Walk to truck",
    options: ["", "Under 50 ft", "50–100 ft", "100–200 ft", "200+ ft"],
  },
  {
    key: "elevator",
    label: "Elevator",
    options: ["", "N/A", "Standard", "Freight", "Reserved"],
  },
] as const;

export type JobDayAccessFieldKey = (typeof JOB_DAY_ACCESS_FIELDS)[number]["key"];

export function buildJobDayAccessNotes(
  access?: Record<string, string>,
): string | undefined {
  const parts = JOB_DAY_ACCESS_FIELDS.map((field) => access?.[field.key]?.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

/** Parse a single-line address into structured job-day location fields. */
export function parseSingleLineAddress(
  line: string,
  defaultState = "",
): {
  street: string;
  city: string;
  state: string;
  zip: string;
  cityStateZip: string;
  formattedAddress: string;
} {
  const trimmed = line.trim();
  if (!trimmed) {
    return {
      street: "",
      city: "",
      state: defaultState,
      zip: "",
      cityStateZip: "",
      formattedAddress: "",
    };
  }

  const parts = trimmed.split(",").map((part) => part.trim()).filter(Boolean);
  let street = trimmed;
  let city = "";
  let state = defaultState;
  let zip = "";

  if (parts.length >= 3) {
    street = parts[0] ?? "";
    city = parts[1] ?? "";
    const tail = parseCityStateZip(parts.slice(2).join(", "));
    state = tail.state || defaultState;
    zip = tail.zip;
  } else if (parts.length === 2) {
    street = parts[0] ?? "";
    const tail = parseCityStateZip(parts[1] ?? "");
    city = tail.city;
    state = tail.state || defaultState;
    zip = tail.zip;
  }

  const cityStateZip = formatCityStateZip(city, state, zip);
  const formattedAddress =
    formatStreetCityStateZip(street, city, state, zip) ||
    [street, cityStateZip].filter(Boolean).join(", ") ||
    trimmed;

  return { street, city, state, zip, cityStateZip, formattedAddress };
}

export const US_STATE_OPTIONS = [
  "",
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "DC",
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
