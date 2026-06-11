import { applyAcquisitionFields } from "./acquisition";
import type { MoveCore } from "./move-core";
import {
  DEFAULT_COMPANY_ID,
  DEFAULT_PRIMARY_LOCATION_ID,
} from "@/lib/workspace/constants";
import { ensureMoveWorkspaceFields } from "@/lib/workspace/move-scope";
import {
  inferSentContractFromPipeline,
  inferSentQuoteFromPipeline,
} from "./move-document-send";
import { buildIntakeForMove } from "./intake-mock";
import {
  createInitialJobDayFromIntake,
  relabelJobDaysByDate,
} from "./job-day-form";
import {
  defaultLocationsForNewDay,
  syncLegacyLocationNotes,
} from "./job-day-locations";
import {
  DISPATCH_DEMO_DATE_SENTINEL,
  isDispatchDemoMoveId,
  resolveDispatchDemoDate,
} from "@/lib/dispatch/demo-date";
import type { MoveCrewFeedback, MoveJobDay, MoveLinkedPerson, MoveRecord } from "./types";

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
  Record<
    string,
    {
      linkedPeople?: MoveLinkedPerson[];
      jobDays?: MoveJobDay[];
      crewFeedback?: MoveCrewFeedback;
    }
  >
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
        dayFraction: "short",
        dayPeriod: "afternoon",
        departureWindow: "7:15 AM",
        arrivalWindow: "11:00 AM – 4:00 PM (crew calls ≥30 min ahead)",
        durationLabel: "Short (½ day)",
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
    crewFeedback: {
      rating: 5,
      comment: "Crew was careful, fast, and super friendly. Would recommend to anyone!",
      submittedAt: "2026-05-18T19:15:00Z",
      googleReviewOffered: true,
    },
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
        actualDriveHours: 1.25,
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
        actualDriveHours: 0.75,
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
  "mv-ds-long": {
    jobDays: [
      {
        id: "mv-ds-long-jd1",
        label: "Day 1",
        date: DISPATCH_DEMO_DATE_SENTINEL,
        status: "scheduled",
        dayFraction: "long",
        dayPeriod: "morning",
        arrivalWindow: "8:00 – 8:30 AM",
        durationLabel: "Long (full day)",
        crewSize: 4,
        truckCount: 2,
        services: ["loading", "moving", "unloading"],
        hoursEstimated: 8,
      },
    ],
  },
  "mv-ds-medium": {
    jobDays: [
      {
        id: "mv-ds-medium-jd1",
        label: "Day 1",
        date: DISPATCH_DEMO_DATE_SENTINEL,
        status: "scheduled",
        dayFraction: "medium",
        dayPeriod: "morning",
        arrivalWindow: "7:45 – 8:15 AM",
        durationLabel: "Medium (⅔ day)",
        crewSize: 4,
        truckCount: 1,
        services: ["loading", "moving"],
        hoursEstimated: 5,
      },
    ],
  },
  "mv-ds-short-am": {
    jobDays: [
      {
        id: "mv-ds-short-am-jd1",
        label: "Day 1",
        date: DISPATCH_DEMO_DATE_SENTINEL,
        status: "scheduled",
        dayFraction: "short",
        dayPeriod: "morning",
        arrivalWindow: "7:45 – 8:15 AM",
        durationLabel: "Short (½ day)",
        crewSize: 3,
        truckCount: 1,
        services: ["packing", "loading"],
        hoursEstimated: 4,
      },
    ],
  },
  "mv-ds-short-pm": {
    jobDays: [
      {
        id: "mv-ds-short-pm-jd1",
        label: "Day 1",
        date: DISPATCH_DEMO_DATE_SENTINEL,
        status: "scheduled",
        dayFraction: "short",
        dayPeriod: "afternoon",
        arrivalWindow: "11:00 AM – 4:00 PM (crew calls ≥30 min ahead)",
        durationLabel: "Short (½ day)",
        crewSize: 3,
        truckCount: 1,
        services: ["moving", "unloading"],
        hoursEstimated: 4,
      },
    ],
  },
  "mv-ds-brief-pm": {
    jobDays: [
      {
        id: "mv-ds-brief-pm-jd1",
        label: "Day 1",
        date: DISPATCH_DEMO_DATE_SENTINEL,
        status: "scheduled",
        dayFraction: "brief",
        dayPeriod: "afternoon",
        arrivalWindow: "11:00 AM – 4:00 PM (crew calls ≥30 min ahead)",
        durationLabel: "Brief (⅓ day)",
        crewSize: 2,
        truckCount: 1,
        services: ["moving"],
        hoursEstimated: 3,
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
    sentQuote: null,
    sentContract: null,
    quoteDiscount: (move as MoveRecord).quoteDiscount ?? null,
  } as MoveRecord);

  const rawDays =
    extra && "jobDays" in extra && (extra.jobDays?.length ?? 0) > 0
      ? extra.jobDays!
      : [createInitialJobDayFromIntake(base)];

  const withDemoDates = isDispatchDemoMoveId(move.id)
    ? rawDays.map((day) => ({
        ...day,
        date: resolveDispatchDemoDate(day.date),
      }))
    : rawDays;

  const jobDays = finalizeJobDays(base, withDemoDates);

  const withJobDays = {
    ...base,
    jobDays,
    preferredDate: isDispatchDemoMoveId(move.id)
      ? resolveDispatchDemoDate(base.preferredDate)
      : base.preferredDate,
  };
  const completed = {
    ...withJobDays,
    sentQuote: inferSentQuoteFromPipeline(withJobDays),
    sentContract: inferSentContractFromPipeline(withJobDays),
    ...(extra?.crewFeedback ? { crewFeedback: extra.crewFeedback } : {}),
  };
  return ensureMoveWorkspaceFields(completed, DEFAULT_COMPANY_ID, DEFAULT_PRIMARY_LOCATION_ID);
}
