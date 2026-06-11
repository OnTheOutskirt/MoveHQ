import type {
  FlatRateQuoteSettings,
  HourlyQuoteSettings,
} from "@/lib/moves/hourly-quote-settings";

/** Company-wide rate schedule entry — supply unit prices + hourly package. */
export type PricingRateScheduleEntry = {
  id: string;
  /** YYYY-MM-DD — rates apply from this date forward until the next entry. */
  effectiveFrom: string;
  createdAt: string;
  note?: string;
  /** catalogId → unit price at this effective date */
  supplyUnitPrices: Record<string, number>;
  /** Default crew-4 rate — derived from hourlySettings.crewRates when saving. */
  hourlyCrewRate: number;
  hourlySettings: HourlyQuoteSettings;
  flatRateSettings: FlatRateQuoteSettings;
  defaultPricingType: "hourly" | "flat_rate";
};

/** Rates locked on a move when contracted — independent of future admin changes. */
export type MovePricingRateSnapshot = {
  lockedAt: string;
  effectiveFrom: string;
  supplyUnitPrices: Record<string, number>;
  hourlyCrewRate: number;
  hourlySettings: HourlyQuoteSettings;
  flatRateSettings?: FlatRateQuoteSettings;
  defaultPricingType?: "hourly" | "flat_rate";
};

export type PricingRateSchedule = {
  entries: PricingRateScheduleEntry[];
};
