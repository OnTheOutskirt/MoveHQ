import { MOCK_PEOPLE } from "@/lib/people/mock-data";
import type { PersonKind, PersonRecord } from "@/lib/people/types";

const STORAGE_KEY = "jm-people-custom-v1";

export type NewPersonInput = {
  name: string;
  phone?: string;
  email?: string;
  kind?: PersonKind;
};

function readCustomPeople(): PersonRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PersonRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCustomPeople(people: PersonRecord[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
}

export function loadCustomPeople(): PersonRecord[] {
  return readCustomPeople();
}

export function listAllPeople(): PersonRecord[] {
  const custom = readCustomPeople();
  const byId = new Map<string, PersonRecord>();
  for (const person of MOCK_PEOPLE) {
    byId.set(person.id, normalizeReferralType(person));
  }
  for (const person of custom) {
    byId.set(person.id, normalizeReferralType(person));
  }
  return [...byId.values()];
}

function normalizeReferralType(person: PersonRecord): PersonRecord {
  if ((person.referralType as string | null) !== "attorney") return person;
  return { ...person, referralType: "apartment_complex" };
}

export function getStoredPersonById(id: string): PersonRecord | undefined {
  return listAllPeople().find((p) => p.id === id);
}

export function searchShipperPeople(query: string, limit = 8): PersonRecord[] {
  const q = query.trim().toLowerCase();
  const shippers = listAllPeople().filter(
    (p) => p.kind === "customer" || p.kind === "lead" || p.kind === "referral",
  );

  const sorted = shippers.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );

  if (!q) return sorted.slice(0, limit);

  return sorted
    .filter((p) => {
      const haystack = [p.name, p.phone ?? "", p.email ?? "", p.title ?? ""]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    })
    .slice(0, limit);
}

export function addCustomPerson(input: NewPersonInput): PersonRecord {
  const now = new Date().toISOString();
  const person: PersonRecord = {
    id: `person-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: input.name.trim(),
    kind: input.kind ?? "lead",
    referralType: null,
    vendorType: null,
    phone: input.phone?.trim() || null,
    email: input.email?.trim() || null,
    organizationId: null,
    title: null,
    moveIds: [],
    notes: null,
    createdAt: now,
    updatedAt: now,
  };

  const next = [person, ...readCustomPeople()];
  writeCustomPeople(next);
  return person;
}

export function upsertCustomPerson(person: PersonRecord): PersonRecord {
  const custom = readCustomPeople();
  const index = custom.findIndex((p) => p.id === person.id);
  const next = [...custom];
  if (index === -1) {
    next.unshift(person);
  } else {
    next[index] = person;
  }
  writeCustomPeople(next);
  return person;
}

export function bulkUpsertCustomPeople(people: PersonRecord[]): void {
  const custom = readCustomPeople();
  const byId = new Map(custom.map((p) => [p.id, p] as const));
  for (const person of people) {
    byId.set(person.id, person);
  }
  writeCustomPeople([...byId.values()]);
}

export function linkPersonToMove(personId: string, moveId: string): void {
  const custom = readCustomPeople();
  const index = custom.findIndex((p) => p.id === personId);
  if (index === -1) return;

  const person = custom[index];
  if (person.moveIds.includes(moveId)) return;

  const next = [...custom];
  next[index] = {
    ...person,
    moveIds: [...person.moveIds, moveId],
    updatedAt: new Date().toISOString(),
  };
  writeCustomPeople(next);
}
