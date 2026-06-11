import type { PlanningGroup } from "./types";

export const MEETING_5_28_DATE_LABEL = "5/28";

/** Checklist groups sourced from stakeholder meeting notes (5/28). */
export const MEETING_5_28_GROUPS: PlanningGroup[] = [
  {
    id: "meeting-sales-pipeline",
    title: "Sales & pipeline",
    audienceDescription: "Lead quality, pipeline stages, and follow-up workflows.",
    items: [
      {
        id: "meeting-qualified-vs-unqualified",
        label: "Qualified Moves vs Unqualified Moves",
        note: "Shipped — Mark lost dialog on move detail: pick Qualified vs Unqualified, then reason.",
      },
      {
        id: "meeting-unqualified-reasons",
        label:
          "Define unqualified lead reasons: couldn’t get ahold, good move but booked, out of service area, duplicate/spam, etc.",
        note: "Shipped — unqualified reason list in Mark lost flow; qualified reasons are separate.",
      },
      {
        id: "meeting-website-booked-stage",
        label: "Website Booked pipeline stage",
      },
      {
        id: "meeting-web-vs-office-source",
        label: "Add Web vs Office source tag",
        note: "Shipped — quoteChannel on moves (web AI / phone / office); leadChannel stays for marketing.",
      },
      {
        id: "meeting-website-booked-review",
        label: "Add Website Booked Job Review workflow/tab",
        note: "Shipped — Sales → Website queues + bookingReviewStatus on auto-booked moves.",
      },
      {
        id: "meeting-followup-quoted-booked",
        label: "Add follow-up workflows for Quoted and Booked jobs",
      },
    ],
  },
  {
    id: "meeting-move-details",
    title: "Move details & directory",
    items: [
      {
        id: "meeting-zillow-origin-link",
        label:
          "Move Detail View: “View on Zillow” link under origin address (search URL, new tab)",
        note: "Shipped — uses /homes/{address}_rb/ format from origin address.",
      },
      {
        id: "meeting-wardrobes-appliances-extras",
        label:
          "Move Detail View: rename/rework Wardrobes/Appliances section into Extras or place under Inventory",
        note: "Shipped — Inventory & extras section on Move Plan; appliances + wardrobe nested under Extras.",
      },
      {
        id: "meeting-directory-call-text",
        label: "Directory: add call/text actions directly from directory and link to contact details",
        note: "Shipped — Call/text on contacts table + detail sidebar; row opens contact; org contacts too.",
      },
    ],
  },
  {
    id: "meeting-operations",
    title: "Operations & dispatch",
    items: [
      {
        id: "meeting-abnormal-operations",
        label:
          "Operations: support abnormal operations like hotel jobs, purchase needs, extras, special logistics",
      },
      {
        id: "meeting-dispatch-crew-truck-changes",
        label: "Dispatch: operations can change crew sizes and trucks",
        note: "Shipped — per-job crew/truck steppers on dispatch cards and sidebar; overrides persist for the day.",
      },
      {
        id: "meeting-dispatch-change-cost-tracking",
        label: "Reporting: track when crew/truck changes save or cost money",
        note: "Shipped — Operations → Dispatch changes report with AI baseline vs override and $ impact.",
      },
      {
        id: "meeting-extras-third-party",
        label: "Extras: third-party services such as Shamrock",
      },
    ],
  },
  {
    id: "meeting-crew",
    title: "Crew",
    items: [
      { id: "meeting-crew-skipper-ratings", label: "Crew: skipper ratings" },
      { id: "meeting-crew-performance", label: "Crew: performance tracking" },
      { id: "meeting-crew-claims", label: "Crew: claims tracking" },
      { id: "meeting-crew-tardies", label: "Crew: tardies" },
      { id: "meeting-crew-driving-issues", label: "Crew: driving issues" },
      { id: "meeting-crew-on-job-issues", label: "Crew: on-the-job issues" },
      { id: "meeting-crew-reporting-v1", label: "Crew reporting for V1" },
      {
        id: "meeting-skipper-callback-issue",
        label:
          "Skipper Issues: add Callback issue type for avoidable service problems that are not claims",
      },
      {
        id: "meeting-crew-materials-labor",
        label: "Crew tracking: materials used and labor hours",
      },
      { id: "meeting-crew-app-improvements", label: "Crew App improvements" },
    ],
  },
  {
    id: "meeting-trucks",
    title: "Trucks & fleet",
    items: [
      {
        id: "meeting-truck-types",
        label: "Trucks: support 6-person cab, 3-person cab, F-150, 2-person, packing van/Sprinter, etc.",
      },
      {
        id: "meeting-truck-temporary",
        label: "Trucks: allow temporary truck such as U-Haul",
        note: "Shipped — Fleet → Rentals tab; calendar capacity and dispatch include rentals by date.",
      },
      {
        id: "meeting-samsara-research",
        label: "Research Samsara API for LYTX replacement/new system",
      },
    ],
  },
  {
    id: "meeting-reports",
    title: "Reports",
    items: [
      {
        id: "meeting-report-speed-to-lead",
        label: "Reports: Speed to Lead, AI vs person",
        note: "Shipped — Reports → Sales → Speed to lead.",
      },
      {
        id: "meeting-report-sales-revenue",
        label: "Reports: Sales revenue booked overall and per salesperson",
        note: "Shipped — Reports → Sales → Revenue booked.",
      },
      {
        id: "meeting-report-commission",
        label: "Reports: salesperson commission tracking",
        note: "Shipped — Reports → Sales → Commission.",
      },
      {
        id: "meeting-report-labor-hours",
        label: "Reports: movers labor hours per job",
        note: "Shipped — Reports → Operations → Labor hours.",
      },
      {
        id: "meeting-report-budget-actuals",
        label:
          "Reports: budget vs actuals for miles, labor, materials, flat rate, estimated margin, actual margin",
        note: "Shipped — Reports → Operations → Budget vs actuals.",
      },
      {
        id: "meeting-report-ai-quotes",
        label: "Reports: AI quote accuracy and variance vs booked",
        note: "Shipped — Reports → AI quotes tab.",
      },
    ],
  },
  {
    id: "meeting-quotes",
    title: "Quotes & change orders",
    items: [
      {
        id: "meeting-ai-charge-order",
        label: "AI quote system: add Charge Order workflow",
        note: "Shipped — Move detail → Quote & contract → Change orders → Charge order (AI).",
      },
      {
        id: "meeting-small-co-minor",
        label: "Small Change Orders: minor quote changes without full requote",
        note: "Shipped — Change orders → Small change order workflow.",
      },
      {
        id: "meeting-small-co-inventory",
        label:
          "Small Change Orders: handle small inventory/labor changes with no new truck/day",
        note: "Shipped — Change orders → Small CO inventory/labor (same trucks & days).",
      },
      {
        id: "meeting-full-requote",
        label:
          "Full Requote Workflow: regenerate quote entirely for packing, storage, large additions, or major scope changes",
        note: "Shipped — Change orders → Full requote workflow.",
      },
      {
        id: "meeting-crew-app-change-order",
        label: "Crew App: allow minor requote/change order from the field",
      },
    ],
  },
  {
    id: "meeting-platform",
    title: "Platform, payroll & tech stack",
    items: [
      {
        id: "meeting-payroll-time-tracking",
        label: "Add Payroll and Time Tracking planning items",
      },
      {
        id: "meeting-github-org",
        label: "Create GitHub repo/organization structure",
        note: "Shipped — github.com/OnTheOutskirt/MoveHQ (5/28).",
      },
      {
        id: "meeting-liveswitch-v1-stack",
        label: "Add LiveSwitch to V1 tech stack planning + integration scope",
        note: "Added to V1 tech stack on Overall Plan.",
      },
      {
        id: "meeting-rippling-v2-stack",
        label: "Add Rippling to V2 tech stack planning",
        note: "Added to V2 tech stack on Overall Plan.",
      },
      {
        id: "meeting-google-maps-v1-stack",
        label: "Add Google Maps Platform to V1 tech stack (Maps, Directions, Geocoding, Places)",
        note: "Added to V1 tech stack; route embeds already use Maps in the app.",
      },
    ],
  },
];

/** Items treated as done until explicitly unchecked (5/28 shipped work). */
export const MEETING_5_28_DEFAULT_DONE_IDS = [
  "meeting-zillow-origin-link",
  "meeting-liveswitch-v1-stack",
  "meeting-rippling-v2-stack",
  "meeting-google-maps-v1-stack",
  "meeting-github-org",
  "meeting-web-vs-office-source",
  "meeting-website-booked-review",
  "meeting-qualified-vs-unqualified",
  "meeting-unqualified-reasons",
  "meeting-wardrobes-appliances-extras",
  "meeting-directory-call-text",
  "meeting-dispatch-crew-truck-changes",
  "meeting-dispatch-change-cost-tracking",
  "meeting-report-speed-to-lead",
  "meeting-report-sales-revenue",
  "meeting-report-commission",
  "meeting-report-labor-hours",
  "meeting-report-budget-actuals",
  "meeting-report-ai-quotes",
  "meeting-ai-charge-order",
  "meeting-small-co-minor",
  "meeting-small-co-inventory",
  "meeting-full-requote",
] as const;
