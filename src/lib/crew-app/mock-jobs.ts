import { addDays, parseDateKey, toDateKey } from "@/lib/calendar/date-utils";
import type { CrewAppJob, CrewAppRole } from "./types";

/** Fixed “today” for demo jobs so SSR and client render the same schedule. */
export const CREW_DEMO_TODAY_KEY = "2026-06-03";

function demoToday(): Date {
  return parseDateKey(CREW_DEMO_TODAY_KEY);
}

function publishedIso(daysFromToday: number): string {
  const d = demoToday();
  d.setDate(d.getDate() + daysFromToday - 1);
  return d.toISOString();
}

function job(
  id: string,
  daysFromToday: number,
  partial: Omit<CrewAppJob, "id" | "dateKey" | "publishedAt"> & { publishedAt?: string },
): CrewAppJob {
  const dateKey = toDateKey(addDays(demoToday(), daysFromToday));
  return {
    id,
    dateKey,
    publishedAt: partial.publishedAt ?? publishedIso(daysFromToday),
    ...partial,
  };
}

const SHOP_MATERIALS_FLAT = [
  { id: "sm", label: "Small boxes", qty: 12, unit: "ea", unitPrice: 3.5 },
  { id: "md", label: "Medium boxes", qty: 8, unit: "ea", unitPrice: 4.25 },
  { id: "lg", label: "Large boxes", qty: 4, unit: "ea", unitPrice: 5.5 },
  { id: "wp", label: "Packing paper", qty: 2, unit: "rolls", unitPrice: 18 },
  { id: "wb", label: "Wardrobe boxes", qty: 3, unit: "ea", unitPrice: 22 },
  { id: "tv", label: "TV boxes", qty: 1, unit: "ea", unitPrice: 35 },
  { id: "bl", label: "Moving blankets", qty: 24, unit: "ea", unitPrice: 0 },
];

const SHOP_MATERIALS_HOURLY = [
  { id: "sm", label: "Small boxes", qty: 6, unit: "ea", unitPrice: 3.5 },
  { id: "md", label: "Medium boxes", qty: 4, unit: "ea", unitPrice: 4.25 },
  { id: "bl", label: "Moving blankets", qty: 18, unit: "ea", unitPrice: 0 },
  { id: "sh", label: "Shrink wrap", qty: 1, unit: "roll", unitPrice: 28 },
];

