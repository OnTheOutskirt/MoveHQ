export type ClaimVendor = {
  id: string;
  name: string;
  specialty: string;
  contactEmail: string;
  phone?: string;
  portalUrl?: string;
  notes?: string;
};

/** Third-party vendors for damage repair, restoration, and specialty claims. */
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

export function claimVendorLabel(id: string | undefined): string {
  return getClaimVendor(id)?.name ?? "No vendor selected";
}
