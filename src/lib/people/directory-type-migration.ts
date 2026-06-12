import { bulkUpsertCustomPeople, listAllPeople } from "@/lib/people/people-storage";
import type { PersonRecord } from "@/lib/people/types";

export function countPeopleUsingReferralType(people: PersonRecord[], typeId: string): number {
  return people.filter((p) => p.kind === "referral" && p.referralType === typeId).length;
}

export function countPeopleUsingVendorType(people: PersonRecord[], typeId: string): number {
  return people.filter((p) => p.kind === "vendor" && p.vendorType === typeId).length;
}

export function reassignReferralType(fromId: string, toId: string): number {
  const affected = listAllPeople().filter(
    (p) => p.kind === "referral" && p.referralType === fromId,
  );
  if (affected.length === 0) return 0;

  const now = new Date().toISOString();
  bulkUpsertCustomPeople(
    affected.map((p) => ({
      ...p,
      referralType: toId as PersonRecord["referralType"],
      updatedAt: now,
    })),
  );
  return affected.length;
}

export function reassignVendorType(fromId: string, toId: string): number {
  const affected = listAllPeople().filter(
    (p) => p.kind === "vendor" && p.vendorType === fromId,
  );
  if (affected.length === 0) return 0;

  const now = new Date().toISOString();
  bulkUpsertCustomPeople(
    affected.map((p) => ({
      ...p,
      vendorType: toId,
      updatedAt: now,
    })),
  );
  return affected.length;
}
