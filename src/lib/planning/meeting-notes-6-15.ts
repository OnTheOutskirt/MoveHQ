import type { PlanningGroup } from "./types";

export const MEETING_6_15_DATE_LABEL = "6/15";

/** Checklist groups from JM meeting 6/15. */
export const MEETING_6_15_GROUPS: PlanningGroup[] = [
  {
    id: "meeting-615-report",
    title: "Report & UI",
    audienceDescription: "Tester report pop-up and layout issues.",
    items: [
      {
        id: "meeting-615-report-popup-behind-banner",
        label: "Report pop-up screen — behind banner (in a move)",
        note: "Amber Report menu is obscured or clipped behind the move detail banner/chrome.",
      },
    ],
  },
  {
    id: "meeting-615-referrals",
    title: "Referrals",
    audienceDescription: "Moving-company referral partners and commission structure.",
    items: [
      {
        id: "meeting-615-referrals-moving-companies",
        label: "Moving company referrals — 10% (A Better Tripp / Frontier)",
        note: "Add moving-company referral partners with 10% commission; examples: A Better Tripp, Frontier.",
      },
    ],
  },
  {
    id: "meeting-615-setup",
    title: "Setup — rates & catalogs",
    audienceDescription: "Admin pricing configuration.",
    items: [
      {
        id: "meeting-615-setup-min-hours-zero",
        label: "Rate min hours — allow 0",
        note: "Bug: can't delete the number down to 0. Minimum hours field should accept and save 0.",
      },
    ],
  },
  {
    id: "meeting-615-dispatch",
    title: "Dispatch",
    audienceDescription: "Scheduling crew who are marked off or on time off.",
    items: [
      {
        id: "meeting-615-dispatch-schedule-off-guys",
        label: "Schedule off guys — assign anyway",
        note:
          "Be able to schedule someone who is off. For time off: warn that scheduling will cancel their day off. For regular off days: scheduling doesn't change the whole off schedule — offer Assign anyway.",
      },
    ],
  },
  {
    id: "meeting-615-move-detail",
    title: "Move detail",
    audienceDescription: "Job day stops, pickup/dropoff, and floor/story details.",
    items: [
      {
        id: "meeting-615-move-detail-job-day-stops",
        label: "Add job day — stops without address dropdown",
        note:
          "Add a Stop flow: remove unnecessary “Type a New Address” dropdown. Capture picking up, dropping off, or both; story / what's on first or second floor.",
      },
    ],
  },
  {
    id: "meeting-615-inbox",
    title: "Inbox",
    audienceDescription: "Thread state and follow-up markers.",
    items: [
      {
        id: "meeting-615-inbox-mark-unread",
        label: "Mark as unread",
      },
      {
        id: "meeting-615-inbox-waiting-response",
        label: "Mark waiting response",
      },
    ],
  },
  {
    id: "meeting-615-calendar",
    title: "Calendar & holidays",
    audienceDescription: "Holiday settings and ops calendar.",
    items: [
      {
        id: "meeting-615-calendar-holidays-delete",
        label: "Holidays on calendar — can't delete holiday",
        note: "Ops this day on Holiday Setting; fix ability to delete a holiday once added.",
      },
    ],
  },
  {
    id: "meeting-615-jobs",
    title: "Jobs",
    audienceDescription: "Confirmation call actions from the job sidebar.",
    items: [
      {
        id: "meeting-615-jobs-confirmation-call-sms",
        label: "Call / SMS on confirmation call box",
        note: "Add call and SMS actions directly on the confirmation call section in Jobs.",
      },
    ],
  },
  {
    id: "meeting-615-walkthroughs",
    title: "Walkthroughs",
    audienceDescription: "Sales rep availability for booking walkthroughs.",
    items: [
      {
        id: "meeting-615-walkthroughs-per-sales-person",
        label: "Availability per sales person",
        note: "Walkthrough availability should be per sales person if it isn't already.",
      },
    ],
  },
  {
    id: "meeting-615-integrations",
    title: "Integrations",
    audienceDescription: "LiveSwitch checkout and calendar invites.",
    items: [
      {
        id: "meeting-615-liveswitch-calendar-invite",
        label: "Checkout LiveSwitch API — calendar invite",
        note: "Send calendar invite via LiveSwitch or Outlook when checking out / booking walkthrough.",
      },
    ],
  },
  {
    id: "meeting-615-ecal",
    title: "E-cal",
    audienceDescription: "Move calendar sync and pipeline states.",
    items: [
      {
        id: "meeting-615-ecal-remove-booked-holding",
        label: "Remove from E-cal — Booked, Holding, Maybe, Quote sent",
        note:
          "Booked should not appear on Move Calendar. Follow up for this person when appropriate.",
      },
    ],
  },
  {
    id: "meeting-615-vendors",
    title: "Move vendors",
    audienceDescription: "Vendor selection on moves tied to directory organizations.",
    items: [
      {
        id: "meeting-615-move-vendor-by-type",
        label: "Select vendor by type from organization list",
        note:
          "Move vendor picker should filter by vendor type and pull from the real vendor list (organizations, not people).",
      },
    ],
  },
];

export const MEETING_6_15_DEFAULT_DONE_IDS = [] as const;
