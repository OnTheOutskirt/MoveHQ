import type { ImportDatasetKind, ImportFieldDef } from "./types";

export const IMPORT_DATASET_LABELS: Record<ImportDatasetKind, string> = {
  organizations: "Organizations",
  people: "People & contacts",
  moves: "Moves",
  job_days: "Job days",
  claims: "Claims",
  inventory: "Warehouse inventory",
};

export const IMPORT_DATASET_ORDER: ImportDatasetKind[] = [
  "organizations",
  "people",
  "moves",
  "job_days",
  "claims",
  "inventory",
];

export const IMPORT_DATASET_HINTS: Record<ImportDatasetKind, string> = {
  organizations:
    "Brokerages, facilities, vendors — import first so people can link to them.",
  people: "Customers, leads, referral partners — link to organizations via organization_external_id.",
  moves:
    "One row per move. Link to a person via customer_external_id. Job days can be added in the next sheet.",
  job_days:
    "One row per job day. Link to a move via move_reference (must match the moves sheet).",
  claims: "Historical claims — link to moves via move_reference.",
  inventory: "Opening stock counts for warehouse supplies (catalog_id from equipment catalog).",
};

const ORGANIZATION_FIELDS: ImportFieldDef[] = [
  {
    key: "external_id",
    label: "External ID",
    required: true,
    description: "Stable ID from your old system — used to link people and re-imports.",
    aliases: ["org_id", "id"],
    example: "ORG-001",
  },
  {
    key: "name",
    label: "Organization name",
    required: true,
    example: "Whitfield Realty",
  },
  {
    key: "org_type",
    label: "Type",
    required: true,
    description: "realtor, storage_facility, developer, restoration_company, senior_living, commercial, vendor, other",
    aliases: ["type", "organization_type"],
    example: "realtor",
  },
  { key: "phone", label: "Phone", example: "(216) 555-8800" },
  { key: "email", label: "Email", example: "info@example.com" },
  { key: "address", label: "Address", example: "1200 Euclid Ave, Cleveland, OH" },
  { key: "website", label: "Website", example: "example.com" },
  {
    key: "primary_contact_external_id",
    label: "Primary contact external ID",
    description: "Optional — links after people are imported.",
    aliases: ["primary_contact_id"],
    example: "PERSON-042",
  },
  { key: "notes", label: "Notes" },
];

const PEOPLE_FIELDS: ImportFieldDef[] = [
  {
    key: "external_id",
    label: "External ID",
    required: true,
    aliases: ["person_id", "contact_id", "id"],
    example: "PERSON-001",
  },
  { key: "name", label: "Full name", required: true, example: "Jane Smith" },
  {
    key: "kind",
    label: "Kind",
    required: true,
    description: "customer, lead, referral, vendor, other",
    aliases: ["type", "person_kind"],
    example: "customer",
  },
  {
    key: "referral_type",
    label: "Referral type",
    description: "When kind is referral: realtor, storage_facility, developer, etc.",
    example: "realtor",
  },
  { key: "phone", label: "Phone", example: "(216) 555-0100" },
  { key: "email", label: "Email", example: "jane@example.com" },
  {
    key: "organization_external_id",
    label: "Organization external ID",
    aliases: ["org_external_id", "organization_id"],
    example: "ORG-001",
  },
  { key: "title", label: "Title / role", example: "Listing agent" },
  { key: "notes", label: "Notes" },
];

const MOVE_FIELDS: ImportFieldDef[] = [
  {
    key: "move_reference",
    label: "Move reference",
    required: true,
    description: "Your move number — used to link job days and claims.",
    aliases: ["reference", "move_id", "job_number"],
    example: "MV-2024-1042",
  },
  {
    key: "customer_external_id",
    label: "Customer external ID",
    required: true,
    aliases: ["contact_external_id", "person_external_id"],
    example: "PERSON-001",
  },
  { key: "customer_name", label: "Customer name", example: "Jane Smith" },
  { key: "customer_phone", label: "Customer phone" },
  { key: "customer_email", label: "Customer email" },
  {
    key: "pipeline_stage",
    label: "Pipeline stage",
    description: "new_lead, waiting, quote_sent, needs_contract, booked, completed",
    example: "completed",
  },
  {
    key: "condition_status",
    label: "Condition",
    description: "active, lost, cancelled, on_hold, needs_review, closed",
    example: "closed",
  },
  {
    key: "move_type",
    label: "Move type",
    description: "Local, Long distance, Commercial, Labor only",
    example: "Local",
  },
  { key: "origin_address", label: "Origin address" },
  { key: "destination_address", label: "Destination address" },
  { key: "preferred_date", label: "Preferred / move date (YYYY-MM-DD)", aliases: ["move_date", "date"] },
  { key: "quote_amount", label: "Quote amount", example: "2400" },
  { key: "quote_type", label: "Quote type (hourly or flat)" },
  {
    key: "lead_channel",
    label: "Lead channel",
    description: "phone, website, referral_realtor, google, repeat_customer, etc.",
    example: "phone",
  },
  { key: "source", label: "Source label", example: "Phone" },
  { key: "assigned_rep", label: "Sales rep" },
  { key: "coordinator", label: "Coordinator" },
  { key: "bedrooms", label: "Bedrooms", example: "3" },
  { key: "location_id", label: "Branch location ID", description: "Leave blank for default branch." },
  { key: "lost_reason", label: "Lost reason (if lost)" },
  { key: "lost_at", label: "Lost date (YYYY-MM-DD)" },
  { key: "created_at", label: "Created at (ISO date)" },
  { key: "notes", label: "Notes" },
];

