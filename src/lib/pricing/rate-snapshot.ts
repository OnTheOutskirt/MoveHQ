import type { MoveRecord } from "@/lib/moves/types";
import { loadPricingRateSchedule } from "./rate-history-storage";
import type { MovePricingRateSnapshot, PricingRateSchedule } from "./rate-history-types";
import {
  isMoveRateLocked,
  moveRateLockDate,
  resolveRateEntryAsOf,
  toDateKey,
} from "./rate-resolution";

export function buildPricingRateSnapshot(
  move: MoveRecord,
  lockDate?: string,
  schedule: PricingRateSchedule = loadPricingRateSchedule(),
): MovePricingRateSnapshot | null {
  const dateKey = lockDate ?? moveRateLockDate(move);
  if (!dateKey) return null;

  const entry = resolveRateEntryAsOf(dateKey, schedule.entries);
  if (!entry) return null;

  return {
    lockedAt: new Date().toISOString(),
    effectiveFrom: entry.effectiveFrom,
    supplyUnitPrices: { ...entry.supplyUnitPrices },
    hourlyCrewRate:
      move.quoteType === "hourly" && move.quoteAmount != null
        ? move.quoteAmount
        : entry.hourlyCrewRate,
    hourlySettings: { ...entry.hourlySettings },
    flatRateSettings: { ...entry.flatRateSettings },
    defaultPricingType: entry.defaultPricingType,
  };
}

export function withPricingRateSnapshot(
  move: MoveRecord,
  schedule: PricingRateSchedule = loadPricingRateSchedule(),
): MoveRecord {
  if (!isMoveRateLocked(move) || move.intake.pricingRateSnapshot) return move;
  const snapshot = buildPricingRateSnapshot(move, undefined, schedule);
  if (!snapshot) return move;
  return {
    ...move,
    intake: {
      ...move.intake,
      pricingRateSnapshot: snapshot,
    },
  };
}

export function ensureMovesHaveRateSnapshots(moves: MoveRecord[]): MoveRecord[] {
  const schedule = loadPricingRateSchedule();
  let changed = false;
  const next = moves.map((move) => {
    const patched = withPricingRateSnapshot(move, schedule);
    if (patched !== move) changed = true;
    return patched;
  });
  return changed ? next : moves;
}

export function lockMoveRatesOnContract(move: MoveRecord, sentAt: string): MoveRecord {
  const snapshot =
    move.intake.pricingRateSnapshot ??
    buildPricingRateSnapshot(move, toDateKey(sentAt));
  if (!snapshot) return move;
  return {
    ...move,
    intake: {
      ...move.intake,
      pricingRateSnapshot: snapshot,
      hourlyQuote: snapshot.hourlySettings,
    },
  };
}
