/** Providers supported for address-based property search links. */
export type PropertyListingProviderId = "zillow" | "redfin" | "realtor";

const PROVIDER_LABELS: Record<PropertyListingProviderId, string> = {
  zillow: "Zillow",
  redfin: "Redfin",
  realtor: "Realtor.com",
};

/**
 * Normalizes a street address into a URL path segment (no commas, spaces → hyphens).
 * Returns null when the input is empty or cannot produce a usable slug.
 */
export function addressToListingSlug(address: string | null | undefined): string | null {
  if (address == null) return null;
  const trimmed = address.trim();
  if (!trimmed) return null;

  const slug = trimmed
    .replace(/,/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug.length > 0 ? slug : null;
}

function buildZillowHomesSearchUrl(slug: string): string {
  return `https://www.zillow.com/homes/${slug}_rb/`;
}

/**
 * Builds a provider-specific property search URL from a full address string.
 * Zillow uses `/homes/{slug}_rb/` (not `/homedetails/`, which requires ZPID).
 */
export function buildPropertyListingSearchUrl(
  provider: PropertyListingProviderId,
  address: string | null | undefined,
): string | null {
  const slug = addressToListingSlug(address);
  if (!slug) return null;

  switch (provider) {
    case "zillow":
      return buildZillowHomesSearchUrl(slug);
    case "redfin":
    case "realtor":
      return null;
    default:
      return null;
  }
}

export function propertyListingProviderLabel(provider: PropertyListingProviderId): string {
  return PROVIDER_LABELS[provider];
}
