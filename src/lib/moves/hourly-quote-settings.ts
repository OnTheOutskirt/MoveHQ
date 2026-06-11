import {
  resolveCurrentHourlySettings,
  resolveHourlySettingsForMove,
} from "@/lib/pricing/rate-resolution";
import type { FlatRateIntake } from "./flat-rate-intake";
import type { MoveRecord } from "./types";

export type {
  CrewSizeHourlyRate,
  FlatRateQuoteSettings,
  HourlyQuoteSettings,
  MoveTypePricingId,
  PricingPackageSettings,
  ServiceFeeStandards,
  TravelChargeMethod,
  TravelFeeConfig,
  TravelFeesByMoveType,
} from "@/lib/pricing/pricing-package";

export {
  CREW_SIZE_OPTIONS,
  crewSizeLabel,
  DEFAULT_FLAT_RATE_SETTINGS,
  DEFAULT_HOURLY_QUOTE_SETTINGS,
  DEFAULT_SERVICE_FEES,
  defaultCrewRates,
  defaultPricingPackage,
  legacyHourlyCrewRate,
  MOVE_TYPE_PRICING_IDS,
  MOVE_TYPE_PRICING_LABELS,
  normalizeFlatRateQuoteSettings,
  normalizeHourlyQuoteSettings,
  resolveCrewHourlyRate,
  TRAVEL_CHARGE_METHOD_LABELS,
} from "@/lib/pricing/pricing-package";

export function resolveHourlyQuote(
  intake: FlatRateIntake,
  move?: MoveRecord | null,
) {
  return resolveHourlySettingsForMove(move, intake);
}

export function resolveCurrentHourlyQuote() {
  return resolveCurrentHourlySettings();
}
