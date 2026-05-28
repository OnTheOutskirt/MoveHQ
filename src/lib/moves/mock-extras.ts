import { applyAcquisitionFields } from "./acquisition";
import { buildIntakeForMove } from "./intake-mock";
import {
  createInitialJobDayFromIntake,
  relabelJobDaysByDate,
} from "./job-day-form";
import {
  defaultLocationsForNewDay,
  syncLegacyLocationNotes,
} from "./job-day-locations";
import type {
  IntakeProgress,
  MoveJobDay,
  MoveLinkedPerson,
  MoveRecord,
  QuoteChannel,
  WebsiteIntakeMeta,
} from "./types";

type MoveCore = Omit<
  MoveRecord,
  | "jobDays"
  | "linkedPeople"
  | "intake"
  | "followUps"
  | "followUpDue"
  | "quoteChannel"
  | "intakeProgress"
  | "websiteIntake"
  | "lostQualification"
  | "lostReasonId"
  | "lostNotes"
> & {
  quoteChannel?: QuoteChannel;
  intakeProgress?: IntakeProgress;
  websiteIntake?: WebsiteIntakeMeta | null;
  lostQualification?: MoveRecord["lostQualification"];
  lostReasonId?: string | null;
  lostNotes?: string | null;
};

function customerPerson(move: MoveCore): MoveLinkedPerson {
  return {
    id: `${move.id}-customer`,
    name: move.customerName,
    role: "customer",
    phone: move.customerPhone,
    email: move.customerEmail,
    isPrimary: true,
  };
}

function finalizeJobDays(move: MoveRecord, days: MoveJobDay[]): MoveJobDay[] {
  const withLocations = days.map((day) => {
    const locations =
      day.locations && day.locations.length > 0
        ? day.locations
        : defaultLocationsForNewDay(move);
    const patched = { ...day, locations };
    return { ...patched, ...syncLegacyLocationNotes(patched) };
  });
  return relabelJobDaysByDate(withLocations);
}

const EXTRAS: Partial<
  Record<string, { linkedPeople?: MoveLinkedPerson[]; jobDays?: MoveJobDay[] }>
