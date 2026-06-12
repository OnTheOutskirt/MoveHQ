import {
  resolveVendorDirectoryLabel,
  resolveVendorDirectoryOption,
} from "@/lib/people/vendors";

export type ClaimVendor = {
  id: string;
  name: string;
  specialty: string;
  contactEmail: string;
  phone?: string;
  portalUrl?: string;
  notes?: string;
};

/** Legacy demo vendors — kept for older claim rows stored before directory integration. */
export const CLAIM_VENDORS: ClaimVendor[] = [
  {
    id: "vendor-movebees",
    name: "MoveBees",
    specialty: "Damage repair & furniture restoration",
    contactEmail: "claims@movebees.example",
    phone: "(800) 555-6623",
    portalUrl: "https://movebees.example/submit-claim",
    notes: "Preferred for wood floor gouges, wall touch-up, and furniture repair.",
  },
  {
    id: "vendor-ahm",
    name: "AHM Restoration",
    specialty: "Structural & drywall repair",
    contactEmail: "intake@ahmrestoration.example",
    phone: "(216) 555-4410",
    portalUrl: "https://ahmrestoration.example/claims",
    notes: "Use for stair landings, drywall, and paint-match work.",
  },
  {
    id: "vendor-shamrock",
    name: "Shamrock Crating & Fine Art",
    specialty: "Crating, art, piano damage",
    contactEmail: "dispatch@shamrockcrating.example",
    phone: "(216) 555-3310",
    notes: "Specialty items — coordinate with move third-party services.",
  },
  {
    id: "vendor-insurance-adjuster",
    name: "Valuation / insurance adjuster",
    specialty: "High-value or liability claims",
    contactEmail: "claims@valuation.example",
    notes: "Internal escalation when claim exceeds quick-settle threshold.",
  },
];

export function getClaimVendor(id: string | undefined): ClaimVendor | undefined {
  if (!id) return undefined;
  return CLAIM_VENDORS.find((v) => v.id === id);
}

export function claimVendorLabel(vendorDirectoryId: string | undefined): string {
  if (!vendorDirectoryId) return "No vendor selected";
  const label = resolveVendorDirectoryLabel(vendorDirectoryId);
  if (label) return label;
  return getClaimVendor(vendorDirectoryId)?.name ?? vendorDirectoryId;
}

export function claimVendorContact(vendorDirectoryId: string | undefined): {
  email: string | null;
  phone: string | null;
  portalUrl?: string;
  specialty?: string;
} {
  const option = resolveVendorDirectoryOption(vendorDirectoryId);
  if (option) {
    return {
      email: option.email,
      phone: option.phone,
    };
  }
  const legacy = getClaimVendor(vendorDirectoryId);
  if (legacy) {
    return {
      email: legacy.contactEmail,
      phone: legacy.phone ?? null,
      portalUrl: legacy.portalUrl,
      specialty: legacy.specialty,
    };
  }
  return { email: null, phone: null };
}
