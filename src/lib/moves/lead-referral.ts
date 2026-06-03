import { getOrganizationById, MOCK_PEOPLE } from "@/lib/people/mock-data";
import type { PersonRecord } from "@/lib/people/types";
import { leadChannelLabel } from "./move-priority-tier";
import type { LeadChannel, LinkedPersonRole, MoveLinkedPerson, MoveRecord } from "./types";

const REFERRAL_CHANNELS: LeadChannel[] = [
  "referral_realtor",
  "referral_senior_living",
  "referral_business",
  "referral_other",
];

export const CHANNEL_TO_ROLES: Partial<Record<LeadChannel, LinkedPersonRole[]>> = {
  referral_realtor: ["realtor"],
  referral_senior_living: ["senior_living"],
  referral_business: ["facility", "referral_partner"],
  referral_other: ["referral_partner", "realtor", "senior_living", "facility"],
};

export function isReferralLeadChannel(channel: LeadChannel): boolean {
  return REFERRAL_CHANNELS.includes(channel);
}

export function leadSourceLabel(channel: LeadChannel): string {
  return leadChannelLabel(channel);
}

/** Single referral / lead-source contact for this move's channel (at most one). */
export function referralContactForLeadSource(move: MoveRecord): MoveLinkedPerson | undefined {
  const roles = CHANNEL_TO_ROLES[move.leadChannel] ?? [];
  if (roles.length === 0) return undefined;
  return move.linkedPeople.find((p) => roles.includes(p.role));
}

export function referralContactsForLeadSource(move: MoveRecord): MoveLinkedPerson[] {
  const contact = referralContactForLeadSource(move);
  return contact ? [contact] : [];
}

/** Care-of contacts tied to the customer on this move. */
export function careOfContactsForMove(move: MoveRecord): MoveLinkedPerson[] {
  return move.linkedPeople.filter((p) => p.role === "care_of");
}

/** People directory entries that match referral roles for a lead channel. */
export function directoryPeopleForReferralChannel(channel: LeadChannel): PersonRecord[] {
  const roles = CHANNEL_TO_ROLES[channel] ?? [];
  if (roles.length === 0) return [];

  return MOCK_PEOPLE.filter((person) => {
    if (roles.includes("realtor")) {
      const org = person.organizationId ? getOrganizationById(person.organizationId) : undefined;
      if (org?.orgType === "realtor") return true;
    }
    if (roles.includes("senior_living")) {
      const org = person.organizationId ? getOrganizationById(person.organizationId) : undefined;
      if (org?.orgType === "senior_living") return true;
    }
    if (roles.includes("facility") || roles.includes("referral_partner")) {
      if (person.kind === "referral") return true;
    }
    return false;
  });
}

export function linkedPersonFromDirectory(
  moveId: string,
  person: PersonRecord,
  role: LinkedPersonRole,
): MoveLinkedPerson {
  const org = person.organizationId ? getOrganizationById(person.organizationId) : undefined;
  return {
    id: `${moveId}-${role}-${person.id}`,
    personId: person.id,
    name: person.name,
    role,
    phone: person.phone ?? undefined,
    email: person.email ?? undefined,
    organization: org?.name,
    relationship: person.title ?? undefined,
  };
}

export function referralPartnerLabel(channel: LeadChannel): string {
  switch (channel) {
    case "referral_realtor":
      return "realtor";
    case "referral_senior_living":
      return "senior living contact";
    case "referral_business":
      return "business contact";
    default:
      return "referral partner";
  }
}
