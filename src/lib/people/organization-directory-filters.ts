import type {
  OrganizationRecord,
  OrganizationType,
  PersonKind,
  PersonRecord,
} from "@/lib/people/types";

export type DirectoryKindFilter = "all" | PersonKind;

const REFERRAL_ORG_TYPES: OrganizationType[] = [
  "realtor",
  "storage_facility",
  "developer",
  "restoration_company",
  "senior_living",
  "apartment_complex",
];

export function peopleAtOrganization(orgId: string, people: PersonRecord[]): PersonRecord[] {
  return people.filter((p) => p.organizationId === orgId);
}

export function organizationMatchesKindFilter(
  org: OrganizationRecord,
  kind: PersonKind,
  people: PersonRecord[],
): boolean {
  const linked = peopleAtOrganization(org.id, people);
  switch (kind) {
    case "customer":
      return linked.some((p) => p.kind === "customer");
    case "lead":
      return linked.some((p) => p.kind === "lead");
    case "referral":
      return (
        REFERRAL_ORG_TYPES.includes(org.orgType) || linked.some((p) => p.kind === "referral")
      );
    case "vendor":
      return org.orgType === "vendor";
    case "other":
      return org.orgType === "other" || org.orgType === "commercial";
    default:
      return false;
  }
}

export function organizationMatchesReferralTypeFilter(
  org: OrganizationRecord,
  referralTypeId: string,
  people: PersonRecord[],
): boolean {
  if (org.orgType === referralTypeId) return true;
  return peopleAtOrganization(org.id, people).some(
    (p) => p.kind === "referral" && p.referralType === referralTypeId,
  );
}

export function organizationMatchesVendorTypeFilter(
  org: OrganizationRecord,
  vendorTypeId: string,
  people: PersonRecord[],
): boolean {
  if (org.orgType !== "vendor") return false;
  const linkedVendors = peopleAtOrganization(org.id, people).filter((p) => p.kind === "vendor");
  if (linkedVendors.length === 0) return true;
  return linkedVendors.some((p) => p.vendorType === vendorTypeId);
}
