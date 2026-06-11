export const ALL_LOCATIONS_SCOPE = "all" as const;

export const DEFAULT_COMPANY_ID = "co-jonahs-movers";
export const DEFAULT_PRIMARY_LOCATION_ID = "loc-tomball";

/** Seeded on the primary branch for demo / post-move review portal. */
export const DEFAULT_PRIMARY_GOOGLE_REVIEW_URL =
  "https://g.page/r/jonahs-movers-tomball/review";

/** Legacy ids remapped on load to the primary branch. */
export const LEGACY_LOCATION_IDS = ["loc-houston", "loc-woodlands"] as const;
