import { getOrganizationById, getOrganizationForPerson, MOCK_ORGANIZATIONS } from "@/lib/people/mock-data";
import { listAllPeople } from "@/lib/people/people-storage";
import type { OrganizationRecord, PersonRecord } from "@/lib/people/types";

export type VendorDirectoryOption = {
  id: string;
  label: string;
  phone: string | null;
  email: string | null;
  source: "person" | "organization";
};

function orgVendorOption(org: OrganizationRecord): VendorDirectoryOption {
  return {
    id: `org:${org.id}`,
    label: org.name,
    phone: org.phone,
    email: org.email,
    source: "organization",
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
  };
}

export function listVendorDirectoryOptions(): VendorDirectoryOption[] {
  const options: VendorDirectoryOption[] = [];
  const people = listAllPeople().filter((p) => p.kind === "vendor");

  for (const person of people) {
    options.push(personVendorOption(person));
  }

  for (const org of MOCK_ORGANIZATIONS) {
    if (org.orgType === "vendor") {
      const covered = people.some((p) => p.organizationId === org.id);
      if (!covered) options.push(orgVendorOption(org));
    }
  }

  return options.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
}

export function resolveVendorDirectoryLabel(vendorDirectoryId: string | null | undefined): string {
  if (!vendorDirectoryId) return "";
  if (vendorDirectoryId.startsWith("person:")) {
    const person = listAllPeople().find((p) => p.id === vendorDirectoryId.slice(7));
    return person ? personVendorOption(person).label : "";
  }
  if (vendorDirectoryId.startsWith("org:")) {
    const org = getOrganizationById(vendorDirectoryId.slice(4));
    return org?.name ?? "";
  }
  return "";
}
