import type { EquipmentCatalogItem } from "@/lib/moves/equipment-catalog-types";
import {
  DEFAULT_FLAT_RATE_SETTINGS,
  DEFAULT_HOURLY_QUOTE_SETTINGS,
  legacyHourlyCrewRate,
  normalizeFlatRateQuoteSettings,
  normalizeHourlyQuoteSettings,
  resolveCrewHourlyRate,
  type FlatRateQuoteSettings,
  type HourlyQuoteSettings,
} from "@/lib/moves/hourly-quote-settings";
import type { FlatRateIntake } from "@/lib/moves/flat-rate-intake";
import type { MoveRecord } from "@/lib/moves/types";
import { defaultSettings } from "@/lib/settings/defaults";
import { loadSettings } from "@/lib/settings/storage";
import { loadPricingRateSchedule } from "./rate-history-storage";
import type { MovePricingRateSnapshot, PricingRateScheduleEntry } from "./rate-history-types";

export function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

export function resolveRateEntryAsOf(
  dateKey: string,
  entries: PricingRateScheduleEntry[],
): PricingRateScheduleEntry | null {
  if (entries.length === 0) return null;
  let match: PricingRateScheduleEntry | null = null;
  for (const entry of entries) {
    if (entry.effectiveFrom <= dateKey) match = entry;
    else break;
  }
  return match ?? entries[0] ?? null;
}

export function currentRateEntry(): PricingRateScheduleEntry | null {
  const schedule = loadPricingRateSchedule();
  return resolveRateEntryAsOf(toDateKey(new Date().toISOString()), schedule.entries);
}

export function resolveCurrentHourlyCrewRate(crewSize = 4): number {
  const entry = currentRateEntry();
  if (!entry) return resolveCrewHourlyRate(DEFAULT_HOURLY_QUOTE_SETTINGS, crewSize).hourlyRate;
  return resolveCrewHourlyRate(entry.hourlySettings, crewSize).hourlyRate;
}

export function resolveCurrentHourlySettings(): HourlyQuoteSettings {
  const entry = currentRateEntry();
  return entry ? normalizeHourlyQuoteSettings(entry.hourlySettings) : DEFAULT_HOURLY_QUOTE_SETTINGS;
}

export function resolveCurrentFlatRateSettings(): FlatRateQuoteSettings {
  const entry = currentRateEntry();
  return entry
    ? normalizeFlatRateQuoteSettings(entry.flatRateSettings)
    : DEFAULT_FLAT_RATE_SETTINGS;
}

export function resolveCurrentDefaultPricingType(): "hourly" | "flat_rate" {
  return loadSettings().defaults.defaultPricingType ?? defaultSettings.defaults.defaultPricingType;
}

export function resolveSupplyUnitPrice(catalogId: string, dateKey?: string): number | null {
  const schedule = loadPricingRateSchedule();
  const key = dateKey ?? toDateKey(new Date().toISOString());
  const entry = resolveRateEntryAsOf(key, schedule.entries);
  if (!entry) return null;
  return entry.supplyUnitPrices[catalogId] ?? null;
}

/** Contracted / booked moves keep snapshotted rates; open quotes use schedule as of today. */
export function isMoveRateLocked(move: MoveRecord): boolean {
  return (
    move.sentContract != null ||
    move.pipelineStage === "booked" ||
    move.pipelineStage === "completed"
  );
}

export function moveRateLockDate(move: MoveRecord): string | null {
  if (!isMoveRateLocked(move)) return null;
  return (
    move.sentContract?.sentAt?.slice(0, 10) ??
    move.websiteIntake?.bookedAt?.slice(0, 10) ??
    move.createdAt.slice(0, 10)
  );
}

export function activeMovePricingSnapshot(move: MoveRecord): MovePricingRateSnapshot | null {
  return move.intake.pricingRateSnapshot ?? null;
}

export function resolveSupplyUnitPriceForMove(
  move: MoveRecord,
  catalogId: string,
): number | null {
  const snapshot = activeMovePricingSnapshot(move);
  if (snapshot && isMoveRateLocked(move)) {
    return snapshot.supplyUnitPrices[catalogId] ?? null;
  }
  const lockDate = moveRateLockDate(move);
  if (lockDate) {
    const schedule = loadPricingRateSchedule();
    const entry = resolveRateEntryAsOf(lockDate, schedule.entries);
    return entry?.supplyUnitPrices[catalogId] ?? null;
  }
  return resolveSupplyUnitPrice(catalogId);
}

export function primaryCrewSizeForMove(move: MoveRecord): number {
  const sizes = move.jobDays?.map((d) => d.crewSize).filter((n): n is number => n != null && n > 0);
  if (sizes?.length) return sizes[0]!;
  return move.moveType === "Commercial" ? 6 : 4;
}

export function resolveHourlyCrewRateForMove(move: MoveRecord): number {
  const crewSize = primaryCrewSizeForMove(move);
  const snapshot = activeMovePricingSnapshot(move);
  if (snapshot && isMoveRateLocked(move)) {
    return resolveCrewHourlyRate(snapshot.hourlySettings, crewSize).hourlyRate;
  }
  if (move.quoteAmount != null && move.quoteType === "hourly") return move.quoteAmount;
  const lockDate = moveRateLockDate(move);
  if (lockDate) {
    const schedule = loadPricingRateSchedule();
    const entry = resolveRateEntryAsOf(lockDate, schedule.entries);
    if (entry) return resolveCrewHourlyRate(entry.hourlySettings, crewSize).hourlyRate;
  }
  return resolveCurrentHourlyCrewRate(crewSize);
}

export function resolveHourlySettingsForMove(
  move: MoveRecord | null | undefined,
  intake?: FlatRateIntake,
): HourlyQuoteSettings {
  const resolvedIntake = intake ?? move?.intake;
  const snapshot = move ? activeMovePricingSnapshot(move) : null;
  if (snapshot && move && isMoveRateLocked(move)) {
    return { ...DEFAULT_HOURLY_QUOTE_SETTINGS, ...snapshot.hourlySettings };
  }
  if (resolvedIntake?.hourlyQuote) {
    return normalizeHourlyQuoteSettings(resolvedIntake.hourlyQuote);
  }
  const lockDate = move ? moveRateLockDate(move) : null;
  if (lockDate) {
    const schedule = loadPricingRateSchedule();
    const entry = resolveRateEntryAsOf(lockDate, schedule.entries);
    if (entry) return normalizeHourlyQuoteSettings(entry.hourlySettings);
  }
  return resolveCurrentHourlySettings();
}

export function applyCatalogPricesFromEntry(
  catalog: EquipmentCatalogItem[],
  entry: PricingRateScheduleEntry,
): EquipmentCatalogItem[] {
  return catalog.map((item) => ({
    ...item,
    unitPrice: entry.supplyUnitPrices[item.id] ?? item.unitPrice,
  }));
}