const JOB_DAY_FIELDS: ImportFieldDef[] = [
  {
    key: "move_reference",
    label: "Move reference",
    required: true,
    aliases: ["reference", "move_id"],
    example: "MV-2024-1042",
  },
  {
    key: "day_label",
    label: "Day label",
    description: "Optional — auto-numbered if blank.",
    aliases: ["label", "day_number"],
    example: "Day 1",
  },
  { key: "date", label: "Date (YYYY-MM-DD)", required: true, example: "2024-06-15" },
  {
    key: "status",
    label: "Status",
    description: "proposed, scheduled, in_progress, completed, cancelled",
    example: "completed",
  },
  {
    key: "services",
    label: "Services",
    description: "Comma-separated: packing, loading, moving, unloading, unpacking, junk_removal, storage",
    example: "loading,moving,unloading",
  },
  { key: "crew_size", label: "Crew size", example: "3" },
  { key: "truck_count", label: "Truck count", example: "1" },
  { key: "hours_estimated", label: "Hours estimated" },
  { key: "hours_actual", label: "Hours actual" },
  { key: "arrival_window", label: "Arrival window" },
  { key: "departure_window", label: "Departure window" },
  { key: "origin_address", label: "Origin address (this day)" },
  { key: "destination_address", label: "Destination address (this day)" },
  { key: "dispatch_notes", label: "Dispatch notes" },
  { key: "customer_notes", label: "Customer notes" },
];

const CLAIM_FIELDS: ImportFieldDef[] = [
  {
    key: "claim_reference",
    label: "Claim reference",
    description: "Optional — auto-generated if blank.",
    aliases: ["reference"],
    example: "CLM-2024-12",
  },
  {
    key: "move_reference",
    label: "Move reference",
    required: true,
    example: "MV-2024-1042",
  },
  { key: "category", label: "Category", required: true, description: "damage, lost_item, other", example: "damage" },
  { key: "title", label: "Title", required: true },
  { key: "description", label: "Description" },
  {
    key: "status",
    label: "Status",
    description: "new, in_progress, pending, completed, denied",
    example: "completed",
  },
  { key: "reported_date", label: "Reported date (YYYY-MM-DD)", required: true },
  { key: "amount_claimed", label: "Amount claimed", example: "500" },
  { key: "amount_paid", label: "Amount paid", example: "0" },
  {
    key: "resolution_type",
    label: "Resolution type",
    description: "repair, credit, payout, denied, insurance",
  },
  { key: "resolved_at", label: "Resolved date (YYYY-MM-DD)" },
  { key: "notes", label: "Notes" },
];

const INVENTORY_FIELDS: ImportFieldDef[] = [
  {
    key: "catalog_id",
    label: "Catalog ID",
    required: true,
    description: "Must match an item in Admin equipment/supplies catalog.",
    example: "eq-moving-blanket",
  },
  {
    key: "quantity_on_hand",
    label: "Quantity on hand",
    required: true,
    example: "120",
  },
  { key: "reorder_point", label: "Reorder point", example: "20" },
  { key: "note", label: "Count note" },
];

export const IMPORT_FIELD_SCHEMAS: Record<ImportDatasetKind, ImportFieldDef[]> = {
  organizations: ORGANIZATION_FIELDS,
  people: PEOPLE_FIELDS,
  moves: MOVE_FIELDS,
  job_days: JOB_DAY_FIELDS,
  claims: CLAIM_FIELDS,
  inventory: INVENTORY_FIELDS,
};

export function templateFilename(kind: ImportDatasetKind): string {
  return `movehq-import-${kind.replace("_", "-")}-template.csv`;
}
