import { MOCK_ORGANIZATIONS } from "@/lib/people/mock-data";
import type { OrganizationRecord } from "@/lib/people/types";

const STORAGE_KEY = "jm-organizations-custom-v1";
const DELETED_KEY = "jm-organizations-deleted-v1";

function readDeletedOrganizationIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DELETED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

function writeDeletedOrganizationIds(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DELETED_KEY, JSON.stringify([...ids]));
}

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
  for (const id of readDeletedOrganizationIds()) {
    byId.delete(id);
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

export function removeCustomOrganization(id: string): void {
  const next = readCustomOrganizations().filter((o) => o.id !== id);
  writeCustomOrganizations(next);
  const deleted = readDeletedOrganizationIds();
  deleted.add(id);
  writeDeletedOrganizationIds(deleted);
}

export function bulkUpsertCustomOrganizations(orgs: OrganizationRecord[]): void {
  const custom = readCustomOrganizations();
  const byId = new Map(custom.map((o) => [o.id, o] as const));
  for (const org of orgs) {
    byId.set(org.id, org);
  }
  writeCustomOrganizations([...byId.values()]);
}