> = {
  "mv-quote-sent": {
    linkedPeople: [
      {
        id: "mv-quote-sent-care",
        name: "Tom Walsh",
        role: "care_of",
        relationship: "Spouse · on-site contact",
        phone: "(216) 555-0143",
      },
      {
        id: "mv-quote-sent-realtor",
        personId: "person-karen-whitfield",
        name: "Karen Whitfield",
        role: "realtor",
        organization: "Whitfield Realty",
        phone: "(216) 555-8801",
        email: "karen@whitfieldrealty.example",
      },
    ],
    jobDays: [
      {
        id: "mv-quote-sent-jd1",
        label: "Day 1",
        date: "2026-06-13",
        status: "scheduled",
        departureWindow: "7:15 AM",
        arrivalWindow: "8:00 – 10:00 AM",
        durationLabel: "~6 hrs",
        crewSize: 2,
        crewSummary: "2 packers",
        truckCount: 1,
        truckSummary: "Box truck #8",
        services: ["packing"],
        hoursEstimated: 6,
        accessNotes: "COI required · elevator reservation",
      },
      {
        id: "mv-quote-sent-jd2",
        label: "Day 2",
        date: "2026-06-14",
        status: "scheduled",
        arrivalWindow: "7:00 – 9:00 AM",
        durationLabel: "~8 hrs",
        crewSize: 4,
        crewSummary: "4 movers",
        truckCount: 2,
        truckSummary: "26 ft + shuttle",
        services: ["loading", "moving", "unloading"],
        hoursEstimated: 8,
      },
    ],
  },
  "mv-needs-contract": {
    jobDays: [
      {
        id: "mv-nc-jd1",
        label: "Day 1",
        date: "2026-06-01",
        status: "scheduled",
        arrivalWindow: "8:00 – 10:00 AM",
        crewSize: 4,
        crewSummary: "4 movers",
        truckCount: 1,
        truckSummary: "26 ft box",
        hoursEstimated: 7,
        services: ["packing", "loading"],
      },
      {
        id: "mv-nc-jd2",
        label: "Day 2",
        date: "2026-06-03",
        status: "scheduled",
        crewSize: 4,
        crewSummary: "4 movers · linehaul crew",
        truckCount: 1,
        truckSummary: "53 ft trailer",
        hoursEstimated: 10,
        services: ["moving", "unloading"],
      },
    ],
  },
  "mv-booked": {
    jobDays: [
      {
        id: "mv-booked-jd1",
        label: "Day 1",
        date: "2026-05-19",
        status: "completed",
        arrivalWindow: "8:00 – 10:00 AM",
        crewSize: 2,
        crewSummary: "2 movers · Crew A",
        truckCount: 1,
        truckSummary: "Box truck #8",
        services: ["packing"],
        hoursEstimated: 5,
        hoursActual: 5.5,
      },
      {
        id: "mv-booked-jd2",
        label: "Day 2",
        date: "2026-05-20",
        status: "in_progress",
        departureWindow: "6:30 AM",
        arrivalWindow: "7:00 – 9:00 AM",
        durationLabel: "~8 hrs",
        crewSize: 4,
        crewSummary: "4 movers · Crew A",
        truckCount: 2,
        truckSummary: "Truck #12 + shuttle",
        services: ["loading", "moving", "unloading"],
        hoursEstimated: 8,
        dispatchNotes: "On site 7:12 AM",
        accessNotes: "Long carry at destination",
      },
    ],
  },
  "mv-complete": {
    jobDays: [
      {
        id: "mv-complete-jd1",
        label: "Day 1",
        date: "2026-05-18",
        status: "completed",
        crewSize: 3,
        crewSummary: "3 movers",
        truckCount: 1,
        truckSummary: "Truck #6",
        services: ["moving", "unloading"],
        hoursEstimated: 4.5,
        hoursActual: 5,
      },
    ],
  },
  "mv-complete-2day": {
    linkedPeople: [
      {
        id: "mv-complete-2day-realtor",
        personId: "person-karen-whitfield",
        name: "Karen Whitfield",
        role: "realtor",
        organization: "Whitfield Realty",
        phone: "(216) 555-8801",
        email: "karen@whitfieldrealty.example",
      },
    ],
    jobDays: [
      {
        id: "mv-complete-2day-jd1",
        label: "Day 1",
        date: "2026-05-10",
        status: "completed",
        arrivalWindow: "8:00 – 10:00 AM",
        durationLabel: "~7 hrs",
        crewSize: 4,
        crewSummary: "4 movers · Crew B",
        truckCount: 1,
        truckSummary: "26 ft box · Truck #3",
        services: ["packing", "loading"],
        hoursEstimated: 7,
        hoursActual: 7.5,
        accessNotes: "2-story origin · 80 ft walk to truck",
        dispatchNotes: "Finished 7:42 PM — 0.5 hr over on fragile wrap",
      },
      {
        id: "mv-complete-2day-jd2",
        label: "Day 2",
        date: "2026-05-11",
        status: "completed",
        arrivalWindow: "7:00 – 9:00 AM",
        durationLabel: "~8 hrs",
        crewSize: 4,
        crewSummary: "4 movers · Crew B",
        truckCount: 1,
        truckSummary: "26 ft box · Truck #3",
        services: ["moving", "unloading", "unpacking"],
        hoursEstimated: 8,
        hoursActual: 8.25,
        accessNotes: "Apartment destination · elevator reserved 8–11 AM",
        dispatchNotes: "BOL signed on site",
      },
    ],
  },
};

export function enrichMockMove(move: MoveCore): MoveRecord {
  const extra = EXTRAS[move.id];
  const linkedPeople = [customerPerson(move), ...(extra?.linkedPeople ?? [])];
  const intake = buildIntakeForMove(move);
  const base = applyAcquisitionFields({
    ...move,
    linkedPeople,
    intake,
    jobDays: [],
    followUps: [],
    followUpDue: null,
    quoteChannel: move.quoteChannel ?? "unknown",
    intakeProgress: move.intakeProgress ?? "started",
    websiteIntake: move.websiteIntake ?? null,
    lostQualification: move.lostQualification ?? null,
    lostReasonId: move.lostReasonId ?? null,
    lostNotes: move.lostNotes ?? null,
  } as MoveRecord);

  const rawDays =
    extra && "jobDays" in extra && (extra.jobDays?.length ?? 0) > 0
      ? extra.jobDays!
      : [createInitialJobDayFromIntake(base)];

  const jobDays = finalizeJobDays(base, rawDays);

  return { ...base, jobDays };
}
