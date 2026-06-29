import {
  listMovingCompanyReferrals,
  updateMovingCompanyReferral,
} from "@/lib/people/moving-company-referrals";
import {
  listAllOrganizations,
  removeCustomOrganization,
  upsertCustomOrganization,
} from "@/lib/people/organizations-storage";
import {
  listAllPeople,
  removeCustomPerson,
  upsertCustomPerson,
} from "@/lib/people/people-storage";
import type { OrganizationRecord, PersonRecord } from "@/lib/people/types";
import { reassignReferralTouches } from "@/lib/referrals/touch-log-storage";

/** Repoint a single move's contact references from loser -> survivor. */
export type ReassignMoveContact = (
  moveId: string,
  fromPersonId: string,
  toPerson: PersonRecord,
) => void;

function mergeStrings(primary: string | null, ...extras: (string | null | undefined)[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const primaryNorm = primary?.trim().toLowerCase();
  for (const value of extras) {
    const trimmed = value?.trim();
    if (!trimmed) continue;
    const norm = trimmed.toLowerCase();
    if (norm === primaryNorm) continue;
    if (seen.has(norm)) continue;
    seen.add(norm);
    out.push(trimmed);
  }
  return out;
}

function mergeNotes(survivor: string | null, loser: string | null, loserName: string): string | null {
  const a = survivor?.trim();
  const b = loser?.trim();
  if (a && b) return `${a}\n\n— Merged from ${loserName}:\n${b}`;
  return a || b || null;
}

function unionMoveIds(a: string[], b: string[]): string[] {
  return [...new Set([...a, ...b])];
}

/**
 * Merge two contacts. The survivor keeps its primary fields; the loser's
 * differing phone/email are demoted to secondary, moves are reassigned to the
 * survivor, and the loser is deleted.
 */
export function mergeContacts(
  survivorId: string,
  loserId: string,
  reassignMove: ReassignMoveContact,
): PersonRecord | null {
  if (survivorId === loserId) return null;
  const people = listAllPeople();
  const survivor = people.find((p) => p.id === survivorId);
  const loser = people.find((p) => p.id === loserId);
  if (!survivor || !loser) return null;

  const merged: PersonRecord = {
    ...survivor,
    organizationId: survivor.organizationId ?? loser.organizationId,
    title: survivor.title ?? loser.title,
    notes: mergeNotes(survivor.notes, loser.notes, loser.name),
    moveIds: unionMoveIds(survivor.moveIds, loser.moveIds),
    secondaryPhones: mergeStrings(
      survivor.phone,
      ...(survivor.secondaryPhones ?? []),
      loser.phone,
      ...(loser.secondaryPhones ?? []),
    ),
    secondaryEmails: mergeStrings(
      survivor.email,
      ...(survivor.secondaryEmails ?? []),
      loser.email,
      ...(loser.secondaryEmails ?? []),
    ),
    mergedFromIds: [...(survivor.mergedFromIds ?? []), loserId],
    updatedAt: new Date().toISOString(),
  };

  upsertCustomPerson(merged);

  for (const moveId of loser.moveIds) {
    reassignMove(moveId, loserId, merged);
  }

  removeCustomPerson(loserId);
  return merged;
}

/**
 * Merge two organizations. The survivor keeps its primary fields; loser
 * phone/email/address/website demote to secondary, linked people + referrals +
 * referral touches repoint to the survivor, and the loser is deleted.
 */
export function mergeOrganizations(
  survivorId: string,
  loserId: string,
): OrganizationRecord | null {
  if (survivorId === loserId) return null;
  const orgs = listAllOrganizations();
  const survivor = orgs.find((o) => o.id === survivorId);
  const loser = orgs.find((o) => o.id === loserId);
  if (!survivor || !loser) return null;

  const merged: OrganizationRecord = {
    ...survivor,
    address: survivor.address ?? loser.address,
    website: survivor.website ?? loser.website,
    primaryContactId: survivor.primaryContactId ?? loser.primaryContactId,
    notes: mergeNotes(survivor.notes, loser.notes, loser.name),
    moveIds: unionMoveIds(survivor.moveIds, loser.moveIds),
    secondaryPhones: mergeStrings(
      survivor.phone,
      ...(survivor.secondaryPhones ?? []),
      loser.phone,
      ...(loser.secondaryPhones ?? []),
    ),
    secondaryEmails: mergeStrings(
      survivor.email,
      ...(survivor.secondaryEmails ?? []),
      loser.email,
      ...(loser.secondaryEmails ?? []),
    ),
    secondaryAddresses: mergeStrings(
      survivor.address,
      ...(survivor.secondaryAddresses ?? []),
      loser.address,
      ...(loser.secondaryAddresses ?? []),
    ),
    secondaryWebsites: mergeStrings(
      survivor.website,
      ...(survivor.secondaryWebsites ?? []),
      loser.website,
      ...(loser.secondaryWebsites ?? []),
    ),
    mergedFromIds: [...(survivor.mergedFromIds ?? []), loserId],
    updatedAt: new Date().toISOString(),
  };

  upsertCustomOrganization(merged);

  // Repoint people linked to the loser org.
  for (const person of listAllPeople()) {
    if (person.organizationId === loserId) {
      upsertCustomPerson({
        ...person,
        organizationId: survivorId,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // Repoint moving-company referrals.
  for (const referral of listMovingCompanyReferrals()) {
    if (referral.organizationId === loserId) {
      updateMovingCompanyReferral(referral.id, { organizationId: survivorId });
    }
  }

  // Repoint referral touch log entries.
  reassignReferralTouches("organization", loserId, survivorId);

  removeCustomOrganization(loserId);
  return merged;
}