/** Demo schedule — flat-rate and hourly jobs for skipper workflow preview. */
export function mockCrewAppJobs(): CrewAppJob[] {
  return [
    job("crew-job-flat", 0, {
      moveId: "crew-job-flat",
      customerName: "Miller family",
      dayLabel: "Day 1 — Load",
      moveRef: "JM-1042",
      quoteType: "flat",
      moveType: "long_distance",
      quoteAmount: 2450,
      arrivalWindow: "8:00 AM",
      departureWindow: "7:15 AM",
      durationLabel: "~8 hr",
      origin: "1842 Lakeview Dr, Lakewood, OH 44107",
      destination: "8921 Clifton Blvd, Cleveland, OH 44111",
      services: ["Loading", "Moving", "Unloading"],
      trucks: ["Box 26 #2"],
      crew: [
        { role: "skipper", name: "Alex Rivera" },
        { role: "driver", name: "Jordan Lee" },
        { role: "mover", name: "Chris Morgan" },
        { role: "mover", name: "Sam Patel" },
      ],
      myRole: "skipper",
      shopMaterials: SHOP_MATERIALS_FLAT,
      boxCount: 24,
      contentsSummary: "3BR home — living, dining, 2 beds, basement storage",
      liabilityCoverage: "Gold — up to $25,000",
      officeFees: [
        { id: "dump", label: "Dump fee (office)", amount: 85, appliesTo: "both" },
      ],
      paymentCardOnFile: true,
      dispatchNotes: "Gate code 4421. Park on street — no driveway for 26ft.",
      accessNotes: "2-story · stairs to bedroom · narrow hall at top",
      customerPhone: "(216) 555-0142",
    }),
    job("crew-job-hourly", 0, {
      moveId: "crew-job-hourly",
      customerName: "Ellis townhouse",
      dayLabel: "Local hourly",
      moveRef: "JM-1088",
      quoteType: "hourly",
      moveType: "local",
      quoteAmount: 185,
      arrivalWindow: "11:00 AM",
      departureWindow: "10:30 AM",
      durationLabel: "~5 hr est.",
      origin: "410 Euclid Ave, Cleveland, OH 44114",
      destination: "2200 Superior Ave, Cleveland, OH 44114",
      services: ["Loading", "Moving"],
      trucks: ["Box 26 #1"],
      crew: [
        { role: "skipper", name: "Alex Rivera" },
        { role: "driver", name: "Jordan Lee" },
        { role: "mover", name: "Sam Patel" },
      ],
      myRole: "skipper",
      shopMaterials: SHOP_MATERIALS_HOURLY,
      boxCount: 10,
      contentsSummary: "2BR apartment — living, bedroom, kitchen",
      liabilityCoverage: "Silver — up to $10,000",
      officeFees: [
        { id: "crate", label: "Crating fee (office)", amount: 175, appliesTo: "hourly" },
        { id: "misc", label: "Misc supplies (office)", amount: 42, appliesTo: "both" },
      ],
      paymentCardOnFile: false,
      dispatchNotes: "Street parking only — cones in truck. Customer has elevator.",
      accessNotes: "4th floor · elevator · long carry to truck",
      customerPhone: "(216) 555-0188",
    }),
    job("crew-job-past-wed", -2, {
      moveId: "crew-job-past-wed",
      customerName: "Baker apartment",
      dayLabel: "Local move",
      moveRef: "JM-1031",
      quoteType: "hourly",
      moveType: "local",
      quoteAmount: 175,
      arrivalWindow: "8:00 AM",
      durationLabel: "~6 hr",
      origin: "1200 W 6th St, Cleveland, OH 44113",
      destination: "4500 Detroit Ave, Cleveland, OH 44113",
      services: ["Loading", "Moving"],
      trucks: ["Box 26 #1"],
      crew: [
        { role: "skipper", name: "Alex Rivera" },
        { role: "mover", name: "Chris Morgan" },
      ],
      myRole: "skipper",
      shopMaterials: SHOP_MATERIALS_HOURLY,
      boxCount: 8,
      contentsSummary: "2BR apartment",
      liabilityCoverage: "Silver — up to $10,000",
      officeFees: [],
      paymentCardOnFile: true,
      dispatchNotes: "Completed — see field packet.",
      accessNotes: "Elevator building",
      customerPhone: "(216) 555-0131",
    }),
    job("crew-job-past-prev", -5, {
      customerName: "Hoffman storage out",
      dayLabel: "Day 1",
      moveRef: "JM-1024",
      quoteType: "flat",
      moveType: "local",
      quoteAmount: 1650,
      arrivalWindow: "9:30 AM",
      durationLabel: "~5 hr",
      origin: "9900 Detroit Ave, Cleveland, OH 44102",
      destination: "2100 Superior Ave, Cleveland, OH 44114",
      services: ["Loading", "Moving"],
      trucks: ["Box 26 #2"],
      crew: [
        { role: "skipper", name: "Alex Rivera" },
        { role: "driver", name: "Jordan Lee" },
        { role: "mover", name: "Sam Patel" },
      ],
      myRole: "skipper",
      shopMaterials: SHOP_MATERIALS_FLAT,
      boxCount: 14,
      contentsSummary: "Storage unit clean-out",
      liabilityCoverage: "Gold — up to $25,000",
      officeFees: [],
      paymentCardOnFile: true,
      dispatchNotes: "Prior week job — payroll reference.",
      accessNotes: "Ground floor roll-up door",
      customerPhone: "(216) 555-0124",
    }),
    job("crew-job-upcoming", 3, {
      customerName: "Nguyen residence",
      dayLabel: "Day 1 — Pack & load",
      moveRef: "JM-1094",
      quoteType: "flat",
      moveType: "local",
      quoteAmount: 1895,
      arrivalWindow: "9:00 AM",
      departureWindow: "8:30 AM",
      durationLabel: "~7 hr",
      origin: "5521 Detroit Ave, Cleveland, OH 44102",
      destination: "8800 Lake Ave, Cleveland, OH 44102",
      services: ["Packing", "Loading", "Moving"],
      trucks: ["Box 26 #3"],
      crew: [
        { role: "skipper", name: "Alex Rivera" },
        { role: "driver", name: "Devon Walsh" },
        { role: "mover", name: "Chris Morgan" },
        { role: "mover", name: "Sam Patel" },
      ],
      myRole: "skipper",
      shopMaterials: SHOP_MATERIALS_FLAT,
      boxCount: 18,
      contentsSummary: "3BR colonial — main floor + attic storage",
      liabilityCoverage: "Gold — up to $25,000",
      officeFees: [],
      paymentCardOnFile: true,
      dispatchNotes: "Published schedule — confirm truck assignment Monday.",
      accessNotes: "Split-level · stairs to attic",
      customerPhone: "(216) 555-0194",
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
    .sort(
      (a, b) =>
        a.dateKey.localeCompare(b.dateKey) ||
        (a.arrivalWindow ?? "").localeCompare(b.arrivalWindow ?? ""),
    );
}

export function getCrewAppJob(id: string): CrewAppJob | undefined {
  return mockCrewAppJobs().find((j) => j.id === id);
}

export function formatCrewJobPrice(job: CrewAppJob): string {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(job.quoteAmount);
  return job.quoteType === "hourly" ? `${formatted}/hr` : formatted;
}

/** True if another job is scheduled later the same day (by arrival window). */
export function hasLaterJobSameDay(jobs: CrewAppJob[], current: CrewAppJob): boolean {
  const currentWindow = current.arrivalWindow ?? "";
  return jobs.some(
    (j) =>
      j.id !== current.id &&
      j.dateKey === current.dateKey &&
      (j.arrivalWindow ?? "") > currentWindow,
  );
}

/** Demo helpers available from other crews on the same day. */
export const MOCK_OTHER_CREW_HELPERS = [
  { name: "Taylor Brooks", role: "mover" as const, crewLabel: "Crew B" },
  { name: "Morgan Chen", role: "driver" as const, crewLabel: "Crew C" },
  { name: "Riley Santos", role: "mover" as const, crewLabel: "Crew B" },
];

export const WRAP_UP_FEE_PRESETS = [
  { label: "Dump fee", amount: 85 },
  { label: "Crating fee", amount: 175 },
  { label: "Misc supplies", amount: 42 },
] as const;
