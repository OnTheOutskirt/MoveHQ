import { toDateKey } from "@/lib/calendar/date-utils";
import type { CrewRecordsStore } from "./crew-records-types";

function daysFromToday(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return toDateKey(d);
}

export function defaultCrewRecordsStore(): CrewRecordsStore {
  const now = new Date().toISOString();

  return {
    issues: [
      {
        id: "issue-1",
        crewId: "crew-sam",
        type: "tardy",
        date: daysFromToday(-2),
        title: "Late to yard — 25 min",
        jobRef: "JM-1042",
        status: "open",
        reportedBy: "Dispatch",
        createdAt: now,
      },
      {
        id: "issue-2",
        crewId: "crew-devon",
        type: "driving",
        date: daysFromToday(-5),
        title: "Hard braking event — dash cam",
        description: "Flagged by telematics on I-94 segment.",
        status: "under_review",
        reportedBy: "Fleet safety",
        createdAt: now,
      },
      {
        id: "issue-3",
        crewId: "crew-chris",
        type: "on_job",
        date: daysFromToday(-8),
        title: "Customer complaint — packing care",
        jobRef: "JM-1038",
        moveId: "move-1",
        status: "resolved",
        reportedBy: "Customer success",
        createdAt: now,
        resolvedAt: daysFromToday(-3),
        notes: "Coached on wrap protocol; no claim filed.",
      },
      {
        id: "issue-4",
        crewId: "crew-marcus",
        type: "callback",
        date: daysFromToday(-12),
        title: "Callback — missed reassembly item",
        jobRef: "JM-1029",
        status: "resolved",
        reportedBy: "Operations",
        createdAt: now,
        resolvedAt: daysFromToday(-10),
      },
      {
        id: "issue-5",
        crewId: "crew-tyler",
        type: "claim",
        date: daysFromToday(-18),
        title: "Claim — scratched hardwood",
        description: "Customer filed damage claim; photos on file.",
        jobRef: "JM-1015",
        status: "under_review",
        reportedBy: "Claims",
        createdAt: now,
      },
      {
        id: "issue-6",
        crewId: "crew-pat",
        type: "tardy",
        date: daysFromToday(-1),
        title: "No-show call — arrived 40 min late",
        status: "open",
        reportedBy: "Skipper",
        createdAt: now,
      },
    ],
    skipperRatings: [
      {
        id: "rate-1",
        skipperId: "crew-marcus",
        date: daysFromToday(-3),
        jobRef: "JM-1042",
        rating: 5,
        communication: 5,
        leadership: 5,
        care: 4,
        efficiency: 5,
        ratedBy: "Dispatch",
        createdAt: now,
      },
      {
        id: "rate-2",
        skipperId: "crew-tyler",
        date: daysFromToday(-6),
        jobRef: "JM-1035",
        rating: 4,
        communication: 4,
        leadership: 4,
        care: 5,
        efficiency: 4,
        notes: "Strong crew management; paperwork slow at close.",
        ratedBy: "Operations",
        createdAt: now,
      },
      {
        id: "rate-3",
        skipperId: "crew-james",
        date: daysFromToday(-10),
        jobRef: "JM-1028",
        rating: 3,
        communication: 3,
        leadership: 3,
        care: 4,
        efficiency: 3,
        notes: "Customer follow-up needed on arrival comms.",
        ratedBy: "Dispatch",
        createdAt: now,
      },
      {
        id: "rate-4",
        skipperId: "crew-marcus",
        date: daysFromToday(-14),
        jobRef: "JM-1020",
        rating: 5,
        ratedBy: "Dispatch",
        createdAt: now,
      },
    ],
  };
}
