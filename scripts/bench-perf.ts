/**
 * Perf bench for hot paths — run: npm run bench:perf
 */
import { MOCK_MOVES } from "../src/lib/moves/mock-data";
import { enrichMockMove } from "../src/lib/moves/mock-extras";
import { mergeStockLines } from "../src/lib/operations/inventory";
import { buildDefaultInventoryStore } from "../src/lib/operations/inventory-defaults";
import { DEFAULT_EQUIPMENT_SUPPLY_CATALOG } from "../src/lib/moves/equipment-catalog-defaults";
import {
  invalidatePricingRateScheduleCache,
  loadPricingRateSchedule,
} from "../src/lib/pricing/rate-history-storage";
import { ensureMovesHaveRateSnapshots } from "../src/lib/pricing/rate-snapshot";
import { movesSessionFingerprint } from "../src/lib/moves/moves-session-storage";
import type { MoveRecord } from "../src/lib/moves/types";

// Simulate browser localStorage for schedule reads
const store = new Map<string, string>();
(globalThis as { window?: { localStorage: Storage } }).window = {
  localStorage: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, v);
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
    clear: () => store.clear(),
    key: () => null,
    length: 0,
  } as Storage,
};

store.set(
  "jm-pricing-rate-schedule-v1",
  JSON.stringify(loadPricingRateSchedule()),
);
invalidatePricingRateScheduleCache();

function bench(label: string, iterations: number, fn: () => void): number {
  for (let i = 0; i < Math.min(5, iterations); i++) fn();
  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  const ms = performance.now() - start;
  console.log(`${label}: ${ms.toFixed(2)}ms (${iterations} iter, ${(ms / iterations).toFixed(3)}ms/op)`);
  return ms;
}

const enrichedMoves: MoveRecord[] = MOCK_MOVES.map((m) => enrichMockMove(m as MoveRecord));
const inventoryStore = buildDefaultInventoryStore();

console.log(`Moves count: ${enrichedMoves.length}`);
console.log(`Enriched JSON size: ${(JSON.stringify(enrichedMoves).length / 1024).toFixed(1)} KB`);
console.log("---");

const results: Record<string, number> = {};

invalidatePricingRateScheduleCache();
results.rateScheduleUncached = bench("loadPricingRateSchedule (cold)", 100, () => {
  invalidatePricingRateScheduleCache();
  loadPricingRateSchedule();
});

results.rateScheduleCached = bench("loadPricingRateSchedule (cached)", 2000, () => {
  loadPricingRateSchedule();
});

results.ensureSnapshots = bench("ensureMovesHaveRateSnapshots", 100, () => {
  ensureMovesHaveRateSnapshots(enrichedMoves);
});

results.ensureSnapshotsIdempotent = bench("ensureMovesHaveRateSnapshots (idempotent)", 200, () => {
  const once = ensureMovesHaveRateSnapshots(enrichedMoves);
  ensureMovesHaveRateSnapshots(once);
});

results.fingerprint = bench("movesSessionFingerprint", 5000, () => {
  movesSessionFingerprint(enrichedMoves);
});

results.movesSerialize = bench("JSON.stringify(all moves)", 100, () => {
  JSON.stringify(enrichedMoves);
});

results.mergeStock = bench("mergeStockLines", 2000, () => {
  mergeStockLines(DEFAULT_EQUIPMENT_SUPPLY_CATALOG, inventoryStore);
});

// Simulate debounced persist path
let lastFp = "";
results.persistSkip = bench("persist skip (fingerprint only)", 5000, () => {
  const fp = movesSessionFingerprint(enrichedMoves);
  if (fp !== lastFp) lastFp = fp;
});

console.log("---");
const total = Object.values(results).reduce((a, b) => a + b, 0);
console.log(`Total bench time: ${total.toFixed(2)}ms`);
