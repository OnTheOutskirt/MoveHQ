import { listAllOrganizations } from "@/lib/people/organizations-storage";
import { listAllPeople } from "@/lib/people/people-storage";
import { personKindLabel } from "@/lib/people/display";
import { CLAIM_VENDORS } from "./claims-vendors";

export type OpsPrepVendorHit = {
  id: string;
  name: string;
  hint?: string;
};

function matchesQuery(text: string, query: string): boolean {
  return text.toLowerCase().includes(query);
}

/** Search directory vendors and known repair partners for ops prep. */
export function searchOpsPrepVendorHits(query: string, limit = 10): OpsPrepVendorHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits: OpsPrepVendorHit[] = [];
  const seen = new Set<string>();

  function push(hit: OpsPrepVendorHit) {
    const key = hit.id;
    if (seen.has(key)) return;
    seen.add(key);
    hits.push(hit);
  }

  for (const vendor of CLAIM_VENDORS) {
    if (
      matchesQuery(vendor.name, q) ||
      matchesQuery(vendor.specialty, q) ||
      matchesQuery(vendor.contactEmail, q)
    ) {
      push({ id: vendor.id, name: vendor.name, hint: vendor.specialty });
    }
  }

  for (const person of listAllPeople()) {
    if (person.kind !== "vendor") continue;
    const name = person.name;
    const typeHint = person.vendorType?.replace(/_/g, " ") ?? personKindLabel("vendor");
    if (
      matchesQuery(name, q) ||
      matchesQuery(person.email ?? "", q) ||
      matchesQuery(typeHint, q)
    ) {
      push({ id: `person:${person.id}`, name, hint: typeHint });
    }
  }

  for (const org of listAllOrganizations()) {
    const typeHint = org.orgType.replace(/_/g, " ");
    if (
      matchesQuery(org.name, q) ||
      matchesQuery(typeHint, q) ||
      matchesQuery(org.email ?? "", q)
    ) {
      push({ id: `org:${org.id}`, name: org.name, hint: typeHint });
    }
  }

  return hits.slice(0, limit);
}
