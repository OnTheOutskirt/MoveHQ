/**
 * Lead Priority Tier — user-facing layer on top of internal Q1–Q4 quadrant logic.
 */
import { getFollowUpBucket } from "./follow-ups";
import type { IntakeHearAbout } from "./flat-rate-intake";
import type {
  LeadChannel,
  LeadHeat,
  MoveRecord,
  QuadrantId,
  ValueTier,
} from "./types";

export const VALUE_THRESHOLD = 2000;

export type PriorityTierId = QuadrantId;

export const PRIORITY_TIER_IDS = ["Q1", "Q2", "Q3", "Q4"] as const;

export type PriorityTierStyle = {
  id: PriorityTierId;
  /** e.g. "Q1 Priority Lead" */
  tierLabel: string;
  shortCode: string;
  meaning: string;
  salesTreatment: string;
  opsNote: string;
  badge: string;
  dot: string;
  ring: string;
};

export const priorityTierConfig: Record<PriorityTierId, PriorityTierStyle> = {
  Q1: {
    id: "Q1",
    tierLabel: "Q1 Priority Lead",
    shortCode: "Q1",
    meaning: "Hot source + high value ($2k+)",
    salesTreatment: "White-glove — fastest follow-up, senior salesperson",
    opsNote: "Assign strong crew · confirm details early · protect referral relationship",
    badge: "bg-emerald-100 text-emerald-900",
    dot: "bg-emerald-500",
    ring: "ring-emerald-400/50",
  },
  Q2: {
    id: "Q2",
    tierLabel: "Q2 Strategic Lead",
    shortCode: "Q2",
    meaning: "Cold source + high value ($2k+)",
    salesTreatment: "Strong sales effort — nurture heavily, consider walkthrough",
    opsNote: "Best available crew · avoid weak time slots · worth extra coordination",
    badge: "bg-sky-100 text-sky-900",
    dot: "bg-sky-500",
    ring: "ring-sky-400/50",
  },
  Q3: {
    id: "Q3",
    tierLabel: "Q3 Quick Win",
    shortCode: "Q3",
    meaning: "Hot source + lower value (under $2k)",
    salesTreatment: "Good service, efficient process — protect the relationship",
    opsNote: "Standard crew · still responsive communication",
    badge: "bg-amber-100 text-amber-950",
    dot: "bg-amber-500",
    ring: "ring-amber-400/50",
  },
  Q4: {
    id: "Q4",
    tierLabel: "Q4 Low Priority",
    shortCode: "Q4",
    meaning: "Cold source + lower value (under $2k)",
    salesTreatment: "Automated follow-up — limited manual effort unless slow",
    opsNote: "Fill schedule gaps · avoid overcommitting prime slots",
    badge: "bg-slate-200 text-slate-700",
    dot: "bg-slate-400",
    ring: "ring-slate-300/60",
  },
};

const HOT_CHANNELS: LeadChannel[] = [
  "repeat_customer",
  "referral_realtor",
  "referral_senior_living",
  "referral_business",
  "referral_other",
];

export const leadChannelLabels: Record<LeadChannel, string> = {
  repeat_customer: "Return client",
  referral_realtor: "Realtor referral",
  referral_senior_living: "Senior living referral",
  referral_business: "Business referral",
  referral_other: "Referral",
  google: "Google / internet search",
  google_maps: "Google Maps",
  facebook: "Facebook",
  yelp: "Yelp",
  instagram: "Instagram",
  nextdoor: "Nextdoor",
  saw_truck: "Saw the truck",
  website: "Website",
  phone: "Phone / unknown",
  other: "Other",
};

export function isHotLeadChannel(channel: LeadChannel): boolean {
  return HOT_CHANNELS.includes(channel);
}

export function leadHeatFromChannel(channel: LeadChannel): LeadHeat {
  return isHotLeadChannel(channel) ? "hot" : "cold";
}

export function leadHeatLabel(heat: LeadHeat): string {
  return heat === "hot" ? "Hot" : "Cold";
}

export function valueTierFromAmount(amount: number | null): ValueTier | null {
  if (amount == null) return null;
  return amount >= VALUE_THRESHOLD ? "high" : "low";
}

export function valueTierLabel(tier: ValueTier): string {
  return tier === "high" ? "High value" : "Low value";
}

export function getMoveEstimatedValue(move: MoveRecord): number | null {
  if (move.quoteAmount != null) return move.quoteAmount;
  const est = move.intake.estimatedMoveValue;
  if (typeof est === "number" && est > 0) return est;
  return null;
}

export function getMoveValueTier(move: MoveRecord): ValueTier | null {
  return valueTierFromAmount(getMoveEstimatedValue(move));
}

export function computePriorityTier(heat: LeadHeat, tier: ValueTier): PriorityTierId {
  if (heat === "hot" && tier === "high") return "Q1";
  if (heat === "cold" && tier === "high") return "Q2";
  if (heat === "hot" && tier === "low") return "Q3";
  return "Q4";
}

