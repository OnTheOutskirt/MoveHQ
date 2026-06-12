import type { PlanningGroup } from "./types";

export const MEETING_6_12_DATE_LABEL = "6/12";

/** Checklist groups from JM meeting 6/12. */
export const MEETING_6_12_GROUPS: PlanningGroup[] = [
  {
    id: "meeting-612-schedule",
    title: "Schedule",
    audienceDescription: "Move Calendar and scheduling workflows.",
    items: [
      {
        id: "meeting-612-schedule-uncheck-awaiting-response",
        label: "Uncheck Awaiting Response",
        note: "Remove or uncheck the Awaiting Response filter/state on Schedule as discussed.",
      },
    ],
  },
  {
    id: "meeting-612-followups",
    title: "Follow-ups",
    audienceDescription: "Automated and manual follow-up workflows.",
    items: [
      {
        id: "meeting-612-followups-cancel-automated",
        label: "Cancel Automated Follow-Ups",
        note: "Turn off or remove automated follow-up sequences per this meeting decision.",
      },
    ],
  },
  {
    id: "meeting-612-referral-partners",
    title: "Referral partners",
    audienceDescription: "Directory and partner types for inbound referrals.",
    items: [
      {
        id: "meeting-612-referral-apt-complex",
        label: "Apartment complex referral partners",
      },
      {
        id: "meeting-612-referral-storage-facility",
        label: "Storage facility referral partners",
      },
      {
        id: "meeting-612-referral-restoration",
        label: "Restoration referral partners",
      },
    ],
  },
  {
    id: "meeting-612-jobs",
    title: "Jobs",
    audienceDescription: "Operations prep, special needs, and day-of job tasks.",
    items: [
      {
        id: "meeting-612-jobs-ops-prep-form",
        label: "Ops Prep — add form",
        note:
          "Special Needs → Schedule an Activity flow; Ops Prep button entry point from Jobs.",
      },
      {
        id: "meeting-612-jobs-get-bubble-wrap",
        label: "Get bubble wrap",
      },
      {
        id: "meeting-612-jobs-rent-extra-truck",
        label: "Rent extra truck",
      },
    ],
  },
  {
    id: "meeting-612-claims",
    title: "Claims",
    audienceDescription: "Vendor outreach, quote requests, and claim workflow steps.",
    items: [
      {
        id: "meeting-612-claims-choose-vendor",
        label: "Choose vendor",
      },
      {
        id: "meeting-612-claims-choose-sms-email",
        label: "Choose SMS / email",
      },
      {
        id: "meeting-612-claims-send-quote-requests",
        label: "Send quote requests to vendors",
      },
      {
        id: "meeting-612-claims-waiting-hearback",
        label: "Waiting for them to get back to me",
        note: "Track claims in a waiting-on-vendor state until response arrives.",
      },
      {
        id: "meeting-612-claims-vendor-got-back",
        label: "They got back to me",
        note: "Next step when vendor responds — update status and continue the claim workflow.",
      },
      {
        id: "meeting-612-claims-vendor-categories",
        label: "Vendor categories",
        note:
          "Truck fleet, claim repairs, operations/materials, special services (crating, playgrounds, pool table, crating person, special-order packing materials).",
      },
      {
        id: "meeting-612-claims-hr-vendors",
        label: "HR vendors (benefits, chaplain, etc.)",
      },
      {
        id: "meeting-612-claims-crew-fleet-vendors",
        label: "Crew & fleet vendors",
        note:
          "Rental trucks, repair fleet, lift gate, and similar ops vendors — each with SMS/email templates.",
      },
      {
        id: "meeting-612-claims-vendor-templates",
        label: "Vendor templates (SMS / email)",
        note: "Each vendor category/type should have reusable SMS and email templates.",
      },
    ],
  },
  {
    id: "meeting-612-pipelines-fields",
    title: "Pipelines & fields",
    audienceDescription: "Admin configuration for referral and vendor types.",
    items: [
      {
        id: "meeting-612-pipelines-referral-types",
        label: "Add / remove referral types",
      },
      {
        id: "meeting-612-pipelines-vendor-types",
        label: "Add / remove vendor types",
      },
    ],
  },
  {
    id: "meeting-612-walkthroughs",
    title: "Walkthroughs",
    audienceDescription: "On-site walkthrough notes, room flow, and AI quote support.",
    items: [
      {
        id: "meeting-612-walkthroughs-take-notes",
        label: "Take notes",
      },
      {
        id: "meeting-612-walkthroughs-areas-packing",
        label: "Areas packing",
      },
      {
        id: "meeting-612-walkthroughs-room-by-room",
        label: "Room-by-room flow",
        note:
          "Take pictures per room, navigate to that room in the app — AI can generate a quote from room data.",
      },
      {
        id: "meeting-612-walkthroughs-select-next-room",
        label: "Select next room",
      },
    ],
  },
  {
    id: "meeting-612-jonah-notes",
    title: "Jonah notes",
    audienceDescription: "Geo-fence and crew-on-the-way client communication.",
    items: [
      {
        id: "meeting-612-jonah-geo-fence",
        label: "Geo-fence — crew is on the way",
        note:
          "Start heading to house triggers “crew is on the way”; check location, create a link, send a text to the client.",
      },
    ],
  },
  {
    id: "meeting-612-fmcsa",
    title: "FMCSA rules",
    audienceDescription: "Driver/skipper checks and pricing guardrails.",
    items: [
      {
        id: "meeting-612-fmcsa-v1-not-to-exceed",
        label: "V1 — Not to exceed",
      },
      {
        id: "meeting-612-fmcsa-post-check-skippers",
        label: "Post-check for skippers",
        note: "Trucks clean, pads folded.",
      },
      {
        id: "meeting-612-fmcsa-v2-ballpark-hourly",
        label: "V2 — Ballpark on hourly + not to exceed",
      },
      {
        id: "meeting-612-fmcsa-v2-pre-check-drivers",
        label: "V2 — Pre-check for drivers (custom)",
        note: "Custom checklist: tires, oil, brakes, and other driver-specific items.",
      },
    ],
  },
  {
    id: "meeting-612-referral-automations",
    title: "Referral automations",
    audienceDescription: "Partner thank-you and day-of-move notifications — automate vs manual follow-up.",
    items: [
      {
        id: "meeting-612-referral-auto-inbound",
        label: "Auto text/email when referral comes in",
        note: "Every time a referral arrives, notify the referral partner automatically.",
      },
      {
        id: "meeting-612-referral-day-of-move",
        label: "Day-of-move partner notification",
        note:
          "“Hey, wanted to let you know we are moving [person] today…” — consider timing and channel.",
      },
      {
        id: "meeting-612-referral-consider-manual",
        label: "Consider manual follow-up item instead",
        note: "Maybe not fully automated — surface as a follow-up task the user can send or dismiss.",
      },
      {
        id: "meeting-612-referral-history-send-dismiss",
        label: "History — send or dismiss",
        note: "See past referral notifications; choose to send or dismiss each suggested follow-up.",
      },
      {
        id: "meeting-612-referral-ai-context",
        label: "AI context for referral follow-ups",
        note:
          "AI reviews client CRM info, moves referred, and past emails sent before suggesting outreach.",
      },
    ],
  },
];

export const MEETING_6_12_DEFAULT_DONE_IDS = [
  "meeting-612-schedule-uncheck-awaiting-response",
  "meeting-612-followups-cancel-automated",
  "meeting-612-pipelines-referral-types",
  "meeting-612-pipelines-vendor-types",
] as const;
