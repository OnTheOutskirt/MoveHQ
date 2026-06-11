import type { DayShareFraction } from "./types";

/** Day capacity in sixths — brief=⅓, short=½, medium=⅔, long=full. */
export const DAY_SHARE_CAPACITY = 6;

export function fractionUnits(fraction: DayShareFraction): number {
  switch (fraction) {
    case "brief":
      return 2;
    case "short":
      return 3;
    case "medium":
      return 4;
    case "long":
      return 6;
  }
}

export function isFullDayFraction(fraction: DayShareFraction): boolean {
  return fraction === "long";
}

/** Valid pairings that fill one crew-day (6 units). */
export const DAY_SHARE_COMBINATION_HINT =
  "Full day alone · or medium + brief · or 2 shorts · or 3 briefs";

export function combinationsFillDay(
  fractions: DayShareFraction[],
): { valid: boolean; message?: string } {
  if (fractions.length === 0) return { valid: true };
  const units = fractions.reduce((sum, f) => sum + fractionUnits(f), 0);
  if (units > DAY_SHARE_CAPACITY) {
    return { valid: false, message: "Combined jobs exceed one crew-day." };
  }
  if (units < DAY_SHARE_CAPACITY) {
    return { valid: false, message: "Crew-day is not fully scheduled yet." };
  }
  const sorted = [...fractions].sort().join(",");
  const validSets = new Set([
    "long",
    "brief,medium",
    "medium,brief",
    "short,short",
    "brief,brief,brief",
  ]);
  if (validSets.has(sorted) || fractions.length === 1 && fractions[0] === "long") {
    return { valid: true };
  }
  return {
    valid: false,
    message: `Invalid pairing (${DAY_SHARE_COMBINATION_HINT}).`,
  };
}

export function canPairFractions(
  existing: DayShareFraction,
  incoming: DayShareFraction,
): boolean {
  return combinationsFillDay([existing, incoming]).valid;
}
