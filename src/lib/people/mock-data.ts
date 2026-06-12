import { MOCK_MOVES } from "@/lib/moves/mock-data";
import { isMoveLost } from "@/lib/moves/move-pipeline";
import type { MoveRecord } from "@/lib/moves/types";
import type { OrganizationRecord, PersonKind, PersonRecord } from "./types";

export const MOCK_ORGANIZATIONS: OrganizationRecord[] = [
  {
    id: "org-whitfield-realty",
    name: "Whitfield Realty",
    orgType: "realtor",
    phone: "(216) 555-8800",
    email: "info@whitfieldrealty.example",
    address: "1200 Euclid Ave, Cleveland, OH",
    website: "whitfieldrealty.example",
    primaryContactId: "person-karen-whitfield",
    moveIds: ["mv-quote-sent"],
    notes: "Strong referral partner — send thank-you after close",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2026-05-18T00:00:00Z",
  },
  {
    id: "org-northside-dental",
    name: "Northside Dental Group",
    orgType: "commercial",
    phone: "(216) 555-0330",
    email: "office@northsidedental.example",
    address: "6000 Rockside Rd, Independence, OH",
    website: null,
    primaryContactId: "person-northside-office",
    moveIds: ["mv-waiting-info"],
    notes: "Commercial relocation — equipment list pending",
    createdAt: "2026-05-01T00:00:00Z",
    updatedAt: "2026-05-18T00:00:00Z",
  },
  {
    id: "org-sunset-senior",
    name: "Sunset Ridge Senior Living",
    orgType: "senior_living",
    phone: "(440) 555-2100",
    email: "transitions@sunsetridge.example",
    address: "4400 Mentor Ave, Mentor, OH",
    website: "sunsetridge.example",
    primaryContactId: "person-sunset-coordinator",
    moveIds: ["mv-needs-contract"],
    notes: "Preferred vendor for resident moves — COI on file",
    createdAt: "2023-06-15T00:00:00Z",
    updatedAt: "2026-05-19T00:00:00Z",
  },
  {
    id: "org-cleveland-storage",
    name: "Cleveland Climate Storage",
    orgType: "storage_facility",
    phone: "(216) 555-7700",
    email: "dispatch@clevelandstorage.example",
    address: "1800 Carnegie Ave, Cleveland, OH",
    website: null,
    primaryContactId: "person-storage-dispatch",
    moveIds: ["mv-booked"],
    notes: "Warehouse partner for multi-day / storage legs",
    createdAt: "2025-02-01T00:00:00Z",
    updatedAt: "2026-05-10T00:00:00Z",
  },
  {
    id: "org-shamrock-crating",
    name: "Shamrock Crating & Fine Art",
    orgType: "vendor",
    phone: "(216) 555-3310",
    email: "dispatch@shamrockcrating.example",
    address: "2200 Superior Ave, Cleveland, OH",
    website: "shamrockcrating.example",
    primaryContactId: "person-shamrock-dispatch",
    moveIds: ["mv-needs-contract"],
    notes: "Preferred crating vendor — piano, art, marble",
    createdAt: "2024-03-01T00:00:00Z",
    updatedAt: "2026-05-20T00:00:00Z",
  },
  {
    id: "org-peterson-estate",
    name: "Peterson Estate (law office)",
    orgType: "other",
    phone: "(440) 555-0190",
    email: "estates@petersonlaw.example",
    address: "88 Euclid Ave, Cleveland, OH",
    website: null,
    primaryContactId: "person-peterson-executor",
    moveIds: ["mv-waiting-walkthrough"],
    notes: "Estate move — executor is primary contact",
    createdAt: "2026-05-10T00:00:00Z",
    updatedAt: "2026-05-19T00:00:00Z",
  },
];

function kindFromMove(move: MoveRecord): PersonKind {
  if (move.pipelineStage === "completed") return "customer";
  if (move.pipelineStage === "booked") return "customer";
  if (isMoveLost(move)) return "lead";
  return "lead";
}

function customerPersonFromMove(move: MoveRecord): PersonRecord {
  return {
    id: `person-${move.id}-customer`,
    name: move.customerName,
    kind: kindFromMove(move),
    referralType: null,
    vendorType: null,
    phone: move.customerPhone,
    email: move.customerEmail,
    organizationId: null,
    title: null,
    moveIds: [move.id],
    notes: null,
    createdAt: move.createdAt,
    updatedAt: move.updatedAt,
  };
}

