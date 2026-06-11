import { getOrganizationById } from "@/lib/people/mock-data";
import { listAllOrganizations } from "@/lib/people/organizations-storage";
import { listAllPeople } from "@/lib/people/people-storage";
import type { OrganizationRecord, PersonRecord } from "@/lib/people/types";
import { isReferralLeadChannel, referralContactForLeadSource } from "@/lib/moves/lead-referral";
import { isMoveLost } from "@/lib/moves/move-pipeline";
import type { LeadChannel, MoveRecord } from "@/lib/moves/types";
import {
  parseReferralPartnerKey,
  referralPartnerKey,
  type ReferralPartnerCategory,
  type ReferralPartnerKey,
  type ReferralPartnerStats,
  type ReferralPartnerType,
} from "./types";

type PartnerAccumulator = {
  partnerType: ReferralPartnerType;
  partnerId: string;
  name: string;
  subtitle?: string;
  organizationName?: string;
  organizationId?: string;
  category: ReferralPartnerCategory;
  referralCount: number;
  bookedCount: number;
  completedCount: number;
  revenueTotal: number;
  lastReferralDate?: string;
};

export type CollectReferralStatsOptions = {
  dateFrom?: string;
  dateTo?: string;
};

function isBookedOrBetter(move: MoveRecord): boolean {
  return move.pipelineStage === "booked" || move.pipelineStage === "completed";
}

function moveRevenue(move: MoveRecord): number {
  return move.quoteAmount ?? 0;
}

function moveDateForFilter(move: MoveRecord): string {
  return move.preferredDate || move.createdAt.slice(0, 10);
}

function moveInDateRange(
  move: MoveRecord,
  dateFrom?: string,
  dateTo?: string,
): boolean {
  if (!dateFrom && !dateTo) return true;
  const d = moveDateForFilter(move);
  if (dateFrom && d < dateFrom) return false;
  if (dateTo && d > dateTo) return false;
  return true;
}

function categoryFromLeadChannel(channel: LeadChannel): ReferralPartnerCategory {
  switch (channel) {
    case "referral_realtor":
      return "realtor";
    case "referral_senior_living":
      return "senior_living";
    case "referral_business":
      return "business";
    default:
      return "other";
  }
}

function categoryFromOrg(org: OrganizationRecord): ReferralPartnerCategory {
  switch (org.orgType) {
    case "realtor":
      return "realtor";
    case "senior_living":
      return "senior_living";
    case "commercial":
    case "developer":
      return "business";
    default:
      return "other";
  }
}

function categoryFromPerson(
  person: PersonRecord,
  org?: OrganizationRecord,
): ReferralPartnerCategory {
  if (org) return categoryFromOrg(org);
  if (person.referralType === "realtor") return "realtor";
  if (person.referralType === "senior_living") return "senior_living";
  if (
    person.referralType === "business" ||
    person.referralType === "developer" ||
    person.referralType === "storage_facility"
  ) {
    return "business";
  }
  return "other";
}

function resolveOrganization(id: string | null | undefined): OrganizationRecord | undefined {
  if (!id) return undefined;
  return listAllOrganizations().find((o) => o.id === id) ?? getOrganizationById(id);
}

function partnerFromPerson(person: PersonRecord): PartnerAccumulator {
  const org = resolveOrganization(person.organizationId);
  return {
    partnerType: "person",
    partnerId: person.id,
    name: person.name,
    subtitle: person.title ?? person.referralType?.replace(/_/g, " ") ?? undefined,
    organizationName: org?.name,
    organizationId: org?.id,
    category: categoryFromPerson(person, org),
    referralCount: 0,
    bookedCount: 0,
    completedCount: 0,
    revenueTotal: 0,
  };
}

function partnerFromOrg(org: OrganizationRecord): PartnerAccumulator {
  const people = listAllPeople();
  const contact = org.primaryContactId
    ? people.find((p) => p.id === org.primaryContactId)
    : undefined;
  return {
    partnerType: "organization",
    partnerId: org.id,
    name: org.name,
    subtitle: contact ? `Primary: ${contact.name}` : org.orgType.replace(/_/g, " "),
    organizationName: org.name,
    organizationId: org.id,
    category: categoryFromOrg(org),
    referralCount: 0,
    bookedCount: 0,
    completedCount: 0,
    revenueTotal: 0,
  };
}

function bumpPartner(
  map: Map<ReferralPartnerKey, PartnerAccumulator>,
  acc: PartnerAccumulator,
  move: MoveRecord,
) {
  const key = referralPartnerKey(acc.partnerType, acc.partnerId);
  const existing = map.get(key) ?? { ...acc };
  existing.referralCount += 1;
  if (isBookedOrBetter(move)) {
    existing.bookedCount += 1;
    existing.revenueTotal += moveRevenue(move);
  }
  if (move.pipelineStage === "completed") {
    existing.completedCount += 1;
  }
  const moveDate = moveDateForFilter(move);
  if (!existing.lastReferralDate || moveDate > existing.lastReferralDate) {
    existing.lastReferralDate = moveDate;
  }
  map.set(key, existing);
}

