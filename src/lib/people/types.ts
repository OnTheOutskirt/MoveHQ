/** Individual contact — always a person record. */
export const PERSON_KINDS = [
  "customer",
  "lead",
  "referral",
  "vendor",
  "other",
] as const;

export type PersonKind = (typeof PERSON_KINDS)[number];

/** Referral partner category — for people with kind `referral`. */
export const REFERRAL_PARTNER_TYPES = [
  "realtor",
  "storage_facility",
  "developer",
  "restoration_company",
  "senior_living",
  "insurance",
  "apartment_complex",
  "business",
  "other",
] as const;

export type ReferralPartnerType = (typeof REFERRAL_PARTNER_TYPES)[number];

/** Vendor partner category — for people with kind `vendor`. */
export const VENDOR_TYPES = [
  "truck_fleet",
  "claim_repairs",
  "operations_materials",
  "special_services",
  "hr_vendors",
  "crew_vendors",
  "fleet_repair",
] as const;

export type VendorType = (typeof VENDOR_TYPES)[number];

/** Company, facility, or place — not a substitute for a human contact. */
export const ORGANIZATION_TYPES = [
  "realtor",
  "storage_facility",
  "developer",
  "restoration_company",
  "senior_living",
  "commercial",
  "apartment_complex",
  "moving_company",
  "vendor",
  "other",
] as const;

export type OrganizationType = (typeof ORGANIZATION_TYPES)[number];

export type PersonRecord = {
  id: string;
  name: string;
  kind: PersonKind;
  /** When kind is referral — realtor, storage, developer, restoration, etc. */
  referralType: ReferralPartnerType | null;
  /** When kind is vendor — truck fleet, claim repairs, special services, etc. */
  vendorType: VendorType | string | null;
  phone: string | null;
  email: string | null;
  /** Linked organization (brokerage, facility, vendor company). */
  organizationId: string | null;
  title: string | null;
  moveIds: string[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationRecord = {
  id: string;
  name: string;
  orgType: OrganizationType;
  phone: string | null;
  email: string | null;
  address: string | null;
  website: string | null;
  primaryContactId: string | null;
  moveIds: string[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};
