import { moveStageDisplayLabel } from "@/lib/moves/move-pipeline";
import type { MoveRecord } from "@/lib/moves/types";
import { formatMoveDate, moveRouteLabel } from "@/lib/moves/format";
import {
  MOCK_ORGANIZATIONS,
  getOrganizationForPerson,
} from "@/lib/people/mock-data";
import {
  organizationTypeConfig,
  personKindLabel,
  personTypeDisplay,
} from "@/lib/people/display";
import { listAllPeople } from "@/lib/people/people-storage";
import type { OrganizationRecord, PersonRecord } from "@/lib/people/types";
import {
  salesDirectoryOrgPath,
  salesDirectoryPersonPath,
  salesMovePath,
} from "@/lib/navigation/routes";

export const GLOBAL_SEARCH_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "moves", label: "Moves" },
  { id: "people", label: "People" },
  { id: "organizations", label: "Organizations" },
] as const;

export type GlobalSearchCategory = (typeof GLOBAL_SEARCH_CATEGORIES)[number]["id"];

export type GlobalSearchResultKind = Exclude<GlobalSearchCategory, "all">;

export type GlobalSearchResult = {
  id: string;
  kind: GlobalSearchResultKind;
  title: string;
  subtitle: string;
  href: string;
};

const CATEGORY_LABELS: Record<GlobalSearchResultKind, string> = {
  moves: "Move",
  people: "Person",
  organizations: "Organization",
};

export function globalSearchCategoryLabel(kind: GlobalSearchResultKind): string {
  return CATEGORY_LABELS[kind];
}

function matchesQuery(haystack: string, query: string): boolean {
  return haystack.toLowerCase().includes(query.trim().toLowerCase());
}

function searchMoves(moves: MoveRecord[], query: string, limit: number): GlobalSearchResult[] {
  const q = query.trim();
  if (!q) return [];

  return moves
    .filter((move) => {
      const haystack = [
        move.reference,
        move.customerName,
        move.customerPhone,
        move.customerEmail,
        move.originAddress,
        move.destinationAddress,
        move.assignedRep,
      ]
        .filter(Boolean)
        .join(" ");
      return matchesQuery(haystack, q);
    })
    .slice(0, limit)
    .map((move) => ({
      id: `move-${move.id}`,
      kind: "moves" as const,
      title: `${move.customerName} · ${move.reference}`,
      subtitle: `${moveStageDisplayLabel(move)} · ${formatMoveDate(move.preferredDate)} · ${moveRouteLabel(move.originAddress, move.destinationAddress)}`,
      href: salesMovePath(move.id),
    }));
}

function searchPeople(query: string, limit: number): GlobalSearchResult[] {
  const q = query.trim();
  if (!q) return [];

  return listAllPeople()
    .filter((person) => personMatches(person, q))
    .slice(0, limit)
    .map((person) => personToResult(person));
}

function personMatches(person: PersonRecord, query: string): boolean {
  const org = getOrganizationForPerson(person);
  const haystack = [
    person.name,
    person.email ?? "",
    person.phone ?? "",
    person.title ?? "",
    org?.name ?? "",
    personKindLabel(person.kind),
  ].join(" ");
  return matchesQuery(haystack, query);
}

function personToResult(person: PersonRecord): GlobalSearchResult {
  const org = getOrganizationForPerson(person);
  const contact = [person.phone, person.email].filter(Boolean).join(" · ");
  return {
    id: `person-${person.id}`,
    kind: "people",
    title: person.name,
    subtitle: [personTypeDisplay(person), org?.name, contact].filter(Boolean).join(" · "),
    href: salesDirectoryPersonPath(person.id),
  };
}

function searchOrganizations(query: string, limit: number): GlobalSearchResult[] {
  const q = query.trim();
  if (!q) return [];

  return MOCK_ORGANIZATIONS.filter((org) => organizationMatches(org, q))
    .slice(0, limit)
    .map((org) => organizationToResult(org));
}

function organizationMatches(org: OrganizationRecord, query: string): boolean {
  const typeLabel = organizationTypeConfig[org.orgType].label;
  const haystack = [
    org.name,
    org.email ?? "",
    org.phone ?? "",
    org.address ?? "",
    typeLabel,
  ].join(" ");
  return matchesQuery(haystack, query);
}

function organizationToResult(org: OrganizationRecord): GlobalSearchResult {
  return {
    id: `org-${org.id}`,
    kind: "organizations",
    title: org.name,
    subtitle: [organizationTypeConfig[org.orgType].label, org.phone, org.email]
      .filter(Boolean)
      .join(" · "),
    href: salesDirectoryOrgPath(org.id),
  };
}

export function runGlobalSearch(
  moves: MoveRecord[],
  query: string,
  category: GlobalSearchCategory,
  limitPerKind = 6,
): GlobalSearchResult[] {
  const q = query.trim();
  if (!q) return [];

  if (category === "moves") {
    return searchMoves(moves, q, limitPerKind * 2);
  }
  if (category === "people") {
    return searchPeople(q, limitPerKind * 2);
  }
  if (category === "organizations") {
    return searchOrganizations(q, limitPerKind * 2);
  }

  const perKind = Math.max(3, Math.floor(limitPerKind / 1));
  return [
    ...searchMoves(moves, q, perKind),
    ...searchPeople(q, perKind),
    ...searchOrganizations(q, perKind),
  ];
}

export function countGlobalSearchByKind(
  results: GlobalSearchResult[],
): Record<GlobalSearchResultKind, number> {
  return {
    moves: results.filter((r) => r.kind === "moves").length,
    people: results.filter((r) => r.kind === "people").length,
    organizations: results.filter((r) => r.kind === "organizations").length,
  };
}