const STANDALONE_PEOPLE: PersonRecord[] = [
  {
    id: "person-karen-whitfield",
    name: "Karen Whitfield",
    kind: "referral",
    referralType: "realtor",
    vendorType: null,
    phone: "(216) 555-8801",
    email: "karen@whitfieldrealty.example",
    organizationId: "org-whitfield-realty",
    title: "Listing agent",
    moveIds: ["mv-quote-sent"],
    notes: "Referred Walsh family — repeat sender",
    createdAt: "2025-08-01T00:00:00Z",
    updatedAt: "2026-05-18T00:00:00Z",
  },
  {
    id: "person-northside-office",
    name: "Office Manager — Northside",
    kind: "lead",
    referralType: null,
    vendorType: null,
    phone: "(216) 555-0330",
    email: "office@northsidedental.example",
    organizationId: "org-northside-dental",
    title: "Office manager",
    moveIds: ["mv-waiting-info"],
    notes: null,
    createdAt: "2026-05-17T00:00:00Z",
    updatedAt: "2026-05-18T00:00:00Z",
  },
  {
    id: "person-sunset-coordinator",
    name: "Maria Santos",
    kind: "referral",
    referralType: "senior_living",
    vendorType: null,
    phone: "(440) 555-2102",
    email: "msantos@sunsetridge.example",
    organizationId: "org-sunset-senior",
    title: "Transition coordinator",
    moveIds: ["mv-needs-contract"],
    notes: "Referred Ellis long-distance move",
    createdAt: "2026-04-20T00:00:00Z",
    updatedAt: "2026-05-19T00:00:00Z",
  },
  {
    id: "person-shamrock-dispatch",
    name: "Alex Rivera",
    kind: "vendor",
    referralType: null,
    vendorType: "special_services",
    phone: "(216) 555-3311",
    email: "alex@shamrockcrating.example",
    organizationId: "org-shamrock-crating",
    title: "Dispatch",
    moveIds: ["mv-needs-contract"],
    notes: "Crating quotes — 48 hr lead time",
    createdAt: "2024-03-01T00:00:00Z",
    updatedAt: "2026-05-20T00:00:00Z",
  },
  {
    id: "person-storage-dispatch",
    name: "Dispatch — Cleveland Storage",
    kind: "vendor",
    referralType: null,
    vendorType: "operations_materials",
    phone: "(216) 555-7701",
    email: "dispatch@clevelandstorage.example",
    organizationId: "org-cleveland-storage",
    title: "Dispatch",
    moveIds: ["mv-booked"],
    notes: null,
    createdAt: "2026-05-01T00:00:00Z",
    updatedAt: "2026-05-15T00:00:00Z",
  },
  {
    id: "person-peterson-executor",
    name: "James Peterson (executor)",
    kind: "lead",
    referralType: null,
    vendorType: null,
    phone: "(440) 555-0198",
    email: "jpeterson.law@example.com",
    organizationId: "org-peterson-estate",
    title: "Executor",
    moveIds: ["mv-waiting-walkthrough"],
    notes: "On-site walkthrough scheduled",
    createdAt: "2026-05-10T00:00:00Z",
    updatedAt: "2026-05-19T00:00:00Z",
  },
  {
    id: "person-angela-spouse",
    name: "David Brooks",
    kind: "other",
    referralType: null,
    vendorType: null,
    phone: "(216) 555-0824",
    email: "dbrooks@example.com",
    organizationId: null,
    title: "Care of — spouse",
    moveIds: ["mv-complete"],
    notes: "Secondary contact on completed move",
    createdAt: "2026-04-20T00:00:00Z",
    updatedAt: "2026-05-18T00:00:00Z",
  },
  {
    id: "person-mike-restoration",
    name: "Mike Torres",
    kind: "referral",
    referralType: "restoration_company",
    vendorType: null,
    phone: "(216) 555-4420",
    email: "mtorres@rapidrestore.example",
    organizationId: null,
    title: "Project manager — Rapid Restore",
    moveIds: [],
    notes: "Water damage referrals — prefers same-week estimates",
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-05-20T00:00:00Z",
  },
  {
    id: "person-lisa-developer",
    name: "Lisa Chen",
    kind: "referral",
    referralType: "developer",
    vendorType: null,
    phone: "(440) 555-3300",
    email: "lchen@lakewoodheightsdev.example",
    organizationId: null,
    title: "Community sales — Lakewood Heights",
    moveIds: [],
    notes: "New build move-ins — bulk pricing discussions",
    createdAt: "2026-02-15T00:00:00Z",
    updatedAt: "2026-05-20T00:00:00Z",
  },
];

export const MOCK_PEOPLE: PersonRecord[] = [
  ...MOCK_MOVES.map(customerPersonFromMove),
  ...STANDALONE_PEOPLE,
];

export function getPersonById(id: string): PersonRecord | undefined {
  return MOCK_PEOPLE.find((p) => p.id === id);
}

export function getOrganizationById(id: string): OrganizationRecord | undefined {
  return MOCK_ORGANIZATIONS.find((o) => o.id === id);
}

export function getOrganizationForPerson(person: PersonRecord): OrganizationRecord | undefined {
  if (!person.organizationId) return undefined;
  return getOrganizationById(person.organizationId);
}

export function getPeopleForOrganization(orgId: string): PersonRecord[] {
  return MOCK_PEOPLE.filter((p) => p.organizationId === orgId);
}

export function directoryCounts() {
  return {
    people: MOCK_PEOPLE.length,
    organizations: MOCK_ORGANIZATIONS.length,
    customers: MOCK_PEOPLE.filter((p) => p.kind === "customer").length,
    leads: MOCK_PEOPLE.filter((p) => p.kind === "lead").length,
    referrals: MOCK_PEOPLE.filter((p) => p.kind === "referral").length,
  };
}
