import type { PlanningGroup } from "./types";

export const MEETING_6_8_DATE_LABEL = "6/8";

/** Checklist groups from JM meeting 6/8. */
export const MEETING_6_8_GROUPS: PlanningGroup[] = [
  {
    id: "meeting-608-move-detail",
    title: "Move detail",
    audienceDescription: "Move record layout, quick actions, scope, and secondary tabs.",
    items: [
      {
        id: "meeting-608-finalize-move-detail",
        label: "Finalize the move detail view",
        note:
          "Finish the layout: collapse “View all” into quick actions, tighten move scope section, and polish the other tabs.",
      },
    ],
  },
  {
    id: "meeting-608-sales",
    title: "Sales & pipeline",
    audienceDescription: "Lead quality, pipeline stages, and booking metrics.",
    items: [
      {
        id: "meeting-608-qualified-leads-pipeline",
        label: "Qualified leads on Sales pipeline",
        note: "Pipeline and lists should center on qualified leads — not all raw leads.",
      },
      {
        id: "meeting-608-booking-rate-qualified",
        label: "Booking rate based on qualified leads",
        note: "Booking % and calendar metrics should use qualified-lead denominator, not total leads.",
      },
    ],
  },
  {
    id: "meeting-608-schedule",
    title: "Schedule",
    audienceDescription: "Move Calendar and scheduling workflows.",
    items: [
      {
        id: "meeting-608-rework-schedule-ui",
        label: "Rework UI for Schedule page",
        note: "Refresh layout, filters, and day/sidebar patterns on the main Schedule (Move Calendar) page.",
      },
    ],
  },
  {
    id: "meeting-608-dispatch",
    title: "Dispatch",
    audienceDescription: "Day-of dispatch clarity, FTAs, and crew slot UX.",
    items: [
      {
        id: "meeting-608-dispatch-ftas",
        label: "FTAs on Dispatch",
        note: "Surface first-time appointments / FTA context on the dispatch board.",
      },
      {
        id: "meeting-608-dispatch-reduce-noise",
        label: "Dispatch: reduce noise",
        note: "Simplify the dispatch UI — less clutter, clearer priorities for ops.",
      },
      {
        id: "meeting-608-dispatch-visual-calendar",
        label: "Visual calendar view for Dispatch",
        note: "Calendar-style dispatch view alongside (or instead of) the current list/board layout.",
      },
      {
        id: "meeting-608-dispatch-skipper-driver",
        label: "Skipper/Driver combined slot (S/D)",
        note: "When one person fills both roles: combined S/D on the skipper slot; toggle back to separate S + D.",
      },
    ],
  },
  {
    id: "meeting-608-claims",
    title: "Claims",
    audienceDescription: "Claims workflow, vendors, and client communication.",
    items: [
      {
        id: "meeting-608-claims-nail-it",
        label: "Claims: important to nail",
        note: "High-priority area — get the end-to-end claims experience right.",
      },
      {
        id: "meeting-608-claims-todo-list",
        label: "To-do list for Claims",
        note: "Step-by-step checklist inside a claim so nothing is missed.",
      },
      {
        id: "meeting-608-claims-vendors",
        label: "Pull in vendors (MoveBees, AHM, etc.)",
        note: "Integrate or link third-party claim vendors from the claim record.",
      },
      {
        id: "meeting-608-claims-prepopulated",
        label: "Prepopulated claim fields & templates",
        note: "Auto-fill client, move, and damage details when opening a new claim.",
      },
      {
        id: "meeting-608-claims-step1-ack",
        label: "Step 1: Send acknowledgement to client",
        note: "First workflow step — templated acknowledgement email/SMS to the customer.",
      },
      {
        id: "meeting-608-claims-step2-vendor",
        label: "Step 2: Send to vendor",
        note: "Second step — package and send claim details to the selected vendor.",
      },
      {
        id: "meeting-608-claims-waiting-hearback",
        label: "Waiting to hear back (vendor status)",
        note: "Track claims in a waiting-on-vendor state until response arrives.",
      },
      {
        id: "meeting-608-claims-pipeline",
        label: "Pipeline for Claims?",
        note: "Decide whether claims need a kanban/pipeline view like sales — scope TBD.",
      },
    ],
  },
  {
    id: "meeting-608-reporting",
    title: "Reporting",
    audienceDescription: "Ops, sales, and leadership reporting — scope and priorities TBD.",
    items: [
      {
        id: "meeting-608-reporting-figure-out",
        label: "Reporting — figure out",
        note: "Define what reports MoveHQ needs first (audience, metrics, cadence) before building dashboards.",
      },
    ],
  },
  {
    id: "meeting-608-jobs-actuals",
    title: "Jobs & actuals",
    audienceDescription: "Post-job edits and estimated-vs-actual tracking for labor, materials, and AI flat rate.",
    items: [
      {
        id: "meeting-608-edit-job-information",
        label: "Edit job information after the job",
        note:
          "Ops can correct what actually happened: planned vs sent crew (e.g. 4 movers planned, 3 sent), labor hours, and materials used.",
      },
      {
        id: "meeting-608-estimated-vs-actuals",
        label: "Estimated vs actuals (super important)",
        note: "Side-by-side planned vs actual for crew, labor hours, materials, and job cost — core ops reporting input.",
      },
      {
        id: "meeting-608-ai-flat-rate-output-vs-actual",
        label: "AI flat rate tool: output vs actual",
        note: "Compare AI flat-rate quote output to actual job results (crew, hours, materials) to tune pricing and prompts.",
      },
      {
        id: "meeting-608-jobs-sidebar-job-info",
        label: "Add Job Info to Jobs sidebar tab",
        note: "Operations → Jobs: dedicated sidebar tab with job details (crew, hours, materials, est. vs actual) when a job is selected.",
      },
    ],
  },
  {
    id: "meeting-608-platform",
    title: "Platform & roadmap",
    audienceDescription: "Cross-cutting product work called out for upcoming sprints.",
    items: [
      {
        id: "meeting-608-follow-ups",
        label: "Work on follow-ups",
        note: "Quoted/booked and other post-quote follow-up workflows.",
      },
      {
        id: "meeting-608-notifications",
        label: "Work on notifications",
        note: "In-app, email, SMS, and push notification coverage across roles.",
      },
      {
        id: "meeting-608-multi-location",
        label: "Work on multi-location",
        note: "Location switching, scoped data, and per-location settings across the app.",
      },
      {
        id: "meeting-608-rework-inventory",
        label: "Rework inventory",
        note: "Inventory UX, AI analysis, and move-detail inventory flows need a refresh.",
      },
    ],
  },
];

export const MEETING_6_8_DEFAULT_DONE_IDS = [
  "meeting-608-claims-nail-it",
  "meeting-608-claims-todo-list",
  "meeting-608-claims-vendors",
  "meeting-608-claims-prepopulated",
  "meeting-608-claims-step1-ack",
  "meeting-608-claims-step2-vendor",
  "meeting-608-claims-waiting-hearback",
  "meeting-608-claims-pipeline",
  "meeting-608-notifications",
  "meeting-608-rework-inventory",
] as const;