export function getMovePriorityTier(move: MoveRecord): PriorityTierId | null {
  const tier = getMoveValueTier(move);
  if (!tier) return null;
  return computePriorityTier(leadHeatFromChannel(move.leadChannel), tier);
}

export function priorityTierLabel(tier: PriorityTierId): string {
  return priorityTierConfig[tier].tierLabel;
}

export function priorityTierSortOrder(tier: PriorityTierId | null): number {
  switch (tier) {
    case "Q1":
      return 0;
    case "Q2":
      return 1;
    case "Q3":
      return 2;
    case "Q4":
      return 3;
    default:
      return 4;
  }
}

/** Lower = work first. Q1 overdue → Q1 today → Q2 overdue → … */
export function salesPrioritySortRank(move: MoveRecord): number {
  const tierOrder = priorityTierSortOrder(getMovePriorityTier(move)) * 10;
  if (!move.followUpDue || move.conditionStatus !== "active") return tierOrder + 5;
  const bucket = getFollowUpBucket(move);
  const fu =
    bucket === "overdue" ? 0 : bucket === "today" ? 1 : bucket === "upcoming" ? 2 : 3;
  return tierOrder + fu;
}

export function compareSalesPriority(a: MoveRecord, b: MoveRecord): number {
  const ra = salesPrioritySortRank(a);
  const rb = salesPrioritySortRank(b);
  if (ra !== rb) return ra - rb;
  return a.customerName.localeCompare(b.customerName, undefined, { sensitivity: "base" });
}

export function shouldAutomateFollowUp(move: MoveRecord): boolean {
  return (
    getMovePriorityTier(move) === "Q4" &&
    move.followUpDue != null &&
    move.conditionStatus === "active"
  );
}

/** Hot + High Value — for quadrant badge tooltips. */
export function quadrantInputsLabel(move: MoveRecord): string {
  const heat = leadHeatFromChannel(move.leadChannel);
  const tier = getMoveValueTier(move);
  if (!tier) return `${leadHeatLabel(heat)} · value pending`;
  return `${leadHeatLabel(heat)} + ${valueTierLabel(tier)} value`;
}

export function heatValueSummary(move: MoveRecord): string {
  const heat = leadHeatFromChannel(move.leadChannel);
  const tier = getMoveValueTier(move);
  if (!tier) return `${leadHeatLabel(heat)} · value pending`;
  return `${leadHeatLabel(heat)} / ${valueTierLabel(tier)}`;
}

export function leadChannelFromHearAbout(hear: IntakeHearAbout | ""): LeadChannel {
  switch (hear) {
    case "repeat":
      return "repeat_customer";
    case "referral-realtor":
      return "referral_realtor";
    case "referral-senior":
      return "referral_senior_living";
    case "referral-friend":
    case "referral-other":
      return "referral_other";
    case "google":
      return "google";
    case "google-maps":
      return "google_maps";
    case "facebook":
      return "facebook";
    case "yelp":
      return "yelp";
    case "instagram":
      return "instagram";
    case "nextdoor":
      return "nextdoor";
    default:
      return "website";
  }
}

export function leadChannelFromLegacySource(source: MoveRecord["source"]): LeadChannel {
  switch (source) {
    case "Repeat customer":
      return "repeat_customer";
    case "Referral":
      return "referral_other";
    case "Phone":
      return "phone";
    default:
      return "website";
  }
}

/** Simple UI priority — internal Q1–Q4 maps here; not shown to users. */
export type DisplayPriority = "high" | "standard" | "low";

export const DISPLAY_PRIORITIES = ["high", "standard", "low"] as const;

export type DisplayPriorityStyle = {
  label: string;
  /** Left border on cards */
  cardBorder: string;
  badge: string;
  sortOrder: number;
};

export const displayPriorityConfig: Record<DisplayPriority, DisplayPriorityStyle> = {
  high: {
    label: "High Priority",
    cardBorder: "border-l-4 border-l-emerald-500",
    badge: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80",
    sortOrder: 0,
  },
  standard: {
    label: "Standard",
    cardBorder: "border-l-4 border-l-sky-400",
    badge: "bg-sky-50 text-sky-700 ring-1 ring-sky-200/80",
    sortOrder: 1,
  },
  low: {
    label: "Low Priority",
    cardBorder: "border-l-4 border-l-slate-300",
    badge: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    sortOrder: 2,
  },
};

export function getDisplayPriority(move: MoveRecord): DisplayPriority {
  const tier = getMovePriorityTier(move);
  if (tier === "Q1") return "high";
  if (tier === "Q4") return "low";
  return "standard";
}

export function matchesDisplayPriorityFilter(
  move: MoveRecord,
  filter: "all" | DisplayPriority,
): boolean {
  if (filter === "all") return true;
  return getDisplayPriority(move) === filter;
}

export const getMoveQuadrant = getMovePriorityTier;
export const quadrantConfig = priorityTierConfig;
export const QUADRANT_IDS = PRIORITY_TIER_IDS;
export const quadrantSortPriority = priorityTierSortOrder;
