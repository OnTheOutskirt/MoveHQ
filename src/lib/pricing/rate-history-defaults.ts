import { DEFAULT_EQUIPMENT_SUPPLY_CATALOG } from "@/lib/moves/equipment-catalog-defaults";
import {
  DEFAULT_FLAT_RATE_SETTINGS,
  DEFAULT_HOURLY_QUOTE_SETTINGS,
  legacyHourlyCrewRate,
  normalizeFlatRateQuoteSettings,
  normalizeHourlyQuoteSettings,
} from "@/lib/moves/hourly-quote-settings";
import type { PricingRateSchedule, PricingRateScheduleEntry } from "./rate-history-types";

function supplyPrices(
  overrides: Record<string, number>,
  base = DEFAULT_EQUIPMENT_SUPPLY_CATALOG,
): Record<string, number> {
  const map: Record<string, number> = {};
  for (const item of base) {
    map[item.id] = overrides[item.id] ?? item.unitPrice;
  }
  return map;
}

function entry(
  effectiveFrom: string,
  note: string,
  supplyOverrides: Record<string, number>,
  hourlyOverrides: Partial<typeof DEFAULT_HOURLY_QUOTE_SETTINGS> = {},
  flatOverrides: Partial<typeof DEFAULT_FLAT_RATE_SETTINGS> = {},
  defaultPricingType: "hourly" | "flat_rate" = "flat_rate",
): PricingRateScheduleEntry {
  const hourlySettings = normalizeHourlyQuoteSettings({
    ...DEFAULT_HOURLY_QUOTE_SETTINGS,
    ...hourlyOverrides,
  });
  return {
    id: `rate-${effectiveFrom}`,
    effectiveFrom,
    createdAt: `${effectiveFrom}T12:00:00.000Z`,
    note,
    supplyUnitPrices: supplyPrices(supplyOverrides),
    hourlyCrewRate: legacyHourlyCrewRate(hourlySettings),
    hourlySettings,
    flatRateSettings: normalizeFlatRateQuoteSettings({
      ...DEFAULT_FLAT_RATE_SETTINGS,
      ...flatOverrides,
    }),
    defaultPricingType,
  };
}

/** Demo schedule — older booked moves resolve to prior effective dates. */
export const DEFAULT_PRICING_RATE_SCHEDULE: PricingRateSchedule = {
  entries: [
    entry(
      "2024-06-01",
      "2024 summer rates",
      { small_box: 3, medium_box: 4, large_box: 6, wardrobe_box: 15, tv_box: 30, packing_paper: 18 },
      { travelFee: 125, minimumHours: 3, dumpFee: 75, cratingFrom: 150 },
      { ratePerUnit: 3.95, minimumCharge: 650 },
    ),
    entry(
      "2025-06-01",
      "2025 mid-year increase",
      { small_box: 4, medium_box: 5, large_box: 6, wardrobe_box: 16, tv_box: 32, packing_paper: 20 },
      { travelFee: 140, minimumHours: 3, dumpFee: 80, cratingFrom: 165 },
      { ratePerUnit: 4.1, minimumCharge: 675 },
    ),
    entry(
      "2026-03-01",
      "Current rates",
      {},
      {},
      {},
    ),
  ],
};
