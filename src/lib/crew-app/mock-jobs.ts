import { addDays, toDateKey } from "@/lib/calendar/date-utils";
import type { CrewAppJob, CrewAppRole } from "./types";

function publishedIso(daysFromToday: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday - 1);
  return d.toISOString();
}

function job(
  id: string,
  daysFromToday: number,
  partial: Omit<CrewAppJob, "id" | "dateKey" | "publishedAt"> & { publishedAt?: string },
): CrewAppJob {
  const today = new Date();
  const dateKey = toDateKey(addDays(today, daysFromToday));
  return {
    id,
    dateKey,
    publishedAt: partial.publishedAt ?? publishedIso(daysFromToday),
    ...partial,
  };
}

/** Demo schedule — two today jobs for role preview (mover, driver, skipper). */
export function mockCrewAppJobs(): CrewAppJob[] {
  return [
    job("crew-job-1", 0, {
      customerName: "Miller family",
      dayLabel: "Day 1 — Load",
      moveRef: "JM-1042",
      arrivalWindow: "8:00 AM",
      departureWindow: "7:15 AM",
      durationLabel: "~8 hr",
      origin: "1842 Lakeview Dr, Lakewood, OH",
      destination: "8921 Clifton Blvd, Cleveland, OH",
      services: ["Loading", "Moving"],
      trucks: ["Box 26 #2"],
      crew: [
        { role: "skipper", name: "Alex Rivera" },
        { role: "driver", name: "Jordan Lee" },
        { role: "mover", name: "Chris Morgan" },
        { role: "mover", name: "Sam Patel" },
      ],
      myRole: "mover",
      dispatchNotes: "Gate code 4421. Park on street — no driveway for 26ft.",
      accessNotes: "2-story · stairs to bedroom",
      customerPhone: "(216) 555-0142",
    }),
    job("crew-job-2", 0, {
      customerName: "Chen apartment",
      dayLabel: "Local move",
      moveRef: "JM-1060",
      arrivalWindow: "10:30 AM",
      departureWindow: "10:00 AM",
      durationLabel: "~4 hr",
      origin: "1200 Euclid Ave, Cleveland, OH",
      destination: "3400 Detroit Ave, Cleveland, OH",
      services: ["Loading", "Moving", "Unloading"],
      trucks: ["Box 26 #1"],
      crew: [
        { role: "skipper", name: "Devon Walsh" },
        { role: "driver", name: "Jordan Lee" },
        { role: "mover", name: "Sam Patel" },
      ],
      myRole: "driver",
      dispatchNotes: "Street parking only — cones in truck.",
      accessNotes: "3rd floor · elevator available",
      customerPhone: "(216) 555-0198",
    }),
  ];
}

/** Demo build — show all jobs with the preview role from session. */
export function jobsForCrewMember(
  jobs: CrewAppJob[],
  _crewId: string,
  sessionRole: CrewAppRole,
): CrewAppJob[] {
  return jobs.map((j) => ({
    ...j,
    myRole: sessionRole,
  }));
}

export function jobsForDate(jobs: CrewAppJob[], dateKey: string): CrewAppJob[] {
  return [...jobs]
    .filter((j) => j.dateKey === dateKey)
    .sort((a, b) => (a.arrivalWindow ?? "").localeCompare(b.arrivalWindow ?? ""));
}

export function upcomingJobs(jobs: CrewAppJob[], fromDateKey: string): CrewAppJob[] {
  return [...jobs]
    .filter((j) => j.dateKey > fromDateKey)
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey) || (a.arrivalWindow ?? "").localeCompare(b.arrivalWindow ?? ""));
}

export function getCrewAppJob(id: string): CrewAppJob | undefined {
  return mockCrewAppJobs().find((j) => j.id === id);
}
