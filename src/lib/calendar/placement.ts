import { moveShipperName } from "@/lib/moves/get-move-contact";
import { createDefaultJobDay } from "@/lib/moves/job-day-form";
import type { MoveJobDay, MoveRecord } from "@/lib/moves/types";
import type {
  CalendarDayData,
  HoldEntry,
  WaitlistEntry,
} from "./types";
import type {
  CalendarPlacement,
  CalendarPlacementKind,
  CalendarPlacementStore,
  HoldDayDraft,
} from "./placement-types";
import { generatePlacementId } from "./placement-storage";

const MIN_MOVERS = 1;
const MIN_TRUCKS = 1;

export function defaultMoversForMove(move: MoveRecord): number {
  return move.moveType === "Commercial" ? 6 : 4;
}

export function capacityForJobDay(move: MoveRecord, day: MoveJobDay): { movers: number; trucks: number } {
  return {
    movers: Math.max(MIN_MOVERS, day.crewSize ?? defaultMoversForMove(move)),
    trucks: Math.max(MIN_TRUCKS, day.truckCount ?? 1),
  };
}

export const MAX_WAITLIST_DATES = 10;

/** ISO date keys from scheduled job days only. */
export function jobDayDatesForMove(move: MoveRecord): string[] {
  return [...new Set(move.jobDays.map((d) => d.date).filter(Boolean))].sort();
}

export function canPlaceMoveOnHold(move: MoveRecord): boolean {
  return jobDayDatesForMove(move).length > 0;
}

/** Job days to reserve when placing a move on hold (scheduled job days only). */
export function buildHoldDayDrafts(move: MoveRecord): HoldDayDraft[] {
  return [...move.jobDays]
    .filter((day) => Boolean(day.date))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((day) => {
      const { movers, trucks } = capacityForJobDay(move, day);
      return {
        jobDayId: day.id,
        date: day.date,
        label: day.label,
        movers,
        trucks,
      };
    });
}

/** Default waitlist rows when opening the move-detail picker. */
export function defaultWaitlistPickerDates(
  move: MoveRecord,
  existingWaitlistDates: string[] = [],
): string[] {
  if (existingWaitlistDates.length > 0) return existingWaitlistDates;
  const jobDays = jobDayDatesForMove(move);
  if (jobDays.length > 0) return jobDays;
  if (move.preferredDate) return [move.preferredDate];
  return [""];
}

/** Dates to use when waitlisting all job days (or move date fallback). */
export function waitlistDatesForMove(move: MoveRecord): string[] {
  const jobDays = jobDayDatesForMove(move);
  if (jobDays.length > 0) return jobDays;
  if (move.preferredDate) return [move.preferredDate];
  return [];
}

export function defaultWaitlistCapacity(
  move: MoveRecord,
  date: string,
): { movers: number; trucks: number } {
  const jobDay = move.jobDays.find((d) => d.date === date);
  if (jobDay) return capacityForJobDay(move, jobDay);
  if (move.jobDays.length > 0) {
    return capacityForJobDay(move, move.jobDays[0]!);
  }
  const fallback = createDefaultJobDay(move);
  return capacityForJobDay(move, fallback);
}

export function placementKey(moveId: string, date: string, kind: CalendarPlacementKind): string {
  return `${moveId}:${date}:${kind}`;
}

export function hasPlacement(
  store: CalendarPlacementStore,
  moveId: string,
  date: string,
  kind: CalendarPlacementKind,
): boolean {
  const key = placementKey(moveId, date, kind);
  return store.placements.some((p) => placementKey(p.moveId, p.date, p.kind) === key);
}

export function getPlacementsForMove(
  store: CalendarPlacementStore,
  moveId: string,
): CalendarPlacement[] {
  return store.placements
    .filter((p) => p.moveId === moveId)
    .sort((a, b) => a.date.localeCompare(b.date) || a.kind.localeCompare(b.kind));
}

export function getPlacementsForDate(
  store: CalendarPlacementStore,
  date: string,
): CalendarPlacement[] {
  return store.placements.filter((p) => p.date === date);
}

function placementToEntry(placement: CalendarPlacement): HoldEntry | WaitlistEntry {
  return {
    id: placement.id,
    customerName: placement.customerName,
    movers: placement.movers,
    trucks: placement.trucks,
    moveId: placement.moveId,
  };
}

