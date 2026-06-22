import { DAY_PORTIONS, type DayPortion, type DayShareFraction, type DayShareSettings } from "./types";

export function defaultDayShareSettings(): DayShareSettings {
  return {
    sectionLabel: "Open slots",
    slotVerb: "Need",
    allowedCrewSizes: [2, 3],
    fractionLabels: {
      brief: "Brief (⅓ day)",
      short: "Short (½ day)",
      medium: "Medium (⅔ day)",
      long: "Long (full day)",
    },
    fractionPortions: {
      brief: "third",
      short: "half",
      medium: "two_thirds",
      long: "full",
    },
    periodLabels: {
      morning: "Morning",
      afternoon: "Afternoon",
    },
  };
}

function normalizePortion(value: unknown, fallback: DayPortion): DayPortion {
  return DAY_PORTIONS.includes(value as DayPortion) ? (value as DayPortion) : fallback;
}

export function normalizeDayShareSettings(raw?: Partial<DayShareSettings> | null): DayShareSettings {
  const defaults = defaultDayShareSettings();
  if (!raw) return defaults;
  const sizes = Array.isArray(raw.allowedCrewSizes)
    ? raw.allowedCrewSizes.filter((n) => typeof n === "number" && n >= 2 && n <= 12)
    : defaults.allowedCrewSizes;
  const rawPortions: Partial<Record<DayShareFraction, DayPortion>> = raw.fractionPortions ?? {};
  return {
    sectionLabel: raw.sectionLabel?.trim() || defaults.sectionLabel,
    slotVerb: raw.slotVerb?.trim() || defaults.slotVerb,
    allowedCrewSizes: sizes.length > 0 ? [...new Set(sizes)].sort((a, b) => a - b) : defaults.allowedCrewSizes,
    fractionLabels: { ...defaults.fractionLabels, ...raw.fractionLabels },
    fractionPortions: {
      brief: normalizePortion(rawPortions.brief, defaults.fractionPortions.brief),
      short: normalizePortion(rawPortions.short, defaults.fractionPortions.short),
      medium: normalizePortion(rawPortions.medium, defaults.fractionPortions.medium),
      long: normalizePortion(rawPortions.long, defaults.fractionPortions.long),
    },
    periodLabels: { ...defaults.periodLabels, ...raw.periodLabels },
  };
}

export function crewSizeAllowsDayShare(
  crewSize: number,
  settings: DayShareSettings = defaultDayShareSettings(),
): boolean {
  return settings.allowedCrewSizes.includes(crewSize);
}
