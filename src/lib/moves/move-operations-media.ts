import {
  FIELD_CAPTURE_CATEGORIES,
  type FieldCaptureCategory,
  type JobFieldMediaEntry,
} from "@/lib/crew-app/field-capture-types";
import { readJobFieldState } from "@/lib/crew-app/job-field-storage";
import type { MoveRecord } from "./types";

const DEMO_OPERATIONS_MEDIA: Record<string, JobFieldMediaEntry[]> = {
  "mv-booked": [
    {
      id: "ops-demo-1",
      category: "inventory",
      capturedAt: "2026-05-20T13:42:00Z",
      capturedByCrewId: "crew-a-lead",
      capturedByName: "Jordan Lee",
      moveRef: "MV-BOOKED",
      moveId: "mv-booked",
      note: "Piano blanket wrap before load",
      syncStatus: "synced",
    },
    {
      id: "ops-demo-2",
      category: "claim_damage",
      capturedAt: "2026-05-20T15:08:00Z",
      capturedByCrewId: "crew-a-2",
      capturedByName: "Sam Ortiz",
      moveRef: "MV-BOOKED",
      moveId: "mv-booked",
      assignedCrewId: "crew-a-2",
      assignedCrewName: "Sam Ortiz",
      note: "Corner chip on dining table — customer notified",
      syncStatus: "synced",
    },
    {
      id: "ops-demo-3",
      category: "truck_condition",
      capturedAt: "2026-05-20T17:55:00Z",
      capturedByCrewId: "crew-a-lead",
      capturedByName: "Jordan Lee",
      moveRef: "MV-BOOKED",
      moveId: "mv-booked",
      assignedCrewId: "crew-a-lead",
      assignedCrewName: "Jordan Lee",
      violationId: "dirty_truck",
      truckLabel: "Truck #12",
      syncStatus: "synced",
    },
    {
      id: "ops-demo-4",
      category: "general",
      capturedAt: "2026-05-19T16:20:00Z",
      capturedByCrewId: "crew-a-3",
      capturedByName: "Alex Kim",
      moveRef: "MV-BOOKED",
      moveId: "mv-booked",
      note: "Day 1 pack-out — garage cleared",
      syncStatus: "synced",
    },
  ],
};

function matchesMove(entry: JobFieldMediaEntry, move: MoveRecord): boolean {
  if (entry.moveId && entry.moveId === move.id) return true;
  return entry.moveRef.toUpperCase() === move.reference.toUpperCase();
}

/** Crew field captures synced to this move — from job-day storage plus demo rows. */
export function getMoveOperationsFieldMedia(move: MoveRecord): JobFieldMediaEntry[] {
  const fromJobDays = move.jobDays.flatMap((day) =>
    readJobFieldState(day.id).jobMedia.filter((entry) => matchesMove(entry, move)),
  );
  const demo = DEMO_OPERATIONS_MEDIA[move.id] ?? [];

  const byId = new Map<string, JobFieldMediaEntry>();
  for (const entry of [...demo, ...fromJobDays]) {
    byId.set(entry.id, entry);
  }

  return [...byId.values()].sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
}

export function countOperationsFieldMediaByCategory(
  media: JobFieldMediaEntry[],
): Record<"all" | FieldCaptureCategory, number> {
  const counts = Object.fromEntries(
    FIELD_CAPTURE_CATEGORIES.map((category) => [category, 0]),
  ) as Record<FieldCaptureCategory, number>;

  for (const entry of media) {
    counts[entry.category] += 1;
  }

  return {
    all: media.length,
    ...counts,
  };
}
