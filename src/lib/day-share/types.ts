/** Partial-day scheduling — replaces legacy "FTA" terminology in the UI. */

export const DAY_SHARE_PERIODS = ["morning", "afternoon"] as const;
export type DaySharePeriod = (typeof DAY_SHARE_PERIODS)[number];

export const DAY_SHARE_FRACTIONS = ["brief", "short", "medium", "long"] as const;
export type DayShareFraction = (typeof DAY_SHARE_FRACTIONS)[number];

/** Compact slot descriptor — same shape as calendar `FtaSlot`. */
export type DayShareSlot = {
  count: number;
  crewSize: number;
  period: DaySharePeriod;
  duration: Exclude<DayShareFraction, "long">;
};

export type DayShareBooking = {
  crewSize: number;
  period: DaySharePeriod;
  fraction: DayShareFraction;
  moveId?: string;
  jobDayId?: string;
  customerName?: string;
};

export type DayShareSettings = {
  /** UI section label (replaces "FTA"). */
  sectionLabel: string;
  /** Compact code prefix in pills, e.g. "Need" → tooltip context. */
  slotVerb: string;
  /** Crew sizes that can participate in day-share scheduling. */
  allowedCrewSizes: number[];
  fractionLabels: Record<DayShareFraction, string>;
  periodLabels: Record<DaySharePeriod, string>;
};
