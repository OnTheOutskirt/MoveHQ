import { MOCK_ORGANIZATIONS } from "@/lib/people/mock-data";
import type { OrganizationRecord } from "@/lib/people/types";

const STORAGE_KEY = "jm-organizations-custom-v1";

function readCustomOrganizations(): OrganizationRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OrganizationRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCustomOrganizations(orgs: OrganizationRecord[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orgs));
}

export function loadCustomOrganizations(): OrganizationRecord[] {
  return readCustomOrganizations();
}

export function listAllOrganizations(): OrganizationRecord[] {
  const byId = new Map<string, OrganizationRecord>();
  for (const org of MOCK_ORGANIZATIONS) {
    byId.set(org.id, org);
  }
  for (const org of readCustomOrganizations()) {
    byId.set(org.id, org);
  }
  return [...byId.values()];
}

export function getStoredOrganizationById(id: string): OrganizationRecord | undefined {
  return listAllOrganizations().find((o) => o.id === id);
}

export function upsertCustomOrganization(org: OrganizationRecord): OrganizationRecord {
  const custom = readCustomOrganizations();
  const index = custom.findIndex((o) => o.id === org.id);
  const next = [...custom];
  if (index === -1) {
    next.unshift(org);
  } else {
    next[index] = org;
  }
  writeCustomOrganizations(next);
  return org;
}

export function bulkUpsertCustomOrganizations(orgs: OrganizationRecord[]): void {
  const custom = readCustomOrganizations();
  const byId = new Map(custom.map((o) => [o.id, o] as const));
  for (const org of orgs) {
    byId.set(org.id, org);
  }
  writeCustomOrganizations([...byId.values()]);
}