function dedupeByMoveId<T extends { moveId?: string; id: string }>(entries: T[]): T[] {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    const key = entry.moveId ?? entry.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sumMovers(entries: Array<{ movers: number }>): number {
  return entries.reduce((sum, e) => sum + e.movers, 0);
}

function sumTrucks(entries: Array<{ trucks: number }>): number {
  return entries.reduce((sum, e) => sum + e.trucks, 0);
}

/** Merge user placements into mock calendar days and refresh hold/waitlist aggregates. */
export function mergePlacementsIntoDays(
  days: Record<string, CalendarDayData>,
  placements: CalendarPlacement[],
): Record<string, CalendarDayData> {
  if (placements.length === 0) return days;

  const byDate = new Map<string, { holds: HoldEntry[]; waitlist: WaitlistEntry[] }>();
  for (const placement of placements) {
    const bucket = byDate.get(placement.date) ?? { holds: [], waitlist: [] };
    const entry = placementToEntry(placement);
    if (placement.kind === "hold") bucket.holds.push(entry);
    else bucket.waitlist.push(entry);
    byDate.set(placement.date, bucket);
  }

  const next: Record<string, CalendarDayData> = { ...days };
  for (const [date, bucket] of byDate) {
    const existing = next[date];
    if (!existing) continue;

    const holds = dedupeByMoveId([...bucket.holds, ...existing.holds]);
    const waitlist = dedupeByMoveId([...bucket.waitlist, ...existing.waitlist]);

    next[date] = {
      ...existing,
      holds,
      waitlist,
      waitlistCount: waitlist.length,
      moversOnHold: sumMovers(holds),
      trucksOnHold: sumTrucks(holds),
    };
  }

  return next;
}

export function createHoldPlacements(
  move: MoveRecord,
  drafts: HoldDayDraft[],
  createdBy?: string,
): CalendarPlacement[] {
  const customerName = moveShipperName(move);
  const now = new Date().toISOString();

  return drafts.map((draft) => ({
    id: generatePlacementId(),
    moveId: move.id,
    customerName,
    date: draft.date,
    kind: "hold" as const,
    movers: Math.max(MIN_MOVERS, draft.movers),
    trucks: Math.max(MIN_TRUCKS, draft.trucks),
    createdAt: now,
    createdBy,
  }));
}

export function createWaitlistPlacement(
  move: MoveRecord,
  date: string,
  movers: number,
  trucks: number,
  createdBy?: string,
): CalendarPlacement {
  return {
    id: generatePlacementId(),
    moveId: move.id,
    customerName: moveShipperName(move),
    date,
    kind: "waitlist",
    movers: Math.max(MIN_MOVERS, movers),
    trucks: Math.max(MIN_TRUCKS, trucks),
    createdAt: new Date().toISOString(),
    createdBy,
  };
}

export function addHoldPlacements(
  store: CalendarPlacementStore,
  move: MoveRecord,
  drafts: HoldDayDraft[],
  createdBy?: string,
): CalendarPlacementStore {
  const existingKeys = new Set(
    store.placements.map((p) => placementKey(p.moveId, p.date, p.kind)),
  );
  const nextPlacements = createHoldPlacements(move, drafts, createdBy).filter(
    (p) => !existingKeys.has(placementKey(p.moveId, p.date, p.kind)),
  );
  if (nextPlacements.length === 0) return store;
  return { ...store, placements: [...store.placements, ...nextPlacements] };
}

export function addWaitlistPlacement(
  store: CalendarPlacementStore,
  move: MoveRecord,
  date: string,
  movers: number,
  trucks: number,
  createdBy?: string,
): CalendarPlacementStore {
  if (hasPlacement(store, move.id, date, "waitlist")) return store;
  const placement = createWaitlistPlacement(move, date, movers, trucks, createdBy);
  return { ...store, placements: [...store.placements, placement] };
}

export function setMoveWaitlistPlacements(
  store: CalendarPlacementStore,
  move: MoveRecord,
  dates: string[],
  createdBy?: string,
): CalendarPlacementStore {
  const unique = [...new Set(dates.map((d) => d.trim()).filter(Boolean))].sort();
  let next = removeMovePlacements(store, move.id, "waitlist");
  for (const date of unique) {
    const caps = defaultWaitlistCapacity(move, date);
    next = addWaitlistPlacement(next, move, date, caps.movers, caps.trucks, createdBy);
  }
  return next;
}

export function validateWaitlistDates(dates: string[]): string | null {
  const valid = dates.map((d) => d.trim()).filter(Boolean);
  if (valid.length === 0) return "Choose at least one waitlist date.";
  if (valid.length > MAX_WAITLIST_DATES) {
    return `You can waitlist up to ${MAX_WAITLIST_DATES} dates.`;
  }
  if (new Set(valid).size !== valid.length) return "Remove duplicate dates.";
  return null;
}

export function waitlistDatesFromPlacements(
  placements: CalendarPlacement[],
  moveId: string,
): string[] {
  return placements
    .filter((p) => p.moveId === moveId && p.kind === "waitlist")
    .map((p) => p.date)
    .sort();
}

export function removePlacement(
  store: CalendarPlacementStore,
  placementId: string,
): CalendarPlacementStore {
  return {
    ...store,
    placements: store.placements.filter((p) => p.id !== placementId),
  };
}

export function removeMovePlacements(
  store: CalendarPlacementStore,
  moveId: string,
  kind?: CalendarPlacementKind,
): CalendarPlacementStore {
  return {
    ...store,
    placements: store.placements.filter((p) => {
      if (p.moveId !== moveId) return true;
      if (!kind) return false;
      return p.kind !== kind;
    }),
  };
}

export function validateHoldDrafts(drafts: HoldDayDraft[]): string | null {
  if (drafts.length === 0) return "Add at least one job day before placing on hold.";
  for (const draft of drafts) {
    if (!draft.date) return "Each job day needs a date.";
    if (draft.movers < MIN_MOVERS) return `Each day needs at least ${MIN_MOVERS} mover.`;
    if (draft.trucks < MIN_TRUCKS) return `Each day needs at least ${MIN_TRUCKS} truck.`;
  }
  return null;
}

export function movePlacementDateSets(
  placements: CalendarPlacement[],
  moveId: string,
): { holdDates: Set<string>; waitlistDates: Set<string> } {
  const holdDates = new Set<string>();
  const waitlistDates = new Set<string>();
  for (const placement of placements) {
    if (placement.moveId !== moveId) continue;
    if (placement.kind === "hold") holdDates.add(placement.date);
    else waitlistDates.add(placement.date);
  }
  return { holdDates, waitlistDates };
}
