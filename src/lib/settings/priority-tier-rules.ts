import type { PriorityTierId } from "@/lib/moves/types";
import type { FieldCatalogSettings } from "@/lib/settings/field-catalog-types";

export type TierFollowUpMode = "automated" | "manual" | "mixed";

export type PriorityTierDisplay = {
  tierLabel: string;
  badgeClass: string;
};

export type PriorityTierRulesSettings = {
  /** Moves at or above this amount are "high value" (Q1 or Q2). */
  highValueThreshold: number;
  /** How pipeline follow-up tasks are sourced per quadrant. */
  followUpMode: Record<PriorityTierId, TierFollowUpMode>;
  /** Badge labels and colors shown on moves, filters, and the quadrant matrix. */
  tierDisplay: Record<PriorityTierId, PriorityTierDisplay>;
};

const TIER_IDS: PriorityTierId[] = ["Q1", "Q2", "Q3", "Q4"];

export const DEFAULT_TIER_DISPLAY: Record<PriorityTierId, PriorityTierDisplay> = {
  Q1: { tierLabel: "Q1 Priority Lead", badgeClass: "bg-emerald-100 text-emerald-900" },
  Q2: { tierLabel: "Q2 Strategic Lead", badgeClass: "bg-sky-100 text-sky-900" },
  Q3: { tierLabel: "Q3 Quick Win", badgeClass: "bg-amber-100 text-amber-950" },
  Q4: { tierLabel: "Q4 Low Priority", badgeClass: "bg-slate-200 text-slate-700" },
};

export const TIER_BADGE_PRESETS: { label: string; badgeClass: string }[] = [
  { label: "Green", badgeClass: "bg-emerald-100 text-emerald-900" },
  { label: "Blue", badgeClass: "bg-sky-100 text-sky-900" },
  { label: "Amber", badgeClass: "bg-amber-100 text-amber-950" },
  { label: "Gray", badgeClass: "bg-slate-200 text-slate-700" },
  { label: "Violet", badgeClass: "bg-violet-100 text-violet-900" },
  { label: "Red", badgeClass: "bg-red-100 text-red-900" },
];

export const DEFAULT_HIGH_VALUE_THRESHOLD = 2000;

export const TIER_FOLLOW_UP_MODE_LABELS: Record<TierFollowUpMode, string> = {
  automated: "Automated follow-ups",
  manual: "Manual follow-ups",
  mixed: "Mixed — high-touch manual, nurture automated",
};

export function defaultPriorityTierRules(): PriorityTierRulesSettings {
  return {
    highValueThreshold: DEFAULT_HIGH_VALUE_THRESHOLD,
    followUpMode: {
      Q1: "manual",
      Q2: "mixed",
      Q3: "mixed",
      Q4: "automated",
    },
    tierDisplay: {
      Q1: { ...DEFAULT_TIER_DISPLAY.Q1 },
      Q2: { ...DEFAULT_TIER_DISPLAY.Q2 },
      Q3: { ...DEFAULT_TIER_DISPLAY.Q3 },
      Q4: { ...DEFAULT_TIER_DISPLAY.Q4 },
    },
  };
}

function mergeTierDisplay(
  raw: Partial<Record<PriorityTierId, Partial<PriorityTierDisplay>>> | undefined,
  catalog?: FieldCatalogSettings,
): Record<PriorityTierId, PriorityTierDisplay> {
  const defaults = defaultPriorityTierRules();
  const merged = { ...defaults.tierDisplay };

  if (raw) {
    for (const tier of TIER_IDS) {
      if (raw[tier]) {
        merged[tier] = { ...merged[tier], ...raw[tier] };
      }
    }
    return merged;
  }

  if (catalog) {
    for (const tier of TIER_IDS) {
      const entry = catalog.priorityTiers.find((t) => t.id === tier);
      if (entry) {
        merged[tier] = {
          tierLabel: entry.label,
          badgeClass: entry.badgeClass ?? merged[tier].badgeClass,
        };
      }
    }
  }

  return merged;
}

export function normalizePriorityTierRules(
  raw: Partial<PriorityTierRulesSettings> | null | undefined,
  catalog?: FieldCatalogSettings,
): PriorityTierRulesSettings {
  const defaults = defaultPriorityTierRules();
  const threshold = Number(raw?.highValueThreshold);
  const hasSavedDisplay = Boolean(raw?.tierDisplay);
  return {
    highValueThreshold:
      Number.isFinite(threshold) && threshold > 0 ? threshold : defaults.highValueThreshold,
    followUpMode: {
      Q1: raw?.followUpMode?.Q1 ?? defaults.followUpMode.Q1,
      Q2: raw?.followUpMode?.Q2 ?? defaults.followUpMode.Q2,
      Q3: raw?.followUpMode?.Q3 ?? defaults.followUpMode.Q3,
      Q4: raw?.followUpMode?.Q4 ?? defaults.followUpMode.Q4,
    },
    tierDisplay: mergeTierDisplay(
      hasSavedDisplay ? raw?.tierDisplay : undefined,
      hasSavedDisplay ? undefined : catalog,
    ),
  };
}

export function formatHighValueThreshold(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
