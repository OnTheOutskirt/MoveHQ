import { toDateKey } from "@/lib/calendar/date-utils";
import type { CrewRecordsStore, DriverReview, SkipperRating } from "./crew-records-types";
import { computeDriverRating } from "./driver-violations";
import { computeSkipperRating } from "./skipper-violations";

function daysFromToday(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return toDateKey(d);
}

function normalizeCrewRecordsStore(store: {
  issues: CrewRecordsStore["issues"];
  skipperRatings: Omit<SkipperRating, "rating">[];
  driverReviews: Omit<DriverReview, "rating">[];
}): CrewRecordsStore {
  return {
    ...store,
    skipperRatings: store.skipperRatings.map((rating) => {
      const violations = rating.violations ?? [];
      return { ...rating, violations, rating: computeSkipperRating(violations) };
    }),
    driverReviews: store.driverReviews.map((review) => {
      const violations = review.violations ?? [];
      return { ...review, violations, rating: computeDriverRating(violations) };
    }),
  };
}

export function defaultCrewRecordsStore(): CrewRecordsStore {
  const now = new Date().toISOString();

  return normalizeCrewRecordsStore({
    issues: [
      {
        id: "issue-1",
        crewId: "crew-sam",
        kind: "violation",
        subject: "attendance",
        date: daysFromToday(-2),
        description: "Late to yard — 25 min. Crew lead notified at 6:40 AM.",
        messageSent: true,
        jobRef: "JM-1042",
        status: "open",
        reportedBy: "Dispatch",
        createdAt: now,
      },
      {
        id: "issue-2",
        crewId: "crew-devon",
        kind: "violation",
        subject: "seat_belt",
        date: daysFromToday(-5),
        description: "Hard braking event flagged by telematics on I-94 segment.",
        messageSent: true,
        status: "under_review",
        reportedBy: "Fleet safety",
        createdAt: now,
      },
      {
        id: "issue-3",
        crewId: "crew-chris",
        kind: "failure",
        subject: "customer_complaint",
        date: daysFromToday(-8),
        description: "Customer reported insufficient padding on dining room wrap.",
        messageSent: false,
        jobRef: "JM-1038",
        moveId: "move-1",
        status: "resolved",
        reportedBy: "Customer success",
        createdAt: now,
        resolvedAt: daysFromToday(-3),
        notes: "Coached on wrap protocol; no claim filed.",
      },
      {
        id: "issue-5",
        crewId: "crew-tyler",
        kind: "failure",
        subject: "customer_complaint",
        date: daysFromToday(-18),
        description: "Customer filed damage claim for scratched hardwood — photos on file.",
        messageSent: true,
        jobRef: "JM-1015",
        status: "under_review",
        reportedBy: "Claims",
        createdAt: now,
      },
      {
        id: "issue-6",
        crewId: "crew-pat",
        kind: "violation",
        subject: "attendance",
        date: daysFromToday(-1),
        description: "No call — arrived 40 min late to yard meet.",
        messageSent: false,
        status: "open",
        reportedBy: "Skipper",
        createdAt: now,
      },
      {
        id: "issue-7",
        crewId: "crew-james",
        kind: "mistake",
        subject: "uniforms",
        date: daysFromToday(-4),
        description: "Wore non-approved footwear on a corporate account job.",
        messageSent: true,
        status: "resolved",
        reportedBy: "Operations",
        createdAt: now,
        resolvedAt: daysFromToday(-2),
      },
      {
        id: "issue-alex-1",
        crewId: "crew-alex",
        kind: "mistake",
        subject: "work_rule",
        date: daysFromToday(-15),
        description: "Wardrobe box count not updated on load list before departure.",
        messageSent: true,
        jobRef: "JM-1042",
        status: "resolved",
        reportedBy: "Dispatch",
        createdAt: now,
        resolvedAt: daysFromToday(-12),
        notes: "Coached on load list sign-off.",
      },
    ],
    skipperRatings: [
      {
        id: "rate-alex-1",
        skipperId: "crew-alex",
        date: daysFromToday(-4),
        jobRef: "JM-1088",
        violations: [],
        ratedBy: "Dispatch",
        createdAt: now,
      },
      {
        id: "rate-alex-2",
        skipperId: "crew-alex",
        date: daysFromToday(-11),
        jobRef: "JM-1042",
        violations: ["no_truck_picture", "materials_not_put_away"],
        notes: "Close-out checklist missed on truck photo.",
        ratedBy: "Operations",
        createdAt: now,
      },
      {
        id: "rate-1",
        skipperId: "crew-marcus",
        date: daysFromToday(-3),
        jobRef: "JM-1042",
        violations: [],
        ratedBy: "Dispatch",
        createdAt: now,
      },
      {
        id: "rate-2",
        skipperId: "crew-tyler",
        date: daysFromToday(-6),
        jobRef: "JM-1035",
        violations: ["billing_inaccurate", "gas_receipts"],
        notes: "Paperwork slow at close.",
        ratedBy: "Operations",
        createdAt: now,
      },
      {
        id: "rate-3",
        skipperId: "crew-james",
        date: daysFromToday(-10),
        jobRef: "JM-1028",
        violations: [
          "addendum_not_submitted",
          "no_truck_picture",
          "trucks_not_fueled",
        ],
        notes: "Customer follow-up needed on arrival comms.",
        ratedBy: "Dispatch",
        createdAt: now,
      },
      {
        id: "rate-4",
        skipperId: "crew-marcus",
        date: daysFromToday(-14),
        jobRef: "JM-1020",
        violations: ["dirty_truck"],
        ratedBy: "Dispatch",
        createdAt: now,
      },
    ],
    driverReviews: [
      {
        id: "drv-jordan-1",
        driverId: "crew-jordan",
        date: daysFromToday(-7),
        jobRef: "JM-1060",
        violations: ["rolling_stop"],
        reviewedBy: "Fleet safety",
        createdAt: now,
      },
      {
        id: "drv-jordan-2",
        driverId: "crew-jordan",
        date: daysFromToday(-16),
        jobRef: "JM-1032",
        violations: [],
        reviewedBy: "Operations",
        createdAt: now,
      },
      {
        id: "drv-1",
        driverId: "crew-devon",
        date: daysFromToday(-5),
        jobRef: "JM-1040",
        violations: ["braking", "speeding"],
        reviewedBy: "Fleet safety",
        createdAt: now,
      },
      {
        id: "drv-2",
        driverId: "crew-devon",
        date: daysFromToday(-12),
        violations: ["phone", "rolling_stop", "no_spotter"],
        notes: "Telematics batch review.",
        reviewedBy: "Fleet safety",
        createdAt: now,
      },
      {
        id: "drv-3",
        driverId: "crew-pat",
        date: daysFromToday(-8),
        violations: ["cornering"],
        reviewedBy: "Operations",
        createdAt: now,
      },
      {
        id: "drv-4",
        driverId: "crew-pat",
        date: daysFromToday(-20),
        jobRef: "JM-1012",
        violations: [],
        reviewedBy: "Fleet safety",
        createdAt: now,
      },
    ],
  });
}
