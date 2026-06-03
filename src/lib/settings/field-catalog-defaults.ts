import {
  QUALIFIED_LOST_REASONS,
  UNQUALIFIED_LOST_REASONS,
} from "@/lib/moves/lost-reasons-constants";
import type { FieldCatalogEntry, FieldCatalogSettings } from "./field-catalog-types";

const PIPELINE_STAGE_SEED: FieldCatalogEntry[] = [
  {
    id: "new_lead",
    label: "New Lead",
    description: "Just came in — assign rep and first contact",
    badgeClass: "bg-slate-100 text-slate-700",
    columnClass: "border-slate-200 bg-slate-50/80",
    dotClass: "bg-slate-400",
    detailLabel: "New Lead",
    builtIn: true,
  },
  {
    id: "waiting",
    label: "Waiting",
    description: "Gathering info, walkthrough needed, or visit scheduled",
    badgeClass: "bg-blue-50 text-blue-800",
    columnClass: "border-blue-100 bg-blue-50/50",
    dotClass: "bg-blue-500",
    detailLabel: "Waiting",
    builtIn: true,
  },
  {
    id: "quote_sent",
    label: "Quote Sent",
    description: "Proposal out to client",
    badgeClass: "bg-violet-50 text-violet-800",
    columnClass: "border-violet-100 bg-violet-50/50",
    dotClass: "bg-violet-500",
    detailLabel: "Quote Sent",
    builtIn: true,
  },
  {
    id: "needs_contract",
    label: "Needs Contract",
    description: "Awaiting contract or deposit",
    badgeClass: "bg-amber-50 text-amber-900",
    columnClass: "border-amber-100 bg-amber-50/50",
    dotClass: "bg-amber-500",
    detailLabel: "Needs Contract",
    builtIn: true,
  },
  {
    id: "booked",
    label: "Booked",
    description: "Booked — schedule, crew, and move execution",
    badgeClass: "bg-emerald-50 text-emerald-800",
    columnClass: "border-emerald-100 bg-emerald-50/50",
    dotClass: "bg-emerald-500",
    detailLabel: "Booked",
    builtIn: true,
  },
  {
    id: "completed",
    label: "Completed",
    description: "Move finished — close-out & billing",
    badgeClass: "bg-slate-200 text-slate-800",
    columnClass: "border-slate-200 bg-slate-50/80",
    dotClass: "bg-slate-600",
    detailLabel: "Move Complete",
    builtIn: true,
    hideFromBoard: true,
  },
];

const WAITING_SUBSTAGE_SEED: FieldCatalogEntry[] = [
  {
    id: "needs_info",
    label: "Needs Info",
    description: "Missing details before we can quote",
    badgeClass: "bg-blue-50 text-blue-800",
    builtIn: true,
  },
  {
    id: "needs_walkthrough",
    label: "Needs Walkthrough",
    description: "Site visit or video walkthrough required",
    badgeClass: "bg-indigo-50 text-indigo-800",
    builtIn: true,
  },
  {
    id: "walkthrough_scheduled",
    label: "Walkthrough Scheduled",
    description: "Visit on calendar — complete then quote",
    badgeClass: "bg-violet-50 text-violet-800",
    builtIn: true,
  },
];

const CONDITION_SEED: FieldCatalogEntry[] = [
  { id: "active", label: "Active", description: "Normal open move", badgeClass: "bg-emerald-50 text-emerald-800", builtIn: true },
  { id: "lost", label: "Lost", description: "Did not book", badgeClass: "bg-red-50 text-red-800", builtIn: true },
  { id: "cancelled", label: "Cancelled", description: "Was booked, then cancelled", badgeClass: "bg-orange-50 text-orange-900", builtIn: true },
  { id: "on_hold", label: "On Hold", description: "Paused but not lost", badgeClass: "bg-amber-50 text-amber-900", builtIn: true },
  { id: "needs_review", label: "Needs Review", description: "Requires internal approval or check", badgeClass: "bg-violet-50 text-violet-900", builtIn: true },
  { id: "closed", label: "Closed", description: "Completed and administratively closed", badgeClass: "bg-slate-200 text-slate-700", builtIn: true },
];

const LEAD_SOURCE_SEED: FieldCatalogEntry[] = [
  { id: "repeat_customer", label: "Return client", isHot: true, builtIn: true },
  { id: "referral_realtor", label: "Realtor referral", isHot: true, builtIn: true },
  { id: "referral_senior_living", label: "Senior living referral", isHot: true, builtIn: true },
  { id: "referral_business", label: "Business referral", isHot: true, builtIn: true },
  { id: "referral_other", label: "Referral", isHot: true, builtIn: true },
  { id: "google", label: "Google / internet search", builtIn: true },
  { id: "google_maps", label: "Google Maps", builtIn: true },
  { id: "facebook", label: "Facebook", builtIn: true },
  { id: "yelp", label: "Yelp", builtIn: true },
  { id: "instagram", label: "Instagram", builtIn: true },
  { id: "nextdoor", label: "Nextdoor", builtIn: true },
  { id: "saw_truck", label: "Saw the truck", builtIn: true },
  { id: "website", label: "Website", builtIn: true },
  { id: "phone", label: "Phone / unknown", builtIn: true },
  { id: "other", label: "Other", builtIn: true },
];

