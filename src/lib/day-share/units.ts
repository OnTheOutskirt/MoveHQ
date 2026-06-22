import { defaultDayShareSettings } from "./settings-defaults";
import type { DayPortion, DayShareFraction, DayShareSettings } from "./types";

/** Day capacity in twelfths — supports ¼, ⅓, ½, ⅔, and full portions. */
export const DAY_SHARE_CAPACITY = 12;

/** Units (of `DAY_SHARE_CAPACITY`) consumed by each day portion. */
export const DAY_PORTION_UNITS: Record<DayPortion, number> = {
  quarter: 3,
  third: 4,
  half: 6,
  two_thirds: 8,
  full: 12,
};

export const DAY_PORTION_LABELS: Record<DayPortion, string> = {
  quarter: "¼ day",
  third: "⅓ day",
  half: "½ day",
  two_thirds: "⅔ day",
  full: "Full day",
};

export function fractionUnits(
  fraction: DayShareFraction,
  settings: DayShareSettings = defaultDayShareSettings(),
): number {
  const portion = settings.fractionPortions[fraction];
  return DAY_PORTION_UNITS[portion];
}

export function isFullDayFraction(fraction: DayShareFraction): boolean {
  return fraction === "long";
}

/** Valid pairings that fill one crew-day (6 units). */
export const DAY_SHARE_COMBINATION_HINT =
  "Full day alone · or medium + brief · or 2 shorts · or 3 briefs";

export function combinationsFillDay(
  fractions: DayShareFraction[],
  settings: DayShareSettings = defaultDayShareSettings(),
): { valid: boolean; message?: string } {
  if (fractions.length === 0) return { valid: true };
  const units = fractions.reduce((sum, f) => sum + fractionUnits(f, settings), 0);
  if (units > DAY_SHARE_CAPACITY) {
    return { valid: false, message: "Combined jobs exceed one crew-day." };
  }
  if (units < DAY_SHARE_CAPACITY) {
    return { valid: false, message: "Crew-day is not fully scheduled yet." };
  }
  return { valid: true };
}

export function canPairFractions(
  existing: DayShareFraction,
  incoming: DayShareFraction,
  settings: DayShareSettings = defaultDayShareSettings(),
): boolean {
  return combinationsFillDay([existing, incoming], settings).valid;
}
