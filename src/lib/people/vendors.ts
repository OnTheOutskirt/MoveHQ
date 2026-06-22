import { organizationMatchesVendorTypeFilter } from "@/lib/people/organization-directory-filters";
import { getOrganizationById, getOrganizationForPerson, MOCK_ORGANIZATIONS } from "@/lib/people/mock-data";
import { listAllOrganizations } from "@/lib/people/organizations-storage";
import { listAllPeople } from "@/lib/people/people-storage";
import type { OrganizationRecord, PersonRecord } from "@/lib/people/types";

export type VendorDirectoryOption = {
  id: string;
  label: string;
  phone: string | null;
  email: string | null;
  source: "person" | "organization";
  vendorTypeId: string | null;
};

function orgVendorOption(org: OrganizationRecord, people: PersonRecord[]): VendorDirectoryOption {
  const linkedVendor = people.find(
    (person) => person.organizationId === org.id && person.kind === "vendor",
  );
  return {
    id: `org:${org.id}`,
    label: org.name,
    phone: org.phone,
    email: org.email,
    source: "organization",
    vendorTypeId: linkedVendor?.vendorType ?? null,
  };
}

function personVendorOption(person: PersonRecord): VendorDirectoryOption {
  const org = getOrganizationForPerson(person);
  const label = org ? `${person.name} · ${org.name}` : person.name;
  return {
    id: `person:${person.id}`,
    label,
    phone: person.phone,
    email: person.email,
    source: "person",
    vendorTypeId: person.vendorType ?? null,
  };
}

export type ListVendorDirectoryOptionsConfig = {
  /** Move vendor picker pulls vendors from the organization directory, not individual people. */
  organizationsOnly?: boolean;
};

export function listVendorDirectoryOptions(
  vendorTypeId?: string,
  config?: ListVendorDirectoryOptionsConfig,
): VendorDirectoryOption[] {
  const organizationsOnly = config?.organizationsOnly ?? false;
  const people = listAllPeople().filter((person) => person.kind === "vendor");
  const orgs = listAllOrganizations();
  const result: VendorDirectoryOption[] = [];

  if (!organizationsOnly) {
    for (const person of people) {
      result.push(personVendorOption(person));
    }
  }

  for (const org of orgs) {
    if (org.orgType !== "vendor") continue;
    if (!organizationsOnly) {
      const covered = people.some((person) => person.organizationId === org.id);
      if (covered) continue;
    }
    result.push(orgVendorOption(org, people));
  }

  for (const org of MOCK_ORGANIZATIONS) {
    if (org.orgType !== "vendor") continue;
    if (orgs.some((stored) => stored.id === org.id)) continue;
    if (!organizationsOnly) {
      const covered = people.some((person) => person.organizationId === org.id);
      if (covered) continue;
    }
    result.push(orgVendorOption(org, people));
  }

  const sorted = result.sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
  );

  if (!vendorTypeId) return sorted;

  return sorted.filter((option) => vendorDirectoryOptionMatchesType(option, vendorTypeId, people, orgs));
}

function vendorDirectoryOptionMatchesType(
  option: VendorDirectoryOption,
  vendorTypeId: string,
  people: PersonRecord[],
  orgs: OrganizationRecord[],
): boolean {
  if (option.source === "person") {
    const personId = option.id.slice("person:".length);
    const person = people.find((entry) => entry.id === personId);
    return person?.vendorType === vendorTypeId;
  }

  const orgId = option.id.slice("org:".length);
  const org = orgs.find((entry) => entry.id === orgId) ?? getOrganizationById(orgId);
  if (!org) return false;
  return organizationMatchesVendorTypeFilter(org, vendorTypeId, listAllPeople());
}

export function resolveVendorDirectoryOption(
  vendorDirectoryId: string | null | undefined,
): VendorDirectoryOption | undefined {
  if (!vendorDirectoryId) return undefined;
  return listVendorDirectoryOptions().find((option) => option.id === vendorDirectoryId);
}

export function resolveVendorDirectoryLabel(vendorDirectoryId: string | null | undefined): string {
  if (!vendorDirectoryId) return "";
  if (vendorDirectoryId.startsWith("person:")) {
    const person = listAllPeople().find((entry) => entry.id === vendorDirectoryId.slice(7));
    return person ? personVendorOption(person).label : "";
  }
  if (vendorDirectoryId.startsWith("org:")) {
    const org = getOrganizationById(vendorDirectoryId.slice(4));
    return org?.name ?? "";
  }
  return "";
}

export function vendorDirectoryOptionMatchesVendorType(
  vendorDirectoryId: string | null | undefined,
  vendorTypeId: string,
  config?: ListVendorDirectoryOptionsConfig,
): boolean {
  if (!vendorDirectoryId) return false;
  return listVendorDirectoryOptions(vendorTypeId, config).some(
    (option) => option.id === vendorDirectoryId,
  );
}
