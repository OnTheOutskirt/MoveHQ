import type { EquipmentCatalogItem } from "@/lib/moves/equipment-catalog-types";
import type {
  FlatRateQuoteSettings,
  HourlyQuoteSettings,
} from "@/lib/moves/hourly-quote-settings";
import {
  legacyHourlyCrewRate,
  normalizeFlatRateQuoteSettings,
  normalizeHourlyQuoteSettings,
} from "@/lib/moves/hourly-quote-settings";
import { DEFAULT_PRICING_RATE_SCHEDULE } from "./rate-history-defaults";
import type { PricingRateSchedule, PricingRateScheduleEntry } from "./rate-history-types";

const STORAGE_KEY = "jm-pricing-rate-schedule-v1";

export const PRICING_RATE_SCHEDULE_UPDATED_EVENT = "jm-pricing-rate-schedule-updated";

let cachedSchedule: PricingRateSchedule | null = null;

function normalizeEntry(raw: unknown): PricingRateScheduleEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const e = raw as Partial<PricingRateScheduleEntry>;
  if (!e.id || !e.effectiveFrom || !e.createdAt) return null;
  const hourlySettings = normalizeHourlyQuoteSettings(e.hourlySettings);
  const supplyUnitPrices =
    e.supplyUnitPrices && typeof e.supplyUnitPrices === "object"
      ? (e.supplyUnitPrices as Record<string, number>)
      : {};
  return {
    id: e.id,
    effectiveFrom: e.effectiveFrom,
    createdAt: e.createdAt,
    note: typeof e.note === "string" ? e.note : undefined,
    supplyUnitPrices,
    hourlyCrewRate:
      typeof e.hourlyCrewRate === "number" ? e.hourlyCrewRate : legacyHourlyCrewRate(hourlySettings),
    hourlySettings,
    flatRateSettings: normalizeFlatRateQuoteSettings(e.flatRateSettings),
    defaultPricingType: e.defaultPricingType === "hourly" ? "hourly" : "flat_rate",
  };
}

export function normalizePricingRateSchedule(raw: unknown): PricingRateSchedule {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_PRICING_RATE_SCHEDULE };
  const entries = Array.isArray((raw as PricingRateSchedule).entries)
    ? (raw as PricingRateSchedule).entries
        .map(normalizeEntry)
        .filter((x): x is PricingRateScheduleEntry => x != null)
    : [];
  if (entries.length === 0) return { ...DEFAULT_PRICING_RATE_SCHEDULE };
  return {
    entries: [...entries].sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom)),
  };
}

function readPricingRateScheduleFromStorage(): PricingRateSchedule {
  if (typeof window === "undefined") return { ...DEFAULT_PRICING_RATE_SCHEDULE };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PRICING_RATE_SCHEDULE };
    return normalizePricingRateSchedule(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_PRICING_RATE_SCHEDULE };
  }
}

/** In-memory cache — avoids repeated localStorage reads during move hydration. */
export function loadPricingRateSchedule(): PricingRateSchedule {
  if (typeof window === "undefined") return { ...DEFAULT_PRICING_RATE_SCHEDULE };
  if (!cachedSchedule) {
    cachedSchedule = readPricingRateScheduleFromStorage();
  }
  return cachedSchedule;
}

export function invalidatePricingRateScheduleCache(): void {
  cachedSchedule = null;
}

export function savePricingRateSchedule(schedule: PricingRateSchedule): void {
  if (typeof window === "undefined") return;
  const normalized = normalizePricingRateSchedule(schedule);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  cachedSchedule = normalized;
  window.dispatchEvent(new Event(PRICING_RATE_SCHEDULE_UPDATED_EVENT));
}

export function scheduleSnapshot(schedule: PricingRateSchedule): string {
  return JSON.stringify(schedule);
}

export function buildSupplyPriceMap(catalog: EquipmentCatalogItem[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const item of catalog) {
    map[item.id] = item.unitPrice;
  }
  return map;
}

export type RateScheduleSaveInput = {
  effectiveFrom: string;
  note?: string;
  supplyUnitPrices: Record<string, number>;
  hourlySettings: HourlyQuoteSettings;
  flatRateSettings: FlatRateQuoteSettings;
  defaultPricingType: "hourly" | "flat_rate";
};

export function ratesChanged(
  prev: PricingRateScheduleEntry | null,
  input: RateScheduleSaveInput,
): boolean {
  if (!prev) return true;
  const hourlyCrewRate = legacyHourlyCrewRate(input.hourlySettings);
  if (prev.hourlyCrewRate !== hourlyCrewRate) return true;
  if (JSON.stringify(prev.hourlySettings) !== JSON.stringify(input.hourlySettings)) return true;
  if (JSON.stringify(prev.flatRateSettings) !== JSON.stringify(input.flatRateSettings)) return true;
  const prevKeys = Object.keys(prev.supplyUnitPrices).sort();
  const nextKeys = Object.keys(input.supplyUnitPrices).sort();
  if (prevKeys.join() !== nextKeys.join()) return true;
  return prevKeys.some((k) => prev.supplyUnitPrices[k] !== input.supplyUnitPrices[k]);
}

export function appendRateScheduleEntry(
  schedule: PricingRateSchedule,
  input: RateScheduleSaveInput,
): PricingRateSchedule {
  const latest = schedule.entries[schedule.entries.length - 1] ?? null;
  if (!ratesChanged(latest, input)) {
    return schedule;
  }

  const sameDayIdx = schedule.entries.findIndex((e) => e.effectiveFrom === input.effectiveFrom);
  const entry: PricingRateScheduleEntry = {
    id: `rate-${input.effectiveFrom}-${Date.now().toString(36).slice(-4)}`,
    effectiveFrom: input.effectiveFrom,
    createdAt: new Date().toISOString(),
    note: input.note,
    supplyUnitPrices: input.supplyUnitPrices,
    hourlyCrewRate: legacyHourlyCrewRate(input.hourlySettings),
    hourlySettings: input.hourlySettings,
    flatRateSettings: input.flatRateSettings,
    defaultPricingType: input.defaultPricingType,
  };

  const nextEntries =
    sameDayIdx >= 0
      ? schedule.entries.map((e, i) => (i === sameDayIdx ? entry : e))
      : [...schedule.entries, entry];

  return {
    entries: nextEntries.sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom)),
  };
}