const MOVE_TYPE_SEED: FieldCatalogEntry[] = [
  { id: "local", label: "Local", builtIn: true },
  { id: "long_distance", label: "Long distance", builtIn: true },
  { id: "commercial", label: "Commercial", builtIn: true },
  { id: "labor_only", label: "Labor only", builtIn: true },
];

const PRIORITY_TIER_SEED: FieldCatalogEntry[] = [
  { id: "Q1", label: "Q1 Priority Lead", shortCode: "Q1", meaning: "Hot source + high value ($2k+)", badgeClass: "bg-emerald-100 text-emerald-900", builtIn: true },
  { id: "Q2", label: "Q2 Strategic Lead", shortCode: "Q2", meaning: "Cold source + high value ($2k+)", badgeClass: "bg-sky-100 text-sky-900", builtIn: true },
  { id: "Q3", label: "Q3 Quick Win", shortCode: "Q3", meaning: "Hot source + lower value (under $2k)", badgeClass: "bg-amber-100 text-amber-950", builtIn: true },
  { id: "Q4", label: "Q4 Low Priority", shortCode: "Q4", meaning: "Cold source + lower value (under $2k)", badgeClass: "bg-slate-200 text-slate-700", builtIn: true },
];

export function defaultFieldCatalog(): FieldCatalogSettings {
  return {
    pipelineStages: PIPELINE_STAGE_SEED.map((s) => ({ ...s })),
    waitingSubstages: WAITING_SUBSTAGE_SEED.map((s) => ({ ...s })),
    conditionStatuses: CONDITION_SEED.map((s) => ({ ...s })),
    leadSources: LEAD_SOURCE_SEED.map((s) => ({ ...s })),
    moveTypes: MOVE_TYPE_SEED.map((s) => ({ ...s })),
    priorityTiers: PRIORITY_TIER_SEED.map((s) => ({ ...s })),
    lostReasons: [
      ...UNQUALIFIED_LOST_REASONS.map((r) => ({
        id: r.id,
        label: r.label,
        description: r.description,
        qualification: "unqualified" as const,
        builtIn: true,
      })),
      ...QUALIFIED_LOST_REASONS.map((r) => ({
        id: r.id,
        label: r.label,
        description: r.description,
        qualification: "qualified" as const,
        builtIn: true,
      })),
    ],
  };
}

export function slugFromLabel(label: string): string {
  const base = label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  return base || `item_${Date.now()}`;
}

export function uniqueCatalogId(label: string, existing: FieldCatalogEntry[]): string {
  let id = slugFromLabel(label);
  let n = 2;
  while (existing.some((e) => e.id === id)) {
    id = `${slugFromLabel(label)}_${n}`;
    n++;
  }
  return id;
}

function mergeEntries(
  defaults: FieldCatalogEntry[],
  saved: FieldCatalogEntry[] | undefined,
): FieldCatalogEntry[] {
  if (!saved?.length) return defaults;
  const savedById = new Map(saved.map((e) => [e.id, e]));
  const merged = defaults.map((d) => ({ ...d, ...savedById.get(d.id), id: d.id, builtIn: true }));
  for (const entry of saved) {
    if (!defaults.some((d) => d.id === entry.id)) {
      merged.push({ ...entry, builtIn: entry.builtIn ?? false });
    }
  }
  return merged;
}

export function normalizeFieldCatalog(raw: Partial<FieldCatalogSettings> | undefined): FieldCatalogSettings {
  const defaults = defaultFieldCatalog();
  if (!raw) return defaults;
  return {
    pipelineStages: mergeEntries(defaults.pipelineStages, raw.pipelineStages),
    waitingSubstages: mergeEntries(defaults.waitingSubstages, raw.waitingSubstages),
    conditionStatuses: mergeEntries(defaults.conditionStatuses, raw.conditionStatuses),
    leadSources: mergeEntries(defaults.leadSources, raw.leadSources),
    moveTypes: mergeEntries(defaults.moveTypes, raw.moveTypes),
    priorityTiers: mergeEntries(defaults.priorityTiers, raw.priorityTiers),
    lostReasons: mergeEntries(defaults.lostReasons, raw.lostReasons),
  };
}

export function fieldCatalogEntryCount(catalog: FieldCatalogSettings): number {
  return (
    catalog.pipelineStages.length +
    catalog.waitingSubstages.length +
    catalog.conditionStatuses.length +
    catalog.leadSources.length +
    catalog.moveTypes.length +
    catalog.priorityTiers.length +
    catalog.lostReasons.length
  );
}

/** Map legacy move type display string → catalog id. */
export function moveTypeDisplayToCatalogId(display: string): string {
  const map: Record<string, string> = {
    Local: "local",
    "Long distance": "long_distance",
    Commercial: "commercial",
    "Labor only": "labor_only",
  };
  return map[display] ?? slugFromLabel(display);
}

export function moveTypeCatalogIdToDisplay(id: string, catalog?: FieldCatalogSettings): string {
  const entry = (catalog ?? defaultFieldCatalog()).moveTypes.find((m) => m.id === id);
  return entry?.label ?? id;
}