function resolvePartnerFromMove(move: MoveRecord): PartnerAccumulator | null {
  const people = listAllPeople();
  const orgs = listAllOrganizations();
  const category = categoryFromLeadChannel(move.leadChannel);

  const contact = referralContactForLeadSource(move);
  if (contact?.personId) {
    const person = people.find((p) => p.id === contact.personId);
    if (person) {
      const acc = partnerFromPerson(person);
      return { ...acc, category };
    }
  }
  if (contact?.organization) {
    const org = orgs.find((o) => o.name.toLowerCase() === contact.organization!.toLowerCase());
    if (org) {
      const acc = partnerFromOrg(org);
      return { ...acc, category };
    }
  }
  if (contact?.name) {
    return {
      partnerType: "person",
      partnerId: `linked:${contact.personId ?? contact.name}`,
      name: contact.name,
      subtitle: contact.relationship ?? contact.role,
      organizationName: contact.organization,
      category,
      referralCount: 0,
      bookedCount: 0,
      completedCount: 0,
      revenueTotal: 0,
    };
  }
  return null;
}

function toStatsRow(p: PartnerAccumulator): ReferralPartnerStats {
  return {
    key: referralPartnerKey(p.partnerType, p.partnerId),
    partnerType: p.partnerType,
    partnerId: p.partnerId,
    name: p.name,
    subtitle: p.subtitle,
    organizationName: p.organizationName,
    organizationId: p.organizationId,
    category: p.category,
    referralCount: p.referralCount,
    bookedCount: p.bookedCount,
    completedCount: p.completedCount,
    revenueTotal: p.revenueTotal,
    lastReferralDate: p.lastReferralDate,
  };
}

/** Aggregate referral volume and revenue from moves + directory partners. */
export function collectReferralPartnerStats(
  moves: MoveRecord[],
  options?: CollectReferralStatsOptions,
): ReferralPartnerStats[] {
  const map = new Map<ReferralPartnerKey, PartnerAccumulator>();

  for (const move of moves) {
    if (isMoveLost(move)) continue;
    if (!isReferralLeadChannel(move.leadChannel)) continue;
    if (!moveInDateRange(move, options?.dateFrom, options?.dateTo)) continue;

    const partner = resolvePartnerFromMove(move);
    if (!partner) continue;
    bumpPartner(map, partner, move);
  }

  return [...map.values()]
    .map(toStatsRow)
    .filter((p) => p.referralCount > 0)
    .sort(
      (a, b) =>
        b.revenueTotal - a.revenueTotal ||
        b.referralCount - a.referralCount ||
        a.name.localeCompare(b.name),
    );
}

function mergeStats(target: ReferralPartnerStats, source: ReferralPartnerStats): void {
  target.referralCount += source.referralCount;
  target.bookedCount += source.bookedCount;
  target.completedCount += source.completedCount;
  target.revenueTotal += source.revenueTotal;
  if (
    source.lastReferralDate &&
    (!target.lastReferralDate || source.lastReferralDate > target.lastReferralDate)
  ) {
    target.lastReferralDate = source.lastReferralDate;
  }
}

/** Roll person-level rows up to their organization (brokerage, community, etc.). */
export function rollupReferralStatsByOrganization(
  stats: ReferralPartnerStats[],
): ReferralPartnerStats[] {
  const byOrg = new Map<string, ReferralPartnerStats>();
  const standalone: ReferralPartnerStats[] = [];

  for (const row of stats) {
    if (row.partnerType === "organization") {
      const existing = byOrg.get(row.partnerId);
      if (existing) mergeStats(existing, row);
      else byOrg.set(row.partnerId, { ...row });
      continue;
    }

    if (row.organizationId) {
      const orgId = row.organizationId;
      const existing = byOrg.get(orgId);
      if (existing) {
        mergeStats(existing, row);
      } else {
        byOrg.set(orgId, {
          key: referralPartnerKey("organization", orgId),
          partnerType: "organization",
          partnerId: orgId,
          name: row.organizationName ?? row.name,
          subtitle:
            row.category === "realtor"
              ? "Brokerage rollup"
              : row.category === "senior_living"
                ? "Community rollup"
                : "Organization rollup",
          organizationName: row.organizationName,
          organizationId: orgId,
          category: row.category,
          referralCount: row.referralCount,
          bookedCount: row.bookedCount,
          completedCount: row.completedCount,
          revenueTotal: row.revenueTotal,
          lastReferralDate: row.lastReferralDate,
        });
      }
      continue;
    }

    standalone.push(row);
  }

  return [...byOrg.values(), ...standalone].sort(
    (a, b) =>
      b.revenueTotal - a.revenueTotal ||
      b.referralCount - a.referralCount ||
      a.name.localeCompare(b.name),
  );
}

export function findReferralPartnerStats(
  stats: ReferralPartnerStats[],
  key: ReferralPartnerKey,
): ReferralPartnerStats | undefined {
  return stats.find((s) => s.key === key);
}

export function partnerDisplayName(stats: ReferralPartnerStats): string {
  if (stats.partnerType === "organization") return stats.name;
  return stats.organizationName ? `${stats.name} · ${stats.organizationName}` : stats.name;
}

export { parseReferralPartnerKey };
