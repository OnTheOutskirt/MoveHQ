/** Walkthrough slot picker — uses per-rep availability settings; Outlook busy overlay at go-live. */

import {
  generateSlotsForDate,
  readWalkthroughAvailability,
} from "./walkthrough-availability-settings";
import type { WalkthroughMode } from "./types";

export type WalkthroughDayOption = {
  date: Date;
  key: string;
  label: string;
};

export function buildWalkthroughDayOptions(
  anchor = new Date(),
  count = 8,
): WalkthroughDayOption[] {
  const days: WalkthroughDayOption[] = [];
  for (let i = 0; i < 21 && days.length < count; i++) {
    const d = new Date(anchor);
    d.setDate(anchor.getDate() + i);
    days.push({
      date: d,
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    });
  }
  return days;
}

/** Demo busy overlay — replaced by Outlook free/busy when calendar sync is live. */
export function isWalkthroughSlotBusy(
  assignee: string,
  dateKey: string,
  slot: string,
): boolean {
  const seed =
    assignee.split("").reduce((n, c) => n + c.charCodeAt(0), 0) +
    dateKey.charCodeAt(8) +
    slot.charCodeAt(0);
  return seed % 7 === 0;
}

export function availableSlotsForDay(
  assignee: string,
  dateKey: string,
  mode: WalkthroughMode = "in_person",
): string[] {
  const settings = readWalkthroughAvailability(assignee);
  const slots = generateSlotsForDate(settings, mode, dateKey);
  return slots.filter((slot) => !isWalkthroughSlotBusy(assignee, dateKey, slot));
}
